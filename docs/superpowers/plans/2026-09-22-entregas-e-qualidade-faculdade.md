# Entregas práticas e qualidade de ensino da faculdade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar os quatro trabalhos oficiais de Linguagem de Programação em estúdios guiados, exportáveis para Google Colab e relatório, e garantir que as 16 aulas ensinem e pratiquem cada conceito antes de cobrá-lo.

**Architecture:** Um módulo de domínio puro define entregas, passos pequenos, fases, requisitos e normalização; outro módulo puro gera notebook e relatório. A interface `FaculdadeEntrega` só coordena esse domínio com o executor Python e o estado já persistido pela aplicação. As aulas existentes continuam com os mesmos IDs e quantidade, preservando o progresso 6/16, enquanto busca, painel, projetos e calendário passam a apontar para os novos estúdios.

**Tech Stack:** React 19, JavaScript ES modules, Vite, Pyodide, Node test runner, Playwright, CSS nativo.

**Spec:** `docs/superpowers/specs/2026-09-22-entregas-e-qualidade-faculdade-design.md`

## Global Constraints

- Preservar os 16 IDs de aula e os 4 IDs de miniprojeto existentes; um backup com 6/16 deve continuar em 6/16.
- Tratar 27/09/2026 como prazo fixo: priorizar primeiro o fluxo estudável e exportável das quatro entregas, depois integrações e refinamentos que não bloqueiam o envio.
- Não adicionar dependência para `.docx`: gerar `.ipynb` e HTML imprimível, com orientação para salvar como PDF de até 10 MB.
- Não simular TensorFlow ou scikit-learn no navegador. A U4 usa uma prática executável de preparação/predição no PyCampus e o notebook oficial precisa ser executado no Google Colab.
- Todo conceito obrigatório deve aparecer na ordem: explicar → mostrar rodando → estudante alterar → estudante aplicar.
- Nunca marcar uma execução externa como realizada sem registro explícito do estudante e uma saída escrita.
- Todo texto vindo de backup ou digitado pelo estudante deve ser limitado e escapado antes de entrar no relatório HTML.
- Usar somente ícones Lucide; manter responsividade, foco visível, contraste e alvos de toque de pelo menos 44 px.

## Review Focus

1. Backups antigos ou adulterados não podem injetar campos, textos gigantes, IDs inexistentes ou conclusão falsa nas entregas.
2. Código, nome, conclusões e resultados do estudante não podem executar HTML ou JavaScript no relatório exportado.
3. A U4 não pode aparecer como executada no PyCampus nem como pronta sem a saída real registrada após execução no Colab.
4. Reexecutar a U3 não pode duplicar vendas no SQLite e alterar silenciosamente as análises.
5. A mudança não pode reduzir 16 aulas, trocar IDs, perder o progresso 6/16 ou criar itens que a busca encontre mas não consiga abrir diretamente.

---

## Task 1: Criar o domínio das quatro entregas oficiais

**Files:**
- Create: `src/faculdade-entregas.js`
- Create: `tests/faculdade-entregas.test.js`
- Reference: `src/faculdade-projetos.js`
- Reference: `docs/superpowers/specs/2026-09-22-entregas-e-qualidade-faculdade-design.md`

- [ ] **Step 1: Escrever testes falhando para catálogo, ordem e contratos**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  entregasDaFaculdade,
  entregaDaFaculdade,
  requisitosFaltandoDaEntrega,
} from '../src/faculdade-entregas.js';

test('expõe as quatro entregas oficiais na ordem das unidades', () => {
  assert.deepEqual(
    entregasDaFaculdade.map(({ id }) => id),
    ['entrega-u1', 'entrega-u2', 'entrega-u3', 'entrega-u4'],
  );
  assert.equal(entregaDaFaculdade('entrega-u4').ambienteEntrega, 'colab');
});

test('cada entrega conduz de entendimento até exportação', () => {
  for (const entrega of entregasDaFaculdade) {
    assert.deepEqual(
      [...new Set(entrega.passos.map(({ fase }) => fase))],
      ['entender', 'construir', 'testar', 'explicar', 'exportar'],
    );
    assert.ok(entrega.preRequisitos.length > 0);
    assert.ok(entrega.criterios.length > 0);
  }
});

