// Mede, no Python real do PyCampus, quais bibliotecas realmente carregam.
//
// Existe para não responder de memória. Toda afirmação do tipo "esta biblioteca funciona" na
// plataforma precisa ter passado por aqui: o ambiente é o Pyodide, não um Python comum, e a
// lista de pacotes muda a cada versão. Uma biblioteca prometida e ausente é pior do que uma
// biblioteca ausente e declarada.
//
//   node scripts/medir-bibliotecas.mjs
import { chromium } from 'playwright';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const NL = String.fromCharCode(10);

// Cada entrada é um teste mínimo, mas de verdade: importar não basta, a biblioteca precisa
// produzir alguma coisa. Uma importação que funciona e um primeiro uso que quebra enganaria.
const bibliotecas = [
  ['numpy', 'import numpy as np\nprint(np.array([1, 2, 3]).sum())'],
  ['pandas', 'import pandas as pd\nprint(len(pd.DataFrame({"a": [1, 2]})))'],
  ['matplotlib', 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nplt.bar(["a"], [1])\nprint(len(plt.gca().patches))'],
  ['sqlite3', 'import sqlite3\nc = sqlite3.connect(":memory:")\nc.execute("CREATE TABLE t (v INTEGER)")\nprint("ok")'],
  ['seaborn', 'import seaborn as sns\nprint(sns.__version__)'],
  ['scikit-learn', 'from sklearn.datasets import load_iris\nprint(load_iris().data.shape)'],
  ['scipy', 'import scipy\nprint(scipy.__version__)'],
  ['statsmodels', 'import statsmodels.api as sm\nprint(sm.__version__)'],
  ['pillow', 'from PIL import Image\nprint(Image.new("RGB", (2, 2)).size)'],
  ['networkx', 'import networkx as nx\nprint(nx.Graph().number_of_nodes())'],
  ['sympy', 'import sympy\nprint(sympy.sqrt(8))'],
  ['plotly', 'import plotly\nprint(plotly.__version__)'],
  ['tensorflow', 'import tensorflow as tf\nprint(tf.__version__)'],
  ['torch', 'import torch\nprint(torch.__version__)'],
  ['kivymd', 'import kivymd\nprint(kivymd.__version__)'],
  ['requests', 'import requests\nprint(requests.__version__)'],
  ['beautifulsoup4', 'from bs4 import BeautifulSoup\nprint(BeautifulSoup("<p>a</p>", "html.parser").text)'],
  ['openpyxl', 'import openpyxl\nprint(openpyxl.__version__)'],
];

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

// Um worker por biblioteca: um import que falha não pode contaminar o próximo teste.
const rodar = async (codigo) =>
  page.evaluate(
    async (src) => {
      const worker = new Worker('/python-worker.js');
      return await new Promise((resolve) => {
        const prazo = setTimeout(() => {
          worker.terminate();
          resolve({ ok: false, output: '(passou de 180s)' });
        }, 180000);
        worker.onmessage = (evento) => {
          if (evento.data.type !== 'result') return;
          clearTimeout(prazo);
          worker.terminate();
          resolve({ ok: evento.data.ok, output: String(evento.data.output || '') });
        };
        worker.postMessage({ type: 'run', code: src, stdin: '' });
      });
    },
    codigo,
  );

const limpar = (texto) =>
  texto
    .split(NL)
    .filter((linha) => !/^(Loading |Loaded |packaging already|Matplotlib is building)/.test(linha.trim()))
    .join(NL)
    .trim();

// Pacotes que não vêm na distribuição do Pyodide mas instalam em tempo de execução pelo
// micropip. Vale medir separado: o custo é um download na primeira vez, não a ausência.
const porMicropip = ['seaborn', 'plotly', 'openpyxl'];

const disponiveis = [];
const ausentes = [];
for (const [nome, codigo] of bibliotecas) {
  const resultado = await rodar(codigo);
  const saida = limpar(resultado.output);
  if (resultado.ok) {
    disponiveis.push([nome, saida.split(NL).pop()]);
    console.log(`  OK      ${nome.padEnd(16)} ${saida.split(NL).pop()}`);
  } else {
    const motivo = saida.split(NL).pop() || 'falhou sem mensagem';
    ausentes.push([nome, motivo]);
    console.log(`  AUSENTE ${nome.padEnd(16)} ${motivo.slice(0, 90)}`);
  }
}

for (const pacote of porMicropip) {
  const resultado = await rodar(
    `import micropip${NL}await micropip.install("${pacote}")${NL}import ${pacote}${NL}print(${pacote}.__version__)`,
  );
  const saida = limpar(resultado.output).split(NL).pop() || 'falhou sem mensagem';
  if (resultado.ok) {
    disponiveis.push([`${pacote} (micropip)`, saida]);
    console.log(`  MICROPIP ${pacote.padEnd(15)} ${saida}`);
  } else {
    ausentes.push([pacote, saida]);
    console.log(`  AUSENTE  ${pacote.padEnd(15)} ${saida.slice(0, 90)}`);
  }
}

await browser.close();
console.log(`${NL}${disponiveis.length} bibliotecas disponíveis, ${ausentes.length} ausentes.`);
console.log(`Disponíveis: ${disponiveis.map(([nome]) => nome).join(', ')}`);
console.log(`Ausentes: ${ausentes.map(([nome]) => nome).join(', ')}`);
