import test from 'node:test';
import assert from 'node:assert/strict';
import { explanationPrompt, parseExplanationReview } from '../src/explanation-review.js';

// A plataforma pedia explicação escrita em quatro telas e nunca respondia nada. O Lumi passou
// a ler e comentar — mas comentar não é aprovar: nada aqui concede XP nem conclui etapa.
const valid = { acertou: ['Viu que o print mostra o valor'], faltou: ['Não disse o que a atribuição faz'], pergunta: 'O que a primeira linha guarda?' };

test('a review always says something useful, or it is refused', () => {
  const review = parseExplanationReview(JSON.stringify(valid));
  assert.deepEqual(review.acertou, valid.acertou);
  assert.equal(review.pergunta, valid.pergunta);
  assert.throws(() => parseExplanationReview('não sei responder'), /não consegui ler/i);
  assert.throws(() => parseExplanationReview(JSON.stringify({ pergunta: 'e daí?' })), /voltou vazia/i);
  // Só um dos lados já basta: uma explicação impecável pode não ter o que faltar.
  assert.equal(parseExplanationReview(JSON.stringify({ acertou: ['tudo certo'] })).faltou.length, 0);
});
test('a talkative model cannot flood the screen', () => {
  const wordy = parseExplanationReview(JSON.stringify({ acertou: Array(9).fill('a'.repeat(600)), faltou: Array(9).fill('b'), pergunta: 'c'.repeat(600) }));
  assert.equal(wordy.acertou.length, 2);
  assert.equal(wordy.faltou.length, 2);
  assert.equal(wordy.acertou[0].length, 240);
  assert.equal(wordy.pergunta.length, 240);
});
test('the prompt tells the model to comment, never to grade or to write the answer', () => {
  const { system, user } = explanationPrompt({ subject: 'Explicar a linha nome = "Ana"', reference: 'nome = "Ana"\nprint(nome)', explanation: 'mostra o nome' });
  assert.ok(system.includes('não dar nota nem aprovar'));
  assert.ok(system.includes('Não escreva a explicação pronta no lugar dele'));
  assert.ok(user.includes('nome = "Ana"') && user.includes('mostra o nome'));
});
