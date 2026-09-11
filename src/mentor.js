import { readError } from './error-guide.js';
import { lessons } from './curriculum.js';

// O Lumi é um vaga-lume: ilumina o caminho, não caminha por você.
// A ajuda sobe em quatro degraus e só avança quando o estudante pede. Os dois primeiros
// degraus nunca mostram código — essa regra é garantida aqui no código, em sanitizeReply,
// e não confiada ao modelo, que pode desobedecer.
// O endereço da IA precisa ser configurável: no computador ela vive em 127.0.0.1, mas no
// celular abrindo o site publicado é preciso apontar para outro lugar — a máquina na rede
// local ou um túnel https. A escolha fica no aparelho, não no código.
export const OLLAMA_PADRAO = 'http://127.0.0.1:11434';
const CHAVE = 'pycampus.ia';
const semBarraFinal = texto => {
  let limpo = String(texto || '').trim();
  while (limpo.endsWith('/')) limpo = limpo.slice(0, -1);
  return limpo;
};
export function ollamaUrl() {
  try { return semBarraFinal(localStorage.getItem(CHAVE) || OLLAMA_PADRAO); } catch { return OLLAMA_PADRAO; }
}
export function definirOllamaUrl(valor) {
  try {
    const limpo = semBarraFinal(valor);
    if (limpo) localStorage.setItem(CHAVE, limpo); else localStorage.removeItem(CHAVE);
  } catch { /* navegador sem armazenamento: segue com o padrão */ }
  return ollamaUrl();
}
export const MENTOR_MODEL = 'qwen2.5-coder:14b';

export const mentorSteps = [
  { level: 1, label: 'Me dá uma pista', reveals: 'Uma pergunta para você olhar no lugar certo. Sem código.' },
  { level: 2, label: 'Ainda não consegui', reveals: 'A ideia por trás desse erro, explicada. Sem código.' },
  { level: 3, label: 'Me mostra o caminho', reveals: 'O que mudar, em palavras, com no máximo duas linhas de exemplo.' },
  { level: 4, label: 'Preciso da resposta', reveals: 'O código corrigido e o porquê de funcionar.' }
];
export const MAX_LEVEL = mentorSteps.length;

// O modelo só pode se apoiar no que o estudante já viu. Sem isso ele "ajuda" com list
// comprehension na terceira aula, que é exatamente o tipo de salto que confunde.
export function taughtUpTo(lessonId) {
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  const upTo = index < 0 ? lessons : lessons.slice(0, index + 1);
  return upTo.map(lesson => lesson.title);
}

// Ajuda garantida, escrita e revisada, que funciona sem nenhuma IA ligada.
export function localHelp(context, level) {
  const error = readError(context.output);
  if (!error) return level >= 3
    ? ['O programa rodou sem erro, então a diferença está no resultado. Compare sua saída com a esperada linha por linha, prestando atenção em espaços, acentos e maiúsculas.']
    : ['O programa rodou sem erro de Python. Leia sua saída e a esperada e procure a primeira linha em que elas diferem.'];
  const local = error.line ? ` Ele apareceu na linha ${error.line}.` : '';
  if (level === 1) return [`Esse é um ${error.type}.${local}`, 'Antes de mudar qualquer coisa: o que você queria que essa linha fizesse?'];
  if (level === 2) return [error.title + '.', error.meaning];
  return error.steps;
}

export function mentorPrompt(context, level, question = '') {
  const error = readError(context.output);
  const rules = {
    1: 'Faça UMA pergunta curta sobre o que o estudante queria que a linha do erro fizesse, citando pelo nome as variáveis ou valores envolvidos. Não diga o que está errado, não dê a causa e não escreva nenhuma linha de código.',
    2: 'Explique a ideia por trás desse tipo de erro, em no máximo três frases. Ainda não diga o que mudar no código dele e não escreva nenhuma linha de código.',
    3: 'Diga em palavras o que precisa mudar e em qual linha. Pode mostrar no máximo duas linhas de código, e apenas de um exemplo diferente do exercício dele.',
    4: 'Mostre o código corrigido e explique em duas frases por que agora funciona.'
  };
  const system = [
    'Você é o Lumi, um vaga-lume que ajuda um estudante brasileiro iniciante em Python.',
    'Responda sempre em português do Brasil, com frases curtas e palavras simples. No máximo 90 palavras.',
    'Você é gentil e direto, nunca sarcástico. Nunca diga que a pergunta é fácil ou óbvia.',
    `O estudante só aprendeu estes assuntos, nesta ordem: ${context.taught.join(', ')}.`,
    'Nunca use recursos que não estejam nessa lista, mesmo que exista solução mais curta.',
    `Degrau de ajuda atual: ${level} de 4. ${rules[level]}`
  ].join('\n');
  const user = [
    `Atividade: ${context.title}`,
    context.challenge && `O que foi pedido: ${context.challenge}`,
    context.expected && `Saída esperada:\n${context.expected}`,
    `Código do estudante:\n${context.code}`,
    error ? `Erro que apareceu:\n${context.output}` : `Saída que ele obteve:\n${context.output}`,
    question && `Pergunta do estudante: ${question}`
  ].filter(Boolean).join('\n\n');
  return { system, user };
}

const fence = /```[\s\S]*?(?:```|$)/g;
const lineCount = block => block.replace(/```[a-z]*\n?/gi, '').split('\n').filter(line => line.trim()).length;

// A trava de verdade: o que o modelo mandar além do degrau é removido antes de chegar na tela.
export function sanitizeReply(text, level) {
  if (typeof text !== 'string') return '';
  if (level >= MAX_LEVEL) return text.trim();
  const limit = level >= 3 ? 2 : 0;
  return text.replace(fence, block => lineCount(block) <= limit
    ? block
    : '[o código fica para o próximo degrau — tente você primeiro]').trim();
}

export async function mentorAvailable(signal) {
  try {
    const response = await fetch(`${ollamaUrl()}/api/tags`, { signal });
    if (!response.ok) return { ok: false, reason: 'erro' };
    const data = await response.json();
    const models = (data.models || []).map(model => model.name);
    return models.includes(MENTOR_MODEL)
      ? { ok: true, models }
      : { ok: false, reason: 'modelo', models };
  } catch {
    return { ok: false, reason: 'desligado' };
  }
}

// Levar 9,5 GB para a GPU passa de um minuto na primeira vez. Aquecer quando o estudante
// abre a atividade evita que ele espere isso justo no momento em que travou num erro.
export function warmMentor(signal) {
  return fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MENTOR_MODEL, stream: false, keep_alive: '30m', messages: [{ role: 'user', content: 'oi' }], options: { num_predict: 1 } })
  }).then(() => true).catch(() => false);
}

// Streaming para o texto aparecer enquanto é escrito: num modelo 14B a resposta inteira
// demora alguns segundos, e esperar em silêncio parece travamento.
export async function askMentor({ context, level, question = '', onToken, signal }) {
  const { system, user } = mentorPrompt(context, level, question);
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: true, keep_alive: '30m',
      options: { temperature: 0.3, num_predict: 400 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!response.ok || !response.body) throw new Error(`Ollama respondeu ${response.status}`);
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '', full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const piece = JSON.parse(line).message?.content || '';
      if (!piece) continue;
      full += piece;
      onToken?.(sanitizeReply(full, level));
    }
  }
  return sanitizeReply(full, level);
}
