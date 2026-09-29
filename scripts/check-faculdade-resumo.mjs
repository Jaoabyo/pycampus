// Roda no Pyodide o "código que cai" de cada cartão da revisão rápida e confere que a saída
// escrita no cartão é a que o Python produz de verdade. MEDIR=1 mostra as saídas reais.
import { chromium } from 'playwright';
import { resumosDaFaculdade } from '../src/faculdade-resumo.js';

const BASE = process.env.PYCAMPUS_TEST_URL || 'http://localhost:5176/';
const MEDIR = process.env.MEDIR === '1';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await (await browser.newContext()).newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

const casos = Object.entries(resumosDaFaculdade).map(([id, cartao]) => ({ id, ...cartao }));
// Um Python novo por cartão: nenhum herda variáveis ou gráficos do anterior.
const saidas = await page.evaluate(async (lista) => {
  let worker;
  const rodar = (codigo) => new Promise((resolve) => {
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
    worker.postMessage({ type: 'run', code: codigo, stdin: '' });
  });
  const resultado = [];
  for (const caso of lista) resultado.push(await rodar(caso.codigo));
  worker?.terminate();
  return resultado;
}, casos);
await browser.close();

const falhas = [];
casos.forEach((caso, i) => {
  const r = saidas[i];
  if (MEDIR) console.log(`--- ${caso.id} (ok=${r.ok})\n${r.output}`);
  if (!r.ok) falhas.push(`${caso.id}: o código deu erro: ${r.output.slice(-200)}`);
  else if (r.output.trim() !== caso.saida.trim()) falhas.push(`${caso.id}: a saída do cartão não é a real.\n  no cartão: ${JSON.stringify(caso.saida)}\n  real:      ${JSON.stringify(r.output.trim())}`);
});
if (falhas.length) {
  console.error('Cartões com saída errada:');
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`Revisão rápida: ${casos.length} códigos executados no Pyodide, e a saída do cartão é a real.`);
