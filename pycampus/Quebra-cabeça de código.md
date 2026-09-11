# Quebra-cabeça de código

Problema de Parsons: a solução vem embaralhada em blocos e o estudante monta a ordem e a
indentação. Apoio **opcional** em toda atividade com código.

- `src/parsons.js` — a lógica genérica: `toBlocks`, `shuffledPieces`, `puzzleSolved`.
- `src/ParsonsPuzzle.jsx` — a tela.
- `src/lesson-puzzles.js` — as soluções das aulas.

## Regras

- Uma peça a mais, que é um **engano comum** daquele assunto, e não entra na solução.
- O embaralhamento é estável por item: o mesmo quebra-cabeça reaparece igual, mas nunca já resolvido.
- Só conta como resolvido com ordem **e** indentação corretas.
- **Não vale XP.** Montar mostra que reconhece a ordem; escrever do zero mostra que lembra.

> [!note] A aula `ola` não tem quebra-cabeça
> Ela tem uma linha só: ordenar um bloco único seria um chute entre duas opções.
> `tests/lesson-puzzles.test.js` fixa essa exceção, para nenhuma outra ficar de fora por descuido.

> [!important] As soluções são conferidas contra as de teste
> Os blocos precisam reconstruir exatamente a solução de referência que já roda no Pyodide.
> Se alguém mudar uma e esquecer a outra, o teste quebra.

Relacionado: [[Conteúdo · Aulas]] · [[Regras que não se quebram]]
