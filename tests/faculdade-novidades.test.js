import test from 'node:test';
import assert from 'node:assert/strict';
import { novidadesDoMaterial, novidadesDasEntregas, termosDoCodigo } from '../src/faculdade-novidades.js';
import { pontesDasAulas, pontesDasEntregas } from '../src/faculdade-pontes.js';
import { entregasDaFaculdade } from '../src/faculdade-entregas.js';

test('o medidor reconhece o que é ferramenta e ignora o que o exemplo cria', () => {
  const termos = termosDoCodigo([
    'import matplotlib.pyplot as plt',
    'meses = ["Jan", "Fev"]',
    'plt.bar(meses, [1, 2], color="red")',
    'perda, acuracia = modelo(meses)',
    'cursor.execute("UPDATE t SET a = 1")',
  ].join('\n'));
  for (const esperado of ['matplotlib.pyplot', '.bar', 'color=', 'modelo()', 'SQL UPDATE', 'SQL SET']) {
    assert.ok(termos.has(esperado), esperado);
  }
  // Variáveis do próprio exemplo e atribuições com vírgula não são ferramentas novas.
  for (const ausente of ['meses()', 'acuracia=', 'perda=', 'plt()']) assert.ok(!termos.has(ausente), ausente);
});

test('o y= de df.plot é parâmetro mesmo quando o exemplo tem uma variável y', () => {
  const termos = termosDoCodigo('y = [1, 2]\ndf.plot(x="a", y="b", kind="bar")');
  assert.ok(termos.has('y='));
  assert.ok(termos.has('kind='));
});

test('todo termo novo do código do professor tem ponte, e nenhuma ponte sobra', () => {
  for (const aula of novidadesDoMaterial()) {
    assert.deepEqual(aula.semPonte, [], `${aula.id}: sem explicação antes do exemplo`);
    assert.deepEqual(aula.pontesSobrando, [], `${aula.id}: ponte para algo que o exemplo não usa`);
  }
});

test('todo termo novo dos passos das entregas tem ponte, e nenhuma ponte sobra', () => {
  for (const entrega of novidadesDasEntregas(entregasDaFaculdade)) {
    for (const passo of entrega.passos) {
      assert.deepEqual(passo.semPonte, [], `${passo.id}: sem explicação no passo`);
      assert.deepEqual(passo.pontesSobrando, [], `${passo.id}: ponte para algo que o passo não usa`);
    }
  }
});

test('as pontes apontam para aulas e passos que existem, com texto que se sustenta', () => {
  const aulas = new Set(novidadesDoMaterial().map(({ id }) => id));
  const passos = new Set(entregasDaFaculdade.flatMap(({ passos: p }) => p.map(({ id }) => id)));
  for (const id of Object.keys(pontesDasAulas)) assert.ok(aulas.has(id), id);
  for (const id of Object.keys(pontesDasEntregas)) assert.ok(passos.has(id), id);
  for (const ponte of [...Object.values(pontesDasAulas), ...Object.values(pontesDasEntregas)].flat()) {
    assert.ok(ponte.mostra.trim(), ponte.termos.join());
    assert.ok(ponte.explicacao.length >= 40, `${ponte.mostra}: explicação curta demais`);
    // O resto do PyCampus evita travessão; a ponte é lida por quem está começando.
    assert.doesNotMatch(ponte.explicacao, /—/, ponte.mostra);
  }
});
