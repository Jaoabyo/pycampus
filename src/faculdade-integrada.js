import {
  aulasDaFaculdade,
  unidades,
  proximaAcaoDaFaculdade,
} from './faculdade.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';

const normalizar = (texto) =>
  String(texto || '')
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export function panoramaDaFaculdade(state = {}) {
  const feitas = new Set(state?.faculdade?.feitas || []);
  const proxima = proximaAcaoDaFaculdade(state);
  return {
    total: aulasDaFaculdade.length,
    estudadas: aulasDaFaculdade.filter((aula) => feitas.has(aula.id)).length,
    projetosConcluidos: projetosDaFaculdade.filter((projeto) =>
      feitas.has(projeto.id),
    ).length,
    proxima: proxima.aula,
    unidades: unidades.map((unidade) => ({
      ...unidade,
      aulas: aulasDaFaculdade.filter((aula) => aula.unidade === unidade.id),
      estudadas: aulasDaFaculdade.filter(
        (aula) => aula.unidade === unidade.id && feitas.has(aula.id),
      ).length,
      projeto: projetosDaFaculdade.find(
        (projeto) => projeto.unidade === unidade.id,
      ),
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
