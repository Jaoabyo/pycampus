import test from 'node:test';
import assert from 'node:assert/strict';
import { projectSteps, stepsFor, buildDone, parseRepo, fileNameFor } from '../src/project-steps.js';
import { projects } from '../src/curriculum.js';
import { initialState, normalizeState } from '../src/progress.js';

test('all eight projects have tasks, gradual hints and reflection without full solutions', () => {
  assert.equal(Object.keys(projectSteps).length, projects.length);
  for (const [projectId, steps] of Object.entries(projectSteps)) {
    assert.ok(projects.some(p => p.id === projectId), `projeto inexistente: ${projectId}`);
    assert.equal(new Set(steps.map(s => s.id)).size, steps.length, `${projectId}: ids repetidos`);
    for (const step of steps) {
      assert.ok(step.title.length > 3 && step.instruction.length > 30, `${projectId}/${step.id}`);
      assert.ok(step.expected === null || typeof step.expected === 'string', `${projectId}/${step.id}: tipo de avaliação`);
      assert.ok(step.question.length > 20 && step.hints.length >= 2 && step.check.length > 20);
      assert.ok(['browser', 'local', 'plan'].includes(step.mode));
      assert.equal(step.example, undefined, 'não entregar programa resolvido');
    }
    // O último passo entrega o programa completo, com relatório de mais de uma linha.
    assert.ok(steps.length >= 5, `${projectId}: construção incompleta`);
  }
  assert.equal(stepsFor('inexistente').length, 0);
  assert.equal(fileNameFor('calculadora'), 'orcamento.py');
});
test('steps that read input declare the entries used to verify them', () => {
  for (const [projectId, steps] of Object.entries(projectSteps)) {
    for (const step of steps) {
      if (projectId === 'calculadora' && ['entrada', 'relatorio'].includes(step.id)) assert.equal(step.stdin.split('\n').length, 4);
      if (step.stdin) assert.ok(step.stdin.split('\n').every(line => line.trim().length > 0), `${projectId}/${step.id}: entrada vazia`);
    }
  }
});
test('a project build only counts as done when every step was verified', () => {
  const steps = stepsFor('calculadora');
  const state = initialState();
  assert.equal(buildDone(state, 'calculadora'), false);
  assert.equal(buildDone({ ...state, projectStepsDone: { calculadora: steps.slice(0, -1).map(s => s.id) } }, 'calculadora'), false);
  assert.equal(buildDone({ ...state, projectStepsDone: { calculadora: steps.map(s => s.id) } }, 'calculadora'), true);
  assert.equal(buildDone(state, 'quiz'), false, 'projeto não praticado não conta como construído');
});
test('only a GitHub repository address is accepted as a link', () => {
  assert.deepEqual(parseRepo('https://github.com/ana/orcamento'), { owner: 'ana', repo: 'orcamento' });
  assert.deepEqual(parseRepo(' https://github.com/ana/orcamento.git '), { owner: 'ana', repo: 'orcamento' });
  assert.deepEqual(parseRepo('https://github.com/ana/orcamento/'), { owner: 'ana', repo: 'orcamento' });
  for (const bad of ['', 'github.com/ana/orcamento', 'http://github.com/ana/orcamento', 'https://github.com/ana', 'https://gitlab.com/ana/orcamento', 'https://github.com/ana/orcamento/issues/1', 'javascript:alert(1)', 'https://github.com/ana/..']) {
    assert.equal(parseRepo(bad), null, `deveria recusar: ${bad}`);
  }
});
test('backups keep the project code and drop steps that do not exist', () => {
  const steps = stepsFor('calculadora');
  const raw = {
    ...initialState(),
    projectCodes: { calculadora: 'print("oi")', quiz: 'a'.repeat(60000), fake: 'print(1)' },
    projectStepsDone: { calculadora: [steps[0].id, 'inventado', steps[0].id], fake: ['valores'] }
  };
  const normalized = normalizeState(raw);
  assert.equal(normalized.projectCodes.calculadora, 'print("oi")');
  assert.equal(normalized.projectCodes.quiz.length, 50000, 'código longo deve ser truncado');
  assert.equal(normalized.projectCodes.fake, undefined);
  assert.deepEqual(normalized.projectStepsDone.calculadora, [steps[0].id]);
  assert.equal(normalized.projectStepsDone.fake, undefined);
  assert.deepEqual(normalizeState(initialState()).projectStepsDone, {});
});
