import {
  aulasDaFaculdade,
  unidades,
  proximaAcaoDaFaculdade,
} from './faculdade.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import {
  entregasDaFaculdade,
  requisitosFaltandoDaEntrega,
} from './faculdade-entregas.js';

const normalizar = (texto) =>
  String(texto || '')
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const idsNavegaveis = new Set([
  ...aulasDaFaculdade.map(({ id }) => id),
  ...projetosDaFaculdade.map(({ id }) => id),
  ...entregasDaFaculdade.map(({ id }) => id),
]);

const progressoDaEntrega = (state, entrega) => {
  const trabalho = state?.faculdade?.entregas?.[entrega.id] || {};
  const concluidos = new Set(trabalho.passosConcluidos || []);
  const proximoPasso = entrega.passos.find(({ id }) => !concluidos.has(id)) || null;
  return {
    passosConcluidos: concluidos.size,
    totalPassos: entrega.passos.length,
    proximoPasso,
    pronta: requisitosFaltandoDaEntrega(entrega, trabalho).length === 0,
  };
};

export function proximaAtividadeAcademica(state = {}) {
  const feitas = new Set(state?.faculdade?.feitas || []);
  for (const entrega of entregasDaFaculdade) {
    const preRequisito = entrega.preRequisitos.find((id) => !feitas.has(id));
    if (preRequisito) {
      const aula = aulasDaFaculdade.find(({ id }) => id === preRequisito);
      if (aula) return {
        tipo: 'aula',
        id: aula.id,
        titulo: aula.titulo,
        explicacao: `Aprenda esta base da Unidade ${entrega.unidade.slice(1)} antes de construir a entrega.`,
      };
    }
    const progresso = progressoDaEntrega(state, entrega);
    if (progresso.proximoPasso) return {
      tipo: 'entrega',
      id: entrega.id,
      passoId: progresso.proximoPasso.id,
      titulo: progresso.proximoPasso.titulo,
      entregaTitulo: entrega.titulo,
      explicacao: `Continue a entrega da Unidade ${entrega.unidade.slice(1)} com orientação passo a passo.`,
    };
  }
  const revisao = proximaAcaoDaFaculdade(state);
  return {
    tipo: 'aula',
    id: revisao.aula.id,
    titulo: revisao.titulo,
    explicacao: revisao.explicacao,
    concluida: true,
  };
}

export function destinoDaFaculdadeNoEndereco(busca = '') {
  const parametros = new URLSearchParams(String(busca || '').replace(/^\?/, ''));
  if (parametros.get('tab') !== 'faculdade') return null;
  const id = parametros.get('faculty');
  return idsNavegaveis.has(id) ? id : null;
}

export function enderecoDaFaculdade(id) {
  const parametros = new URLSearchParams({ tab: 'faculdade' });
  if (idsNavegaveis.has(id)) parametros.set('faculty', id);
  return `?${parametros.toString()}`;
}

export function panoramaDaFaculdade(state = {}) {
  const feitas = new Set(state?.faculdade?.feitas || []);
  const proxima = proximaAcaoDaFaculdade(state);
  const entregas = entregasDaFaculdade.map((entrega) => ({
    ...entrega,
    ...progressoDaEntrega(state, entrega),
  }));
  return {
    total: aulasDaFaculdade.length,
    estudadas: aulasDaFaculdade.filter((aula) => feitas.has(aula.id)).length,
    projetosConcluidos: projetosDaFaculdade.filter((projeto) =>
      feitas.has(projeto.id),
    ).length,
    entregas,
    entregasConcluidas: entregas.filter(({ pronta }) => pronta).length,
    proxima: proxima.aula,
    proximaAtividade: proximaAtividadeAcademica(state),
    unidades: unidades.map((unidade) => ({
      ...unidade,
      aulas: aulasDaFaculdade.filter((aula) => aula.unidade === unidade.id),
      estudadas: aulasDaFaculdade.filter(
        (aula) => aula.unidade === unidade.id && feitas.has(aula.id),
      ).length,
      projeto: projetosDaFaculdade.find(
        (projeto) => projeto.unidade === unidade.id,
      ),
      entrega: (() => {
        const entrega = entregas.find(
          (item) => item.unidade === unidade.id,
        );
        return entrega || null;
      })(),
    })),
  };
}

export function buscarNaFaculdade(consulta = '') {
  const termo = normalizar(consulta);
  if (!termo) return [];
  return [
    ...aulasDaFaculdade.map((aula) => ({
      id: aula.id,
      tipo: 'Aula da faculdade',
      titulo: aula.titulo,
      texto: `${aula.titulo} ${aula.teoria.join(' ')} ${aula.desafio}`,
    })),
    ...projetosDaFaculdade.map((projeto) => ({
      id: projeto.id,
      tipo: 'Projeto da faculdade',
      titulo: projeto.titulo,
      texto: `${projeto.titulo} ${projeto.teoria.join(' ')} ${projeto.desafio}`,
    })),
    ...entregasDaFaculdade.map((entrega) => ({
      id: entrega.id,
      tipo: 'Entrega prática',
      titulo: entrega.titulo,
      texto: [
        entrega.titulo,
        entrega.resumo,
        entrega.preRequisitos.join(' '),
        ...entrega.passos.flatMap(({ titulo, explicacao, evidencia }) => [titulo, explicacao, evidencia]),
        ...entrega.criterios.map(({ descricao }) => descricao),
      ].join(' '),
    })),
  ].filter((item) => normalizar(item.texto).includes(termo));
}

export function questoesDaFaculdadeConcluidas(state = {}) {
  const feitas = new Set(state?.faculdade?.feitas || []);
  return aulasDaFaculdade
    .filter((aula) => feitas.has(aula.id))
    .map((aula) => ({
      id: `faculdade:${aula.id}`,
      titulo: `Faculdade · ${aula.titulo}`,
      desafio: aula.desafio,
      esperado: aula.esperado,
      stdin: aula.stdin || '',
      origem: 'faculdade',
    }));
}
