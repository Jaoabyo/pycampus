import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const destino = 'artifacts/faculdade-audit';
mkdirSync(destino, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge', headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1492, height: 861 } });
  await desktop.goto(base, { waitUntil: 'networkidle' });
  await desktop.locator('aside.sidebar nav button').filter({ hasText: 'Minha faculdade' }).click();
  await desktop.getByRole('heading', { name: /O conteúdo da sua/ }).waitFor();
  await desktop.screenshot({ path: `${destino}/faculdade-desktop.png`, fullPage: true, animations: 'disabled' });
  await desktop.locator('.faculdade-aula').first().click();
  await desktop.getByRole('heading', { name: 'Entenda em poucas ideias' }).waitFor();
  await desktop.screenshot({ path: `${destino}/aula-desktop.png`, fullPage: true, animations: 'disabled' });

  const celular = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await celular.goto(base, { waitUntil: 'networkidle' });
  await celular.getByRole('button', { name: 'Mais', exact: true }).click();
  await celular.locator('aside.sidebar nav button').filter({ hasText: 'Minha faculdade' }).click();
  await celular.getByRole('heading', { name: /O conteúdo da sua/ }).waitFor();
  await celular.screenshot({ path: `${destino}/faculdade-celular.png`, fullPage: true, animations: 'disabled' });
  console.log(`Capturas salvas em ${destino}.`);
} finally {
  await browser.close();
}
