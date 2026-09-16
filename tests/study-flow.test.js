import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { practiceProjects, practiceDone, normalizeLearning, predictionMatches } from '../src/practice-content.js';
import { initialState, normalizeState, recordPractice, xpTotal } from '../src/progress.js';
import { mergeProgress } from '../src/merge-progress.js';
import { canReviewPractice, practicePosition } from '../src/practice-flow.js';
import { requisitosFaltando } from '../src/requisitos.js';
import { stepsFor } from '../src/project-steps.js';

test('a conferência final precisa das duas execuções; abrir uma aba não prova conclusão', () => {
  assert.equal(canReviewPractice({ position: 'review' }), false);
  assert.equal(canReviewPractice({ passed: ['create'] }), false);
  assert.equal(canReviewPractice({ passed: ['modify', 'create'] }), true);
  assert.equal(practicePosition({ position: 'review', passed: [] }), 'create');
  assert.equal(practicePosition({ position: 'modify' }), 'modify');
});

test('revisar código concluído preserva XP, backup e junção sem premiar uma tentativa errada', () => {
  const p = practiceProjects[0];
  const won = recordPractice({ ...initialState(), learning: { [p.id]: { answered: p.investigate.answer, passed: ['modify', 'create'] } } }, p.id);
  const editing = { ...won, learning: { [p.id]: { ...won.learning[p.id], passed: [], answered: null, position: 'create' } } };
  assert.equal(xpTotal(editing), 40);
  assert.equal(practiceDone(editing.learning[p.id], p), true);
  assert.equal(canReviewPractice(editing.learning[p.id]), false);
  assert.equal(xpTotal(normalizeState(editing)), 40);
  assert.equal(xpTotal(mergeProgress(editing, initialState())), 40);
  assert.equal(recordPractice(editing, p.id, '2026-09-15'), editing);
  assert.equal(normalizeLearning({ [p.id]: { passed: ['create'] } })[p.id].earned, false);
  assert.equal(normalizeLearning({ [p.id]: { earned: true } })[p.id].earned, false, 'um booleano sozinho não é evidência de conclusão');
});

test('a previsão compara números inteiros e a ordem das linhas, sem aceitar pedaços', () => {
  assert.equal(predictionMatches('Acho que mostra 312', '12'), false);
  assert.equal(predictionMatches('vai mostrar -12', '12'), false);
  assert.equal(predictionMatches('2\n1', '1\n2'), false);
  assert.equal(predictionMatches('12', '12\n12'), false);
  assert.equal(predictionMatches('acho que mostra 12 e depois 13', '12\n13'), true);
});

test('a etiqueta exige conversão também quando alguém imprime o número sem aspas', () => {
  const p = practiceProjects.find(p => p.id === 'etiqueta');
  assert.ok(requisitosFaltando(p, 'print(30)').some(r => r.id === 'chama-int'));
  assert.deepEqual(requisitosFaltando(p, 'entrada = "30"\nconvertido = int(entrada)\nprint(convertido)'), []);
});

// O estudante registrou passos de projeto e o dia não contou nada: register() gravava só em
// projectStepsDone. Agora grava a atividade — e o normalizador precisa deixá-la passar, ou o
// primeiro backup restaurado apaga o dia de estudo de novo.
test('um passo de projeto registrado conta como atividade do dia e sobrevive ao backup', () => {
  const passo = stepsFor('calculadora')[0];
  const id = `passo:calculadora:${passo.id}`;
  const dia = '2026-09-14';
  const estado = { ...initialState(), activities: { [dia]: ['entrada', id] } };
  assert.deepEqual(normalizeState(estado).activities[dia], ['entrada', id]);
  assert.deepEqual(normalizeState({ ...estado, activities: { [dia]: ['passo:calculadora:inventado'] } }).activities[dia], []);
});

test('backup antigo recupera passo concluído na data dos outros passos do projeto', () => {
  const [primeiro, segundo] = stepsFor('calculadora');
  const dia = '2026-09-14';
  const restaurado = normalizeState({ ...initialState(),
    projectStepsDone: { calculadora: [primeiro.id, segundo.id] },
    activities: { [dia]: [`passo:calculadora:${segundo.id}`] }
  });
  assert.ok(restaurado.activities[dia].includes(`passo:calculadora:${primeiro.id}`));
  assert.equal(restaurado.activities[dia].filter(id => id.startsWith('passo:calculadora:')).length, 2);
});

// A tela mostrava 1/6 num dia de uma aula e quatro miniprojetos, porque contava só ids de aula.
// O número é montado dentro do JSX; o que dá para travar aqui é a conta que o alimenta.
test('a meta diária conta tudo que foi registrado no dia', () => {
  const fonte = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(fonte, /const atividadesHoje = \(state\.activities\[today\] \|\| \[\]\)\.length;/, 'a meta voltou a filtrar só aulas');
  assert.doesNotMatch(fonte, /todayLessons/, 'sobrou a contagem antiga');
});
