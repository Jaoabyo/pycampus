import test from 'node:test';
import assert from 'node:assert/strict';
import { aulasDaFaculdade, tarefasDaFaculdade, diasAteProva } from '../src/faculdade.js';

test('a revisão da prova cobre todos os slides enviados pelo professor', () => {
  const revisao = aulasDaFaculdade.filter(aula => aula.unidade === 'revisao');
  assert.deepEqual(revisao.map(aula => aula.id), ['r1', 'r2', 'r3', 'r4']);
  for (const assunto of ['condicionais', 'repetição', 'funções', 'web']) {
    assert.ok(revisao.some(aula => aula.origem.toLowerCase().includes(assunto)), assunto);
  }
  assert.ok(revisao.every(aula => aula.naFormacao?.length), 'cada revisão precisa mostrar onde o assunto reaparece na formação geral');
});

test('toda aula informa a relação com a formação geral sem esconder o foco da faculdade', () => {
  assert.ok(aulasDaFaculdade.every(aula => aula.naFormacao?.length), 'faltou mapear uma aula');
  for (const id of ['u2a2', 'u2a4', 'u3a1', 'u3a2', 'u3a3', 'u3a4']) {
    assert.ok(aulasDaFaculdade.find(aula => aula.id === id)?.focoFaculdade, `${id} precisa dizer o que é específico da faculdade`);
  }
});

test('as aplicações dos quatro slides ficam agrupadas na revisão da prova', () => {
  const tarefas = tarefasDaFaculdade.filter(tarefa => tarefa.unidade === 'revisao');
  assert.deepEqual(tarefas.map(tarefa => tarefa.id), ['t-condicionais', 't-repeticao', 't-funcoes', 't-web']);
});

test('a contagem do prazo usa dias civis e chega a zero em 27 de setembro', () => {
  assert.equal(diasAteProva(new Date(2026, 8, 17, 23, 30)), 10);
  assert.equal(diasAteProva(new Date(2026, 8, 27, 8, 0)), 0);
  assert.equal(diasAteProva(new Date(2026, 8, 28, 8, 0)), -1);
});
