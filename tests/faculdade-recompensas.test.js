import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, xpTotal, badges } from '../src/progress.js';
import { mergeProgress } from '../src/merge-progress.js';
import { buildCelebration } from '../src/celebrations.js';
import { aulasDaFaculdade } from '../src/faculdade.js';
import { entregasDaFaculdade } from '../src/faculdade-entregas.js';
import { recompensasDaFaculdade, progressoDaUnidade } from '../src/faculdade-recompensas.js';
import { unidadeCompleta } from './faculdade-recompensas-fixture.js';
import { exemploDaEntrega } from '../src/faculdade-exemplos.js';

test('todo exemplo de compreensão tem ambiente explícito e preparação visível quando adiciona código', () => {
  for (const entrega of entregasDaFaculdade) {
    for (const passo of entrega.passos.filter(p => p.fase === 'entender')) {
      const exemplo = exemploDaEntrega(entrega, passo);
      assert.ok(exemplo, passo.id);
      if (entrega.ambienteEntrega === 'colab') assert.equal(exemplo.ambiente, 'colab');
      else {
        assert.equal(exemplo.ambiente, 'pycampus');
        assert.ok(exemplo.saida, passo.id);
        if (exemplo.codigo !== passo.exemplo) assert.ok(exemplo.preparacao, passo.id);
      }
    }
  }
});

test('uma conquista importada sem evidência não concede bônus nem emblema', () => {
  const state = unidadeCompleta();
  const trabalho = state.faculdade.entregas['entrega-u1'];
  trabalho.codigo = '';
  trabalho.conquista = { concluidaEm: '2026-09-20', pronta: true, xp: 100000 };
  const restored = normalizeState(state);
  assert.equal(restored.faculdade.entregas['entrega-u1'].conquista, undefined);
  assert.equal(recompensasDaFaculdade(restored).entregas[0].concluida, false);
  assert.equal(progressoDaUnidade(restored, 'u1').concluida, false);
});

test('as seis aulas já estudadas passam a valer 600 XP sem duplicação', () => {
  const state = initialState();
  state.faculdade.feitas = [...aulasDaFaculdade.slice(0, 6).map(a => a.id), 'u1a1', 'fantasma'];
  assert.equal(xpTotal(state), 600);
  assert.equal(xpTotal(normalizeState(state)), 600);
  assert.equal(xpTotal(mergeProgress(state, state)), 600);
  assert.equal(state.completed.length, 0);
});

test('exercícios do AVA preservam conclusão, XP e dia no backup e na junção', () => {
  const state = initialState();
  state.faculdade.feitas = ['ex-u1', 'ex-u1'];
  state.activities['2026-09-20'] = ['faculdade:ex-u1'];
  const restored = normalizeState(state);
  assert.deepEqual(restored.faculdade.feitas, ['ex-u1']);
  assert.deepEqual(restored.activities['2026-09-20'], ['faculdade:ex-u1']);
  assert.equal(xpTotal(restored), 300);
  assert.equal(xpTotal(mergeProgress(restored, state)), 300);
});

test('passos conhecidos valem 25 XP uma vez; passos e bônus inventados não valem', () => {
  const state = initialState();
  const entrega = entregasDaFaculdade[0];
  state.faculdade.entregas[entrega.id] = {
    passosConcluidos: [entrega.passos[0].id, entrega.passos[0].id, 'fantasma'],
    pronta: true, xp: 100000, concluidaEm: '2026-09-20',
  };
  assert.equal(xpTotal(state), 25);
  assert.equal(xpTotal(normalizeState(state)), 25);
  assert.equal(recompensasDaFaculdade(state).entregas[0].concluida, false);
});

test('quatro aulas sozinhas não fecham a unidade nem entregam emblema', () => {
  const state = initialState();
  state.faculdade.feitas = aulasDaFaculdade.filter(a => a.unidade === 'u1').map(a => a.id);
  const unidade = progressoDaUnidade(state, 'u1');
  assert.equal(unidade.concluida, false);
  assert.equal(unidade.aulasFeitas, 4);
  assert.ok(unidade.total > 4);
  assert.equal(badges.find(b => b.id === 'faculdade-u1').check(state), false);
});

