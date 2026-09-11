# Testes · o que cada um protege

`npm test` roda 20 arquivos. Eles não existem por ritual: cada um guarda uma regra que já foi
quebrada uma vez.

| Arquivo | O que impede |
| --- | --- |
| `visible-glossary` | exemplo usar função sem explicação visível; pergunta cobrar o que não foi mostrado |
| `project-levelling` | passo de projeto exigir função nunca ensinada; mantém a lista de dívida |
| `curriculum-review` | pré-requisito fora de ordem; passo comentado citando código que não existe |
| `lesson-puzzles` | blocos que não reconstroem a solução verificada no Pyodide |
| `practice-content` | miniprojeto malformado; previsão avaliada errado; XP farmável |
| `progression` | etapa abrir sem os requisitos; progresso salvo burlar a ordem |
| `progress` | XP, emblemas e normalização de backup |
| `mentor` | **o Lumi vazar código nos degraus 1 e 2** |
| `project-grading` | aprovação sem nota; backup forjado conceder XP; fatos medidos |
| `custom-lesson` | lição sem partes; vocabulário não ensinado; enunciado apontando para código inexistente |
| `explanation-review` | leitura vazia ou sem limite de tamanho |
| `icons` | nome de ícone inexistente, que falha em silêncio |
| `function-bridges`, `project-steps`, `project-coaching` | forma e integridade do conteúdo |
| `diagnosis`, `history` | leitura do diário e regras de domínio |
| `celebrations`, `feedback`, `additional-practices`, `calculator-reference` | apoio |

## Além dos testes de unidade

- `scripts/check-curriculum-browser.mjs` executa os 48 exemplos e as 48 soluções no **Pyodide real**.
- `scripts/check-guided-projects.mjs` percorre o fluxo guiado no navegador.
- Verificações de jornada e de tela ficam registradas em `VERIFICACAO.md`.

> [!important] A publicação depende dos testes
> O workflow roda `npm test` antes de construir. Teste vermelho não vai para o ar.
> Ver [[Publicação e hospedagem]].

Relacionado: [[Regras que não se quebram]]
