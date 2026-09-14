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
  assert.deepEqual(semRequisito, ['ponte ponte-funcao-chamar']);
});

test('as três telas que executam código do estudante mostram a leitura do Lumi', () => {
  for (const tela of ['App.jsx', 'PracticeStudio.jsx', 'FunctionBridges.jsx', 'ProjectStudio.jsx']) {
    const fonte = readFileSync(new URL(`../src/${tela}`, import.meta.url), 'utf8');
    assert.match(fonte, /<CodeReview/, `${tela}: executa código do estudante e não oferece a conferência do Lumi`);
  }
});

// As telas declaradas dentro da App não podem ser montadas como <Tela />: a cada render a App
// cria um tipo novo, o React remonta a página inteira e joga fora rolagem e foco. Chamadas
// direto (Tela()) o JSX entra no lugar. Isso só é seguro enquanto nenhuma delas usar hook.
test('as telas internas são chamadas, não montadas, e continuam sem hooks', () => {
  const fonte = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const internas = ['Dashboard', 'Course', 'Projects', 'Calendar', 'Achievements', 'Profile', 'Settings'];
  for (const nome of internas) {
    assert.ok(fonte.includes(`${nome}()`), `${nome} deveria ser chamada direto`);
    assert.ok(!fonte.includes(`<${nome} />`), `${nome} está montada como componente e vai remontar a cada render`);
    const corpo = fonte.slice(fonte.indexOf(`  function ${nome}(`)).split(String.fromCharCode(10))[0];
    assert.doesNotMatch(corpo, /use(State|Effect|Ref|Memo|Callback)\s*\(/, `${nome} usa hook: não pode ser chamada direto`);
  }
});
