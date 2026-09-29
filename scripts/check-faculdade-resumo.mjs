// Roda no Pyodide o "código que cai" de cada cartão da revisão rápida e o "outro exemplo" de
// cada degrau, e confere que a saída escrita é a que o Python produz de verdade. MEDIR=1 mostra
// as saídas reais.
import { chromium } from 'playwright';
import { resumosDaFaculdade } from '../src/faculdade-resumo.js';
import { outrosExemplos } from '../src/faculdade-outros-exemplos.js';

const BASE = process.env.PYCAMPUS_TEST_URL || 'http://localhost:5176/';
const MEDIR = process.env.MEDIR === '1';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await (await browser.newContext()).newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

const casos = [
  ...Object.entries(resumosDaFaculdade).map(([id, cartao]) => ({ id: `cartão ${id}`, ...cartao })),
  ...Object.entries(outrosExemplos).flatMap(([aula, degraus]) => Object.entries(degraus)
    .map(([degrau, exemplo]) => ({ id: `outro exemplo ${aula}/${degrau}`, ...exemplo }))),
];
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

// Na primeira vez que um Python novo carrega o Matplotlib, ele avisa que está montando o cache
// de fontes. O aviso é do ambiente, não do exemplo, e não entra na comparação.
const semAvisoDoAmbiente = (texto) => texto.replace(/^Matplotlib is building the font cache; this may take a moment\.\n?/m, '').trim();

const falhas = [];
casos.forEach((caso, i) => {
  const r = saidas[i];
  if (MEDIR) console.log(`--- ${caso.id} (ok=${r.ok})\n${r.output}`);
  if (!r.ok) falhas.push(`${caso.id}: o código deu erro: ${r.output.slice(-200)}`);
  else if (semAvisoDoAmbiente(r.output) !== caso.saida.trim()) falhas.push(`${caso.id}: a saída escrita não é a real.\n  escrita: ${JSON.stringify(caso.saida)}\n  real:    ${JSON.stringify(semAvisoDoAmbiente(r.output))}`);
});
if (falhas.length) {
  console.error('Códigos com saída errada:');
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`Cartões e outros exemplos: ${casos.length} códigos executados no Pyodide, e a saída escrita é a real.`);
