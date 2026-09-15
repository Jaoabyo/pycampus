// A verificação que faltava: não "esta função funciona?", e sim "uma sessão de estudo flui?".
//
// Todas as outras checagens dirigem uma tela direto, com o estado já pronto, e perguntam se o
// recurso responde. O estudante voltou de uma sessão real com seis defeitos que passaram por
// todas elas: o campo de explicação espremido por uma folha de estilo que não tinha chegado ao
// navegador, o botão de registrar cinza sem dizer o que faltava, o "Próximo passo" deixando ele
// no rodapé, a meta do dia ignorando quatro miniprojetos, e texto de molde do modelo impresso
// como se fosse elogio.
//
// O que todos têm em comum: só aparecem no meio do caminho, com progresso pela metade, e nunca
// numa tela aberta isoladamente. Então esta checagem percorre o caminho.
//
//   node scripts/jornada-de-estudo.mjs [url]
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { lessons } from '../src/curriculum.js';
import { initialState } from '../src/progress.js';

const NL = String.fromCharCode(10);
const BASE = process.argv[2] || process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const SAIDA = process.env.PYCAMPUS_SHOTS || '';

// Um dia de estudo pela metade: seis aulas feitas, quatro miniprojetos feitos hoje, dois passos
// do projeto registrados e o terceiro em aberto. É o estado em que os seis defeitos apareceram.
// O backup real do estudante, quando está à mão, é usado no lugar — é a evidência de origem.
const BACKUP = 'C:/Users/Usuario/Downloads/pycampus-backup-2026-09-14.json';
const hoje = new Date().toISOString().slice(0, 10);
const estadoParcial = () => JSON.stringify({
  ...initialState(),
  goal: 6,
  completed: lessons.slice(0, 6).map(l => l.id),
  activities: { [hoje]: [lessons[5].id, 'practice:cartao', 'practice:etiqueta', 'practice:compra', 'practice:crachas'] },
  learning: Object.fromEntries(['cartao', 'etiqueta', 'compra', 'crachas'].map(id => [id, { passed: ['modify', 'create'], earned: true }])),
  projectStepsDone: { calculadora: ['valores', 'total'] },
  projectPositions: { calculadora: 'saldo' },
  projectCodes: { calculadora: ['renda = 3000.0', 'despesa_1 = 1200.0', 'despesa_2 = 450.0', 'despesa_3 = 300.0', 'subtotal = despesa_1 + despesa_2 + despesa_3', 'total = renda - subtotal', 'print(f"{total:.2f}")'].join(NL) }
});
const estado = existsSync(BACKUP) ? readFileSync(BACKUP, 'utf8') : estadoParcial();
const diaDoEstado = (() => {
  const dias = Object.entries(JSON.parse(estado).activities || {}).sort();
  return dias.at(-1) || [hoje, []];
})();

// Texto que só existe dentro de um molde de prompt. Se aparecer na tela, o modelo copiou o
// exemplo e a plataforma imprimiu como se fosse conteúdo.
const MOLDE = ['até duas frases', 'uma pergunta curta', '<frase sua>', '<sua pergunta>', 'undefined', 'NaN', '[object Object]'];

const problemas = [];
const anotar = (tela, texto) => problemas.push(`${tela}: ${texto}`);

