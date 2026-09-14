# Conteúdo · Oficina de prática

35 miniprojetos em `src/practice-content.js`. Tela: `src/PracticeStudio.jsx`.

## As cinco etapas (método PRIMM)

1. **Preveja** — escreva o que vai aparecer, antes de executar.
2. **Investigue** — responda uma pergunta sobre o mecanismo e explique uma linha.
3. **Mude** — troque uma parte pequena e veja o efeito.
4. **Crie** — escreva sua versão do zero.
5. **Confira** — prova rápida e reflexão escrita.

> [!important] A etapa 1 avalia a previsão, não o exemplo
> Durante muito tempo ela comparava a saída do exemplo com ela mesma — batia sempre, e a
> animação comemorava nada. Hoje `predictionMatches` compara o texto escrito com a saída real,
> ignorando maiúsculas, acentos e pontuação. **Errar a previsão não trava nada**: aparece a
> comparação lado a lado, porque prever errado e comparar é o exercício.

## O que concede os 40 XP

`practiceDone`: a prova da etapa 5 correta **e** as etapas 3 e 4 com a saída esperada e os requisitos aplicáveis.
Acertar só a saída não basta — a ideia é saber explicar.

## Revisão de experiência · 14/09/2026

- O exemplo aparece antes do campo de previsão e da investigação, sem repetir uma IDE alta só para leitura.
- A etapa Confira só abre depois de Mude e Crie passarem. As outras etapas continuam consultáveis.
- Criar com sucesso abre uma confirmação animada, sem avançar sozinha nem dar XP antes da prova.
- O passo atual fica salvo em `position`; uma conferência salva sem execuções válidas volta para Crie.
- A previsão respeita números inteiros e ordem: `312` não vale como previsão de `12`.
- A etiqueta exige `int()`: imprimir `30` diretamente não cumpre a conversão pedida.
- Conclusões guardam `achievement`, uma cópia das três conferências já obtidas. Revisar código não apaga XP. Ver [[Estado e progresso]].

## Revisão espaçada

Cada vez que resolve sem ajuda, o intervalo cresce: 3 → 7 → 16 → 35 dias. Precisou de ajuda,
volta para o dia seguinte. É lembrete de prática, não medida de domínio.

Relacionado: [[Conteúdo · Aulas]] · [[Conteúdo · Pontes de função]] · [[Quebra-cabeça de código]]
