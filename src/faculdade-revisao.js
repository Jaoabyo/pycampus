// Revisão espaçada e simulado da faculdade.
//
// A plataforma já sabia o que o estudante errava e não usava isso: o Modo prova sorteava ao
// acaso e as respostas erradas do exercício de unidade simplesmente sumiam. Aqui cada primeira
// resposta entra numa caixa de Leitner. Errou, volta para a caixa 0 e reaparece hoje mesmo.
// Acertou, sobe uma caixa e só volta depois de alguns dias. Voltar exatamente no que se errou,
// com intervalos que crescem, é o que fixa conteúdo — reler o que já se sabe, não.
import { questoesDaFaculdade, questaoDaFaculdade, embaralharAlternativas } from './faculdade-questoes.js';
import { CAIXA_MAXIMA, LIMITE_DE_SIMULADOS } from './faculdade-revisao-estado.js';

// Dias até a questão voltar, por caixa. Comprimidos de propósito: a prova está a dias, e um
// intervalo de semanas faria a questão voltar depois dela.
export const INTERVALOS = [0, 1, 2, 3, 5];
export const SEGUNDOS_SUGERIDOS_POR_QUESTAO = 120;
const UNIDADES = ['u1', 'u2', 'u3', 'u4'];

const somarDias = (iso, dias) => {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
};

// Só a primeira resposta a uma questão, em cada sessão, entra aqui: é ela que mostra o que o
// estudante sabia. A segunda, depois de ler a explicação, já não mede lembrança.
export function registrarResposta(state, questaoId, acertou, hoje) {
  if (!questaoDaFaculdade(questaoId)) return state;
  const anterior = state.revisaoFaculdade?.[questaoId];
  const caixaAnterior = anterior?.caixa ?? 0;
  const caixa = acertou ? Math.min(CAIXA_MAXIMA, anterior ? caixaAnterior + 1 : 1) : 0;
  return {
    ...state,
    revisaoFaculdade: {
      ...state.revisaoFaculdade,
      [questaoId]: {
        caixa,
        proxima: somarDias(hoje, INTERVALOS[caixa]),
        ultima: hoje,
        acertos: (anterior?.acertos || 0) + (acertou ? 1 : 0),
        erros: (anterior?.erros || 0) + (acertou ? 0 : 1),
      },
    },
  };
}

// O que volta hoje: vencidas primeiro as que mais se erraram, depois as de caixa mais baixa.
export function filaDeRevisao(state, hoje) {
  return Object.entries(state.revisaoFaculdade || {})
    .filter(([id, registro]) => registro.proxima <= hoje && questaoDaFaculdade(id))
    .sort(([, a], [, b]) => (b.erros - b.acertos) - (a.erros - a.acertos) || a.caixa - b.caixa)
    .map(([id]) => questaoDaFaculdade(id));
}

export function resumoDaRevisao(state, hoje) {
  const registros = Object.entries(state.revisaoFaculdade || {}).filter(([id]) => questaoDaFaculdade(id));
  return {
    pendentes: registros.filter(([, r]) => r.proxima <= hoje).length,
    vistas: registros.length,
    firmes: registros.filter(([, r]) => r.caixa >= 3).length,
    total: questoesDaFaculdade.length,
  };
}

// Simulado no formato da prova: múltipla escolha, cobrindo as quatro unidades, sem resposta
// durante a prova. Repartir por unidade evita que um sorteio caia inteiro numa unidade só — o
// resultado por unidade é o que diz onde estudar nos dias de revisão.
export function montarSimulado(state, { quantidade = 10, escopo = 'tudo', aleatorio = Math.random } = {}) {
  const estudadas = new Set((state.faculdade?.feitas || []));
  const unidadesEstudadas = UNIDADES.filter((u) => questoesDaFaculdade.some(
    (q) => q.unidade === u && q.tipo === 'aula' && estudadas.has(q.voltarPara),
  ));
  const unidades = escopo === 'estudado' && unidadesEstudadas.length ? unidadesEstudadas : UNIDADES;
  const embaralhar = (lista) => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(aleatorio() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };
  // As do AVA vêm primeiro em cada unidade: são as mais parecidas com a prova.
  const porUnidade = unidades.map((u) => [
    ...embaralhar(questoesDaFaculdade.filter((q) => q.unidade === u && q.tipo === 'ava')),
    ...embaralhar(questoesDaFaculdade.filter((q) => q.unidade === u && q.tipo !== 'ava')),
  ]);
  const escolhidas = [];
  for (let rodada = 0; escolhidas.length < quantidade && porUnidade.some((l) => l.length > rodada); rodada += 1) {
    for (const lista of porUnidade) {
      if (lista[rodada] && escolhidas.length < quantidade) escolhidas.push(lista[rodada]);
    }
  }
  return embaralhar(escolhidas).map((q) => embaralharAlternativas(q, aleatorio));
}

export function corrigirSimulado(questoes, respostas, segundos) {
  const porUnidade = {};
  let acertos = 0;
  const erradas = [];
  for (const questao of questoes) {
    const certo = respostas[questao.id] === questao.resposta;
    if (!porUnidade[questao.unidade]) porUnidade[questao.unidade] = { acertos: 0, total: 0 };
    porUnidade[questao.unidade].total += 1;
    if (certo) { acertos += 1; porUnidade[questao.unidade].acertos += 1; } else erradas.push(questao.id);
  }
  return { total: questoes.length, acertos, segundos: Math.max(0, Math.round(segundos)), porUnidade, erradas };
}

// Entregar o simulado alimenta a revisão: cada erro volta hoje mesmo, cada acerto sobe de caixa.
export function registrarSimulado(state, questoes, resultado, hoje) {
  let proximo = state;
  for (const questao of questoes) {
    proximo = registrarResposta(proximo, questao.id, !resultado.erradas.includes(questao.id), hoje);
  }
  const resumo = { data: hoje, total: resultado.total, acertos: resultado.acertos, segundos: resultado.segundos, porUnidade: resultado.porUnidade };
  return {
    ...proximo,
    simuladosFaculdade: [...(proximo.simuladosFaculdade || []), resumo].slice(-LIMITE_DE_SIMULADOS),
    activities: {
      ...proximo.activities,
      [hoje]: [...new Set([...(proximo.activities?.[hoje] || []), 'faculdade-simulado'])],
    },
  };
}

// Terminar uma sessão de revisão conta o dia de estudo, como qualquer outra atividade.
export function registrarSessaoDeRevisao(state, hoje) {
  return {
    ...state,
    activities: {
      ...state.activities,
      [hoje]: [...new Set([...(state.activities?.[hoje] || []), 'faculdade-revisao'])],
    },
  };
}
