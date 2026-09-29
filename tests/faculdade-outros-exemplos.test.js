import test from 'node:test';
import assert from 'node:assert/strict';
import { outrosExemplos } from '../src/faculdade-outros-exemplos.js';
import { degrausDaFaculdade } from '../src/faculdade-degraus.js';
import { novidadesDosOutrosExemplos } from '../src/faculdade-novidades.js';

// A saída de cada um é conferida no Pyodide por scripts/check-faculdade-resumo.mjs.
test('cada outro exemplo pertence a um degrau que existe, e explica, mostra e diz a saída', () => {
  for (const [aulaId, porDegrau] of Object.entries(outrosExemplos)) {
    const ids = new Set(degrausDaFaculdade[aulaId]?.degraus.map(({ id }) => id));
    assert.ok(ids.size, `${aulaId}: aula sem degraus`);
    for (const [degrauId, exemplo] of Object.entries(porDegrau)) {
      assert.ok(ids.has(degrauId), `${aulaId}/${degrauId}: degrau que não existe`);
      assert.ok(exemplo.explica.length > 60, `${aulaId}/${degrauId}: explicar`);
      assert.ok(exemplo.codigo.trim() && exemplo.saida.trim(), `${aulaId}/${degrauId}: código e saída`);
      assert.doesNotMatch(exemplo.explica, /—/, `${aulaId}/${degrauId}: travessão`);
      // Um exemplo diferente de verdade, e não o mesmo do degrau.
      assert.notEqual(exemplo.codigo.trim(), degrausDaFaculdade[aulaId].degraus.find(({ id }) => id === degrauId).exemplo.trim());
    }
  }
});

test('as cinco aulas que faltavam antes da prova têm outro exemplo em todos os degraus', () => {
  for (const aulaId of ['u3a4', 'r4', 'u4a2', 'u4a3', 'u4a4']) {
    assert.deepEqual(Object.keys(outrosExemplos[aulaId] || {}).sort(), degrausDaFaculdade[aulaId].degraus.map(({ id }) => id).sort(), aulaId);
  }
});

test('o outro exemplo não usa nada que o degrau e os anteriores ainda não ensinaram', () => {
  const medidos = novidadesDosOutrosExemplos(degrausDaFaculdade, outrosExemplos);
  assert.equal(medidos.length, Object.values(outrosExemplos).reduce((n, porDegrau) => n + Object.keys(porDegrau).length, 0));
  for (const exemplo of medidos) assert.deepEqual(exemplo.semExplicacao, [], `${exemplo.id}: usa algo não ensinado antes`);
});
