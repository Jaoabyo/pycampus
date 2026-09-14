import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { requisitosDaAula, requisitosFaltando } from '../src/requisitos.js';
import { referenceSolution } from './curriculum-solutions.js';
import { alternativeSolution, aulasComAlternativa } from './curriculum-alternatives.js';

// A conferência automática não pode exigir formato. Nome de variável, ordem das linhas e
// caminho escolhido são do estudante; o que se mede é se ele chegou à resposta ou apenas a
// digitou. Estes testes são a prova disso, e falham no dia em que um requisito passar a cobrar
// um jeito específico de escrever.
//
// A saída de cada alternativa é verificada no Python de verdade por `npm run test:curriculum`.

const comRequisito = lessons.filter(aula => requisitosDaAula(aula).length);

test('toda aula com requisito tem uma segunda solução, escrita de outro jeito', () => {
  const semAlternativa = comRequisito.map(a => a.id).filter(id => !alternativeSolution(id));
  assert.deepEqual(semAlternativa, [], 'sem uma segunda solução não dá para provar que o formato é livre');
  const sobrando = aulasComAlternativa.filter(id => !comRequisito.some(a => a.id === id));
  assert.deepEqual(sobrando, [], 'alternativa para aula que não tem requisito: tire ou explique');
});

test('a solução guardada da própria plataforma cumpre os requisitos que ela cobra', () => {
  for (const aula of comRequisito) {
    const faltando = requisitosFaltando(aula, referenceSolution(aula)).map(item => item.descricao);
    assert.deepEqual(faltando, [], `${aula.id}: a plataforma cobra algo que a própria resposta dela não faz`);
  }
});

test('uma solução com outros nomes e outro caminho é aceita igual', () => {
  for (const aula of comRequisito) {
    const faltando = requisitosFaltando(aula, alternativeSolution(aula.id)).map(item => item.descricao);
    assert.deepEqual(faltando, [], `${aula.id}: um caminho legítimo foi recusado — o requisito está cobrando formato`);
  }
});

test('a alternativa é mesmo diferente, não uma cópia com outro nome de arquivo', () => {
  for (const aula of comRequisito) {
    assert.notEqual(alternativeSolution(aula.id).trim(), referenceSolution(aula).trim(), `${aula.id}: a alternativa é igual à referência`);
  }
});

test('escrever a resposta pronta continua sendo recusado', () => {
  const entrada = lessons.find(aula => aula.id === 'entrada');
  const digitou = requisitosFaltando(entrada, 'print(22)').map(item => item.id);
  assert.ok(digitou.includes('sem-literal:22'), 'print(22) tinha de ser recusado');
  assert.ok(digitou.includes('usa-input'), 'sem input() não há leitura de entrada nenhuma');
  // Sem converter, a saída nem bate; mas o requisito da conversão existe porque é o assunto da aula.
  assert.deepEqual(requisitosFaltando(entrada, 'print(input())').map(item => item.id), ['chama-int']);
});

test('comentário citando o valor não é trapaça', () => {
  const entrada = lessons.find(aula => aula.id === 'entrada');
  const comComentario = '# a saída tem de ser 22\n' + alternativeSolution('entrada');
  assert.deepEqual(requisitosFaltando(entrada, comComentario), []);
  // O início do exercício é só comentário: nunca pode ser tratado como tentativa inválida.
  assert.ok(requisitosFaltando(entrada, entrada.starter).every(item => item.id !== 'sem-literal:22'));
});
