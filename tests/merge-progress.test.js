import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeProgress, ganhosDaJuncao } from '../src/merge-progress.js';
import { initialState, xpTotal, doneProjects, localDate } from '../src/progress.js';
import { practiceProjects } from '../src/practice-content.js';
import { functionBridges } from '../src/function-bridges.js';
import { projects } from '../src/curriculum.js';
import { projectSteps } from '../src/project-steps.js';

const pratica = practiceProjects[0];
const treinado = { answered: pratica.investigate.answer, passed: ['modify', 'create'] };
const estadoComEntrega = (trabalho) => ({
  ...initialState(),
  faculdade: { feitas: [], codigos: {}, entregas: { 'entrega-u1': trabalho } },
});

// Estudar no celular e no computador criava duas jornadas, e importar substituía uma pela
// outra. A regra desta junção é uma só: nada conquistado pode se perder.
test('lessons finished on either device all survive the merge', () => {
  const computador = { ...initialState(), completed: ['ola', 'variaveis'] };
  const celular = { ...initialState(), completed: ['ola', 'tipos'] };
  const junto = mergeProgress(computador, celular);
  assert.deepEqual(junto.completed.sort(), ['ola', 'tipos', 'variaveis']);
  assert.equal(xpTotal(junto), 300, 'as três aulas contam, sem duplicar a repetida');
});

