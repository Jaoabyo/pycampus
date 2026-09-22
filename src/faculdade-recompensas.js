import { aulasDaFaculdade, unidades } from './faculdade.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import { exerciciosDaFaculdade } from './faculdade-exercicios.js';
import { entregasDaFaculdade, trabalhoConcluidoDaEntrega } from './faculdade-entregas.js';

export const XP_FACULDADE = Object.freeze({ aula: 100, projeto: 250, exercicio: 300, passo: 25 });
export const bonusDaEntrega = (entrega) => ({ u1: 250, u2: 350, u3: 450, u4: 550 })[entrega.unidade] || 0;

export function recompensasDaFaculdade(state = {}) {
  const feitas = new Set(state.faculdade?.feitas || []);
  const itens = [
    ...aulasDaFaculdade.map(a => ({ ...a, tipo: 'aula', xp: XP_FACULDADE.aula })),
    ...projetosDaFaculdade.map(p => ({ ...p, tipo: 'projeto', xp: XP_FACULDADE.projeto })),
    ...exerciciosDaFaculdade.map(e => ({ ...e, tipo: 'exercicio', xp: XP_FACULDADE.exercicio })),
  ].map(item => ({ ...item, concluida: feitas.has(item.id) }));
  const entregas = entregasDaFaculdade.map(entrega => {
    const trabalho = state.faculdade?.entregas?.[entrega.id] || {};
    const salvos = new Set(trabalho.passosConcluidos || []);
    const passos = entrega.passos.filter(p => salvos.has(p.id));
    const concluida = entrega.preRequisitos.every(id => feitas.has(id))
      && (trabalhoConcluidoDaEntrega(entrega, trabalho.conquista) || trabalhoConcluidoDaEntrega(entrega, trabalho));
    const bonus = bonusDaEntrega(entrega);
    return {
      id: entrega.id, unidade: entrega.unidade, titulo: entrega.titulo, tipo: 'entrega',
      passos: passos.map(p => p.id), concluida, bonus,
      xp: passos.length * XP_FACULDADE.passo + (concluida ? bonus : 0),
      xpMaximo: entrega.passos.length * XP_FACULDADE.passo + bonus,
    };
  });
  const xp = itens.filter(i => i.concluida).reduce((s, i) => s + i.xp, 0)
    + entregas.reduce((s, e) => s + e.xp, 0);
  return { xp, itens, entregas };
}

export function progressoDaUnidade(state, id, recompensas = recompensasDaFaculdade(state)) {
  const itens = recompensas.itens.filter(i => i.unidade === id);
  const entrega = recompensas.entregas.find(e => e.unidade === id);
  const aulas = itens.filter(i => i.tipo === 'aula');
  const atividades = [...itens.filter(i => i.tipo !== 'aula'), ...(entrega ? [entrega] : [])];
  const feitas = itens.filter(i => i.concluida).length + (entrega?.concluida ? 1 : 0);
  const total = itens.length + (entrega ? 1 : 0);
  return {
    id, feitas, total, concluida: total > 0 && feitas === total,
    aulasFeitas: aulas.filter(a => a.concluida).length, totalAulas: aulas.length,
    atividadesFeitas: atividades.filter(a => a.concluida).length, totalAtividades: atividades.length,
    xp: itens.filter(i => i.concluida).reduce((s, i) => s + i.xp, 0) + (entrega?.xp || 0),
    xpMaximo: itens.reduce((s, i) => s + i.xp, 0) + (entrega?.xpMaximo || 0),
    entregaConcluida: entrega?.concluida || false,
  };
}

export const emblemasDaFaculdade = [
  { id: 'faculdade-inicio', title: 'Primeiro passo acadêmico', description: 'Conclua uma aula da Faculdade.', icon: 'BookOpen', color: 'purple', check: s => aulasDaFaculdade.some(a => s.faculdade?.feitas?.includes(a.id)) },
  ...unidades.map(u => ({
    id: `faculdade-${u.id}`, title: `Unidade ${u.numero} completa`,
    description: `Conclua as aulas e todas as atividades de ${u.titulo}.`,
    icon: u.icone, color: u.cor, check: s => progressoDaUnidade(s, u.id).concluida,
  })),
  { id: 'faculdade-entrega', title: 'Da teoria à prática', description: 'Conclua sua primeira entrega prática.', icon: 'Hammer', color: 'teal', check: s => recompensasDaFaculdade(s).entregas.some(e => e.concluida) },
  { id: 'faculdade-exercicios', title: 'Revisão em dia', description: 'Conclua os quatro exercícios de unidades.', icon: 'Award', color: 'blue', check: s => exerciciosDaFaculdade.every(e => s.faculdade?.feitas?.includes(e.id)) },
  { id: 'faculdade-completa', title: 'Jornada acadêmica completa', description: 'Conclua as quatro unidades, incluindo todas as atividades.', icon: 'GraduationCap', color: 'yellow', check: s => unidades.every(u => progressoDaUnidade(s, u.id).concluida) },
];
