import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { initialState, localDate } from '../src/progress.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
mkdirSync('artifacts/visual-experience', { recursive: true });
const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge', headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto(base, { waitUntil: 'networkidle' });
  await desktop.getByText('Missão do dia').waitFor();
  await desktop.screenshot({ path: 'artifacts/visual-experience/dashboard-1440.png', fullPage: true, animations: 'disabled' });
  await desktop.getByRole('button', { name: /Minha formação/ }).click();
  await desktop.getByLabel('Mapa da formação').waitFor();
  await desktop.getByRole('button', { name: 'Lista', exact: true }).click();
  await desktop.locator('.curriculum-list').waitFor();
  await desktop.getByRole('button', { name: 'Mapa', exact: true }).click();
  const stage = desktop.locator('.map-node').first();
  if (await stage.getAttribute('aria-expanded') !== 'true') await stage.click();
  await desktop.locator('.map-lessons button').first().click();
  await desktop.getByRole('button', { name: 'Ver aula completa' }).waitFor();
  assert.equal(await desktop.locator('#passo-2').count(), 0, 'o foco abriu mais de um passo');
  await desktop.getByRole('button', { name: /Continuar para o exemplo/ }).click();
  await desktop.locator('#passo-2').waitFor();
  assert.equal(await desktop.locator('#passo-1').count(), 0, 'o passo anterior continuou visível no foco');
  await desktop.screenshot({ path: 'artifacts/visual-experience/foco-1440.png', fullPage: true, animations: 'disabled' });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await mobile.locator('.mobile-bottom-nav').isVisible(), true);
  assert.ok(await mobile.getByText('Missão do dia').isVisible());
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'a visão geral criou rolagem horizontal');
  const tiny = await mobile.evaluate(() => [...document.querySelectorAll('main *')].filter(element => {
    const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
    const ownText = element.childElementCount === 0 && element.textContent.trim();
    return ownText && rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight && parseFloat(style.fontSize) < 10.5;
  }).map(element => `${element.className || element.tagName}: ${getComputedStyle(element).fontSize}`));
  assert.deepEqual(tiny, [], `texto pequeno demais no celular: ${tiny.join(', ')}`);
  await mobile.screenshot({ path: 'artifacts/visual-experience/dashboard-390.png', fullPage: true, animations: 'disabled' });
  await mobile.getByRole('button', { name: 'Formação', exact: true }).click();
  await mobile.getByLabel('Mapa da formação').waitFor();
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'o mapa criou rolagem horizontal');
  await mobile.screenshot({ path: 'artifacts/visual-experience/mapa-390.png', fullPage: true, animations: 'disabled' });

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reduced.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await reduced.locator('.python-tile').evaluate(element => getComputedStyle(element).animationName), 'none');

  const targeted = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const targetedState = { ...initialState(), completed: ['funcoes'] };
  const targetedUi = { lessonMode: 'focus', courseView: 'map', lessonSteps: {}, dailyMission: {
    date: localDate(), items: [{ key: 'practice:ponte:ponte-funcao-chamar', kind: 'practice', id: 'ponte-funcao-chamar', sub: 'ponte', label: 'Fazer as pontes de função', baseline: 0 }]
  } };
  await targeted.addInitScript(({ state, ui }) => { localStorage.setItem('pycampus.v1', JSON.stringify(state)); localStorage.setItem('pycampus.ui.v1', JSON.stringify(ui)); }, { state: targetedState, ui: targetedUi });
  await targeted.goto(base, { waitUntil: 'networkidle' });
  await targeted.locator('.daily-mission').getByRole('button', { name: 'Abrir', exact: true }).click();
  await targeted.getByRole('heading', { name: 'Criar não é executar' }).waitFor();
  assert.equal(await targeted.getByRole('heading', { name: /Vamos praticar/ }).count(), 0, 'a missão abriu a capa da oficina em vez da ponte indicada');
  assert.deepEqual(errors, []);
  console.log('Visual: missão com destino exato, mapa, foco, celular e movimento reduzido aprovados.');
} finally {
  await browser.close();
}
