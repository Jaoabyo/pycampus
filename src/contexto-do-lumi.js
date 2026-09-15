import { lessons } from './curriculum.js';
import { simpleExplanations, beginnerNotes } from './simple-explanations.js';
import { diagnose } from './diagnosis.js';

// O que o Lumi sabia antes deste arquivo: os TÍTULOS das aulas concluídas. Nada mais.
//
// Ele explicava `int()` com o que aprendeu no próprio treinamento, não com o que a aula do
// estudante diz. Duas explicações diferentes para a mesma coisa é exatamente o que confunde
// quem está começando — e a plataforma já tem a explicação certa escrita.
//
// Aqui ele passa a receber três coisas que existiam e não chegavam até ele:
//   1. a teoria e o exemplo da aula em que o estudante está;
//   2. a explicação simples que a plataforma já usa para as funções que estão no código dele;
//   3. os enganos que o diário dele mostra que se repetem.
//
// Tudo é medido ou copiado do conteúdo, nunca inventado: são fatos, e o prompt diz que são.

const NL = String.fromCharCode(10);
const LIMITE_TEORIA = 900;
const chamadasNoCodigo = codigo => [...new Set(
  [...String(codigo || '').matchAll(/(?<![\w.])([A-Za-z_]\w*)\s*\(/g)].map(achado => achado[1])
)];

// A aula onde o estudante está agora, com as palavras que a própria plataforma escolheu.
export function aulaEmTexto(lessonId) {
  const aula = lessons.find(item => item.id === lessonId);
  if (!aula) return '';
  const teoria = (Array.isArray(aula.theory) ? aula.theory : [aula.theory]).filter(Boolean).join(' ');
  return [
    `Aula atual: ${aula.title}`,
    `O que ela ensina: ${aula.objective}`,
    `Como a plataforma explica isso ao estudante: ${teoria.slice(0, LIMITE_TEORIA)}`,
    `Exemplo que ele viu nesta aula:${NL}${aula.example}`
  ].join(NL);
}

// A explicação em linguagem simples que o estudante já leu, para as funções que ele escreveu.
// Sem isto, o Lumi inventa uma segunda definição da mesma coisa, com outras palavras.
export function glossarioDoCodigo(codigo, lessonId) {
  const usadas = chamadasNoCodigo(codigo);
  if (!usadas.length) return '';
  const ate = lessons.findIndex(item => item.id === lessonId);
  const vistas = ate < 0 ? lessons : lessons.slice(0, ate + 1);
  const trechos = [];
  for (const aula of vistas) {
    const explicacao = [...(simpleExplanations[aula.id] || []), beginnerNotes[aula.id]].filter(Boolean).join(' ');
    const citadas = usadas.filter(nome => explicacao.includes(`${nome}(`));
    if (citadas.length) trechos.push(`${citadas.join(', ')} — a aula "${aula.title}" explica assim: ${explicacao.slice(0, 320)}`);
  }
  return trechos.slice(0, 3).join(NL);
}

// O diário já diagnostica enganos repetidos por regra. O Lumi nunca via nenhum deles, então
// dava a mesma dica genérica na primeira e na décima vez que o mesmo erro aparecia.
export function historicoDoEstudante(history, lessonId) {
  const tentativas = Array.isArray(history) ? history : [];
  const daAula = tentativas.filter(item => item.lessonId === lessonId);
  const erradas = daAula.filter(item => item.status === 'error' || item.matched === false).length;
  const repetidos = diagnose(tentativas).filter(padrao => padrao.count > 1);
  const linhas = [];
  if (erradas >= 2) linhas.push(`Ele já tentou esta atividade ${erradas} vezes sem acertar. Não repita uma dica que ele claramente já tentou seguir.`);
  for (const padrao of repetidos.slice(0, 2)) linhas.push(`Engano que se repete no histórico dele (${padrao.count} vezes): ${padrao.title} — ${padrao.summary}`);
  return linhas.join(NL);
}

// Uma conversa anterior só é útil se for da mesma atividade ou do mesmo assunto. Mandar o
// diário inteiro deixaria o pedido enorme e faria o Lumi puxar uma dúvida antiga que não tem
// relação com o que está na tela. Três resumos recentes bastam para ele continuar de onde a
// pessoa parou, sem fingir que uma orientação é prova de que ela já aprendeu.
export function orientacoesAnteriores(lumiNotes, activityId = '', lessonId = '') {
  if (!Array.isArray(lumiNotes)) return '';
  const relevantes = lumiNotes
    .filter(note => note && typeof note === 'object' && note.tip
      && (note.activityId === activityId || (lessonId && note.lessonId === lessonId)))
    .sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')))
    .slice(-3);
  if (!relevantes.length) return '';
  return relevantes.map(note => [
    `Orientação anterior no degrau ${note.level || '?'}:`,
    `Pergunta: ${String(note.question || '').slice(0, 220)}`,
    `Orientação: ${String(note.tip || '').slice(0, 420)}`
  ].join(NL)).join(`${NL}${NL}`);
}

// O chat não precisa de pixels, menus ou cores para entender a tela. Ele precisa dos fatos
// pedagógicos que o estudante está vendo e que antes ficavam presos em cada componente.
// A lista fechada evita mandar estado interno irrelevante; os limites impedem uma resposta
// antiga ou um campo enorme de soterrar o código e o enunciado atuais.
const CAMPOS_VISIVEIS = [
  ['etapa', 'Etapa visível'],
  ['entrada', 'Entradas fornecidas ao input()'],
  ['feedback', 'Mensagem mostrada pela plataforma'],
  ['perguntaRevisao', 'Pergunta de revisão visível'],
  ['respostaRevisao', 'Resposta escolhida pelo estudante'],
  ['respostaEscrita', 'Explicação escrita pelo estudante'],
  ['previsao', 'Previsão escrita pelo estudante'],
  ['status', 'Progresso desta atividade'],
  ['pistas', 'Pistas que o estudante já abriu']
];
const textoVisivel = valor => Array.isArray(valor)
  ? valor.filter(Boolean).join(`${NL}- `)
  : String(valor ?? '');

export function contextoVisivel(dados = {}) {
  if (!dados || typeof dados !== 'object') return '';
  let restante = 3200;
  const linhas = [];
  for (const [chave, rotulo] of CAMPOS_VISIVEIS) {
    if (restante <= 0) break;
    const bruto = textoVisivel(dados[chave]).trim();
    if (!bruto) continue;
    const valor = bruto.slice(0, Math.min(800, restante));
    linhas.push(`${rotulo}:${NL}${valor}`);
    restante -= valor.length;
  }
  return linhas.join(`${NL}${NL}`);
}

// Cada degrau era uma chamada isolada, então o degrau 2 recomeçava do zero e repetia o 1.
// Passando o que já foi dito, a escada vira conversa: ele avança em vez de reformular.
export function degrausAnteriores(replies = {}, level = 1) {
  const turnos = [];
  for (let anterior = 1; anterior < level; anterior++) {
    const texto = String(replies[anterior] || '').trim();
    if (!texto || texto.startsWith('__falhou__')) continue;
    turnos.push({ role: 'assistant', content: texto });
    turnos.push({ role: 'user', content: 'Ainda não consegui. Continue de onde você parou, sem repetir o que já disse.' });
  }
  return turnos;
}
