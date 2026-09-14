import test from 'node:test';
import assert from 'node:assert/strict';
import { montarRelatorio, relatorioVencido, DIAS_ENTRE_RELATORIOS } from '../src/relatorio.js';
import { corpoDoGist, explicarFalha, precisaSalvar } from '../src/nuvem.js';
import { initialState, normalizeState, localDate, shiftDate } from '../src/progress.js';
import { practiceProjects } from '../src/practice-content.js';

const hoje = localDate();
const pratica = practiceProjects[0];
const comProgresso = {
  ...initialState(), name: 'João', completed: ['ola', 'variaveis'],
  learning: { [pratica.id]: { answered: pratica.investigate.answer, passed: ['modify', 'create'], notes: 'essa linha guarda o nome' } },
  provas: [{ data: hoje, total: 5, acertos: 3, segundos: 420, falhas: [] }]
};

// O relatório existe para ser avaliado por fora. Ele só pode conter o que a plataforma
// registrou de fato — números do progresso e texto escrito pelo estudante.
test('the report carries real progress, real mistakes and the student own words', () => {
  const texto = montarRelatorio(comProgresso, hoje);
  assert.match(texto, /2 de 48 aulas concluídas/);
  // Conta os miniprojetos do currículo, para o teste não quebrar cada vez que um é criado.
  assert.match(texto, new RegExp(`1 de ${practiceProjects.length} miniprojetos treinados`));
  assert.match(texto, /essa linha guarda o nome/, 'a explicação escrita precisa entrar');
  assert.match(texto, /3 de 5/, 'o resultado da prova precisa entrar');
  assert.match(texto, /Como estou indo\?/, 'o relatório termina pedindo a avaliação');
});
test('an empty campus produces an honest report instead of inventing progress', () => {
  const texto = montarRelatorio(initialState(), hoje);
  assert.match(texto, /0 de 48 aulas/);
  assert.match(texto, /nenhuma ainda/);
  assert.match(texto, /Ainda não fiz nenhuma prova/);
  assert.match(texto, /Ainda não escrevi nenhuma explicação/);
  assert.ok(!/undefined|NaN/.test(texto), 'nada de buraco no texto');
});
test('the reminder waits the agreed days and never nags an empty campus', () => {
  assert.equal(relatorioVencido(initialState(), hoje), false, 'sem nada estudado não há o que relatar');
  assert.equal(relatorioVencido(comProgresso, hoje), true, 'quem nunca gerou e já estudou deve gerar');
  const recente = { ...comProgresso, ultimoRelatorio: hoje };
  assert.equal(relatorioVencido(recente, hoje), false);
  const antigo = { ...comProgresso, ultimoRelatorio: shiftDate(hoje, -DIAS_ENTRE_RELATORIOS) };
  assert.equal(relatorioVencido(antigo, hoje), true);
});
test('the report date survives a backup, and an invalid one is discarded', () => {
  assert.equal(normalizeState({ ...comProgresso, ultimoRelatorio: hoje }).ultimoRelatorio, hoje);
  assert.equal(normalizeState({ ...comProgresso, ultimoRelatorio: 'ontem' }).ultimoRelatorio, '');
});

// A nuvem é um Gist privado da conta do próprio estudante.
test('the cloud payload is one readable file and never public by accident', () => {
  const corpo = corpoDoGist(comProgresso);
  assert.deepEqual(Object.keys(corpo.files), ['pycampus.json']);
  assert.equal(corpo.public, undefined, 'quem decide o sigilo é a criação, que envia public: false');
  assert.deepEqual(JSON.parse(corpo.files['pycampus.json'].content).completed, ['ola', 'variaveis']);
});
test('a failure from GitHub becomes an instruction, not a status code', () => {
  assert.match(explicarFalha(401), /Gere outro/);
  assert.match(explicarFalha(403), /limite/);
  assert.match(explicarFalha(404), /salve de novo/);
  assert.match(explicarFalha(500), /500/);
});
test('nothing is uploaded when nothing changed', () => {
  // Sem token não há nuvem ligada, então nunca sobe nada.
  assert.equal(precisaSalvar(comProgresso, ''), false);
});
