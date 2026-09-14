import { entregaSolucao } from './mentor.js';
import { aulaEmTexto } from './contexto-do-lumi.js';

// Leitura do código enquanto o estudante escreve, medida em JavaScript.
//
// Tudo aqui é contado, não julgado: parêntese que não fecha, aspas que não fecham, dois-pontos
// que falta, bloco vazio, variável criada e nunca usada. São os enganos que custam uma execução
// inteira para descobrir e que o estudante enxerga sozinho assim que alguém aponta a linha.
//
// Nenhuma chamada de modelo: aparece na hora, funciona sem internet e nunca entrega a resposta.
// O Lumi entra por cima disto, e só quando o estudante para de digitar.
//
// Uma observação por vez, a primeira que disparar. Lista de avisos afogada em tela não é ajuda.

const NL = String.fromCharCode(10);
const ASPA = String.fromCharCode(34);
const APOSTROFO = String.fromCharCode(39);
const PARES = { ')': '(', ']': '[', '}': '{' };
const ABRE = new Set(['(', '[', '{']);
const CABECALHOS = ['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'try', 'except', 'finally', 'with'];

// Comentário e texto entre aspas não contam: "olá (" não é parêntese aberto, e o # do enunciado
// não é código. Devolve a linha sem eles, do mesmo tamanho, para as colunas continuarem valendo.
export function semTextoNemComentario(linha) {
  let limpa = '';
  let aspa = '';
  for (const caractere of String(linha)) {
    if (aspa) {
      limpa += ' ';
      if (caractere === aspa) aspa = '';
      continue;
    }
    if (caractere === ASPA || caractere === APOSTROFO) { aspa = caractere; limpa += ' '; continue; }
    if (caractere === '#') break;
    limpa += caractere;
  }
  return { limpa, aspaAberta: aspa };
}

const ehCabecalho = limpa => CABECALHOS.some(palavra => new RegExp('^\\s*' + palavra + '\\b').test(limpa));
const recuo = linha => linha.length - linha.trimStart().length;

export function lerCodigo(codigo) {
  const linhas = String(codigo || '').split(NL);
  const pilha = [];
  const criadas = new Map();

  for (let indice = 0; indice < linhas.length; indice++) {
    const numero = indice + 1;
    const { limpa, aspaAberta } = semTextoNemComentario(linhas[indice]);
    if (aspaAberta) return { linha: numero, texto: `Linha ${numero}: uma aspa foi aberta e não foi fechada.` };

    for (const caractere of limpa) {
      if (ABRE.has(caractere)) pilha.push({ caractere, numero });
      else if (PARES[caractere]) {
        const ultimo = pilha.pop();
        if (!ultimo) return { linha: numero, texto: `Linha ${numero}: tem um ${caractere} a mais, sem o ${PARES[caractere]} correspondente.` };
      }
    }

    if (!limpa.trim()) continue;

    // Dois-pontos no fim do cabeçalho. Só cobra quando a linha não continua aberta em parêntese.
    if (ehCabecalho(limpa) && !pilha.length && !limpa.trimEnd().endsWith(':')) {
      return { linha: numero, texto: `Linha ${numero}: falta os dois-pontos no fim desta linha.` };
    }

    // if x = 1 é atribuição dentro de uma condição: em Python, erro de sintaxe.
    if (/^\s*(if|elif|while)\b/.test(limpa) && /[^=!<>+\-*/%]=[^=]/.test(limpa)) {
      return { linha: numero, texto: `Linha ${numero}: para comparar use ==; um = sozinho guarda um valor.` };
    }

    // Dentro de um try, a variável às vezes existe justamente para a linha falhar antes de
    // guardar qualquer coisa — é assim que a aula de exceções demonstra o erro. Cobrar uso ali
    // acusaria o exemplo correto da própria plataforma.
    const dentroDeTry = recuo(linhas[indice]) > 0 && linhas.slice(0, indice).some(anterior => /^\s*try\s*:/.test(anterior));
    const atribuicao = limpa.match(/^\s*([A-Za-z_]\w*)\s*=[^=]/);
    if (atribuicao && !dentroDeTry && !criadas.has(atribuicao[1])) criadas.set(atribuicao[1], numero);

    // Cabeçalho sem nada indentado depois dele: o bloco ficou vazio.
    if (ehCabecalho(limpa) && limpa.trimEnd().endsWith(':')) {
      const proxima = linhas.slice(indice + 1).find(item => semTextoNemComentario(item).limpa.trim());
      if (proxima && recuo(proxima) <= recuo(linhas[indice])) {
        return { linha: numero + 1, texto: `Linha ${numero}: o bloco abriu com dois-pontos, mas a linha seguinte não está indentada.` };
      }
    }
  }

  const aberto = pilha[pilha.length - 1];
  if (aberto) return { linha: aberto.numero, texto: `Linha ${aberto.numero}: falta fechar um ${aberto.caractere}.` };

  // Variável criada e nunca lida. Só avisa com o código já tomando forma, para não reclamar da
  // primeira linha que o estudante acabou de escrever.
  //
  // Aqui os usos são contados no código cru, com aspas e tudo: dentro de uma f-string o
  // {numero} é uso de verdade, e apagar o texto fazia a plataforma acusar de não usado um
  // exemplo correto do próprio currículo. Um nome citado num texto comum apenas silencia o
  // aviso — errar para menos é o lado seguro de errar.
  const corpo = linhas.map(linha => linha.split('#')[0]).join(NL);
  if (linhas.filter(linha => linha.trim()).length >= 3) {
    for (const [nome, numero] of criadas) {
      const usos = corpo.match(new RegExp('(?<![\\w.])' + nome + '(?![\\w])', 'g')) || [];
      if (usos.length <= 1) return { linha: numero, texto: `Linha ${numero}: você criou ${nome}, mas ainda não usou em lugar nenhum.` };
    }
  }
  return null;
}

// Uma frase só, curta, sobre o que o código está fazendo — nunca sobre o que falta fazer.
export function promptDaObservacao({ code, lessonId, challenge }) {
  const system = [
    'Você é o Lumi e está olhando por cima do ombro de um estudante brasileiro que ainda está escrevendo o código.',
    'Ele NÃO pediu ajuda. Você faz uma observação curta, de uma frase, e nada mais.',
    'É proibido dizer como resolver, citar função que ele ainda não escreveu, ou escrever código.',
    'Fale do que o código já faz, ou de algo que ele escreveu e talvez não tenha notado.',
    'Se não houver nada realmente útil a dizer, responda exatamente: nada.',
    'Português do Brasil, no máximo 20 palavras, sem saudação e sem elogio vazio.'
  ].join(String.fromCharCode(10));
  const user = [
    aulaEmTexto(lessonId),
    challenge && `O que o exercício pede: ${challenge}`,
    `Código como está neste momento:${String.fromCharCode(10)}${code}`
  ].filter(Boolean).join(String.fromCharCode(10) + String.fromCharCode(10));
  return { system, user };
}

export function filtrarObservacao(bruto, code) {
  const inteiro = String(bruto || '').trim();
  // Julga o texto inteiro antes de cortar: quem responde "Faça assim:" e um bloco de código
  // tinha a resposta na segunda linha, e ficar só com a primeira deixava uma frase órfã na tela.
  // Medido na bancada: ele escreveu "total += numero é uma abreviação" num exercício cuja tarefa
  // era exatamente essa linha. A trava do primeiro degrau não pegou, porque só olha chamada de
  // função, e ali não havia nenhuma — havia um operador. Numa observação de vinte palavras em
  // português não existe motivo legítimo para um sinal de igual: se aparece, é código.
  if (inteiro.includes('```') || inteiro.includes('=')) return '';
  const texto = inteiro.split(String.fromCharCode(10))[0].trim();
  if (!texto || /^nada[.!]?$/i.test(texto)) return '';
  // Mesma trava do primeiro degrau: citar o que ele ainda não escreveu é entregar a resposta.
  if (entregaSolucao(texto, code)) return '';
  return texto.length > 160 ? '' : texto;
}
