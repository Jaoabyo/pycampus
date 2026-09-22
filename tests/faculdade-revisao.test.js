import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, xpTotal } from '../src/progress.js';
import { mergeProgress } from '../src/merge-progress.js';
import { questoesDaFaculdade, girarAlternativas, embaralharAlternativas } from '../src/faculdade-questoes.js';
import {
  registrarResposta, filaDeRevisao, resumoDaRevisao, montarSimulado, corrigirSimulado,
  registrarSimulado, INTERVALOS,
} from '../src/faculdade-revisao.js';

const HOJE = '2026-09-22';
const sequencia = (...valores) => { let i = 0; return () => valores[i++ % valores.length]; };

test('o banco reúne as 40 questões de múltipla escolha da faculdade, com a certa dentro da lista', () => {
  assert.equal(questoesDaFaculdade.length, 40);
  assert.equal(questoesDaFaculdade.filter((q) => q.tipo === 'ava').length, 20);
  assert.equal(questoesDaFaculdade.filter((q) => q.tipo === 'aula').length, 16);
  assert.equal(questoesDaFaculdade.filter((q) => q.tipo === 'projeto').length, 4);
  assert.equal(new Set(questoesDaFaculdade.map((q) => q.id)).size, 40, 'ids únicos');
  for (const q of questoesDaFaculdade) {
    assert.ok(q.resposta >= 0 && q.resposta < q.opcoes.length, `${q.id} aponta fora da lista`);
    assert.ok(String(q.porque).length > 40, `${q.id} precisa explicar por que a certa é certa`);
  }
});

// Nas revisões das aulas a certa estava sempre em A, nas 16 aulas e nos 4 miniprojetos. Numa
// prova de múltipla escolha isso treina marcar A sem ler.
test('girar as alternativas preserva a certa e tira a letra A de ser sempre a resposta', () => {
  const revisoes = questoesDaFaculdade.filter((q) => q.tipo !== 'ava');
  assert.ok(revisoes.every((q) => q.resposta === 0), 'premissa: nos dados a certa vem primeiro');
  const giradas = revisoes.map((q) => girarAlternativas(q));
  for (const [i, g] of giradas.entries()) {
    assert.equal(g.opcoes[g.resposta], revisoes[i].opcoes[revisoes[i].resposta], `${g.id} perdeu a certa`);
    assert.deepEqual([...g.opcoes].sort(), [...revisoes[i].opcoes].sort(), `${g.id} perdeu ou inventou alternativa`);
  }
  const posicoes = new Set(giradas.map((g) => g.resposta));
  assert.ok(posicoes.size >= 2, 'a certa precisa aparecer em mais de uma letra');
  assert.ok(giradas.filter((g) => g.resposta === 0).length < revisoes.length / 2, 'A não pode continuar sendo a maioria');
  // Estável: a mesma aula mostra sempre a mesma ordem, para a tela não mudar entre visitas.
  assert.deepEqual(girarAlternativas(revisoes[0]), girarAlternativas(revisoes[0]));
});

test('embaralhar para o simulado mantém a certa apontando para o texto certo', () => {
  for (const q of questoesDaFaculdade) {
    const e = embaralharAlternativas(q, sequencia(0.9, 0.1, 0.5, 0.3));
    assert.equal(e.opcoes[e.resposta], q.opcoes[q.resposta], q.id);
  }
});

test('errar leva a questão para a caixa zero e ela volta no mesmo dia', () => {
  const s = registrarResposta(initialState(), 'u1q1', false, HOJE);
  assert.deepEqual(s.revisaoFaculdade.u1q1, { caixa: 0, proxima: HOJE, ultima: HOJE, acertos: 0, erros: 1 });
  assert.deepEqual(filaDeRevisao(s, HOJE).map((q) => q.id), ['u1q1']);
});

test('acertar sobe de caixa e empurra a próxima revisão para os dias seguintes', () => {
  let s = registrarResposta(initialState(), 'u1q1', true, HOJE);
  assert.equal(s.revisaoFaculdade.u1q1.caixa, 1);
  assert.equal(s.revisaoFaculdade.u1q1.proxima, '2026-09-23');
  assert.deepEqual(filaDeRevisao(s, HOJE), [], 'acertada não volta no mesmo dia');
  s = registrarResposta(s, 'u1q1', true, '2026-09-23');
  assert.equal(s.revisaoFaculdade.u1q1.caixa, 2);
  assert.equal(s.revisaoFaculdade.u1q1.proxima, '2026-09-25');
  // Um erro depois de acertos derruba de novo: a caixa mostra o que se sabe agora.
  s = registrarResposta(s, 'u1q1', false, '2026-09-25');
  assert.equal(s.revisaoFaculdade.u1q1.caixa, 0);
  assert.equal(s.revisaoFaculdade.u1q1.erros, 1);
  assert.equal(s.revisaoFaculdade.u1q1.acertos, 2);
});

// A prova é daqui a dias. Um intervalo de semanas faria a questão voltar depois dela.
test('nenhum intervalo passa de cinco dias', () => {
  assert.ok(INTERVALOS.every((dias) => dias <= 5));
  assert.equal(INTERVALOS[0], 0);
});

