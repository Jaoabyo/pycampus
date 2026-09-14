// Revisitar um passo é livre; a conferência final só faz sentido depois de programar.
export const requiredPracticeStages = ['modify', 'create'];

// Mantemos a ordem pedagógica mesmo quando um backup chega com os valores invertidos.
// Estas funções também deixam a tela explicar exatamente qual etapa ainda falta, em vez de
// exibir um botão desativado sem contexto.
export function passedPracticeStages(item) {
  return requiredPracticeStages.filter(stage => item?.passed?.includes(stage));
}

export function pendingPracticeStages(item) {
  const passed = new Set(passedPracticeStages(item));
  return requiredPracticeStages.filter(stage => !passed.has(stage));
}

export function firstPendingPracticeStage(item) {
  return pendingPracticeStages(item)[0] || null;
}

export function markPracticeStagePassed(item, stage) {
  if (!requiredPracticeStages.includes(stage)) return passedPracticeStages(item);
  return requiredPracticeStages.filter(id => id === stage || item?.passed?.includes(id));
}

export function invalidatePracticeStage(item, stage) {
  return passedPracticeStages(item).filter(id => id !== stage);
}

export function canReviewPractice(item) {
  return firstPendingPracticeStage(item) === null;
}

export function practicePosition(item) {
  const stage = ['read', 'investigate', 'modify', 'create', 'review'].includes(item?.position) ? item.position : 'read';
  return stage === 'review' && !canReviewPractice(item) ? 'create' : stage;
}
