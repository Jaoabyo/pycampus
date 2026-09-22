import test from 'node:test';
import assert from 'node:assert/strict';
import { localHelp } from '../src/mentor.js';
import { ensinoDaFaculdade, matrizDeEnsinoDasEntregas } from '../src/faculdade-ensino.js';
import {
  aulasDaFaculdade,
  requisitosFaltandoDaFaculdade,
} from '../src/faculdade.js';
import { projetosDaFaculdade } from '../src/faculdade-projetos.js';
import {
  buscarNaFaculdade,
  panoramaDaFaculdade,
  questoesDaFaculdadeConcluidas,
} from '../src/faculdade-integrada.js';
import { solucoesProjetosFaculdade } from './faculdade-projetos-reference.js';
import { initialState, normalizeState } from '../src/progress.js';

test('cada aula tem preparação explicada e uma alteração guiada antes do desafio', () => {
  for (const aula of aulasDaFaculdade) {
    const ensino = ensinoDaFaculdade[aula.id];
    assert.ok(ensino, aula.id);
    assert.ok(ensino.passos.length >= 3, aula.id);
    assert.ok(
      ensino.passos.every((p) => p.codigo && p.explicacao.length > 80),
      aula.id,
    );
    assert.ok(ensino.codigo.includes(ensino.treino.antes), aula.id);
    assert.notEqual(ensino.treino.antes, ensino.treino.depois, aula.id);
  }
  assert.doesNotMatch(ensinoDaFaculdade.u1a1.revisao.pergunta, /input/);
  assert.match(ensinoDaFaculdade.u1a1.codigo, /float\(nota_a\)/);
});

test('cada conceito obrigatório das entregas aponta para ensino, exemplo, alteração e cobrança', () => {
  const idsAulas = new Set(aulasDaFaculdade.map(({ id }) => id));
  for (const [conceito, ligacao] of Object.entries(matrizDeEnsinoDasEntregas)) {
    assert.ok(idsAulas.has(ligacao.explicadoEm), `${conceito}: aula inexistente`);
    assert.ok(ligacao.exemplo?.trim(), `${conceito}: sem exemplo`);
    assert.ok(ligacao.alteracao?.trim(), `${conceito}: sem alteração`);
    assert.match(ligacao.cobradoEm, /^entrega-u[1-4]:.+/, `${conceito}: cobrança sem endereço`);
  }
  for (const conceito of ['lista', 'acumulador', 'media', 'limite-sete', 'classe', 'self', 'busca', 'contagem-genero', 'grafico-barras']) {
    assert.ok(matrizDeEnsinoDasEntregas[conceito], conceito);
  }
});

test('projetos da faculdade preservam código e conclusão no backup sem mudar as aulas', () => {
  const state = initialState();
  state.faculdade = {
    feitas: ['u1a1', ...projetosDaFaculdade.map((p) => p.id)],
    codigos: solucoesProjetosFaculdade,
    entregas: {},
  };
  const recuperado = normalizeState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(recuperado.faculdade, state.faculdade);
  for (const projeto of projetosDaFaculdade) {
    assert.deepEqual(
      requisitosFaltandoDaFaculdade(
        projeto,
        solucoesProjetosFaculdade[projeto.id],
      ),
      [],
      projeto.id,
    );
    assert.ok(
      requisitosFaltandoDaFaculdade(
        projeto,
        `print(${JSON.stringify(projeto.esperado)})`,
      ).length,
      projeto.id,
    );
  }
});

test('Lumi reconhece saída igual sem inventar divergência nem aprovar a lógica', () => {
  for (const level of [1, 2, 3, 4]) {
    const ajuda = localHelp(
      { output: 'Media: 7.0\n', expected: 'Media: 7.0' },
      level,
    ).join(' ');
    assert.doesNotMatch(ajuda, /diverg|diferença está|saída diferente/);
    assert.match(ajuda, /saída.*esperada/i);
  }
});

test('Lumi não afirma que um código ainda sem saída já rodou', () => {
  assert.doesNotMatch(
    localHelp({ output: '', expected: '7' }, 1).join(' '),
    /rodou|diverg/,
  );
});

test('todo conteúdo acadêmico abastece formação, projetos, busca e prova', () => {
  const estado = initialState();
  estado.faculdade.feitas = ['u1a1'];
  const panorama = panoramaDaFaculdade(estado);

  assert.equal(panorama.total, aulasDaFaculdade.length);
  assert.equal(panorama.unidades.length, 4);
  assert.deepEqual(
    panorama.unidades.flatMap((unidade) => unidade.aulas.map((aula) => aula.id)),
    aulasDaFaculdade.map((aula) => aula.id),
  );
  assert.equal(
    panorama.unidades.filter((unidade) => unidade.projeto).length,
    projetosDaFaculdade.length,
  );
  assert.ok(buscarNaFaculdade('NumPy').some((item) => item.tipo === 'Aula da faculdade'));
  assert.ok(buscarNaFaculdade('boletim').some((item) => item.tipo === 'Projeto da faculdade'));
  assert.deepEqual(questoesDaFaculdadeConcluidas(estado).map((item) => item.id), ['faculdade:u1a1']);
});
