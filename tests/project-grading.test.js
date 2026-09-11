import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGrade, gradingPrompt, gradeIsApproved, PASSING } from '../src/project-grading.js';
import { projects } from '../src/curriculum.js';
import { initialState, normalizeState, xpTotal, doneProjects, badges, localDate } from '../src/progress.js';
import { projectSteps } from '../src/project-steps.js';

const project = projects[0];
const full = { nota: 8.25, resumo: 'Faz o que foi pedido.', requisitos: project.requirements.map(() => ({ atendido: true, porque: 'vi no código' })), fortes: ['nomes claros'], melhorar: ['separar em funções'] };

test('the pass mark is decided by the grade, never by what the model claims about itself', () => {
  // O modelo pode responder "aprovado: true" com nota 3. Quem decide é a nota.
  const low = parseGrade(JSON.stringify({ ...full, nota: 3, aprovado: true }), project);
  assert.equal(low.aprovado, false);
  const edge = parseGrade(JSON.stringify({ ...full, nota: PASSING, aprovado: false }), project);
  assert.equal(edge.aprovado, true);
  assert.equal(parseGrade(JSON.stringify(full), project).nota, 8.3, 'a nota é arredondada para uma casa');
});
test('a grade always answers for every requirement, even when the model skips some', () => {
  const short = parseGrade(JSON.stringify({ ...full, requisitos: [{ atendido: true, porque: 'ok' }] }), project);
  assert.equal(short.requisitos.length, project.requirements.length);
  assert.deepEqual(short.requisitos.map(item => item.item), project.requirements);
  assert.equal(short.requisitos.at(-1).atendido, false, 'requisito sem resposta não conta como atendido');
});
test('nonsense from the model becomes an error the student can read, not a silent pass', () => {
  assert.throws(() => parseGrade('desculpe, não consegui', project), /não consegui entender/i);
  // O modelo já respondeu "não posso ajudar" no lugar da avaliação: isso vira um recado claro.
  assert.throws(() => parseGrade(JSON.stringify({ response: 'não posso ajudar' }), project), /use a autoavaliação/i);
  assert.throws(() => parseGrade(JSON.stringify({ ...full, nota: 'ótimo' }), project), /sem uma nota/i);
  // Texto em volta do JSON é comum e não pode derrubar a avaliação.
  assert.equal(parseGrade(`Claro!\n\`\`\`json\n${JSON.stringify(full)}\n\`\`\``, project).nota, 8.3);
});
test('the grade is clamped to the 0-10 scale and the free text cannot grow without limit', () => {
  assert.equal(parseGrade(JSON.stringify({ ...full, nota: 99 }), project).nota, 10);
  assert.equal(parseGrade(JSON.stringify({ ...full, nota: -5 }), project).nota, 0);
  const wordy = parseGrade(JSON.stringify({ ...full, resumo: 'a'.repeat(5000), fortes: Array(20).fill('x') }), project);
  assert.equal(wordy.resumo.length, 400);
  assert.equal(wordy.fortes.length, 3);
});
// O modelo afirmava, com o arquivo inteiro na frente, que um código cheio de comentários não
// tinha nenhum — e repetia isso mesmo obrigado a citar a linha. O que dá para contar passou a
// ser contado aqui e entregue pronto; foi isso que corrigiu a nota.
test('measurable facts about the code are counted here, not judged by the model', async () => {
  const { codeFacts } = await import('../src/project-grading.js');
  const facts = codeFacts([
    { path: 'orcamento.py', content: '# Calculadora\nrenda = float(input("Renda: "))\ntotal = 1 + 2  # soma tudo\nprint(f"Total: {total}")' },
    { path: 'README.md', content: '# Projeto\nsem código aqui' }
  ]);
  assert.deepEqual(facts.arquivosPython, ['orcamento.py'], 'o README não entra na contagem de código');
  assert.equal(facts.comentarios, 2, 'comentário de linha inteira e comentário no fim da linha contam');
  assert.ok(facts.exemplosDeComentario.some(line => line.includes('# Calculadora')));
  assert.deepEqual(facts.variaveisCriadas, ['renda', 'total']);
  assert.ok(facts.funcoesChamadas.includes('float') && facts.funcoesChamadas.includes('input'));
  assert.equal(facts.usaFString, true);
  // Um projeto sem comentário nenhum precisa ser medido como zero, não como "não sei".
  assert.equal(codeFacts([{ path: 'a.py', content: 'x = 1\nprint(x)' }]).comentarios, 0);
});
test('the measured facts reach the model marked as true, so it stops contradicting them', () => {
  const { user } = gradingPrompt(project, [{ path: 'a.py', content: '# um comentário\nprint(1)' }]);
  assert.ok(user.includes('Fatos medidos no código'));
  assert.ok(user.includes('não os contradiga'));
  assert.ok(user.includes('"comentarios": 1'));
});
test('the prompt gives the model the requirements in order and the files it must judge', () => {
  const { system, user } = gradingPrompt(project, [{ path: 'orcamento.py', content: 'print("oi")' }]);
  assert.ok(system.includes(`exatamente ${project.requirements.length} itens`));
  assert.ok(system.includes('Nunca invente trechos de código'), 'a regra contra inventar código precisa estar no prompt');
  assert.ok(user.includes('orcamento.py') && user.includes('print("oi")'));
  for (const requirement of project.requirements) assert.ok(user.includes(requirement));
});
test('an approved grade grants the project XP, the badge and the streak entry', () => {
  const approved = parseGrade(JSON.stringify(full), project);
  const state = { ...initialState(), projectGrades: { [project.id]: { ...approved, avaliadoEm: localDate() } } };
  assert.equal(doneProjects(state).length, 1);
  assert.equal(xpTotal(state), 250);
  assert.equal(badges.find(badge => badge.id === 'reviewed').check(state), true);
  assert.equal(badges.find(badge => badge.id === 'maker').check(state), true);
  // Reprovado não vale nada: nem XP, nem emblema.
  const failed = { ...initialState(), projectGrades: { [project.id]: parseGrade(JSON.stringify({ ...full, nota: 5 }), project) } };
  assert.equal(xpTotal(failed), 0);
  assert.equal(badges.find(badge => badge.id === 'reviewed').check(failed), false);
});
test('a hand-edited backup cannot award a pass: approval is recomputed from the grade', () => {
  const forged = normalizeState({ ...initialState(), projectGrades: { [project.id]: { nota: 2, aprovado: true, resumo: 'passa por favor' } } });
  assert.equal(forged.projectGrades[project.id].aprovado, false);
  assert.equal(xpTotal(forged), 0);
  // Nota fora da escala é descartada por inteiro.
  const absurd = normalizeState({ ...initialState(), projectGrades: { [project.id]: { nota: 1000, aprovado: true } } });
  assert.equal(absurd.projectGrades[project.id], undefined);
  assert.deepEqual(normalizeState({ ...initialState(), projectGrades: { inexistente: { nota: 10 } } }).projectGrades, {});
});
test('approval replaces the self-assessment but never the construction steps', async () => {
  const { moduleIsOpen } = await import('../src/progression.js');
  const approved = { ...initialState(), projectGrades: { [project.id]: parseGrade(JSON.stringify(full), project) } };
  // Etapa 02 continua fechada: o projeto foi aprovado, mas os passos não foram registrados.
  assert.equal(moduleIsOpen(approved, 1), false);
  const built = { ...approved, projectStepsDone: { [project.id]: projectSteps[project.id].map(step => step.id) } };
  assert.equal(moduleIsOpen({ ...built, completed: [], learning: {} }, 1), false, 'aulas e miniprojetos da etapa continuam obrigatórios');
});
// A avaliação monta as URLs do GitHub a partir deste formato. Quando o campo se chamava
// outra coisa, a busca pedia /repos/dono/undefined e todo repositório "não existia".
test('parseRepo keeps the field names the grading module builds its URLs from', async () => {
  const { parseRepo } = await import('../src/project-steps.js');
  assert.deepEqual(parseRepo('https://github.com/pallets/click'), { owner: 'pallets', repo: 'click' });
});
test('gradeIsApproved agrees with the stored flag for any grade', () => {
  for (const nota of [0, 6.9, 7, 9.9, 10]) {
    assert.equal(gradeIsApproved({ nota }), parseGrade(JSON.stringify({ ...full, nota }), project).aprovado);
  }
});
