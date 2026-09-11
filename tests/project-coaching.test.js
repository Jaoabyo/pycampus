import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, xpTotal } from '../src/progress.js';
import { buildReadme, readmeFields } from '../src/project-documentation.js';
import { projects } from '../src/curriculum.js';
import { stepsFor, fileNameFor } from '../src/project-steps.js';
import { historyReport } from '../src/history.js';

test('project documentation and explanations survive backup without changing earned progress', () => {
  const old = { ...initialState(), completed: ['ola'], projectCodes: { calculadora: 'renda = 3000' }, projectStepsDone: { calculadora: ['valores'] } };
  const raw = { ...old, projectNotes: { calculadora: { valores: { answer: 'A variável guarda o valor.' }, unknown: { answer: 'ignorar' } } }, projectReadmes: { calculadora: { purpose: 'Meu orçamento', unknown: 'ignorar', tests: 4 }, unknown: { purpose: 'ignorar' } }, projectPositions: { calculadora: 'pergunta', quiz: 'unknown' } };
  const result = normalizeState(raw);
  assert.equal(result.projectNotes.calculadora.valores.answer, 'A variável guarda o valor.');
  assert.equal(result.projectNotes.calculadora.unknown, undefined);
  assert.deepEqual(result.projectReadmes.calculadora, { purpose: 'Meu orçamento' });
  assert.equal(result.projectReadmes.unknown, undefined);
  assert.equal(result.projectPositions.calculadora, 'pergunta');
  assert.equal(result.projectPositions.quiz, undefined);
  assert.equal(result.projectCodes.calculadora, old.projectCodes.calculadora);
  assert.deepEqual(result.projectStepsDone.calculadora, ['valores']);
  assert.equal(xpTotal(result), xpTotal(old));
  assert.ok(historyReport(result).includes('A variável guarda o valor.'));
});

test('each project generates its own README from the student writing', () => {
  for (const project of projects) {
    const text = buildReadme(project, Object.fromEntries(readmeFields.map(([id]) => [id, `Meu texto ${id}`])));
    assert.ok(text.includes(project.title));
    assert.ok(text.includes(fileNameFor(project.id)));
    for (const [id] of readmeFields) assert.ok(text.includes(`Meu texto ${id}`));
    assert.ok(!text.includes('todos os testes passaram'));
    assert.ok(stepsFor(project.id).some(step => step.mode === 'browser'));
  }
  assert.deepEqual(stepsFor('api').filter(s => s.mode === 'local').map(s => s.id), ['construcao-4', 'construcao-5']);
});