test('aula e exercício celebram XP acadêmico uma vez, sem comemorar mera execução', () => {
  const before = initialState();
  const after = structuredClone(before);
  after.faculdade.feitas = ['u1a1'];
  const reward = buildCelebration(before, after);
  assert.equal(reward.xp, 100);
  assert.match(reward.title, /Aula/);
  assert.ok(reward.badges.some(b => b.id === 'faculdade-inicio'));
  assert.equal(buildCelebration(after, structuredClone(after)), null);
  const executed = structuredClone(after);
  executed.faculdade.codigos.u1a1 = 'print(7)';
  assert.equal(buildCelebration(after, executed), null);
  const exercise = structuredClone(after);
  exercise.faculdade.feitas.push('ex-u1');
  assert.equal(buildCelebration(after, exercise).xp, 300);
});

// Um passo vale 25 XP, mas uma entrega tem até treze. Comemorar cada um abria um modal de
// confete a cada clique em "Registrar este passo" e igualava o passo 3 à entrega inteira. O XP
// do passo entra na conta e aparece no estúdio; o confete fica para o que termina alguma coisa.
test('registrar um passo soma XP sem abrir celebração; concluir a entrega celebra', () => {
  const entrega = entregasDaFaculdade[0];
  const antes = initialState();
  antes.faculdade.feitas = aulasDaFaculdade.filter(a => a.unidade === 'u1').map(a => a.id);
  const umPasso = structuredClone(antes);
  umPasso.faculdade.entregas[entrega.id] = { passosConcluidos: [entrega.passos[0].id] };

  assert.equal(xpTotal(umPasso) - xpTotal(antes), 25, 'o passo continua valendo XP');
  assert.equal(buildCelebration(antes, umPasso), null, 'um passo comum não abre confete');

  const concluida = unidadeCompleta('u1');
  const quaseLa = structuredClone(concluida);
  quaseLa.faculdade.entregas[entrega.id] = {
    ...quaseLa.faculdade.entregas[entrega.id],
    concluidaEm: '',
    conquista: undefined,
    passosConcluidos: entrega.passos.slice(0, -1).map(p => p.id),
  };
  const festa = buildCelebration(quaseLa, concluida);
  assert.ok(festa, 'concluir a entrega precisa celebrar');
  assert.match(festa.title, /Entrega prática concluída/);
  assert.ok(festa.xp >= 25 + 250, 'a celebração mostra o passo final e o bônus da entrega');
});

test('conclusão de cada unidade concede bônus crescente e emblema com todas as atividades', () => {
  for (const [indice, entrega] of entregasDaFaculdade.entries()) {
    const state = unidadeCompleta(entrega.unidade);
    const reward = recompensasDaFaculdade(state).entregas[indice];
    assert.equal(reward.concluida, true, entrega.id);
    assert.equal(reward.bonus, 250 + indice * 100);
    assert.equal(progressoDaUnidade(state, entrega.unidade).concluida, true);
    assert.equal(badges.find(b => b.id === `faculdade-${entrega.unidade}`).check(state), true);
    assert.equal(xpTotal(normalizeState(state)), xpTotal(state));
  }
});

test('revisar código após concluir mantém conquista, XP e unidade completa no backup', () => {
  const state = unidadeCompleta();
  const earned = xpTotal(state);
  state.faculdade.entregas['entrega-u1'].codigo = 'print("Estou revisando")';
  assert.equal(xpTotal(state), earned);
  assert.equal(xpTotal(normalizeState(state)), earned);
  assert.equal(progressoDaUnidade(state, 'u1').concluida, true);
  assert.equal(xpTotal(mergeProgress(initialState(), state)), earned);
});
