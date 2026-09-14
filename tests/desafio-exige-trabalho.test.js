import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { functionBridges } from '../src/function-bridges.js';
import { projectSteps } from '../src/project-steps.js';

// A aula de entrada mandava converter o texto em inteiro, mas esperava como saída o próprio
// valor digitado: print(input()) passava sem converter nada. Um desafio cuja resposta é a
// entrada de volta não prova aprendizado nenhum.
const ecoa = item => {
  const entrada = String(item.stdin || '').trim();
  const saida = String(item.expected || '').trim();
  if (!entrada || !saida) return false;
  const linhas = entrada.split(String.fromCharCode(10)).map(x => x.trim());
  return saida === entrada || linhas.includes(saida);
};

// Única isenção, e por um motivo específico: neste passo devolver a entrada É a tarefa. Ele
// existe para o estudante ver com os próprios olhos que input() entrega de volta o que foi
// digitado — a descoberta que a etapa seguinte, de conversão, depende de ter acontecido.
const ECO_PROPOSITAL = new Set(['projeto calculadora/pergunta']);

test('nenhum desafio é resolvido devolvendo a entrada sem transformar', () => {
  const itens = [
    ...lessons.map(x => ['aula ' + x.id, x]),
    ...functionBridges.map(x => ['ponte ' + x.id, x]),
    ...Object.entries(projectSteps).flatMap(([p, ss]) => ss.map(s => ['projeto ' + p + '/' + s.id, s]))
  ];
  const frouxos = itens.filter(([onde, item]) => ecoa(item) && !ECO_PROPOSITAL.has(onde)).map(([onde]) => onde);
  assert.deepEqual(frouxos, [], 'a saída esperada é a própria entrada: passa sem fazer o que o enunciado pede');
  // A isenção não pode virar lixo esquecido: se o passo mudar, o teste avisa.
  for (const onde of ECO_PROPOSITAL) {
    assert.ok(itens.some(([nome, item]) => nome === onde && ecoa(item)), `${onde} não ecoa mais: tire a isenção`);
  }
});

test('o desafio da aula de entrada exige mesmo a conversão', () => {
  const aula = lessons.find(l => l.id === 'entrada');
  assert.equal(aula.stdin, '21');
  assert.equal(aula.expected, '22');
  const solucao = aula.puzzle.blocks.map(b => b.code).join(String.fromCharCode(10));
  assert.match(solucao, new RegExp('int' + String.fromCharCode(92) + '('), 'a solução guardada precisa converter');
});
