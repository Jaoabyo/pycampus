# Sprint 1: preparação acadêmica e feedback do mediador — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma jornada acadêmica que escolhe estudo, recuperação e simulado de forma honesta até a prova e transforma feedback do mediador em uma melhoria opcional verificável da entrega U2.

**Architecture:** Regras acadêmicas ficam em módulos JavaScript puros, atrás de interfaces pequenas; React apenas renderiza os resultados e encaminha eventos. Metadados das questões formam a fonte única de elegibilidade, origem e recuperação. Feedback e tentativas ganham normalização e merge compatíveis com backups antigos.

**Tech Stack:** React 19, JavaScript ESM, Node test runner, Vite, Pyodide Web Worker, Playwright com Microsoft Edge, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-24-sprint-1-preparacao-e-feedback-design.md`

## Global Constraints

- Datas acadêmicas: estudo até `2026-09-27`, prova em `2026-09-30`, entregas pelo prazo seguro `2026-10-17`.
- XP representa atividade registrada, não domínio; revisão e feedback não concedem XP novo.
- Entregas enviadas nunca são alteradas; melhoria cria estado separado.
- Nenhuma tela afirma envio ao AVA, alteração de nota ou validação pelo mediador.
- O modo estudado exige todos os pré-requisitos da questão.
- Backups versão 1 existentes devem continuar abrindo sem perda.
- Todos os textos visíveis são em português do Brasil e distinguem questão recebida do AVA de treino baseado na apostila.
- Novos controles têm alvo mínimo de 44 px e não introduzem rolagem horizontal em 390×844.
- Desenvolvimento test-first: observar RED, implementar o mínimo, observar GREEN e executar regressão antes do commit.

## Review Focus

1. Data local exatamente na virada 27→28/09: deve mudar de fechamento para revisão sem `Infinity`, `NaN` ou plano vazio.
2. Estado antigo com questão respondida e sem novos metadados: deve normalizar e continuar entrando na fila correta.
3. Questão com destino removido do currículo: auditoria deve falhar, e a interface deve preservar a sessão em vez de navegar para vazio.
4. Feedback muito grande, nota inválida ou data inválida: deve limitar texto, rejeitar campos inválidos e manter o restante do backup.
5. Persistência U2 executada duas vezes e com acentos: deve recarregar quatro livros sem duplicar nem corromper `História`/`Ciência`.

---

### Task 1: Metadados pedagógicos das 40 questões

**Files:**
- Modify: `src/faculdade-questoes.js`
- Modify: `src/faculdade-exercicios.js`
- Create: `tests/faculdade-questoes-metadata.test.js`

**Interfaces:**
- Consumes: `aulasDaFaculdade`, `projetosDaFaculdade`, `exerciciosDaFaculdade`.
- Produces: cada questão com `origemTipo: 'ava'|'apostila'|'aula'|'projeto'`, `aulasNecessarias: string[]`, `habilidade: string`, `destino: { tipo: 'aula'|'projeto'|'exercicio', id: string }`; `questoesElegiveis(state, escopo): Questao[]`; `auditarDestinosDasQuestoes(): string[]`.

- [ ] **Step 1: Escrever testes falhando para origem, pré-requisitos e destinos**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/progress.js';
import { questaoDaFaculdade, questoesElegiveis, auditarDestinosDasQuestoes } from '../src/faculdade-questoes.js';

test('u1q1 só fica elegível depois das aulas que ensinam função e média', () => {
  const state = initialState();
  state.faculdade.feitas = ['u1a1'];
  assert.equal(questoesElegiveis(state, 'estudado').some(q => q.id === 'u1q1'), false);
  state.faculdade.feitas.push('r3');
  assert.equal(questoesElegiveis(state, 'estudado').some(q => q.id === 'u1q1'), true);
});

test('origem editorial e destino são explícitos em todas as questões', () => {
  assert.equal(questaoDaFaculdade('u4q1').origemTipo, 'apostila');
  assert.equal(questaoDaFaculdade('u1q1').origemTipo, 'ava');
  assert.deepEqual(auditarDestinosDasQuestoes(), []);
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade-questoes-metadata.test.js`  
Expected: FAIL porque `questoesElegiveis`, `auditarDestinosDasQuestoes` e os campos ainda não existem.

