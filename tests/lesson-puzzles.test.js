import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { functionBridges } from '../src/function-bridges.js';
import { shuffledPieces, puzzleSolved } from '../src/parsons.js';
import { referenceSolution } from './curriculum-solutions.js';
import { functionBridgeSolutions } from './function-bridge-reference.js';

const rebuild = puzzle => puzzle.blocks.map(block => `${'    '.repeat(block.indent)}${block.code}`).join('\n');
const withoutBlankLines = code => code.split('\n').filter(line => line.trim()).join('\n');
const puzzles = [...lessons, ...functionBridges].filter(item => item.puzzle);

test('only the single-line first lesson goes without a puzzle', () => {
  const semPuzzle = [...lessons, ...functionBridges].filter(item => !item.puzzle);
  assert.deepEqual(semPuzzle.map(item => item.id), ['ola'], 'toda atividade com duas linhas ou mais precisa de quebra-cabeça');
});

// A prova de que o quebra-cabeça não ensina errado: os blocos precisam reconstruir a mesma
// solução que já roda no Pyodide de verdade, escrita de forma independente em tests/.
test('every lesson puzzle rebuilds the reference solution already verified in Pyodide', () => {
  for (const lesson of lessons.filter(item => item.puzzle)) {
    assert.equal(rebuild(lesson.puzzle), withoutBlankLines(referenceSolution(lesson)), `${lesson.id}: os blocos não reconstroem a solução`);
  }
});
test('every function bridge puzzle rebuilds its reference solution', () => {
  for (const bridge of functionBridges) {
    assert.equal(rebuild(bridge.puzzle), withoutBlankLines(functionBridgeSolutions[bridge.id]), `${bridge.id}: os blocos não reconstroem a solução`);
  }
});
test('every puzzle piece is a clean line and every puzzle carries one plausible wrong piece', () => {
  for (const item of puzzles) {
    const { blocks, distractor } = item.puzzle;
    assert.ok(blocks.length >= 2, `${item.id}: ${blocks.length} bloco(s), pouco para montar`);
    assert.ok(blocks.every(block => block.code === block.code.trim() && block.indent >= 0 && block.indent <= 3), `${item.id}: bloco mal formado`);
    assert.ok(distractor, `${item.id}: falta o distrator`);
    // Ser parecido com uma linha certa é o objetivo; ser igual a uma delas tornaria o exercício insolúvel.
    assert.ok(!blocks.some(block => block.code === distractor), `${item.id}: o distrator é uma linha da solução`);
  }
});
test('pieces come shuffled, never already solved, and stay the same on every visit', () => {
  for (const item of puzzles) {
    const pieces = shuffledPieces(item);
    assert.equal(pieces.length, item.puzzle.blocks.length + 1, item.id);
    assert.equal(pieces.filter(piece => piece.extra).length, 1, item.id);
    assert.equal(new Set(pieces.map(piece => piece.id)).size, pieces.length, `${item.id}: peça duplicada`);
    assert.deepEqual(shuffledPieces(item).map(piece => piece.id), pieces.map(piece => piece.id), `${item.id}: embaralhamento instável`);
    assert.notDeepEqual(pieces.map(piece => piece.id), pieces.map((_, i) => i), `${item.id}: peças já em ordem`);
  }
});
test('a lesson puzzle only counts as solved with the right order and the right indentation', () => {
  const lesson = puzzles.find(item => item.puzzle.blocks.some(block => block.indent > 0));
  assert.equal(puzzleSolved(lesson.puzzle.blocks, lesson), true);
  assert.equal(puzzleSolved([], lesson), false);
  assert.equal(puzzleSolved(lesson.puzzle.blocks.slice(0, -1), lesson), false);
  assert.equal(puzzleSolved([...lesson.puzzle.blocks].reverse(), lesson), false);
  assert.equal(puzzleSolved(lesson.puzzle.blocks.map(block => ({ ...block, indent: 0 })), lesson), false, 'indentação errada não pode passar');
});
