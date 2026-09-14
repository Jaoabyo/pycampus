import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarEnderecoDoLink, definirOllamaUrl, ollamaUrl, OLLAMA_PADRAO } from '../src/mentor.js';

// Abrir o campus com ?ia=... aponta o Lumi para aquele endereço. É comodidade real — o endereço
// do túnel muda toda vez e é impossível de digitar no celular — mas é também para onde o código
// do estudante vai ser enviado. Então o que entra por link é restrito, e nunca em silêncio.

const armazem = () => {
  const dados = new Map();
  return { getItem: c => (dados.has(c) ? dados.get(c) : null), setItem: (c, v) => dados.set(c, String(v)), removeItem: c => dados.delete(c) };
};
test.beforeEach(() => { globalThis.localStorage = armazem(); globalThis.sessionStorage = armazem(); });

test('um endereço https do link é aplicado', () => {
  assert.equal(aplicarEnderecoDoLink('?ia=https://algum-tunel.trycloudflare.com'), 'https://algum-tunel.trycloudflare.com');
  assert.equal(ollamaUrl(), 'https://algum-tunel.trycloudflare.com');
});

test('http de fora é recusado: a página é https e o navegador bloquearia de qualquer forma', () => {
  definirOllamaUrl(OLLAMA_PADRAO);
  assert.equal(aplicarEnderecoDoLink('?ia=http://servidor-qualquer.example.com'), null);
  assert.equal(ollamaUrl(), OLLAMA_PADRAO);
});

test('o computador do próprio estudante continua valendo em http', () => {
  assert.equal(aplicarEnderecoDoLink('?ia=http://127.0.0.1:11434'), 'http://127.0.0.1:11434');
});

test('só a origem entra: caminho, busca e âncora do link são descartados', () => {
  assert.equal(aplicarEnderecoDoLink('?ia=https://tunel.example.com/api/chat?x=1#y'), 'https://tunel.example.com');
});

test('lixo no parâmetro não muda nada', () => {
  definirOllamaUrl(OLLAMA_PADRAO);
  for (const busca of ['', '?ia=', '?ia=nao-e-url', '?outro=coisa', '?ia=javascript:alert(1)']) {
    assert.equal(aplicarEnderecoDoLink(busca), null, busca);
  }
  assert.equal(ollamaUrl(), OLLAMA_PADRAO);
});

test('fica registrado que veio de link, para a tela poder avisar', async () => {
  const { enderecoVeioDeLink } = await import('../src/mentor.js');
  aplicarEnderecoDoLink('?ia=https://tunel.example.com');
  assert.equal(enderecoVeioDeLink(), 'https://tunel.example.com');
});