- [ ] **Step 3: Adicionar o mapa explícito das vinte questões de exercício**

Adicionar em `src/faculdade-questoes.js` um mapa estático validado:

```js
const METADADOS_AVA = {
  u1q1: ['ava', ['u1a1', 'r3'], 'funções e média', { tipo: 'aula', id: 'r3' }],
  u1q2: ['ava', ['r3'], 'chamada de função', { tipo: 'aula', id: 'r3' }],
  u1q3: ['ava', ['u1a1'], 'legibilidade de Python', { tipo: 'aula', id: 'u1a1' }],
  u1q4: ['ava', ['r1'], 'condicionais em função', { tipo: 'aula', id: 'r1' }],
  u1q5: ['ava', ['u1a1'], 'ecossistema Python', { tipo: 'aula', id: 'u1a1' }],
  u2q1: ['ava', ['u2a4'], 'módulos de terceiros', { tipo: 'aula', id: 'u2a4' }],
  u2q2: ['ava', ['u2a1'], 'índices de lista', { tipo: 'aula', id: 'u2a1' }],
  u2q3: ['ava', ['u2a3'], 'polimorfismo', { tipo: 'aula', id: 'u2a3' }],
  u2q4: ['ava', ['u2a2'], 'NumPy', { tipo: 'aula', id: 'u2a2' }],
  u2q5: ['ava', ['u2a4'], 'importação de módulos', { tipo: 'aula', id: 'u2a4' }],
  u3q1: ['ava', ['u3a2'], 'Series do pandas', { tipo: 'aula', id: 'u3a2' }],
  u3q2: ['ava', ['u3a4'], 'visualização com pandas', { tipo: 'aula', id: 'u3a4' }],
  u3q3: ['ava', ['u3a3'], 'categorias de análise', { tipo: 'aula', id: 'u3a3' }],
  u3q4: ['ava', ['u3a2'], 'Series por dicionário', { tipo: 'aula', id: 'u3a2' }],
  u3q5: ['ava', ['u3a3'], 'seleção com loc', { tipo: 'aula', id: 'u3a3' }],
  u4q1: ['apostila', ['r4'], 'camadas web', { tipo: 'aula', id: 'r4' }],
  u4q2: ['apostila', ['u4a2'], 'abas no KivyMD', { tipo: 'aula', id: 'u4a2' }],
  u4q3: ['apostila', ['u4a3'], 'descoberta de testes unittest', { tipo: 'aula', id: 'u4a3' }],
  u4q4: ['apostila', ['u4a4'], 'previsão por regressão', { tipo: 'aula', id: 'u4a4' }],
  u4q5: ['apostila', ['u4a3'], 'doctest', { tipo: 'aula', id: 'u4a3' }],
};
```

Montar os objetos usando os quatro valores e definir aulas/projetos com metadados equivalentes. `questoesElegiveis(state, 'tudo')` devolve tudo; em `estudado`, usa `every` sobre `aulasNecessarias`.

- [ ] **Step 4: Implementar auditoria de destinos usando os catálogos reais**

```js
export function auditarDestinosDasQuestoes() {
  const aulas = new Set(aulasDaFaculdade.map(a => a.id));
  const projetos = new Set(projetosDaFaculdade.map(p => p.id));
  const exercicios = new Set(exerciciosDaFaculdade.map(e => e.id));
  return questoesDaFaculdade.flatMap(q => {
    const catalogo = q.destino.tipo === 'aula' ? aulas : q.destino.tipo === 'projeto' ? projetos : exercicios;
    return catalogo.has(q.destino.id) ? [] : [`${q.id}: destino ${q.destino.tipo}:${q.destino.id} não existe`];
  });
}
```

- [ ] **Step 5: Confirmar GREEN e regressão do banco de perguntas**

Run: `node --test tests/faculdade-questoes-metadata.test.js tests/faculdade-revisao.test.js tests/faculdade.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/faculdade-questoes.js src/faculdade-exercicios.js tests/faculdade-questoes-metadata.test.js
git commit -m "feat: mapear pré-requisitos e recuperação das questões"
```

