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
