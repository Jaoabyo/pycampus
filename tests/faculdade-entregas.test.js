import test from 'node:test';
import assert from 'node:assert/strict';
import {
  entregasDaFaculdade,
  entregaDaFaculdade,
  requisitosFaltandoDaEntrega,
} from '../src/faculdade-entregas.js';

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
