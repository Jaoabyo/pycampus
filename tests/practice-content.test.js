import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceProjects, normalizeLearning, nextReview, reviewInterval, practiceDone, practiceSteps, practiceXp, predictionMatches, shuffledPieces, puzzleSolved } from '../src/practice-content.js';
import { lessons } from '../src/curriculum.js';
import { initialState, xpTotal, donePractices, recordPractice, normalizeState, localDate } from '../src/progress.js';

const trained = project => ({ answered: project.investigate.answer, passed: ['modify', 'create'] });

test('practice projects have unique ids, a real prerequisite lesson and no empty fields', () => {
  const ids = new Set();
  for (const p of practiceProjects) {
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.ok(lessons.some(l => l.id === p.prerequisite), `${p.id}: unknown prerequisite ${p.prerequisite}`);
    for (const field of ['title', 'story', 'example', 'output', 'modify', 'modified', 'create', 'expected', 'hint']) {
      assert.ok(typeof p[field] === 'string' && p[field].length > 0, `${p.id}: empty ${field}`);
    }
  }
});
test('every miniproject has an investigation with three options, one correct answer and a line to explain', () => {
  const positions = new Set();
  for (const p of practiceProjects) {
    const { question, options, answer, line, why } = p.investigate;
    assert.ok(question.length > 15, p.id);
    assert.equal(options.length, 3, p.id);
    assert.equal(new Set(options).size, 3, `${p.id}: repeated option`);
    assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 3, p.id);
    assert.ok(p.example.includes(line), `${p.id}: line to explain is not in the example`);
    assert.ok(why.length > 30, `${p.id}: missing explanation`);
    positions.add(answer);
  }
  assert.equal(positions.size, 3, 'the correct answer should not always sit in the same position');
});
test('every puzzle rebuilds its reference solution and carries one plausible wrong piece', () => {
  for (const p of practiceProjects) {
    // O prefixo é código já entregue pronto: montado com os blocos, tem de reproduzir a solução
    // guardada, que por sua vez precisa rodar sozinha.
    const blocos = p.puzzle.blocks.map(block => "    ".repeat(block.indent) + block.code).join(String.fromCharCode(10));
    const rebuilt = [p.puzzle.prefix, blocos].filter(Boolean).join(String.fromCharCode(10));
    const norma = texto => texto.split(String.fromCharCode(10)).filter(linha => linha.trim()).join(String.fromCharCode(10));
    assert.equal(norma(rebuilt), norma(p.solution), p.id + ": prefixo e blocos não reconstroem a solução");
    assert.ok(p.puzzle.blocks.length >= 2 && p.puzzle.blocks.length <= 9, `${p.id}: ${p.puzzle.blocks.length} blocos`);
    assert.ok(p.puzzle.blocks.every(block => block.code === block.code.trim() && block.indent >= 0 && block.indent <= 3), p.id);
    // O distrator precisa ser uma linha que não existe na solução; ser parecido com uma delas é justamente o ponto.
    assert.ok(p.puzzle.distractor, `${p.id}: falta o distrator`);
    assert.ok(!p.puzzle.blocks.some(block => block.code === p.puzzle.distractor), `${p.id}: o distrator é uma linha da solução`);
    assert.ok(p.solution.trim().length > 0 && p.create.length > 20, p.id);
  }
  const withPrefix = practiceProjects.filter(p => p.puzzle.prefix);
  assert.deepEqual(withPrefix.map(p => p.id), ['cofre'], 'apenas o miniprojeto longo usa contexto pronto');
});
test('pieces come shuffled, never already solved, and stay the same on every visit', () => {
  for (const p of practiceProjects) {
    const pieces = shuffledPieces(p);
    assert.equal(pieces.length, p.puzzle.blocks.length + 1);
    assert.deepEqual(shuffledPieces(p).map(piece => piece.id), pieces.map(piece => piece.id), `${p.id}: embaralhamento instável`);
    assert.notDeepEqual(pieces.map(piece => piece.id), pieces.map((_, i) => i), `${p.id}: peças já em ordem`);
    assert.equal(pieces.filter(piece => piece.extra).length, 1);
    assert.equal(new Set(pieces.map(piece => piece.id)).size, pieces.length);
  }
});
test('a puzzle only counts as solved with the right order and the right indentation', () => {
  const p = practiceProjects.find(project => project.puzzle.blocks.some(block => block.indent > 0));
  assert.equal(puzzleSolved(p.puzzle.blocks, p), true);
  assert.equal(puzzleSolved([], p), false);
  assert.equal(puzzleSolved(p.puzzle.blocks.slice(0, -1), p), false);
  assert.equal(puzzleSolved([...p.puzzle.blocks].reverse(), p), false);
  assert.equal(puzzleSolved(p.puzzle.blocks.map(block => ({ ...block, indent: 0 })), p), false, 'indentação errada não pode passar');
});
test('practice examples avoid syntax not yet taught by their prerequisite lesson', () => {
  const decomposicao = practiceProjects.find(p => p.prerequisite === 'decomposicao');
  assert.ok(!decomposicao.example.includes('['));
  const encapsulamento = practiceProjects.find(p => p.prerequisite === 'encapsulamento');
  assert.ok(!encapsulamento.example.includes('raise'));
});
test('review intervals grow with each independent solve and reset after asking for help', () => {
  assert.equal(reviewInterval({}, 'solo'), 3);
  assert.equal(reviewInterval({ streak: 1 }, 'solo'), 7);
  assert.equal(reviewInterval({ streak: 2 }, 'solo'), 16);
  assert.equal(reviewInterval({ streak: 3 }, 'solo'), 35);
  assert.equal(reviewInterval({ streak: 9 }, 'solo'), 35);
  assert.equal(reviewInterval({ streak: 3 }, 'help'), 1);
  assert.equal(nextReview({ reviewed: '2026-09-08', rating: 'help', streak: 0 }), '2026-09-09');
  assert.equal(nextReview({ reviewed: '2026-09-08', rating: 'solo', streak: 1 }), '2026-09-11');
  assert.equal(nextReview({ reviewed: '2026-09-08', rating: 'solo', streak: 2 }), '2026-09-15');
  assert.equal(nextReview({ reviewed: '2026-02-27', rating: 'solo', streak: 2 }), '2026-03-06');
  assert.equal(nextReview({}), '');
});
test('normalizeLearning keeps only known projects, migrates old records and sanitizes malformed ones', () => {
  const id = practiceProjects[0].id;
  const normalized = normalizeLearning({
    [id]: { codes: { modify: 'x = 1', create: 42, other: 'y = 2' }, prediction: 'a'.repeat(2000), notes: 7, reflection: 5, answered: 9, rating: 'maybe', reviewed: 'not-a-date', streak: -3 },
    fake: { rating: 'solo', reviewed: '2026-09-08' }
  });
  assert.deepEqual(Object.keys(normalized), [id]);
  assert.deepEqual(normalized[id].codes, { modify: 'x = 1' });
  assert.equal(normalized[id].prediction.length, 1000);
  assert.equal(normalized[id].notes, '');
  assert.equal(normalized[id].reflection, '');
  assert.equal(normalized[id].answered, null);
  assert.equal(normalized[id].rating, '');
  assert.equal(normalized[id].reviewed, '');
  assert.equal(normalized[id].streak, 0);
  // A record saved before graduating intervals existed keeps its solo rating and counts as the first solve.
  const legacy = normalizeLearning({ [id]: { rating: 'solo', reviewed: '2026-09-08' } });
  assert.equal(legacy[id].streak, 1);
  assert.deepEqual(normalizeLearning(null), {});
});
test('practice XP needs understanding plus both code stages and cannot be farmed', () => {
  const project = practiceProjects[0];
  const wrongAnswer = { learning: { [project.id]: { ...trained(project), answered: (project.investigate.answer + 1) % 3 } } };
  const missingStage = { learning: { [project.id]: { answered: project.investigate.answer, passed: ['modify'] } } };
  assert.equal(practiceDone(wrongAnswer.learning[project.id], project), false);
  assert.equal(practiceDone(missingStage.learning[project.id], project), false);
  assert.equal(practiceDone(trained(project), project), true);
  assert.equal(practiceSteps(trained(project), project).filter(s => s.done).length, 3);

  const state = { ...initialState(), learning: { [project.id]: trained(project) } };
  assert.equal(xpTotal(state), practiceXp);
  assert.equal(donePractices(state).length, 1);
  // Repeating the same report never adds a second reward.
  assert.equal(xpTotal({ ...state, learning: { [project.id]: { ...trained(project), rating: 'solo', streak: 4 } } }), practiceXp);
  assert.equal(xpTotal(initialState()), 0);
});
test('a trained miniproject counts once as activity for the streak and survives a backup', () => {
  const project = practiceProjects[1];
  const state = { ...initialState(), learning: { [project.id]: trained(project) } };
  const recorded = recordPractice(state, project.id, '2026-09-08');
  assert.deepEqual(recorded.activities['2026-09-08'], [`practice:${project.id}`]);
  assert.equal(recordPractice(recorded, project.id, '2026-09-08'), recorded);
  assert.equal(recordPractice(state, 'inexistente', '2026-09-08'), state);
  assert.equal(recordPractice({ ...initialState() }, project.id, '2026-09-08').activities['2026-09-08'], undefined);

  const restored = normalizeState({ ...recorded, activities: { ...recorded.activities, '2026-09-08': [`practice:${project.id}`, 'practice:fake'] }, joined: localDate() });
  assert.deepEqual(restored.activities['2026-09-08'], [`practice:${project.id}`]);
  assert.equal(xpTotal(restored), practiceXp);
});

