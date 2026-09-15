import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sanitizeReply, mentorPrompt, taughtUpTo } from '../src/mentor.js';
import { orientacoesAnteriores } from '../src/contexto-do-lumi.js';

const NL = String.fromCharCode(10);
const codigo = ['texto = "30"', 'print(texto + 1)'].join(NL);

// O estudante escrevia a própria pergunta e recebia silêncio. A causa: a regra do primeiro
// degrau ("responda só com uma pergunta") era aplicada também à resposta da pergunta dele, e o
// filtro descartava tudo o que não terminasse em "?". O degrau controla profundidade, não
// formato de conversa.

test('a resposta a uma pergunta livre não é reduzida a uma pergunta', () => {
  const resposta = 'O erro acontece porque texto é str e 1 é número. Tipos diferentes não se somam.';
  assert.equal(sanitizeReply(resposta, 1, codigo), '', 'sem pergunta livre, o degrau 1 exige uma pergunta');
  assert.match(sanitizeReply(resposta, 1, codigo, true), /tipos diferentes/i);
});

// Permitir nomear a função abriu brecha: bastava exigir "me dá o código pronto" para recebê-la.
// No primeiro degrau a trava voltou a ser estrita. O conserto da pergunta livre é outro: ela
// sobe um degrau para ser respondida, o que é visível na tela e tem custo.
test('o primeiro degrau não revela função nova, nem quando o estudante insiste', () => {
  assert.equal(sanitizeReply('Converter é usar int() para transformar o texto.', 1, codigo, true), '');
  assert.equal(sanitizeReply('Use int(texto) antes de somar.', 1, codigo, true), '');
});

test('mas a explicação em palavras, sem função nova, passa', () => {
  assert.match(sanitizeReply('O erro é somar texto com número: são tipos diferentes.', 1, codigo, true), /tipos diferentes/);
});

// Subir por dentro do askMentor deixaria o painel dizendo "degrau 1" com resposta de degrau 2.
// A subida acontece na tela, onde o estudante vê o degrau mudar e a frase que explica por quê.
test('a pergunta sem resposta no degrau 1 sobe um degrau, à vista do estudante', () => {
  const painel = readFileSync(new URL('../src/Mentor.jsx', import.meta.url), 'utf8');
  assert.ok(painel.includes('preciso subir um degrau'), 'o aviso da subida sumiu');
  assert.ok(painel.includes('perguntar(proximoNivel + 1, minha)'), 'a subida sumiu');
  const motor = readFileSync(new URL('../src/mentor.js', import.meta.url), 'utf8');
  assert.ok(!motor.includes('askMentor({ context, level: 2'), 'o motor voltou a subir escondido');
});

test('sem pergunta livre, o degrau 1 continua estrito', () => {
  assert.equal(sanitizeReply('Use int(texto).', 1, codigo), '');
});

test('e continua sem mostrar bloco de código antes do terceiro degrau', () => {
  const comBloco = ['Assim:', '```python', 'a = 1', 'b = 2', 'c = 3', '```'].join(NL);
  assert.match(sanitizeReply(comBloco, 1, codigo, true), /próximo degrau/);
});

test('com pergunta do estudante, o prompt manda responder a ela', () => {
  const contexto = { title: 'T', lessonId: 'tipos', challenge: 'x', expected: '30', code: codigo, output: 'erro', taught: taughtUpTo('tipos'), history: [] };
  assert.match(mentorPrompt(contexto, 1, 'por que dá erro?').system, /Responda À PERGUNTA DELE/);
  assert.match(mentorPrompt(contexto, 1).system, /UMA ÚNICA pergunta/);
});

test('o Lumi recebe somente orientações recentes do mesmo assunto', () => {
  const notas = [
    { at: '2026-09-10T10:00:00.000Z', activityId: 'lesson:tipos', lessonId: 'tipos', level: 1, question: 'o que é int?', tip: 'Transforma texto numérico em número.' },
    { at: '2026-09-11T10:00:00.000Z', activityId: 'lesson:strings', lessonId: 'strings', level: 2, question: 'o que upper faz?', tip: 'Cria texto em maiúsculas.' },
    { at: '2026-09-12T10:00:00.000Z', activityId: 'lesson:strings', lessonId: 'strings', level: 3, question: 'e strip?', tip: 'Remove espaços nas pontas.' }
  ];
  const anteriores = orientacoesAnteriores(notas, 'lesson:strings', 'strings');
  assert.match(anteriores, /upper faz/);
  assert.match(anteriores, /strip/);
  assert.doesNotMatch(anteriores, /o que é int/);
  const contexto = { title: 'T', lessonId: 'strings', challenge: 'x', expected: 'BIA', code: codigo, output: 'erro', taught: taughtUpTo('strings'), history: [], previousGuidance: anteriores };
  assert.match(mentorPrompt(contexto, 2, 'por quê?').user, /Continue a partir delas/);
});

// O painel abria disparando a dica sozinho, e o campo de pergunta ficava bloqueado enquanto
// ela vinha. Quem abria para perguntar esperava por uma resposta que não tinha pedido.
test('o painel não dispara nenhuma pergunta sozinho ao abrir', () => {
  const fonte = readFileSync(new URL('../src/Mentor.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(fonte, /if \(open && status\?\.ok && !busy/, 'a chamada automática ao abrir voltou');
  assert.match(fonte, /mentor-bolha/, 'a conversa em bolhas sumiu');
  assert.match(fonte, /Enviar pergunta/, 'o botão de enviar sumiu');
  assert.match(fonte, /Comentar meu código/, 'o atalho de comentar o código sumiu');
});

test('toda tela que mostra o Lumi guarda a conversa no histórico', () => {
  for (const tela of ['App.jsx', 'PracticeStudio.jsx', 'FunctionBridges.jsx', 'ProjectStudio.jsx']) {
    const fonte = readFileSync(new URL(`../src/${tela}`, import.meta.url), 'utf8');
    assert.match(fonte, /activityId=/, `${tela}: Mentor sem activityId`);
    assert.match(fonte, /onSaveNote=/, `${tela}: a conversa não é registrada`);
  }
});
