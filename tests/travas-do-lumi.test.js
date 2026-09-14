import test from 'node:test';
import assert from 'node:assert/strict';
import { entregaSolucao, localHelp, sanitizeReply } from '../src/mentor.js';
import { repeteOEnunciado } from '../src/explanation-review.js';

// Travas descobertas medindo o modelo na bancada (npm run avaliar:lumi-dificil). Cada uma
// veio de uma falha real e repetida; o prompt sozinho não segurava nenhuma delas.

const NL = String.fromCharCode(10);
const codigo = ['total = 0', 'for n in range(1, 5):', '    total = total + n', 'print(total)'].join(NL);

test('o primeiro degrau não entrega função que o estudante ainda não usou', () => {
  assert.equal(entregaSolucao('Já pensou em usar int(texto)?', codigo), true);
});

test('nem o argumento corrigido de uma função que ele já usa', () => {
  assert.equal(entregaSolucao('Tente range(1, 6) no laço.', codigo), true);
});

test('mas pode citar pelo nome o que já está no código dele', () => {
  assert.equal(entregaSolucao('Até onde o range() vai?', codigo), false);
  assert.equal(entregaSolucao('O que o print(total) mostra?', codigo), false);
});

test('quando a resposta do modelo é descartada, a limpeza devolve vazio', () => {
  assert.equal(sanitizeReply('Use int(texto) para converter, certo?', 1, codigo), '');
  assert.match(sanitizeReply('O que esse laço conta, exatamente?', 1, codigo), /laço/);
});

test('a ajuda escrita do primeiro degrau é sempre uma pergunta', () => {
  for (const saida of ['6', 'TypeError: unsupported operand', '']) {
    assert.match(localHelp({ output: saida }, 1).join(' ').trim(), /[?]$/, `saída ${JSON.stringify(saida)}`);
  }
});

test('copiar o enunciado no campo de explicação não conta como explicar', () => {
  const enunciado = 'Some os números de 1 a 5 usando um laço e mostre apenas o total.';
  assert.equal(repeteOEnunciado(enunciado, enunciado), true);
  assert.equal(repeteOEnunciado('O total começa em zero e o laço soma cada número dentro dele, por isso o resultado só aparece no fim.', enunciado), false);
});
