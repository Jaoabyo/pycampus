// A limpeza do progresso dos degraus fica separada do conteúdo deles: progress.js vai no pacote
// inicial do site, e importar faculdade-degraus.js daqui levava o texto e as conferências das
// sete trilhas junto, o que estourou o limite de tamanho do carregamento inicial. Aqui só se
// valida a forma; quem sabe quantos degraus cada trilha tem é a tela, que limita o número ao abrir.
import { aulasDaFaculdade } from './faculdade.js';
import { entregasDaFaculdade } from './faculdade-entregas.js';

export const MAXIMO_DE_DEGRAUS = 50;
const aulas = new Set([...aulasDaFaculdade, ...entregasDaFaculdade].map(({ id }) => id));

// Guardado por aula: quantos degraus já foram vencidos e o código em que o estudante parou.
export const normalizarDegraus = (entrada) => {
  const saida = {};
  if (!entrada || typeof entrada !== 'object') return saida;
  for (const [aulaId, salvo] of Object.entries(entrada)) {
    if (!aulas.has(aulaId) || !salvo || typeof salvo !== 'object') continue;
    const feitos = Number.isInteger(salvo.feitos) ? Math.max(0, Math.min(MAXIMO_DE_DEGRAUS, salvo.feitos)) : 0;
    saida[aulaId] = { feitos };
    if (typeof salvo.codigo === 'string') saida[aulaId].codigo = salvo.codigo.slice(0, 20000);
  }
  return saida;
};
