import test from 'node:test';
import assert from 'node:assert/strict';
import { montarProva, podeFazerProva, acertou, resultadoDaProva, normalizeProvas, MINIMO_DE_AULAS, SEGUNDOS_POR_QUESTAO } from '../src/exam.js';
import { initialState, normalizeState, xpTotal, localDate } from '../src/progress.js';
import { lessons } from '../src/curriculum.js';

const feitas = quantas => ({ ...initialState(), completed: lessons.slice(0, quantas).map(lesson => lesson.id) });

// O objetivo é fluência de prova: escrever sem consultar. A prova só pode cobrar o que foi
// estudado — cobrar o resto não mede recall, mede sorte.
test('the exam only ever draws from lessons the student actually finished', () => {
  const estado = feitas(6);
  const prova = montarProva(estado, 5, () => 0.5);
  assert.equal(prova.length, 5);
  for (const questao of prova) assert.ok(estado.completed.includes(questao.id), `${questao.id} não foi estudada`);
  assert.equal(new Set(prova.map(q => q.id)).size, 5, 'sem repetir questão');
  // Com menos aulas do que questões pedidas, a prova encolhe em vez de inventar.
  assert.equal(montarProva(feitas(3), 5, () => 0).length, 3);
});
test('the exam stays locked until there is something real to ask', () => {
  assert.equal(podeFazerProva(feitas(MINIMO_DE_AULAS - 1)), false);
  assert.equal(podeFazerProva(feitas(MINIMO_DE_AULAS)), true);
  assert.equal(podeFazerProva(initialState()), false);
  assert.equal(podeFazerProva(null), false);
});
test('each question carries what the student needs and nothing that helps too much', () => {
  const [questao] = montarProva(feitas(4), 1, () => 0);
  for (const campo of ['id', 'titulo', 'desafio', 'esperado']) assert.ok(questao[campo], `faltou ${campo}`);
  // Nada de código inicial, dica ou solução: é isso que separa a prova da aula.
  for (const proibido of ['starter', 'hint', 'solution', 'puzzle', 'example']) {
    assert.equal(questao[proibido], undefined, `a prova não pode entregar ${proibido}`);
  }
});
test('an answer counts only when the output matches, ignoring stray spaces', () => {
  assert.equal(acertou('42\n', '42'), true);
  assert.equal(acertou('  42  ', '42'), true);
  assert.equal(acertou('42', '43'), false);
  assert.equal(acertou('', '42'), false);
  assert.equal(acertou(undefined, '42'), false);
});
test('the result counts the misses and remembers which lessons to review', () => {
  const questoes = montarProva(feitas(4), 3, () => 0);
  const respostas = { [questoes[0].id]: true, [questoes[2].id]: false };
  const resultado = resultadoDaProva(questoes, respostas, 200);
  assert.equal(resultado.total, 3);
  assert.equal(resultado.acertos, 1, 'questão não respondida conta como errada');
  assert.deepEqual(resultado.falhas, [questoes[1].id, questoes[2].id]);
  assert.equal(resultado.dentroDoTempo, true);
  assert.equal(resultadoDaProva(questoes, respostas, 3 * SEGUNDOS_POR_QUESTAO + 1).dentroDoTempo, false);
});
test('exam records survive a backup without ever granting XP', () => {
  const prova = { data: localDate(), total: 5, acertos: 5, segundos: 300, falhas: [] };
  const restaurado = normalizeState({ ...initialState(), provas: [prova] });
  assert.equal(restaurado.provas.length, 1);
  assert.equal(xpTotal(restaurado), 0, 'a prova mede o que já foi aprendido; não concede XP');
  // Registro malformado ou com aula inexistente é descartado, como todo o resto do estado.
  assert.deepEqual(normalizeProvas({ provas: [{ data: 'ontem', total: 5 }] }), []);
  assert.deepEqual(normalizeProvas({ provas: [{ ...prova, falhas: ['inventada'] }] })[0].falhas, []);
  assert.equal(normalizeProvas({ provas: [{ ...prova, acertos: 99 }] })[0].acertos, 5, 'acertos não passam do total');
});
test('the exam counts as activity for the streak', () => {
  const dia = localDate();
  const restaurado = normalizeState({ ...initialState(), activities: { [dia]: ['prova', 'inventado'] } });
  assert.deepEqual(restaurado.activities[dia], ['prova']);
});
