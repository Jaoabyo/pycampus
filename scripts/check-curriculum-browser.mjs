import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { initialState } from '../src/progress.js';
import { referenceSolution } from '../tests/curriculum-solutions.js';
import { alternativeSolution } from '../tests/curriculum-alternatives.js';

const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176');
  const cases = lessons.flatMap(l => [
    { id: l.id, kind: 'example', code: l.example, stdin: l.stdin || '' },
    { id: l.id, kind: 'solution', code: referenceSolution(l), stdin: l.stdin || '', expected: l.expected },
    // O segundo caminho: outros nomes, outra abordagem, mesma saída. Se ele parar de funcionar,
    // a prova de que a conferência não exige formato deixa de valer.
    ...(alternativeSolution(l.id) ? [{ id: l.id, kind: 'alternativa', code: alternativeSolution(l.id), stdin: l.stdin || '', expected: l.expected }] : [])
  ]);
  console.log(`Executando ${cases.length} programas no Python real (exemplos, soluções e caminhos alternativos)…`);
  const results = await page.evaluate(async cases => {
    const worker = new Worker('/python-worker.js');
    const results = [];
    try {
      for (const item of cases) {
        const result = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`Timeout ${item.id}/${item.kind}`)), 60000);
          worker.onmessage = ({ data }) => { if (data.type === 'result') { clearTimeout(timer); resolve(data); } };
          worker.onerror = error => { clearTimeout(timer); reject(new Error(error.message)); };
          worker.postMessage(item);
        });
        results.push({ id: item.id, kind: item.kind, ok: result.ok && (item.kind === 'example' || result.output.trim() === item.expected.trim()), output: result.output });
      }
    } finally { worker.terminate(); }
    return results;
  }, cases);
  const failed = results.filter(r => !r.ok);
  assert.deepEqual(failed, [], JSON.stringify(failed));
  console.log(`${results.length} execuções aprovadas.`);

  const legacyCode = 'texto = int("21")\nprint(texto * 2)';
  await page.evaluate(state => localStorage.setItem('pycampus.v1', JSON.stringify(state)), { ...initialState(), completed: ['ola', 'variaveis'], codes: { tipos: legacyCode } });
  await page.reload();
  // O texto do botão principal mudou para o rótulo do próximo passo pendente, que varia com o
  // progresso. Prender o teste a um texto fixo o deixou quebrado sem ninguém notar.
  await page.locator('.hero-button').click();
  await page.locator('.revision-notice').waitFor();
  assert.equal(await page.getByRole('textbox', { name: 'Editor de código Python' }).inputValue(), legacyCode);
  assert.ok((await page.locator('.challenge').innerText()).includes('Não precisa fazer nenhuma conta'));
  await page.getByRole('button', { name: 'Passo 2', exact: true }).click();
  assert.ok((await page.locator('.walkthrough-step').innerText()).includes('int(texto)'));
  await page.getByRole('button', { name: 'Uma ajudinha' }).click();
  assert.equal(await page.locator('.guided-hints p').count(), 1);
  await page.getByRole('button', { name: 'Mostrar outra dica' }).click();
  assert.equal(await page.locator('.guided-hints p').count(), 2);
  await page.getByRole('button', { name: 'Usar o início do exercício revisado' }).click();
  assert.equal(await page.locator('.revision-notice').count(), 0);
  const types = lessons.find(l => l.id === 'tipos');
  await page.getByRole('textbox', { name: 'Editor de código Python' }).fill(referenceSolution(types));
  await page.getByRole('radio').nth(types.answer).check();
  await page.getByRole('button', { name: 'Executar código' }).click();
  await page.getByRole('dialog', { name: 'Você conseguiu!' }).waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Concluir aula · +100 XP' }).click();
  await page.getByRole('dialog', { name: 'Aula concluída!' }).waitFor();
  await page.getByRole('button', { name: 'Confirmar e continuar' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('h1').click();
  await page.screenshot({ path: 'curriculum-review-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'curriculum-review-preview.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: /^Próxima aula: / }).click();
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Contas e operadores');
  await page.locator('.sidebar nav button').filter({ hasText: 'Projetos' }).click();
  await page.getByRole('button', { name: 'Ver projeto', exact: true }).first().click();
  await page.locator('.project-preparation summary').click();
  assert.ok((await page.locator('.project-preparation').innerText()).includes('try/except'));
  assert.ok(!(await page.locator('.requirements').innerText()).includes('entradas que não são números'));
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.locator('.sidebar nav button').filter({ hasText: 'Visão geral' }).click();
  await page.getByRole('button', { name: 'O que vamos aprender?' }).click();
  await page.getByPlaceholder('Busque por aula, tema ou projeto…').fill('Entrada, saída');
  await page.locator('.search-results button').first().click();
  await page.getByRole('textbox', { name: 'Editor de código Python' }).fill(referenceSolution(lessons.find(l => l.id === 'entrada')));
  await page.getByRole('button', { name: 'Executar código' }).click();
  await page.getByRole('textbox', { name: 'Resposta ao input' }).fill('21');
  await page.getByRole('button', { name: 'Enviar resposta' }).click();
  // A aula pede a idade do ano que vem: responder 21 tem de mostrar 22. Se voltasse 21, a
  // conversão não teria acontecido — era exatamente o buraco que deixava print(input()) passar.
  await page.waitForFunction(() => document.querySelector('.console')?.textContent === '22\n', null, { timeout: 60000 });
  const finalState = await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1')));
  assert.deepEqual(finalState.completed, ['ola', 'variaveis', 'tipos']);
  assert.equal(finalState.codeRevisions.tipos, 2);
  assert.deepEqual(errors, []);
  console.log('Interface: migração, passos, dicas, conclusão, próxima aula, projetos, input e celular aprovados.');
} finally { await browser.close(); }
