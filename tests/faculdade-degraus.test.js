import test from 'node:test';
import assert from 'node:assert/strict';
import { degrausDaFaculdade, separarSonda, MARCA_DA_SONDA } from '../src/faculdade-degraus.js';
import { normalizarDegraus, MAXIMO_DE_DEGRAUS } from '../src/faculdade-degraus-estado.js';
import { aulasDaFaculdade } from '../src/faculdade.js';
import { entregasDaFaculdade } from '../src/faculdade-entregas.js';

test('a linha da sonda sai da saída que o estudante vê', () => {
  const { saida, sonda } = separarSonda(`pronto\n\n${MARCA_DA_SONDA}{"conexoes": 1}\n`);
  assert.equal(saida, 'pronto');
  assert.deepEqual(sonda, { conexoes: 1 });
  assert.equal(separarSonda(`\n${MARCA_DA_SONDA}{}`).saida, '(O programa terminou sem saída.)');
  assert.deepEqual(separarSonda('sem sonda'), { saida: 'sem sonda', sonda: null });
});

test('o progresso salvo dos degraus volta limpo de um backup', () => {
  const limpo = normalizarDegraus({
    u2a4: { feitos: 99, codigo: 'x'.repeat(30000) },
    u3a1: { feitos: -3, codigo: 42 },
    inventada: { feitos: 1, codigo: 'a' },
  });
  assert.equal(limpo.u2a4.feitos, MAXIMO_DE_DEGRAUS);
  assert.equal(limpo.u2a4.codigo.length, 20000);
  assert.equal(limpo.u3a1.feitos, 0);
  assert.equal(limpo.u3a1.codigo, undefined);
  assert.ok(!('inventada' in limpo));
});

test('cada trilha de degraus pertence a uma aula e cada degrau ensina, mostra e pede', () => {
  const ids = new Set([...aulasDaFaculdade, ...entregasDaFaculdade].map(({ id }) => id));
  for (const [aulaId, trilha] of Object.entries(degrausDaFaculdade)) {
    assert.ok(ids.has(aulaId), aulaId);
    assert.ok(trilha.degraus.length <= MAXIMO_DE_DEGRAUS, `${aulaId}: degraus demais para o que o progresso guarda`);
    assert.ok(trilha.conclusao?.length > 40, `${aulaId}: conclusão`);
    assert.equal(new Set(trilha.degraus.map(({ id }) => id)).size, trilha.degraus.length, `${aulaId}: ids repetidos`);
    for (const degrau of trilha.degraus) {
      for (const campo of ['titulo', 'ensina', 'exemplo', 'pedido']) assert.ok(degrau[campo]?.trim(), `${aulaId}/${degrau.id}: ${campo}`);
      assert.equal(typeof degrau.conferir, 'function');
      assert.doesNotMatch(`${degrau.ensina} ${degrau.pedido}`, /—/, `${aulaId}/${degrau.id}: travessão`);
    }
  }
});

test('sem execução, nenhum degrau aprova', () => {
  for (const trilha of Object.values(degrausDaFaculdade)) {
    for (const degrau of trilha.degraus) {
      assert.equal(degrau.conferir({ graficos: [], codigo: '', saida: '', banco: null, sonda: null }).ok, false, degrau.id);
    }
  }
});
