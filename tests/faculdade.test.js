import test from 'node:test';
import assert from 'node:assert/strict';
import { aulasDaFaculdade, tarefasDaFaculdade, unidades, aulasDaUnidade, tarefasDaUnidade, diasAteProva, requisitosFaltandoDaFaculdade, proximaAcaoDaFaculdade, planoDeEstudosDaFaculdade } from '../src/faculdade.js';
import { solucoesDaFaculdade } from './faculdade-reference.js';

test('a trilha cobre as quatro unidades dos oito PDFs', () => {
  assert.deepEqual(unidades.map(unidade => unidade.id), ['u1', 'u2', 'u3', 'u4']);
  assert.deepEqual(aulasDaFaculdade.map(aula => aula.id), [
    'u1a1', 'r1', 'r2', 'r3',
    'u2a1', 'u2a2', 'u2a3', 'u2a4',
    'u3a1', 'u3a2', 'u3a3', 'u3a4',
    'r4', 'u4a2', 'u4a3', 'u4a4'
  ]);
  for (const unidade of unidades) assert.equal(aulasDaFaculdade.filter(aula => aula.unidade === unidade.id).length, 4, unidade.id);
});

test('toda aula informa a relação com a formação geral sem esconder o foco da faculdade', () => {
  assert.ok(aulasDaFaculdade.every(aula => aula.naFormacao?.length), 'faltou mapear uma aula');
  for (const id of ['u2a2', 'u2a4', 'u3a1', 'u3a2', 'u3a3', 'u3a4']) {
    assert.ok(aulasDaFaculdade.find(aula => aula.id === id)?.focoFaculdade, `${id} precisa dizer o que é específico da faculdade`);
  }
});

test('as aplicações maiores dos PDFs aparecem na unidade correspondente', () => {
  for (const unidade of unidades) assert.ok(tarefasDaFaculdade.some(tarefa => tarefa.unidade === unidade.id), unidade.id);
  for (const id of ['t-desconto', 't-mobile', 't-testes', 't-vendas-ml', 't-digitos']) {
    assert.ok(tarefasDaFaculdade.some(tarefa => tarefa.id === id), id);
  }
});

test('saída decorada não passa e a solução de referência usa a lógica pedida', () => {
  for (const aula of aulasDaFaculdade) {
    assert.ok(aula.requisitosCodigo?.length, `${aula.id} sem requisito de lógica`);
    assert.deepEqual(requisitosFaltandoDaFaculdade(aula, solucoesDaFaculdade[aula.id]), [], `${aula.id} recusou a referência`);
    const atalho = `print(${JSON.stringify(aula.esperado)})`;
    assert.ok(requisitosFaltandoDaFaculdade(aula, atalho).length > 0, `${aula.id} aceitou imprimir a resposta pronta`);
  }
});

test('a contagem do prazo usa dias civis e chega a zero em 27 de setembro', () => {
  assert.equal(diasAteProva(new Date(2026, 8, 17, 23, 30)), 10);
  assert.equal(diasAteProva(new Date(2026, 8, 27, 8, 0)), 0);
  assert.equal(diasAteProva(new Date(2026, 8, 28, 8, 0)), -1);
});

test('a próxima ação começa na primeira aula e explica o motivo', () => {
  const acao = proximaAcaoDaFaculdade({ faculdade: { feitas: [] } });
  assert.equal(acao.aula.id, aulasDaFaculdade[0].id);
  assert.equal(acao.feitas, 0);
  assert.match(acao.explicacao, /Unidade 1/);
  assert.equal(acao.concluida, false);
});

test('a próxima ação avança apenas pelas aulas conhecidas', () => {
  const acao = proximaAcaoDaFaculdade({ faculdade: { feitas: ['desconhecida', 'u1a1'] } });
  assert.equal(acao.aula.id, 'r1');
  assert.equal(acao.feitas, 1);
  assert.match(acao.explicacao, /Depois desta aula/);
});

test('quando tudo foi estudado, a ação vira revisão sem criar aula falsa', () => {
  const acao = proximaAcaoDaFaculdade({ faculdade: { feitas: aulasDaFaculdade.map(aula => aula.id) } });
  assert.equal(acao.aula.id, aulasDaFaculdade[0].id);
  assert.equal(acao.feitas, aulasDaFaculdade.length);
  assert.equal(acao.concluida, true);
  assert.match(acao.titulo, /Revisar/);
});

test('o plano diário reserva o último dia para revisão e limita o ritmo a duas aulas', () => {
  const plano = planoDeEstudosDaFaculdade({ faculdade: { feitas: [] } }, new Date(2026, 8, 17));
  assert.equal(plano.dias.length, 10);
  assert.equal(plano.dias.at(-1).tipo, 'revisao');
  assert.ok(plano.dias.slice(0, -1).every(dia => dia.aulas.length <= 2));
  assert.deepEqual(plano.hoje.aulas.map(aula => aula.id), ['u1a1', 'r1']);
});

test('o plano não considera aulas desconhecidas e informa revisão quando o prazo acabou', () => {
  const plano = planoDeEstudosDaFaculdade({ faculdade: { feitas: ['u1a1', 'fantasma'] } }, new Date(2026, 8, 28));
  assert.equal(plano.hoje.tipo, 'revisao');
  assert.equal(plano.estudadas, 1);
  assert.equal(plano.hoje.aulas.length, 0);
});

test('quem termina a trilha antes da prova recebe revisão, nunca um dia vazio de aulas', () => {
  const plano = planoDeEstudosDaFaculdade({ faculdade: { feitas: aulasDaFaculdade.map(aula => aula.id) } }, new Date(2026, 8, 17));
  assert.equal(plano.hoje.tipo, 'revisao');
  assert.ok(plano.dias.every(dia => dia.tipo === 'revisao'));
});

// A prova cobre as quatro unidades inteiras. Se uma aula ou uma aplicação do professor sumir
// da trilha, o estudante descobre isso na prova — então quem descobre aqui é o teste.
test('cada unidade entrega quatro aulas rotuladas e as cinco aplicações do professor', () => {
  assert.equal(unidades.length, 4);
  for (const unidade of unidades) {
    const aulas = aulasDaUnidade(unidade.id);
    const tarefas = tarefasDaUnidade(unidade.id);
    assert.equal(aulas.length, 4, `${unidade.id} precisa das quatro aulas da ementa`);
    assert.equal(tarefas.length, 5, `${unidade.id} precisa das cinco aplicações propostas`);
    aulas.forEach((aula, indice) => assert.equal(aula.origem, `Unidade ${unidade.numero} · Aula ${indice + 1}`,
      `${aula.id} precisa dizer de qual aula da apostila veio`));
    tarefas.forEach((tarefa, indice) => assert.ok(tarefa.origem.startsWith(`Unidade ${unidade.numero} · Aula ${indice + 1}`),
      `${tarefa.id} precisa apontar a aula de origem`));
  }
});

// Saída certa com código vazio aprovava a aula antes desta trava. O teste guarda a trava.
test('nenhuma aula é concluída colando a saída esperada em um print', () => {
  for (const aula of aulasDaFaculdade) {
    const cola = `print(${JSON.stringify(aula.esperado)})`;
    assert.ok(requisitosFaltandoDaFaculdade(aula, cola).length > 0,
      `${aula.id} aceitaria a saída colada sem demonstrar a lógica`);
  }
});
