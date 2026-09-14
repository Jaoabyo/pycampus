import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { practiceProjects } from '../src/practice-content.js';
import { functionBridges } from '../src/function-bridges.js';
import { requisitosDaAula, requisitosFaltando } from '../src/requisitos.js';

// A conferência de código nasceu só nas aulas. Miniprojetos e pontes tinham o mesmo buraco:
// a saída batia e ninguém olhava o código. Aqui a regra vale para os três, com a mesma trava
// de segurança: a solução guardada de cada exercício precisa passar pelo que ele cobra.

const comoExercicio = p => ({ id: p.id, expected: p.expected, solution: p.solution, puzzle: p.puzzle });
const solucaoDaPonte = b => b.puzzle.blocks.map(bloco => '    '.repeat(bloco.indent) + bloco.code).join(String.fromCharCode(10));

test('a solução guardada de cada miniprojeto cumpre o que ele cobra', () => {
  for (const p of practiceProjects) {
    const faltando = requisitosFaltando(comoExercicio(p), p.solution).map(item => item.descricao);
    assert.deepEqual(faltando, [], `${p.id}: o miniprojeto cobra algo que a própria resposta dele não faz`);
  }
});

test('a solução guardada de cada ponte cumpre o que ela cobra', () => {
  for (const b of functionBridges) {
    const faltando = requisitosFaltando(b, solucaoDaPonte(b)).map(item => item.descricao);
    assert.deepEqual(faltando, [], `${b.id}: a ponte cobra algo que a própria resposta dela não faz`);
  }
});

test('a etapa Criar do miniprojeto recusa imprimir a resposta pronta', () => {
  const cartao = practiceProjects.find(p => p.id === 'cartao');
  const ids = requisitosFaltando(comoExercicio(cartao), 'print("Leo")').map(item => item.id);
  assert.ok(ids.length, 'print("Leo") produz a saída esperada e tinha de ser recusado');
});

test('quase todo exercício ganhou requisito; as isenções são poucas e por um motivo', () => {
  // Isento é o exercício cuja própria resposta imprime aquele texto: ali escrever a frase É a
  // tarefa. A regra se isenta sozinha nesses casos, e é isso que a impede de recusar um acerto.
  const semRequisito = [
    ...practiceProjects.filter(p => !requisitosDaAula(comoExercicio(p)).length).map(p => 'miniprojeto ' + p.id),
    ...functionBridges.filter(b => !requisitosDaAula(b).length).map(b => 'ponte ' + b.id)
  ];
  assert.deepEqual(semRequisito, ['miniprojeto portaria', 'miniprojeto excecao', 'ponte ponte-funcao-chamar']);
});

test('as três telas que executam código do estudante mostram a leitura do Lumi', () => {
  for (const tela of ['App.jsx', 'PracticeStudio.jsx', 'FunctionBridges.jsx', 'ProjectStudio.jsx']) {
    const fonte = readFileSync(new URL(`../src/${tela}`, import.meta.url), 'utf8');
    assert.match(fonte, /<CodeReview/, `${tela}: executa código do estudante e não oferece a conferência do Lumi`);
  }
});
