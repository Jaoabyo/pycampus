import test from 'node:test';
import assert from 'node:assert/strict';
import {
  conferenciasDoPasso,
  lerConferencias,
  programaComConferencias,
  situacaoDasConferencias,
} from '../src/faculdade-conferencias.js';
import { entregasDaFaculdade, entregaDaFaculdade } from '../src/faculdade-entregas.js';

test('sem conferências o programa do estudante é enviado intacto', () => {
  assert.equal(programaComConferencias('print(1)', []), 'print(1)');
});

test('o arnês roda depois do código e imprime uma marca legível por máquina', () => {
  const programa = programaComConferencias('print("oi")', [
    { id: 'a', descricao: 'A', codigo: 'ok = True\ndetalhe = "ok"' },
  ]);
  assert.ok(programa.startsWith('print("oi")'), 'o código do estudante vem primeiro');
  assert.match(programa, /__CAMPUS_CONFERENCIAS__/);
  // As fontes viajam como JSON para que aspas e quebras de linha do teste não quebrem o programa.
  assert.match(programa, /_campus_json\.loads\(/);
});

test('a marca nunca chega à tela do estudante', () => {
  const bruto = 'Media: 7.5\n__CAMPUS_CONFERENCIAS__[{"id":"a","descricao":"A","ok":true,"detalhe":"d"}]';
  const { saida, resultados } = lerConferencias(bruto);
  assert.equal(saida, 'Media: 7.5');
  assert.deepEqual(resultados, [{ id: 'a', descricao: 'A', ok: true, detalhe: 'd' }]);
});

test('saída sem marca devolve o texto inteiro e nenhum veredito', () => {
  const { saida, resultados } = lerConferencias('Media: 7.5\nSituacao: Aprovado');
  assert.equal(saida, 'Media: 7.5\nSituacao: Aprovado');
  assert.equal(resultados, null);
});

// Um programa que parou antes das conferências não está aprovado nem reprovado. Tratar isso
// como aprovação seria repetir o defeito que este módulo existe para corrigir.
test('sem resultado não se afirma nada', () => {
  assert.equal(situacaoDasConferencias(null), 'sem-conferencia');
  assert.equal(situacaoDasConferencias([]), 'sem-conferencia');
  assert.equal(situacaoDasConferencias([{ ok: true }, { ok: true }]), 'aprovada');
  assert.equal(situacaoDasConferencias([{ ok: true }, { ok: false }]), 'reprovada');
});

test('toda conferência aponta para um passo que existe na entrega', () => {
  for (const entrega of entregasDaFaculdade) {
    const ids = new Set(entrega.passos.map(({ id }) => id));
    for (const item of entrega.conferencias || []) {
      assert.ok(ids.has(item.passo), `${entrega.id}: ${item.id} aponta para o passo inexistente ${item.passo}`);
      assert.ok(item.descricao.length > 10, `${item.id} precisa dizer o que confere`);
      // Sem `ok` a conferência nunca aprova nada; sem `detalhe` ela reprova sem explicar.
      assert.match(item.codigo, /\bok\s*=/, `${item.id} precisa definir ok`);
      assert.match(item.codigo, /\bdetalhe\s*=/, `${item.id} precisa definir detalhe`);
    }
  }
});

// O caso que motivou tudo isto: `soma =+ nota` executa sem erro e devolve 2.25 onde a média é
// 7.5. A entrega da Unidade 1 precisa ter conferência bastante para reprovar isso.
test('a Unidade 1 confere a média, o limite sete e a lista vazia', () => {
  const entrega = entregaDaFaculdade('entrega-u1');
  const ids = entrega.conferencias.map(({ id }) => id);
  assert.ok(ids.includes('media-correta'));
  assert.ok(ids.includes('limite-aprovado'));
  assert.ok(ids.includes('lista-vazia'));
  // Conferir só a lista do enunciado deixaria passar quem devolve 7.5 fixo.
  assert.ok(ids.includes('media-outra-lista'), 'uma segunda lista impede acertar por coincidência');
  assert.ok(conferenciasDoPasso(entrega, 'u1-construir-funcao').length >= 2);
  assert.equal(conferenciasDoPasso(entrega, 'passo-que-nao-existe').length, 0);
});

test('toda entrega que confere alguma coisa declara o contrato por escrito', () => {
  for (const entrega of entregasDaFaculdade) {
    if (!entrega.conferencias?.length) continue;
    assert.ok(
      String(entrega.contrato || '').length > 40,
      `${entrega.id} confere o resultado mas não diz ao estudante o que a função recebe e devolve`,
    );
  }
});
