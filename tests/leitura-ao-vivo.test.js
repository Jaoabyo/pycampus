import test from 'node:test';
import assert from 'node:assert/strict';
import { lerCodigo } from '../src/leitura-ao-vivo.js';

const NL = String.fromCharCode(10);
const codigo = (...linhas) => linhas.join(NL);

test('parêntese aberto e não fechado', () => {
  assert.match(lerCodigo(codigo('texto = "30"', 'numero = int(texto')).texto, /fechar um \(/);
});

test('aspa aberta e não fechada', () => {
  assert.match(lerCodigo('nome = "Ana').texto, /aspa/);
});

test('dois-pontos faltando no cabeçalho', () => {
  assert.match(lerCodigo(codigo('idade = 20', 'if idade >= 18', '    print("ok")')).texto, /dois-pontos/);
});

test('= no lugar de == dentro da condição', () => {
  assert.match(lerCodigo(codigo('idade = 20', 'if idade = 18:', '    print("ok")')).texto, /==/);
});

test('bloco aberto e linha seguinte sem indentar', () => {
  assert.match(lerCodigo(codigo('for n in range(3):', 'print(n)')).texto, /indentada/);
});

test('variável criada e nunca usada', () => {
  assert.match(lerCodigo(codigo('nome = "Ana"', 'idade = 20', 'print(idade)')).texto, /nome/);
});

test('código certo não recebe observação nenhuma', () => {
  for (const certo of [
    codigo('texto = "30"', 'numero = int(texto)', 'print(numero)'),
    codigo('total = 0', 'for n in range(1, 6):', '    total = total + n', 'print(total)'),
    codigo('def quadrado(numero):', '    return numero * numero', '', 'print(quadrado(7))')
  ]) assert.equal(lerCodigo(certo), null, certo);
});

test('parêntese dentro de texto não conta', () => {
  assert.equal(lerCodigo(codigo('print("abre ( sem fechar")', 'print("ok")')), null);
});

test('comentário citando código não conta', () => {
  assert.equal(lerCodigo(codigo('# aqui vai um int(texto', 'print(1)', 'print(2)')), null);
});

test('linha de continuação dentro de parêntese não cobra dois-pontos', () => {
  assert.equal(lerCodigo(codigo('numeros = [', '    1,', '    2', ']', 'print(numeros)')), null);
});

test('uma observação por vez, nunca uma lista', () => {
  const bagunca = codigo('if x = 1', '    print("a"', 'sobrando = 9');
  const achado = lerCodigo(bagunca);
  assert.ok(achado && typeof achado.texto === 'string');
  assert.ok(Number.isInteger(achado.linha));
});

// A observação do Lumi enquanto o estudante digita. Ele não pediu ajuda, então o limite é mais
// apertado que o do primeiro degrau: qualquer código na frase é a resposta entregue de graça.
const { filtrarObservacao } = await import('../src/leitura-ao-vivo.js');
const meuCodigo = codigo('total = 0', 'for n in range(1, 6):');

test('operador entregue na frase é descartado', () => {
  // Medido na bancada: foi exatamente esta frase que ele produziu num exercício cuja tarefa era
  // essa linha. A trava de chamadas não pegava, porque não há chamada nenhuma ali.
  assert.equal(filtrarObservacao('não reinicie total dentro do laço. total += numero é uma abreviação.', meuCodigo), '');
});

test('observação em palavras, sem código, passa', () => {
  assert.match(filtrarObservacao('Você começou o laço mas ainda não fez nada dentro dele.', meuCodigo), /laço/);
});

test('bloco de código é descartado', () => {
  assert.equal(filtrarObservacao('Faça assim:' + NL + '```python' + NL + 'total += n' + NL + '```', meuCodigo), '');
});

test('função que ele ainda não escreveu é descartada', () => {
  assert.equal(filtrarObservacao('Experimente usar sum(numeros) aqui.', meuCodigo), '');
});

test('"nada" vira silêncio, não vira texto na tela', () => {
  for (const resposta of ['nada', 'Nada.', '', '   ']) assert.equal(filtrarObservacao(resposta, meuCodigo), '');
});

test('observação longa demais não passa: era para ser uma frase', () => {
  assert.equal(filtrarObservacao('a'.repeat(200), meuCodigo), '');
});
