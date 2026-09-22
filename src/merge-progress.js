import { normalizeState, doneProjects, donePractices, xpTotal } from './progress.js';
import { HISTORY_LIMIT } from './history.js';
import { practiceAchievement, practiceProjects } from './practice-content.js';
import { mergeLumiNotes } from './lumi-notes.js';
import { entregasDaFaculdade, juntarTrabalhosDaEntrega } from './faculdade-entregas.js';
import { juntarRevisao, juntarSimulados } from './faculdade-revisao-estado.js';

// Estudar no celular e no computador cria duas jornadas separadas, e importar um backup
// substituía uma pela outra — apagando o que foi feito no outro aparelho. Aqui elas se juntam.
//
// A regra geral é simples: **nada conquistado se perde**. Na dúvida entre dois valores, fica
// o que representa mais trabalho feito. Não há relógio confiável para decidir quem é mais
// recente, então nenhum critério de "mais novo" é inventado.

const uniao = (a, b) => [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])];
const maisLongo = (a, b) => (typeof b === 'string' && b.length > (typeof a === 'string' ? a.length : 0) ? b : a);
const maisTarde = (a, b) => (typeof b === 'string' && b > (typeof a === 'string' ? a : '') ? b : a);
const maisCedo = (a, b) => (typeof b === 'string' && b && (!a || b < a) ? b : a);
const chaves = (a, b) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];

const juntarTextos = (a = {}, b = {}) => {
  const saida = { ...a };
  for (const chave of chaves(a, b)) saida[chave] = maisLongo(a[chave], b[chave]);
  return saida;
};

function juntarPratica(a = {}, b = {}, project) {
  const passed = uniao(a.passed, b.passed);
  // O registro com mais etapas passadas manda nos campos de revisão: é o que foi mais longe.
  const principal = (b.passed?.length || 0) > (a.passed?.length || 0) ? b : a;
  return {
    ...a, ...b, passed, achievement: practiceAchievement(a, project) || practiceAchievement(b, project),
    codes: juntarTextos(a.codes, b.codes),
    prediction: maisLongo(a.prediction, b.prediction),
    notes: maisLongo(a.notes, b.notes),
    reflection: maisLongo(a.reflection, b.reflection),
    answered: Number.isInteger(a.answered) ? a.answered : b.answered,
    streak: Math.max(a.streak || 0, b.streak || 0),
    reviewed: maisTarde(a.reviewed, b.reviewed),
    rating: principal.rating || a.rating || b.rating || ''
  };
}

function juntarPonte(a = {}, b = {}) {
  return {
    ...a, ...b,
    passed: Boolean(a.passed || b.passed),
    quizCorrect: Boolean(a.quizCorrect || b.quizCorrect),
    answered: Number.isInteger(a.answered) ? a.answered : b.answered,
    code: maisLongo(a.code, b.code),
    // Texto escrito à mão é o que mais dói perder ao juntar dois aparelhos: fica o mais longo.
    previsao: maisLongo(a.previsao, b.previsao),
    explicacao: maisLongo(a.explicacao, b.explicacao)
  };
}

function juntarDominio(a = {}, b = {}) {
  return {
    ...a, ...b,
    levels: { ...(b.levels || {}), ...(a.levels || {}) },
    retained: maisCedo(a.retained, b.retained),
    note: maisLongo(a.note, b.note),
    review: a.review || b.review || null
  };
}