test('requisitos são derivados do trabalho, não de um campo pronto adulterável', () => {
  const entrega = entregaDaFaculdade('entrega-u1');
  const faltando = requisitosFaltandoDaEntrega(entrega, {
    codigo: 'print("Media: 7.0")',
    passosConcluidos: entrega.passos.map(({ id }) => id),
    pronta: true,
  });
  assert.ok(faltando.some((item) => item.id === 'lista-de-notas'));
});
```

- [ ] **Step 2: Rodar o teste e confirmar a falha pela ausência do módulo**

Run: `node --test tests/faculdade-entregas.test.js`

Expected: FAIL com `ERR_MODULE_NOT_FOUND` para `src/faculdade-entregas.js`.

- [ ] **Step 3: Implementar o catálogo e seletores puros**

Exportar exatamente:

```js
export const entregasDaFaculdade = [/* quatro objetos completos */];
export const idsDasEntregasDaFaculdade = entregasDaFaculdade.map(({ id }) => id);
export const entregaDaFaculdade = (id) =>
  entregasDaFaculdade.find((entrega) => entrega.id === id) || null;
export function requisitosFaltandoDaEntrega(entrega, trabalho = {}) { /* deriva critérios */ }
export const entregaProntaParaExportar = (entrega, trabalho) =>
  requisitosFaltandoDaEntrega(entrega, trabalho).length === 0;
```

Cada objeto deve conter `id`, `unidade`, `titulo`, `resumo`, `prazo`, `ambienteEntrega`, `preRequisitos`, `passos`, `criterios`, `codigoInicial`, `testesOrientados` e `entregaveis`. Cada passo possui `id`, uma `fase` entre as cinco fases visuais, explicação, exemplo e evidência; uma fase pode conter vários passos pequenos. Os critérios devem usar verificadores puros de estrutura e evidência, nunca uma propriedade booleana `pronta` recebida do estado.

- [ ] **Step 4: Cobrir conteúdo oficial mínimo das quatro unidades**

Adicionar asserções de que U1 exige lista/média/limite 7/relatório, U2 exige `Livro`/cadastro/busca/gráfico por gênero, U3 exige SQLite/pandas/Matplotlib/análises e U4 exige Iris/divisão/normalização/TensorFlow/avaliação/predição.

- [ ] **Step 5: Rodar os testes do domínio**

Run: `node --test tests/faculdade-entregas.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/faculdade-entregas.js tests/faculdade-entregas.test.js
git commit -m "feat: modelar entregas práticas da faculdade"
```

## Task 2: Persistir e mesclar trabalho sem perder progresso

**Files:**
- Modify: `src/faculdade-entregas.js`
- Modify: `src/progress.js`
- Modify: `src/merge-progress.js`
- Modify: `tests/faculdade-entregas.test.js`
- Modify: `tests/progress.test.js`
- Modify: `tests/merge-progress.test.js`

- [ ] **Step 1: Escrever testes falhando para normalização e backup antigo**

```js
test('backup antigo mantém as seis aulas e ganha entregas vazias', () => {
  const antigo = { ...initialState(), faculdade: {
    feitas: aulasDaFaculdade.slice(0, 6).map(({ id }) => id), codigos: {},
  } };
  const restaurado = normalizeState(antigo);
  assert.equal(restaurado.faculdade.feitas.length, 6);
  assert.deepEqual(restaurado.faculdade.entregas, {});
});

