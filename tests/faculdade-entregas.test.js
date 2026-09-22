import test from 'node:test';
import assert from 'node:assert/strict';
import {
  entregasDaFaculdade,
  entregaDaFaculdade,
  requisitosFaltandoDaEntrega,
} from '../src/faculdade-entregas.js';
import { solucoesEntregasFaculdade } from './faculdade-entregas-reference.js';

test('expõe as quatro entregas oficiais na ordem das unidades', () => {
  assert.deepEqual(
    entregasDaFaculdade.map(({ id }) => id),
    ['entrega-u1', 'entrega-u2', 'entrega-u3', 'entrega-u4'],
  );
  assert.equal(entregaDaFaculdade('entrega-u4').ambienteEntrega, 'colab');
  assert.equal(entregaDaFaculdade('inexistente'), null);
});

test('cada entrega conduz de entendimento até exportação em passos ensináveis', () => {
  for (const entrega of entregasDaFaculdade) {
    assert.deepEqual(
      [...new Set(entrega.passos.map(({ fase }) => fase))],
      ['entender', 'construir', 'testar', 'explicar', 'exportar'],
    );
    assert.ok(entrega.preRequisitos.length > 0, entrega.id);
    assert.ok(entrega.criterios.length > 0, entrega.id);
    for (const passo of entrega.passos) {
      assert.ok(passo.id, `${entrega.id}: passo sem id`);
      assert.ok(passo.explicacao, `${entrega.id}/${passo.id}: sem explicação`);
      assert.ok(passo.exemplo, `${entrega.id}/${passo.id}: sem exemplo`);
      assert.ok(passo.evidencia, `${entrega.id}/${passo.id}: sem evidência`);
    }
  }
});

test('requisitos são derivados do trabalho, não de um campo pronto adulterável', () => {
  const entrega = entregaDaFaculdade('entrega-u1');
  const faltando = requisitosFaltandoDaEntrega(entrega, {
    codigo: 'print("Media: 7.0")',
    passosConcluidos: entrega.passos.map(({ id }) => id),
    pronta: true,
  });
  assert.ok(faltando.some((item) => item.id === 'lista-de-notas'));
});

test('o catálogo representa todos os requisitos oficiais dos quatro roteiros', () => {
  const texto = (id) => {
    const entrega = entregaDaFaculdade(id);
    return [
      entrega.resumo,
      ...entrega.preRequisitos,
      ...entrega.criterios.map(({ descricao }) => descricao),
      ...entrega.testesOrientados,
      ...entrega.entregaveis,
    ].join(' ').toLocaleLowerCase('pt-BR');
  };

  for (const termo of ['lista', 'média', '7', 'relatório']) assert.match(texto('entrega-u1'), new RegExp(termo));
  for (const termo of ['livro', 'cadastro', 'busca', 'gráfico', 'gênero']) assert.match(texto('entrega-u2'), new RegExp(termo));
  for (const termo of ['sqlite', 'pandas', 'matplotlib', 'análise']) assert.match(texto('entrega-u3'), new RegExp(termo));
  for (const termo of ['iris', 'treino', 'normalização', 'tensorflow', 'avaliação', 'predição']) assert.match(texto('entrega-u4'), new RegExp(termo));
});

test('soluções de referência U1 e U2 atendem aos critérios de código', () => {
  for (const id of ['entrega-u1', 'entrega-u2']) {
    const entrega = entregaDaFaculdade(id);
    const trabalho = {
      codigo: solucoesEntregasFaculdade[id],
      passosConcluidos: entrega.passos.map(({ id: passoId }) => passoId),
      logica: 'A entrada é organizada, processada por funções pequenas e então apresentada em um relatório verificável.',
      testes: 'Foram testados o caminho esperado, o limite da regra e uma entrada que não deve ser encontrada ou aprovada.',
      conclusao: 'Os resultados dos casos conferem com as regras e ajudam a localizar qualquer mudança incorreta.',
    };
    assert.deepEqual(
      requisitosFaltandoDaEntrega(entrega, trabalho).filter(({ id: criterioId }) => !['registro-testes', 'explicacao-logica', 'conclusao'].includes(criterioId)),
      [],
      id,
    );
  }
});

test('U1 e U2 dividem conceitos novos em passos pequenos antes de cobrar', () => {
  const u1 = entregaDaFaculdade('entrega-u1').passos.map(({ titulo, explicacao }) => `${titulo} ${explicacao}`).join(' ');
  for (const termo of ['lista', 'for', 'acumulador', 'len', 'média', 'exatamente 7', 'lista vazia']) {
    assert.match(u1.toLocaleLowerCase('pt-BR'), new RegExp(termo.toLocaleLowerCase('pt-BR')), termo);
  }
  const u2 = entregaDaFaculdade('entrega-u2').passos.map(({ titulo, explicacao, exemplo }) => `${titulo} ${explicacao} ${exemplo}`).join(' ');
  for (const termo of ['classe', 'objeto', '__init__', 'self', 'append', 'lower', 'dicionário', 'gráfico', 'inexistente']) {
    assert.match(u2.toLocaleLowerCase('pt-BR'), new RegExp(termo.toLocaleLowerCase('pt-BR')), termo);
  }
});