export function mergeProgress(atual, entrada) {
  const base = { ...atual };

  base.completed = uniao(atual.completed, entrada.completed);
  base.joined = maisCedo(atual.joined, entrada.joined) || atual.joined;
  base.ultimoRelatorio = maisTarde(atual.ultimoRelatorio, entrada.ultimoRelatorio);
  base.provas = [...(entrada.provas || []), ...(atual.provas || [])].slice(-20);
  base.revisaoFaculdade = juntarRevisao(atual.revisaoFaculdade, entrada.revisaoFaculdade);
  base.simuladosFaculdade = juntarSimulados(atual.simuladosFaculdade, entrada.simuladosFaculdade);

  base.activities = {};
  for (const dia of chaves(atual.activities, entrada.activities)) {
    base.activities[dia] = uniao(atual.activities?.[dia], entrada.activities?.[dia]);
  }

  base.codes = juntarTextos(atual.codes, entrada.codes);
  base.projectCodes = juntarTextos(atual.projectCodes, entrada.projectCodes);
  base.projectLinks = { ...(entrada.projectLinks || {}), ...(atual.projectLinks || {}) };
  base.playground = maisLongo(atual.playground, entrada.playground);

  base.faculdade = {
    feitas: uniao(atual.faculdade?.feitas, entrada.faculdade?.feitas),
    codigos: juntarTextos(atual.faculdade?.codigos, entrada.faculdade?.codigos),
    entregas: {},
  };
  for (const entrega of entregasDaFaculdade) {
    const unido = juntarTrabalhosDaEntrega(
      atual.faculdade?.entregas?.[entrega.id],
      entrada.faculdade?.entregas?.[entrega.id],
      entrega,
    );
    if (unido) base.faculdade.entregas[entrega.id] = unido;
  }

  base.learning = {};
  for (const id of chaves(atual.learning, entrada.learning)) {
    base.learning[id] = juntarPratica(atual.learning?.[id], entrada.learning?.[id], practiceProjects.find(p => p.id === id));
  }

  base.functionBridges = {};
  for (const id of chaves(atual.functionBridges, entrada.functionBridges)) {
    base.functionBridges[id] = juntarPonte(atual.functionBridges?.[id], entrada.functionBridges?.[id]);
  }

  base.mastery = {};
  for (const id of chaves(atual.mastery, entrada.mastery)) {
    base.mastery[id] = juntarDominio(atual.mastery?.[id], entrada.mastery?.[id]);
  }

  base.projectStepsDone = {};
  for (const id of chaves(atual.projectStepsDone, entrada.projectStepsDone)) {
    base.projectStepsDone[id] = uniao(atual.projectStepsDone?.[id], entrada.projectStepsDone?.[id]);
  }

  base.projectChecks = {};
  for (const id of chaves(atual.projectChecks, entrada.projectChecks)) {
    base.projectChecks[id] = uniao(atual.projectChecks?.[id], entrada.projectChecks?.[id]);
  }

  // Entre duas avaliações do mesmo projeto fica a maior nota: as duas foram conquistadas.
  base.projectGrades = { ...(atual.projectGrades || {}) };
  for (const [id, nota] of Object.entries(entrada.projectGrades || {})) {
    const tem = base.projectGrades[id];
    if (!tem || (Number(nota?.nota) || 0) > (Number(tem.nota) || 0)) base.projectGrades[id] = nota;
  }

  base.projectNotes = {};
  for (const id of chaves(atual.projectNotes, entrada.projectNotes)) {
    const aqui = atual.projectNotes?.[id] || {}, la = entrada.projectNotes?.[id] || {};
    base.projectNotes[id] = {};
    for (const passo of chaves(aqui, la)) {
      base.projectNotes[id][passo] = { answer: maisLongo(aqui[passo]?.answer, la[passo]?.answer) };
    }
  }

  base.projectReadmes = {};
  for (const id of chaves(atual.projectReadmes, entrada.projectReadmes)) {
    base.projectReadmes[id] = juntarTextos(atual.projectReadmes?.[id], entrada.projectReadmes?.[id]);
  }

  base.customLessons = { ...(entrada.customLessons || {}), ...(atual.customLessons || {}) };
  base.projectPositions = { ...(entrada.projectPositions || {}), ...(atual.projectPositions || {}) };
  base.codeRevisions = { ...(entrada.codeRevisions || {}), ...(atual.codeRevisions || {}) };

  // Sessões e diário se juntam por id, sem duplicar. O diário mantém as mais recentes.
  const sessoes = new Map();
  for (const sessao of [...(entrada.sessions || []), ...(atual.sessions || [])]) {
    const tem = sessoes.get(sessao.id);
    sessoes.set(sessao.id, tem ? { ...tem, ...sessao, done: Boolean(tem.done || sessao.done) } : sessao);
  }
  base.sessions = [...sessoes.values()];

  const diario = new Map();
  for (const item of [...(entrada.history || []), ...(atual.history || [])]) diario.set(item.id, item);
  base.history = [...diario.values()].sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))).slice(0, HISTORY_LIMIT);
  base.lumiNotes = mergeLumiNotes(entrada.lumiNotes, atual.lumiNotes);

  return normalizeState(base);
}

// O que o estudante ganhou ao juntar. Serve para a confirmação dizer algo concreto em vez de
// "importado com sucesso" — e para ele perceber quando não havia nada de novo.
export function ganhosDaJuncao(antes, depois) {
  const conta = estado => ({
    aulas: estado.completed.length,
    miniprojetos: donePractices(estado).length,
    projetos: doneProjects(estado).length,
    pontes: Object.values(estado.functionBridges || {}).filter(p => p.passed && p.quizCorrect).length,
    dias: Object.keys(estado.activities || {}).filter(dia => estado.activities[dia].length).length,
    xp: xpTotal(estado)
  });
  const a = conta(antes), b = conta(depois);
  return {
    aulas: b.aulas - a.aulas,
    miniprojetos: b.miniprojetos - a.miniprojetos,
    projetos: b.projetos - a.projetos,
    pontes: b.pontes - a.pontes,
    dias: b.dias - a.dias,
    xp: b.xp - a.xp,
    mudou: b.xp !== a.xp || b.aulas !== a.aulas || b.pontes !== a.pontes || b.dias !== a.dias
  };
}
