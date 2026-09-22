import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { initialState } from '../src/progress.js';
import { solucoesEntregasFaculdade } from '../tests/faculdade-entregas-reference.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const browser = await chromium.launch({
  channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1365, height: 900 },
  acceptDownloads: true,
});

const estado = initialState();
estado.faculdade.feitas = ['u1a1', 'r1', 'r2', 'r3', 'u2a1', 'u2a2'];
await context.addInitScript((inicial) => {
  localStorage.setItem('pycampus.guia-inicial.v1', 'ok');
  if (!localStorage.getItem('pycampus.v1')) {
    localStorage.setItem('pycampus.v1', JSON.stringify(inicial));
  }
}, estado);

const page = await context.newPage();
const erros = [];
page.on('pageerror', (erro) => erros.push(erro.message));
page.on('console', (mensagem) => {
  if (mensagem.type() === 'error') erros.push(mensagem.text());
});

const progresso = async (quantidade) => {
  await page.waitForFunction(
    (valor) => document.querySelector('.entrega-progresso')
      ?.getAttribute('aria-label')?.startsWith(`${valor} de `),
    quantidade,
  );
};
const registrar = async (quantidade) => {
  await page.getByRole('button', { name: /Registrar este passo|Continuar/ }).click();
  await progresso(quantidade);
};

