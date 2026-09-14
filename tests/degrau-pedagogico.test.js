import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { referenceSolution } from './curriculum-solutions.js';

// Regra que o projeto não quebra: nenhum desafio pode exigir uma técnica que a própria aula
// ou alguma anterior ainda não mostrou. Ela existia escrita em REVISAO-PEDAGOGICA.md e era
// conferida a olho; aqui passa a ser medida, para nenhuma edição de conteúdo furá-la sem aviso.
const TECNICAS = ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except',
  'raise', 'with', 'yield', 'assert', 'import', 'lambda', 'and', 'or', 'not', 'set', 'len', 'sum',
  'sorted', 'range', 'open', 'all', 'enumerate', 'zip', 'property', 'dataclass', '__init__', 'self'];

const usadas = texto => TECNICAS.filter(nome =>
  new RegExp('(?<![A-Za-z0-9_])' + nome + '(?![A-Za-z0-9_])').test(String(texto)));

test('nenhum desafio exige técnica que nem a aula nem uma anterior mostrou', () => {
  const jaVistas = new Set();
  const furos = [];
  for (const aula of lessons) {
    const material = [aula.example, aula.starter, aula.theory].join(String.fromCharCode(10));
    const mostradas = usadas(material);
    const exigidas = usadas(referenceSolution(aula));
    const novas = exigidas.filter(nome => !jaVistas.has(nome) && !mostradas.includes(nome));
    if (novas.length) furos.push(aula.id + ': ' + novas.join(' '));
    for (const nome of [...exigidas, ...mostradas]) jaVistas.add(nome);
  }
  assert.deepEqual(furos, []);
});
