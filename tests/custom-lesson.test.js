import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCustomLesson, customLessonPrompt, untaughtCallables, callablesIn, taughtTextUpTo } from '../src/custom-lesson.js';
import { patterns } from '../src/diagnosis.js';
import { normalizeState, initialState, xpTotal } from '../src/progress.js';

const valid = {
  titulo: 'Onde o range para',
  explicacao: ['O range para antes do segundo número.'],
  exemplo: 'for n in range(1, 4):\n    print(n)',
  entradasExemplo: [], saidaExemplo: '1\n2\n3',
  desafio: 'Mostre os números de 1 até 5, um por linha.',
  solucao: 'for n in range(1, 6):\n    print(n)',
  entradasDesafio: [], saidaDesafio: '1\n2\n3\n4\n5'
};

test('a lesson missing any piece is refused instead of shown half-written', () => {
  for (const field of ['titulo', 'exemplo', 'saidaExemplo', 'desafio', 'solucao', 'saidaDesafio']) {
    assert.throws(() => parseCustomLesson(JSON.stringify({ ...valid, [field]: '' })), new RegExp(field), `faltando ${field}`);
  }
  assert.throws(() => parseCustomLesson(JSON.stringify({ ...valid, explicacao: [] })), /sem explicação/);
  assert.throws(() => parseCustomLesson('desculpe, não consegui'), /formato esperado/);
});
test('a lesson that calls input() must declare the answers, or it could never be verified', () => {
  const asks = { ...valid, exemplo: "nome = input('Nome: ')\nprint(nome)", saidaExemplo: 'Nome: Ana' };
  assert.throws(() => parseCustomLesson(JSON.stringify(asks)), /sem dizer quais respostas/);
  const declared = parseCustomLesson(JSON.stringify({ ...asks, entradasExemplo: ['Ana'] }));
  assert.deepEqual(declared.entradasExemplo, ['Ana']);
  // Duas perguntas e uma resposta só continuam travando o programa.
  const two = { ...asks, exemplo: "a = input('a: ')\nb = input('b: ')\nprint(a + b)", entradasExemplo: ['x'] };
  assert.throws(() => parseCustomLesson(JSON.stringify(two)), /sem dizer quais respostas/);
});
// O editor do desafio começa vazio: "corrija o código abaixo" manda o estudante procurar
// algo que não está na tela. Já aconteceu, e é o tipo de confusão que trava quem começa.
test('a challenge may not point at code that is not on the screen', () => {
  for (const desafio of ['Corrija o erro de digitação no código abaixo.', 'Use o programa acima e mude o nome.', 'Complete o código a seguir com o print.']) {
    assert.throws(() => parseCustomLesson(JSON.stringify({ ...valid, desafio })), /não existe na tela/, desafio);
  }
  assert.ok(parseCustomLesson(JSON.stringify(valid)).desafio.length > 0, 'um enunciado autossuficiente passa');
});
test('the vocabulary gate blocks a lesson built on something not taught yet', () => {
  const taught = taughtTextUpTo('variaveis');
  assert.deepEqual(untaughtCallables('print(nome)', taught), []);
  assert.deepEqual(untaughtCallables("preco = float(input('Preço: '))", taught), ['float', 'input']);
  // Depois da aula de entrada, os mesmos nomes passam a ser permitidos.
  assert.deepEqual(untaughtCallables("preco = float(input('Preço: '))", taughtTextUpTo('tipos')).includes('float'), false);
});
// print é tratado como palavra da linguagem em toda a plataforma, como if ou for.
test('callablesIn ignores what the code defines itself and what lives inside strings', () => {
  assert.deepEqual(callablesIn('def dobro(n):\n    return n * 2\n\nprint(dobro(4))'), []);
  assert.deepEqual(callablesIn('total = sum(numeros)'), ['sum']);
  assert.deepEqual(callablesIn('print("chame sorted(x) depois")'), [], 'código dentro de texto não é chamada');
  assert.deepEqual(callablesIn('# usar len(a)\nprint(1)'), [], 'comentário não é chamada');
});
test('the prompt anchors the model to this exact mistake, with the broken program as evidence', () => {
  const weakness = patterns.find(pattern => pattern.id === 'nome-diferente');
  const { system, user } = customLessonPrompt({ weakness, evidence: 'liguagem = "Python"', taughtTitles: ['Olá, mundo!', 'Variáveis: dando nome às coisas'] });
  assert.ok(user.includes(weakness.summary), 'o resumo do engano precisa chegar ao modelo');
  assert.ok(user.includes(weakness.levels.find(level => level.kind === 'fix').broken), 'o programa quebrado é a melhor âncora do tema');
  assert.ok(user.includes('liguagem = "Python"'), 'a linha real do estudante entra quando existe');
  assert.ok(system.includes('Variáveis: dando nome às coisas') && !system.includes('Compreensões'));
});
test('a restored backup keeps a lesson readable and still worth no XP', () => {
  const id = patterns[0].id;
  const restored = normalizeState({ ...initialState(), customLessons: { [id]: { ...valid, criadaEm: '2026-09-11' } } });
  assert.equal(restored.customLessons[id].titulo, valid.titulo);
  assert.equal(restored.customLessons[id].criadaEm, '2026-09-11');
  assert.equal(xpTotal(restored), 0, 'lição do Lumi nunca vale XP');
  // Lição de um padrão que não existe, ou sem as partes essenciais, é descartada.
  assert.deepEqual(normalizeState({ ...initialState(), customLessons: { inventado: valid } }).customLessons, {});
  assert.deepEqual(normalizeState({ ...initialState(), customLessons: { [id]: { titulo: 'só isso' } } }).customLessons, {});
});
test('solving a Lumi lesson counts as activity for the streak and survives a backup', () => {
  const id = patterns[0].id;
  const day = '2026-09-11';
  const restored = normalizeState({ ...initialState(), joined: day, activities: { [day]: [`lumi:${id}`, 'lumi:inventado'] } });
  assert.deepEqual(restored.activities[day], [`lumi:${id}`], 'só padrões reais contam');
});