// A etapa "Preveja" comparava a saída do exemplo com ela mesma: batia sempre, e a comemoração
// não dizia nada sobre o estudante. O que vale é a previsão que ele escreveu à mão.
test('a prediction counts as right by what it says, not by exact typing', () => {
  assert.equal(predictionMatches('Pode entrar', 'Pode entrar'), true);
  assert.equal(predictionMatches('pode entrar', 'Pode entrar\n'), true, 'maiúsculas não decidem');
  assert.equal(predictionMatches('Pode entrar!', 'Pode entrar'), true, 'pontuação não decide');
  assert.equal(predictionMatches('acho que vai mostrar Pode entrar', 'Pode entrar'), true, 'vale escrever em volta');
  assert.equal(predictionMatches('1 2 3', '1\n2\n3'), true, 'todas as linhas precisam aparecer');
});
test('a prediction that misses anything is not treated as right', () => {
  assert.equal(predictionMatches('Ainda não', 'Pode entrar'), false);
  assert.equal(predictionMatches('1 2', '1\n2\n3'), false, 'faltando uma linha não vale');
  assert.equal(predictionMatches('', 'Pode entrar'), false, 'sem previsão não há acerto');
  assert.equal(predictionMatches('   ', 'Pode entrar'), false);
  assert.equal(predictionMatches('Pode entrar', ''), false, 'sem saída não há o que comparar');
  assert.equal(predictionMatches(undefined, 'Pode entrar'), false);
});

// Uma auditoria achou um miniprojeto cuja etapa "Crie" esperava a mesma saída da etapa
// "Mude": dava para concluir e ganhar os 40 XP colando o código anterior, sem escrever nada
// do que foi pedido. Cada etapa precisa exigir um resultado próprio.
test('no stage can be passed by reusing the previous stage output', () => {
  for (const p of practiceProjects) {
    assert.notEqual(p.modified.trim(), p.expected.trim(), `${p.id}: "Crie" passa com o código de "Mude"`);
    assert.notEqual(p.output.trim(), p.modified.trim(), `${p.id}: "Mude" passa sem editar o exemplo`);
  }
});
