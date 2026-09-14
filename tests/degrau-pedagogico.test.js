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

// Regra mais dura, e a que pegou um degrau real: ver explicado em texto não é o mesmo que ver
// escrito num programa que roda. O "+" era ensinado na teoria da aula de operadores e nunca
// aparecia num exemplo executável; o primeiro lugar que pedia para digitá-lo era um desafio.
// Símbolo de operador entra aqui porque a lista de palavras-chave não o alcança.
const SIMBOLOS = ['+', '-', '*', '/', '%'];
const emCodigo = texto => [
  ...usadas(texto),
  ...SIMBOLOS.filter(op => String(texto).includes(op))
];

test('nada é exigido num desafio antes de aparecer em código que roda', () => {
  const jaEscritas = new Set();
  const furos = [];
  for (const aula of lessons) {
    // Comentário não é código que roda: citar "numero + 1" num comentário do enunciado não
    // conta como ter mostrado a soma em funcionamento.
    const semComentario = texto => String(texto).split(String.fromCharCode(10))
      .map(linha => linha.split('#')[0]).join(String.fromCharCode(10));
    const exemploDaAula = semComentario([aula.example, aula.starter].join(String.fromCharCode(10)));
    const exigidas = emCodigo(referenceSolution(aula));
    const mostradas = emCodigo(exemploDaAula);
    const novas = exigidas.filter(nome => !jaEscritas.has(nome) && !mostradas.includes(nome));
    if (novas.length) furos.push(aula.id + ": " + novas.join(" "));
    for (const nome of [...exigidas, ...mostradas]) jaEscritas.add(nome);
  }
  // Nenhuma exceção. Se um dia aparecer uma, ela vem nomeada aqui com o motivo, e não por
  // afrouxamento da regra.
  assert.deepEqual(furos, []);
});
