import { MENTOR_MODEL, ollamaUrl } from './mentor.js';

// Conferir só a saída não avalia nada: `print("resposta")` produz exatamente o que a aula
// espera sem fazer o que a aula ensina. Aqui o Lumi lê o código de verdade e responde uma
// pergunta só — este código cumpre o objetivo desta aula?
//
// Ele julga contra o `objective` e o `challenge` da aula, **nunca** contra a solução guardada,
// que ele nem recebe. É de propósito: o estudante pode trocar nomes de variáveis, inverter a
// ordem, usar laço no lugar de soma. Cobrar formato seria reprovar um acerto.
//
// O que ele recebe são fatos medidos em JavaScript, não impressões. Quando este projeto deixou
// o modelo observar código sozinho, ele afirmou três vezes que um arquivo com dez comentários
// não tinha nenhum. Fato medido entra como fato; ao modelo cabe só o juízo sobre o objetivo.

const NL = String.fromCharCode(10);

export function fatosDoCodigo(codigo) {
  const texto = String(codigo || '');
  const linhas = texto.split(NL);
  const semComentario = texto.replace(new RegExp('#[^' + String.fromCharCode(92) + 'n]*', 'g'), ' ');
  const nomes = expressao => [...new Set([...semComentario.matchAll(expressao)].map(achado => achado[1]))];
  return {
    linhasDeCodigo: linhas.filter(linha => linha.trim()).length,
    comentarios: linhas.filter(linha => linha.includes('#')).length,
    exemplosDeComentario: linhas.filter(linha => linha.includes('#')).map(linha => linha.trim()).slice(0, 4),
    funcoesChamadas: nomes(/\b([A-Za-z_]\w*)\s*\(/g),
    metodosUsados: nomes(/\.([A-Za-z_]\w*)\s*\(/g),
    variaveisCriadas: nomes(/^\s*([A-Za-z_]\w*)\s*=[^=]/gm),
    define: nomes(/\b(?:def|class)\s+(\w+)/g),
    usaLaco: /\b(?:for|while)\b/.test(semComentario),
    usaCondicional: /\bif\b/.test(semComentario),
    usaFString: /f"|f'/.test(semComentario)
  };
}

export function codeReviewPrompt({ lesson, codigo, saida }) {
  const fatos = fatosDoCodigo(codigo);
  const system = [
    'Você é o Lumi e está conferindo o exercício de um estudante brasileiro iniciante em Python.',
    'Responda uma pergunta só: este código cumpre o objetivo da aula?',
    'O programa já foi executado e a saída já está correta — isso não está em discussão.',
    'IMPORTANTE: não existe forma certa de escrever. Nome de variável, ordem das linhas, laço no',
    'lugar de soma, uma linha no lugar de três: tudo isso é escolha do estudante e não reprova.',
    'Só responda "cumpre": false quando o código chegou ao resultado SEM fazer o que a aula ensina —',
    'por exemplo, escrever a resposta pronta em vez de calculá-la, ou pular a técnica da aula.',
    'Escreva em português do Brasil, frases curtas, sem jargão. Fale com ele por "você".',
    'Em "porque", uma frase dizendo o que no código cumpre (ou deixa de cumprir) o objetivo.',
    'Em "poderia_melhorar", até duas observações sobre a abordagem dele. QUANDO NÃO HOUVER NADA RELEVANTE, DEVOLVA UMA LISTA VAZIA.',
    'Não invente melhoria para preencher espaço. Um código curto e correto para o objetivo da aula não precisa de nada.',
    'Nunca contrarie os fatos medidos. Se comentarios for maior que zero, o código TEM comentários: não peça para acrescentá-los.',
    'Não peça nada além do que a aula pediu: validação de entrada, tratamento de erro, função ou generalização que o enunciado não exige não são melhorias aqui, são fora de escopo.',
    'Nunca escreva o código pronto na resposta.',
    'Responda APENAS um JSON: {"cumpre":true,"porque":"uma frase","poderia_melhorar":["até duas frases"]}'
  ].join(NL);
  const user = [
    `Aula: ${lesson.title}`,
    `Objetivo da aula: ${lesson.objective}`,
    `Enunciado do desafio: ${lesson.challenge}`,
    `Código que o estudante escreveu:${NL}${codigo}`,
    saida ? `Saída que o programa produziu:${NL}${saida}` : '',
    `Fatos medidos neste código (contados por programa, são confiáveis): ${JSON.stringify(fatos)}`
  ].filter(Boolean).join(NL + NL);
  return { system, user };
}

const frases = valor => (Array.isArray(valor) ? valor : [])
  .slice(0, 2).map(item => String(item).trim().slice(0, 240)).filter(Boolean);

export function parseCodeReview(bruto) {
  const achado = typeof bruto === 'string' ? bruto.match(/\{[\s\S]*\}/) : null;
  if (!achado) throw new Error('Não consegui ler a resposta da conferência.');
  const dados = JSON.parse(achado[0]);
  // O veredito precisa ser explícito. Texto vago não vira aprovação por descuido.
  if (typeof dados.cumpre !== 'boolean') throw new Error('A conferência voltou sem um veredito claro. Peça de novo.');
  const porque = String(dados.porque || '').trim().slice(0, 300);
  if (!porque) throw new Error('A conferência voltou sem justificativa. Peça de novo.');
  return { cumpre: dados.cumpre, porque, melhorias: frases(dados.poderia_melhorar) };
}

export async function reviewCode({ lesson, codigo, saida, signal }) {
  if (!String(codigo || '').trim()) throw new Error('Não há código para conferir.');
  const { system, user } = codeReviewPrompt({ lesson, codigo, saida });
  const resposta = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      // Temperatura baixa porque aqui o retorno decide se a aula conclui: o mesmo código não
      // pode ser aprovado numa execução e reprovado na seguinte.
      options: { temperature: 0.1, num_predict: 380 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!resposta.ok) throw new Error(`Ollama respondeu ${resposta.status}.`);
  return parseCodeReview((await resposta.json()).message?.content);
}
