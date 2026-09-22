import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciciosDaFaculdade, exercicioDaUnidade, totalDeQuestoes } from '../src/faculdade-exercicios.js';
import { unidades } from '../src/faculdade.js';

test('cada unidade tem um exercício com cinco questões, como o do AVA', () => {
  assert.equal(exerciciosDaFaculdade.length, 4);
  assert.equal(totalDeQuestoes, 20);
  for (const unidade of unidades) {
    const exercicio = exercicioDaUnidade(unidade.id);
    assert.ok(exercicio, `${unidade.id} precisa do exercício da unidade`);
    assert.equal(exercicio.questoes.length, 5, `${exercicio.id} precisa das cinco questões`);
  }
});

test('toda questão tem cinco alternativas, uma correta e o motivo por escrito', () => {
  for (const exercicio of exerciciosDaFaculdade) {
    for (const questao of exercicio.questoes) {
      assert.equal(questao.opcoes.length, 5, `${questao.id} precisa de cinco alternativas`);
      assert.equal(new Set(questao.opcoes).size, 5, `${questao.id} repete uma alternativa`);
      assert.ok(questao.resposta >= 0 && questao.resposta < 5, `${questao.id} aponta fora da lista`);
      // Sem o motivo, isto seria só um gabarito — e gabarito não ensina.
      assert.ok(questao.porque.length > 80, `${questao.id} precisa explicar por que a certa é certa`);
      // O AVA mistura pergunta e ordem — "Selecione a alternativa que corresponde a…". Os dois
      // servem; o que não serve é um enunciado que não peça nada.
      const enunciado = questao.enunciado.trim();
      assert.ok(enunciado.endsWith('?') || /^(Selecione|Assinale|Indique|Marque|Escolha)\b/.test(enunciado),
        `${questao.id} precisa perguntar ou mandar escolher`);
    }
  }
});

// Banco em que a resposta é sempre a letra A treina a marcar A, não o assunto.
test('a alternativa correta não fica sempre na mesma posição', () => {
  for (const exercicio of exerciciosDaFaculdade) {
    const posicoes = new Set(exercicio.questoes.map(questao => questao.resposta));
    assert.ok(posicoes.size >= 2, `${exercicio.id} põe a correta sempre na mesma letra`);
  }
  const todas = exerciciosDaFaculdade.flatMap(e => e.questoes.map(q => q.resposta));
  assert.ok(new Set(todas).size >= 4, 'o banco inteiro usa posições demais repetidas');
});

// A Unidade 1 reproduz o exercício recebido; as outras foram escritas a partir da apostila.
// Confundir as duas coisas seria apresentar material de estudo como prova oficial.
test('a procedência de cada banco fica declarada', () => {
  const recebidos = exerciciosDaFaculdade.filter(e => e.recebido);
  assert.deepEqual(recebidos.map(e => e.unidade), ['u1', 'u2', 'u3']);
  for (const exercicio of exerciciosDaFaculdade) {
    assert.ok(exercicio.origem?.length > 10, `${exercicio.id} precisa dizer de onde veio`);
    assert.equal(exercicio.recebido, exercicio.origem.includes('recebido no AVA'),
      `${exercicio.id} diz uma procedência e marca outra`);
  }
});

// As cinco questões que o estudante recebeu, com o gabarito conferido contra o material.
test('o exercício da Unidade 1 mantém as questões e o gabarito recebidos', () => {
  const u1 = exercicioDaUnidade('u1');
  assert.deepEqual(u1.questoes.map(questao => questao.id), ['u1q1', 'u1q2', 'u1q3', 'u1q4', 'u1q5']);
  const marcada = questao => questao.opcoes[questao.resposta];
  assert.match(marcada(u1.questoes[0]), /retorna a média das notas/);
  assert.match(marcada(u1.questoes[1]), /aplicar_funcao\(dobrar, lista_de_numeros\)/);
  assert.match(marcada(u1.questoes[2]), /lido com mais frequência do que é escrito/);
  assert.match(marcada(u1.questoes[3]), /divisível por 2/);
  assert.match(marcada(u1.questoes[4]), /legibilidade e sintaxe simples/);
  // Duas questões mostram código; sem ele o enunciado não se sustenta.
  assert.ok(u1.questoes[0].codigo.includes('def calcular_media'));
  assert.ok(u1.questoes[3].codigo.includes('numero % 2 == 0'));
});

// As cinco questões da Unidade 2, também recebidas no AVA.
test('o exercício da Unidade 2 mantém as questões e o gabarito recebidos', () => {
  const u2 = exercicioDaUnidade('u2');
  assert.deepEqual(u2.questoes.map(questao => questao.id), ['u2q1', 'u2q2', 'u2q3', 'u2q4', 'u2q5']);
  const marcada = questao => questao.opcoes[questao.resposta];
  assert.match(marcada(u2.questoes[0]), /ampliem as funcionalidades de seus projetos/);
  assert.equal(marcada(u2.questoes[1]), '3');
  assert.match(marcada(u2.questoes[2]), /responderem de forma diferente à mesma mensagem/);
  assert.equal(marcada(u2.questoes[3]), 'NumPy');
  assert.match(marcada(u2.questoes[4]), /palavra-chave "import"/);
  // my_array[2] vale 3 porque o índice começa em 0. O código precisa estar à vista.
  assert.ok(u2.questoes[1].codigo.includes('my_array = np.array([1, 2, 3, 4, 5])'));
  assert.ok(u2.questoes[1].codigo.includes('my_array[2]'));
});

// As cinco questões da Unidade 3, também recebidas no AVA.
test('o exercício da Unidade 3 mantém as questões e o gabarito recebidos', () => {
  const u3 = exercicioDaUnidade('u3');
  assert.deepEqual(u3.questoes.map(questao => questao.id), ['u3q1', 'u3q2', 'u3q3', 'u3q4', 'u3q5']);
  const marcada = questao => questao.opcoes[questao.resposta];
  assert.match(marcada(u3.questoes[0]), /"data"/);
  assert.equal(marcada(u3.questoes[1]), 'plot()');
  assert.match(marcada(u3.questoes[2]), /Data Manipulation Language/);
  assert.match(marcada(u3.questoes[3]), /Chaves do dicionário/);
  assert.equal(marcada(u3.questoes[4]), 'df_selic.loc[70]');
  // A pergunta aponta para a terceira linha do exemplo: loc[[0, 20, 70]]. loc usa o rótulo.
  assert.ok(u3.questoes[1].codigo.includes("kind='bar'"));
  assert.ok(u3.questoes[3].codigo.includes("'A': 100"));
});
