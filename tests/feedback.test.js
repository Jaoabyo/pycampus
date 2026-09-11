import test from 'node:test';
import assert from 'node:assert/strict';
import { styleTips } from '../src/style-tips.js';
import { readError, readingSteps } from '../src/error-guide.js';
import { practiceProjects } from '../src/practice-content.js';
import { lessons } from '../src/curriculum.js';

const ids = code => styleTips(code).map(tip => tip.id);

test('style tips stay silent for empty input and for the platform own examples', () => {
  assert.deepEqual(styleTips(''), []);
  assert.deepEqual(styleTips(null), []);
  for (const p of practiceProjects) assert.deepEqual(ids(p.example), [], `${p.id}: o exemplo da oficina deveria ser um bom modelo de estilo`);
  for (const l of lessons) assert.deepEqual(ids(l.example), [], `${l.id}: o exemplo da aula deveria ser um bom modelo de estilo`);
});
test('style tips flag habits that PEP 8 discourages', () => {
  assert.deepEqual(ids('if True:\n\tprint(1)'), ['tabs']);
  assert.deepEqual(ids(`print("${'a'.repeat(80)}")`), ['long-line']);
  assert.deepEqual(ids('nome="Ana"\nprint(nome)'), ['assignment-spacing']);
  assert.deepEqual(ids('ativo = True\nif ativo == True:\n    print(1)'), ['boolean-comparison']);
  assert.deepEqual(ids('total = 1;'), ['semicolon']);
  assert.equal(styleTips('nome="Ana"\nprint(nome)')[0].message.includes('linha 1'), true);
});
test('style tips do not confuse keyword arguments, comparisons or text with assignments', () => {
  assert.deepEqual(ids('precos = [12, 5]\nordenados = sorted(precos, reverse=True)\nprint(ordenados)'), []);
  assert.deepEqual(ids('total = 0\ntotal += 2\nif total == 2:\n    print(total)'), []);
  assert.deepEqual(ids('print("a=1")\n# nome="Ana"'), []);
  assert.deepEqual(ids('def cobrar(horas, taxa=10):\n    return horas * taxa'), []);
});
test('readError only reacts to real tracebacks and names the type, line and next steps', () => {
  assert.equal(readError(''), null);
  assert.equal(readError(null), null);
  assert.equal(readError('Ana'), null);
  assert.equal(readError('Digite um número inteiro'), null);

  const name = readError('Traceback (most recent call last):\n  File "<exec>", line 2, in <module>\nNameError: name \'nome\' is not defined');
  assert.equal(name.type, 'NameError');
  assert.equal(name.line, 2);
  assert.ok(name.title.length > 10);
  assert.ok(name.steps.length >= 3);

  assert.equal(readError('  File "<exec>", line 3\n    print(1\n         ^\nSyntaxError: unexpected EOF while parsing').type, 'SyntaxError');
  assert.equal(readError('ZeroDivisionError: division by zero').type, 'ZeroDivisionError');
  assert.equal(readError('EOFError: EOF when reading a line').steps.some(s => s.includes('Entradas para input()')), true);
  assert.equal(readError('IndentationError: expected an indented block').type, 'IndentationError');

  const unknown = readError('Traceback (most recent call last):\nWeirdCustomError: algo estranho');
  assert.equal(unknown.type, 'WeirdCustomError');
  assert.equal(unknown.title, 'Erro durante a execução');
  assert.ok(readingSteps.length >= 3);
});
test('assignment to input call explains the exact beginner correction', () => {
  const result = readError('Traceback (most recent call last):\n  File "seu_codigo.py", line 3\n    despesa_1 = input() = float(despesa_1)\nSyntaxError: cannot assign to function call');
  assert.equal(result.line, 3);
  assert.ok(result.steps.some(step => step.includes('despesa_1 = float(texto)')));
});
