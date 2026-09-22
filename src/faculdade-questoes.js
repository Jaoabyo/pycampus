// As questões de múltipla escolha da faculdade, num formato só.
//
// A prova presencial é de múltipla escolha, então este é o formato que vale treinar. O banco
// junta três fontes que já existiam separadas: os 20 exercícios de unidade (no formato do
// AVA, com cinco alternativas), as 16 revisões das aulas e as 4 dos miniprojetos.
import { aulasDaFaculdade } from './faculdade.js';
import { ensinoDaFaculdade } from './faculdade-ensino.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import { exerciciosDaFaculdade } from './faculdade-exercicios.js';

export const questoesDaFaculdade = [
  ...exerciciosDaFaculdade.flatMap((exercicio) => exercicio.questoes.map((questao) => ({
    id: questao.id,
    unidade: exercicio.unidade,
    tipo: 'ava',
    origem: exercicio.recebido ? 'Exercício de unidades do AVA' : 'Treino no formato do AVA',
    enunciado: questao.enunciado,
    codigo: questao.codigo || null,
    opcoes: questao.opcoes,
    resposta: questao.resposta,
    porque: questao.porque,
    voltarPara: null,
  }))),
  ...aulasDaFaculdade.flatMap((aula) => {
    const revisao = ensinoDaFaculdade[aula.id]?.revisao;
    if (!revisao) return [];
    return [{
      id: `aula:${aula.id}`,
      unidade: aula.unidade,
      tipo: 'aula',
      origem: aula.titulo,
      enunciado: revisao.pergunta,
      codigo: null,
      opcoes: revisao.opcoes,
      resposta: revisao.resposta,
      porque: revisao.explicacao,
      voltarPara: aula.id,
    }];
  }),
  ...projetosDaFaculdade.map((projeto) => ({
    id: `projeto:${projeto.id}`,
    unidade: projeto.unidade,
    tipo: 'projeto',
    origem: projeto.titulo,
    enunciado: projeto.pergunta,
    codigo: null,
    opcoes: projeto.opcoes,
    resposta: projeto.resposta,
    porque: projeto.explicacao,
    voltarPara: projeto.id,
  })),
];

const porId = new Map(questoesDaFaculdade.map((questao) => [questao.id, questao]));
export const questaoDaFaculdade = (id) => porId.get(id) || null;

// Hash curto e estável: a mesma questão sai sempre na mesma ordem para o mesmo sorteio.
const hash = (texto) => {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) valor = Math.imul(valor ^ texto.charCodeAt(i), 16777619);
  return valor >>> 0;
};

// Gira as alternativas mantendo o vínculo com a certa. Nas revisões das aulas a correta estava
// sempre em A — nas 16 aulas e nos 4 miniprojetos —, o que numa prova de múltipla escolha
// treina o pior hábito: marcar A sem ler. A rotação sai do id, então a ordem é estável entre
// visitas (a mesma aula mostra sempre a mesma ordem) sem deixar a correta sempre no mesmo lugar.
export function girarAlternativas(questao, semente = '') {
  const total = questao.opcoes.length;
  if (total < 2) return { ...questao };
  const giro = hash(`${questao.id}|${semente}`) % total;
  const opcoes = questao.opcoes.map((_, i) => questao.opcoes[(i + giro) % total]);
  return { ...questao, opcoes, resposta: (questao.resposta - giro + total) % total };
}

// Embaralhamento completo, para o simulado: cada simulado sorteia uma ordem nova.
export function embaralharAlternativas(questao, aleatorio = Math.random) {
  const ordem = questao.opcoes.map((_, i) => i);
  for (let i = ordem.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return { ...questao, opcoes: ordem.map((i) => questao.opcoes[i]), resposta: ordem.indexOf(questao.resposta) };
}
