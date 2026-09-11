import { lessons } from './curriculum.js';
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
  if (!newLessons.length && !newProjects.length && !newPractices.length && !unlocked.length && nextLevel.level <= previousLevel.level) return null;
  const lessonIds = new Set(lessons.map(l => l.id));
  const firstLessonToday = newLessons.some(l => after.activities[day]?.includes(l.id)) && !(before.activities[day] || []).some(id => lessonIds.has(id));
  return {
    title: newLessons.length ? 'Aula concluída!' : newProjects.length ? 'Projeto concluído!' : newPractices.length ? 'Miniprojeto treinado!' : 'Nova conquista!',
    subtitle: newLessons.map(l => l.title).join(', ') || newProjects.map(p => p.title).join(', ') || newPractices.map(p => p.title).join(', ') || 'Sua dedicação está fazendo história.',
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
