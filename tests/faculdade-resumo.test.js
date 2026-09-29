import test from 'node:test';
import assert from 'node:assert/strict';
import { resumosDaFaculdade } from '../src/faculdade-resumo.js';
import { questoesDeTreino, avaDaAula } from '../src/faculdade-questoes-treino.js';
import { questoesDaAula, questaoDaFaculdade } from '../src/faculdade-questoes.js';
import { aulasDaFaculdade } from '../src/faculdade.js';
import { degrausDaFaculdade } from '../src/faculdade-degraus.js';
import { novidadesDosResumos } from '../src/faculdade-novidades.js';
import { normalizarRevisao } from '../src/faculdade-revisao-estado.js';

// A saída de cada cartão é conferida no Pyodide por scripts/check-faculdade-resumo.mjs.
test('toda aula tem um cartão curto: uma frase, o que não confundir e um código com a saída', () => {
  assert.deepEqual(Object.keys(resumosDaFaculdade).sort(), aulasDaFaculdade.map(({ id }) => id).sort());
  for (const [id, cartao] of Object.entries(resumosDaFaculdade)) {
    assert.ok(cartao.frase.length > 40 && cartao.frase.length < 200, `${id}: a frase precisa ser uma frase, curta`);
    assert.ok(cartao.naoConfunda.length >= 2 && cartao.naoConfunda.length <= 5, `${id}: de 2 a 5 itens para não confundir`);
    assert.ok(cartao.codigo.split('\n').length <= 12, `${id}: código curto`);
    assert.ok(cartao.saida.trim(), `${id}: saída`);
    // O resto do PyCampus evita travessão; o cartão é lido por quem está começando.
    assert.doesNotMatch([cartao.frase, ...cartao.naoConfunda].join(' '), /—/, id);
  }
});

test('o código do cartão só usa o que a aula e as anteriores ensinaram', () => {
  for (const aula of novidadesDosResumos(resumosDaFaculdade, degrausDaFaculdade)) {
    assert.deepEqual(aula.semExplicacao, [], `${aula.id}: usa algo não ensinado antes`);
  }
});

test('as questões de treino seguem o formato do AVA e ficam marcadas como treino', () => {
  const posicoes = new Set();
  for (const [aulaId, lista] of Object.entries(questoesDeTreino)) {
    assert.ok(aulasDaFaculdade.some(({ id }) => id === aulaId), aulaId);
    for (const questao of lista) {
      const noBanco = questaoDaFaculdade(questao.id);
      assert.equal(noBanco.tipo, 'treino', questao.id);
      assert.equal(noBanco.origem, 'Treino no formato do AVA', questao.id);
      assert.equal(noBanco.voltarPara, aulaId, questao.id);
      assert.equal(questao.opcoes.length, 5, `${questao.id}: cinco alternativas`);
      assert.equal(new Set(questao.opcoes).size, 5, `${questao.id}: alternativa repetida`);
      assert.ok(questao.porque.length > 80, `${questao.id}: explicar por que a certa é certa`);
      assert.ok(questao.enunciado.trim().endsWith('?'), `${questao.id}: precisa perguntar`);
      assert.doesNotMatch(questao.porque, /—/, questao.id);
      posicoes.add(questao.resposta);
    }
  }
  assert.equal(posicoes.size, 5, 'a certa aparece em todas as letras, não sempre na mesma');
});

test('na revisão rápida, cada aula tem ao menos três questões, e as do AVA ficam na aula do assunto', () => {
  for (const { id } of aulasDaFaculdade) {
    const questoes = questoesDaAula(id);
    assert.ok(questoes.length >= 3, `${id}: só ${questoes.length} questões`);
    assert.equal(questoes[0].id, `aula:${id}`, `${id}: começa pela revisão da própria aula`);
  }
  const mapeadas = Object.values(avaDaAula).flat();
  assert.equal(new Set(mapeadas).size, 20, 'cada questão do AVA aparece em uma aula só, e todas aparecem');
  for (const id of mapeadas) assert.equal(questaoDaFaculdade(id)?.tipo, 'ava', id);
});

test('a resposta a uma questão de treino sobrevive ao backup', () => {
  const registro = { caixa: 1, proxima: '2026-09-30', ultima: '2026-09-29', acertos: 1, erros: 0 };
  assert.deepEqual(Object.keys(normalizarRevisao({ 'treino:u4a4-2': registro, 'treino:inventada': registro })), ['treino:u4a4-2']);
});
