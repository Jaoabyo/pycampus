import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { projectSteps } from '../src/project-steps.js';
import { calculatorGuide } from '../tests/calculator-reference.js';
import { projects, lessons } from '../src/curriculum.js';
import { practiceProjects } from '../src/practice-content.js';
import { functionBridges } from '../src/function-bridges.js';
import { initialState } from '../src/progress.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, acceptDownloads: true });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5176');
  assert.equal(await page.evaluate(() => crossOriginIsolated), true);
  const results = await page.evaluate(async steps => {
    const worker = new Worker('/python-worker.js');
    const results = [];
    try {
      for (const step of steps) {
        const buffer = new SharedArrayBuffer(8200), signal = new Int32Array(buffer, 0, 2);
        const entries = (step.stdin || '1200').split('\n');
        const result = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(Error(`Timeout: ${step.id}`)), 60000);
          worker.onerror = e => { clearTimeout(timer); reject(Error(e.message)); };
          worker.onmessage = ({ data }) => {
            if (data.type === 'input') {
              const bytes = new TextEncoder().encode(entries.shift() || '');
              new Uint8Array(buffer, 8).set(bytes);
              Atomics.store(signal, 1, bytes.length); Atomics.store(signal, 0, 1); Atomics.notify(signal, 0);
            }
            if (data.type === 'result') { clearTimeout(timer); resolve(data); }
          };
          worker.postMessage({ code: step.code, inputBuffer: buffer });
        });
        results.push({ id: step.id, ok: result.ok && result.output.trim() === step.expected, output: result.output });
      }
    } finally { worker.terminate(); }
    return results;
  }, projectSteps.calculadora.map(step => ({ ...step, code: calculatorGuide[step.id].example })));
  assert.deepEqual(results.filter(r => !r.ok), []);
  console.log('7 soluções de referência executaram; nenhuma é fornecida pelo estúdio.');
  const legacy = '# Meu código anterior\nrenda = 3000.0';
  // Só a primeira etapa estava liberada, então a partir do segundo projeto o botão vinha
  // desabilitado e a checagem travava sem nunca ter rodado até o fim. Uma etapa abre quando o
  // projeto da anterior está construído E conferido, então cada volta do laço libera todos os
  // outros projetos e deixa em branco justamente o que vai ser medido.
  const semear = async atual => {
    await page.evaluate(state => localStorage.setItem('pycampus.v1', JSON.stringify(state)), {
      ...initialState(),
      completed: lessons.map(l => l.id),
      learning: Object.fromEntries(practiceProjects.map(p => [p.id, { answered: p.investigate.answer, passed: ['modify', 'create'] }])),
      functionBridges: Object.fromEntries(functionBridges.map(b => [b.id, { passed: true, answered: b.answer, quizCorrect: true }])),
      projectChecks: Object.fromEntries(projects.map(p => [p.id, p.requirements.map((_, index) => index)])),
      projectStepsDone: Object.fromEntries(projects.filter(p => p.id !== atual).map(p => [p.id, projectSteps[p.id].map(s => s.id)])),
      projectReadmes: readmes,
      projectCodes: { calculadora: legacy }
    });
    await page.reload();
    await page.locator('.sidebar nav button').filter({ hasText: 'Projetos' }).click();
  };
  const readmes = {};
  await semear('calculadora');
  assert.equal(await page.locator('.project-card').count(), 8);
  for (let index = 0; index < projects.length; index++) {
    const p = projects[index];
    await semear(p.id);
    await page.locator('.project-card').filter({ hasText: p.title }).getByRole('button', { name: 'Construir passo a passo' }).click();
    assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), p.title);
    assert.equal(await page.locator('.studio-steps button').count(), projectSteps[p.id].length);
    assert.equal(await page.getByRole('button', { name: 'Usar este exemplo no editor' }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Registrar este passo' }).isDisabled(), true);
    if (p.id === 'calculadora') assert.equal(await page.getByRole('textbox', { name: 'Editor de código Python' }).inputValue(), legacy);
    await page.getByRole('button', { name: 'Me dê uma pista', exact: true }).click();
    assert.ok((await page.locator('.studio-work').innerText()).includes('Pista 1:'));
    assert.ok(!(await page.locator('.studio-work').innerText()).includes('Pista 2:'));
    await page.getByRole('button', { name: 'Preciso de mais uma pista' }).click();
    await page.getByRole('textbox', { name: 'Minha explicação do passo' }).fill(`Explicação escrita por mim para ${p.id}.`);
    // Construir e entregar viraram duas fases; o README mora na segunda.
    await page.getByRole('button', { name: /2 · Entregar/ }).click();
    await page.getByRole('textbox', { name: 'Texto do README' }).fill(`Descrição própria do projeto ${p.id}.`);
    await page.getByRole('button', { name: 'Próxima pergunta →', exact: true }).click();
    await page.getByRole('textbox', { name: 'Texto do README' }).fill(`Como usar ${p.id}.`);
    readmes[p.id] = { purpose: `Descrição própria do projeto ${p.id}.`, usage: `Como usar ${p.id}.` };
    await page.getByRole('button', { name: '2 · Baixar e testar' }).click();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar README.md', exact: true }).click();
    const file = await downloaded;
    assert.equal(file.suggestedFilename(), 'README.md');
    const text = readFileSync(await file.path(), 'utf8');
    assert.ok(text.includes(`Descrição própria do projeto ${p.id}.`));
    assert.ok(text.includes(`Como usar ${p.id}.`));
    await page.getByRole('button', { name: '3 · Publicar no GitHub' }).click();
    assert.ok((await page.locator('.studio-publish').innerText()).includes('Upload files'));
    if (p.id === 'api') {
      await page.getByRole('button', { name: /1 · Construir/ }).click();
      // O índice fixo apontava para outro passo desde que a API ganhou degraus novos.
      await page.locator('.studio-steps button').nth(projectSteps.api.findIndex(s => s.mode === 'local')).click();
      assert.equal(await page.getByRole('button', { name: 'Este passo é conferido fora do executor' }).isDisabled(), true);
      await page.getByText('Como passar do código para um servidor local', { exact: true }).click();
      assert.ok((await page.locator('.guided-example').innerText()).includes('uvicorn api:app'));
    }
    await page.getByRole('button', { name: 'Voltar para os projetos' }).click();
  }
  await semear('calculadora');
  await page.locator('.project-card').filter({ hasText: projects[0].title }).getByRole('button', { name: 'Construir passo a passo' }).click();
  await page.getByRole('button', { name: /Faça uma pergunta/ }).click();
  await page.getByRole('textbox', { name: 'Editor de código Python' }).fill('texto = input("Quanto é sua despesa? ")\nprint(texto)');
  await page.getByRole('button', { name: 'Testar o que escrevi' }).click();
  await page.getByRole('textbox', { name: 'Resposta ao input' }).waitFor({ timeout: 60000 });
  await page.getByRole('textbox', { name: 'Resposta ao input' }).fill('1200');
  await page.getByRole('button', { name: 'Enviar resposta' }).click();
  await page.waitForFunction(() => document.querySelector('.console')?.textContent === '1200\n');
  assert.equal(await page.getByRole('button', { name: 'Registrar este passo' }).isDisabled(), true, 'saída certa sozinha não registra a reflexão');
  await page.getByRole('textbox', { name: 'Minha explicação do passo' }).fill('input recebe texto. A frase entre aspas mostra a pergunta.');
  await page.getByLabel('Fiz a conferência indicada e registrei o que entendi.').check();
  await page.getByRole('button', { name: 'Registrar este passo' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { level: 1 }).click();
  await page.screenshot({ path: 'project-coaching-mobile.png', fullPage: true, animations: 'disabled' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('pycampus.v1')));
  assert.ok(state.projectStepsDone.calculadora.includes('pergunta'));
  assert.equal(state.history.at(-1).stdin, '1200');
  for (const p of projects) assert.equal(state.projectReadmes[p.id].purpose, `Descrição própria do projeto ${p.id}.`);
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.reload();
  await page.locator('.sidebar nav button').filter({ hasText: 'Projetos' }).click();
  await page.getByRole('button', { name: 'Construir passo a passo' }).first().click();
  assert.ok((await page.getByRole('textbox', { name: 'Minha explicação do passo' }).inputValue()).includes('input recebe texto'));
  assert.deepEqual(errors, []);
  console.log('8 estúdios: pistas, perguntas, README, download e guia GitHub aprovados. Input, registro, restauração e celular aprovados.');
} finally { await browser.close(); }
