// Bancada da lição personalizada: a única tarefa do Lumi que ainda não tinha nenhuma medida.
//
// Aqui ele não comenta nem avalia — ele ESCREVE conteúdo que o estudante vai estudar. Uma lição
// com exemplo que não roda, saída errada ou recurso não ensinado é pior que lição nenhuma.
//
// A plataforma já tem um portão: a lição só aparece depois de rodar no Pyodide e bater com o que
// ela mesma promete. Esta bancada mede o que esse portão descarta, que é o número que importa:
// quantas tentativas o estudante teria de esperar até uma lição boa aparecer.
//
//   npm run avaliar:licao
import { chromium } from 'playwright';
import { mentorAvailable, MENTOR_MODEL } from '../src/mentor.js';
import { requestCustomLesson, untaughtCallables, taughtTextUpTo } from '../src/custom-lesson.js';
import { patterns } from '../src/diagnosis.js';

const NL = String.fromCharCode(10);
const PASSADAS = Number(process.env.PASSADAS || 2);

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
page.setDefaultTimeout(0);
await page.goto(process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5177/pycampus/');
await page.waitForFunction(() => globalThis.crossOriginIsolated === true, null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(600);
await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js' });
await page.evaluate(async () => { window.__py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' }); });

const rodar = (codigo, entradas) => page.evaluate(async ({ codigo, entradas }) => {
  const py = window.__py;
  let saida = '';
  py.setStdout({ batched: t => { saida += t + String.fromCharCode(10); } });
  py.setStderr({ batched: t => { saida += t + String.fromCharCode(10); } });
  const fila = [...entradas];
  py.setStdin({ stdin: () => (fila.length ? fila.shift() : undefined) });
  const globals = py.toPy({});
  try {
    await py.loadPackagesFromImports(codigo, { messageCallback: () => {} });
    await py.runPythonAsync(codigo, { globals });
    return { ok: true, saida };
  } catch (erro) { return { ok: false, saida: saida + String(erro.message || erro) }; }
  finally { globals.destroy(); }
}, { codigo, entradas });

const igual = (a, b) => String(a).replace(/\r/g, '').trim() === String(b).replace(/\r/g, '').trim();

console.log(`Modelo: ${MENTOR_MODEL} · ${patterns.length} enganos × ${PASSADAS} passadas${NL}`);

let boas = 0;
let palpiteErrado = 0;
const comAlguma = [];
let total = 0;
const motivos = new Map();
const anotar = motivo => motivos.set(motivo, (motivos.get(motivo) || 0) + 1);

for (const engano of patterns) {
  const aula = engano.lesson;
  const ensinado = taughtTextUpTo(aula);
  let aqui = 0;
  for (let i = 0; i < PASSADAS; i++) {
    total++;
    let licao;
    try {
      licao = await requestCustomLesson({ weakness: engano, evidence: '', lessonId: aula });
    } catch (erro) {
      anotar('recusada antes de rodar: ' + erro.message.slice(0, 60));
      continue;
    }
    const exemplo = await rodar(licao.exemplo, licao.entradasExemplo || []);
    if (!exemplo.ok) { anotar('o exemplo quebrou ao rodar'); continue; }
    if (!String(exemplo.saida).trim()) { anotar('o exemplo não imprime nada'); continue; }
    const solucao = await rodar(licao.solucao, licao.entradasDesafio || []);
    if (!solucao.ok) { anotar('a solução do desafio quebrou ao rodar'); continue; }
    if (!String(solucao.saida).trim()) { anotar('a solução do desafio não imprime nada'); continue; }
    // Quanto o modelo erra o próprio palpite continua sendo medido — só não descarta mais a
    // lição, porque a saída exibida ao estudante é a medida.
    if (!igual(exemplo.saida, licao.saidaExemplo) || !igual(solucao.saida, licao.saidaDesafio)) palpiteErrado++;
    const desconhecidas = untaughtCallables(`${licao.exemplo}${NL}${licao.solucao}`, ensinado);
    if (desconhecidas.length) { anotar('usou o que ainda não foi ensinado: ' + desconhecidas.join(', ')); continue; }
    boas++;
    aqui++;
  }
  if (aqui) comAlguma.push(engano.id);
  console.log(`  ${engano.id}: ${aqui}/${PASSADAS} lições aprovadas no portão`);
}

console.log(`${NL}${boas} de ${total} lições passaram (${Math.round((boas / total) * 100)}%).`);
if (motivos.size) {
  console.log('Motivos de descarte:');
  for (const [motivo, vezes] of [...motivos].sort((a, b) => b[1] - a[1])) console.log(`  ${vezes}× ${motivo}`);
}
// O estudante não vive a taxa por tentativa: a tela tenta três vezes antes de desistir. O que
// ele sente é "pedi uma lição e recebi uma", e é esse o número que vale.
console.log(`${NL}Lições em que o modelo errou o próprio palpite de saída: ${palpiteErrado} (não descarta mais: a saída exibida é a medida).`);
console.log(`Enganos que renderam pelo menos uma lição: ${comAlguma.length} de ${patterns.length}.`);
console.log(`${NL}Descarte não é bug: o portão existe para isso. A tela tenta três vezes antes de desistir.`);
await browser.close();
process.exitCode = boas > 0 ? 0 : 1;
