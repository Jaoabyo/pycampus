import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeReply, mentorPrompt, mentorSteps, localHelp, taughtUpTo, MAX_LEVEL } from '../src/mentor.js';
import { lessons } from '../src/curriculum.js';

const context = {
  title: 'Textos, números e booleanos',
  challenge: 'Converta o texto "21" para inteiro.',
  expected: '21',
  code: 'texto = "21"\nprint(numero + texto)',
  output: 'Traceback (most recent call last):\n  File "<exec>", line 2, in <module>\nTypeError: unsupported operand type(s) for +: \'int\' and \'str\'',
  taught: taughtUpTo('tipos')
};
const block = '```python\ntexto = "21"\nnumero = int(texto)\nprint(numero)\n```';

// A promessa ao estudante é "não entrego a resposta de cara". Confiar nisso ao modelo seria
// ingênuo: ele desobedece. A trava é aqui, e é isto que estes testes protegem.
test('the first two rungs never let code through, no matter what the model answers', () => {
  const clean = sanitizeReply(`Olhe a linha 2.\n${block}\nEntendeu?`, 2);
  assert.ok(!clean.includes('int(texto)'), 'degrau 2 vazou código');
  assert.ok(clean.includes('próximo degrau'), 'degrau 2 deveria explicar por que guardou o código');
  assert.ok(clean.includes('Olhe a linha 2.'), 'no degrau 2 o texto em volta sobrevive');
  assert.ok(!sanitizeReply(`Olhe a linha 2.\n${block}\nEntendeu?`, 1).includes('int(texto)'), 'degrau 1 vazou código');
});
// O degrau 1 promete só uma pergunta. O modelo cumpriu em dois de três testes e no terceiro
// entregou a correção antes de perguntar — por isso a regra é aplicada no código.
test('the first rung delivers a question and nothing else', () => {
  assert.equal(sanitizeReply('Você esqueceu as aspas. O que a linha deveria mostrar?', 1), 'O que a linha deveria mostrar?');
  assert.equal(sanitizeReply('O que você queria que essa linha fizesse?', 1), 'O que você queria que essa linha fizesse?');
  // Sem pergunta nenhuma é porque o modelo só afirmou: nada chega à tela, e a ajuda escrita basta.
  assert.equal(sanitizeReply('Basta colocar aspas em volta do texto.', 1), '');
  assert.equal(sanitizeReply('Troque para print("Olá"). Pronto.', 1), '');
});
test('the third rung allows a short example but not a finished program', () => {
  assert.ok(sanitizeReply('Assim:\n```python\nn = int("7")\n```', 3).includes('n = int("7")'), 'duas linhas ou menos podem passar');
  assert.ok(!sanitizeReply(`Assim:\n${block}`, 3).includes('int(texto)'), 'um programa de três linhas não pode passar no degrau 3');
});
test('the last rung delivers the answer, because that was the promise', () => {
  assert.equal(sanitizeReply(block, MAX_LEVEL), block);
  assert.equal(sanitizeReply('', 1), '');
  assert.equal(sanitizeReply(null, 1), '');
});
test('an unclosed code block is still caught, not leaked through a missing fence', () => {
  const clean = sanitizeReply('Veja:\n```python\ntexto = "21"\nnumero = int(texto)\nprint(numero)', 1);
  assert.ok(!clean.includes('int(texto)'));
});
test('the prompt only ever offers concepts the student has already seen', () => {
  const { system, user } = mentorPrompt(context, 1);
  assert.ok(system.includes('Textos, números e booleanos'));
  assert.ok(!system.includes('Compreensões'), 'assunto de módulo posterior não pode entrar no prompt');
  assert.ok(system.includes('Degrau de ajuda atual: 1 de 4'));
  assert.ok(/proibido[^.]*escrever código/.test(system), 'o degrau 1 precisa proibir código no prompt');
  assert.ok(system.includes('UMA ÚNICA pergunta'), 'o degrau 1 pede uma pergunta e nada mais');
  assert.ok(user.includes(context.code) && user.includes('TypeError'), 'o modelo precisa ver o código e o erro reais');
  assert.ok(mentorPrompt(context, MAX_LEVEL).system.includes('Mostre o código corrigido'), 'o último degrau entrega a resposta');
});
test('a free question from the student reaches the model without replacing the context', () => {
  const { user } = mentorPrompt(context, 2, 'o que é uma string?');
  assert.ok(user.includes('o que é uma string?') && user.includes(context.code));
});
test('taughtUpTo stops at the current lesson and never leaks what comes next', () => {
  const upToThird = taughtUpTo('tipos');
  assert.equal(upToThird.length, 3);
  assert.equal(upToThird.at(-1), lessons[2].title);
  // Uma atividade sem aula de origem (laboratório livre) pode contar com tudo.
  assert.equal(taughtUpTo('').length, lessons.length);
});
test('every rung has guaranteed written help that works with no AI running', () => {
  for (const { level } of mentorSteps) {
    const lines = localHelp(context, level);
    assert.ok(lines.length > 0 && lines.every(line => typeof line === 'string' && line.length > 20), `degrau ${level} sem ajuda própria`);
  }
  assert.ok(localHelp(context, 1).join(' ').includes('TypeError'));
  // Quando não houve erro de Python, a ajuda fala de comparar a saída, não inventa um erro.
  const noError = localHelp({ ...context, output: '20' }, 1).join(' ');
  assert.ok(noError.includes('sem erro') && !noError.includes('TypeError'));
});
test('the four rungs are ordered and each one says what it reveals', () => {
  assert.deepEqual(mentorSteps.map(step => step.level), [1, 2, 3, 4]);
  assert.ok(mentorSteps.every(step => step.label.length > 5 && step.reveals.length > 20));
});