// Um botão desabilitado precisa dizer, na tela, o que falta. Procurar por palavras soltas como
// "escreva" perto dele não serve: medido contra o site antigo, o botão mudo passou porque a
// seção falava "Escreva sua explicação para o Lumi poder lê-la", que é outra coisa. A regra
// passa a ser explícita: o botão aponta, por aria-describedby, para um texto visível.
async function botoesMudos(page, tela) {
  const mudos = await page.evaluate(() => [...document.querySelectorAll('button.primary, .button.primary')]
    .filter(botao => botao.disabled && botao.offsetParent !== null)
    .filter(botao => {
      const alvos = (botao.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      return !alvos.some(id => (document.getElementById(id)?.innerText || '').trim());
    })
    .map(botao => botao.innerText.trim().slice(0, 60)));
  for (const rotulo of mudos) anotar(tela, `botão desabilitado sem dizer o que falta: "${rotulo}"`);
}

// A folha dona da classe precisa ter chegado ao navegador. display:inline num campo de
// formulário é a assinatura exata do defeito que o estudante viu.
async function estiloCaido(page, tela) {
  const caidos = await page.evaluate(() => {
    const esperado = { 'practice-field': 'block', 'step-head': 'flex', 'practice-gate': 'block', 'coach-confirm': 'flex' };
    return [...document.querySelectorAll('.practice-field, .step-head, .practice-gate, .coach-confirm')]
      .filter(el => el.offsetParent !== null)
      .filter(el => {
        const classe = Object.keys(esperado).find(c => el.classList.contains(c));
        return getComputedStyle(el).display !== esperado[classe];
      })
      .map(el => el.className);
  });
  for (const classe of caidos) anotar(tela, `folha de estilo não chegou: .${classe} caiu no display padrão`);
}

async function textoDeMolde(page, tela) {
  const corpo = (await page.locator('body').innerText()).toLowerCase();
  for (const termo of MOLDE) if (corpo.includes(termo.toLowerCase())) anotar(tela, `texto de molde na tela: "${termo}"`);
}

async function conferirTela(page, tela) {
  await botoesMudos(page, tela);
  await estiloCaido(page, tela);
  await textoDeMolde(page, tela);
  const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (extra > 0) anotar(tela, `rola ${extra}px na horizontal`);
}

const browser = await chromium.launch({ channel: 'msedge' });
for (const [nome, width, height] of [['desktop', 1440, 1000], ['celular', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript(s => { try { localStorage.setItem('pycampus.v1', s); } catch { /* modo privado */ } }, estado);
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/INSUFFICIENT_RESOURCES|favicon/.test(m.text())) erros.push(m.text().slice(0, 160)); });

  await page.goto(BASE).catch(() => {});
  await page.waitForTimeout(5000);
  const abrirMenu = async () => { if (width < 900) { await page.getByRole('button', { name: 'Abrir menu' }).click().catch(() => {}); await page.waitForTimeout(350); } };

  // 1. A visão geral: a meta do dia precisa bater com o que foi registrado no dia.
  const [dia, feitas] = diaDoEstado;
  const circulo = (await page.locator('.goal-circle').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
  const mostrado = Number((circulo.match(/^(\d+)/) || [])[1]);
  if (dia === hoje && mostrado !== feitas.length) anotar(`${nome}/visão geral`, `meta do dia mostra ${mostrado}, mas o dia tem ${feitas.length} atividades registradas`);
  await conferirTela(page, `${nome}/visão geral`);

  // 2. O passo de projeto onde ele parou.
  await abrirMenu();
  await page.getByRole('button', { name: /^Projetos$/ }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
  await page.locator('.project-card').first().getByRole('button', { name: /Construir passo a passo|Abrir estúdio/ }).click().catch(() => {});
  await page.waitForTimeout(2000);
  if (!await page.locator('.studio-work').count()) {
    anotar(`${nome}/projeto`, 'o estúdio do projeto não abriu');
  } else {
    await conferirTela(page, `${nome}/projeto`);
    if (SAIDA) await page.screenshot({ path: `${SAIDA}/jornada-projeto-${nome}.png`, fullPage: true }).catch(() => {});

    // 3. Trocar de passo tem de levar ao topo, não deixar no rodapé.
    await page.locator('.studio-work .button-row').first().scrollIntoViewIfNeeded();
    const proximo = page.getByRole('button', { name: /Próximo passo/ });
    if (await proximo.count()) {
      await proximo.click();
      await page.waitForTimeout(800);
      const depois = await page.evaluate(() => window.scrollY);
      if (depois > 4) anotar(`${nome}/projeto`, `"Próximo passo" deixou a página em ${depois}px, não no topo`);
    }
  }

  // 4. Um miniprojeto, que é onde o dia dele foi gasto.
  await abrirMenu();
  await page.getByRole('button', { name: /Oficina de prática/ }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.locator('.practice-card, .project-card').first().getByRole('button').last().click().catch(() => {});
  await page.waitForTimeout(2000);
  await conferirTela(page, `${nome}/miniprojeto`);
  const seguinte = page.getByRole('button', { name: /Próxima etapa/ });
  if (await seguinte.count()) {
    await page.locator('.practice-tools, .button-row').last().scrollIntoViewIfNeeded().catch(() => {});
    await seguinte.click();
    await page.waitForTimeout(700);
    const depois = await page.evaluate(() => window.scrollY);
    if (depois > 4) anotar(`${nome}/miniprojeto`, `"Próxima etapa" deixou a página em ${depois}px, não no topo`);
  }

  // 5. Uma aula, o caminho mais percorrido de todos.
  await abrirMenu();
  await page.getByRole('button', { name: /Minha formação/ }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
  await page.getByText(lessons[6].title).first().click().catch(() => {});
  await page.waitForTimeout(2000);
  await conferirTela(page, `${nome}/aula`);

  for (const erro of [...new Set(erros)]) anotar(nome, `erro no console: ${erro}`);
  await ctx.close();
}
await browser.close();

console.log(problemas.length
  ? `${problemas.length} ${problemas.length === 1 ? 'problema' : 'problemas'} na jornada:${NL}${[...new Set(problemas)].join(NL)}`
  : 'A jornada de estudo flui nas duas larguras.');
process.exitCode = problemas.length ? 1 : 0;
