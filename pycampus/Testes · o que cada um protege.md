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

## Conferência do código, e não só da saída (set/2026)

- `requisitos-em-tudo.test.js` — a solução guardada de cada miniprojeto e de cada ponte cumpre o
  que aquele exercício cobra; as quatro telas que executam código do estudante oferecem a
  leitura do Lumi; as telas internas da App são chamadas, não montadas.
- `solucoes-alternativas.test.js` — para cada aula com requisito existe uma segunda solução, com
  outros nomes e outra abordagem, e ela é aceita igual. É a prova de que a conferência não exige
  formato. Se algum requisito recusar um caminho legítimo, este teste falha e o requisito sai.
- `desafio-exige-trabalho.test.js` — nenhum desafio é resolvido devolvendo a entrada sem
  transformar. Uma exceção nomeada: `calculadora/pergunta`, onde ecoar é a tarefa.
- `conteudo-executavel.test.js` — a etapa Criar nunca espera a saída que já está na tela, toda
  solução guardada roda sozinha, e erro em esqueleto com `pass` explica que falta escrever o corpo.
- `degrau-pedagogico.test.js` — nenhum desafio exige técnica que nem a aula nem uma anterior
  mostrou. A regra era conferida a olho; agora é medida.
- `entrada-preparada.test.js` — todo conteúdo que manda responder algo declara a resposta.
- `endereco-por-link.test.js` — `?ia=` só aceita https ou o próprio computador, e só a origem.
- `mistura-http.test.js` — página https com Ollama http nem tenta: responde na hora.
- `liberacao-do-lumi.test.js` — aprovação dada pelo Lumi fica registrada e sai no relatório.

Fora da suíte, contra o navegador: `npm run test:curriculum` (143 programas no Python real) e
`npm run test:isolamento` (o input() perguntando durante a execução num servidor igual ao Pages).
