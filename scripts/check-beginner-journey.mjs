import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { solucoesDaFaculdade } from '../tests/faculdade-reference.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({
  channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge',
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const erros = [];
page.on('pageerror', (error) => erros.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') erros.push(message.text());
});

await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
assert.match(await page.title(), /Visão geral.*PyCampus/);
const guiaInicial = page.getByRole('dialog', { name: /Você só precisa/ });
await guiaInicial.getByRole('button', { name: /Entendi/ }).waitFor();
assert.equal(
  await page.evaluate(() =>
    document.activeElement?.textContent?.includes('Entendi, vamos começar'),
  ),
  true,
  'o guia inicial deve começar no primeiro botão',
);
await page.keyboard.press('Tab');
assert.equal(
  await page.evaluate(() =>
    document.activeElement?.textContent?.includes('Agora não'),
  ),
  true,
  'Tab deve avançar dentro do guia',
);
await page.keyboard.press('Tab');
assert.equal(
  await page.evaluate(() =>
    document.activeElement?.textContent?.includes('Entendi, vamos começar'),
  ),
  true,
  'Tab no último controle deve voltar ao primeiro',
);
await page.keyboard.press('Shift+Tab');
assert.equal(
  await page.evaluate(() =>
    document.activeElement?.textContent?.includes('Agora não'),
  ),
  true,
  'Shift+Tab no primeiro controle deve voltar ao último',
);
await page.keyboard.press('Escape');
assert.equal(await guiaInicial.count(), 0, 'Esc deve fechar o guia inicial');
assert.ok(
  await page
    .getByRole('button', { name: /Começar agora|próximo passo/i })
    .count(),
  'a primeira visita precisa ter uma ação visível',
);

await page.getByRole('button', { name: 'Mais', exact: true }).click();
await page
  .getByRole('button', { name: 'Minha faculdade', exact: true })
  .click();
await page.getByText('SEU PLANO DE HOJE').waitFor();
const guia = page.locator('.como-estudar');
await guia.locator('summary').click();
assert.equal(
  await guia.locator('.como-estudar-passos p').count(),
  3,
  'o guia precisa explicar os três passos',
);
const aulasHoje = page.locator('.plano-hoje-item');
assert.equal(
  await aulasHoje.count(),
  2,
  'o plano de primeira visita deve sugerir duas aulas',
);

await aulasHoje.first().click();
await page.getByRole('heading', { name: /A linguagem Python/ }).waitFor();
await page.getByText('APRENDA UM TRECHO POR VEZ').waitFor();
assert.equal(await page.locator('.faculdade-trecho').count(), 1);
for (let i = 0; i < 3; i++)
  await page.getByRole('button', { name: 'Próximo trecho' }).click();
const treino = page.locator('.faculdade-treino');
await treino.getByRole('button', { name: 'Executar treino guiado' }).click();
await treino
  .locator('.console')
  .filter({ hasText: 'Media: 6.0' })
  .waitFor({ timeout: 120000 });
const editorTreino = treino.getByRole('textbox', {
  name: 'Editor de código Python',
});
await editorTreino.fill(
  (await editorTreino.inputValue()).replace('nota_a = "4"', 'nota_a = "6"'),
);
await treino.getByRole('button', { name: 'Executar treino guiado' }).click();
await treino
  .getByRole('status')
  .filter({ hasText: 'A saída da alteração bateu' })
  .waitFor({ timeout: 120000 });
assert.equal(
  await page.getByRole('heading', { name: /Qual tipo input/ }).count(),
  0,
);
const desafio = page.locator('section').filter({
  has: page.getByRole('heading', { name: 'Agora você', exact: true }),
});
await desafio
  .getByRole('textbox', { name: 'Editor de código Python' })
  .fill(solucoesDaFaculdade.u1a1);
await desafio
  .getByRole('button', { name: 'Executar código', exact: true })
  .click();
await page
  .getByText('Saída correta. Agora responda à revisão para registrar a aula.')
  .waitFor({ timeout: 120000 });
await page.getByRole('radio').first().check();
await page.getByRole('button', { name: 'Registrar esta aula' }).click();
await page.getByText('Esta aula já conta no seu estudo').waitFor();
await page.screenshot({
  path: join(tmpdir(), 'pycampus-faculdade-mobile.png'),
  fullPage: true,
});
await page
  .getByRole('button', { name: /Voltar para a minha faculdade/ })
  .click();
await page.getByText('SEU PLANO DE HOJE').waitFor();
assert.equal(
  await page.locator('.plano-hoje-item').count(),
  2,
  'voltar deve preservar o plano',
);
assert.equal(
  await page.locator('.faculdade-projeto').count(),
  4,
  'cada unidade oferece um projeto de integração',
);
await page.reload({ waitUntil: 'networkidle' });
assert.equal(
  await page.getByRole('dialog', { name: /Você só precisa/ }).count(),
  0,
  'o guia inicial não deve reaparecer depois de dispensado',
);

await page.getByRole('button', { name: 'Formação', exact: true }).click();
await page.getByText('TRILHA ACADÊMICA INTEGRADA').waitFor();
await page.locator('.faculdade-unidades-resumo details').first().locator('summary').click();
assert.equal(
  await page.locator('.faculdade-unidades-resumo details').first().locator('li').count(),
  6,
  'a formação deve mostrar as quatro aulas, o miniprojeto e a entrega da primeira unidade',
);
await page.screenshot({
  path: join(tmpdir(), 'pycampus-formacao-mobile.png'),
  fullPage: true,
});
await page
  .getByRole('navigation', { name: 'Atalhos principais' })
  .getByRole('button', { name: 'Projetos', exact: true })
  .click();
await page.getByText('TRABALHOS OFICIAIS · PRAZO 27 DE SETEMBRO').waitFor();
assert.equal(
  await page.locator('.faculdade-projeto-resumo').count(),
  4,
  'os quatro projetos acadêmicos devem aparecer no catálogo geral de projetos',
);

await page.locator('.search-trigger').click();
await page.getByPlaceholder(/Busque por aula/).fill('NumPy');
const resultadoAcademico = page.getByRole('button').filter({ hasText: 'Aula da faculdade' }).first();
await resultadoAcademico.waitFor();
await resultadoAcademico.click();
await page.getByText('APRENDA UM TRECHO POR VEZ').waitFor();
assert.match(
  await page.getByRole('heading', { level: 1 }).textContent(),
  /NumPy/,
  'a busca global deve abrir diretamente a aula acadêmica encontrada',
);
assert.deepEqual(
  erros,
  [],
  `erros durante a jornada iniciante: ${erros.join(' | ')}`,
);
console.log(
  'Jornada iniciante: primeira visita, guia, plano, exemplo e retorno aprovados.',
);
await browser.close();
