# Conteúdo · Projetos

Oito projetos, 53 passos no total. O estúdio (`src/ProjectStudio.jsx`) tem **duas fases**:

1. **Construir** — passo a passo, com editor e conferência.
2. **Entregar e receber a nota** — README, publicação no GitHub e [[Lumi · Avaliação de projeto]].

Eram uma tela rolável só, e confundia.

## Onde os passos moram

| Arquivo | Papel |
| --- | --- |
| `src/project-coaching.js` | a tarefa em português e a pergunta de compreensão |
| `src/project-workshops.js` | a sintaxe, que vira a **segunda pista** |
| `src/project-steps.js` | junta tudo e acrescenta a calculadora |

A técnica: **a tarefa aparece primeiro; a sintaxe só depois de pedir uma pista.**

> [!warning] Cruzamento por índice
> `coachedProjects` casa os dois arquivos **pela posição**. Inserir um passo no meio
> desalinha tudo, e há remendos por índice (`coachedProjects.estoque[0]...`). Projetos já
> renivelados — `quiz` e `tarefas` — substituem o array inteiro com o helper `coachStep`,
> mantendo os ids antigos para não perder anotações salvas. **Siga esse padrão.**

## Passos com número de passos por projeto

`calculadora` 7 · `quiz` 11 · `tarefas` 10 · `banco` 10 · `estoque` 9 · `api` 7 ·
`qualidade-projeto` 7 · `final` 9. Total: 70.

Todos passaram pelo nivelamento: nenhum passo exige sintaxe que não tenha sido ensinada antes.

## Modos de passo

- `browser` — roda no Pyodide.
- `local` — servidor no computador do estudante; a plataforma **não** verifica.
- `plan` — planejamento escrito.

Relacionado: [[Liberação de etapas]] · [[Lumi · Avaliação de projeto]] · [[Regras que não se quebram]]
