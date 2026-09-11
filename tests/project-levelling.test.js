import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, projects } from '../src/curriculum.js';
import { projectSteps } from '../src/project-steps.js';
import { simpleExplanations, beginnerNotes } from '../src/simple-explanations.js';

// tests/visible-glossary.test.js já protege aulas e miniprojetos, mas parava antes dos passos
// de projeto — e foi exatamente aí que uma auditoria achou 21 saltos de dificuldade. Um passo
// de projeto pode ser difícil; o que ele não pode é exigir uma sintaxe que nunca apareceu.
const KEYWORDS = new Set(['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'return', 'and', 'or', 'not', 'in', 'is', 'with', 'as', 'try', 'except', 'finally', 'raise', 'import', 'from', 'yield', 'await', 'async', 'lambda', 'pass', 'self', 'print']);

const callables = raw => {
  const code = raw.replace(/#[^\n]*/g, ' ');
  const defined = new Set([...code.matchAll(/\b(?:def|class)\s+(\w+)/g)].map(match => match[1]));
  const found = new Set();
  for (const match of code.matchAll(/(?:(\w+)\s*\.\s*)?\b([A-Za-z_]\w*)\s*\(/g)) {
    const name = match[2];
    if (!KEYWORDS.has(name) && !defined.has(name)) found.add(name);
  }
  return [...found];
};

// Este teste cobre chamadas de função, que dão para reconhecer com precisão. Saltos de
// estrutura — "lista de dicionários aparece pela primeira vez já sendo exigida" — são juízo
// pedagógico: toda regex que tentei confundia exigir com ensinar. Esses ficam registrados em
// VERIFICACAO.md e na lista de dívida abaixo, revisados a olho, e não fingidos aqui.
const visibleText = id => [...(simpleExplanations[id] || []), ...(beginnerNotes[id] || []).flat()].join(' ');
// project.module conta de zero e lesson.moduleNumber é texto com zero à esquerda ('03'):
// vale tudo que foi ensinado até o fim do módulo do projeto.
const taughtForProject = project => lessons
  .filter(lesson => Number(lesson.moduleNumber) <= project.module + 1)
  .map(lesson => `${visibleText(lesson.id)} ${lesson.example} ${lesson.starter} ${lesson.challenge}`)
  .join('\n');

// A dívida de nivelamento da auditoria de 2026-09-11 foi paga: os oito projetos passam pela
// regra e a lista está vazia de propósito. Se um passo novo exigir algo nunca ensinado, o
// caminho é criar o degrau que falta — não voltar a encher esta lista.
const DEBT = new Set([]);

// Nomes que o próprio passo manda o estudante criar. Não são sintaxe a aprender, são o
// exercício em si — por isso não contam como salto.
const INVENTED = new Set(['perguntar', 'ler_cor', 'funcao', 'minha_funcao']);

// Um projeto batiza as próprias funções: "crie o método pode_sacar" inventa um nome que não
// existe em aula nenhuma, e usá-lo no passo seguinte é reaproveitar, não saltar.
const batizados = text => [...text.matchAll(/(?:\bdef\s+|m[ée]todo\s+|fun[çc][ãa]o\s+)([a-z_][a-z0-9_]*)/gi)].map(match => match[1]);

// Os nomes que o projeto cria vêm sempre em português com sublinhado — criar_habito,
// pode_sacar, preco_final. O vocabulário de Python que precisa ser ensinado não tem essa
// forma: print, len, append, fetchall, commit. Os dunder, como __init__, são de Python e
// continuam sendo cobrados.
const nomeDoProjeto = name => /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/.test(name);

function gapsFor(project) {
  // Um projeto também ensina: o passo 4 pode se apoiar no que o passo 3 introduziu com sua
  // dica. O que nunca vale é o primeiro encontro com uma sintaxe ser a hora de usá-la sozinho.
  let taught = taughtForProject(project);
  const proprios = new Set();
  const gaps = [];
  for (const step of projectSteps[project.id]) {
    const text = `${step.instruction} ${step.hints.join(' ')} ${step.check}`;
    for (const nome of batizados(text)) proprios.add(nome);
    for (const name of callables(text)) {
      if (INVENTED.has(name) || proprios.has(name) || nomeDoProjeto(name)) continue;
      if (!new RegExp(`\\b${name}\\b`).test(taught)) gaps.push(`${project.id}/${step.id}: ${name}()`);
    }
    taught += `\n${text}`;
  }
  return gaps;
}

test('no project step demands syntax the student was never shown', () => {
  const gaps = [];
  for (const project of projects) {
    if (projectSteps[project.id].every(step => DEBT.has(`${project.id}/${step.id}`))) continue;
    gaps.push(...gapsFor(project).filter(gap => !DEBT.has(gap.split(':')[0])));
  }
  assert.deepEqual(gaps, [], `passos de projeto pedindo o que nunca foi ensinado:\n${gaps.join('\n')}`);
});

test('the inherited debt list only shrinks, and never covers a project already levelled', () => {
  for (const id of DEBT) {
    const [projectId, stepId] = id.split('/');
    assert.ok(projectSteps[projectId], `dívida aponta para projeto inexistente: ${id}`);
    assert.ok(projectSteps[projectId].some(step => step.id === stepId), `dívida aponta para passo inexistente: ${id}`);
  }
  for (const project of ['calculadora', 'quiz', 'tarefas', 'banco', 'estoque', 'api', 'qualidade-projeto', 'final']) {
    assert.ok(![...DEBT].some(id => id.startsWith(`${project}/`)), `${project} já foi nivelado e não pode voltar para a dívida`);
  }
});
