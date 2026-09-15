// O Lumi pode orientar sem virar um segundo diário gigante. Cada registro é um resumo curto
// da conversa, associado à atividade em que ele foi pedido. Assim ele cabe no backup e dá
// contexto para a próxima revisão sem guardar toda a resposta do modelo.
export const LUMI_NOTES_LIMIT = 80;

const clip = (value, length) => typeof value === 'string'
  ? value.replace(/\s+/g, ' ').trim().slice(0, length)
  : '';

const isoDate = value => {
  if (typeof value !== 'string' || !value.trim()) return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
};

const normalizeOne = item => {
  if (!item || typeof item !== 'object') return null;
  const note = {
    id: clip(item.id, 96),
    at: isoDate(item.at),
    activityId: clip(item.activityId, 120),
    lessonId: clip(item.lessonId, 80),
    title: clip(item.title, 140),
    level: Number.isInteger(item.level) && item.level >= 1 && item.level <= 4 ? item.level : 0,
    question: clip(item.question, 600),
    tip: clip(item.tip, 1200),
    // A ajuda escrita vale sozinha e é a única disponível com a IA desligada. Ela entra no
    // diário como as outras, mas dizendo o que era: orientação escrita, não resposta do modelo.
    fonte: item.fonte === 'escrita' ? 'escrita' : 'ia'
  };
  return note.id && note.at && note.activityId && note.lessonId && note.title && note.level && note.question && note.tip ? note : null;
};

const richer = (current, candidate) => {
  if (!current) return candidate;
  if (candidate.at !== current.at) return candidate.at > current.at ? candidate : current;
  const currentSize = current.question.length + current.tip.length;
  const candidateSize = candidate.question.length + candidate.tip.length;
  return candidateSize >= currentSize ? candidate : current;
};

export function normalizeLumiNotes(value) {
  if (!Array.isArray(value)) return [];
  const byId = new Map();
  for (const raw of value) {
    const note = normalizeOne(raw);
    if (note) byId.set(note.id, richer(byId.get(note.id), note));
  }
  return [...byId.values()].sort((a, b) => a.at.localeCompare(b.at)).slice(-LUMI_NOTES_LIMIT);
}

export function appendLumiNote(state, note) {
  return { ...state, lumiNotes: normalizeLumiNotes([...(state?.lumiNotes || []), note]) };
}

// Ao importar dois aparelhos, ids distintos representam conversas distintas. Se a mesma
// conversa existir nos dois, o registro mais recente (ou mais informativo) fica uma só vez.
export const mergeLumiNotes = (first, second) => normalizeLumiNotes([
  ...(Array.isArray(first) ? first : []),
  ...(Array.isArray(second) ? second : [])
]);
