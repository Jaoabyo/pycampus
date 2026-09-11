# Arquitetura

React 19 + Vite 7, sem servidor. O navegador carrega a aplicação, executa Python num Web
Worker e guarda o progresso no `localStorage` sob a chave `pycampus.v1`.

## Camadas

**Dados (`.js`)** — conteúdo e regras puras, sem React. É aqui que quase toda mudança de
conteúdo acontece, e é o que os testes cobrem.

**Telas (`.jsx`)** — só montagem e interação. Quando uma tela começa a decidir regra, a regra
deveria ter ido para um `.js` testável.

**Estilos (`.css`)** — um arquivo por área, importado pelo componente que o usa.

## Ponto de entrada

`src/main.jsx` → `src/App.jsx`. O `App.jsx` guarda o estado inteiro e decide qual página
mostrar. Cada aba da barra lateral é um componente:

| Aba | Componente |
| --- | --- |
| Visão geral | `Dashboard` (dentro de `App.jsx`) |
| Minha formação | `Course` e `LessonView` (dentro de `App.jsx`) |
| Oficina de prática | `PracticeStudio.jsx` |
| Projetos | `Projects` e `ProjectStudio.jsx` |
| Laboratório Python | `Playground` (dentro de `App.jsx`) |
| Treino dirigido | `TargetedPractice.jsx` |
| Diário de aprendizagem | `HistoryView.jsx` |

## Peças compartilhadas

- `CodeEditor.jsx` — o único editor da plataforma. Aula, laboratório, oficina, ponte, projeto
  e lição do Lumi usam este mesmo componente. Mudou o editor, mudou em todo lugar.
- `useTrackedPython.js` — o `usePython`, que fala com o worker. Ver [[Execução de Python]].
- `RunFeedback.jsx` — leitura de erro, comparação de saída e dicas de estilo.
- `ui.jsx` — `Icon` e `Progress`. Os ícones vêm de `icons.js`, que é uma lista curada.
- `Mentor.jsx` — o Lumi. Ver [[Lumi · Como ele ajuda]].

> [!warning] Ícone que não existe falha em silêncio
> `Icon` cai no desenho genérico quando o nome não está em `icons.js`, sem erro nenhum.
> `tests/icons.test.js` existe exatamente por causa disso.

## Por que tudo no navegador

Sem servidor não há conta, não há custo, não há dado seu saindo da máquina — e a plataforma
abre com um duplo clique. O preço é que o progresso é de cada aparelho. Ver [[Dívidas conhecidas]].

Relacionado: [[Estado e progresso]] · [[Publicação e hospedagem]] · [[Regras que não se quebram]]
