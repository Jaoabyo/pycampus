import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({
  channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge',
  headless: true
});

const paginas = [
  'Visão geral',
  'Minha formação',
  'Oficina de prática',
  'Projetos',
  'Laboratório Python',
  'Minha faculdade',
  'Treino dirigido',
  'Modo prova',
  'Diário de aprendizagem',
  'Meu calendário',
  'Conquistas',
  'Meu perfil',
  'Configurações',
  'Sobre e limites'
];

function acompanharErros(page, erros, contexto) {
  page.on('pageerror', error => erros.push(`${contexto}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') erros.push(`${contexto}: console: ${message.text()}`);
  });
}

async function conferirPagina(page, nome, tamanho) {
  await page.locator('main').waitFor({ state: 'visible' });
  const carregamento = page.locator('main > .page-skeleton');
  if (await carregamento.count()) await carregamento.waitFor({ state: 'detached', timeout: 10_000 });
  const ativo = page.locator('aside.sidebar button.active').filter({ hasText: nome });
  assert.equal(await ativo.count(), 1, `${tamanho}: ${nome} não ficou marcada como página ativa`);
  assert.equal(await ativo.getAttribute('aria-current'), 'page', `${tamanho}: ${nome} não informou a página atual para acessibilidade`);
  assert.match(await page.title(), /PyCampus$/, `${tamanho}: ${nome} não atualizou o título da página`);
  assert.equal(await carregamento.count(), 0, `${tamanho}: ${nome} ficou presa no carregamento`);
  const barras = page.getByRole('progressbar');
  for (let i = 0; i < await barras.count(); i += 1) {
    assert.ok((await barras.nth(i).getAttribute('aria-label'))?.trim(), `${tamanho}: ${nome} tem uma barra de progresso sem nome acessível`);
  }
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `${tamanho}: ${nome} criou rolagem horizontal`
  );
}

async function navegarDesktop(page, nome) {
  await page.locator('aside.sidebar nav button').filter({ hasText: nome }).first().click();
  await conferirPagina(page, nome, 'desktop');
}

async function navegarCelular(page, nome) {
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  const menu = page.locator('aside.sidebar');
  await menu.waitFor({ state: 'visible' });
  await menu.locator('nav button').filter({ hasText: nome }).first().click();
  await conferirPagina(page, nome, 'celular');
}

try {
  const erros = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  acompanharErros(desktop, erros, 'desktop');
  await desktop.goto(base, { waitUntil: 'networkidle' });
  await desktop.evaluate(() => window.dispatchEvent(new Event('offline')));
  await desktop.locator('.connection-status').waitFor();
  await desktop.evaluate(() => window.dispatchEvent(new Event('online')));
  await desktop.locator('.connection-status').waitFor({ state: 'detached' });
  for (const pagina of paginas) await navegarDesktop(desktop, pagina);

  const celular = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  acompanharErros(celular, erros, 'celular');
  await celular.goto(base, { waitUntil: 'networkidle' });
  await celular.getByRole('button', { name: 'Mais', exact: true }).click();
  await celular.locator('aside.sidebar.open').waitFor();
  await celular.keyboard.press('Escape');
  await celular.locator('aside.sidebar.open').waitFor({ state: 'detached' });
  for (const pagina of paginas) await navegarCelular(celular, pagina);

  assert.deepEqual(erros, [], `erros do navegador:\n${erros.join('\n')}`);
  console.log(`Abas: ${paginas.length} páginas aprovadas em desktop e celular (${paginas.length * 2} navegações).`);
} finally {
  await browser.close();
}