test('trabalho da faculdade mescla passos e preserva o maior texto de cada campo', () => {
  const computador = estadoComEntrega({
    codigo: 'print(1)',
    passosConcluidos: ['u1-entender-lista'],
    testes: 'Teste inicial curto.',
  });
  const celular = estadoComEntrega({
    codigo: 'notas = [7, 8, 9]\nprint(sum(notas) / len(notas))',
    passosConcluidos: ['u1-construir-cadastro'],
    conclusao: 'A média resume o desempenho da turma.',
  });
  const unido = mergeProgress(computador, celular).faculdade.entregas['entrega-u1'];
  assert.deepEqual(unido.passosConcluidos.sort(), ['u1-construir-cadastro', 'u1-entender-lista']);
  assert.match(unido.codigo, /sum/);
  assert.match(unido.conclusao, /desempenho/);
  assert.match(unido.testes, /inicial/);
});
test('a miniproject trained on the phone counts on the computer too', () => {
  const computador = { ...initialState() };
  const celular = { ...initialState(), learning: { [pratica.id]: treinado } };
  const junto = mergeProgress(computador, celular);
  assert.deepEqual(junto.learning[pratica.id].passed.sort(), ['create', 'modify']);
  assert.equal(junto.learning[pratica.id].answered, pratica.investigate.answer);
  assert.equal(xpTotal(junto), 40);
});
test('two halves of the same miniproject add up instead of overwriting', () => {
  const computador = { ...initialState(), learning: { [pratica.id]: { passed: ['modify'], prediction: 'acho que mostra o nome' } } };
  const celular = { ...initialState(), learning: { [pratica.id]: { passed: ['create'], answered: pratica.investigate.answer, notes: 'essa linha guarda o valor' } } };
  const junto = mergeProgress(computador, celular);
  assert.deepEqual(junto.learning[pratica.id].passed.sort(), ['create', 'modify']);
  assert.equal(junto.learning[pratica.id].prediction, 'acho que mostra o nome', 'o texto escrito de um lado não some');
  assert.equal(junto.learning[pratica.id].notes, 'essa linha guarda o valor', 'nem o do outro');
  assert.equal(xpTotal(junto), 40, 'juntas, as metades concluem o miniprojeto');
});
test('bridges, project steps and self-assessment all merge by union', () => {
  const ponte = functionBridges[0].id;
  const projeto = projects[0].id;
  const passos = projectSteps[projeto].map(step => step.id);
  const computador = { ...initialState(),
    functionBridges: { [ponte]: { passed: true, quizCorrect: false } },
    projectStepsDone: { [projeto]: passos.slice(0, 3) },
    projectChecks: { [projeto]: [0, 1] } };
  const celular = { ...initialState(),
    // quizCorrect só sobrevive acompanhado da resposta certa: é a trava contra backup forjado.
    functionBridges: { [ponte]: { passed: false, quizCorrect: true, answered: functionBridges[0].answer } },
    projectStepsDone: { [projeto]: passos.slice(3) },
    projectChecks: { [projeto]: [2, 3, 4] } };
  const junto = mergeProgress(computador, celular);
  assert.equal(junto.functionBridges[ponte].passed, true);
  assert.equal(junto.functionBridges[ponte].quizCorrect, true, 'as duas metades fecham a ponte');
  assert.equal(junto.projectStepsDone[projeto].length, passos.length);
  assert.equal(doneProjects(junto).length, 1, 'os requisitos marcados dos dois lados concluem o projeto');
});
test('between two grades for the same project, the higher one stays', () => {
  const projeto = projects[0].id;
  const nota = valor => ({ nota: valor, aprovado: valor >= 7, resumo: 'ok', requisitos: [], fortes: [], melhorar: [], avaliadoEm: localDate() });
  const alto = mergeProgress({ ...initialState(), projectGrades: { [projeto]: nota(9) } }, { ...initialState(), projectGrades: { [projeto]: nota(6) } });
  assert.equal(alto.projectGrades[projeto].nota, 9);
  const baixo = mergeProgress({ ...initialState(), projectGrades: { [projeto]: nota(6) } }, { ...initialState(), projectGrades: { [projeto]: nota(9) } });
  assert.equal(baixo.projectGrades[projeto].nota, 9, 'a maior nota vale, venha de onde vier');
});
test('the study calendar keeps every day either device recorded', () => {
  const computador = { ...initialState(), joined: '2026-09-01', activities: { '2026-09-01': ['ola'], '2026-09-02': ['variaveis'] } };
  const celular = { ...initialState(), joined: '2026-09-03', activities: { '2026-09-02': ['tipos'], '2026-09-03': ['operadores'] } };
  const junto = mergeProgress(computador, celular);
  assert.deepEqual(Object.keys(junto.activities).sort(), ['2026-09-01', '2026-09-02', '2026-09-03']);
  assert.deepEqual(junto.activities['2026-09-02'].sort(), ['tipos', 'variaveis'], 'o mesmo dia soma as duas atividades');
  assert.equal(junto.joined, '2026-09-01', 'a data de início é a mais antiga');
});
test('the diary joins without duplicating and keeps the profile of this device', () => {
  const entrada = (id, dia) => ({ id, startedAt: `${dia}T10:00:00.000Z`, status: 'success', source: 'lesson', lessonId: 'ola', title: 'Olá', code: 'print(1)', stdin: '', output: '1', matched: true, durationMs: 10, reflection: '' });
  const computador = { ...initialState(), name: 'João', avatar: '🐍', history: [entrada('a', '2026-09-01'), entrada('b', '2026-09-02')] };
  const celular = { ...initialState(), name: 'Outro', avatar: '🦊', history: [entrada('b', '2026-09-02'), entrada('c', '2026-09-03')] };
  const junto = mergeProgress(computador, celular);
  assert.deepEqual(junto.history.map(item => item.id).sort(), ['a', 'b', 'c']);
  assert.equal(junto.name, 'João', 'o perfil deste aparelho manda');
  assert.equal(junto.avatar, '🐍');
});
test('the merge reports what was actually gained, and when nothing was', () => {
  const computador = { ...initialState(), completed: ['ola'] };
  const celular = { ...initialState(), completed: ['ola', 'variaveis'], learning: { [pratica.id]: treinado } };
  const ganhos = ganhosDaJuncao(computador, mergeProgress(computador, celular));
  assert.equal(ganhos.aulas, 1);
  assert.equal(ganhos.miniprojetos, 1);
  assert.equal(ganhos.xp, 140);
  assert.equal(ganhos.mudou, true);
  // Juntar com um backup mais antigo não tira nada e avisa que não havia novidade.
  const semNovidade = ganhosDaJuncao(celular, mergeProgress(celular, computador));
  assert.equal(semNovidade.mudou, false);
  assert.equal(semNovidade.aulas, 0);
});
test('merging never lowers XP, whichever side is older', () => {
  const cheio = { ...initialState(), completed: ['ola', 'variaveis', 'tipos'], learning: { [pratica.id]: treinado } };
  const vazio = initialState();
  assert.equal(xpTotal(mergeProgress(cheio, vazio)), xpTotal(cheio));
  assert.equal(xpTotal(mergeProgress(vazio, cheio)), xpTotal(cheio));
});
