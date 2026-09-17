import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
const erros = [];
page.on('pageerror', error => erros.push(error.message));
page.on('console', message => { if (message.type() === 'error') erros.push(message.text()); });

await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
assert.match(await page.title(), /Visão geral.*PyCampus/);
await page.getByRole('dialog', { name: /Você só precisa/ }).getByRole('button', { name: /Entendi/ }).click();
assert.ok(await page.getByRole('button', { name: /Começar agora|próximo passo/i }).count(), 'a primeira visita precisa ter uma ação visível');

await page.getByRole('button', { name: 'Mais', exact: true }).click();
await page.getByRole('button', { name: 'Minha faculdade', exact: true }).click();
await page.getByText('SEU PLANO DE HOJE').waitFor();
const guia = page.locator('.como-estudar');
await guia.locator('summary').click();
assert.equal(await guia.locator('.como-estudar-passos p').count(), 3, 'o guia precisa explicar os três passos');
const aulasHoje = page.locator('.plano-hoje-item');
assert.equal(await aulasHoje.count(), 2, 'o plano de primeira visita deve sugerir duas aulas');

await aulasHoje.first().click();
await page.getByRole('heading', { name: /A linguagem Python/ }).waitFor();
await page.getByRole('button', { name: 'Executar exemplo', exact: true }).click();
await page.locator('.code-workspace').first().getByText('✓ Executado').waitFor({ timeout: 120000 });
await page.getByRole('button', { name: /Voltar para a minha faculdade/ }).click();
await page.getByText('SEU PLANO DE HOJE').waitFor();
assert.equal(await page.locator('.plano-hoje-item').count(), 2, 'voltar deve preservar o plano');
await page.reload({ waitUntil: 'networkidle' });
assert.equal(await page.getByRole('dialog', { name: /Você só precisa/ }).count(), 0, 'o guia inicial não deve reaparecer depois de dispensado');
assert.deepEqual(erros, [], `erros durante a jornada iniciante: ${erros.join(' | ')}`);
console.log('Jornada iniciante: primeira visita, guia, plano, exemplo e retorno aprovados.');
await browser.close();
