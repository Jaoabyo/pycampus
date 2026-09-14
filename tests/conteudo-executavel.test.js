import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceProjects } from '../src/practice-content.js';
import { readError, andaimeIntacto } from '../src/error-guide.js';

// Dois enganos encontrados executando todo o conteúdo no Pyodide de verdade: um miniprojeto
// cuja resposta guardada não rodava, e dois onde a etapa Criar esperava a mesma saída de uma
// etapa anterior — ou seja, dava para passar sem escrever nada.

test('a etapa Criar nunca espera a saída que o estudante já tem na tela', () => {
  for (const p of practiceProjects) {
    assert.notEqual(String(p.expected).trim(), String(p.output).trim(), p.id + ': Criar espera a mesma saída do exemplo');
    assert.notEqual(String(p.expected).trim(), String(p.modified).trim(), p.id + ': Criar espera a mesma saída de Modificar');
  }
});

test('toda solução guardada é um programa completo, sem depender de código de outra etapa', () => {
  for (const p of practiceProjects) {
    const definidos = new Set();
    for (const linha of String(p.solution).split(String.fromCharCode(10))) {
      const classe = linha.match(new RegExp('^class ([A-Za-z_][A-Za-z0-9_]*)'));
      if (classe) definidos.add(classe[1]);
      const funcao = linha.match(new RegExp('^def ([A-Za-z_][A-Za-z0-9_]*)'));
      if (funcao) definidos.add(funcao[1]);
    }
    for (const linha of String(p.solution).split(String.fromCharCode(10))) {
      const uso = linha.match(new RegExp('([A-Z][A-Za-z0-9_]*)' + String.fromCharCode(92) + '('));
      if (uso) assert.ok(definidos.has(uso[1]), p.id + ': a solução usa ' + uso[1] + ' sem definir');
    }
  }
});

test('erro num esqueleto ainda com pass explica que falta escrever o corpo', () => {
  const codigo = ['def criar_tarefa(titulo):', '    pass', '', 'print(criar_tarefa("x")["concluida"])'].join(String.fromCharCode(10));
  assert.equal(andaimeIntacto(codigo), true);
  const lido = readError('TypeError: NoneType object is not subscriptable', codigo);
  assert.match(lido.title, new RegExp('corpo ainda está vazio'));
});

test('codigo sem esqueleto continua recebendo a explicação normal do tipo de erro', () => {
  const lido = readError('TypeError: unsupported operand type(s)', 'print(1 + "a")');
  assert.match(lido.title, new RegExp('Tipos incompat'));
});
