import test from 'node:test';
import assert from 'node:assert/strict';
import { faltaEntrada } from '../src/useTrackedPython.js';
import { lessons } from '../src/curriculum.js';
import { projectSteps } from '../src/project-steps.js';

// A aula 6 quebrou porque o estudante escreveu o código certo, input() devolveu texto vazio e
// int('') estourou. O erro não era dele: era da plataforma mandar responder algo que, no
// endereço publicado, não dá para responder. Estes testes existem para isso não voltar.

test("codigo com input e sem resposta preparada nao chega a executar", () => {
  const codigo = ['texto = input("Qual sua idade? ")', 'print(int(texto))'].join(String.fromCharCode(10));
  assert.equal(faltaEntrada(codigo, ''), true);
});

test('com a resposta preenchida, executa normalmente', () => {
  assert.equal(faltaEntrada('texto = input()', '21'), false);
});

test("input citado dentro de comentario nao bloqueia nada", () => {
  const codigo = ['# depois vamos usar input() aqui', 'print(2)'].join(String.fromCharCode(10));
  assert.equal(faltaEntrada(codigo, ''), false);
});

test('todo passo de projeto que manda responder algo declara a resposta', () => {
  const pendentes = [];
  for (const [projeto, passos] of Object.entries(projectSteps)) {
    for (const passo of passos) {
      const manda = /Responda |respondendo /.test(String(passo.instruction));
      if (manda && !String(passo.stdin || '').trim()) pendentes.push(projeto + '/' + passo.id);
    }
  }
  assert.deepEqual(pendentes, []);
});

test('toda aula que manda responder um valor declara esse valor', () => {
  const pendentes = lessons
    .filter(l => new RegExp("input\\s*\\(").test(String(l.example) + String(l.starter) + String(l.challenge)))
    .filter(l => !String(l.stdin || '').trim())
    .map(l => l.id);
  assert.deepEqual(pendentes, []);
});
