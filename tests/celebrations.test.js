import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, completeLesson, recordPractice } from '../src/progress.js';
import { practiceProjects, practiceXp } from '../src/practice-content.js';
import { buildCelebration } from '../src/celebrations.js';
const day = '2026-09-08';
const trained = (state, project) => recordPractice({ ...state, learning: { ...state.learning, [project.id]: { answered: project.investigate.answer, passed: ['modify', 'create'] } } }, project.id, day);
test('a trained miniproject celebrates its XP on screen, once, and only when complete', () => {
  const project = practiceProjects[0];
  const before = initialState(), after = trained(before, project);
  const reward = buildCelebration(before, after, day);
  assert.equal(reward.title, 'Miniprojeto treinado!');
  assert.equal(reward.subtitle, project.title);
  assert.equal(reward.xp, practiceXp);
  assert.equal(reward.practice, true);
  assert.equal(reward.firstLessonToday, false, 'o foguinho continua sendo da primeira aula do dia');
  assert.equal(buildCelebration(after, after, day), null, 'não pode celebrar de novo');
  const missingQuiz = { ...before, learning: { [project.id]: { passed: ['modify', 'create'] } } };
  const missingCode = { ...before, learning: { [project.id]: { answered: project.investigate.answer, passed: ['modify'] } } };
  assert.equal(buildCelebration(before, missingQuiz, day), null, 'sem a prova rápida não há XP');
  assert.equal(buildCelebration(before, missingCode, day), null, 'sem as duas etapas de código não há XP');
});
test('first daily lesson celebrates XP, flame and first badge', () => {
  const before = initialState(), after = completeLesson(before, 'ola', day);
  const reward = buildCelebration(before, after, day);
  assert.equal(reward.title, 'Aula concluída!');
  assert.equal(reward.xp, 100);
  assert.equal(reward.firstLessonToday, true);
  assert.equal(reward.streak, 1);
  assert.deepEqual(reward.badges.map(b => b.id), ['start']);
});
test('second lesson on same day does not relight flame or replay old badge', () => {
  const before = completeLesson(initialState(), 'ola', day);
  const after = completeLesson(before, 'variaveis', day);
  const reward = buildCelebration(before, after, day);
  assert.equal(reward.firstLessonToday, false);
  assert.equal(reward.xp, 100);
  assert.deepEqual(reward.badges, []);
  assert.equal(buildCelebration(after, completeLesson(after, 'ola', day), day), null);
});
test('new local day lights flame while previous sessions do not suppress first lesson', () => {
  let before = completeLesson(initialState(), 'ola', '2026-09-07');
  before.activities[day] = ['session:abc'];
  const reward = buildCelebration(before, completeLesson(before, 'variaveis', day), day);
  assert.equal(reward.firstLessonToday, true);
  assert.equal(reward.streak, 2);
});
test('level milestone and module badge use actual progress', () => {
  let before = initialState();
  for (const id of ['ola', 'variaveis', 'tipos', 'operadores']) before = completeLesson(before, id, day);
  const after = completeLesson(before, 'strings', day);
  assert.equal(buildCelebration(before, after, day).level, 2);
  const moduleReward = buildCelebration(after, completeLesson(after, 'entrada', day), day);
  assert.ok(moduleReward.badges.some(b => b.id === 'foundation'));
  assert.equal(moduleReward.level, null);
});
test('history changes and failed practice never create celebrations', () => {
  const state = initialState();
  assert.equal(buildCelebration(state, { ...state, history: [{ status: 'error' }], codes: { ola: 'print(1)' } }, day), null);
});
test('project completion celebrates badge and XP without daily lesson flame', () => {
  const before = initialState();
  const after = { ...before, projectChecks: { calculadora: [0, 1, 2, 3, 4] } };
  const reward = buildCelebration(before, after, day);
  assert.equal(reward.title, 'Projeto concluído!');
  assert.equal(reward.xp, 250);
  assert.equal(reward.firstLessonToday, false);
  assert.ok(reward.badges.some(b => b.id === 'maker'));
});