test('normaliza somente entregas, etapas, datas e textos permitidos', () => {
  const entrada = { ...initialState(), faculdade: { feitas: [], codigos: {}, entregas: {
    'entrega-u1': {
      codigo: 'x'.repeat(60000),
      passosConcluidos: ['entender-u1', 'inventado'],
      conclusao: '<script>alert(1)</script>',
      executadaNoColabEm: 'ontem',
      pronta: true,
    },
    falsa: { codigo: 'não entra' },
  } } };
  const estado = normalizeState(entrada);
  assert.equal(estado.faculdade.entregas['entrega-u1'].codigo.length, 50000);
  assert.deepEqual(estado.faculdade.entregas['entrega-u1'].passosConcluidos, ['entender-u1']);
  assert.equal(estado.faculdade.entregas['entrega-u1'].executadaNoColabEm, '');
  assert.equal(estado.faculdade.entregas.falsa, undefined);
  assert.equal(estado.faculdade.entregas['entrega-u1'].pronta, undefined);
});
```

- [ ] **Step 2: Escrever teste falhando para mesclagem conservadora**

```js
test('mescla etapas e preserva o texto de maior trabalho em cada campo', () => {
  const atual = estadoComEntrega({ codigo: 'print(1)', passosConcluidos: ['entender-u1'] });
  const entrada = estadoComEntrega({
    codigo: 'notas = [7, 8, 9]\nprint(sum(notas) / len(notas))',
    passosConcluidos: ['construir-u1'],
    conclusao: 'A média resume o desempenho da turma.',
  });
  const unido = mergeProgress(atual, entrada).faculdade.entregas['entrega-u1'];
  assert.deepEqual(unido.passosConcluidos.sort(), ['construir-u1', 'entender-u1']);
  assert.match(unido.codigo, /sum/);
  assert.match(unido.conclusao, /desempenho/);
});
```

- [ ] **Step 3: Rodar os testes e confirmar falhas específicas**

Run: `node --test tests/faculdade-entregas.test.js tests/progress.test.js tests/merge-progress.test.js`

Expected: FAIL porque `faculdade.entregas` ainda não existe nem é mesclado.

- [ ] **Step 4: Implementar a forma normalizada do trabalho**

Em `src/faculdade-entregas.js`, exportar:

```js
export function normalizarTrabalhoDaEntrega(raw, entrega) {
  return {
    codigo: texto(raw?.codigo, 50000),
    passosConcluidos: idsValidos(raw?.passosConcluidos, entrega.passos),
    saida: texto(raw?.saida, 12000),
    logica: texto(raw?.logica, 4000),
    testes: texto(raw?.testes, 4000),
    conclusao: texto(raw?.conclusao, 4000),
    insights: texto(raw?.insights, 4000),
    saidaExterna: texto(raw?.saidaExterna, 12000),
    executadaEm: dataValida(raw?.executadaEm),
    executadaNoColabEm: dataValida(raw?.executadaNoColabEm),
    concluidaEm: dataValida(raw?.concluidaEm),
  };
}

export function juntarTrabalhosDaEntrega(a, b, entrega) { /* união + texto mais longo */ }
```

- [ ] **Step 5: Integrar no estado e nas atividades diárias**

Alterar `initialState().faculdade` para `{ feitas: [], codigos: {}, entregas: {} }`. Em `normalizeState`, aceitar apenas IDs do catálogo, chamar `normalizarTrabalhoDaEntrega` e permitir atividades no formato `faculdade-entrega:<entregaId>:<passoId>` somente quando os dois IDs existirem. Em `mergeProgress`, unir todas as entregas conhecidas com `juntarTrabalhosDaEntrega`.

- [ ] **Step 6: Rodar a suíte focal e depois a suíte unitária completa**

Run: `node --test tests/faculdade-entregas.test.js tests/progress.test.js tests/merge-progress.test.js`

Expected: PASS.

Run: `npm test`

Expected: todos os testes PASS e 16 aulas preservadas.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-entregas.js src/progress.js src/merge-progress.js tests/faculdade-entregas.test.js tests/progress.test.js tests/merge-progress.test.js
git commit -m "feat: salvar progresso das entregas acadêmicas"
```

## Task 3: Gerar notebook Colab e relatório seguro

**Files:**
- Create: `src/faculdade-exportacao.js`
- Create: `tests/faculdade-exportacao.test.js`
- Reference: `src/faculdade-entregas.js`

- [ ] **Step 1: Escrever testes falhando para notebook válido e relatório escapado**

```js
import {
  criarNotebookColab,
  criarRelatorioHtml,
  nomeDoArquivoDaEntrega,
} from '../src/faculdade-exportacao.js';

test('gera nbformat 4 com explicação e código salvo', () => {
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
});

test('notebook U4 contém bibliotecas e sequência oficiais', () => {
  const texto = criarNotebookColab({
    entrega: entregaDaFaculdade('entrega-u4'), trabalho: trabalhoCompletoU4,
    estudante: { nome: 'Estudante' },
  });
  for (const trecho of ['tensorflow', 'load_iris', 'train_test_split', 'StandardScaler', 'model.evaluate']) {
    assert.ok(texto.includes(trecho), trecho);
  }
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
```

- [ ] **Step 2: Rodar o teste e confirmar a ausência do gerador**

