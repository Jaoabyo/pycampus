import { pendingStageWork } from './progression.js';
import { practiceDone, practiceProjects } from './practice-content.js';
import { doneProjects } from './progress.js';
import { functionBridges } from './function-bridges.js';

const minutesFor = kind => kind === 'lesson' ? 15 : kind === 'practice' ? 20 : kind === 'project' ? 30 : 12;

export function missionItemFromWork(work, state) {
  if (!work || work.kind === 'done') return {
    key: `targeted:${state.history?.length || 0}`, kind: 'targeted', id: 'targeted', sub: '',
    label: 'Revisar um ponto no treino dirigido', baseline: state.history?.length || 0, minutes: 12
  };
  const bridge = work.sub === 'ponte' ? functionBridges.find(item => item.id === work.id) : null;
  return {
    key: `${work.kind}:${work.sub || ''}:${work.id}`, kind: work.kind, id: work.id,
    sub: work.sub || '', label: bridge ? `Ponte: ${bridge.title}` : work.label, baseline: 0, minutes: minutesFor(work.kind)
  };
}

export function missionItemDone(item, state, today) {
  if (!item) return false;
  if (item.kind === 'lesson') return state.completed?.includes(item.id) === true;
  if (item.kind === 'practice') {
    if (item.sub === 'ponte') return state.functionBridges?.[item.id]?.passed === true && state.functionBridges[item.id].quizCorrect === true;
    const practice = practiceProjects.find(entry => entry.id === item.id);
    return Boolean(practice && practiceDone(state.learning?.[item.id], practice));
  }
  if (item.kind === 'project') return doneProjects(state).some(project => project.id === item.id)
    || (state.activities?.[today] || []).some(id => id.startsWith(`passo:${item.id}:`));
  if (item.kind === 'targeted') return (state.history?.length || 0) > (item.baseline || 0)
    || (state.activities?.[today] || []).includes('prova');
  return item.kind === 'done';
}

export function updateDailyMission(current, state, today) {
  const target = Math.min(3, Math.max(1, Number(state.goal) || 1));
  const valid = current?.date === today && Array.isArray(current.items);
  const items = valid ? current.items.map(item => {
    const bridge = item.sub === 'ponte' ? functionBridges.find(entry => entry.id === item.id) : null;
    return { ...item, label: bridge ? `Ponte: ${bridge.title}` : item.label, minutes: minutesFor(item.kind) };
  }) : [];
  if (!items.length) items.push(missionItemFromWork(pendingStageWork(state), state));

  while (items.length < target && missionItemDone(items.at(-1), state, today)) {
    let next = missionItemFromWork(pendingStageWork(state), state);
    if (items.some(item => item.key === next.key)) {
      next = missionItemFromWork({ kind: 'done' }, state);
      if (items.some(item => item.kind === 'targeted')) break;
    }
    items.push(next);
  }

  const compact = { date: today, items: items.slice(0, target).map(({ minutes, ...item }) => item) };
  if (valid && JSON.stringify(current) === JSON.stringify(compact)) return current;
  return compact;
}

export const missionProgress = (mission, state, today) => {
  const items = mission?.items || [];
  const done = items.filter(item => missionItemDone(item, state, today)).length;
  return { done, total: items.length, percent: items.length ? done / items.length * 100 : 0 };
};
