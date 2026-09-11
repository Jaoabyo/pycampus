# PyCampus — sprints de melhoria

Prioridade por impacto no aprendizado, não por esforço. Cada sprint termina com testes
verdes, verificação em navegador (1440 px e 390 px) e uma linha em `VERIFICACAO.md`.

O site publicado fica em **https://jaoabyo.github.io/pycampus/** e é atualizado sozinho a
cada envio para `main`, depois que a suíte de testes passa.

---

## Sprint 1 · Estudar no celular sem perder nada

O que motiva: o campus agora é usado em dois aparelhos, e cada um guarda o progresso só no
próprio navegador. Hoje isso significa duas jornadas separadas, sem aviso nenhum.

- Levar o progresso de um aparelho para o outro sem depender de arquivo: código curto de
  transferência, ou QR lido pelo celular, a partir do backup que já existe.
- Avisar na tela quando o progresso do aparelho está atrás do último backup conhecido.
- Instalar como aplicativo (PWA) com ícone na tela inicial.
- Guardar o Pyodide para uso offline, para estudar sem internet depois do primeiro carregamento.
- Revisar toque e alvos de clique nas telas mais usadas no celular.

## Sprint 2 · O Lumi também no celular

O que motiva: no computador o Lumi conversa; no celular ele fica mudo, porque a IA roda em
`localhost`. As dicas escritas continuam valendo, mas o apoio some justo onde o estudante
está sozinho.

- Endereço do Ollama configurável, para o celular falar com o computador na mesma rede.
- Teste de conexão na tela de configurações, com instrução do que fazer quando falha.
- Deixar explícito em cada tela o que funciona sem IA — hoje o aviso só aparece no painel do Lumi.

## Sprint 3 · Nivelar os cinco projetos que faltam

O que motiva: a auditoria confirmou 21 saltos de dificuldade, 14 deles graves, todos em
projetos que ainda pedem sintaxe nunca ensinada. `tests/project-levelling.test.js` já impede
que piorem, e a lista de dívida nomeia cada um.

- `banco`: `__init__` com atributos padrão, `raise ValueError` e método que recebe outro objeto.
- `estoque`: banco em arquivo, `IF NOT EXISTS`, `commit()` e `fetchall()` — nenhum deles aparece
  em código executado nas aulas.
- `api`: migração para SQLite com `UPDATE` e `DELETE` no mesmo passo.
- `qualidade-projeto`: extrair regra do próprio código e funções `test_`.
- `final`: quatro etapas de fluxo sobre um problema sem roteiro.

Cada projeto segue o padrão já usado em `quiz` e `tarefas`: manter os ids originais e as
anotações salvas, intercalando os degraus que faltavam.

## Sprint 4 · Verificar o resto da auditoria

O que motiva: das seis frentes auditadas, só "projetos" foi verificada até o fim. As outras
cinco pararam por limite de sessão e seguem como achados brutos — não confirmados e também
não descartados.

- Rodar a verificação das frentes miniprojetos, aulas, gating, pesquisa e visual.
- Confirmar ou descartar cada achado, com o mesmo rigor da frente de projetos.

## Sprint 5 · Ver o programa pensando

O que motiva: é a maior lacuna pedagógica que a pesquisa apontou e que ainda não existe aqui.
Ler o código não mostra o que acontece na memória; ver os valores mudando mostra.

- Execução passo a passo mostrando variáveis mudando de valor, no estilo do Python Tutor.
- Começar pelas aulas de laço e condição, onde a ordem de execução é o que mais confunde.

## Sprint 6 · Cobrar o que a prova cobra

O que motiva: o objetivo é fluência de prova — escrever sem consultar e explicar em voz alta.
As revisões de aula ainda são múltipla escolha, que aceita reconhecer no lugar de lembrar.

- Perguntas de resposta livre nas revisões, corrigidas pela comparação de saída quando são código.
- Um modo "prova": sem pistas, sem quebra-cabeça, com tempo, relatando o que falhou.
- Mais miniprojetos nas etapas de web, engenharia de software e avançado, hoje sem prática curta.
