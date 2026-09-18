import { lessons } from './curriculum.js';
import { questoesDaFaculdadeConcluidas } from './faculdade-integrada.js';
import { aulasDaFaculdade } from './faculdade.js';

// O objetivo do estudante é fluência de prova: escrever sem consultar. A aula dá enunciado,
// código inicial, dicas, quebra-cabeça e o Lumi — tudo certo para aprender, e tudo errado
// para medir. Aqui não há nenhum desses apoios: enunciado, editor vazio e a saída esperada.
export const MINIMO_DE_AULAS = 3;
export const QUESTOES_PADRAO = 5;
// Referência de ritmo, não punição: passar disso não reprova ninguém, só entra no relatório.
export const SEGUNDOS_POR_QUESTAO = 180;

export function podeFazerProva(state) {
  return (
    (state?.completed?.length || 0) +
      questoesDaFaculdadeConcluidas(state).length >=
    MINIMO_DE_AULAS
  );
}

// Sorteia entre as aulas que o estudante realmente concluiu: cobrar o que não foi estudado
// não mede recall, mede sorte.
export function montarProva(
  state,
  quantidade = QUESTOES_PADRAO,
  aleatorio = Math.random,
) {
  const feitas = [
    ...lessons
      .filter((lesson) => state?.completed?.includes(lesson.id))
      .map((lesson) => ({
        id: lesson.id,
        titulo: lesson.title,
        desafio: lesson.challenge,
        esperado: lesson.expected,
        stdin: lesson.stdin || '',
        origem: 'formacao',
      })),
    ...questoesDaFaculdadeConcluidas(state),
  ];
  const sorteadas = [...feitas];
  for (let i = sorteadas.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [sorteadas[i], sorteadas[j]] = [sorteadas[j], sorteadas[i]];
  }
  return sorteadas.slice(0, Math.min(quantidade, sorteadas.length));
}

export const acertou = (saida, esperado) =>
  typeof saida === 'string' && saida.trim() === String(esperado ?? '').trim();

export function resultadoDaProva(questoes, respostas, segundos) {
  const erradas = questoes.filter((questao) => respostas[questao.id] !== true);
  return {
    total: questoes.length,
    acertos: questoes.length - erradas.length,
    segundos: Math.max(0, Math.round(segundos)),
    // Guardamos os ids errados para a tela poder levar de volta à aula certa.
    falhas: erradas.map((questao) => questao.id),
    dentroDoTempo: segundos <= questoes.length * SEGUNDOS_POR_QUESTAO,
  };
}

// Só a forma do registro; o veredito pedagógico continua sendo do estudante e de quem ensina.
export function normalizeProvas(input) {
  const ids = new Set([
    ...lessons.map((lesson) => lesson.id),
    ...aulasDaFaculdade.map((aula) => `faculdade:${aula.id}`),
  ]);
  const data = (valor) =>
    typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
  return (Array.isArray(input?.provas) ? input.provas : [])
    .filter(
      (prova) =>
        prova &&
        data(prova.data) &&
        Number.isInteger(prova.total) &&
        prova.total > 0 &&
        prova.total <= 48,
    )
    .slice(-20)
    .map((prova) => ({
      data: prova.data,
      total: prova.total,
      acertos: Math.max(0, Math.min(prova.total, Number(prova.acertos) || 0)),
      segundos: Math.max(0, Math.min(36000, Number(prova.segundos) || 0)),
      falhas: (Array.isArray(prova.falhas) ? prova.falhas : [])
        .filter((id) => ids.has(id))
        .slice(0, 48),
    }));
}
