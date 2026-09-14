// O Lumi passou a receber a teoria da aula, o glossário do que está no código do estudante e o
// histórico dele. Isto mede se essa mudança aparece na resposta, em vez de só custar tokens.
//
// A pergunta: quando ele explica um conceito, usa as palavras da aula ou inventa as dele?
// Medida: quantos termos característicos da aula aparecem na resposta. Termo característico é
// o que a aula usa e o resto do currículo quase não usa, para não contar palavra comum.
//
//   node scripts/medir-aterramento.mjs
import { mentorPrompt, mentorAvailable, taughtUpTo, MENTOR_MODEL, ollamaUrl } from '../src/mentor.js';
import { lessons } from '../src/curriculum.js';

const NL = String.fromCharCode(10);
const RODADAS = Number(process.env.RODADAS || 6);

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

const palavras = texto => String(texto || '').toLowerCase().normalize('NFD')
  .replace(/[^a-z0-9 ]/g, ' ').split(/[ ]+/).filter(palavra => palavra.length > 4);

// Termo característico: aparece na teoria desta aula e em no máximo duas outras.
function termosDaAula(lessonId) {
  const aula = lessons.find(item => item.id === lessonId);
  const daAula = new Set(palavras([].concat(aula.theory).join(' ')));
  const frequencia = new Map();
  for (const outra of lessons) {
    for (const palavra of new Set(palavras([].concat(outra.theory).join(' ')))) {
      frequencia.set(palavra, (frequencia.get(palavra) || 0) + 1);
    }
  }
  return [...daAula].filter(palavra => (frequencia.get(palavra) || 0) <= 3);
}

const situacoes = [
  { lessonId: 'tipos', titulo: 'Tipos e conversões', challenge: 'Converta "21" para inteiro e mostre o número e o tipo.', expected: "21" + NL + "<class 'int'>",
    code: ['texto = "21"', 'print(texto + 1)'].join(NL), output: 'TypeError: can only concatenate str (not "int") to str' },
  { lessonId: 'listas', titulo: 'Listas', challenge: 'Adicione 40 à lista e imprima a soma.', expected: '100',
    code: ['numeros = [10, 20, 30]', 'numeros.append(40)', 'print(numeros)'].join(NL), output: '[10, 20, 30, 40]' },
  { lessonId: 'funcoes', titulo: 'Funções', challenge: 'Crie quadrado(numero) e imprima quadrado(7).', expected: '49',
    code: ['def quadrado(numero):', '    numero * numero', '', 'print(quadrado(7))'].join(NL), output: 'None' }
];

const chamar = async (system, user) => {
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
  return { texto: dados.message?.content || '', prompt: dados.prompt_eval_count || 0 };
};

console.log(`Modelo: ${MENTOR_MODEL} · degrau 2 (o que explica a ideia) · ${RODADAS} rodadas por aula${NL}`);
// Sem lessonId, aulaEmTexto e glossarioDoCodigo devolvem vazio: é exatamente o prompt de antes.
const COM_AULA = process.env.SEM_AULA !== '1';
console.log(COM_AULA ? 'Com a teoria da aula no prompt' : 'SEM a teoria da aula (como era antes)');

let somaTermos = 0;
let somaPrompt = 0;
let total = 0;
for (const situacao of situacoes) {
  const termos = termosDaAula(situacao.lessonId);
  const contexto = {
    title: situacao.titulo, lessonId: COM_AULA ? situacao.lessonId : '', challenge: situacao.challenge,
    expected: situacao.expected, code: situacao.code, output: situacao.output,
    taught: taughtUpTo(situacao.lessonId), history: []
  };
  const { system, user } = mentorPrompt(contexto, 2);
  let daAula = 0;
  for (let i = 0; i < RODADAS; i++) {
    total++;
    const r = await chamar(system, user);
    somaPrompt += r.prompt;
    const naResposta = new Set(palavras(r.texto));
    const encontrados = termos.filter(termo => naResposta.has(termo));
    daAula += encontrados.length;
    somaTermos += encontrados.length;
  }
  console.log(`  ${situacao.lessonId}: ${(daAula / RODADAS).toFixed(1)} termos da aula por resposta (a aula tem ${termos.length} termos próprios)`);
}

console.log(`${NL}Média: ${(somaTermos / total).toFixed(1)} termos característicos da aula por resposta.`);
console.log(`Prompt médio: ${Math.round(somaPrompt / total)} tokens.`);
console.log(`${NL}Zero significaria que ele explica por fora do material. Quanto maior, mais ele fala a língua da aula.`);