Run: `node --test tests/faculdade-exportacao.test.js`

Expected: FAIL com `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar geradores determinísticos**

Exportar:

```js
export function criarNotebookColab({ entrega, trabalho, estudante }) { /* JSON string */ }
export function criarRelatorioHtml({ entrega, trabalho, estudante }) { /* documento HTML */ }
export function nomeDoArquivoDaEntrega(entrega, extensao) {
  return `${entrega.id}-${slugSeguro(entrega.titulo)}.${extensao}`;
}
```

O notebook deve conter capa em Markdown, objetivos, células do código do estudante, roteiro de testes, conclusão e, na U4, células reais de instalação/importação, preparação, modelo, treino, avaliação e predição. O HTML deve aplicar `escapeHtml` a todo valor dinâmico, usar CSS embutido para impressão A4, mostrar checklist dos critérios e oferecer botão `Imprimir / salvar como PDF` com `window.print()`.

- [ ] **Step 4: Garantir que nenhum segredo ou saída inventada seja exportado**

Adicionar testes para rejeitar campos desconhecidos, não imprimir `undefined`, não copiar variáveis de ambiente e rotular `saidaExterna` como “resultado informado após execução no Colab”.

- [ ] **Step 5: Rodar os testes do exportador**

Run: `node --test tests/faculdade-exportacao.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/faculdade-exportacao.js tests/faculdade-exportacao.test.js
git commit -m "feat: exportar trabalhos para Colab e PDF"
```

## Task 4: Completar os roteiros didáticos das U1 e U2

**Files:**
- Modify: `src/faculdade-entregas.js`
- Create: `tests/faculdade-entregas-reference.js`
- Modify: `tests/faculdade-entregas.test.js`
- Modify: `src/faculdade-ensino.js`
- Modify: `tests/faculdade-ensino.test.js`

- [ ] **Step 1: Criar soluções de referência executáveis e testes de comportamento**

Adicionar `solucoesEntregasFaculdade['entrega-u1']` e `['entrega-u2']` com código independente da UI. Testar as funções diretamente ou por subprocesso Python disponível no projeto:

```js
test('U1 calcula média e classifica estudantes no limite sete', async () => {
  const saida = await executarReferencia('entrega-u1');
  assert.match(saida, /Média da turma:/);
  assert.match(saida, /Aprovado/);
  assert.match(saida, /Reprovado/);
});

test('U2 cadastra, lista, busca e agrega livros por gênero', async () => {
  const saida = await executarReferencia('entrega-u2');
  assert.match(saida, /Livro encontrado:/);
  assert.match(saida, /Livros por gênero:/);
});
```

- [ ] **Step 2: Rodar e confirmar as falhas por referências ausentes**

Run: `node --test tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js`

Expected: FAIL nas novas referências ou lacunas didáticas.

- [ ] **Step 3: Escrever a progressão U1 sem saltos**

As etapas precisam ensinar separadamente: criar uma lista; percorrer com `for`; acumular soma; usar `len`; calcular média; comparar com 7; montar relatório; testar nota exatamente 7 e lista vazia. Cada conceito deve ter uma microexplicação, exemplo curto, previsão de saída, alteração do estudante e aplicação final.

- [ ] **Step 4: Escrever a progressão U2 sem saltos**

As etapas precisam ensinar separadamente: diferença entre classe e objeto; `__init__`; `self`; lista de objetos; função de cadastro; listagem; busca sem diferenciar maiúsculas/minúsculas; dicionário de contagem; gráfico de barras; caso não encontrado. A solução deve continuar legível para iniciante e não introduzir herança, decoradores ou compreensão complexa.

- [ ] **Step 5: Conectar pré-requisitos às aulas existentes**

Em `src/faculdade-ensino.js`, registrar para cada conceito obrigatório a aula que o explica, o exemplo que roda, o exercício de alteração e a etapa da entrega que cobra. O validador deve falhar se algum conceito obrigatório não possuir as quatro posições.

- [ ] **Step 6: Rodar testes focais e currículo**

Run: `node --test tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js`

Expected: PASS.

Run: `npm run auditar:ementa`

Expected: PASS sem conceito exigido antes de ser ensinado.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-entregas.js src/faculdade-ensino.js tests/faculdade-entregas-reference.js tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js
git commit -m "feat: ensinar projetos das unidades 1 e 2 passo a passo"
```

