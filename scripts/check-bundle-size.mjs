import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const limiteGzip = 190_000;
const arquivos = (await readdir('dist/assets')).filter(nome => /^index-[\w-]+\.js$/.test(nome));
if (arquivos.length !== 1) throw new Error(`Esperava um bundle inicial index-*.js, encontrei ${arquivos.length}.`);
const arquivo = arquivos[0];
const comprimido = gzipSync(await readFile(join('dist/assets', arquivo)), { level: 9 });
console.log(`Bundle inicial: ${(comprimido.length / 1024).toFixed(1)} kB gzip (limite ${(limiteGzip / 1024).toFixed(1)} kB).`);
if (comprimido.length > limiteGzip) throw new Error('O bundle inicial cresceu além do limite; divida a tela pesada em carregamento sob demanda.');
