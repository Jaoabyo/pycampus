import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, completeLesson } from '../src/progress.js';
import { montarRelatorio } from '../src/relatorio.js';

// Deixar um modelo aprovar exercício é uma escolha do estudante, tomada de olhos abertos. A
// contrapartida é que toda aprovação dele fique registrada e apareça no relatório: aprovação
// de IA precisa poder ser conferida por gente depois.

test('a conclusão liberada pelo Lumi guarda o motivo e o código', () => {
  const antes = initialState();
  const depois = completeLesson(antes, 'ola', '2026-09-14', { porque: 'Lê a entrada e converte antes de somar.', codigo: 'print(int(input()) + 1)' });
  assert.ok(depois.completed.includes('ola'));
  const registro = depois.liberacoesDoLumi.ola;
  assert.equal(registro.data, '2026-09-14');
  assert.match(registro.porque, /converte/);
  assert.match(registro.codigo, /input/);
});

test('conclusão pela conferência automática não inventa registro de liberação', () => {
  const depois = completeLesson(initialState(), 'ola', '2026-09-14');
  assert.deepEqual(depois.liberacoesDoLumi, {});
});

test('o relatório mostra o que o Lumi liberou, para eu poder discordar', () => {
  const estado = completeLesson(initialState(), 'ola', '2026-09-14', { porque: 'Resolveu de outro jeito, mas cumpre.', codigo: 'print("Meu primeiro programa em Python!")' });
  const texto = montarRelatorio(estado, '2026-09-14');
  assert.match(texto, /liberadas pelo Lumi/);
  assert.match(texto, /Resolveu de outro jeito, mas cumpre/);
  assert.match(texto, /Meu primeiro programa/);
});

test('sem liberação nenhuma, o relatório diz isso em vez de omitir a seção', () => {
  const texto = montarRelatorio(initialState(), '2026-09-14');
  assert.match(texto, /tudo o que concluí passou pela conferência automática/);
});
