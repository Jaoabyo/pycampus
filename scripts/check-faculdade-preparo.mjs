// Preparação para a prova: simulado de múltipla escolha e revisão espaçada dos erros.
// Percorre o caminho de quem estuda: abrir a revisão ainda vazia, fazer um simulado, ver o
// resultado por unidade, revisar os erros e voltar no dia seguinte com a revisão lembrando.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { initialState } from '../src/progress.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge' });
try {
  const estado = initialState();
  estado.faculdade.feitas = ['u1a1', 'r1', 'r2', 'r3'];
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.addInitScript((inicial) => {
    localStorage.setItem('pycampus.guia-inicial.v1', 'ok');
    if (!localStorage.getItem('pycampus.v1')) localStorage.setItem('pycampus.v1', JSON.stringify(inicial));
  }, estado);
  const page = await context.newPage();
  const erros = [];
  page.on('pageerror', (erro) => erros.push(erro.message));

  await page.goto(`${base}?tab=faculdade`, { waitUntil: 'networkidle' });
  const cartao = page.locator('.preparo-prova');
  await cartao.waitFor();
  assert.match(await cartao.innerText(), /MÚLTIPLA ESCOLHA/);

  // Sem nenhuma resposta ainda, a revisão explica como se enche — em vez de uma tela vazia muda.
  await cartao.getByRole('button', { name: /Revisão de hoje/ }).click();
  await page.getByRole('heading', { name: 'Nada para revisar hoje' }).waitFor();
  await page.getByRole('button', { name: /Fazer um simulado/ }).first().click();

  // Simulado: sem resposta durante a prova, cronômetro correndo.
  await page.getByRole('heading', { name: 'Treine no formato da prova' }).waitFor();
  await page.getByRole('button', { name: /Começar simulado/ }).click();
  await page.locator('.simulado-relogio').waitFor();
  assert.equal(await page.locator('.exercicio-bolha').count(), 10);
  await page.getByRole('radio').first().check();
  assert.equal(await page.locator('.exercicio-porque').count(), 0, 'o simulado não pode mostrar a resposta durante a prova');

  // Entregar com questões em branco pede confirmação: elas contam como erro.
  for (let i = 1; i < 10; i += 1) await page.getByRole('button', { name: /Próxima/ }).click();
  await page.getByRole('button', { name: /Entregar/ }).click();
  assert.match(await page.locator('.practice-feedback').innerText(), /em branco/);
  await page.getByRole('button', { name: /Entregar/ }).click();

  const resultado = page.locator('.simulado-resultado');
  await resultado.waitFor();
  assert.match(await resultado.innerText(), /de 10 certas/);
  assert.equal(await page.locator('.simulado-unidades > div').count(), 4, 'o resultado se divide pelas quatro unidades');
  assert.ok(await page.locator('.simulado-erro').count() >= 9, 'cada erro aparece com a certa e o motivo');

  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1')));
  assert.equal(salvo.simuladosFaculdade.length, 1);
  const erradas = Object.values(salvo.revisaoFaculdade).filter((r) => r.caixa === 0).length;
  assert.ok(erradas >= 9, 'os erros do simulado entram na revisão');

  // Revisar os erros: cada resposta recebe o motivo; errar devolve a questão para o fim.
  await resultado.getByRole('button', { name: /Revisar os erros agora/ }).click();
  await page.getByRole('heading', { name: 'Revisão dos seus erros' }).waitFor();
  await page.getByRole('radio').first().check();
  await page.locator('.exercicio-porque').waitFor();
  assert.ok((await page.locator('.exercicio-porque').innerText()).length > 60, 'a revisão explica a resposta');

  // Voltar no dia seguinte: o cartão lembra quantas questões esperam revisão.
  await page.getByRole('button', { name: /Voltar para a minha faculdade/ }).click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.match(await page.locator('.preparo-prova').innerText(), /questões? para rever/);
  assert.match(await page.locator('.preparo-prova').innerText(), /Último: \d+ de 10/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.preparo-prova').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sem rolagem lateral no celular');
  assert.deepEqual(erros, []);
  console.log('Preparação: revisão vazia explicada, simulado sem gabarito durante a prova, resultado por unidade, erros na revisão, retorno lembrado e celular aprovados.');
} finally {
  await browser.close();
}
