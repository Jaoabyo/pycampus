import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { explanationPrompt, parseExplanationReview, referenciaDaLinhaEscolhida } from '../src/explanation-review.js';

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
  const { system, user } = explanationPrompt({ subject: 'Explicar a linha nome = "Ana"', enunciado: 'O que muda com ou sem aspas?', reference: 'nome = "Ana"\nprint(nome)', explanation: 'mostra o nome' });
  assert.ok(system.includes('não dar nota nem aprovar'));
  assert.ok(system.includes('Não escreva a explicação pronta no lugar dele'));
  assert.ok(user.includes('nome = "Ana"') && user.includes('mostra o nome'));
  assert.ok(user.includes('O que muda com ou sem aspas?'), 'o enunciado inteiro precisa chegar à leitura');
  assert.match(system, /escolher uma linha, basta explicar uma linha/, 'uma escolha não pode virar cobrança do código inteiro');
});

test('a reflexão do miniprojeto envia ao Lumi a mesma pergunta mostrada ao estudante', () => {
  const fonte = readFileSync(new URL('../src/PracticeStudio.jsx', import.meta.url), 'utf8');
  assert.match(fonte, /const reflectionQuestion = 'Escolha uma linha/);
  assert.match(fonte, /<ExplainReview[^>]+enunciado=\{reflectionQuestion\}/);
  assert.doesNotMatch(fonte, /<ExplainReview[^>]+enunciado=\{p\.create\}[^>]+explanation=\{item\.reflection\}/);
});

test('quando o estudante escolhe a linha com and, a linha com or deixa de ser alvo', () => {
  const reference = ['idade = 16', 'ingresso = True', 'print(idade >= 18 and ingresso)', 'print(idade >= 18 or ingresso)'].join('\n');
  const enunciado = 'Escolha uma linha do código acima e explique o que ela faz. O que mudaria na saída se você trocasse um valor?';
  const explanation = 'Se trocarmos idade >= 18 and ingresso para idade >= 16 and ingresso, o resultado muda para True.';
  const alvo = referenciaDaLinhaEscolhida(reference, explanation, enunciado);
  assert.match(alvo, /idade >= 18 and ingresso/);
  assert.doesNotMatch(alvo, /idade >= 18 or ingresso/);
  assert.match(explanationPrompt({ subject: 'x', reference, explanation, enunciado }).user, /Linha escolhida pelo estudante/);
});

test('uma explicação completa nunca recebe uma pergunta sobre o que já explicou', () => {
  const respostaDoCasoReal = {
    suficiente: true,
    acertou: ['Explicou o if-else e o que acontece acima, abaixo e exatamente em 18.'],
    faltou: [],
    pergunta: 'O que aconteceria se a idade fosse exatamente 18 anos?'
  };
  const review = parseExplanationReview(JSON.stringify(respostaDoCasoReal));
  assert.equal(review.suficiente, true);
  assert.equal(review.pergunta, '');
});

// Medido 3 de 3 vezes com uma explicação real do estudante: o modelo copiava o espaço
// reservado do formato e a tela imprimia "até duas frases" sob "Você acertou", como elogio.
test('o eco do formato não vira comentário na tela', () => {
  const soMolde = JSON.stringify({ suficiente: true, acertou: ['até duas frases'], faltou: [], pergunta: 'uma pergunta' });
  assert.throws(() => parseExplanationReview(soMolde), /voltou vazia/);

  const misturado = JSON.stringify({ suficiente: false, acertou: ['<frase sua>', 'Você viu que o print só mostra.'], faltou: ['...'], pergunta: 'O que muda sem o print?' });
  const review = parseExplanationReview(misturado);
  assert.deepEqual(review.acertou, ['Você viu que o print só mostra.']);
  assert.deepEqual(review.faltou, []);
  assert.equal(review.pergunta, 'O que muda sem o print?');
});

test('o formato pedido ao modelo não oferece mais um texto copiável', () => {
  const { system } = explanationPrompt({ subject: 'x', reference: 'print(1)', explanation: 'porque sim' });
  assert.doesNotMatch(system, /até duas frases"\]/, 'o espaço reservado voltou para dentro do JSON de exemplo');
  assert.match(system, /<frase sua>/);
});