## Task 5: Completar os roteiros U3 e U4 com ambientes honestos

**Files:**
- Modify: `src/faculdade-entregas.js`
- Modify: `tests/faculdade-entregas-reference.js`
- Modify: `tests/faculdade-entregas.test.js`
- Modify: `src/faculdade-ensino.js`
- Modify: `tests/faculdade-ensino.test.js`

- [ ] **Step 1: Escrever testes falhando para idempotência U3 e limite U4**

```js
test('U3 pode executar duas vezes sem duplicar as vendas', async () => {
  const primeira = await executarReferencia('entrega-u3');
  const segunda = await executarReferencia('entrega-u3');
  assert.equal(extrairTotalDeVendas(primeira), extrairTotalDeVendas(segunda));
});

test('U4 exige evidência externa e nunca afirma TensorFlow no PyCampus', () => {
  const entrega = entregaDaFaculdade('entrega-u4');
  assert.equal(entrega.ambienteEntrega, 'colab');
  assert.match(entrega.avisoAmbiente, /TensorFlow.*Colab/i);
  assert.ok(requisitosFaltandoDaEntrega(entrega, {
    ...trabalhoU4SemColab,
    passosConcluidos: entrega.passos.map(({ id }) => id),
  }).some(({ id }) => id === 'execucao-colab'));
});
```

- [ ] **Step 2: Rodar e observar as falhas**

Run: `node --test tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js`

Expected: FAIL nos contratos de U3/U4 recém-adicionados.

- [ ] **Step 3: Implementar U3 reproduzível**

Ensinar criar conexão SQLite, tabela com chave primária, limpar ou recriar dados de exemplo de forma explícita, inserir com parâmetros, ler com pandas, calcular total/média/produto de destaque e gerar gráficos. O código do PyCampus deve tentar Seaborn quando disponível e cair para Matplotlib com a mesma informação quando não estiver. A conclusão deve pedir três insights escritos pelo estudante.

- [ ] **Step 4: Implementar U4 em duas camadas**

No PyCampus, ensinar features/rótulos, separação treino-teste, normalização, previsão e acurácia com um exemplo pequeno executável e sem fingir TensorFlow. No notebook Colab, usar `load_iris`, `train_test_split(..., stratify=y, random_state=42)`, `StandardScaler` ajustado apenas no treino, rede `Sequential`, treino, `evaluate` e predição. Exigir `saidaExterna` não vazia e `executadaNoColabEm` válida para satisfazer `execucao-colab`.

- [ ] **Step 5: Completar a matriz didática U3/U4**

Mapear SQLite, pandas, agregações, gráficos, treino-teste, escala, rede, épocas, avaliação e predição nas quatro fases pedagógicas. Manter os IDs e títulos principais das 16 aulas.

- [ ] **Step 6: Rodar testes focais, auditoria e suíte completa**

Run: `node --test tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js`

Expected: PASS.

Run: `npm run auditar:ementa && npm test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-entregas.js src/faculdade-ensino.js tests/faculdade-entregas-reference.js tests/faculdade-entregas.test.js tests/faculdade-ensino.test.js
git commit -m "feat: ensinar dados e machine learning com ambiente correto"
```

## Task 6: Construir o Estúdio de Entrega acessível e responsivo

**Files:**
- Create: `src/FaculdadeEntrega.jsx`
- Create: `src/faculdade-entrega.css`
- Modify: `src/App.jsx`
- Modify: `tests/ui-experience.test.js`
- Modify: `tests/estilos-alcancaveis.test.js`
- Reference: `src/CodeEditor.jsx`
- Reference: `src/hooks/usePython.js`

- [ ] **Step 1: Escrever testes de estrutura e acessibilidade que falham**

```js
test('estúdio expõe navegação, progresso, editor, testes e exportação', () => {
  const fonte = readFileSync('src/FaculdadeEntrega.jsx', 'utf8');
  for (const texto of ['Entender', 'Construir', 'Testar', 'Explicar', 'Exportar']) {
    assert.match(fonte, new RegExp(texto));
  }
  assert.match(fonte, /aria-current/);
  assert.match(fonte, /aria-live/);
  assert.match(fonte, /CodeEditor/);
});

test('estúdio possui foco visível, toque mínimo e layout móvel', () => {
  const css = readFileSync('src/faculdade-entrega.css', 'utf8');
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media\s*\(max-width:/);
});
```

