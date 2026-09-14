import test from 'node:test';
import assert from 'node:assert/strict';
import { misturaBloqueada } from '../src/mentor.js';

// Página https pedindo a um endereço http é barrado pelo navegador antes de sair da máquina.
// Tentar assim mesmo enchia o console de erro vermelho a cada abertura do site publicado, e
// demorava para dizer ao estudante o que a tela já sabia explicar.

test('site publicado com Ollama local: nem tenta, responde na hora', () => {
  assert.equal(misturaBloqueada('https:', 'http://127.0.0.1:11434'), true);
});

test('túnel https no site publicado passa', () => {
  assert.equal(misturaBloqueada('https:', 'https://tunel.example.com'), false);
});

test('campus aberto no computador continua falando com o Ollama local', () => {
  assert.equal(misturaBloqueada('http:', 'http://127.0.0.1:11434'), false);
});
