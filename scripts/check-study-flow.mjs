import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { initialState } from '../src/progress.js';
import { practiceProjects } from '../src/practice-content.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176';
mkdirSync('artifacts/study', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.evaluate(s => localStorage.setItem('pycampus.v1', JSON.stringify(s)), {
    ...initialState(), completed: ['ola', 'variaveis', 'tipos', 'operadores', 'strings'],
  });
  await page.reload();
  const routes = ['Visão geral', 'Minha formação', 'Oficina de prática', 'Projetos', 'Laboratório Python', 'Treino dirigido', 'Modo prova', 'Diário de aprendizagem', 'Meu calendário', 'Conquistas', 'Meu perfil', 'Configurações', 'Sobre e limites'];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [index, name] of routes.entries()) {
      if (width === 390) await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
      await page.locator('.sidebar nav button').filter({ hasText: name }).first().click();
      await page.locator('main h1, main h2').first().waitFor();
      if (width === 390) await page.waitForFunction(() => document.querySelector('.sidebar').getBoundingClientRect().right <= 1);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `artifacts/study/${width}-${index}.png`, fullPage: true, animations: 'disabled' });
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 2).slice(0, 5).map(el => el.className) }));
      assert.ok(overflow.scroll <= width + 1, `${name}: ${JSON.stringify(overflow)}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.sidebar nav button').filter({ hasText: 'Oficina de prática' }).click();
  const p = practiceProjects.find(item => item.id === 'etiqueta');
  await page.locator('.practice-card').filter({ hasText: p.title }).getByRole('button', { name: 'Abrir miniprojeto' }).click();
  const tabs = page.locator('.practice-stage-tabs');
  assert.equal(await tabs.getByRole('button', { name: /Confira/ }).isDisabled(), true);
  assert.equal(await page.locator('.practice-quiz').count(), 0);
  assert.ok(await page.evaluate(() => document.querySelector('.practice-reading').getBoundingClientRect().top < document.querySelector('.practice-field').getBoundingClientRect().top));
  await page.getByPlaceholder('Acho que vai mostrar…').fill('312');
  await page.getByRole('button', { name: 'Executar o exemplo', exact: true }).click();
  await page.locator('.prediction-compare.is-diferente').waitFor({ timeout: 90000 });
  await tabs.getByRole('button', { name: /Mude/ }).click();
  const editor = page.getByRole('textbox', { name: 'Editor de código Python', exact: true });
  await editor.fill(p.example.replace('12', '15'));
  await page.getByRole('button', { name: 'Executar meu código', exact: true }).click();
  await page.locator('.run-check').waitFor({ timeout: 90000 });
  await editor.fill('print(1 / 0)');
  assert.equal(await page.locator('.run-check').count(), 0, 'acerto antigo sumiu ao editar');
  await page.getByRole('button', { name: 'Executar meu código', exact: true }).click();
  await page.locator('pre.console.error-text').waitFor();
  assert.equal(await page.locator('.run-check').count(), 0, 'erro não pode dizer Deu certo');
  await editor.fill(p.example.replace('12', '15'));
  await page.getByRole('button', { name: 'Executar meu código', exact: true }).click();
  await page.locator('.run-check').waitFor();
  await tabs.getByRole('button', { name: /Crie/ }).click();
  await editor.fill('print(30)');
  await page.getByRole('button', { name: 'Executar meu código', exact: true }).click();
  await page.locator('.code-review.is-pending').waitFor();
  assert.equal(await page.locator('.practice-success-dialog').count(), 0, 'saída sem cumprir objetivo não celebra');
  await editor.fill(p.solution);
  await page.getByRole('button', { name: 'Executar meu código', exact: true }).click();
  await page.getByRole('dialog', { name: 'Seu código passou neste teste!' }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/study/practice-success-mobile.png', animations: 'disabled' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.getByRole('button', { name: 'Entendi, continuar' }).click();
  await page.getByRole('button', { name: 'Conferir o que aprendi →' }).click();
  await page.locator('.practice-quiz .answer').nth(p.investigate.answer).click();
  await page.locator('.celebration-dialog').waitFor();
  await page.locator('.celebration-confirm').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('pycampus.v1')).learning.etiqueta.earned === true);
  await tabs.getByRole('button', { name: /Crie/ }).click();
  await editor.fill('print("revisando")');
  assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1')).learning.etiqueta.earned));
  await page.reload();
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.locator('.sidebar nav button').filter({ hasText: 'Oficina de prática' }).click();
  await page.locator('.practice-card').filter({ hasText: p.title }).getByRole('button', { name: 'Continuar', exact: true }).click();
  assert.equal(await tabs.getByRole('button', { name: /Crie/ }).getAttribute('aria-current'), 'step');
  assert.equal(await editor.inputValue(), 'print("revisando")');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/study/practice-editor-mobile.png', fullPage: true, animations: 'disabled' });
  assert.deepEqual(errors, []);
  console.log('26 telas + miniprojeto real: previsão, erro, objetivo, animação, revisão, XP e retomada aprovados.');
} finally { await browser.close(); }
