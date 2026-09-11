import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnose, patterns, levelsById, levelKey, levelDate, levelsDone, levelOpen, completeLevel, saveExplanation, saveReview, masteryState, masteredCount, readyForReview, normalizeMastery, RETENTION_DAYS } from '../src/diagnosis.js';
import { lessons } from '../src/curriculum.js';
import { initialState, normalizeState } from '../src/progress.js';

// Tentativas modeladas nas que o estudante realmente registrou no diário.
const attempt = (code, output, extra = {}) => ({ startedAt: '2026-09-08T20:00:00.000Z', title: 'Laboratório', code, output, source: 'playground', matched: null, ...extra });
const real = [
  attempt('# Calculadora\nrenda = float("3000.00")\ndespesa_1 = input("Quanto é sua despesa? ") = float(dispesa_1)', 'SyntaxError: cannot assign to function call'),
  attempt('# Calculadora\nrenda = float(input("3000.00"))\ndespesa_1 = float(input(1200.0))', "ValueError: could not convert string to float: ''"),
  attempt('# Calculadora\ndespesa_3 float(300.00)', 'SyntaxError: invalid syntax'),
  attempt('# Crie a variável e use print\nlinguagem = Python\nprint(linguagem)', "NameError: name 'Python' is not defined", { title: 'Variáveis', source: 'lesson' })
];
const ladder = (state, id, dates) => Object.entries(dates).reduce((acc, [levelId, day]) => completeLevel(acc, id, levelId, day), state);

