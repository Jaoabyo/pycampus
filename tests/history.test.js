import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHistory, appendAttempt, historyReport, reviewQuestions, HISTORY_LIMIT } from '../src/history.js';
import { initialState, normalizeState } from '../src/progress.js';
const attempt = (id = 'test', fields = {}) => ({ id, startedAt: '2026-09-08T18:00:00.000Z', source: 'playground', code: 'print(1)', stdin: '', output: '1\n', status: 'success', ...fields });
test('old backups retain progress and gain an empty history', () => {
  const state = initialState(); delete state.history;
  state.completed = ['ola'];
  const restored = normalizeState(state);
  assert.deepEqual(restored.completed, ['ola']);
  assert.deepEqual(restored.history, []);
});
test('start and finish update the same snapshot; later attempts stay separate', () => {
  let state = appendAttempt(initialState(), attempt('a', { status: 'running' }));
  state = appendAttempt(state, attempt('a', { status: 'error', code: 'else idade < 12:', output: 'SyntaxError' }));
  state = appendAttempt(state, attempt('b'));
  assert.equal(state.history.length, 2);
  assert.equal(state.history[0].code, 'else idade < 12:');
  assert.equal(state.history[0].status, 'error');
  assert.equal(state.history[1].status, 'success');
  assert.equal(state.completed.length, 0);
});
test('history is bounded by count and total serialized size', () => {
  const records = Array.from({ length: 200 }, (_, i) => attempt(String(i)));
  assert.equal(normalizeHistory(records).length, HISTORY_LIMIT);
  const large = normalizeHistory(records.map(item => ({ ...item, code: 'x'.repeat(20000), output: 'y'.repeat(20000) })));
  assert.ok(JSON.stringify(large).length < 705000);
  assert.ok(large.every(item => item.truncated));
  assert.equal(large.at(-1).id, '199');
});
test('malformed backups are sanitized and unfinished attempts become interrupted', () => {
  const raw = [null, {}, attempt('bad', { startedAt: 'wrong' }), attempt('bad2', { status: '__proto__' }), attempt('good', { code: 99, reflection: '<script>text</script>', durationMs: -100 }), attempt('pending', { status: 'running' })];
  const result = normalizeState({ ...initialState(), history: raw });
  assert.equal(result.history.length, 2);
  assert.equal(result.history[0].code, '');
  assert.equal(result.history[0].durationMs, 0);
  assert.equal(result.history[1].status, 'interrupted');
  assert.ok(result.history[1].output.includes('resultado'));
});
test('report preserves code, inputs, errors, reflections and evaluation context', () => {
  const state = appendAttempt(initialState(), attempt('report', { source: 'lesson', lessonId: 'condicoes', title: 'Condições', code: 'if idade >= 18:\n    print("adulto")', stdin: '15', output: 'adolescente', matched: true, reflection: 'Usei uma dica.' }));
  const restored = normalizeState(JSON.parse(JSON.stringify(state)));
  const report = historyReport(restored);
  for (const text of ['Condições', 'if idade >= 18:', '15', 'adolescente', 'Usei uma dica.', 'correspondeu', 'não uma avaliação de domínio']) assert.ok(report.includes(text), text);
  assert.ok(reviewQuestions(state.history[0]).some(q => q.includes('primeira condição')));
  assert.ok(reviewQuestions(attempt('err', { status: 'error' })).some(q => q.includes('erro')));
});
