import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { lessons, projects } from '../src/curriculum.js';
import { practiceProjects } from '../src/practice-content.js';
import { functionBridges } from '../src/function-bridges.js';
import { stepsFor } from '../src/project-steps.js';
import { initialState } from '../src/progress.js';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Exercita a alternativa para navegadores sem isolamento. Apenas no perfil temporário.
  await page.addInitScript(() => Object.defineProperty(globalThis, 'crossOriginIsolated', { value: false, configurable: true }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176');
  const state = {
    ...initialState(), completed: lessons.map(l => l.id),
    learning: Object.fromEntries(practiceProjects.map(p => [p.id, { answered: p.investigate.answer, passed: ['modify', 'create'] }])),
    functionBridges: Object.fromEntries(functionBridges.map(b => [b.id, { passed: true, answered: b.answer, quizCorrect: true }])),
    projectStepsDone: Object.fromEntries(projects.map(p => [p.id, stepsFor(p.id).map(s => s.id)])),
    projectChecks: Object.fromEntries(projects.map(p => [p.id, p.requirements.map((_, i) => i)])),
    projectPositions: { calculadora: 'entrada' },
    projectCodes: { calculadora: 'renda = float(input())\nprint(renda)' },
  };
  await page.evaluate(s => localStorage.setItem('pycampus.v1', JSON.stringify(s)), state);
  await page.reload();
  await page.locator('.sidebar nav button').filter({ hasText: 'Projetos' }).click();
  for (const p of projects) {
    await page.locator('.project-card').filter({ has: page.getByRole('heading', { name: p.title, exact: true }) }).getByRole('button', { name: 'Abrir estúdio' }).click();
    assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), p.title);
    assert.equal(await page.locator('.studio-steps button').count(), stepsFor(p.id).length);
    if (p.id === 'calculadora') {
      assert.equal(await page.getByRole('textbox', { name: 'Entradas do programa' }).inputValue(), stepsFor(p.id).find(s => s.id === 'entrada').stdin);
    }
    await page.getByRole('button', { name: '2 · Entregar e receber a nota' }).click();
    await page.getByRole('textbox', { name: 'Texto do README' }).fill(`Meu projeto ${p.title}: descrição de teste.`);
    await page.getByRole('button', { name: '2 · Baixar e testar' }).click();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar README.md', exact: true }).click();
    assert.equal((await downloaded).suggestedFilename(), 'README.md');
    await page.getByRole('button', { name: '3 · Publicar no GitHub' }).click();
    assert.match(await page.locator('.studio-publish').innerText(), /Upload files/);
    await page.getByRole('button', { name: 'Voltar para os projetos', exact: true }).click();
  }
  // O callback recebe a interrupção: a lição gerada não pode esperar uma Promise para sempre.
  await page.evaluate(async () => {
    const React = (await import('/node_modules/.vite/deps/react.js')).default;
    const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const { usePython } = await import('/src/useTrackedPython.js');
    function Probe() { const python = usePython(); window.executorProbe = python; return null; }
    const host = document.createElement('div'); document.body.append(host);
    window.probeRoot = createRoot(host); window.probeRoot.render(React.createElement(Probe));
  });
  await page.waitForFunction(() => window.executorProbe);
  await page.evaluate(() => {
    window.settledResults = [];
    executorProbe.run('while True:\n    pass', '', r => settledResults.push(r));
    executorProbe.stop();
    executorProbe.stop();
  });
  assert.equal(await page.evaluate(() => settledResults.length), 1);
  assert.equal(await page.evaluate(() => settledResults[0].kind), 'interrupted');
  await page.evaluate(() => probeRoot.unmount());
  assert.deepEqual(errors, []);
  console.log('8 estúdios, README e guia de entrega; resposta do passo retomado e interrupção do executor aprovados.');
} finally { await browser.close(); }