- [ ] **Step 2: Rodar e confirmar falha por arquivos ausentes**

Run: `node --test tests/ui-experience.test.js tests/estilos-alcancaveis.test.js`

Expected: FAIL ao ler `FaculdadeEntrega.jsx` ou seu CSS.

- [ ] **Step 3: Implementar a tela como adaptador fino do domínio**

Contrato:

```jsx
<FaculdadeEntrega
  entregaId={facultyTarget}
  state={state}
  update={update}
  navigate={navigate}
  download={download}
/>
```

A tela deve mostrar objetivo e prazo; trilha das cinco fases com os passos pequenos da fase atual; “o que você já precisa saber”; explicação e exemplo do passo atual; editor com executar; saída com `aria-live`; campos de lógica/testes/conclusão/insights; orientação Colab da U4; checklist derivado; botões de notebook e relatório. Salvar cada edição em `state.faculdade.entregas[id]`, registrar atividade do passo somente quando sua evidência for satisfeita e nunca usar estado local como fonte definitiva do trabalho.

- [ ] **Step 4: Aplicar o visual do PyCampus sem esconder conteúdo**

Usar painel principal com largura legível, cabeçalho compacto, stepper horizontal rolável no celular, cartões claros, tipografia já carregada no projeto e cores semânticas existentes. Em telas estreitas, editor, saída e orientação ficam em uma coluna; nenhuma ação essencial depende de hover.

- [ ] **Step 5: Integrar roteamento no App**

Quando `facultyTarget` começar com `entrega-`, renderizar `FaculdadeEntrega`; caso contrário manter a rota atual de aula/projeto. Reutilizar a função `download` existente no `App.jsx` para arquivos e abrir o relatório em uma janela segura para impressão.

- [ ] **Step 6: Rodar testes focais e build**

Run: `node --test tests/ui-experience.test.js tests/estilos-alcancaveis.test.js`

Expected: PASS.

Run: `npm run build`

Expected: build concluído sem erro ou warning novo da tela.

- [ ] **Step 7: Commit**

```bash
git add src/FaculdadeEntrega.jsx src/faculdade-entrega.css src/App.jsx tests/ui-experience.test.js tests/estilos-alcancaveis.test.js
git commit -m "feat: criar estúdio guiado de entregas"
```

## Task 7: Integrar entregas na faculdade, busca, projetos e painel

**Files:**
- Modify: `src/Faculdade.jsx`
- Modify: `src/FaculdadeIntegrada.jsx`
- Modify: `src/faculdade-integrada.js`
- Modify: `src/Projects.jsx`
- Modify: `src/Dashboard.jsx`
- Modify: `src/App.jsx`
- Modify: `tests/faculdade.test.js`
- Modify: `tests/study-flow.test.js`
- Modify: `tests/endereco-por-link.test.js`

- [ ] **Step 1: Escrever testes falhando para descoberta e abertura exata**

```js
test('busca encontra as quatro entregas e preserva o id navegável', () => {
  const resultados = buscarNaFaculdade('Iris');
  assert.ok(resultados.some(({ id, tipo }) =>
    id === 'entrega-u4' && tipo === 'Entrega prática'));
});

test('panorama expõe uma entrega por unidade', () => {
  const panorama = panoramaDaFaculdade(initialState());
  assert.equal(panorama.unidades.filter(({ entrega }) => entrega).length, 4);
});
```

Adicionar ao teste de endereço a URL `/?tab=faculdade&faculty=entrega-u4` e verificar que ela abre o estúdio Iris, não apenas a aba geral.

- [ ] **Step 2: Rodar os testes e confirmar falhas de integração**

Run: `node --test tests/faculdade.test.js tests/study-flow.test.js tests/endereco-por-link.test.js`

Expected: FAIL porque as entregas ainda não participam do panorama e da busca.

- [ ] **Step 3: Integrar no modelo de navegação**

Em `panoramaDaFaculdade`, anexar a entrega da unidade e progresso derivado. Em `buscarNaFaculdade`, indexar título, resumo, pré-requisitos, passos e critérios com tipo `Entrega prática`. Em `App.jsx`, preservar `faculty=entrega-uN` ao compartilhar/recarregar e levar cada resultado exatamente ao estúdio correspondente.

