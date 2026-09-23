import test from 'node:test';
import assert from 'node:assert/strict';
import { ensinoDosProjetos } from '../src/project-ensino.js';
import { stepsFor } from '../src/project-steps.js';

// Os passos diziam o que fazer e nunca como. Um projeto com "Como fazer" tem de cobrir todos os
// passos, e cada exemplo precisa mostrar a saída (medida por scripts/check-project-ensino.mjs).
const COMPLETOS = ['calculadora', 'quiz', 'tarefas'];

test('os projetos com "Como fazer" cobrem todos os passos, sem passo inventado', () => {
  for (const [projeto, passos] of Object.entries(ensinoDosProjetos)) {
    const ids = stepsFor(projeto).map(({ id }) => id);
    for (const id of Object.keys(passos)) assert.ok(ids.includes(id), `${projeto}/${id}: passo que não existe`);
    if (COMPLETOS.includes(projeto)) for (const id of ids) assert.ok(passos[id], `${projeto}/${id}: sem "Como fazer"`);
  }
});

test('cada "Como fazer" explica a ideia, mostra um exemplo e a saída dele', () => {
  for (const [projeto, passos] of Object.entries(ensinoDosProjetos)) {
    for (const [id, p] of Object.entries(passos)) {
      assert.ok(p.explica.length >= 80, `${projeto}/${id}: explicação curta demais`);
      assert.ok(p.exemplo.trim() && p.saida.trim(), `${projeto}/${id}: sem exemplo ou saída`);
      assert.doesNotMatch(p.explica, /—/, `${projeto}/${id}: travessão`);
    }
  }
});
