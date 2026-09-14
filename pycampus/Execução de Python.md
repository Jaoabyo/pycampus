# Execução de Python

Python roda de verdade no navegador, via **Pyodide** carregado de CDN dentro de um Web Worker.

- `public/python-worker.js` — o worker. Carrega o Pyodide, executa o código e devolve a saída.
- `src/useTrackedPython.js` — o hook `usePython`, que conversa com o worker.

## Como usar

```js
const python = usePython({ source: 'lesson', title: 'Aula X', expected: '42', onRecord: ... });
python.run(codigo, entradas, resultado => { /* resultado.ok, resultado.output */ });
```

- `expected` e `onRecord` servem ao [[Diário e diagnóstico]]. Sem `onRecord`, a execução não
  é registrada — é assim que a verificação de [[Lumi · Lições personalizadas]] roda sem sujar
  o diário do estudante.
- Limite de 15 s por execução e 90 s para carregar o ambiente.
- O callback de `run` também recebe interrupções, falhas de ambiente e timeout, uma única vez.
  Assim, uma lição do Lumi aguardando a conferência do Python não fica numa Promise pendente.

## Interface conferida em 14/09/2026

- O selo de acerto do editor só corresponde ao código e ao resultado que o geraram. Editar,
  iniciar outra execução ou receber um erro esconde a celebração anterior.
- Retomar um projeto sem isolamento prepara as entradas do passo salvo, não do primeiro passo.
- Pontes, treino dirigido e lições do Lumi que passam `stdin` automaticamente dizem isso na tela.
- Na hospedagem estática, o service worker tenta acrescentar os cabeçalhos de isolamento.
  `scripts/check-published-study.mjs` confirmou a pergunta interativa após a recarga, sem os
  cabeçalhos do Vite. Navegadores sem esse suporte continuam usando entradas preparadas.

## O detalhe que mais causa bug

`input()` funciona de dois jeitos:

1. **Respostas preenchidas antes** (parâmetro `entradas`, uma por linha). Funciona em qualquer lugar.
2. **Respondendo durante a execução**, o que exige `SharedArrayBuffer` e portanto os cabeçalhos
   `Cross-Origin-Opener-Policy` e `Cross-Origin-Embedder-Policy`. O Vite envia; o GitHub Pages
   **não**. Ver [[Publicação e hospedagem]].

> [!danger] O prompt do input não pula linha
> `input("Cor? ")` seguido de `print(cor)` produz `Cor? azul` numa linha só, não duas.
> Ao escrever qualquer `expected` de código com `input`, **execute no Pyodide antes** em vez
> de deduzir a saída. Já tornou um exercício impossível de completar.

> [!warning] Caminho do worker
> O worker é carregado de `` `${import.meta.env.BASE_URL}python-worker.js` ``. Com caminho
> absoluto ele some quando o site vive num subcaminho como `/pycampus/`.

Relacionado: [[Arquitetura]] · [[Regras que não se quebram]] · [[Publicação e hospedagem]]

## Visualizador passo a passo

O mesmo worker atende um segundo modo. Com `{ trace: true }`, em vez de executar e devolver a
saída, ele roda o programa sob `sys.settrace` e devolve o **rastro**: para cada linha
percorrida, quais variáveis existiam e o que já tinha sido impresso até ali.

- `src/trace.js` — `tracePython(code, stdin)`, com worker próprio e descartável, para a
  visualização nunca entrar no [[Diário e diagnóstico|diário de tentativas]].
- `src/Visualizador.jsx` — a tela: linha atual destacada, variáveis do momento (as que
  mudaram ficam em amarelo), saída parcial e controles de passo.

O arquivo é compilado com o nome `<visualizador>` justamente para o rastreador ignorar tudo
que não é código do estudante. O limite é de 400 passos; acima disso a tela avisa que mostra
só o começo, em vez de travar o navegador.

Aparece no passo 2 de cada aula e no Laboratório.
