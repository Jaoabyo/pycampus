// Revisitar um passo é livre; a conferência final só faz sentido depois de programar.
export function canReviewPractice(item) {
  return ['modify', 'create'].every(stage => item?.passed?.includes(stage));
}

export function practicePosition(item) {
  const stage = ['read', 'investigate', 'modify', 'create', 'review'].includes(item?.position) ? item.position : 'read';
  return stage === 'review' && !canReviewPractice(item) ? 'create' : stage;
}
