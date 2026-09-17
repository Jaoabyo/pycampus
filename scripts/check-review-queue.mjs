import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { initialState } from '../src/progress.js';

const base = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const state = initialState();
state.history = [
  { id: 'review-a', startedAt: '2026-09-17T10:00:00.000Z', source: 'lesson', lessonId: 'condicoes', title: 'Condicionais', code: 'if idade > 18:', stdin: '', output: 'SyntaxError', status: 'error', matched: false, durationMs: 400 },
  { id: 'review-b', startedAt: '2026-09-17T10:05:00.000Z', source: 'lesson', lessonId: 'condicoes', title: 'Condicionais', code: 'if idade > 18:', stdin: '', output: 'SyntaxError', status: 'error', matched: false, durationMs: 400 }
];
const browser = await chromium.launch({ channel: process.env.PYCAMPUS_TEST_BROWSER || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
const erros = [];
page.on('pageerror', error => erros.push(error.message));
page.on('console', message => { if (message.type() === 'error') erros.push(message.text()); });
await page.addInitScript(value => localStorage.setItem('pycampus.v1', JSON.stringify(value)), state);
await page.goto(base, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Mais', exact: true }).click();
await page.getByRole('button', { name: 'Diário de aprendizagem', exact: true }).click();
await page.getByRole('heading', { name: 'Seu diário indica o que revisar' }).waitFor();
assert.equal(await page.locator('.review-queue-item').count(), 1);
assert.match(await page.locator('.review-queue-item').first().innerText(), /Condicionais/);
assert.deepEqual(erros, [], `erros na fila de revisão: ${erros.join(' | ')}`);
console.log('Fila de revisão: erros agrupados e pergunta pedagógica exibida.');
await browser.close();