test('a fila traz primeiro o que mais se errou', () => {
  let s = initialState();
  s = registrarResposta(s, 'u2q1', false, HOJE);
  s = registrarResposta(s, 'u3q5', false, HOJE);
  s = registrarResposta(s, 'u3q5', false, HOJE);
  assert.deepEqual(filaDeRevisao(s, HOJE).map((q) => q.id), ['u3q5', 'u2q1']);
  assert.equal(resumoDaRevisao(s, HOJE).pendentes, 2);
});

test('ids desconhecidos não entram na revisão', () => {
  const s = registrarResposta(initialState(), 'questao-inventada', false, HOJE);
  assert.equal(s.revisaoFaculdade?.['questao-inventada'], undefined);
});

test('o simulado cobre as quatro unidades, sem repetir questão, com a certa preservada', () => {
  const questoes = montarSimulado(initialState(), { quantidade: 12, aleatorio: sequencia(0.2, 0.7, 0.4, 0.9, 0.1) });
  assert.equal(questoes.length, 12);
  assert.equal(new Set(questoes.map((q) => q.id)).size, 12);
  assert.deepEqual([...new Set(questoes.map((q) => q.unidade))].sort(), ['u1', 'u2', 'u3', 'u4']);
  for (const q of questoes) {
    const original = questoesDaFaculdade.find((x) => x.id === q.id);
    assert.equal(q.opcoes[q.resposta], original.opcoes[original.resposta]);
  }
});

test('só o que estudei restringe o simulado às unidades com aula concluída', () => {
  const s = initialState();
  s.faculdade.feitas = ['u1a1'];
  const questoes = montarSimulado(s, { quantidade: 10, escopo: 'estudado' });
  assert.ok(questoes.every((q) => q.unidade === 'u1'));
});

test('corrigir e registrar o simulado alimenta a revisão com os erros', () => {
  const questoes = montarSimulado(initialState(), { quantidade: 4, aleatorio: sequencia(0.3, 0.6) });
  const respostas = { [questoes[0].id]: questoes[0].resposta, [questoes[1].id]: (questoes[1].resposta + 1) % questoes[1].opcoes.length };
  const resultado = corrigirSimulado(questoes, respostas, 300);
  assert.equal(resultado.acertos, 1, 'em branco conta como erro');
  assert.equal(resultado.erradas.length, 3);
  const s = registrarSimulado(initialState(), questoes, resultado, HOJE);
  assert.equal(s.simuladosFaculdade.length, 1);
  assert.equal(filaDeRevisao(s, HOJE).length, 3, 'as três erradas voltam hoje');
  assert.ok(s.activities[HOJE].includes('faculdade-simulado'));
});

// Treino não se premia por quantidade: responder mil questões não pode virar XP.
test('revisão e simulado não valem XP', () => {
  const antes = initialState();
  const questoes = montarSimulado(antes, { quantidade: 10 });
  const depois = registrarSimulado(antes, questoes, corrigirSimulado(questoes, {}, 60), HOJE);
  assert.equal(xpTotal(depois), xpTotal(antes));
});

test('revisão e simulados sobrevivem ao backup, e o backup recusa registros inventados', () => {
  let s = registrarResposta(initialState(), 'aula:u1a1', false, HOJE);
  const questoes = montarSimulado(s, { quantidade: 4 });
  s = registrarSimulado(s, questoes, corrigirSimulado(questoes, {}, 90), HOJE);
  const restaurado = normalizeState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restaurado.revisaoFaculdade, s.revisaoFaculdade);
  assert.deepEqual(restaurado.simuladosFaculdade, s.simuladosFaculdade);
  assert.ok(restaurado.activities[HOJE].includes('faculdade-simulado'));

  const falso = normalizeState({
    ...initialState(),
    revisaoFaculdade: {
      'id-falso': { caixa: 4, proxima: HOJE, ultima: HOJE, acertos: 1, erros: 0 },
      u1q1: { caixa: 99, proxima: 'amanhã', ultima: HOJE, acertos: 1, erros: 0 },
    },
    simuladosFaculdade: [{ data: HOJE, total: 10, acertos: 50, segundos: 10 }],
  });
  assert.deepEqual(falso.revisaoFaculdade, {}, 'id falso e data inválida são descartados');
  assert.deepEqual(falso.simuladosFaculdade, [], 'mais acertos que questões não é um resultado');
});

test('juntar dois aparelhos guarda a resposta mais recente de cada questão', () => {
  const a = registrarResposta(initialState(), 'u1q1', false, '2026-09-20');
  const b = registrarResposta(initialState(), 'u1q1', true, '2026-09-22');
  const junto = mergeProgress(a, b);
  assert.equal(junto.revisaoFaculdade.u1q1.ultima, '2026-09-22');
  assert.equal(junto.revisaoFaculdade.u1q1.caixa, 1);
  const invertido = mergeProgress(b, a);
  assert.equal(invertido.revisaoFaculdade.u1q1.ultima, '2026-09-22');
});
