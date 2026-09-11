import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/curriculum.js';
import { practiceProjects } from '../src/practice-content.js';
import { simpleExplanations, beginnerNotes } from '../src/simple-explanations.js';

// O estudante relatou ter encontrado sum() em um exemplo sem que a aula tivesse explicado,
// e precisou perguntar fora da plataforma. A explicação existia, mas só atrás de uma aba do
// passo comentado e da explicação recolhida. A regra aqui é sobre o texto que aparece sem clique.
const KEYWORDS = new Set(['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'return', 'and', 'or', 'not', 'in', 'is', 'with', 'as', 'try', 'except', 'finally', 'raise', 'import', 'from', 'yield', 'await', 'async', 'lambda', 'pass', 'self', 'print']);

const strip = code => code
  .replace(/'''[\s\S]*?'''/g, " '' ")
  .replace(/"""[\s\S]*?"""/g, " '' ")
  .replace(/'[^'\n]*'/g, " '' ")
  .replace(/"[^"\n]*"/g, " '' ")
  .replace(/#[^\n]*/g, ' ');

// Toda chamada de função ou método do código, menos o que o próprio código define.
const callables = raw => {
  const code = strip(raw);
  const defined = new Set([...code.matchAll(/\b(?:def|class)\s+(\w+)/g)].map(m => m[1]));
  const found = new Set();
  for (const match of code.matchAll(/(?:(\w+)\s*\.\s*)?\b([A-Za-z_]\w*)\s*\(/g)) {
    const [, owner, name] = match;
    if (KEYWORDS.has(name) || defined.has(name)) continue;
    found.add(owner && !defined.has(owner) ? `${owner}.${name}` : name);
  }
  return [...found];
};
const visibleText = id => [...(simpleExplanations[id] || []), ...(beginnerNotes[id] || []).flat()].join(' ');
const taughtUpTo = index => lessons.slice(0, index + 1).map(l => visibleText(l.id)).join(' ');

test('every function in a lesson example is explained in text the student sees without clicking', () => {
  const gaps = [];
  for (const [index, lesson] of lessons.entries()) {
    const taught = taughtUpTo(index);
    for (const name of callables(`${lesson.example}\n${lesson.starter}`)) {
      const bare = name.includes('.') ? name.split('.')[1] : name;
      if (!taught.includes(bare)) gaps.push(`${lesson.id}: ${name}`);
    }
  }
  assert.deepEqual(gaps, [], `funções usadas sem explicação visível:\n${gaps.join('\n')}`);
});
test('every function in a miniproject example was explained by its support lesson or earlier', () => {
  const gaps = [];
  for (const project of practiceProjects) {
    const index = lessons.findIndex(l => l.id === project.prerequisite);
    const taught = `${taughtUpTo(index)} ${project.hint} ${project.investigate.why}`;
    for (const name of callables(project.example)) {
      const bare = name.includes('.') ? name.split('.')[1] : name;
      if (!taught.includes(bare)) gaps.push(`${project.id} (apoio: ${project.prerequisite}): ${name}`);
    }
  }
  assert.deepEqual(gaps, [], `oficina usando função não explicada:\n${gaps.join('\n')}`);
});
// O estudante perguntou por que a revisão de compreensões cobrava o if, que o exemplo não usava.
const QUESTION_TOKENS = ['if', 'elif', 'else', 'for', 'while', 'def', 'return', 'class', 'self', 'yield', 'await', 'async', 'try', 'except', 'finally', 'raise', 'import', 'lambda', 'break', 'continue', 'pass', 'and', 'or', 'not',
  'print', 'input', 'int', 'float', 'str', 'bool', 'sum', 'len', 'append', 'range', 'set', 'sorted', 'type', 'isinstance', 'open', 'all', 'None', 'True', 'False',
  '%', '//', '**', '==', '!=', '__init__', 'property', 'dataclass', 'SELECT', 'INSERT', 'WHERE', 'JOIN', 'rollback', 'commit'];
const tokensIn = text => QUESTION_TOKENS.filter(token => /^\w+$/.test(token) ? new RegExp(`\\b${token}\\b`).test(text) : text.includes(token));

test('a review question never asks about something the lesson did not show', () => {
  const gaps = [];
  for (const lesson of lessons) {
    const shown = tokensIn(`${lesson.example} ${lesson.starter} ${lesson.expected} ${visibleText(lesson.id)}`);
    for (const token of tokensIn(`${lesson.question} ${lesson.options[lesson.answer]}`)) {
      if (!shown.includes(token)) gaps.push(`${lesson.id}: cobra "${token}" sem mostrar — ${lesson.question}`);
    }
  }
  assert.deepEqual(gaps, [], `revisões cobrando o que não foi mostrado:\n${gaps.join('\n')}`);
});
test('the lists lesson explains sum, len and append where the student cannot miss it', () => {
  const visible = visibleText('listas');
  for (const term of ['sum', 'len', 'append']) assert.ok(visible.includes(term), `listas: ${term} fora do texto visível`);
  assert.ok(/soma/i.test(visible) && /60/.test(visible), 'sum precisa dizer o que faz, com um resultado concreto');
});
test('the visible glossary stays short enough to read', () => {
  for (const [id, notes] of Object.entries(beginnerNotes)) {
    assert.ok(lessons.some(l => l.id === id), `glossário de aula inexistente: ${id}`);
    assert.ok(notes.length <= 6, `${id}: ${notes.length} termos é muita coisa de uma vez`);
    for (const [term, meaning] of notes) {
      assert.ok(term.length > 0 && term.length <= 60, `${id}/${term}`);
      assert.ok(meaning.length > 25 && meaning.length <= 220, `${id}/${term}: explicação de ${meaning.length} caracteres`);
    }
  }
});
