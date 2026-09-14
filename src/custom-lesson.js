import { lessons } from './curriculum.js';
import { simpleExplanations, beginnerNotes } from './simple-explanations.js';
import { MENTOR_MODEL, ollamaUrl } from './mentor.js';

// Uma lição escrita por um modelo pode ensinar errado, e errado é pior do que nada. Por isso
// nada chega à tela sem passar por três filtros: formato, vocabulário já ensinado e — o que
// de fato importa — execução no Python real. Se o exemplo não produzir a saída que a própria
// lição promete, ela é descartada.
const KEYWORDS = new Set(['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'return', 'and', 'or', 'not', 'in', 'is', 'with', 'as', 'try', 'except', 'finally', 'raise', 'import', 'from', 'yield', 'await', 'async', 'lambda', 'pass', 'self', 'print']);

const strip = code => code
  .replace(/'''[\s\S]*?'''/g, " '' ").replace(/"""[\s\S]*?"""/g, " '' ")
  .replace(/'[^'\n]*'/g, " '' ").replace(/"[^"\n]*"/g, " '' ")
  .replace(/#[^\n]*/g, ' ');

export function callablesIn(raw) {
  const code = strip(typeof raw === 'string' ? raw : '');
  const defined = new Set([...code.matchAll(/\b(?:def|class)\s+(\w+)/g)].map(match => match[1]));
  const found = new Set();
  for (const match of code.matchAll(/(?:(\w+)\s*\.\s*)?\b([A-Za-z_]\w*)\s*\(/g)) {
    const name = match[2];
    if (!KEYWORDS.has(name) && !defined.has(name)) found.add(name);
  }
  return [...found];
}

// O mesmo texto visível que as aulas usam como prova de "isto foi ensinado sem clique".
export function taughtTextUpTo(lessonId) {
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  return (index < 0 ? lessons : lessons.slice(0, index + 1))
    .map(lesson => [...(simpleExplanations[lesson.id] || []), ...(beginnerNotes[lesson.id] || []).flat(), lesson.example].join(' '))
    .join('\n');
}

// O que o filtro aceita, dito ao modelo antes de ele escrever: pedir e depois recusar gasta
// uma tentativa do estudante à toa.
const COMUNS = ['print', 'input', 'int', 'float', 'str', 'len', 'range', 'sum', 'sorted', 'list', 'set', 'dict', 'abs', 'round', 'type', 'open', 'all', 'any', 'enumerate', 'zip', 'append', 'items', 'keys', 'values', 'strip', 'upper', 'lower', 'split', 'join', 'replace', 'format', 'get', 'add', 'remove', 'sort'];
export const funcoesEnsinadas = taught => COMUNS.filter(nome => new RegExp("\\b" + nome + "\\b").test(taught));

export const untaughtCallables = (code, taught) =>
  callablesIn(code).filter(name => !new RegExp(`\\b${name}\\b`).test(taught));

export function customLessonPrompt({ weakness, evidence, taughtTitles, permitidas = [] }) {
  const system = [
    'Você é o Lumi e vai escrever uma lição curta de Python para um estudante brasileiro iniciante.',
    'A lição trata de um engano específico que ele cometeu de verdade. Escreva em português do Brasil, com frases curtas.',
    'A lição inteira — explicação, exemplo e desafio — precisa ser sobre esse engano, e não sobre um assunto vizinho.',
    `O estudante só aprendeu estes assuntos: ${taughtTitles.join(', ')}.`,
    'Use somente esses recursos. Nada de list comprehension, f-string, dicionário ou biblioteca que não esteja na lista.',
    'O exemplo e a solução precisam ser programas completos que imprimem algo.',
    'MUITO IMPORTANTE: o exemplo precisa rodar sem erro. Ele mostra o jeito CERTO de fazer.',
    'Nunca escreva um programa quebrado como exemplo. O engano você explica em palavras, na explicação.',
    'saidaExemplo é o que o programa imprime quando roda bem, nunca uma mensagem de erro.',
    'O desafio começa com o editor vazio: o estudante escreve do zero. Nunca diga "corrija o código abaixo" nem "no código acima", porque não existe código nenhum na tela dele.',
    'Se usar input(), escreva em entradasExemplo e entradasDesafio as respostas que o programa vai receber, uma por item.',
    'Responda APENAS um JSON:',
    '{"titulo":"até 6 palavras","explicacao":["frase 1","frase 2"],"exemplo":"código completo","entradasExemplo":[],"saidaExemplo":"saída exata do exemplo","desafio":"o que o estudante deve fazer","solucao":"código completo que resolve o desafio","entradasDesafio":[],"saidaDesafio":"saída exata da solução"}',
    'As saídas precisam ser exatamente o que o Python imprime, incluindo o texto das perguntas do input(), sem aspas em volta e sem explicação.',
    'ATENÇÃO ao formato da saída com input(): aqui a pergunta do input() NÃO pula linha. A resposta digitada não aparece, e o que vier depois continua na MESMA linha da pergunta.',
    'Exemplo do formato: para o programa   nome = input("Seu nome: ")   seguido de   print(nome)   com a entrada Ana, saidaExemplo é exatamente: Seu nome: Ana',
    `Funções que ele pode ver: ${permitidas.join(', ')}. Qualquer outra faz a lição ser descartada, mesmo que deixe o código mais curto.`
  ].join('\n');
  // O padrão já traz um programa quebrado que representa o engano: dar isso ao modelo evita
  // que ele escreva sobre um assunto parecido, que foi o que aconteceu sem essa âncora.
  const broken = weakness.levels?.find(level => level.kind === 'fix');
  const user = [
    `Engano a corrigir: ${weakness.title}`,
    `Em que consiste: ${weakness.summary}`,
    broken ? `Um programa que contém exatamente esse engano:\n${broken.broken}\n\nCorrigido, ele deveria imprimir: ${broken.expected}` : '',
    evidence ? `Linha que o próprio estudante escreveu e deu errado:\n${evidence}` : '',
    'Escreva a lição agora, sobre esse engano.'
  ].filter(Boolean).join('\n\n');
  return { system, user };
}

const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export function parseCustomLesson(raw) {
  const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null;
  if (!match) throw new Error('A lição não voltou no formato esperado.');
  const data = JSON.parse(match[0]);
  const entries = value => (Array.isArray(value) ? value : []).slice(0, 5).map(item => text(item, 100)).filter(Boolean);
  const lesson = {
    titulo: text(data.titulo, 80),
    entradasExemplo: entries(data.entradasExemplo),
    entradasDesafio: entries(data.entradasDesafio),
    explicacao: (Array.isArray(data.explicacao) ? data.explicacao : []).slice(0, 3).map(line => text(line, 300)).filter(Boolean),
    exemplo: text(data.exemplo, 1200),
    saidaExemplo: text(data.saidaExemplo, 600),
    desafio: text(data.desafio, 500),
    solucao: text(data.solucao, 1200),
    saidaDesafio: text(data.saidaDesafio, 600)
  };
  for (const [field, minimum] of [['titulo', 3], ['exemplo', 10], ['saidaExemplo', 1], ['desafio', 15], ['solucao', 10], ['saidaDesafio', 1]]) {
    if (lesson[field].length < minimum) throw new Error(`A lição veio sem ${field}.`);
  }
  if (!lesson.explicacao.length) throw new Error('A lição veio sem explicação.');
  // O editor do desafio começa vazio. Um enunciado que aponta para um código que não está na
  // tela deixa o estudante procurando algo inexistente — foi uma confusão real antes.
  if (/\b(abaixo|acima|a seguir|seguinte)\b/i.test(lesson.desafio)) throw new Error('O desafio apontou para um código que não existe na tela.');
  // Com input() e sem as respostas declaradas, o programa ficaria esperando para sempre e a
  // conferência automática seria impossível. Lições sobre input() são permitidas, com entradas.
  const needs = (code, given) => (code.match(/\binput\s*\(/g) || []).length > given.length;
  if (needs(lesson.exemplo, lesson.entradasExemplo) || needs(lesson.solucao, lesson.entradasDesafio)) {
    throw new Error('A lição usou input() sem dizer quais respostas o programa recebe.');
  }
  return lesson;
}

export async function requestCustomLesson({ weakness, evidence, lessonId, signal }) {
  const taught = taughtTextUpTo(lessonId);
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  const taughtTitles = (index < 0 ? lessons : lessons.slice(0, index + 1)).map(lesson => lesson.title);
  const { system, user } = customLessonPrompt({ weakness, evidence, taughtTitles, permitidas: funcoesEnsinadas(taught) });
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      options: { temperature: 0.4, num_predict: 700 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}.`);
  const lesson = parseCustomLesson((await response.json()).message?.content);
  const unknown = untaughtCallables(`${lesson.exemplo}\n${lesson.solucao}`, taught);
  if (unknown.length) throw new Error(`A lição usou ${unknown.join(', ')}, que você ainda não estudou.`);
  return lesson;
}
