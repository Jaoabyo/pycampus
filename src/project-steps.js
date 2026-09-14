import { projects } from './curriculum.js';
import { calculatorCoaching, coachedProjects } from './project-coaching.js';

// A construção começa com exemplos comentados e retira o apoio gradualmente.
const step = (id, title, instruction, expected, stdin = '') => ({ id, title, instruction, expected, stdin });

export const projectSteps = {
  ...coachedProjects,
  calculadora: [
    step('valores', 'Guarde os valores', 'Crie a variável renda com 3000.0 e três variáveis de despesa com 1200.0, 450.0 e 300.0. Mostre apenas a renda.', '3000.0'),
    step('total', 'Some as despesas', 'Some as três despesas em uma variável chamada total_despesas. Mostre apenas o total.', '1950.0'),
    step('saldo', 'Calcule o saldo', 'Calcule saldo = renda - total_despesas e mostre o saldo com duas casas decimais.', '1050.00'),
    step('pergunta', 'Faça uma pergunta', 'Treine uma única pergunta: Quanto é sua despesa? Responda 1200 e mostre o texto recebido.', '1200', '1200'),
    step('conversao', 'Transforme a resposta', 'Leia a despesa e transforme a resposta em número na linha seguinte. Responda 1200.', '1200.0', '1200'),
    step('entrada', 'Leia os valores digitados', 'Troque os quatro valores fixos por leituras de input() convertidas com float(). A ordem lida é: renda, primeira despesa, segunda despesa, terceira despesa. A saída continua sendo o saldo com duas casas.', '1050.00', '3000\n1200\n450\n300'),
    step('relatorio', 'Monte o relatório final', 'Mantendo a leitura da entrada, mostre três linhas nesta ordem e neste formato, todas com duas casas decimais.', 'Renda: 3000.00\nDespesas: 1950.00\nSaldo: 1050.00', '3000\n1200\n450\n300')
  ]
};
projectSteps.calculadora.forEach(item => {
  const [task, question, hints] = calculatorCoaching[item.id];
  Object.assign(item, { instruction: task, why: task, question, hints, mode: 'browser', check: 'Compare a saída com o caso proposto. Depois mude um valor e confira se a resposta acompanha essa mudança.' });
});

export const stepsFor = id => projectSteps[id] || [];
export const projectFileName = { calculadora: 'orcamento.py', quiz: 'quiz.py', tarefas: 'tarefas.py', banco: 'banco.py', estoque: 'estoque.py', api: 'api.py', 'qualidade-projeto': 'qualidade.py', final: 'projeto_final.py' };
export const fileNameFor = id => projectFileName[id] || `${id}.py`;
export const buildDone = (state, id) => {
  const steps = stepsFor(id);
  return steps.length > 0 && steps.every(s => state.projectStepsDone?.[id]?.includes(s.id));
};

// Só aceita o endereço de um repositório do GitHub, que é o que a conferência sabe consultar.
const REPO = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/;
export function parseRepo(url) {
  const match = REPO.exec((url || '').trim());
  if (!match) return null;
  const [, owner, repo] = match;
  if (repo === '.' || repo === '..') return null;
  return { owner, repo };
}

export function normalizeProjectWork(input, base) {
  base.projectNotes = {}; base.projectReadmes = {}; base.projectPositions = {};
  for (const project of projects) {
    const code = input.projectCodes?.[project.id];
    if (typeof code === 'string') base.projectCodes[project.id] = code.slice(0, 50000);
    const done = input.projectStepsDone?.[project.id];
    const ids = new Set(stepsFor(project.id).map(s => s.id));
    if (Array.isArray(done)) base.projectStepsDone[project.id] = [...new Set(done.filter(id => ids.has(id)))];
    if (ids.has(input.projectPositions?.[project.id])) base.projectPositions[project.id] = input.projectPositions[project.id];
    const notes = input.projectNotes?.[project.id];
    base.projectNotes[project.id] = {};
    for (const id of ids) if (typeof notes?.[id]?.answer === 'string') base.projectNotes[project.id][id] = { answer: notes[id].answer.slice(0, 2000) };
    const doc = input.projectReadmes?.[project.id];
    base.projectReadmes[project.id] = {};
    for (const key of ['purpose', 'usage', 'example', 'tests', 'limits']) if (typeof doc?.[key] === 'string') base.projectReadmes[project.id][key] = doc[key].slice(0, 3000);
  }
  return base;
}
