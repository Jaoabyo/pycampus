import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialState, completeLesson } from '../src/progress.js';
import { normalizeUiPreferences } from '../src/ui-preferences.js';
import { missionItemDone, updateDailyMission } from '../src/daily-mission.js';
import { learningMapStage } from '../src/learning-map.js';

test('preferências visuais começam no foco e descartam valores perigosos', () => {
  assert.deepEqual(normalizeUiPreferences(null), { lessonMode: 'focus', courseView: 'map', lessonSteps: {}, dailyMission: null });
  const clean = normalizeUiPreferences({ lessonMode: 'qualquer', courseView: 'grade', lessonSteps: { ola: 3, ruim: 99 }, dailyMission: { date: 'ontem', items: [] } });
  assert.equal(clean.lessonMode, 'focus');
  assert.equal(clean.courseView, 'map');
  assert.deepEqual(clean.lessonSteps, { ola: 3 });
  assert.equal(clean.dailyMission, null);
});

test('a missão mantém o item apresentado e só acrescenta o próximo depois da conclusão', () => {
  const today = '2026-09-16';
  const start = { ...initialState(), goal: 3 };
  const first = updateDailyMission(null, start, today);
  assert.equal(first.items.length, 1);
  assert.equal(first.items[0].kind, 'lesson');
  assert.equal(first.items[0].id, 'ola');
  assert.equal(missionItemDone(first.items[0], start, today), false);

  const afterLesson = completeLesson(start, 'ola', today);
  const next = updateDailyMission(first, afterLesson, today);
  assert.equal(next.items[0].id, 'ola');
  assert.equal(missionItemDone(next.items[0], afterLesson, today), true);
  assert.equal(next.items.length, 2);
  assert.notEqual(next.items[1].key, next.items[0].key);
});

test('uma data nova recebe uma missão nova e nunca reaproveita a fila anterior', () => {
  const state = initialState();
  const old = updateDailyMission(null, state, '2026-09-15');
  const current = updateDailyMission(old, state, '2026-09-16');
  assert.equal(current.date, '2026-09-16');
  assert.equal(current.items.length, 1);
  assert.equal(current.items[0].id, 'ola');
});

test('o mapa distingue a etapa atual de uma etapa bloqueada e explica o bloqueio', () => {
  const state = initialState();
  const first = learningMapStage(state, 0);
  const second = learningMapStage(state, 1);
  assert.equal(first.open, true);
  assert.equal(first.current, true);
  assert.equal(first.done, 0);
  assert.ok(first.total > first.module.lessons.length);
  assert.equal(second.open, false);
  assert.match(second.blocker, /etapa 0?1/i);
});

test('preferências de interface não entram no estado acadêmico nem alteram XP', () => {
  const state = initialState();
  const before = JSON.stringify(state);
  normalizeUiPreferences({ lessonMode: 'complete', courseView: 'list', lessonSteps: { ola: 4 } });
  assert.equal(JSON.stringify(state), before);
  assert.equal(Object.hasOwn(state, 'lessonMode'), false);
});

test('estúdio da faculdade expõe fases, progresso, editor, saída e exportação', () => {
  const fonte = readFileSync(new URL('../src/FaculdadeEntrega.jsx', import.meta.url), 'utf8');
  for (const texto of ['Entender', 'Construir', 'Testar', 'Explicar', 'Exportar']) {
    assert.match(fonte, new RegExp(texto));
  }
  assert.match(fonte, /aria-current/);
  assert.match(fonte, /aria-live/);
  assert.match(fonte, /CodeEditor/);
  assert.match(fonte, /criarNotebookColab/);
  assert.match(fonte, /criarRelatorioHtml/);
});
