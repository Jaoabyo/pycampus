// O servidor imita o GitHub Pages: NÃO envia COOP/COEP. Se depois do service worker a página
// ficar isolada e o input() voltar a perguntar durante a execução, o conserto funciona no lugar
// onde o estudante realmente estuda.
import { chromium } from 'playwright';

const { initialState } = await import('../src/progress.js');
const NL = String.fromCharCode(10);
const BASE = process.argv[2] || process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5177/pycampus/';

const browser = await chromium.launch({ channel: 'msedge' });
// Contexto novo = sem service worker anterior, igual a quem abre o site pela primeira vez.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const problemas = [];

await page.goto(BASE);
// A recarga automática acontece assim que o service worker assume, e pode destruir o contexto
// no meio de uma leitura — por isso a primeira medida é tolerante.
console.log('1ª visita, isolada?', await page.evaluate(() => globalThis.crossOriginIsolated).catch(() => 'recarregou antes de eu medir'));
await page.waitForFunction(() => globalThis.crossOriginIsolated === true, null, { timeout: 30000 })
  .catch(() => problemas.push('a página não ficou isolada depois do service worker'));
console.log('depois do service worker, isolada?', await page.evaluate(() => globalThis.crossOriginIsolated));
console.log('SharedArrayBuffer disponível?', await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined'));

await page.evaluate(s => localStorage.setItem('pycampus.v1', JSON.stringify(s)),
  { ...initialState(), completed: ['ola', 'variaveis', 'tipos', 'operadores', 'strings'] });
await page.reload();
await page.waitForTimeout(1200);
await page.getByRole('button', { name: /Minha formação/ }).first().click();
await page.waitForTimeout(600);
await page.getByText('Entrada, saída e primeiros erros').first().click();
await page.waitForTimeout(1200);

const campo = await page.locator('.stdin textarea').inputValue().catch(() => '(sem campo)');
console.log('campo de entradas veio', JSON.stringify(campo), '(vazio é o certo quando dá para perguntar)');
if (campo !== '') problemas.push(`isolado, o campo devia vir vazio; veio ${JSON.stringify(campo)}`);

await page.getByRole('textbox', { name: 'Editor de código Python' })
  .fill(['texto = input("Qual sua idade? ")', 'print(int(texto) + 1)'].join(NL));
await page.getByRole('button', { name: /Executar código/ }).first().click();

// O programa tem de PARAR e perguntar.
const pergunta = page.getByRole('textbox', { name: /Resposta ao input/ });
await pergunta.waitFor({ timeout: 180000 }).catch(() => problemas.push('o programa não parou para perguntar'));
if (await pergunta.count()) {
  const rotulo = await page.locator('.input-request, .stdin-request').first().innerText().catch(() => '');
  console.log('perguntou:', JSON.stringify(rotulo.split(NL)[0] || '(sem rótulo visível)'));
  await pergunta.fill('21');
  await page.getByRole('button', { name: /Enviar resposta/ }).click();
  await page.waitForTimeout(4000);
  const saida = (await page.locator('pre.console').first().innerText()).trim();
  console.log('saída depois de responder:', JSON.stringify(saida));
  if (!saida.endsWith('22')) problemas.push(`devia terminar em 22, veio ${JSON.stringify(saida)}`);
}
await browser.close();
process.exitCode = problemas.length ? 1 : 0;
console.log(NL + (problemas.length ? 'PROBLEMAS:' + NL + problemas.join(NL) : 'O input() voltou a perguntar durante a execução num servidor igual ao publicado.'));
