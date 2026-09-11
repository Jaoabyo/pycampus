import { initialState } from '../src/progress.js';
import { moduleRequirements } from '../src/progression.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { functionBridges, functionBridgeIds } from '../src/function-bridges.js';
import { functionBridgeSolutions } from './function-bridge-reference.js';
import { lessons } from '../src/curriculum.js';
import { coachedProjects } from '../src/project-coaching.js';
import { normalizeState } from '../src/progress.js';

test('function bridges are ordered, self-contained and use already available prerequisites', () => {
  assert.equal(functionBridges.length, 8);
  assert.equal(new Set(functionBridgeIds).size, 8);
  const known = new Set(lessons.map(lesson => lesson.id));
  for (const bridge of functionBridges) {
    assert.equal(bridge.moduleId, 'logica');
    assert.equal(bridge.lessonId, 'funcoes');
    for (const prerequisite of bridge.prerequisites) assert.ok(known.has(prerequisite), `${bridge.id} depends on unavailable ${prerequisite}`);
    for (const key of ['concept', 'example', 'starter', 'challenge', 'expected', 'question']) assert.ok(bridge[key].trim().length > 0, `${bridge.id}: ${key}`);
    assert.equal(bridge.options.length, 3);
    assert.ok(bridge.options[bridge.answer]);
    assert.ok(bridge.hints.length >= 2);
    assert.notEqual(bridge.example, bridge.starter);
    assert.notEqual(bridge.example, functionBridgeSolutions[bridge.id]);
    assert.ok(functionBridgeSolutions[bridge.id]);
    assert.equal(bridge.solution, undefined, 'answers are fixtures, not exercise data');
    known.add(bridge.id);
  }
});

test('the problematic function concepts get separate construction tasks before the combined quiz', () => {
  const ids = coachedProjects.quiz.map(step => step.id);
  const before = (first, second) => assert.ok(ids.indexOf(first) >= 0 && ids.indexOf(first) < ids.indexOf(second), `${first} must precede ${second}`);
  before('construcao-1', 'quiz-ler-em-funcao');
  before('quiz-ler-em-funcao', 'quiz-segundo-valor');
  before('quiz-segundo-valor', 'construcao-2');
  before('construcao-2', 'quiz-duas-perguntas');
  before('quiz-duas-perguntas', 'construcao-3');
  before('quiz-alternativas', 'quiz-resposta-invalida');
  before('quiz-escolha-rodada', 'construcao-4');
  assert.ok(coachedProjects.quiz.every(step => step.expected === null && step.mode === 'browser'));
  for (const step of coachedProjects.quiz) for (const id of step.prerequisiteBridgeIds) assert.ok(functionBridgeIds.includes(id));
});

test('historical quiz construction ids, source and explanations remain valid after inserting smaller steps', () => {
  const completedIds = Array.from({ length: 5 }, (_, i) => `construcao-${i + 1}`);
  const code = 'def perguntar():\n    return "Minha pergunta"\n';
  const answer = 'return devolve e print mostra.';
  const state = normalizeState({
    version: 1, completed: ['funcoes'], projectCodes: { quiz: code },
    projectStepsDone: { quiz: completedIds }, projectPositions: { quiz: 'construcao-2' },
    projectNotes: { quiz: { 'construcao-2': { answer } } }
  });
  assert.deepEqual(state.projectStepsDone.quiz, completedIds);
  assert.equal(state.projectCodes.quiz, code);
  assert.equal(state.projectPositions.quiz, 'construcao-2');
  assert.equal(state.projectNotes.quiz['construcao-2'].answer, answer);
  assert.ok(state.completed.includes('funcoes'));
});

test('examples separate returning from displaying and teach input before scoring interactively', () => {
  const returning = functionBridges.find(bridge => bridge.id === 'ponte-funcao-retornar');
  assert.ok(returning.example.includes('texto = mensagem()\nprint(texto)'));
  const inputs = functionBridges.filter(bridge => /input\(/.test(bridge.example));
  assert.deepEqual(inputs.map(bridge => bridge.id), ['ponte-funcao-entrada']);
  assert.equal(inputs[0].stdin, 'azul');
  assert.equal(inputs[0].exampleStdin, 'Ana');
  assert.ok(functionBridges.slice(0, 5).every(bridge => !/return 1/.test(bridge.example)));
});

// As pontes eram exigidas pela liberação da etapa 03 sem existir tela nem estado salvo:
// o estudante ficaria travado para sempre. Estes testes protegem o caminho de conclusão.
test('bridge progress survives a backup and only counts with the right answer', () => {
  const [first, second] = functionBridges;
  const saved = normalizeState({
    version: 1, completed: ['funcoes'],
    functionBridges: {
      [first.id]: { passed: true, quizCorrect: true, answered: first.answer, code: 'iniciar()' },
      [second.id]: { passed: true, quizCorrect: true, answered: (second.answer + 1) % second.options.length },
      inventada: { passed: true, quizCorrect: true, answered: 0 }
    }
  });
  assert.equal(saved.functionBridges[first.id].passed, true);
  assert.equal(saved.functionBridges[first.id].quizCorrect, true);
  assert.equal(saved.functionBridges[first.id].code, 'iniciar()');
  assert.equal(saved.functionBridges[second.id].quizCorrect, false, 'marcar certo sem a alternativa certa não vale');
  assert.equal(saved.functionBridges.inventada, undefined);
  assert.deepEqual(normalizeState({ version: 1, completed: [] }).functionBridges, {});
});
test('finishing every bridge is what lets the logic stage close', () => {
  const bridgesOnly = { ...initialState(), completed: ['funcoes'] };
  assert.equal(moduleRequirements(bridgesOnly, 1).missingBridges.length, functionBridges.length);
  const withBridges = {
    ...bridgesOnly,
    functionBridges: Object.fromEntries(functionBridges.map(bridge => [bridge.id, { passed: true, quizCorrect: true, answered: bridge.answer, code: '' }]))
  };
  assert.equal(moduleRequirements(withBridges, 1).missingBridges.length, 0, 'com as oito pontes feitas, elas somem da lista de pendências');
});
