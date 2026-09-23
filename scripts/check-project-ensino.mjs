// Executa no Pyodide real cada exemplo do "Como fazer" dos projetos, com as entradas indicadas,
// e confere se a saída mostrada ao estudante é a saída verdadeira. MEDIR=1 só mostra o que saiu.
//
//   npm run dev -- --port 5176 --strictPort    (em outro terminal)
//   node scripts/check-project-ensino.mjs
import { chromium } from 'playwright';
import { ensinoDosProjetos } from '../src/project-ensino.js';

const BASE = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const MEDIR = process.env.MEDIR === '1';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await (await browser.newContext()).newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

// Os passos com servidor (FastAPI) rodam no computador e não são executados aqui.
const casos = Object.entries(ensinoDosProjetos).flatMap(([projeto, passos]) =>
  Object.entries(passos).map(([id, p]) => ({ projeto, id, ...p }))).filter((caso) => !caso.local);

// Um Python novo por exemplo: os exemplos do estoque gravam num arquivo, e um não pode herdar
// o banco que o anterior deixou.
const saidas = await page.evaluate(async (lista) => {
  let worker;
  const rodar = (codigo, stdin) => new Promise((resolve) => {
    worker?.terminate();
    worker = new Worker('/python-worker.js');
    const prazo = setTimeout(() => resolve({ ok: false, output: '(passou de 240s)' }), 240000);
    const aoReceber = (e) => {
      if (e.data.type !== 'result') return;
      clearTimeout(prazo);
      worker.removeEventListener('message', aoReceber);
      resolve({ ok: e.data.ok, output: String(e.data.output || '') });
    };
    worker.addEventListener('message', aoReceber);
    worker.postMessage({ type: 'run', code: codigo, stdin });
  });
  const resultado = [];
  for (const caso of lista) resultado.push(await rodar(caso.exemplo, caso.entrada));
  worker?.terminate();
  return resultado;
}, casos);
await browser.close();

const falhas = [];
casos.forEach((caso, i) => {
  const r = saidas[i];
  if (MEDIR) console.log(`--- ${caso.projeto}/${caso.id} (ok=${r.ok})\n${r.output}`);
  if (!r.ok) falhas.push(`${caso.projeto}/${caso.id}: o exemplo deu erro: ${r.output.slice(-200)}`);
  else if (r.output.trim() !== caso.saida.trim()) falhas.push(`${caso.projeto}/${caso.id}: a saída mostrada não é a real.\n  mostrada: ${JSON.stringify(caso.saida)}\n  real:     ${JSON.stringify(r.output.trim())}`);
});
if (falhas.length) {
  console.error('Exemplos com saída errada:');
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`Como fazer dos projetos: ${casos.length} exemplos executados no Pyodide, e a saída mostrada é a real.`);
