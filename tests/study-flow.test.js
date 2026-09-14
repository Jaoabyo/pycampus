import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceProjects, practiceDone, normalizeLearning, predictionMatches } from '../src/practice-content.js';
import { initialState, normalizeState, recordPractice, xpTotal } from '../src/progress.js';
import { mergeProgress } from '../src/merge-progress.js';
import { canReviewPractice, practicePosition } from '../src/practice-flow.js';
import { requisitosFaltando } from '../src/requisitos.js';

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
