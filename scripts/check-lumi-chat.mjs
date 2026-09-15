// Uma conversa real do Lumi sem depender de o Ollama estar instalado: o navegador recebe uma
// IA simulada e precisa mostrar as duas bolhas, salvar o resumo e continuar cabendo no celular.
// Uso: node scripts/check-lumi-chat.mjs [url]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { initialState } from '../src/progress.js';

const base = process.argv[2] || process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const ia = 'https://lumi-teste.example';
const browser = await chromium.launch({ channel: 'msedge', headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(state => localStorage.setItem('pycampus.v1', state), JSON.stringify({
    ...initialState(), completed: ['ola', 'variaveis', 'tipos', 'operadores', 'strings']
  }));
  const page = await context.newPage();
  const streams = [];
  await page.route(`${ia}/api/tags`, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ models: [{ name: 'qwen2.5-coder:14b' }] }) }));
  await page.route(`${ia}/api/chat`, route => {
    const request = route.request().postDataJSON();
    if (!request.stream) {
      const content = request.format === 'json'
        // Simula exatamente a contradição vista na tela: o motor precisa remover a pergunta.
        ? JSON.stringify({ suficiente: true, acertou: ['Explicou o caso igual a 18.'], faltou: [], pergunta: 'O que acontece exatamente em 18 anos?' })
        : 'ok';
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: { content } }) });
    }
    streams.push(request);
    const resposta = 'Você guardou o texto em uma variável e mostrou uma versão em maiúsculas. Veja se o valor guardado é o que você queria mostrar.';
    return route.fulfill({ contentType: 'application/x-ndjson', body: `${JSON.stringify({ message: { content: resposta.slice(0, 68) } })}\n${JSON.stringify({ message: { content: resposta.slice(68) } })}\n` });
  });

  await page.goto(`${base}?ia=${encodeURIComponent(ia)}`);
  await page.locator('.sidebar nav button').filter({ hasText: 'Oficina de prática' }).click();
  // A primeira prática liberada pode mudar conforme o currículo cresce; a conversa precisa
  // funcionar em qualquer uma delas.
  await page.locator('.practice-card').first().getByRole('button', { name: /Abrir miniprojeto|Continuar/ }).click();
  await page.getByRole('button', { name: /^3 · Mude$/ }).click();
  await page.locator('.lumi-call').waitFor();
  await page.locator('.lumi-call').click();
  await page.getByText('Pronto. Pergunte o que quiser sobre este exercício.').waitFor();
  const input = page.getByRole('textbox', { name: 'Pergunte ao Lumi' });
  await input.fill('Por que a saída ficou diferente?');
  await input.press('Enter');
  await page.locator('.mentor-bolha.is-voce').filter({ hasText: 'Por que a saída ficou diferente?' }).waitFor();
  await page.locator('.mentor-bolha.is-lumi').filter({ hasText: 'mostrou uma versão em maiúsculas' }).waitFor();
  assert.equal(streams.length, 1, 'Enter precisa enviar uma pergunta ao Lumi');
  await input.fill('Pode comentar meu raciocínio?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await page.locator('.mentor-bolha.is-voce').filter({ hasText: 'Pode comentar meu raciocínio?' }).waitFor();
  assert.equal(streams.length, 2, 'o botão precisa enviar uma pergunta ao Lumi');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('pycampus.v1') || '{}').lumiNotes?.length >= 2);
  const notas = await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1') || '{}').lumiNotes);
  assert.ok(notas.every(note => note.activityId && note.question && note.tip), 'a conversa precisa ficar resumida no diário');

  await page.getByRole('button', { name: /^2 · Investigue$/ }).click();
  await page.locator('.practice-field textarea').fill('A condição inclui o valor igual e escolhe entre o if e o else.');
  await page.getByRole('button', { name: 'Pedir ao Lumi para ler minha explicação' }).click();
  await page.locator('.explain-suficiente').waitFor();
  assert.equal(await page.locator('.explain-question').count(), 0, 'uma leitura completa não pode repetir como pergunta o que o estudante já explicou');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'o chat não pode cortar no celular');
  console.log('Lumi no navegador: botão, Enter, bolhas, resposta e histórico aprovados.');
} finally {
  await browser.close();
}
