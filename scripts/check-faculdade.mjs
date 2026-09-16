// Executa no Pyodide real todo código da trilha da faculdade: exemplo, starter e solução de
// cada aula. A regra do projeto vale aqui igual: conteúdo que a plataforma promete é executado,
// nunca inspecionado. Quando MEDIR=1, imprime a saída medida para preencher os `esperado`.
//
//   node scripts/check-faculdade.mjs        confere
//   MEDIR=1 node scripts/check-faculdade.mjs   mostra a saída real de cada programa
import { chromium } from 'playwright';
import { aulasDaFaculdade } from '../src/faculdade.js';
import { solucoesDaFaculdade } from '../tests/faculdade-reference.js';

const NL = String.fromCharCode(10);
const BASE = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const MEDIR = process.env.MEDIR === '1';

const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(BASE).catch(() => {});
await page.waitForTimeout(4000);

// Um worker por programa: pandas e matplotlib deixam estado global, e um exemplo não pode
// depender do que o anterior carregou.
const rodar = async (codigo, stdin = '') => page.evaluate(async ([src, entrada]) => {
  const worker = new Worker('/python-worker.js');
  return await new Promise(resolve => {
    const prazo = setTimeout(() => { worker.terminate(); resolve({ ok: false, output: '(passou de 240s)' }); }, 240000);
    worker.onmessage = evento => {
      if (evento.data.type !== 'result') return;
      clearTimeout(prazo); worker.terminate();
      resolve({ ok: evento.data.ok, output: String(evento.data.output || '') });
    };
    worker.postMessage({ type: 'run', code: src, stdin: entrada });
  });
}, [codigo, stdin]);

// Avisos de infraestrutura não são a saída do estudante.
const limpar = texto => texto.split(NL)
  .filter(linha => !/^(Loading |Loaded |packaging already|Matplotlib is building)/.test(linha.trim()))
  .join(NL).trim();

const problemas = [];
let programas = 0;

for (const aula of aulasDaFaculdade) {
  programas++;
  const exemplo = await rodar(aula.exemplo);
  const saidaExemplo = limpar(exemplo.output);
  if (!exemplo.ok) problemas.push(`${aula.id}: o exemplo não executou — ${saidaExemplo.split(NL).pop()}`);
  if (MEDIR) console.log(`### ${aula.id} · exemplo${NL}${saidaExemplo}${NL}`);

  // O starter é o ponto de partida do estudante: ele pode estar incompleto, mas nunca pode
  // explodir num erro que pareça culpa dele antes de escrever qualquer coisa.
  programas++;
  const inicio = await rodar(aula.starter);
  if (!inicio.ok && !/SyntaxError/.test(inicio.output)) {
    problemas.push(`${aula.id}: o starter já começa com erro — ${limpar(inicio.output).split(NL).pop()}`);
  }

  const solucao = solucoesDaFaculdade[aula.id];
  if (!solucao) { problemas.push(`${aula.id}: sem solução de referência em tests/faculdade-reference.js`); continue; }
  programas++;
  const resultado = await rodar(solucao);
  const medido = limpar(resultado.output);
  if (MEDIR) { console.log(`### ${aula.id} · solução${NL}${medido}${NL}`); continue; }
  if (!resultado.ok) problemas.push(`${aula.id}: a solução guardada não executou — ${medido.split(NL).pop()}`);
  else if (!aula.esperado) problemas.push(`${aula.id}: o desafio não tem saída esperada`);
  else if (medido !== aula.esperado.trim()) problemas.push(`${aula.id}: a solução produz ${JSON.stringify(medido)} e o desafio espera ${JSON.stringify(aula.esperado.trim())}`);
}

await browser.close();
if (MEDIR) { console.log(`${programas} programas executados.`); process.exit(0); }
console.log(problemas.length
  ? `${programas} programas executados · ${problemas.length} problemas:${NL}${problemas.join(NL)}`
  : `${programas} programas da trilha da faculdade executaram no Python real e bateram com o prometido.`);
process.exitCode = problemas.length ? 1 : 0;
