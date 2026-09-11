import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, projects, modules } from '../src/curriculum.js';
import { initialState, normalizeState, xpTotal } from '../src/progress.js';
test('all lesson prerequisites exist earlier in the learning path', () => {
  for (const [index, lesson] of lessons.entries()) {
    for (const required of lesson.prerequisites) {
      const position = lessons.findIndex(l => l.id === required);
      assert.ok(position >= 0 && position < index, `${lesson.id} requires ${required} before teaching it`);
    }
    assert.ok(lesson.objective.length > 20, lesson.id);
    assert.ok(lesson.walkthrough.length >= 2, lesson.id);
    assert.ok(lesson.hints.length >= 2, lesson.id);
    for (const step of lesson.walkthrough) assert.ok(lesson.example.includes(step.code), `${lesson.id}: guide is out of sync with example: ${step.code}`);
  }
});
test('types practice no longer asks for arithmetic before the operators lesson', () => {
  const types = lessons.find(l => l.id === 'tipos');
  assert.equal(types.expected, "21\n<class 'int'>");
  assert.ok(!/[+*/]/.test(types.example));
  assert.ok(!types.challenge.includes('multiplique'));
  assert.ok(types.walkthrough.some(s => s.code === 'numero = int(texto)'));
  assert.ok(types.walkthrough.some(s => s.code === 'print(type(numero))'));
});
test('early exercises use syntax taught by their worked examples', () => {
  assert.ok(lessons.find(l => l.id === 'for').example.includes('total = total + numero'));
  assert.ok(!lessons.find(l => l.id === 'decomposicao').example.includes('['));
  assert.ok(!lessons.find(l => l.id === 'booleanos').challenge.includes('senha'));
  assert.ok(lessons.find(l => l.id === 'entrada').example.includes('input()'));
  assert.equal(lessons.find(l => l.id === 'entrada').stdin, '21');
  assert.ok(!lessons.find(l => l.id === 'rest').example.includes('next('));
  assert.ok(!lessons.find(l => l.id === 'encapsulamento').example.includes('raise'));
});
test('project prerequisites are taught by the project stage and extensions are explicit', () => {
  for (const p of projects) {
    const available = new Set(modules.slice(0, p.module + 1).flatMap(m => m.lessons.map(l => l.id)));
    for (const id of p.prerequisites) assert.ok(available.has(id), `${p.id}: ${id}`);
    assert.ok(p.preparation.length > 80);
    assert.ok(p.extensions.length > 30);
    assert.equal(p.requirements.length, 5);
  }
  assert.ok(!projects[0].requirements.some(r => /erros|inválid|positivo/.test(r)));
});
test('revision migration preserves old code, completions, project checks and XP', () => {
  const old = { ...initialState(), completed: ['ola', 'tipos'], codes: { tipos: 'texto = int("21")\nprint(texto * 2)' }, projectChecks: { calculadora: [0, 1, 2, 3, 4] } };
  const restored = normalizeState(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(restored.codes, old.codes);
  assert.deepEqual(restored.completed, old.completed);
  assert.equal(xpTotal(restored), xpTotal(old));
  assert.equal(restored.codeRevisions.tipos, undefined);
  restored.codeRevisions.tipos = 2;
  assert.equal(normalizeState(restored).codeRevisions.tipos, 2);
});
