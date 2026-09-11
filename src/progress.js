import { lessons, projects } from './curriculum.js';
import { normalizeHistory } from './history.js';
import { normalizeLearning, practiceProjects, practiceDone, practiceXp } from './practice-content.js';
import { normalizeProjectWork } from './project-steps.js';
import { normalizeMastery, patterns } from './diagnosis.js';
import { normalizeBridges } from './function-bridges.js';
export const STORAGE_KEY = 'pycampus.v1';
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const shiftDate = (key, days) => { const date = new Date(`${key}T12:00:00`); date.setDate(date.getDate() + days); return localDate(date); };
export const initialState = () => ({ version: 1, name: 'Estudante', bio: 'Um passo de cada vez, uma linha de código por dia.', avatar: '🚀', goal: 1, weeklyGoal: 5, lembrete: '', completed: [], history: [], projectChecks: {}, projectLinks: {}, projectGrades: {}, projectCodes: {}, projectStepsDone: {}, mastery: {}, functionBridges: {}, customLessons: {}, activities: {}, sessions: [], codes: {}, learning: {}, playground: '# Seu espaço para experimentar\nprint("Olá, PyCampus!")\n', joined: localDate() });
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).valueOf()) && localDate(new Date(`${value}T12:00:00`)) === value;
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const bounded = (value, fallback, min, max) => Number.isInteger(value) && value >= min && value <= max ? value : fallback;
export function normalizeState(input) {
  if (!input || input.version !== 1 || !Array.isArray(input.completed)) throw new Error('Este arquivo não é um backup válido do PyCampus.');
  const base = initialState();
  base.learning = normalizeLearning(input.learning);
  normalizeProjectWork(input, base);
  base.mastery = normalizeMastery(input);
  base.functionBridges = normalizeBridges(input);
  const ids = new Set(lessons.map(l => l.id));
  base.name = typeof input.name === 'string' ? input.name.trim().slice(0, 40) || 'Estudante' : base.name;
  base.bio = typeof input.bio === 'string' ? input.bio.slice(0, 200) : base.bio;
  base.avatar = ['🚀', '🐍', '🧑‍💻', '🦊', '🌱', '🌟'].includes(input.avatar) ? input.avatar : base.avatar;
  base.goal = bounded(input.goal, 1, 1, 6);
  base.weeklyGoal = bounded(input.weeklyGoal, 5, 1, 7);
  base.joined = validDate(input.joined) ? input.joined : base.joined;
  // Horário do lembrete: só um HH:MM válido entra.
  base.lembrete = validTime(input.lembrete) ? input.lembrete : '';
  base.completed = [...new Set(input.completed.filter(id => ids.has(id)))];
  for (const project of projects) {
    const checks = input.projectChecks?.[project.id];
    if (Array.isArray(checks)) base.projectChecks[project.id] = [...new Set(checks.filter(n => Number.isInteger(n) && n >= 0 && n < project.requirements.length))];
    const link = input.projectLinks?.[project.id];
    if (typeof link === 'string' && /^https?:\/\//.test(link)) base.projectLinks[project.id] = link.slice(0, 1000);
    // A nota vem de um backup que o estudante pode ter editado: a aprovação é recalculada
    // da nota, nunca aceita como um campo solto valendo 250 XP.
    const grade = input.projectGrades?.[project.id];
    const nota = Number(grade?.nota);
    if (Number.isFinite(nota) && nota >= 0 && nota <= 10) base.projectGrades[project.id] = {
      nota: Math.round(nota * 10) / 10,
      aprovado: nota >= 7,
      resumo: String(grade.resumo || '').slice(0, 400),
      requisitos: (Array.isArray(grade.requisitos) ? grade.requisitos : []).slice(0, project.requirements.length)
        .map((item, index) => ({ item: project.requirements[index], atendido: item?.atendido === true, porque: String(item?.porque || '').slice(0, 300) })),
      fortes: (Array.isArray(grade.fortes) ? grade.fortes : []).slice(0, 3).map(text => String(text).slice(0, 200)),
      melhorar: (Array.isArray(grade.melhorar) ? grade.melhorar : []).slice(0, 3).map(text => String(text).slice(0, 200)),
      avaliadoEm: validDate(grade.avaliadoEm) ? grade.avaliadoEm : localDate()
    };
  }
  // Lições do Lumi voltam de um backup como texto qualquer: cortadas no tamanho e sem nunca
  // valer XP. Uma lição restaurada não foi conferida por esta sessão, e o aviso disso fica na tela.
  for (const [id, lesson] of Object.entries(input.customLessons || {})) {
    if (!lesson || typeof lesson !== 'object' || !patterns.some(pattern => pattern.id === id)) continue;
    const line = (value, limit) => typeof value === 'string' ? value.slice(0, limit) : '';
    const explicacao = (Array.isArray(lesson.explicacao) ? lesson.explicacao : []).slice(0, 3).map(item => line(item, 300)).filter(Boolean);
    if (!explicacao.length || !line(lesson.exemplo, 1200) || !line(lesson.solucao, 1200)) continue;
    base.customLessons[id] = {
      titulo: line(lesson.titulo, 80), explicacao,
      entradasExemplo: (Array.isArray(lesson.entradasExemplo) ? lesson.entradasExemplo : []).slice(0, 5).map(item => line(item, 100)).filter(Boolean),
      entradasDesafio: (Array.isArray(lesson.entradasDesafio) ? lesson.entradasDesafio : []).slice(0, 5).map(item => line(item, 100)).filter(Boolean),
      exemplo: line(lesson.exemplo, 1200), saidaExemplo: line(lesson.saidaExemplo, 600),
      desafio: line(lesson.desafio, 500), solucao: line(lesson.solucao, 1200), saidaDesafio: line(lesson.saidaDesafio, 600),
      criadaEm: validDate(lesson.criadaEm) ? lesson.criadaEm : localDate()
    };
  }
  for (const [date, entries] of Object.entries(input.activities || {})) {
    if (validDate(date) && date <= localDate() && Array.isArray(entries)) base.activities[date] = [...new Set(entries.filter(id => typeof id === 'string' && (ids.has(id) || id.startsWith('session:') || patterns.some(p => `lumi:${p.id}` === id) || projects.some(p => `project:${p.id}` === id) || practiceProjects.some(p => `practice:${p.id}` === id))))].slice(0, 200);
  }
  base.sessions = (Array.isArray(input.sessions) ? input.sessions : []).filter(s => s && typeof s.id === 'string' && validDate(s.date) && typeof s.title === 'string' && validTime(s.time)).slice(0, 1000).map(s => ({ id: s.id.slice(0, 80), title: s.title.slice(0, 100), date: s.date, time: s.time, minutes: bounded(s.minutes, 30, 10, 240), done: Boolean(s.done) }));
  for (const l of lessons) if (typeof input.codes?.[l.id] === 'string') base.codes[l.id] = input.codes[l.id].slice(0, 50000);
  base.codeRevisions = {};
  for (const l of lessons) if (Number.isInteger(input.codeRevisions?.[l.id]) && input.codeRevisions[l.id] > 0 && input.codeRevisions[l.id] <= l.revision) base.codeRevisions[l.id] = input.codeRevisions[l.id];
  if (typeof input.playground === 'string') base.playground = input.playground.slice(0, 50000);
  base.history = normalizeHistory(input.history).map(item => item.status === 'running' ? { ...item, status: 'interrupted', output: 'O registro não recebeu um resultado antes de a página ser fechada, recarregada ou o backup ser restaurado.' } : item);
  return base;
}
// Duas portas para o mesmo lugar: a autoavaliação honesta ou a nota do Lumi lendo o código
// que foi realmente publicado. Quem já concluiu por uma delas não perde nada pela outra.
export const doneProjects = state => projects.filter(p => state.projectChecks[p.id]?.length === p.requirements.length
  || state.projectGrades?.[p.id]?.aprovado === true);
export const donePractices = state => practiceProjects.filter(p => practiceDone(state.learning?.[p.id], p));
export const xpTotal = state => state.completed.length * 100 + doneProjects(state).length * 250 + donePractices(state).length * practiceXp;
export function recordPractice(state, id, date = localDate()) {
  const project = practiceProjects.find(p => p.id === id);
  if (!project || !practiceDone(state.learning?.[id], project)) return state;
  const key = `practice:${id}`;
  if (state.activities[date]?.includes(key)) return state;
  return { ...state, activities: { ...state.activities, [date]: [...new Set([...(state.activities[date] || []), key])] } };
}
export const levelInfo = state => { const xp = xpTotal(state); return { xp, level: Math.floor(xp / 500) + 1, current: xp % 500, next: 500, title: xp < 500 ? 'Explorador de Python' : xp < 2000 ? 'Aprendiz de código' : xp < 4000 ? 'Desenvolvedor em evolução' : 'Construtor de sistemas' }; };
export function streak(state, today = localDate()) {
  let cursor = state.activities[today]?.length ? today : shiftDate(today, -1);
  let count = 0;
  while (state.activities[cursor]?.length) { count++; cursor = shiftDate(cursor, -1); }
  return count;
}
export function completeLesson(state, id, date = localDate()) {
  if (state.completed.includes(id) || !lessons.some(l => l.id === id)) return state;
  return { ...state, completed: [...state.completed, id], activities: { ...state.activities, [date]: [...new Set([...(state.activities[date] || []), id])] } };
}
export const weekDays = (today = localDate()) => { const day = new Date(`${today}T12:00:00`).getDay(); const monday = shiftDate(today, -(day + 6) % 7); return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i)); };
export const badges = [
  { id: 'start', title: 'Primeiro passo', description: 'Conclua sua primeira aula.', icon: 'Footprints', color: 'purple', check: s => s.completed.length >= 1 },
  { id: 'fire', title: 'No ritmo', description: 'Estude por 3 dias seguidos.', icon: 'Flame', color: 'orange', check: s => Object.keys(s.activities).some(d => streak(s, d) >= 3) },
  { id: 'foundation', title: 'Base sólida', description: 'Conclua as 6 aulas de fundamentos.', icon: 'Gem', color: 'blue', check: s => lessons.slice(0, 6).every(l => s.completed.includes(l.id)) },
  { id: 'maker', title: 'Mão na massa', description: 'Complete os requisitos de um projeto.', icon: 'Hammer', color: 'teal', check: s => doneProjects(s).length >= 1 },
  { id: 'reviewed', title: 'Aprovado na revisão', description: 'Tenha um projeto aprovado pelo Lumi lendo seu código publicado.', icon: 'ShieldCheck', color: 'teal', check: s => Object.values(s.projectGrades || {}).some(grade => grade?.aprovado === true) },
  { id: 'week', title: 'Chama acesa', description: 'Estude por 7 dias seguidos.', icon: 'Flame', color: 'orange', check: s => Object.keys(s.activities).some(d => streak(s, d) >= 7) },
  { id: 'half', title: 'Além do básico', description: 'Conclua 24 aulas da formação.', icon: 'Zap', color: 'pink', check: s => s.completed.length >= 24 },
  { id: 'builder', title: 'Criador de sistemas', description: 'Complete os requisitos de 4 projetos.', icon: 'Boxes', color: 'purple', check: s => doneProjects(s).length >= 4 },
  { id: 'graduate', title: 'Jornada completa', description: 'Conclua as 48 aulas e os 8 projetos.', icon: 'GraduationCap', color: 'yellow', check: s => s.completed.length === lessons.length && doneProjects(s).length === projects.length }
];
