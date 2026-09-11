# Publicação e hospedagem

**Online: https://jaoabyo.github.io/pycampus/** · repositório `Jaoabyo/pycampus`.

`.github/workflows/pages.yml` publica a cada envio para `main`: instala, **roda os testes**,
constrói com `PYCAMPUS_BASE=/pycampus/` e envia para o GitHub Pages.

## O que muda no site publicado

| | No computador (`npm run dev`) | No site publicado |
| --- | --- | --- |
| Conversa com o Lumi | sim | **não** — a IA vive em `localhost` |
| Dicas escritas do Lumi | sim | sim |
| Python | sim | sim |
| `input()` durante a execução | sim | **não** — preencher antes |
| Progresso | deste navegador | deste aparelho |

## Por que o `input()` interativo não funciona lá

Responder durante a execução exige `SharedArrayBuffer`, que exige os cabeçalhos
`Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp`.
O GitHub Pages não permite cabeçalhos próprios. `CodeEditor.jsx` detecta
`crossOriginIsolated` e troca o texto do campo de entradas.

Para ter o interativo online, seria preciso um provedor que envie esses cabeçalhos —
`public/_headers` já atende os que reconhecem esse formato.

> [!warning] Subcaminho quebra caminho absoluto
> O site vive em `/pycampus/`, não na raiz. O worker do Python é carregado de
> `import.meta.env.BASE_URL`. Qualquer recurso novo precisa do mesmo cuidado.

Relacionado: [[Execução de Python]] · [[Lumi · Como ele ajuda]] · [[Dívidas conhecidas]]
