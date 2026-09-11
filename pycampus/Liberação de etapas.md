# Liberação de etapas

Arquivo: `src/progression.js`. É ele que decide o que está aberto e o que está travado.

## A regra

Uma etapa (módulo) só abre quando **todas as anteriores** estiverem completas. Completa
significa, para aquele módulo:

- todas as aulas concluídas;
- todos os miniprojetos treinados;
- todas as pontes de função fechadas (quando o módulo tem pontes);
- todos os projetos concluídos.

`moduleRequirements(state, i)` devolve exatamente o que falta, e é a fonte das mensagens na
tela. `missingSummary` transforma isso em português ("Faltam 5 aulas, 4 miniprojetos e 1
projeto na etapa 01"); `blockingSummary` aponta a etapa anterior que está segurando.

> [!important] Nada já conquistado é retirado
> `lessonAllowed` mantém aberta qualquer aula que já esteja em `completed`, mesmo que a regra
> mudasse depois. Progresso não regride.

## Onde isso aparece

- Cartões de projeto e de miniprojeto: dizem o que falta, em vez de só ficarem cinzentos.
- Botão principal do painel: `pendingStageWork` calcula o próximo passo real e leva até ele.
- Estúdio do projeto: o painel "Para concluir este projeto" mostra os dois requisitos.

> [!warning] Um projeto aprovado não pula a construção
> `projectComplete` exige `buildDone` **além** da aprovação. A nota do Lumi substitui a
> autoavaliação, nunca os passos.

Relacionado: [[Estado e progresso]] · [[Conteúdo · Projetos]] · [[Lumi · Avaliação de projeto]]