- [ ] **Step 4: Exibir chamadas coerentes nas quatro superfícies**

- `Faculdade.jsx`: card “Entrega da unidade” após as aulas, com situação e próxima etapa.
- `FaculdadeIntegrada.jsx`: seção “Trabalhos até 27 de setembro” com 4 cartões e distinção clara entre estudo e entrega.
- `Projects.jsx`: grupo “Projetos da faculdade” apontando aos estúdios, sem duplicar estado.
- `Dashboard.jsx`: próxima ação deve preferir aula pré-requisito pendente; após pré-requisitos, oferecer a próxima etapa incompleta da entrega.

- [ ] **Step 5: Rodar testes focais, abas e build**

Run: `node --test tests/faculdade.test.js tests/study-flow.test.js tests/endereco-por-link.test.js`

Expected: PASS.

Run: `npm run test:abas && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/Faculdade.jsx src/FaculdadeIntegrada.jsx src/faculdade-integrada.js src/Projects.jsx src/Dashboard.jsx src/App.jsx tests/faculdade.test.js tests/study-flow.test.js tests/endereco-por-link.test.js
git commit -m "feat: integrar entregas em toda a jornada de estudo"
```

## Task 8: Auditar a progressão das 16 aulas e corrigir saltos pedagógicos

**Files:**
- Create: `scripts/auditar-progressao-faculdade.mjs`
- Modify: `src/faculdade.js`
- Modify: `src/faculdade-ensino.js`
- Modify: `tests/faculdade.test.js`
- Modify: `tests/faculdade-ensino.test.js`
- Modify: `package.json`

- [ ] **Step 1: Escrever testes que travem quantidade, IDs e ordem pedagógica**

```js
test('mantém os 16 ids para não invalidar progresso salvo', () => {
  assert.equal(aulasDaFaculdade.length, 16);
  assert.deepEqual(aulasDaFaculdade.map(({ id }) => id), IDS_HISTORICOS_DAS_16_AULAS);
});

test('nenhum desafio cobra conceito antes das quatro fases de aprendizagem', () => {
  const problemas = auditarProgressaoDaFaculdade();
  assert.deepEqual(problemas, []);
});
```

- [ ] **Step 2: Rodar os testes para revelar lacunas reais**

Run: `node --test tests/faculdade.test.js tests/faculdade-ensino.test.js`

Expected: FAIL listando conceitos cobrados cedo demais ou sem prática suficiente.

- [ ] **Step 3: Corrigir cada aula sem trocar seu ID**

Para cada problema reportado, reduzir o desafio ao conceito já ensinado ou inserir antes dele uma explicação, exemplo executável, previsão de saída e microalteração. Em especial, não perguntar sobre `input()` numa aula cujo exemplo não o usa; toda revisão deve avaliar exatamente a habilidade praticada naquela aula. Distribuir os conteúdos adicionais dentro das 16 aulas e estúdios, sem inflar artificialmente a contagem 6/16.

- [ ] **Step 4: Criar auditoria executável no CI local**

O script deve importar a matriz didática, imprimir aula/conceito/fase ausente e encerrar com código 1 em falha. Adicionar ao `package.json`:

```json
"auditar:progressao-faculdade": "node scripts/auditar-progressao-faculdade.mjs"
```

Incluir esse comando em `verificar` logo após `auditar:ementa`.

- [ ] **Step 5: Rodar auditorias e regressões de conteúdo**

Run: `npm run auditar:ementa && npm run auditar:progressao-faculdade`

Expected: ambas PASS e relatório com 16 aulas, 4 unidades, 4 entregas.

Run: `node --test tests/faculdade.test.js tests/faculdade-ensino.test.js tests/faculdade-exercicios.test.js`

Expected: PASS, inclusive a resposta corrigida `df_selic.loc[70]`.

- [ ] **Step 6: Commit**

```bash
git add scripts/auditar-progressao-faculdade.mjs src/faculdade.js src/faculdade-ensino.js tests/faculdade.test.js tests/faculdade-ensino.test.js package.json
git commit -m "fix: remover saltos pedagógicos das aulas da faculdade"
```

## Task 9: Validar a jornada completa como estudante iniciante

