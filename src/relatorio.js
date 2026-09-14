import { lessons, projects } from './curriculum.js';
import { practiceProjects, practiceDone } from './practice-content.js';
import { functionBridges } from './function-bridges.js';
import { diagnose, patterns } from './diagnosis.js';
import { doneProjects, xpTotal, levelInfo, streak, localDate, shiftDate } from './progress.js';

// O estudante pediu para o Lumi preparar, de tempos em tempos, um relatório do que ele andou
// fazendo — para ser avaliado por fora. O relatório é montado a partir do que a plataforma
// realmente registrou: nada aqui é opinião, é o diário.
export const DIAS_ENTRE_RELATORIOS = 3;

export function relatorioVencido(estado, hoje = localDate()) {
  const ultimo = estado?.ultimoRelatorio;
  if (!ultimo) return (estado?.completed?.length || 0) > 0;
  return ultimo <= shiftDate(hoje, -DIAS_ENTRE_RELATORIOS);
}

const dia = valor => valor.split('-').reverse().join('/');

export function montarRelatorio(estado, hoje = localDate()) {
  const nivel = levelInfo(estado);
  const feitas = lessons.filter(aula => estado.completed.includes(aula.id));
  const treinados = practiceProjects.filter(p => practiceDone(estado.learning?.[p.id], p));
  const pontes = functionBridges.filter(b => estado.functionBridges?.[b.id]?.passed && estado.functionBridges[b.id]?.quizCorrect);
  const entregues = doneProjects(estado);
  const desde = shiftDate(hoje, -DIAS_ENTRE_RELATORIOS * 3);

  // Tentativas com erro no período: é onde o estudante realmente travou.
  const recentes = (estado.history || []).filter(item => String(item.startedAt).slice(0, 10) >= desde);
  const falhas = recentes.filter(item => item.status === 'error' || item.matched === false);
  const porAula = {};
  for (const item of falhas) {
    const chave = item.title || item.lessonId || 'Laboratório';
    porAula[chave] = (porAula[chave] || 0) + 1;
  }
  const maisTravou = Object.entries(porAula).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const padroes = diagnose(estado.history || []).filter(p => p.count > 0);
  const explicacoes = [];
  for (const p of practiceProjects) {
    const item = estado.learning?.[p.id];
    if (item?.notes) explicacoes.push({ onde: `Miniprojeto ${p.title}`, texto: item.notes });
    if (item?.reflection) explicacoes.push({ onde: `Reflexão em ${p.title}`, texto: item.reflection });
  }
  for (const padrao of patterns) {
    const nota = estado.mastery?.[padrao.id]?.note;
    if (nota) explicacoes.push({ onde: `Engano "${padrao.title}"`, texto: nota });
  }

  const provas = (estado.provas || []).slice(-3);

  const linhas = [
    `# Relatório de estudo — PyCampus`,
    ``,
    `Gerado em ${dia(hoje)} por ${estado.name}. Período considerado: desde ${dia(desde)}.`,
    ``,
    `## Onde estou`,
    ``,
    `- Nível ${nivel.level} · ${xpTotal(estado)} XP`,
    `- ${feitas.length} de ${lessons.length} aulas concluídas`,
    `- ${treinados.length} de ${practiceProjects.length} miniprojetos treinados`,
    `- ${pontes.length} de ${functionBridges.length} pontes de função fechadas`,
    `- ${entregues.length} de ${projects.length} projetos concluídos`,
    `- Sequência atual: ${streak(estado, hoje)} dia(s)`,
    ``,
    `Última aula concluída: ${feitas.length ? feitas[feitas.length - 1].title : 'nenhuma ainda'}.`,
    ``,
    `## Onde eu travei`,
    ``,
    falhas.length
      ? `Foram ${falhas.length} tentativas com erro ou saída diferente no período. As que mais repetiram:\n\n${maisTravou.map(([onde, quantas]) => `- ${onde}: ${quantas} tentativa(s)`).join('\n')}`
      : 'Nenhuma tentativa com erro registrada no período.',
    ``,
    padroes.length
      ? `Enganos que se repetiram, segundo o diagnóstico por regras:\n\n${padroes.map(p => `- **${p.title}** — ${p.count} vez(es). ${p.summary}${p.evidence ? `\n  - Minha linha: \`${p.evidence.line}\`` : ''}`).join('\n')}`
      : 'O diagnóstico não encontrou nenhum engano repetido.',
    ``,
    `## O que eu escrevi com minhas palavras`,
    ``,
    explicacoes.length
      ? explicacoes.slice(0, 8).map(e => `**${e.onde}**\n\n> ${e.texto.replace(/\n+/g, ' ')}`).join('\n\n')
      : 'Ainda não escrevi nenhuma explicação.',
    ``,
    `## Provas sem consulta`,
    ``,
    provas.length
      ? provas.map(p => `- ${dia(p.data)}: ${p.acertos} de ${p.total}, em ${Math.round(p.segundos / 60)} min`).join('\n')
      : 'Ainda não fiz nenhuma prova.',
    ``,
    `## O que eu gostaria de saber`,
    ``,
    `Como estou indo? O que devo reforçar antes de seguir? Minhas explicações acima mostram que entendi, ou estou só repetindo a forma?`
  ];
  return linhas.join('\n');
}
