import test from 'node:test';
import assert from 'node:assert/strict';
import { additionalPractices } from '../src/additional-practices.js';
import { lessons } from '../src/curriculum.js';

test('each of the last three modules has two practices grounded in its lessons', () => {
  assert.equal(additionalPractices.length, 6);
  assert.equal(new Set(additionalPractices.map(p => p.id)).size, 6);
  const owners = additionalPractices.map(practice => {
    const lesson = lessons.find(l => l.id === practice.prerequisite);
    assert.ok(lesson, practice.id);
    return lesson.moduleId;
  });
  for (const id of ['web', 'qualidade', 'avancado']) {
    assert.equal(owners.filter(owner => owner === id).length, 2, id);
  }
});

test('additional practice puzzles reconstruct the authored programs without losing indentation', () => {
  for (const practice of additionalPractices) {
    const rebuilt = practice.puzzle.blocks.map(({ code, indent }) => {
      assert.ok(Number.isInteger(indent) && indent >= 0, practice.id);
      return '    '.repeat(indent) + code;
    }).join('\n');
    assert.equal(rebuilt, practice.solution.split('\n').filter(line => line.trim()).join('\n'), practice.id);
    assert.ok(practice.puzzle.distractor.length > 0, practice.id);
    assert.ok(!practice.puzzle.blocks.some(block => block.code === practice.puzzle.distractor), practice.id);
    assert.equal(practice.investigate.options.length, 3, practice.id);
    assert.ok(practice.investigate.answer >= 0 && practice.investigate.answer < 3, practice.id);
    assert.ok(practice.example.includes(practice.investigate.line), practice.id);
    for (const key of ['story', 'modify', 'modified', 'create', 'expected', 'hint']) {
      assert.ok(typeof practice[key] === 'string' && practice[key].length > 0, `${practice.id}: ${key}`);
    }
  }
});

test('the new practices do not require servers, third-party packages or untaught syntax', () => {
  const byId = Object.fromEntries(additionalPractices.map(p => [p.id, p]));
  const source = additionalPractices.map(p => `${p.example}\n${p.solution}`).join('\n');
  assert.doesNotMatch(source, /FastAPI|requests|pytest|pandas|asyncio|open\(|input\(/);
  assert.ok(byId['resposta-api'].story.includes('ainda não precisa criar um servidor'));
  assert.ok(byId['regra-testada'].solution.includes('assert triplo(0) == 0'));
  assert.ok(byId['regra-testada'].solution.includes('assert triplo(4) == 12'));
  assert.ok(byId['numeros-em-etapas'].solution.includes('yield numero * 2'));
  assert.ok(byId['valor-do-meio'].solution.includes('from statistics import median'));
});