**Files:**
- Create: `scripts/check-faculdade-entregas.mjs`
- Modify: `scripts/check-faculdade.mjs`
- Modify: `package.json`
- Modify: `tests/faculdade-entregas.test.js`

- [ ] **Step 1: Escrever a jornada Playwright antes dos ajustes finais**

O script deve usar um perfil temporário limpo, abrir a aplicação, navegar para Faculdade, localizar a U1, abrir `entrega-u1`, avançar pelas explicações, editar e executar código, registrar explicação/testes/conclusão, verificar o checklist, baixar o notebook e abrir a versão imprimível. Depois deve abrir U4, confirmar o aviso Colab e verificar que a conclusão permanece bloqueada sem saída externa.

- [ ] **Step 2: Executar a jornada e registrar a primeira falha concreta**

Run: `node scripts/check-faculdade-entregas.mjs`

Expected: FAIL até seletores, estados e downloads estarem completamente conectados.

- [ ] **Step 3: Corrigir somente as causas observadas**

Aplicar ajustes de texto, foco, estado, navegação, execução e responsividade encontrados pela jornada. Não afrouxar seletores para esconder falha e não remover requisitos para fazer o teste passar.

- [ ] **Step 4: Testar recuperação de sessão e progresso 6/16**

No mesmo script, carregar um backup com seis IDs históricos, iniciar uma entrega, recarregar a página e confirmar: 6/16 continua visível; código e campos persistem; a URL continua no item exato; etapa concluída aparece no calendário uma única vez.

- [ ] **Step 5: Ligar o teste ao comando oficial**

Adicionar:

```json
"test:entregas-faculdade": "node scripts/check-faculdade-entregas.mjs"
```

e incluí-lo em `verificar` após `test:faculdade`.

- [ ] **Step 6: Rodar jornadas relacionadas**

Run: `npm run test:entregas-faculdade && npm run test:faculdade && npm run test:iniciante && npm run test:visual`

Expected: PASS em desktop e viewport móvel configurada pelos scripts.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-faculdade-entregas.mjs scripts/check-faculdade.mjs package.json tests/faculdade-entregas.test.js
git commit -m "test: validar entregas como estudante iniciante"
```

## Task 10: Documentar, verificar e preparar publicação

**Files:**
- Modify: `README.md`
- Create: `docs/faculdade/roteiro-entregas-2026-09-27.md`
- Modify: `docs/superpowers/specs/2026-09-22-entregas-e-qualidade-faculdade-design.md`

- [ ] **Step 1: Documentar o fluxo do estudante**

Explicar no README onde ficam as entregas e como exportar. No roteiro, registrar as quatro atividades, pré-requisitos, uma agenda intensiva de 22/09/2026 até 27/09/2026, uso do `.ipynb` no Colab, captura de tela, impressão em PDF e conferência do limite de 10 MB. Dizer explicitamente que o envio final ao AVA continua sendo uma ação do estudante.

- [ ] **Step 2: Atualizar a spec apenas com decisões realmente implementadas**

Marcar o estado final dos contratos, registrar qualquer desvio aprovado e incluir links para módulos, testes e roteiro. Não declarar recurso que os testes ou a interface não entreguem.

- [ ] **Step 3: Rodar a verificação completa a partir de estado limpo**

Run: `npm run verificar`

Expected: exit code 0 em testes unitários, auditorias, jornadas, faculdade, entregas e visual.

Run: `npm run build`

Expected: exit code 0 e `dist/` gerado.

- [ ] **Step 4: Inspecionar alterações e ausência de resíduos**

Run: `git status --short && git diff --check && git log --oneline -12`

Expected: sem espaços inválidos, sem arquivos temporários, somente documentação final ainda não commitada e histórico granular das tarefas.

- [ ] **Step 5: Commit da documentação**

```bash
git add README.md docs/faculdade/roteiro-entregas-2026-09-27.md docs/superpowers/specs/2026-09-22-entregas-e-qualidade-faculdade-design.md
git commit -m "docs: orientar conclusão dos trabalhos da faculdade"
```

- [ ] **Step 6: Revisão final antes de publicar**

Run: `git status --short && git log -1 --oneline`

Expected: árvore limpa. Somente depois dessa evidência, seguir o fluxo de conclusão do branch, publicar no GitHub e validar o endereço de produção sem alterar o progresso do estudante.
