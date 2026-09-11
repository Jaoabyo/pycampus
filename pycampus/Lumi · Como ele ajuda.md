# Lumi · Como ele ajuda

O Lumi é um vaga-lume: **ilumina o caminho, não caminha por você**. É o mascote e a IA local
da plataforma.

- `src/mentor.js` — a lógica: degraus, prompt, trava, cliente do Ollama.
- `src/Mentor.jsx` — o painel, o desenho (`LumiArt`) e o vaga-lume que atravessa a tela (`FlyingLumi`).

## A escada de quatro degraus

| Degrau | O que revela |
| --- | --- |
| 1 | uma pergunta para você olhar no lugar certo — **sem código** |
| 2 | a ideia por trás do erro — **sem código** |
| 3 | o caminho em palavras, no máximo duas linhas de exemplo |
| 4 | o código corrigido e o porquê |

> [!danger] A trava está no código, não no prompt
> `sanitizeReply` **apaga** blocos de código das respostas dos degraus 1 e 2 e limita o
> degrau 3 a duas linhas. O modelo desobedece instruções; esta função não. Nunca enfraqueça
> isso sem pedido explícito.

## Ajuda que funciona sem IA nenhuma

`localHelp` devolve, para cada degrau, um texto escrito e revisado a partir de
`src/error-guide.js`. Com o Ollama desligado o painel continua útil — e avisa o motivo.
**A IA é melhoria, nunca dependência.**

## Ele aparece sozinho

Na terceira execução seguida sem sair do lugar. A contagem (`attempts`) vem de fora do
componente de propósito: durante cada execução o painel é desmontado, e um contador interno
zeraria.

## O que ele só pode usar

`taughtUpTo(lessonId)` limita o prompt aos assuntos já estudados. Sem isso ele "ajuda" com
list comprehension na terceira aula.

## Onde ele está

Aulas, miniprojetos, pontes de função e estúdio de projeto. Mais: [[Lumi · Avaliação de projeto]],
[[Lumi · Lições personalizadas]] e [[Lumi · Leitura de explicações]].

## Requisitos

Ollama aberto, modelo `qwen2.5-coder:14b` (≈9 GB, roda na GPU). O primeiro carregamento leva
cerca de um minuto — por isso existe `warmMentor` e `keep_alive: 30m`.

> [!warning] No site publicado ele não conversa
> A IA vive no computador, em `localhost`. Ver [[Publicação e hospedagem]].

Relacionado: [[Regras que não se quebram]] · [[Decisões e por quês]]
