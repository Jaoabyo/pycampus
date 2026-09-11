# Estado e progresso

Tudo que o estudante conquista vive num único objeto, salvo em `localStorage` na chave
`pycampus.v1`. O arquivo é `src/progress.js`.

## O que é guardado

| Campo | O que é |
| --- | --- |
| `completed` | ids das aulas concluídas |
| `codes`, `projectCodes`, `playground` | código escrito, por aula e por projeto |
| `learning` | tudo dos miniprojetos: previsão, notas, respostas, etapas passadas, revisão |
| `functionBridges` | código e resposta de cada ponte |
| `projectStepsDone`, `projectNotes`, `projectChecks`, `projectLinks`, `projectGrades` | projetos |
| `customLessons` | lições escritas pelo Lumi, já verificadas |
| `mastery` | domínio dos padrões do [[Diário e diagnóstico]] |
| `history` | o diário de execuções (máximo 150) |
| `activities` | o que foi feito em cada dia — alimenta o fogo (sequência) |
| `sessions`, `goal`, `weeklyGoal`, `name`, `avatar`, `bio` | agenda e perfil |

## `normalizeState` é a fronteira

Todo estado que entra — do `localStorage` ou de um backup importado — passa por
`normalizeState`. Ela descarta o que não reconhece, corta tamanhos e **recalcula o que não
pode ser confiado**.

> [!danger] Nunca confie num campo que concede progresso
> A aprovação de projeto é recalculada da nota (`nota >= 7`), não lida do campo `aprovado`.
> Um backup editado à mão não consegue conceder 250 XP. Qualquer campo novo que libere algo
> precisa do mesmo tratamento.

## XP e emblemas

```
xpTotal = aulas × 100 + projetos × 250 + miniprojetos × 40
```

- Aula conta quando está em `completed` — o que exige desafio com a saída certa **e** revisão correta.
- Miniprojeto conta por `practiceDone`: prova certa + etapas "Mude" e "Crie" com a saída esperada.
- Projeto conta por `doneProjects`: autoavaliação completa **ou** nota do Lumi ≥ 7.
- Emblemas (`badges`) são funções que leem o estado. Não há emblema "dado" por outra via.

> [!note] O que nunca vale XP
> Montar o [[Quebra-cabeça de código]], gerar uma [[Lumi · Lições personalizadas|lição do Lumi]]
> e receber uma [[Lumi · Leitura de explicações|leitura de explicação]]. São apoio, não conquista.

Relacionado: [[Liberação de etapas]] · [[Regras que não se quebram]] · [[Testes · o que cada um protege]]
