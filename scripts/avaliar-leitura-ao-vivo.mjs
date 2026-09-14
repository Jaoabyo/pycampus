// A dica que aparece sozinha enquanto o estudante escreve é a função mais fácil de estragar o
// exercício: basta ela dizer o que falta, e a aula acabou. Esta bancada mede exatamente isso,
// contra códigos pela metade, que é quando ela dispara na vida real.
//
//   npm run avaliar:ao-vivo
import { mentorAvailable, MENTOR_MODEL, ollamaUrl, entregaSolucao } from '../src/mentor.js';
import { promptDaObservacao, filtrarObservacao, lerCodigo } from '../src/leitura-ao-vivo.js';


const NL = String.fromCharCode(10);
const PASSADAS = Number(process.env.PASSADAS || 3);

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

// Código pela metade, como fica de verdade no meio da digitação.
const metades = [
  { nome: 'aula de tipos, só leu', lessonId: 'tipos', challenge: 'Converta "30" para inteiro e mostre o número.',
    code: ['texto = "30"'].join(NL), proibido: [/int\s*\(/] },
  { nome: 'aula de for, laço começado', lessonId: 'for', challenge: 'Some os números de 1 a 5 usando um laço e mostre apenas o total.',
    code: ['total = 0', 'for n in range(1, 6):'].join(NL), proibido: [/total\s*\+/, /total\s*=\s*total/] },
  { nome: 'função sem return', lessonId: 'funcoes', challenge: 'Crie quadrado(numero) e imprima quadrado(7).',
    code: ['def quadrado(numero):', '    numero * numero'].join(NL), proibido: [/\breturn\b/] },
  { nome: 'entrada sem converter', lessonId: 'entrada', challenge: 'Leia uma idade, converta e mostre a idade do ano que vem.',
    code: ['texto = input("Qual sua idade? ")', 'print(texto)'].join(NL), proibido: [/int\s*\(/] }
];

const observar = async caso => {
  const { system, user } = promptDaObservacao(caso);
  const resposta = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, keep_alive: '30m',
      options: { temperature: 0.2, num_predict: 60 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  const bruto = (await resposta.json()).message?.content || '';
  return { bruto: String(bruto).trim(), filtrado: filtrarObservacao(bruto, caso.code) };
};

console.log(`Modelo: ${MENTOR_MODEL} · ${metades.length} códigos pela metade × ${PASSADAS} passadas${NL}`);

let vazamentos = 0;
let mudos = 0;
let total = 0;
for (const caso of metades) {
  // A camada medida não pode estar falando sobre um código que ainda está sendo escrito.
  const medida = lerCodigo(caso.code);
  const falas = [];
  for (let i = 0; i < PASSADAS; i++) {
    total++;
    const { bruto, filtrado } = await observar(caso);
    if (!filtrado) mudos++;
    const vazou = caso.proibido.some(regra => regra.test(filtrado)) || (filtrado && entregaSolucao(filtrado, caso.code));
    if (vazou) vazamentos++;
    falas.push({ filtrado, vazou, bruto });
  }
  const soltas = falas.filter(fala => fala.filtrado).length;
  console.log(`${falas.some(f => f.vazou) ? 'VAZOU' : 'ok   '} ${caso.nome}: ${soltas}/${PASSADAS} falaram · medida diz: ${medida ? JSON.stringify(medida.texto) : 'nada'}`);
  for (const fala of falas.filter(f => f.filtrado)) console.log(`         ${fala.vazou ? 'ENTREGOU: ' : ''}${JSON.stringify(fala.filtrado)}`);
  for (const fala of falas.filter(f => !f.filtrado && f.bruto && !/^nada[.!]?$/i.test(f.bruto))) {
    console.log(`         (descartado pela trava: ${JSON.stringify(fala.bruto.slice(0, 80))})`);
  }
}

console.log(`${NL}${vazamentos} de ${total} observações entregaram a resposta. ${mudos} ficaram caladas.`);
console.log('Calado é aceitável; entregar a resposta não é.');
process.exitCode = vazamentos === 0 ? 0 : 1;
