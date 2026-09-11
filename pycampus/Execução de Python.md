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
