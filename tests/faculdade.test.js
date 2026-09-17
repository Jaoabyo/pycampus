import test from 'node:test';
import assert from 'node:assert/strict';
import { aulasDaFaculdade, tarefasDaFaculdade, unidades, diasAteProva, requisitosFaltandoDaFaculdade } from '../src/faculdade.js';
import { solucoesDaFaculdade } from './faculdade-reference.js';

test('a trilha cobre as quatro unidades dos oito PDFs', () => {
  assert.deepEqual(unidades.map(unidade => unidade.id), ['u1', 'u2', 'u3', 'u4']);
  assert.deepEqual(aulasDaFaculdade.map(aula => aula.id), [
    'u1a1', 'r1', 'r2', 'r3',
    'u2a1', 'u2a2', 'u2a3', 'u2a4',
    'u3a1', 'u3a2', 'u3a3', 'u3a4',
    'r4', 'u4a2', 'u4a3', 'u4a4'
  ]);
  for (const unidade of unidades) assert.equal(aulasDaFaculdade.filter(aula => aula.unidade === unidade.id).length, 4, unidade.id);
});

test('toda aula informa a relação com a formação geral sem esconder o foco da faculdade', () => {
  assert.ok(aulasDaFaculdade.every(aula => aula.naFormacao?.length), 'faltou mapear uma aula');
  for (const id of ['u2a2', 'u2a4', 'u3a1', 'u3a2', 'u3a3', 'u3a4']) {
    assert.ok(aulasDaFaculdade.find(aula => aula.id === id)?.focoFaculdade, `${id} precisa dizer o que é específico da faculdade`);
  }
});

test('as aplicações maiores dos PDFs aparecem na unidade correspondente', () => {
  for (const unidade of unidades) assert.ok(tarefasDaFaculdade.some(tarefa => tarefa.unidade === unidade.id), unidade.id);
  for (const id of ['t-desconto', 't-mobile', 't-testes', 't-vendas-ml', 't-digitos']) {
    assert.ok(tarefasDaFaculdade.some(tarefa => tarefa.id === id), id);
  }
});

test('saída decorada não passa e a solução de referência usa a lógica pedida', () => {
  for (const aula of aulasDaFaculdade) {
    assert.ok(aula.requisitosCodigo?.length, `${aula.id} sem requisito de lógica`);
    assert.deepEqual(requisitosFaltandoDaFaculdade(aula, solucoesDaFaculdade[aula.id]), [], `${aula.id} recusou a referência`);
    const atalho = `print(${JSON.stringify(aula.esperado)})`;
    assert.ok(requisitosFaltandoDaFaculdade(aula, atalho).length > 0, `${aula.id} aceitou imprimir a resposta pronta`);
  }
});

test('a contagem do prazo usa dias civis e chega a zero em 27 de setembro', () => {
  assert.equal(diasAteProva(new Date(2026, 8, 17, 23, 30)), 10);
  assert.equal(diasAteProva(new Date(2026, 8, 27, 8, 0)), 0);
  assert.equal(diasAteProva(new Date(2026, 8, 28, 8, 0)), -1);
});