---

### Task 2: Módulo central de preparação e calendário

**Files:**
- Create: `src/faculdade-preparo.js`
- Create: `tests/faculdade-preparo.test.js`
- Modify: `src/faculdade.js`

**Interfaces:**
- Consumes: `FIM_DO_ESTUDO`, `DATA_PROVA`, `PRAZO_TRABALHO`, `planoDeEstudosDaFaculdade`, `questoesElegiveis`, `resumoDaRevisao`, progresso existente.
- Produces: `faseAcademica(hoje: Date): 'conteudo'|'fechamento'|'revisao'|'prova'|'pos-prova'`; `coberturaAcademica(state): object`; `planoDePreparo(state, hoje): { fase, cobertura, ritmoNecessario, acoes, aviso }`.

- [ ] **Step 1: Escrever testes falhando para as cinco fases e valores finitos**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/progress.js';
import { faseAcademica, planoDePreparo } from '../src/faculdade-preparo.js';

const dia = (d) => new Date(`${d}T12:00:00-03:00`);

test('calendário distingue conteúdo, fechamento, revisão, prova e pós-prova', () => {
  assert.equal(faseAcademica(dia('2026-09-26')), 'conteudo');
  assert.equal(faseAcademica(dia('2026-09-27')), 'fechamento');
  assert.equal(faseAcademica(dia('2026-09-28')), 'revisao');
  assert.equal(faseAcademica(dia('2026-09-30')), 'prova');
  assert.equal(faseAcademica(dia('2026-10-01')), 'pos-prova');
});

