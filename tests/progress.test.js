import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, completeLesson, localDate, shiftDate, streak, weekDays, xpTotal, levelInfo, normalizeState, badges } from '../src/progress.js';
import { lessons, modules, projects } from '../src/curriculum.js';
import { aulasDaFaculdade } from '../src/faculdade.js';

test('lesson completion grants XP only once and tracks the study date', () => {
  const first = completeLesson(initialState(), 'ola', '2026-09-08');
  assert.equal(xpTotal(first), 100);
  assert.deepEqual(first.activities['2026-09-08'], ['ola']);
  assert.equal(completeLesson(first, 'ola', '2026-09-09'), first);
  assert.equal(completeLesson(first, 'unknown'), first);
  assert.equal(badges[0].check(first), true);
});
test('streak respects today, yesterday, gaps, future entries and month boundaries', () => {
  const state = initialState();
  state.activities = { '2026-08-30': ['ola'], '2026-08-31': ['ola'], '2026-09-01': ['ola'], '2026-09-10': ['ola'] };
  assert.equal(streak(state, '2026-09-01'), 3);
  assert.equal(streak(state, '2026-09-02'), 3);
  assert.equal(streak(state, '2026-09-03'), 0);
  assert.equal(shiftDate('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftDate('2024-03-01', -1), '2024-02-29');
});
test('weekly calendar starts on Monday including when today is Sunday', () => {
  assert.deepEqual(weekDays('2026-09-13'), ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']);
  assert.equal(weekDays('2026-09-07')[0], '2026-09-07');
});
test('backup validation drops unknown ids, unsafe URLs, invalid dates and malformed records', () => {
  const raw = { ...initialState(), completed: ['ola', 'ola', 'fake'], goal: -10, weeklyGoal: 99, projectChecks: { calculadora: [0, 0, 1, 98, '2'] }, projectLinks: { calculadora: 'javascript:alert(1)' }, sessions: [null, { id: 'x', title: 'Test', date: '2026-02-30', time: '19:00' }], activities: { '2026-02-30': ['ola'], '2099-01-01': ['ola'], [localDate()]: ['ola', 'fake'] } };
  const normalized = normalizeState(raw);
  assert.deepEqual(normalized.completed, ['ola']);
  assert.equal(normalized.goal, 1);
  assert.equal(normalized.weeklyGoal, 5);
  assert.deepEqual(normalized.projectChecks.calculadora, [0, 1]);
  assert.equal(normalized.projectLinks.calculadora, undefined);
  assert.deepEqual(normalized.sessions, []);
  assert.deepEqual(Object.keys(normalized.activities), [localDate()]);
  assert.throws(() => normalizeState({ version: 2, completed: [] }));
});

test('backup antigo mantém as seis aulas da faculdade e ganha entregas vazias', () => {
  const antigo = { ...initialState(), faculdade: {
    feitas: aulasDaFaculdade.slice(0, 6).map(({ id }) => id),
    codigos: {},
  } };
  const restaurado = normalizeState(antigo);
  assert.equal(restaurado.faculdade.feitas.length, 6);
  assert.deepEqual(restaurado.faculdade.entregas, {});
});

test('backup aceita somente entregas, passos, datas, atividades e textos permitidos', () => {
  const hoje = localDate();
  const entrada = { ...initialState(), faculdade: { feitas: [], codigos: {}, entregas: {
    'entrega-u1': {
      codigo: 'x'.repeat(60000),
      passosConcluidos: ['u1-entender-lista', 'inventado'],
      conclusao: '<script>alert(1)</script>',
      executadaNoColabEm: 'ontem',
      pronta: true,
    },
    falsa: { codigo: 'não entra' },
  } }, activities: {
    [hoje]: [
      'faculdade-entrega:entrega-u1:u1-entender-lista',
      'faculdade-entrega:entrega-u1:inventado',
      'faculdade-entrega:falsa:u1-entender-lista',
    ],
  } };
  const estado = normalizeState(entrada);
  const trabalho = estado.faculdade.entregas['entrega-u1'];
  assert.equal(trabalho.codigo.length, 50000);
  assert.deepEqual(trabalho.passosConcluidos, ['u1-entender-lista']);
  assert.equal(trabalho.conclusao, '<script>alert(1)</script>');
  assert.equal(trabalho.executadaNoColabEm, '');
  assert.equal(estado.faculdade.entregas.falsa, undefined);
  assert.equal(trabalho.pronta, undefined);
  assert.deepEqual(estado.activities[hoje], ['faculdade-entrega:entrega-u1:u1-entender-lista']);
});
test('project XP derives from complete checklists and cannot be farmed by toggling', () => {
  const state = initialState();
  state.projectChecks.calculadora = [0, 1, 2, 3];
  assert.equal(xpTotal(state), 0);
  state.projectChecks.calculadora.push(4);
  assert.equal(xpTotal(state), 250);
  state.projectChecks.quiz = [0, 1, 2, 3, 4];
  assert.equal(levelInfo(state).level, 2);
  assert.equal(levelInfo(state).current, 0);
  state.projectChecks.calculadora.pop();
  assert.equal(xpTotal(state), 250);
});
test('curriculum has unique lessons, authored practice and one project per stage', () => {
  assert.equal(modules.length, 8);
  assert.equal(lessons.length, 48);
  assert.equal(new Set(lessons.map(l => l.id)).size, 48);
  assert.equal(projects.length, modules.length);
  for (const lesson of lessons) {
    assert.ok(lesson.theory.length >= 2, lesson.id);
    assert.ok(lesson.example && lesson.expected && lesson.challenge, lesson.id);
    assert.ok(lesson.options[lesson.answer], lesson.id);
  }
  assert.equal(lessons.find(l => l.id === 'condicoes').expected, 'Recuperação');
});
