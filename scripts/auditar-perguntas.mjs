// Auditoria das perguntas de reflexão dos 70 passos de projeto.
//
// Uma delas estava demonstravelmente fora do lugar: o passo `calculadora/saldo` ensina `:.2f` e
// perguntava "O desconto das despesas usa soma ou subtração?", palavra que o passo nunca usa.
// Tentei transformar isso em teste e não dá: duas heurísticas de palavra reprovaram 43 e 54 dos
// 70 passos, quase tudo falso positivo, porque pergunta conceitual boa não repete o vocabulário
// do enunciado.
//
// Então aqui o modelo NÃO decide nada. Ele só sinaliza candidatos, três vezes, e só aparece na
// lista o passo sinalizado em pelo menos duas passadas. Quem lê a lista e reescreve sou eu.
//
//   node scripts/auditar-perguntas.mjs [filtro]
import { mentorAvailable, MENTOR_MODEL, ollamaUrl } from '../src/mentor.js';
import { projectSteps } from '../src/project-steps.js';

const NL = String.fromCharCode(10);
const PASSADAS = Number(process.env.PASSADAS || 3);
const FILTRO = process.argv[2] || '';

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

const system = [
  'Você audita o material de um curso de Python para iniciantes, em português do Brasil.',
  'Cada PASSO de projeto pede uma tarefa e, no fim, faz UMA pergunta de reflexão ao estudante.',
  'Sua única tarefa: dizer se a pergunta é sobre ESTE passo.',
  'A pergunta é adequada quando o estudante consegue respondê-la olhando o que ele acabou de escrever neste passo.',
  'A pergunta é inadequada em três casos, e só nestes:',
  '1. usa um termo que não aparece em lugar nenhum do passo, e o estudante não teria como saber a que se refere;',
  '2. pergunta sobre um assunto de outro passo, anterior ou posterior;',
  '3. ignora completamente a técnica nova que o passo introduz, perguntando algo trivial que já estava resolvido antes.',
  'Pergunta conceitual, aberta, ou que use outras palavras que as do enunciado é ADEQUADA. Isso é bom ensino, não defeito.',
  'Não sugira reescrita. Não comente estilo. Responda apenas o JSON pedido.',
  'Responda: {"adequada": true|false, "motivo": "<uma frase curta>", "caso": 0|1|2|3}'
].join(NL);

const perguntar = async passo => {
  const user = [
    `TAREFA DO PASSO: ${passo.instruction}`,
    `TÍTULO: ${passo.title}`,
    `PISTAS DO PASSO: ${(passo.hints || []).join(' | ')}`,
    `COMO CONFERIR: ${passo.check}`,
    '',
    `PERGUNTA DE REFLEXÃO: ${passo.question}`
  ].join(NL);
  const resposta = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      options: { temperature: 0.1, num_predict: 200 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!resposta.ok) throw new Error(`Ollama respondeu ${resposta.status}.`);
  const bruto = (await resposta.json()).message?.content || '';
  const achado = bruto.match(/\{[\s\S]*\}/);
  if (!achado) throw new Error('resposta sem JSON');
  const dados = JSON.parse(achado[0]);
  return { adequada: dados.adequada !== false, motivo: String(dados.motivo || '').slice(0, 160), caso: Number(dados.caso) || 0 };
};

const todos = Object.entries(projectSteps).flatMap(([projeto, passos]) => passos.map(passo => ({ projeto, passo })));
const escolhidos = todos.filter(item => !FILTRO || `${item.projeto}/${item.passo.id}`.includes(FILTRO));
console.log(`Modelo: ${MENTOR_MODEL} · ${escolhidos.length} passos · ${PASSADAS} passadas cada${NL}`);

const suspeitos = [];
let medidos = 0;
for (const { projeto, passo } of escolhidos) {
  const vereditos = [];
  for (let i = 0; i < PASSADAS; i++) {
    try { vereditos.push(await perguntar(passo)); medidos++; }
    catch (erro) { console.log(`  erro em ${projeto}/${passo.id}: ${erro.message}`); }
  }
  const contra = vereditos.filter(v => !v.adequada);
  // Só entra na lista o que foi apontado na maioria das passadas: um voto isolado é ruído.
  if (contra.length > PASSADAS / 2) {
    suspeitos.push({ projeto, passo, contra });
    console.log(`SUSPEITO (${contra.length}/${PASSADAS}) ${projeto}/${passo.id} · ${passo.title}`);
    console.log(`   tarefa:   ${passo.instruction.slice(0, 120)}`);
    console.log(`   pergunta: ${passo.question}`);
    for (const v of [...new Map(contra.map(v => [v.motivo, v])).values()]) console.log(`   caso ${v.caso}: ${v.motivo}`);
    console.log('');
  }
}

console.log(`${medidos} julgamentos feitos em ${escolhidos.length} passos. ${suspeitos.length} suspeitos para leitura humana.`);