test('the diagnosis finds the real mistakes and points at the guilty line, not a comment', () => {
  const byId = Object.fromEntries(diagnose(real).map(item => [item.id, item]));
  assert.equal(byId['duas-atribuicoes'].count, 1);
  assert.equal(byId['duas-atribuicoes'].evidence.line, 'despesa_1 = input("Quanto é sua despesa? ") = float(dispesa_1)');
  assert.equal(byId['input-pergunta'].evidence.line, 'despesa_1 = float(input(1200.0))');
  assert.equal(byId['falta-igual'].evidence.line, 'despesa_3 float(300.00)');
  assert.equal(byId['nome-diferente'].evidence.line, 'linguagem = Python');
  for (const item of diagnose(real)) assert.ok(!item.evidence.line.startsWith('#'), `${item.id}: evidência em comentário`);
});
test('clean code raises no pattern and the ranking follows how often each one happened', () => {
  assert.deepEqual(diagnose([attempt('renda = float(input("Renda: "))\nprint(renda)', '3000.0', { matched: true })]), []);
  assert.deepEqual(diagnose([]), []);
  assert.deepEqual(diagnose(undefined), []);
  const counted = diagnose([...real, real[1], real[1]]);
  assert.equal(counted[0].id, 'input-pergunta');
  assert.equal(counted[0].count, 3);
});
test('the range pattern only reacts to a lesson attempt that missed the expected output', () => {
  const missed = attempt('for n in range(1, 4):\n    print(n)', '1\n2\n3', { source: 'lesson', matched: false });
  assert.ok(diagnose([missed]).some(item => item.id === 'limite-range'));
  assert.ok(!diagnose([{ ...missed, matched: true }]).some(item => item.id === 'limite-range'));
  assert.ok(!diagnose([{ ...missed, source: 'playground' }]).some(item => item.id === 'limite-range'));
});
test('every pattern has a basic-to-create ladder, each level runnable or answerable', () => {
  assert.equal(new Set(patterns.map(p => p.id)).size, patterns.length);
  for (const pattern of patterns) {
    assert.ok(lessons.some(l => l.id === pattern.lesson), `${pattern.id}: aula inexistente`);
    assert.deepEqual(pattern.levels.map(l => l.level), [1, 2, 3], `${pattern.id}: níveis fora de ordem`);
    assert.deepEqual(pattern.levels.map(l => l.kind), ['predict', 'fix', 'create'], `${pattern.id}: a escada deve ir de reconhecer a criar`);
    for (const level of pattern.levels) {
      assert.ok(level.instruction.length > 25, `${pattern.id}/${level.id}`);
      if (level.kind === 'predict') {
        assert.equal(level.options.length, 3, `${pattern.id}: alternativas`);
        assert.ok(level.options[level.answer].length > 10 && level.why.length > 30, pattern.id);
        assert.ok(level.code.length > 5, pattern.id);
      } else {
        assert.ok(level.expected.length > 0, `${pattern.id}/${level.id}: sem saída esperada`);
        if (level.stdin) assert.ok(level.stdin.split('\n').every(line => line.trim()), `${pattern.id}/${level.id}: entrada vazia`);
      }
      if (level.kind === 'fix') assert.ok(level.broken.length > 5, `${pattern.id}: falta o código com defeito`);
    }
  }
  assert.equal(Object.keys(levelsById).length, patterns.length * 3);
});
test('a level only opens after the previous one, so practice starts at the basic level', () => {
  const id = patterns[0].id, [one, two, three] = patterns[0].levels;
  let state = initialState();
  assert.equal(levelOpen(state, id, one), true);
  assert.equal(levelOpen(state, id, two), false);
  state = completeLevel(state, id, one.id, '2026-09-10');
  assert.equal(levelOpen(state, id, two), true);
  assert.equal(levelOpen(state, id, three), false);
  assert.equal(levelsDone(state, id), 1);
  assert.equal(levelDate(state, id, one.id), '2026-09-10');
  // Resolver de novo não reescreve a data do primeiro acerto.
  assert.equal(levelDate(completeLevel(state, id, one.id, '2026-09-20'), id, one.id), '2026-09-10');
});
test('retention needs the create level solved again days later, not on the same day', () => {
  const id = patterns[0].id;
  const base = ladder(initialState(), id, { ver: '2026-09-10', corrigir: '2026-09-10', criar: '2026-09-10' });
  assert.equal(masteryState(base, id).steps[1].done, false, 'resolver uma vez não é retenção');
  assert.equal(masteryState(completeLevel(base, id, 'criar', '2026-09-11'), id).steps[1].done, false, 'um dia depois ainda é cedo');
  const retained = completeLevel(base, id, 'criar', '2026-09-13');
  assert.equal(masteryState(retained, id).steps[1].done, true, `${RETENTION_DAYS} dias depois conta`);
});
test('mastery needs the ladder, retention, an explanation and an external review', () => {
  const id = patterns[0].id;
  let state = ladder(initialState(), id, { ver: '2026-09-10', corrigir: '2026-09-10', criar: '2026-09-10' });
  state = completeLevel(state, id, 'criar', '2026-09-13');
  assert.equal(masteryState(state, id).mastered, false, 'sem explicação não há domínio');
  state = saveExplanation(state, id, 'O engano era colocar o valor dentro do input.');
  assert.deepEqual(readyForReview(state).map(p => p.id), [id], 'agora espera revisão externa');
  assert.equal(masteryState(state, id).mastered, false, 'a plataforma sozinha não declara domínio');
  state = saveReview(state, id, 'praticar', '2026-09-13');
  assert.equal(masteryState(state, id).mastered, false);
  state = saveReview(state, id, 'dominado', '2026-09-13');
  assert.equal(masteryState(state, id).mastered, true);
  assert.equal(masteredCount(state), 1);
  assert.deepEqual(readyForReview(state), []);
});
test('mastery records survive a backup and invalid ones are dropped', () => {
  const id = patterns[0].id;
  const normalized = normalizeState({
    ...initialState(),
    mastery: {
      [id]: { levels: { ver: '2026-09-10', corrigir: 'ontem', inventado: '2026-09-10' }, retained: '2026-09-13', note: 'a'.repeat(3000), review: { verdict: 'dominado', at: '2026-09-13' } },
      fake: { levels: { ver: '2026-09-10' } }
    }
  });
  assert.deepEqual(normalized.mastery[id].levels, { ver: '2026-09-10' }, 'data inválida e nível inexistente saem');
  assert.equal(normalized.mastery[id].retained, '', 'sem o nível criar não há retenção');
  assert.equal(normalized.mastery[id].note.length, 2000);
  assert.deepEqual(normalized.mastery[id].review, { verdict: 'dominado', at: '2026-09-13' });
  assert.equal(normalized.mastery.fake, undefined);
  assert.deepEqual(normalizeState(initialState()).mastery, {});
  assert.equal(normalizeState({ ...initialState(), mastery: { [id]: { review: { verdict: 'otimo', at: '2026-09-13' } } } }).mastery[id].review, null);
});
