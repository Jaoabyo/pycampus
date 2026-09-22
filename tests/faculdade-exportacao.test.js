import test from 'node:test';
import assert from 'node:assert/strict';
import { entregaDaFaculdade } from '../src/faculdade-entregas.js';
import {
  criarNotebookColab,
  criarRelatorioHtml,
  nomeDoArquivoDaEntrega,
} from '../src/faculdade-exportacao.js';

const trabalhoCompletoU1 = {
  codigo: [
    'notas = [6, 7, 8, 9]',
    'def calcular_media(notas):',
    '    return sum(notas) / len(notas)',
    'media = calcular_media(notas)',
    'situacao = "Aprovado" if media >= 7 else "Reprovado"',
    'print("Media:", media, "Situacao:", situacao)',
  ].join('\n'),
  passosConcluidos: entregaDaFaculdade('entrega-u1').passos.map(({ id }) => id),
  saida: 'Media: 7.5 Situacao: Aprovado',
  logica: 'As notas entram em uma lista, a função calcula a média e a comparação com sete decide a situação final.',
  testes: 'Testei médias 6, 7 e 8 para conferir reprovação, limite inclusivo e aprovação.',
  conclusao: 'A função separa o cálculo da apresentação e os casos de limite confirmam a regra.',
};

const trabalhoCompletoU4 = {
  codigo: [
    'import tensorflow as tf',
    'from sklearn.datasets import load_iris',
    'from sklearn.model_selection import train_test_split',
    'from sklearn.preprocessing import StandardScaler',
    'iris = load_iris()',
    'X_treino, X_teste, y_treino, y_teste = train_test_split(iris.data, iris.target, stratify=iris.target, random_state=42)',
    'scaler = StandardScaler()',
    'X_treino = scaler.fit_transform(X_treino)',
    'X_teste = scaler.transform(X_teste)',
    'model = tf.keras.Sequential([tf.keras.layers.Input(shape=(4,)), tf.keras.layers.Dense(3, activation="softmax")])',
    'model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])',
    'model.fit(X_treino, y_treino, epochs=40, verbose=0)',
    'perda, acuracia = model.evaluate(X_teste, y_teste, verbose=0)',
    'probabilidades = model.predict(X_teste[:3], verbose=0)',
    'previsoes = probabilidades.argmax(axis=1)',
  ].join('\n'),
  passosConcluidos: entregaDaFaculdade('entrega-u4').passos.map(({ id }) => id),
  saidaExterna: 'Acurácia no teste: 0.9667',
  executadaNoColabEm: '2026-09-24',
  logica: 'Separei treino e teste, ajustei a escala apenas no treino e avaliei a rede em dados que ela não usou para aprender.',
  testes: 'Conferi formas dos conjuntos, transformação do teste, avaliação e três predições.',
  conclusao: 'A acurácia observada foi alta neste conjunto, mas uma base pequena não representa toda flor possível.',
};

test('gera nbformat 4 com identificação, explicação e código salvo', () => {
  const bruto = criarNotebookColab({
    entrega: entregaDaFaculdade('entrega-u1'),
    trabalho: trabalhoCompletoU1,
    estudante: { nome: 'João' },
  });
  const notebook = JSON.parse(bruto);
  assert.equal(notebook.nbformat, 4);
  assert.ok(notebook.cells.some((cell) => cell.cell_type === 'code'
    && cell.source.join('').includes('notas')));
  assert.ok(notebook.cells.some((cell) => cell.cell_type === 'markdown'
    && cell.source.join('').includes('João')));
  assert.ok(notebook.cells.some((cell) => cell.cell_type === 'markdown'
    && cell.source.join('').includes('casos de limite')));
});

test('notebook U4 contém bibliotecas e sequência oficiais', () => {
  const texto = criarNotebookColab({
    entrega: entregaDaFaculdade('entrega-u4'),
    trabalho: trabalhoCompletoU4,
    estudante: { nome: 'Estudante' },
  });
  for (const trecho of ['tensorflow', 'load_iris', 'train_test_split', 'StandardScaler', 'model.evaluate']) {
    assert.ok(texto.includes(trecho), trecho);
  }
  const notebook = JSON.parse(texto);
  const celulasCodigo = notebook.cells.filter(({ cell_type }) => cell_type === 'code');
  assert.ok(celulasCodigo.length >= 4, 'o notebook deve separar preparação, dados, treino e avaliação');
  assert.equal(celulasCodigo.map((cell) => cell.source.join('')).join('\n'), trabalhoCompletoU4.codigo);
  const posicoes = ['load_iris', 'train_test_split', 'model.fit', 'model.evaluate'].map((trecho) => (
    celulasCodigo.findIndex((cell) => cell.source.join('').includes(trecho))
  ));
  assert.deepEqual(posicoes, [...posicoes].sort((a, b) => a - b));
  assert.ok(posicoes.every((indice) => indice >= 0));
});

test('relatório exibe texto como conteúdo e nunca como marcação executável', () => {
  const html = criarRelatorioHtml({
    entrega: entregaDaFaculdade('entrega-u1'),
    trabalho: { ...trabalhoCompletoU1, conclusao: '<script>alert(1)</script>' },
    estudante: { nome: '<img src=x onerror=alert(2)>' },
  });
  assert.doesNotMatch(html, /<script>|<img src=x/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /window\.print/);
});

test('exportação ignora campos desconhecidos, segredos e valores ausentes', () => {
  const entrega = entregaDaFaculdade('entrega-u1');
  const contaminado = {
    ...trabalhoCompletoU1,
    OPENAI_API_KEY: 'segredo-que-nao-pode-sair',
    campoInventado: process.env.PATH,
    insights: undefined,
  };
  const notebook = criarNotebookColab({ entrega, trabalho: contaminado, estudante: {} });
  const relatorio = criarRelatorioHtml({ entrega, trabalho: contaminado, estudante: {} });
  for (const saida of [notebook, relatorio]) {
    assert.doesNotMatch(saida, /segredo-que-nao-pode-sair/);
    assert.doesNotMatch(saida, /campoInventado|undefined/);
  }
});

test('resultado externo é rotulado como informação observada no Colab', () => {
  const html = criarRelatorioHtml({
    entrega: entregaDaFaculdade('entrega-u4'),
    trabalho: trabalhoCompletoU4,
    estudante: { nome: 'João' },
  });
  assert.match(html, /Resultado informado após execução no Colab/);
  assert.match(html, /Acurácia no teste: 0\.9667/);
  assert.match(html, /24\/09\/2026/);
});

test('nome do arquivo usa extensão permitida e slug previsível', () => {
  const entrega = entregaDaFaculdade('entrega-u4');
  assert.equal(
    nomeDoArquivoDaEntrega(entrega, 'ipynb'),
    'entrega-u4-classificacao-de-flores-iris.ipynb',
  );
  assert.throws(() => nomeDoArquivoDaEntrega(entrega, 'exe'), /extensão/i);
});