test('nenhum plano atrasado contém número impossível', () => {
  for (const data of ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30']) {
    const plano = planoDePreparo(initialState(), dia(data));
    assert.ok(Number.isFinite(plano.ritmoNecessario));
    assert.doesNotMatch(JSON.stringify(plano), /Infinity|NaN/);
  }
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade-preparo.test.js`  
Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implementar fases, cobertura e três ações máximas**

`faculdade-preparo.js` chama o plano legado exportado por `faculdade.js`; `faculdade.js` não importa o novo módulo, evitando um ciclo. `ritmoNecessario` é `0` fora de `conteudo`/`fechamento`; dentro delas usa divisor mínimo 1. `acoes` contém objetos `{ tipo, id, titulo, explicacao }` e no máximo uma ação de cada grupo: `conteudo`, `recuperacao`, `simulado`. A cobertura contém `{ aulas: { feitas,total }, questoes: { vistas,elegiveis }, unidadesPraticadas, simulados }`.

- [ ] **Step 4: Corrigir o cálculo legado sem criar dependência circular**

Em `src/faculdade.js`, manter os campos antigos `agenda`, `pendentes`, `feitas`, `diasDisponiveis`, `ritmoNecessario`; definir `ritmoNecessario` como `0` quando `diasDeEstudo <= 0` e dividir somente quando o divisor for positivo. O novo módulo envolve esse retorno e acrescenta `fase`, `cobertura`, `acoes`, `aviso`. Consumidores novos importam `planoDePreparo`; consumidores legados continuam importando `planoDeEstudosDaFaculdade`.

- [ ] **Step 5: Testar limite de carga e honestidade**

Adicionar testes com 16 aulas pendentes em 29/09: `acoes.length <= 3`, `fase === 'revisao'`, `aviso` contém “não cabe” ou “priorizar”, e nenhuma mensagem promete conclusão total.

- [ ] **Step 6: Confirmar GREEN**

Run: `node --test tests/faculdade-preparo.test.js tests/faculdade.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-preparo.js src/faculdade.js tests/faculdade-preparo.test.js tests/faculdade.test.js
git commit -m "fix: tornar plano acadêmico finito e orientado à prova"
```

---

### Task 3: Seleção adaptativa e compressão pré-prova

**Files:**
- Modify: `src/faculdade-revisao.js`
- Modify: `src/faculdade-revisao-estado.js`
- Modify: `tests/faculdade-revisao.test.js`

**Interfaces:**
- Consumes: `questoesElegiveis(state, escopo)`, `DATA_PROVA`.
- Produces: `prioridadeDaQuestao(state, questao, hoje): number`; `montarSimulado(state, { quantidade, escopo, hoje, aleatorio })`; `registrarResposta` com próxima data comprimida quando necessário.

- [ ] **Step 1: Escrever testes falhando de cobertura e prioridade**

```js
test('questões elegíveis nunca vistas vêm antes das firmes', () => {
  const state = initialState();
  state.faculdade.feitas = aulasDaFaculdade.map(a => a.id);
  state.revisaoFaculdade.u1q1 = { caixa: 4, proxima: '2026-09-30', ultima: '2026-09-24', acertos: 5, erros: 0 };
  const simulado = montarSimulado(state, { quantidade: 10, escopo: 'estudado', hoje: '2026-09-24', aleatorio: () => 0.5 });
  assert.equal(simulado.some(q => q.id === 'u1q1'), false);
  assert.equal(new Set(simulado.map(q => q.id)).size, 10);
});

test('revisão marcada antes da prova não fica somente depois dela', () => {
  const state = registrarResposta(initialState(), 'u1q1', true, '2026-09-29');
  assert.ok(state.revisaoFaculdade.u1q1.proxima <= '2026-09-30');
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade-revisao.test.js`  
Expected: FAIL porque o sorteio atual ignora vistos e a próxima data pode ultrapassar a prova.

- [ ] **Step 3: Implementar prioridade estável**

Usar categorias numéricas: `0` nunca vista, `1` errada vencida, `2` errada pré-prova, `3` caixa 0–2, `4` caixa 3–4. Ordenar categoria, unidade menos representada e depois valor aleatório. Não alterar alternativas até a seleção final.

- [ ] **Step 4: Comprimir somente a próxima exposição pré-prova**

Calcular a data Leitner normal; se `hoje < DATA_PROVA` e ela ultrapassar a prova, usar `DATA_PROVA`. Depois da prova, usar novamente `INTERVALOS` sem rebaixar caixa nem apagar contagens.

- [ ] **Step 5: Cobrir estado antigo e nenhuma questão elegível**

Adicionar teste em que `revisaoFaculdade` possui um ID válido, mas nenhuma aula foi concluída: `montarSimulado(state, { escopo: 'estudado', hoje: '2026-09-24', aleatorio: () => 0.5 })` devolve `[]`, sem cair silenciosamente em todas as unidades.

- [ ] **Step 6: Confirmar GREEN**

Run: `node --test tests/faculdade-revisao.test.js tests/faculdade-questoes-metadata.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-revisao.js src/faculdade-revisao-estado.js tests/faculdade-revisao.test.js
git commit -m "feat: priorizar lacunas no simulado acadêmico"
```

---

### Task 4: Histórico com origem acadêmica preservada

**Files:**
- Modify: `src/history.js`
- Modify: `src/Faculdade.jsx`
- Modify: `src/Prova.jsx`
- Modify: `src/progress.js`
- Modify: `tests/history.test.js`
- Modify: `tests/merge-progress.test.js`

**Interfaces:**
- Consumes: tentativas existentes com `source: 'lesson'|'playground'`.
- Produces: `source` normalizado para seis origens, campos opcionais `activityId`, `unidade`, `destino`; relatório agrupável e migração dos valores antigos.

- [ ] **Step 1: Escrever teste falhando de migração e preservação**

```js
test('tentativa acadêmica preserva origem e destino no backup', () => {
  const item = normalizeHistory([{
    id: 'u2-run', startedAt: '2026-09-24T12:00:00.000Z', source: 'faculdade-aula',
    activityId: 'u2a3', unidade: 'u2', destino: 'u2a3', title: 'Classes', code: 'print(1)',
    stdin: '', output: '1', status: 'success', matched: true, durationMs: 10,
  }])[0];
  assert.equal(item.source, 'faculdade-aula');
  assert.equal(item.activityId, 'u2a3');
  assert.equal(item.unidade, 'u2');
  assert.equal(item.destino, 'u2a3');
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/history.test.js`  
Expected: FAIL porque a origem vira `playground` e os campos somem.

- [ ] **Step 3: Implementar lista fechada de origens e migração**

`lesson` migra para `formacao-aula`; `playground` migra para `laboratorio`. IDs são limitados a 80 caracteres, unidade aceita apenas `u1`–`u4`, e destino é limitado a 80 caracteres. A validade contra o catálogo pertence à auditoria de questões da Task 1, mantendo `history.js` fora do bundle de conteúdo da Faculdade.

- [ ] **Step 4: Corrigir produtores**

Em `Faculdade.jsx`, registrar `source:'faculdade-aula'`, `activityId:aula.id`, `unidade:aula.unidade`, `destino:aula.id`. Em `Prova.jsx`, usar `prova-codigo` e conservar destino da atividade. Atualizar rótulos de `historyReport` para nomes humanos.

- [ ] **Step 5: Testar merge por ID com campos mais informativos**

Adicionar teste em `merge-progress.test.js` em que uma cópia antiga `laboratorio` e uma nova `faculdade-aula` compartilham ID; a nova origem e destino devem sobreviver sem duplicar a tentativa.

- [ ] **Step 6: Confirmar GREEN**

Run: `node --test tests/history.test.js tests/merge-progress.test.js tests/progress.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/history.js src/Faculdade.jsx src/Prova.jsx src/progress.js tests/history.test.js tests/merge-progress.test.js
git commit -m "feat: preservar origem pedagógica das tentativas"
```

---

### Task 5: Domínio de feedback do mediador

**Files:**
- Create: `src/faculdade-feedback.js`
- Create: `tests/faculdade-feedback.test.js`
- Modify: `src/progress.js`
- Modify: `src/merge-progress.js`
- Modify: `tests/merge-progress.test.js`

**Interfaces:**
- Produces: `normalizarFeedbacks(value): Feedback[]`; `registrarFeedback(state, feedback): state`; `planoDoFeedback(feedback): ItemMelhoria[]`; `juntarFeedbacks(a,b): Feedback[]`.
- `Feedback`: `{ id, entregaId, disciplina, nota, data, comentario, itens: [{ id,tipo,texto }], criadoEm }`.
- `tipo`: `'elogio'|'problema'|'sugestao'|'requisito'`.

- [ ] **Step 1: Escrever testes falhando para normalização e imutabilidade**

```js
test('feedback válido não altera a entrega enviada', () => {
  const state = unidadeCompleta('u2');
  const antes = structuredClone(state.faculdade.entregas['entrega-u2']);
  const depois = registrarFeedback(state, {
    id: 'u2-cristiano-2026-09-23', entregaId: 'entrega-u2', disciplina: 'Linguagem de Programação',
    nota: 85, data: '2026-09-23', comentario: 'Boa lógica; persistência seria uma melhoria.',
    itens: [{ id: 'persistencia', tipo: 'sugestao', texto: 'Salvar dados em arquivo.' }], criadoEm: '2026-09-24T12:00:00.000Z',
  });
  assert.deepEqual(depois.faculdade.entregas['entrega-u2'], antes);
  assert.equal(depois.feedbacksFaculdade[0].nota, 85);
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade-feedback.test.js`  
Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implementar limites e validação**

Aceitar entrega conhecida, nota inteira 0–100, data ISO real, comentário até 6000 caracteres, no máximo 20 itens com texto até 500 caracteres e IDs únicos. Feedback sem comentário pode existir, mas `planoDoFeedback` retorna `[]` se não houver item classificado.

- [ ] **Step 4: Incluir estado, normalização e merge**

Adicionar `feedbacksFaculdade: []` ao estado inicial. `normalizeState` chama `normalizarFeedbacks`. `mergeProgress` usa `juntarFeedbacks`, deduplicando por ID e preferindo a versão com comentário+itens mais completos.

- [ ] **Step 5: Cobrir dados hostis e backup antigo**

Testar nota 101, data `2026-02-30`, item de tipo desconhecido, comentário com 7000 caracteres e estado versão 1 sem o novo campo. O backup antigo deve normalizar com lista vazia; campos inválidos não entram.

- [ ] **Step 6: Confirmar GREEN**

Run: `node --test tests/faculdade-feedback.test.js tests/progress.test.js tests/merge-progress.test.js`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/faculdade-feedback.js src/progress.js src/merge-progress.js tests/faculdade-feedback.test.js tests/merge-progress.test.js
git commit -m "feat: registrar feedback acadêmico sem alterar entregas"
```

---

### Task 6: Extensão U2 com persistência JSON ensinada e executada

**Files:**
- Create: `src/faculdade-melhorias.js`
- Create: `tests/faculdade-melhorias.test.js`
- Modify: `src/FaculdadeEntrega.jsx`
- Modify: `src/faculdade-entrega.css`
- Create: `scripts/check-faculdade-melhoria-u2.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: feedback `entrega-u2` com item `persistencia`.
- Produces: `melhoriaDaEntrega(entregaId, feedbacks)`; melhoria `persistencia-u2` com cinco degraus, código inicial, conferência e teste de ida e volta.

- [ ] **Step 1: Escrever teste falhando para ensino antes da cobrança**

```js
test('persistência U2 ensina cada recurso que usa', () => {
  const melhoria = melhoriaDaEntrega('entrega-u2', [{
    entregaId: 'entrega-u2', itens: [{ id: 'persistencia', tipo: 'sugestao', texto: 'Salvar em arquivo.' }],
  }]);
  assert.deepEqual(melhoria.degraus.map(d => d.id), ['arquivo', 'json', 'ausente', 'reconstruir', 'ida-e-volta']);
  for (const degrau of melhoria.degraus) {
    assert.ok(degrau.ensina.length >= 100);
    assert.ok(degrau.exemplo.includes('\n'));
    assert.equal(typeof degrau.conferir, 'function');
  }
});
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade-melhorias.test.js`  
Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implementar os cinco degraus com laços explícitos**

O código final deve usar `json`, `with open(caminho, 'w', encoding='utf-8')`, `try/except FileNotFoundError`, e `dicionario = { 'titulo': livro.titulo, 'autor': livro.autor, 'genero': livro.genero, 'quantidade_disponivel': livro.quantidade_disponivel }` dentro de `for`, além de reconstrução por argumentos explícitos. Não usar compreensão, `vars` ou `Livro(**dados)` antes de explicá-los.

- [ ] **Step 4: Implementar conferência de ida e volta**

A sonda cria diretório/arquivo temporário do ambiente Python, chama `salvar_livros`, substitui `livros` por `[]`, chama `carregar_livros`, busca `dom casmurro` e devolve JSON com quantidade, título e gêneros. Executar duas vezes deve continuar com quatro itens.

- [ ] **Step 5: Criar teste no Pyodide real**

O script Playwright abre um worker novo para cada caso e valida:

```js
assert.deepEqual(resultado.valor, {
  quantidade: 4,
  titulo: 'Dom Casmurro',
  generos: ['Romance', 'História', 'Ciência'],
});
```

Também testar arquivo inexistente (`[]`), UTF-8 e segunda execução sem duplicação. Registrar `test:melhoria-u2` no `package.json`.

- [ ] **Step 6: Integrar como “Evolua seu projeto”, separado da entrega concluída**

Em `FaculdadeEntrega.jsx`, mostrar a seção apenas quando houver feedback aplicável. Cabeçalho: “Sugestão do mediador · não altera sua entrega enviada”. Não marcar passos oficiais, não dar XP e não substituir o código ou a conquista salvos.

- [ ] **Step 7: Confirmar GREEN**

Run: `node --test tests/faculdade-melhorias.test.js && npm run test:melhoria-u2`  
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/faculdade-melhorias.js src/FaculdadeEntrega.jsx src/faculdade-entrega.css tests/faculdade-melhorias.test.js scripts/check-faculdade-melhoria-u2.mjs package.json
git commit -m "feat: ensinar persistência na evolução da biblioteca"
```

---

### Task 7: Interface integrada de preparo, recuperação e feedback

**Files:**
- Create: `src/FaculdadePreparo.jsx`
- Create: `src/faculdade-preparo.css`
- Create: `src/FaculdadeFeedback.jsx`
- Create: `src/faculdade-feedback.css`
- Modify: `src/Faculdade.jsx`
- Modify: `src/FaculdadeRevisao.jsx`
- Modify: `src/App.jsx`
- Create: `scripts/check-faculdade-preparo-feedback.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `planoDePreparo`, `registrarFeedback`, metadados `destino`, navegação existente.
- Produces: cartão compacto com fase/cobertura/ações; formulário editável de feedback; navegação de recuperação com retorno à sessão.

- [ ] **Step 1: Escrever teste de navegador que falha no estado pós-27/09**

O script injeta relógio `2026-09-28`, estado com aulas pendentes e abre `?tab=faculdade`. Deve localizar “Período de revisão”, não encontrar `/Infinity|NaN/`, ver três ações ou menos e abrir o simulado acadêmico pelo CTA.

- [ ] **Step 2: Executar e observar RED**

Run: `PYCAMPUS_TEST_URL=http://127.0.0.1:5178/ node scripts/check-faculdade-preparo-feedback.mjs`  
Expected: FAIL porque o cartão e o relógio injetável ainda não existem.

- [ ] **Step 3: Implementar cartão de preparo e nomes distintos**

Renderizar fase, quatro métricas de cobertura e `acoes`. Renomear o fluxo geral para “Recall prático de código”. Na Faculdade usar “Simulado da prova de 30/09” até a data e “Simulado da disciplina” depois.

- [ ] **Step 4: Implementar recuperação com retorno**

Ao clicar “Rever este conceito”, salvar `{ questaoId, indice, respostas }` em estado efêmero do componente, navegar pelo `destino`, e exibir “Voltar ao simulado” na atividade. Destino ausente mantém a tela e mostra `role="alert"` sem apagar respostas.

- [ ] **Step 5: Implementar formulário do mediador**

Campos: entrega, disciplina, nota, data, comentário e itens editáveis com tipo. Pré-carregar o caso U2 somente por ação explícita “Registrar o retorno recebido”; não embutir o PDF ou o RA. Exibir entrega original e melhoria em blocos separados.

- [ ] **Step 6: Ampliar o teste de navegador**

Cobrir: erro proposital → explicação → destino U2 → retorno com resposta preservada; cadastro da nota 85 → reload → feedback presente → entrega oficial inalterada → módulo JSON disponível; viewport 390×844 sem overflow e botões ≥44 px.

- [ ] **Step 7: Confirmar GREEN**

Run: `PYCAMPUS_TEST_URL=http://127.0.0.1:5178/ npm run test:preparo-feedback`  
Expected: PASS sem `pageerror` ou overlay do Vite.

- [ ] **Step 8: Commit**

```bash
git add src/FaculdadePreparo.jsx src/faculdade-preparo.css src/FaculdadeFeedback.jsx src/faculdade-feedback.css src/Faculdade.jsx src/FaculdadeRevisao.jsx src/App.jsx scripts/check-faculdade-preparo-feedback.mjs package.json
git commit -m "feat: integrar preparação e feedback na Faculdade"
```

---

### Task 8: Transparência editorial e documentação

**Files:**
- Modify: `src/Faculdade.jsx`
- Modify: `README.md`
- Modify: `docs/faculdade/roteiro-entregas.md`
- Modify: `tests/faculdade.test.js`

**Interfaces:**
- Consumes: `exerciciosDaFaculdade[].recebido`, datas exportadas.
- Produces: contagem derivada “15 questões recebidas do AVA + 5 treinos da apostila” e documentação coerente.

- [ ] **Step 1: Escrever teste falhando para procedência**

```js
test('procedência das questões é derivada dos exercícios', () => {
  assert.deepEqual(resumoDaProcedencia(), { recebidas: 15, treinos: 5 });
});

```

- [ ] **Step 2: Confirmar RED**

Run: `node --test tests/faculdade.test.js`  
Expected: FAIL porque `resumoDaProcedencia` ainda não existe.

- [ ] **Step 3: Implementar textos derivados e documentação**

Exportar `resumoDaProcedencia()` a partir de `exerciciosDaFaculdade`. Trocar “20 tarefas do professor” por contagem transparente. Alterar o título README para “Trabalhos da faculdade até 17/10/2026” e manter tabela separando as três datas.

- [ ] **Step 4: Confirmar GREEN**

Run: `node --test tests/faculdade.test.js && npm run auditar:ementa && npm run auditar:progressao-faculdade`  
Expected: PASS e 79/79 assuntos cobertos.

- [ ] **Step 5: Registrar a decisão sobre a auditoria de perguntas**

Não alterar `banco/construcao-2`: a pergunta atual já cita o histórico e pergunta em que ponto o registro ocorre. Documentar no resultado da sprint que `auditar:perguntas` é ferramenta de leitura e esse alerta específico é falso positivo, como já explica `src/project-coaching.js`.

- [ ] **Step 6: Commit**

```bash
git add src/Faculdade.jsx README.md docs/faculdade/roteiro-entregas.md tests/faculdade.test.js
git commit -m "docs: alinhar prazos, procedência e feedback pedagógico"
```

---

### Task 9: Verificação completa, revisão e publicação

**Files:**
- Modify: `VERIFICACAO.md`
- Modify: `docs/superpowers/specs/2026-09-24-sprint-1-preparacao-e-feedback-design.md`

**Interfaces:**
- Consumes: todos os módulos e scripts das Tasks 1–8.
- Produces: evidência reproduzível da sprint, branch revisada e produção publicada.

- [ ] **Step 1: Executar testes rápidos e auditorias**

```powershell
npm test
npm run auditar:ementa
npm run auditar:progressao-faculdade
npm run test:degraus-faculdade
npm run test:ensino-projetos
```

Expected: zero falhas; ementa 79/79; 16 aulas, 4 unidades e 4 entregas aprovadas.

- [ ] **Step 2: Executar verificações reais no servidor isolado**

Terminal A:

```powershell
npm run dev -- --port 5178 --strictPort
```

Terminal B:

```powershell
$env:PYCAMPUS_TEST_URL='http://127.0.0.1:5178/'
npm run test:faculdade
npm run test:entregas-faculdade
npm run test:melhoria-u2
npm run test:preparo-feedback
npm run test:iniciante
npm run test:visual
npm run test:abas
```

Expected: programas Python, jornadas, desktop e celular aprovados; nenhum erro de página.

- [ ] **Step 3: Build idêntico ao GitHub Pages**

```powershell
$env:PYCAMPUS_BASE='/pycampus/'
npm run build
npm run test:bundle
npm audit --omit=dev
```

Expected: build concluído, bundle dentro do limite e zero vulnerabilidades reportadas.

- [ ] **Step 4: Solicitar revisão independente do diff**

Revisor somente leitura compara o merge-base com HEAD contra os 12 critérios do spec. Corrigir todo achado Critical ou Important com novo teste RED→GREEN e repetir Steps 1–3.

- [ ] **Step 5: Registrar evidência**

Em `VERIFICACAO.md`, registrar comandos, contagens, data, limitações honestas e screenshots temporários usados. Marcar o spec com seção “Estado implementado em 24/09/2026”, sem alterar requisitos históricos.

- [ ] **Step 6: Commit final de evidência**

```bash
git add VERIFICACAO.md docs/superpowers/specs/2026-09-24-sprint-1-preparacao-e-feedback-design.md
git commit -m "docs: registrar validação da sprint acadêmica"
```

- [ ] **Step 7: Integrar e publicar**

Confirmar `git status --short` vazio, integrar a branch de sprint em `main` sem reescrever histórico, executar `git push origin main` e acompanhar o workflow `Publicar no GitHub Pages` até sucesso.

- [ ] **Step 8: Validar produção**

Abrir `https://jaoabyo.github.io/pycampus/?tab=faculdade` com cache limpo, confirmar o cartão de preparação, a versão publicada e o fluxo U2. Não considerar deploy concluído somente pelo status do workflow.

- [ ] **Step 9: Reiniciar o ciclo**

Executar nova auditoria somente leitura de pedagogia, UX/acessibilidade e arquitetura. Criar backlog priorizado da Sprint 2, começando pelos P1 de drawer/foco SPA, contraste, busca e Lumi encontrados em 24/09/2026.
