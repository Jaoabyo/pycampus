import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import * as icons from '../src/icons.js';

// Um nome de ícone errado não quebra nada: o componente cai no Code2 e a tela mostra </>
// no lugar do desenho. Como falha em silêncio, só um teste pega.
const source = readdirSync(new URL('../src', import.meta.url))
  .filter(file => file.endsWith('.jsx'))
  .map(file => ({ file, text: readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8') }));

const names = ({ text }) => [
  ...text.matchAll(/<Icon\s[^>]*?name="([^"]+)"/g),
  ...text.matchAll(/<Icon\s[^>]*?name=\{[^}]*?'([A-Za-z0-9]+)'\s*:\s*'([A-Za-z0-9]+)'/g)
].flatMap(match => match.slice(1)).filter(Boolean);

test('every icon named in the interface really exists in the registry', () => {
  const missing = [];
  for (const item of source) {
    for (const name of names(item)) if (!(name in icons)) missing.push(`${item.file}: ${name}`);
  }
  assert.deepEqual(missing, [], 'ícone inexistente cairia no desenho genérico sem avisar');
});
