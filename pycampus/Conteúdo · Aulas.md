# Conteúdo · Aulas

48 aulas em 8 etapas. Uma aula tem quatro passos: **ideia → exemplo → desafio → revisão**.

## Onde cada parte mora

| Arquivo | O que guarda |
| --- | --- |
| `src/curriculum.js` | a definição original de cada aula: teoria, exemplo, desafio, saída esperada, pergunta de revisão |
| `src/curriculum-review.js` | **sobrescreve** campos de aulas já definidas |
| `src/simple-explanations.js` | a explicação em linguagem do dia a dia e o glossário visível |
| `src/lesson-guides.js` | o passo a passo comentado do exemplo |
| `src/lesson-puzzles.js` | a solução que vira [[Quebra-cabeça de código]] |

> [!danger] O que o estudante vê não está em `curriculum.js`
> `curriculum-review.js` roda por cima e pode ter trocado o exemplo. Antes de concluir que
> uma aula ensina X, confira se há um `edit('id', ...)` para ela. Uma auditoria já se enganou
> por isso: o exemplo de lista de dicionários tinha sido substituído.

## A regra mais importante

Toda função chamada num exemplo precisa estar explicada **no texto visível sem clique** —
`simpleExplanations` ou `beginnerNotes` — da própria aula ou de uma anterior.

Isso não é gosto: o estudante encontrou `sum()` num exemplo, não achou explicação e precisou
perguntar fora da plataforma. `tests/visible-glossary.test.js` impede que volte a acontecer.

> [!note] Explicação atrás de clique não conta
> Estava dentro de "Ver a explicação completa", recolhido. Para o teste e para a regra, isso
> é o mesmo que não existir.

## Para mudar uma aula

Ver a receita em [[Receitas · como fazer]].

Relacionado: [[Regras que não se quebram]] · [[Conteúdo · Oficina de prática]] · [[Testes · o que cada um protege]]
