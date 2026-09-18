# Dívidas conhecidas

O que está reconhecido e ainda não resolvido.

> [!done] Nivelamento dos projetos: pago
> Os 21 saltos confirmados pela auditoria foram corrigidos. Os oito projetos passam por
> `tests/project-levelling.test.js`, e a lista de dívida dele está vazia. O plano por sprints fica em `ROADMAP.md`,
na raiz do projeto.

## Auditoria: o que ficou em aberto

As seis frentes foram verificadas. O que sobrou não é dúvida, é trabalho nomeado:

- **Distância entre exemplo e desafio em algumas aulas.** O `while` conta para baixo no
  exemplo e para cima no desafio; `complexidade` mostra busca com `return` e pede contador
  acumulado; `validacao` só lança a exceção e o desafio pede lançar e capturar. A regra da
  explicação visível está cumprida — isto é sobre a ponte entre ler e escrever.
- **As pontes de função não têm etapa de previsão** antes de rodar, nem auto-explicação
  escrita, e o estudante não testa o retorno da própria função com `assert` antes do módulo 07.

## Progresso preso ao aparelho

Estudar no celular e no computador cria duas jornadas separadas. Hoje só o backup manual
transfere. Ver [[Publicação e hospedagem]].

> [!done] O Lumi alcança o celular: pago
> Ollama com `qwen2.5-coder:14b` no computador e um túnel HTTPS do Cloudflare. O endereço é
> configurável em Configurações. Ver [[Lumi no celular]].

> [!done] Visualizador de execução: pago
> O Laboratório Python mostra a execução passo a passo.

## src/App.jsx foi reformatado

Uma sessão anterior passou um formatador no arquivo: 416 → 2273 linhas. Ele passa em todos os
testes e no build, mas destoa do estilo denso do resto do código e deixa barulhento qualquer
diff futuro daquele arquivo. Desfazer isso é cirurgia sobre código que funciona; fica anotado
para quando não houver prova por perto.

## Revisões ainda são múltipla escolha

Reconhecer é mais fácil que lembrar. O objetivo é fluência de prova.

Relacionado: [[Estado atual · auditoria]] · [[Regras que não se quebram]] · [[Conteúdo · Projetos]]
