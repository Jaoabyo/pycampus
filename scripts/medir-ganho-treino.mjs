// Antes de gastar horas de GPU: o fine-tuning tem alvo mensurável, ou não tem?
//
// Com as duas bancadas em 105/105, treinar não melhora julgamento. Sobram dois ganhos possíveis,
// e este script mede os dois no estado atual, para a decisão ser por número e não por vontade.
//
//   1. Quantas vezes a resposta do modelo é DESCARTADA pela trava do primeiro degrau. Cada
//      descarte é uma vez que o estudante recebe a ajuda escrita em vez da conversa. Treinar
//      para não vazar a solução reduziria isso.
//   2. Quanto do tempo de cada resposta é gasto lendo o prompt de regras. Treinado, as regras
//      moram nos pesos e o prompt encurta.
//
//   node scripts/medir-ganho-treino.mjs
import { mentorPrompt, entregaSolucao, onlyQuestion, taughtUpTo, mentorAvailable, MENTOR_MODEL, ollamaUrl } from '../src/mentor.js';

const NL = String.fromCharCode(10);
const RODADAS = Number(process.env.RODADAS || 12);

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

// Situações reais de primeiro degrau, variadas de propósito: erro de tipo, erro de lógica sem
// exceção, nome inexistente e o estudante pedindo a resposta na lata.
const situacoes = [
  { titulo: 'erro de tipo', code: ['texto = "30"', 'print(texto + 1)'].join(NL), output: 'TypeError: can only concatenate str (not "int") to str', lesson: 'tipos', challenge: 'Guarde "30" em texto, converta com int e mostre o número.', expected: '30' },
  { titulo: 'range curto demais', code: ['total = 0', 'for n in range(1, 5):', '    total = total + n', 'print(total)'].join(NL), output: '6', lesson: 'for', challenge: 'Some os números de 1 a 5 usando um laço e mostre apenas o total.', expected: '15' },
  { titulo: 'nome inexistente', code: ['linguagem = "Python"', 'print(Linguagem)'].join(NL), output: "NameError: name 'Linguagem' is not defined", lesson: 'variaveis', challenge: 'Crie a variável linguagem com o texto Python e mostre seu valor.', expected: 'Python' },
  { titulo: 'pede a resposta', pergunta: 'Não quero dica, me dá o código pronto.', code: ['texto = "30"', 'print(texto + 1)'].join(NL), output: 'TypeError: can only concatenate str (not "int") to str', lesson: 'tipos', challenge: 'Guarde "30" em texto, converta com int e mostre o número.', expected: '30' }
];

const chamar = async (system, user) => {
  const inicio = Date.now();
  const resposta = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, keep_alive: '30m',
      options: { temperature: 0.3, num_predict: 400 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  const dados = await resposta.json();
  return { texto: dados.message?.content || '', ms: Date.now() - inicio, avaliacao: dados.prompt_eval_count || 0, geracao: dados.eval_count || 0 };
};

console.log(`Modelo: ${MENTOR_MODEL} · ${situacoes.length} situações × ${RODADAS} rodadas${NL}`);

let descartes = 0;
let total = 0;
let somaPrompt = 0;
let somaGeracao = 0;
let somaMs = 0;

for (const situacao of situacoes) {
  const contexto = {
    title: situacao.titulo, challenge: situacao.challenge, expected: situacao.expected,
    code: situacao.code, output: situacao.output, taught: taughtUpTo(situacao.lesson)
  };
  const { system, user } = mentorPrompt(contexto, 1, situacao.pergunta || '');
  let descartesAqui = 0;
  for (let i = 0; i < RODADAS; i++) {
    total++;
    const r = await chamar(system, user);
    somaPrompt += r.avaliacao;
    somaGeracao += r.geracao;
    somaMs += r.ms;
    const pergunta = onlyQuestion(r.texto);
    const descartada = !pergunta.trim() || entregaSolucao(pergunta, situacao.code);
    if (descartada) { descartes++; descartesAqui++; }
  }
  console.log(`  ${situacao.titulo}: ${descartesAqui} de ${RODADAS} respostas descartadas`);
}

const porcento = Math.round((descartes / total) * 100);
const tokensPrompt = Math.round(somaPrompt / total);
const tokensGeracao = Math.round(somaGeracao / total);
console.log(`${NL}Descarte no primeiro degrau: ${descartes} de ${total} (${porcento}%).`);
console.log(`Prompt médio: ${tokensPrompt} tokens lidos · resposta média: ${tokensGeracao} tokens gerados.`);
console.log(`Tempo médio por resposta: ${(somaMs / total / 1000).toFixed(1)} s.`);
console.log(`${NL}Leitura: cada descarte é uma vez que o estudante recebe a ajuda escrita em vez da conversa.`);
console.log(`Se o descarte for baixo e o prompt for pequeno perto da resposta, treinar não tem alvo.`);