try {
  await page.goto(`${base}?tab=faculdade&faculty=entrega-u1`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Sistema de gestão de notas', exact: true }).waitFor();
  assert.match(page.url(), /faculty=entrega-u1/);
  await progresso(0);

  await registrar(1);
  await registrar(2);

  await page.locator('.entrega-fases').getByRole('button', { name: /Construir/ }).click();
  const editor = page.getByRole('textbox', { name: 'Editor de código Python' });

  await editor.fill(solucoesEntregasFaculdade['entrega-u1']);
  await registrar(3);
  await registrar(4);

  // Agora o passo que a conferência protege: "Separe o cálculo em uma função". Aqui entra o
  // código errado que um estudante real escreveu — `soma =+ nota` roda sem erro e devolve 2.25
  // onde a média é 7.5. A plataforma chamava isso de "Deu certo!" e deixava concluir o passo.
  await editor.fill([
    'notas = [6.0, 7.0, 8.0, 9.0]',
    'def calcular_media(notas):',
    '    if not notas:',
    '        return None',
    '    total = 0',
    '    for nota in notas:',
    '        soma =+ nota',
    '    return soma / len(notas)',
    'print(calcular_media(notas))',
  ].join('\n'));
  await page.getByRole('button', { name: 'Executar código' }).click();
  await page.locator('.entrega-conferencias.reprovada').waitFor({ timeout: 120_000 });
  const detalhe = await page.locator('.entrega-conferencias li.falha').first().innerText();
  assert.match(detalhe, /2\.25/, 'a conferência precisa mostrar o valor observado, não só reprovar');
  // Executado sem exceção, mas sem "Deu certo!": comemorar aqui é o defeito que isto corrige.
  assert.equal(await page.locator('.run-check').count(), 0, 'resultado errado não pode ser comemorado');
  await page.getByRole('button', { name: /Registrar este passo/ }).click();
  await progresso(4);
  assert.equal(
    await page.locator('.entrega-conferencias.reprovada').count(), 1,
    'o passo da função não pode ser concluído com a média errada',
  );

  // O mesmo passo, com o código correto, precisa destravar.
  await editor.fill(solucoesEntregasFaculdade['entrega-u1']);
  await page.getByRole('button', { name: 'Executar código' }).click();
  await page.locator('.entrega-conferencias.aprovada').waitFor({ timeout: 120_000 });
  await registrar(5);
  await registrar(6);

  await page.locator('.entrega-fases').getByRole('button', { name: /Testar/ }).click();
  await page.getByRole('button', { name: 'Executar código' }).click();
  await page.locator('.entrega-editor .console')
    .filter({ hasText: 'Média da turma: 7.0' })
    .waitFor({ timeout: 120_000 });
  await page.getByLabel('Casos testados').fill(
    'Testei média abaixo de 7, exatamente 7, acima de 7 e uma lista vazia; as saídas seguiram cada regra esperada.',
  );
  await registrar(7);

  await page.locator('.entrega-fases').getByRole('button', { name: /Explicar/ }).click();
  await page.getByLabel('Explique a lógica com suas palavras').fill(
    'A lista recebe as notas de entrada. A função percorre os valores, acumula o total e divide pela quantidade. Depois a comparação com sete escolhe a situação e o relatório mostra o resultado.',
  );
  await page.getByLabel('Conclusão').fill(
    'Os casos confirmam a média e os dois caminhos da decisão; a lista vazia continua sendo um limite tratado separadamente.',
  );
  await registrar(8);

  await page.locator('.entrega-fases').getByRole('button', { name: /Exportar/ }).click();
  await page.getByRole('heading', { name: 'Tudo conferido' }).waitFor();
  const baixar = page.getByRole('button', { name: /Baixar notebook/ });
  const relatorio = page.getByRole('button', { name: /Abrir relatório/ });

  // Sem identificação o arquivo sairia com "Preencher antes do envio" no lugar do nome, então
  // o download fica travado até o estudante se identificar.
  assert.equal(await baixar.isDisabled(), true, 'exportar sem nome e RA não pode ser possível');
  await page.getByLabel(/Seu nome completo/).fill('João Vítor Nunes De Quevedo');
  await page.getByLabel(/Identificação \(RA\)/).fill('RA-2026-0001');
  assert.equal(await baixar.isEnabled(), true);
  assert.equal(await relatorio.isEnabled(), true);

  const downloadEsperado = page.waitForEvent('download');
  await baixar.click();
  const download = await downloadEsperado;
  assert.match(download.suggestedFilename(), /sistema-de-gestao-de-notas\.ipynb$/);

  // O AVA aceita .docx ou .pdf até 10 MB. O arquivo precisa sair pronto, não como um HTML
  // que o estudante ainda tem de imprimir certo na véspera da entrega.
  const pdfEsperado = page.waitForEvent('download');
  await page.getByRole('button', { name: /Baixar PDF da entrega/ }).click();
  const pdf = await pdfEsperado;
  assert.match(pdf.suggestedFilename(), /\.pdf$/);
  const caminhoPdf = await pdf.path();
  const conteudoPdf = await readFile(caminhoPdf);
  assert.equal(conteudoPdf.subarray(0, 5).toString('latin1'), '%PDF-', 'o arquivo precisa ser um PDF de verdade');
  assert.ok(conteudoPdf.length > 1200, 'o PDF veio vazio demais para conter código e explicação');
  assert.ok(conteudoPdf.length < 10 * 1024 * 1024, 'o PDF precisa caber no limite de 10 MB do AVA');
  // O nome e o RA precisam sair impressos: é por eles que o professor identifica a entrega.
  // Um PDF bonito com "Preencher antes do envio" no lugar da identificação é um PDF inútil.
  const textoDoPdf = conteudoPdf.toString('latin1');
  for (const trecho of ['Quevedo', 'RA-2026-0001']) {
    assert.ok(textoDoPdf.includes(trecho), `o PDF entregue precisa imprimir ${trecho}`);
  }
  assert.ok(
    !textoDoPdf.includes('Preencher antes do envio'),
    'o PDF não pode sair com o texto de preenchimento no lugar da identificação',
  );

  const popupEsperado = page.waitForEvent('popup');
  await relatorio.click();
  const popup = await popupEsperado;
  await popup.waitForLoadState('domcontentloaded');
  assert.match(await popup.locator('body').innerText(), /Sistema de gestão de notas/);
  await popup.close();
  await registrar(9);

  await page.goto(`${base}?tab=faculdade&faculty=entrega-u4`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Classificação de flores Iris', exact: true }).waitFor();
  await page.locator('.entrega-fases').getByRole('button', { name: /Construir/ }).click();
  assert.match(await page.locator('.entrega-aviso').innerText(), /TensorFlow.*Google Colab/s);
  assert.equal(await page.getByRole('button', { name: 'Execute no Colab' }).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Executar prática local' }).isEnabled(), true);
  await page.locator('.entrega-fases').getByRole('button', { name: /Exportar/ }).click();
  assert.equal(await page.getByRole('button', { name: /Baixar notebook/ }).isDisabled(), true);
  await page.getByRole('button', { name: 'Registrar este passo' }).click();
  await page.getByText(/aulas-base pendentes/).waitFor();
  assert.equal(await page.getByRole('button', { name: /Abrir aula-base/ }).count(), 4);

  await page.reload({ waitUntil: 'networkidle' });
  assert.match(page.url(), /faculty=entrega-u4/);
  await page.getByRole('heading', { name: 'Classificação de flores Iris', exact: true }).waitFor();
  await page.getByRole('button', { name: /Web: front-end, back-end e Python.*Abrir aula-base/ }).click();
  assert.match(page.url(), /faculty=r4/);
  await page.getByRole('heading', { name: 'Web: front-end, back-end e Python', exact: true }).waitFor();

  await page.goto(`${base}?tab=faculdade&faculty=entrega-u1`, { waitUntil: 'networkidle' });
  await page.locator('.entrega-fases').getByRole('button', { name: /Construir/ }).click();
  assert.equal(await page.getByRole('textbox', { name: 'Editor de código Python' }).inputValue(), solucoesEntregasFaculdade['entrega-u1']);
  await page.getByRole('button', { name: /Voltar para Minha faculdade/ }).click();
  await page.getByLabel('6 de 16 aulas estudadas').waitFor();

  const atividades = await page.evaluate(() => {
    const salvo = JSON.parse(localStorage.getItem('pycampus.v1'));
    return Object.values(salvo.activities || {}).flat()
      .filter((id) => id.startsWith('faculdade-entrega:'));
  });
  assert.equal(atividades.length, new Set(atividades).size, 'um passo não pode entrar duas vezes no calendário');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}?tab=faculdade&faculty=entrega-u4`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
    'o estúdio não pode criar rolagem horizontal no celular',
  );
  assert.deepEqual(erros, []);
  console.log('Entregas da faculdade: U1 construída/exportada, U4 honesta no Colab, progresso 6/16 recuperado e celular aprovado.');
} finally {
  await browser.close();
}
