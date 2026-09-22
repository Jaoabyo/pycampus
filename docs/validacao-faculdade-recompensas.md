# Faculdade: recompensas e experiência de estudo

Validação em 22/09/2026, sobre a revisão `80dd40b`.

## Comportamento entregue

- XP derivado do progresso salvo: aula 100, miniprojeto 250, exercício de unidade 300, passo registrado de entrega 25.
- Bônus de conclusão da entrega: U1 250, U2 350, U3 450, U4 550. Não confundir baixar um arquivo com concluir o trabalho.
- Celebração só para o que termina alguma coisa: aula, miniprojeto, exercício, entrega concluída, emblema novo ou subida de nível. Um passo de entrega soma 25 XP sem abrir o modal — seriam até treze por entrega, e o confete da entrega concluída deixaria de ser especial. O XP do passo aparece na mensagem do estúdio ("Passo registrado. +25 XP.").
- O progresso anterior recebe o mesmo XP, sem refazer aulas. IDs repetidos ou desconhecidos não acumulam pontos.
- Oito emblemas acadêmicos. Cada unidade exige suas aulas, miniprojeto, exercício e entrega; ler apenas as aulas não a conclui.
- Unidade completa se recolhe, a próxima abre, e qualquer unidade pode ser reaberta pelo teclado ou toque.
- Exercícios `ex-u1` a `ex-u4` sobrevivem à normalização/restauração de backup, inclusive seu dia de estudo.
- Uma versão validada do trabalho concluído preserva a conquista quando o estudante experimenta alterações no editor. A restauração valida esse registro novamente.

## Correções de ensino

Os exemplos de compreensão das entregas agora declaram seu ambiente. Os exemplos locais incluem as variáveis, classes, tabelas e importações necessários, com explicação visível da preparação adicionada. Não dependem de executar o passo anterior.

Trechos finais da U4 são identificados como Colab, sem botão que prometa executar TensorFlow no navegador. O estudante pode baixar um notebook de rascunho antes de concluir, executar no Colab e voltar para registrar a evidência. A exportação final mantém suas exigências.

## Evidência

- `npm test`: 337/337 testes aprovados.
- `npm run test:faculdade`: 100 programas executados no Pyodide real com saída conferida, incluindo exemplos, desafios, projetos, treinos e reexecução do banco de vendas.
- `npm run auditar:progressao-faculdade`: 16 aulas, quatro unidades e quatro entregas verificadas na sequência explicar → exemplificar → praticar → revisar → aplicar.
- `npm run test:entregas-faculdade`: construção/exportação U1, caminho Colab U4, restauração de progresso e celular.
- `npm run test:recompensas-faculdade`: erro proposital com explicação, conclusão com +300 XP, emblema, recolhimento da unidade, abertura da próxima, teclado, reload sem prêmio duplicado e download de rascunho. Passou a fazer parte de `npm run verificar` — antes existia fora da cadeia e podia quebrar sem aviso.
- `npm run test:entregas-faculdade`: os oito primeiros passos da entrega U1 não abrem celebração e mostram "+25 XP"; o nono, que conclui a entrega, celebra com o bônus.
- `npm run test:iniciante`: primeira visita, guia, plano, exemplo, conclusão com XP e retorno.
- `npm run test:visual` e `npm run test:abas`: navegação e responsividade; 14 abas em desktop e celular.
- `npm run build` e `npm run test:bundle`: build aprovado e bundle dentro do limite existente.
- `npm audit --omit=dev`: nenhuma vulnerabilidade reportada nas dependências de produção.

Testes de navegador executados com Playwright/Edge no servidor da versão atual (`PYCAMPUS_TEST_URL=http://127.0.0.1:5178/`). O plugin Browser não estava disponível.

## Limites da avaliação

Os testes verificam funcionamento, coerência entre exemplos e saídas, pré-requisitos e feedback; não medem retenção de conhecimento de um aluno real. Não houve execução remota do treinamento TensorFlow no Colab nesta rodada. XP representa atividades registradas, não uma certificação independente de domínio. Arquivos antigos cujo progresso já tenha sido descartado não podem ser reconstruídos sem outro backup.
