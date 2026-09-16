export const UI_STORAGE_KEY = 'pycampus.ui.v1';

const cleanStepMap = value => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).slice(-100)
    .filter(([id, step]) => typeof id === 'string' && id.length <= 80 && Number.isInteger(step) && step >= 1 && step <= 4));
};

const cleanMission = value => {
  if (!value || typeof value !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date || '')) return null;
  const seen = new Set();
  const items = (Array.isArray(value.items) ? value.items : []).slice(0, 3).filter(item => {
    if (!item || typeof item.key !== 'string' || seen.has(item.key)) return false;
    seen.add(item.key);
    return ['lesson', 'practice', 'project', 'targeted', 'done'].includes(item.kind);
  }).map(item => ({
    key: item.key.slice(0, 180), kind: item.kind, id: String(item.id || '').slice(0, 80),
    sub: String(item.sub || '').slice(0, 30), label: String(item.label || '').slice(0, 160),
    baseline: Number.isInteger(item.baseline) ? Math.max(0, item.baseline) : 0
  }));
  return { date: value.date, items };
};

export function normalizeUiPreferences(value) {
  return {
    lessonMode: value?.lessonMode === 'complete' ? 'complete' : 'focus',
    courseView: value?.courseView === 'list' ? 'list' : 'map',
    lessonSteps: cleanStepMap(value?.lessonSteps),
    dailyMission: cleanMission(value?.dailyMission)
  };
}

export function loadUiPreferences(storage = globalThis.localStorage) {
  try { return normalizeUiPreferences(JSON.parse(storage?.getItem(UI_STORAGE_KEY) || 'null')); }
  catch { return normalizeUiPreferences(null); }
}

export function saveUiPreferences(value, storage = globalThis.localStorage) {
  const clean = normalizeUiPreferences(value);
  try { storage?.setItem(UI_STORAGE_KEY, JSON.stringify(clean)); } catch { /* preferência visual é opcional */ }
  return clean;
}
