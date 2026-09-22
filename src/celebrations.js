import { lessons } from './curriculum.js';
import { recompensasDaFaculdade } from './faculdade-recompensas.js';
import { aulasDaFaculdade } from './faculdade.js';
import { badges, levelInfo, doneProjects, donePractices, localDate, streak } from './progress.js';

// Compare committed progress, never an execution result or a mere button click.
export function buildCelebration(before, after, day = localDate()) {
  const newLessons = lessons.filter(l => after.completed.includes(l.id) && !before.completed.includes(l.id));
  const previousProjects = new Set(doneProjects(before).map(p => p.id));
  const newProjects = doneProjects(after).filter(p => !previousProjects.has(p.id));
  const previousPractices = new Set(donePractices(before).map(p => p.id));
  const newPractices = donePractices(after).filter(p => !previousPractices.has(p.id));
  const unlocked = badges.filter(b => b.check(after) && !b.check(before));
  const previousLevel = levelInfo(before), nextLevel = levelInfo(after);
  const academiaAntes = recompensasDaFaculdade(before), academiaDepois = recompensasDaFaculdade(after);
  const anteriores = new Set(academiaAntes.itens.filter(i => i.concluida).map(i => i.id));
  const novosAcademicos = academiaDepois.itens.filter(i => i.concluida && !anteriores.has(i.id));
  const novaEntrega = academiaDepois.entregas.find(e => e.concluida && !academiaAntes.entregas.find(a => a.id === e.id)?.concluida);
  // Um passo da entrega vale 25 XP, mas não merece confete: são até treze por entrega, e
  // comemorar cada um interrompe o passo a passo e iguala "registrei o passo 3" a "concluí o
  // trabalho inteiro". O XP do passo aparece no próprio estúdio; aqui celebra-se o que termina
  // alguma coisa — aula, exercício, projeto, entrega —, além de emblema e subida de nível.
  const xpAcademico = novosAcademicos.length > 0 || Boolean(novaEntrega);
  if (!newLessons.length && !newProjects.length && !newPractices.length && !unlocked.length && !xpAcademico && nextLevel.level <= previousLevel.level) return null;
  const tituloAcademico = novaEntrega ? 'Entrega prática concluída!' : novosAcademicos[0]?.tipo === 'aula' ? 'Aula da Faculdade concluída!' : novosAcademicos[0]?.tipo === 'exercicio' ? 'Exercício concluído!' : novosAcademicos[0]?.tipo === 'projeto' ? 'Projeto da Faculdade concluído!' : 'Mais um passo concluído!';
  const lessonIds = new Set([...lessons.map(l => l.id), ...aulasDaFaculdade.map(a => `faculdade:${a.id}`)]);
  const firstLessonToday = (newLessons.some(l => after.activities[day]?.includes(l.id))
    || novosAcademicos.some(i => i.tipo === 'aula' && after.activities[day]?.includes(`faculdade:${i.id}`)))
    && !(before.activities[day] || []).some(id => lessonIds.has(id));
  return {
    title: newLessons.length ? 'Aula concluída!' : newProjects.length ? 'Projeto concluído!' : newPractices.length ? 'Miniprojeto treinado!' : xpAcademico ? tituloAcademico : 'Nova conquista!',
    subtitle: newLessons.map(l => l.title).join(', ') || newProjects.map(p => p.title).join(', ') || newPractices.map(p => p.title).join(', ') || novaEntrega?.titulo || novosAcademicos.map(i => i.titulo).join(', ') || 'Sua dedicação está fazendo história.',
    xp: Math.max(0, nextLevel.xp - previousLevel.xp), firstLessonToday, streak: streak(after, day),
    level: nextLevel.level > previousLevel.level ? nextLevel.level : null,
    badges: unlocked.map(({ id, title, description, icon, color }) => ({ id, title, description, icon, color })),
    project: newProjects.length > 0,
    // Concluir pela nota do Lumi e concluir pela autoavaliação são coisas diferentes, e a
    // celebração não pode atribuir ao estudante um julgamento que não foi dele.
    projectGrade: newProjects.map(p => after.projectGrades?.[p.id]).find(grade => grade?.aprovado === true)?.nota ?? null,
    practice: newPractices.length > 0,
  };
}
