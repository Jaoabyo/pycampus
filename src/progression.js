import { lessons, modules, projects } from './curriculum.js';
import { practiceDone, practiceProjects } from './practice-content.js';
import { buildDone } from './project-steps.js';
import { functionBridges } from './function-bridges.js';

const validModuleIndex = index => Number.isInteger(index) && index >= 0 && index < modules.length;

export function moduleIndexForLesson(id) {
  return modules.findIndex(module => module.lessons.some(lesson => lesson.id === id));
}

function projectComplete(state, project) {
  const checks = state?.projectChecks?.[project.id];
  const selfChecked = Array.isArray(checks) && project.requirements.every((_, index) => checks.includes(index));
  // A nota do Lumi substitui a autoavaliação, porque ela leu o código publicado de verdade.
  // Os passos da construção continuam valendo: a entrega não pula a prática.
  return (selfChecked || state?.projectGrades?.[project.id]?.aprovado === true)
    && buildDone(state || {}, project.id);
}

// Count the work belonging to this module, rather than only its lesson checkmarks.
// This is read-only: work already saved in later modules remains available in the backup.
export function moduleRequirements(state, index) {
  const module = validModuleIndex(index) ? modules[index] : null;
  if (!module) return { module: null, index, missingLessons: [], missingPractices: [], missingProjects: [], missingBridges: [], complete: false };

  const completed = Array.isArray(state?.completed) ? state.completed : [];
  const missingLessons = lessons.filter(lesson => lesson.moduleId === module.id && !completed.includes(lesson.id));
  const missingPractices = practiceProjects.filter(practice => moduleIndexForLesson(practice.prerequisite) === index
    && !practiceDone(state?.learning?.[practice.id], practice));
  const missingProjects = projects.filter(project => project.module === index && !projectComplete(state, project));
  const missingBridges = functionBridges.filter(bridge => bridge.moduleId === module.id
    && !(state?.functionBridges?.[bridge.id]?.passed === true && state.functionBridges[bridge.id].quizCorrect === true));
  return {
    module, index, missingLessons, missingPractices, missingProjects, missingBridges,
    complete: !missingLessons.length && !missingPractices.length && !missingProjects.length && !missingBridges.length
  };
}

export function moduleIsOpen(state, index) {
  if (!validModuleIndex(index)) return false;
  for (let earlier = 0; earlier < index; earlier++) {
    if (!moduleRequirements(state, earlier).complete) return false;
  }
  return true;
}

// modules.length means that the whole formation is complete.
export function firstIncompleteModule(state) {
  const index = modules.findIndex((_, position) => !moduleRequirements(state, position).complete);
  return index < 0 ? modules.length : index;
}

export function lessonIsOpen(state, id) {
  return moduleIsOpen(state, moduleIndexForLesson(id));
}

// Nunca tirar o que já foi conquistado: uma aula concluída continua aberta para revisão,
// mesmo que a regra de liberação tenha passado a valer depois que ela foi feita.
export function lessonAllowed(state, id) {
  return lessonIsOpen(state, id) || Boolean(state?.completed?.includes(id));
}

// Frase curta dizendo o que falta na etapa, para o estudante saber o que fazer em vez de só ver um cadeado.
export function missingSummary(state, index) {
  const pending = moduleRequirements(state, index);
  if (!pending.module || pending.complete) return '';
  const parts = [];
  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
  if (pending.missingLessons.length) parts.push(plural(pending.missingLessons.length, 'aula', 'aulas'));
  if (pending.missingBridges.length) parts.push(plural(pending.missingBridges.length, 'ponte de função', 'pontes de função'));
  if (pending.missingPractices.length) parts.push(plural(pending.missingPractices.length, 'miniprojeto', 'miniprojetos'));
  if (pending.missingProjects.length) parts.push(plural(pending.missingProjects.length, 'projeto', 'projetos'));
  return `Falta${parts.length === 1 && !/s$/.test(parts[0]) ? '' : 'm'} ${parts.join(', ').replace(/, ([^,]*)$/, ' e $1')} na etapa ${pending.module.number}.`;
}

// O que trava uma etapa é sempre uma etapa anterior incompleta: a mensagem precisa apontar essa etapa,
// não a que o estudante tentou abrir.
export function blockingSummary(state, index) {
  for (let earlier = 0; earlier < index; earlier++) {
    const pending = moduleRequirements(state, earlier);
    if (!pending.complete) return missingSummary(state, earlier);
  }
  return '';
}

