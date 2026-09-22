// Browser plugin not available: validation uses the installed Playwright + Edge.
// Flow: finish the last exercise -> earn XP and badges -> completed unit collapses -> next opens.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unidadeCompleta } from '../tests/faculdade-recompensas-fixture.js';
import { exercicioDaUnidade } from '../src/faculdade-exercicios.js';
import { xpTotal } from '../src/progress.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const state = unidadeCompleta();
  state.faculdade.feitas = state.faculdade.feitas.filter(id => id !== 'ex-u1');
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.addInitScript(inicial => {
    localStorage.setItem('pycampus.guia-inicial.v1', 'ok');
    if (!localStorage.getItem('pycampus.v1')) localStorage.setItem('pycampus.v1', JSON.stringify(inicial));
  }, state);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}?tab=faculdade`, { waitUntil: 'networkidle' });
  assert.match(await page.title(), /faculdade/i);
  assert.equal(await page.locator('vite-error-overlay').count(), 0);
  assert.equal(await page.locator('.faculdade-unidade-toggle[aria-expanded="true"]').count(), 1);
  await page.locator('#conteudo-u1').getByRole('button', { name: /Exercício da Unidade 1/ }).click();
  const exercicio = exercicioDaUnidade('u1');
  for (const [i, questao] of exercicio.questoes.entries()) {
    // Primeiro erramos de propósito para conferir se há ensino no feedback.
    if (i === 0) {
      await page.getByRole('radio').nth((questao.resposta + 1) % questao.opcoes.length).check();
      assert.match(await page.locator('.exercicio-porque').innerText(), /Ainda não/);
      assert.ok((await page.locator('.exercicio-porque').innerText()).length > 100);
    }
    await page.getByRole('radio').nth(questao.resposta).check();
    if (i < exercicio.questoes.length - 1) await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Registrar este exercício' }).click();
  const dialog = page.locator('.celebration-dialog[open]');
  await dialog.waitFor();
  assert.match(await dialog.innerText(), /300 XP/);
  assert.match(await dialog.innerText(), /Unidade 1 completa/);
  await dialog.getByRole('button', { name: 'Confirmar e continuar' }).click();
  await page.getByRole('button', { name: 'Todas as aulas da faculdade' }).click();
  assert.equal(await page.locator('#conteudo-u1').isVisible(), false);
  assert.equal(await page.locator('#conteudo-u2').isVisible(), true);
  assert.match(await page.locator('.faculdade-mapa-unidade').first().innerText(), /Unidade completa/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1')));
  assert.equal(xpTotal(saved), xpTotal(state) + 300);
  const primeira = page.locator('.faculdade-unidade-toggle').first();
  await primeira.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#conteudo-u1').isVisible(), true);
  await primeira.click();
  await page.locator('.faculdade-mapa').scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(tmpdir(), 'pycampus-faculdade-xp-desktop.png'), fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#conteudo-u1').isVisible(), false);
  assert.equal(await page.locator('#conteudo-u2').isVisible(), true);
  assert.equal(await page.locator('.celebration-dialog[open]').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('.sidebar').getBoundingClientRect().right <= 1);
  await page.locator('.faculdade-mapa').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: join(tmpdir(), 'pycampus-faculdade-xp-mobile.png'), fullPage: true });
  await page.goto(`${base}?tab=faculdade&faculty=entrega-u4`, { waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('button', { name: 'Executar o exemplo', exact: true }).count(), 0);
  await page.locator('.entrega-fases').getByRole('button', { name: /Construir/ }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar rascunho para o Colab' }).click();
  assert.match((await download).suggestedFilename(), /^rascunho-.*\.ipynb$/);
  assert.deepEqual(errors, []);
  console.log('Faculdade: erro com explicação, +300 XP, emblema, unidade recolhida, próxima aberta, teclado, restauração e celular aprovados. Rascunho Colab acessível antes da entrega.');
} finally { await browser.close(); }
