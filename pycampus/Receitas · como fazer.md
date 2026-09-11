# Receitas · como fazer

## Mudar o exemplo de uma aula

1. Veja se há um `edit('id', ...)` em `src/curriculum-review.js` — **ele vence** `curriculum.js`.
2. Mudou o exemplo? Toda função nova precisa entrar em `simpleExplanations` ou `beginnerNotes`.
3. Mudou a solução? Atualize `tests/curriculum-solutions.js` **e** `src/lesson-puzzles.js`.
4. `npm test` e, para conteúdo Python, `npm run test:curriculum`.

## Acrescentar um passo a um projeto

Não insira no meio dos arrays: eles cruzam **por índice** e há remendos posicionais.
Siga o padrão de `quiz` e `tarefas` — substituir o array inteiro com `coachStep`, mantendo os
ids antigos para preservar anotações salvas. Ver [[Conteúdo · Projetos]].

## Criar um campo novo no progresso

1. `initialState()` em `src/progress.js`.
2. Sanitização em `normalizeState` — cortando tamanho e **recalculando** o que libera algo.
3. Teste em `tests/progress.test.js` provando que um backup forjado não concede nada.
Ver [[Estado e progresso]].

## Acrescentar um ícone

Exporte o nome em `src/icons.js`. Nome ausente cai no desenho genérico **sem erro**;
`tests/icons.test.js` pega isso.

## Criar um aviso com ícone e texto

Esses parágrafos são `display:flex`. Coloque o texto dentro de um `<span>`, senão cada
`<strong>` vira uma coluna e a frase se parte.

## Mexer em qualquer tela

Depois, confira em 390 px **medindo** `scrollWidth - clientWidth`. Ver [[Regras que não se quebram]].

## Publicar

`git push` para `main`. O resto é automático. Ver [[Publicação e hospedagem]].
