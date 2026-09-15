import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessons, modules, projects } from '../src/curriculum.js';
import { practiceProjects } from '../src/practice-content.js';
import { stepsFor } from '../src/project-steps.js';
import { functionBridges } from '../src/function-bridges.js';
import { lessonAllowed, missingSummary, blockingSummary, pendingStageWork } from '../src/progression.js';
import { initialState } from '../src/progress.js';
import {
  firstIncompleteModule, lessonIsOpen, moduleIndexForLesson, moduleIsOpen,
  moduleRequirements, practiceIsOpen, projectIsOpen
} from '../src/progression.js';

const blank = () => ({ completed: [], learning: {}, projectChecks: {}, projectStepsDone: {}, functionBridges: {} });
const practicesFor = index => practiceProjects.filter(practice => moduleIndexForLesson(practice.prerequisite) === index);
function completePractice(state, practice) {
  state.learning[practice.id] = { answered: practice.investigate.answer, passed: ['modify', 'create'] };
}
function completeModule(state, index) {
  for (const lesson of modules[index].lessons) if (!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
  for (const practice of practicesFor(index)) completePractice(state, practice);
  for (const project of projects.filter(project => project.module === index)) {
    state.projectChecks[project.id] = project.requirements.map((_, i) => i);
    state.projectStepsDone[project.id] = stepsFor(project.id).map(step => step.id);
  }
  for (const bridge of functionBridges.filter(bridge => bridge.moduleId === modules[index].id)) {
    state.functionBridges[bridge.id] = { passed: true, quizCorrect: true };
  }
  return state;
}

test('first module is available from the start while unknown destinations stay closed', () => {
  const state = blank();
  assert.equal(moduleIsOpen(state, 0), true);
  assert.equal(lessonIsOpen(state, modules[0].lessons[0].id), true);
  assert.equal(moduleIsOpen(state, 1), false);
  assert.equal(firstIncompleteModule(state), 0);
  for (const index of [-1, modules.length, 0.5, '0', null, undefined]) {
    assert.equal(moduleIsOpen(state, index), false);
    assert.equal(moduleRequirements(state, index).complete, false);
  }
  assert.equal(moduleIndexForLesson('missing'), -1);
  assert.equal(lessonIsOpen(state, 'missing'), false);
  assert.equal(practiceIsOpen(state, 'missing'), false);
  assert.equal(projectIsOpen(state, 'missing'), false);
});

test('finishing lessons alone never skips the miniprojects or the final module project', () => {
  const state = blank();
  state.completed = modules[0].lessons.map(lesson => lesson.id);
  const pending = moduleRequirements(state, 0);
  assert.deepEqual(pending.missingLessons, []);
  assert.deepEqual(pending.missingPractices.map(practice => practice.id), practicesFor(0).map(practice => practice.id));
  assert.deepEqual(pending.missingProjects.map(project => project.id), ['calculadora']);
  assert.equal(pending.complete, false);
  assert.equal(projectIsOpen(state, 'calculadora'), false);
  assert.equal(moduleIsOpen(state, 1), false);

  for (const practice of practicesFor(0)) completePractice(state, practice);
  assert.equal(projectIsOpen(state, 'calculadora'), true);
  assert.equal(moduleIsOpen(state, 1), false);
});

test('every miniproject requires its question, adapted example and independent attempt', () => {
  const state = completeModule(blank(), 0);
  for (const practice of practicesFor(0)) {
    const original = state.learning[practice.id];
    for (const partial of [
      { answered: practice.investigate.answer, passed: ['modify'] },
      { answered: practice.investigate.answer, passed: ['create'] },
      { answered: (practice.investigate.answer + 1) % practice.investigate.options.length, passed: ['modify', 'create'] }
    ]) {
      state.learning[practice.id] = partial;
      assert.deepEqual(moduleRequirements(state, 0).missingPractices.map(item => item.id), [practice.id]);
      assert.equal(moduleIsOpen(state, 1), false, practice.id);
    }
    state.learning[practice.id] = original;
  }
  assert.equal(moduleIsOpen(state, 1), true);
});

test('project checklist alone is insufficient and duplicate checks cannot hide an unfinished requirement', () => {
  const state = completeModule(blank(), 0);
  const project = projects.find(item => item.module === 0);
  state.projectStepsDone[project.id] = [];
  assert.equal(moduleRequirements(state, 0).complete, false);
  for (const step of stepsFor(project.id)) {
    state.projectStepsDone[project.id].push(step.id);
    const last = step.id === stepsFor(project.id).at(-1).id;
    assert.equal(moduleIsOpen(state, 1), last);
  }
  state.projectChecks[project.id] = Array(project.requirements.length).fill(0);
  assert.equal(moduleIsOpen(state, 1), false);
  state.projectChecks[project.id] = project.requirements.map((_, index) => index);
  assert.equal(moduleIsOpen(state, 1), true);
});

test('later saved progress cannot bypass an unfinished earlier module and is never modified', () => {
  const state = blank();
  for (let index = 0; index < modules.length; index++) completeModule(state, index);
  const missed = practicesFor(0)[0];
  delete state.learning[missed.id];
  const before = structuredClone(state);
  for (let index = 1; index < modules.length; index++) {
    assert.equal(moduleIsOpen(state, index), false);
    assert.equal(lessonIsOpen(state, modules[index].lessons[0].id), false);
    assert.equal(projectIsOpen(state, projects.find(project => project.module === index).id), false);
  }
  assert.equal(firstIncompleteModule(state), 0);
  assert.deepEqual(state, before);
});

test('a miniproject becomes available after its prerequisite in an open module', () => {
  const state = blank();
  const first = practicesFor(0)[0];
  const next = practicesFor(1)[0];
  assert.equal(practiceIsOpen(state, first.id), false);
  state.completed.push(first.prerequisite, next.prerequisite);
  assert.equal(practiceIsOpen(state, first.id), true);
  assert.equal(practiceIsOpen(state, next.id), false);
  completeModule(state, 0);
  assert.equal(practiceIsOpen(state, next.id), true);
});

test('module requirements enumerate actual lesson objects and known practice ownership', () => {
  const pending = moduleRequirements(blank(), 0);
  assert.equal(pending.module, modules[0]);
  assert.equal(pending.index, 0);
  assert.deepEqual(pending.missingLessons, lessons.filter(lesson => lesson.moduleId === modules[0].id));
  for (const practice of practiceProjects) {
    assert.ok(moduleIndexForLesson(practice.prerequisite) >= 0, `Unknown prerequisite: ${practice.id}`);
  }
});

test('all completed modules form a traversable path to graduation', () => {
  const state = blank();
  for (let index = 0; index < modules.length; index++) {
    assert.equal(moduleIsOpen(state, index), true);
    assert.equal(firstIncompleteModule(state), index);
    completeModule(state, index);
    assert.equal(moduleRequirements(state, index).complete, true);
    assert.equal(projectIsOpen(state, projects.find(project => project.module === index).id), true);
  }
  assert.equal(firstIncompleteModule(state), modules.length);
});

test('function bridge practice and understanding are both required before the quiz project and next module', () => {
  const state = completeModule(completeModule(blank(), 0), 1);
  const index = modules.findIndex(module => module.id === 'logica');
  assert.ok(functionBridges.length > 0);
  for (const bridge of functionBridges) {
    for (const partial of [{ passed: true }, { quizCorrect: true }, { passed: 'true', quizCorrect: true }]) {
      state.functionBridges[bridge.id] = partial;
      assert.deepEqual(moduleRequirements(state, index).missingBridges.map(item => item.id), [bridge.id]);
      assert.equal(projectIsOpen(state, 'quiz'), false);
      assert.equal(moduleIsOpen(state, index + 1), false);
    }
    state.functionBridges[bridge.id] = { passed: true, quizCorrect: true };
  }
  assert.equal(projectIsOpen(state, 'quiz'), true);
  assert.equal(moduleIsOpen(state, index + 1), true);
});

// O travamento passou a valer depois que o estudante já tinha aulas concluídas.
// Nada conquistado pode ser retirado, e a mensagem precisa dizer o que falta.
test('a finished lesson stays open for review even when its stage would be locked', () => {
  const veteran = { ...initialState(), completed: ['ola', 'variaveis', 'tipos', 'operadores', 'strings', 'entrada', 'condicoes', 'booleanos', 'for'] };
  assert.equal(lessonIsOpen(veteran, 'for'), false, 'a etapa 02 está incompleta, então continua fechada');
  assert.equal(lessonAllowed(veteran, 'for'), true, 'mas a aula já concluída continua acessível');
  assert.equal(lessonAllowed(veteran, 'listas'), false, 'território novo permanece travado');
  assert.equal(lessonAllowed(initialState(), 'ola'), true, 'a primeira aula está sempre aberta');
});
test('the missing summary names lessons, bridges, miniprojects and the project of the stage', () => {
  const summary = missingSummary(initialState(), 0);
  for (const part of ['6 aulas', 'miniprojeto', 'projeto', 'etapa 01']) assert.ok(summary.includes(part), `${part} fora de: ${summary}`);
  assert.match(summary, /^Faltam /);
  assert.equal(missingSummary(initialState(), 99), '', 'índice inválido não gera frase');
});
test('the blocking summary points at the earlier stage that is holding, not the one clicked', () => {
  const reason = blockingSummary(initialState(), 2);
  assert.ok(reason.includes('etapa 01'), `deveria citar a etapa 01: ${reason}`);
  assert.equal(blockingSummary(initialState(), 0), '', 'a primeira etapa não tem etapa anterior');
});
// O herói e o cartão "Seu próximo passo" mostravam trabalhos diferentes: o cartão usava a
// primeira aula não concluída e ignorava miniprojetos, pontes e projeto pendentes. Os dois
// passaram a ler pendingStageWork, e nextOpenLesson deixou de existir.
test('a visão geral nunca aponta para uma aula travada', () => {
  assert.equal(pendingStageWork(initialState()).kind, 'lesson');
  assert.equal(pendingStageWork({ ...initialState(), completed: ['ola'] }).id, 'variaveis', 'segue dentro da etapa aberta');
  // Com as aulas da etapa feitas e miniprojetos pendentes, manda para a oficina, não para uma aula travada.
  const skipped = { ...initialState(), completed: lessons.slice(0, 6).map(l => l.id) };
  const work = pendingStageWork(skipped);
  assert.equal(work.kind, 'practice', JSON.stringify(work));
  assert.match(work.label, /miniprojeto/);
  assert.equal(pendingStageWork(initialState()).kind, 'lesson');
  assert.equal(pendingStageWork(initialState()).id, lessons[0].id);
});

// Os dois controles da visão geral precisam sair da mesma fonte: enquanto o cartão calculava o
// próprio próximo passo, ele mandava abrir "Decisões com if" enquanto o herói mandava construir
// o projeto da calculadora, na mesma tela.
test('o herói e o cartão da visão geral leem a mesma fonte', () => {
  const fonte = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(fonte, /nextOpenLesson\s*\(/, 'o cartão voltou a ter fonte própria');
  assert.equal((fonte.match(/const proximo = pendingStageWork\(state\);/g) || []).length, 1);
  assert.match(fonte, /<ProximoPasso work=\{proximo\}/);
  assert.match(fonte, /onClick=\{abrirProximo\}/);
});