// O que de fato destrava a formação agora. O botão principal usa isto, então ele nunca manda
// o estudante para uma tela travada: se faltam miniprojetos, ele vai para a oficina.
export function pendingStageWork(state) {
  const index = firstIncompleteModule(state);
  if (index >= modules.length) return { kind: 'done', label: 'Formação concluída', id: '' };
  const pending = moduleRequirements(state, index);
  if (pending.missingLessons.length) {
    const lesson = pending.missingLessons[0];
    return { kind: 'lesson', label: `Continuar na aula: ${lesson.title}`, id: lesson.id, moduleIndex: index };
  }
  // Ponte e miniprojeto são os dois 'practice', e moram na mesma tela — mas são coisas
  // diferentes, e quem vai clicar precisa saber em qual está entrando.
  if (pending.missingBridges.length) return { kind: 'practice', sub: 'ponte', label: 'Fazer as pontes de função', id: pending.missingBridges[0].id, moduleIndex: index };
  if (pending.missingPractices.length) {
    const count = pending.missingPractices.length;
    return { kind: 'practice', sub: 'miniprojeto', label: `Treinar ${count} ${count === 1 ? 'miniprojeto' : 'miniprojetos'} da etapa`, id: pending.missingPractices[0].id, moduleIndex: index };
  }
  const project = pending.missingProjects[0];
  return { kind: 'project', label: `Construir o projeto: ${project.title}`, id: project.id, moduleIndex: index };
}

export function practiceIsOpen(state, id) {
  const practice = practiceProjects.find(item => item.id === id);
  return Boolean(practice)
    && moduleIsOpen(state, moduleIndexForLesson(practice.prerequisite))
    && Boolean(state?.completed?.includes(practice.prerequisite));
}

export function projectIsOpen(state, id) {
  const project = projects.find(item => item.id === id);
  if (!project || !moduleIsOpen(state, project.module)) return false;
  const pending = moduleRequirements(state, project.module);
  return pending.missingLessons.length === 0
    && pending.missingPractices.length === 0
    && pending.missingBridges.length === 0;
}

// O fim de uma aula mandava para a aula seguinte sem olhar se ela estava aberta: o estudante
// clicava em "Próxima aula" e levava um aviso de tela travada, sem nada para fazer a seguir.
// Quem sabe o que vem é pendingStageWork. Aqui ficam as palavras que explicam o que vem, para
// que a aula, a oficina e o estúdio digam a mesma coisa — e digam ANTES do clique, porque
// entrar num miniprojeto ou num projeto sem aviso é entrar em outra tela sem saber por quê.
export function explicaTrabalho(work) {
  if (work.kind === 'practice') return work.sub === 'ponte' ? {
    eyebrow: 'A ETAPA PEDE AS PONTES DE FUNÇÃO ANTES DA PRÓXIMA AULA',
    titulo: work.label,
    texto: 'Uma ponte é um exercício curto sobre um único ponto de função: chamar, devolver, passar um valor. Você monta ou escreve poucas linhas e responde a uma pergunta. Elas ficam na oficina de prática e abrem a próxima aula desta etapa.',
    botao: 'Ir para as pontes de função'
  } : {
    eyebrow: 'A ETAPA PEDE MINIPROJETOS ANTES DA PRÓXIMA AULA',
    titulo: work.label,
    texto: 'Um miniprojeto tem cinco etapas: você prevê a saída de um exemplo pronto, executa, explica por que funciona, muda uma parte e só então escreve a sua versão. Leva alguns minutos e abre a próxima aula desta etapa.',
    botao: 'Ir para a oficina de prática'
  };
  if (work.kind === 'project') return {
    eyebrow: 'A ETAPA PEDE O PROJETO AGORA',
    titulo: work.label,
    texto: 'O projeto é construído em passos, cada um com pista, conferência e uma pergunta sua. Você escreve o código, registra cada passo e no fim entrega. É o que fecha esta etapa.',
    botao: 'Abrir o estúdio do projeto'
  };
  if (work.kind === 'done') return {
    eyebrow: 'FORMAÇÃO CONCLUÍDA',
    titulo: work.label,
    texto: 'As oito etapas estão completas. Daqui em diante vale rever o que quiser e melhorar os projetos que já entregou.',
    botao: 'Ver minhas conquistas'
  };
  return {
    eyebrow: 'PRÓXIMO PASSO',
    titulo: work.label,
    texto: 'Seguindo na mesma etapa.',
    botao: 'Continuar'
  };
}

