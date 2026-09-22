import { initialState } from '../src/progress.js';
import { aulasDaFaculdade } from '../src/faculdade.js';
import { projetosDaFaculdade } from '../src/faculdade-projetos.js';
import { entregaDaFaculdade, normalizarTrabalhoDaEntrega } from '../src/faculdade-entregas.js';
import { solucoesEntregasFaculdade } from './faculdade-entregas-reference.js';

export function unidadeCompleta(id = 'u1') {
  const state = initialState();
  const entrega = entregaDaFaculdade(`entrega-${id}`);
  state.faculdade.feitas = [...aulasDaFaculdade.filter(a => a.unidade === id), ...projetosDaFaculdade.filter(p => p.unidade === id)].map(i => i.id);
  state.faculdade.feitas.push(`ex-${id}`);
  state.faculdade.entregas[entrega.id] = normalizarTrabalhoDaEntrega({
    codigo: solucoesEntregasFaculdade[entrega.id],
    passosConcluidos: entrega.passos.map(p => p.id),
    concluidaEm: '2026-09-20', executadaEm: '2026-09-20', executadaNoColabEm: '2026-09-20',
    saida: 'Execução observada e conferida com casos de teste.',
    saidaExterna: 'Acurácia no teste: 0.9667. Predições observadas no Colab.',
    logica: 'Organizei as entradas, processei os dados com funções e conferi as saídas. Separei treino e teste, preservando a avaliação final.',
    testes: 'Conferi entradas diferentes, resultados esperados, limites e casos vazios para encontrar falhas de lógica.',
    insights: 'O produto de maior receita concentra vendas. A categoria principal tem receita maior. Comparar o total e o ticket ajuda a planejar novas compras.',
    conclusao: 'Os casos testados confirmam os resultados observados; os dados de exemplo têm limitações e precisam de análise adicional.',
  }, entrega);
  return state;
}
