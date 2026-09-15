import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appendLumiNote, LUMI_NOTES_LIMIT, normalizeLumiNotes } from '../src/lumi-notes.js';
import { initialState, normalizeState } from '../src/progress.js';
import { mergeProgress } from '../src/merge-progress.js';
import { historyReport } from '../src/history.js';
import { montarRelatorio } from '../src/relatorio.js';
import { corpoDoGist } from '../src/nuvem.js';

const note = (id = 'lumi-1', fields = {}) => ({
  id,
  at: '2026-09-14T18:30:00.000Z',
  activityId: 'lesson:strings',
  lessonId: 'strings',
  title: 'Textos e métodos',
  level: 2,
  question: 'Por que upper muda o texto?',
  tip: 'upper cria uma versão em maiúsculas para você usar ou guardar.',
  ...fields
});

test('Lumi notes are short, valid, bounded, and survive an old backup', () => {
  const raw = [
    note('valid', { question: ' q '.repeat(400), tip: ' t '.repeat(800) }),
    note('bad-date', { at: 'amanhã' }),
    note('bad-level', { level: 5 }),
    { id: 'missing-fields' }
  ];
  const normalized = normalizeState({ ...initialState(), lumiNotes: raw });
  assert.equal(normalized.lumiNotes.length, 1);
  assert.ok(normalized.lumiNotes[0].question.length <= 600);
  assert.ok(normalized.lumiNotes[0].tip.length <= 1200);
  assert.deepEqual(normalizeState({ ...initialState(), lumiNotes: undefined }).lumiNotes, []);

  const many = Array.from({ length: LUMI_NOTES_LIMIT + 5 }, (_, index) => note(`note-${index}`, { at: `2026-09-14T18:${String(index % 60).padStart(2, '0')}:00.000Z` }));
  assert.equal(normalizeLumiNotes(many).length, LUMI_NOTES_LIMIT);
});

test('Lumi notes append and merge by id without losing either device conversation', () => {
  const computer = appendLumiNote(initialState(), note('computer', { at: '2026-09-14T10:00:00.000Z' }));
  const phone = {
    ...initialState(),
    lumiNotes: [
      note('computer', { at: '2026-09-14T11:00:00.000Z', tip: 'Explicação mais completa da mesma conversa.' }),
      note('phone', { at: '2026-09-14T12:00:00.000Z', activityId: 'practice:strings', title: 'Miniprojeto de textos' })
    ]
  };
  const merged = mergeProgress(computer, phone);
  assert.deepEqual(merged.lumiNotes.map(item => item.id), ['computer', 'phone']);
  assert.equal(merged.lumiNotes[0].tip, 'Explicação mais completa da mesma conversa.');
});

test('the learning diary and study report include Lumi guidance as guidance, not proof of mastery', () => {
  const state = appendLumiNote(initialState(), note());
  const diary = historyReport(state);
  const report = montarRelatorio(state, '2026-09-14');
  const gistState = JSON.parse(corpoDoGist(state).files['pycampus.json'].content);
  for (const text of ['Conversas com o Lumi', 'Por que upper muda o texto?', 'upper cria uma versão']) assert.ok(diary.includes(text), text);
  for (const text of ['Conversas recentes com o Lumi', 'Por que upper muda o texto?', 'não comprovam domínio']) assert.ok(report.includes(text), text);
  assert.deepEqual(gistState.lumiNotes, state.lumiNotes, 'o Gist privado recebe as notas junto do estado');
});

// Com a IA desligada, a ajuda escrita continuava aparecendo na tela mas não chegava ao diário:
// o estudante pedia ajuda e o relatório de estudo não sabia disso. Agora ela é registrada, e a
// nota diz de onde veio, para nunca parecer que o modelo respondeu quando ele estava fora.
test('a nota guarda de onde veio a orientação', () => {
  const base = { id: 'a:1', at: '2026-09-14T10:00:00.000Z', activityId: 'a', lessonId: 'entrada', title: 'T', level: 2, question: 'q', tip: 'orientação' };
  assert.equal(normalizeLumiNotes([base])[0].fonte, 'ia', 'nota antiga, sem campo, continua contando como resposta do modelo');
  assert.equal(normalizeLumiNotes([{ ...base, fonte: 'escrita' }])[0].fonte, 'escrita');
  assert.equal(normalizeLumiNotes([{ ...base, fonte: 'inventada' }])[0].fonte, 'ia', 'valor de fora do backup não passa');
});

test('o painel registra a ajuda escrita e deixa subir de degrau sem IA', () => {
  const fonte = readFileSync(new URL('../src/Mentor.jsx', import.meta.url), 'utf8');
  assert.match(fonte, /registrar\(escrita, 'escrita'\)/, 'a ajuda escrita voltou a não ser registrada');
  assert.doesNotMatch(fonte, /disabled=\{busy \|\| !status\?\.ok\} onClick=\{\(\) => perguntar\(level \+ 1\)\}/, 'subir de degrau voltou a depender da IA');
});
