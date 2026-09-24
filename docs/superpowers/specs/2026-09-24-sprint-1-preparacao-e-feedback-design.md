# Sprint 1: preparação acadêmica e feedback do mediador

Data: 24 de setembro de 2026  
Prova presencial: 30 de setembro de 2026  
Fim do período de estudo no AVA: 27 de setembro de 2026  
Prazo seguro usado para os trabalhos: 17 de outubro de 2026

## Objetivo

Transformar os recursos já existentes da Faculdade em uma jornada única de preparação. O estudante deve saber o que estudar agora, por que essa atividade foi escolhida, o que ainda não cobriu e para onde ir depois de errar. O sistema não pode confundir atividade concluída com domínio nem apresentar um plano matematicamente impossível.

A sprint também transforma comentários reais do mediador em aprendizado verificável. Uma entrega já enviada continua imutável; o feedback gera uma versão de melhoria separada e não altera nota, envio ou histórico passado.

## Problemas confirmados

1. Depois de 27/09, o plano divide pendências por zero e pode renderizar `Infinity por dia`.
2. O plano diário considera somente aulas, embora a prova use recuperação e questões de múltipla escolha.
3. O filtro “conteúdo estudado” libera todas as questões de uma unidade após uma única aula.
4. As questões recebidas do AVA não apontam para a aula ou prática que recupera o conceito.
5. O sorteio pode repetir questões firmes antes de cobrir todas as elegíveis nunca vistas.
6. “Modo prova” nomeia dois fluxos diferentes: recordação prática de código e simulado acadêmico.
7. Tentativas da Faculdade são registradas como laboratório genérico e perdem unidade e destino.
8. Os intervalos de revisão podem agendar a única próxima exposição para depois da prova.
9. A hero chama vinte questões de tarefas do professor, embora cinco da Unidade 4 tenham sido criadas a partir da apostila.
10. O README chama 27/09 de prazo dos trabalhos, enquanto o prazo seguro adotado é 17/10.
11. O feedback da entrega U2 recomenda persistência e menciona repetição; o PDF entregue possui apenas uma classe e uma contagem, e persistência não fazia parte dos critérios originais.

## Fora do escopo desta sprint

- Alterar retroativamente a entrega enviada ou afirmar que um novo arquivo foi enviado ao AVA.
- Atribuir uma nova nota ou interpretar sugestão do mediador como requisito original.
- Substituir a revisão humana de explicações por uma decisão automática.
- Implementar a revisão completa de acessibilidade, sincronização Gist, PWA ou decomposição do `App.jsx`; esses temas ficam nas sprints seguintes.
- Adicionar backend ou armazenar feedback fora do estado local/Gist já usado pelo estudante.

## Abordagem escolhida

Criar módulos profundos de domínio e manter as telas como adaptadores:

- `faculdade-preparo.js`: recebe estado e data; devolve fase, cobertura, fila priorizada e próxima ação.
- `faculdade-questoes.js`: cada questão expõe origem, pré-requisitos, habilidade e destino pedagógico.
- `faculdade-revisao.js`: seleciona questões usando a prioridade definida pelo preparo, registra evidência e comprime revisões até a prova sem apagar o histórico normal.
- `faculdade-feedback.js`: normaliza feedback do mediador e produz um plano de melhoria separado da entrega original.
- componentes React apenas apresentam os resultados desses módulos e encaminham ações; não recalculam regras acadêmicas.

Uma megassprint foi rejeitada porque colocaria preparação, acessibilidade, nuvem e PWA no mesmo deploy poucos dias antes da prova. Começar pela infraestrutura também foi rejeitado porque atrasaria o ganho pedagógico imediato.

## Modelo de preparação

### Fases de calendário

O módulo deve distinguir:

- `conteudo`: antes de 27/09, ainda há dias para novas aulas;
- `fechamento`: em 27/09, último dia do período de estudo;
- `revisao`: 28 e 29/09, sem divisão por dias de conteúdo;
- `prova`: 30/09;
- `pos-prova`: depois de 30/09, priorizando entregas e revisão livre.

Nenhuma fase pode retornar ou renderizar `Infinity`, `NaN`, número negativo de atividades por dia ou promessa de cobrir tudo quando isso não cabe.

### Cobertura

A interface mostrará separadamente:

- aulas estudadas;
- questões elegíveis vistas;
- questões erradas ou vencidas;
- unidades com recuperação praticada;
- simulados concluídos.

“Conteúdo preparado” só pode aparecer quando todas as quatro unidades tiverem cobertura de aula e recuperação. XP continua representando esforço; domínio continua obedecendo às regras de retenção já existentes.

### Próxima ação

Antes da prova, cada plano diário deve conter no máximo três blocos claros:

1. conteúdo-base necessário;
2. recuperação ativa ou exercício;
3. simulado curto ou revisão de erro.

Na fase de revisão, conteúdo pendente é ordenado por dependência e abrangência, mas a tela declara honestamente o que ficou de fora. O botão principal nunca leva a item bloqueado.

## Elegibilidade e prioridade das questões

Cada questão terá:

- `id` estável;
- `origem`: `ava` ou `apostila`;
- `unidade`;
- `aulasNecessarias`;
- `habilidade`;
- `destino`: aula, degrau ou exercício de recuperação.

O modo “estudado” exige que todas as aulas necessárias daquela questão estejam concluídas. “Unidades iniciadas” será um modo separado se ainda houver valor em praticar conteúdo além do estudado.

A seleção seguirá esta ordem:

1. elegível nunca vista;
2. errada e vencida;
3. errada ainda não vencida, quando a prova estiver próxima;
4. fraca;
5. firme.

Dentro da mesma prioridade, equilibrará as quatro unidades. Uma questão firme não se repete enquanto houver questão elegível nunca vista, salvo quando o usuário pedir explicitamente uma revisão livre.

Antes da prova, a próxima revisão não ficará exclusivamente depois de 30/09. O histórico Leitner permanece intacto e volta aos intervalos normais após a data.

## Recuperação depois do erro

Ao errar, a tela exibirá:

- explicação do mecanismo;
- conceito/habilidade associado;
- botão “Rever este conceito”;
- destino específico;
- retorno à mesma sessão preservando respostas e posição;
- uma microatividade antes de repetir, quando existir degrau compatível.

O destino inválido é erro de conteúdo e deve falhar nos testes. Todas as questões precisam ter um destino navegável.

## Nomes e telemetria

O fluxo geral de escrita sem consulta será renomeado para **Recall prático de código**. O acadêmico será **Simulado da prova de 30/09** enquanto a data for relevante e **Simulado da disciplina** depois dela.

O histórico aceitará origens explícitas:

- `formacao-aula`;
- `faculdade-aula`;
- `faculdade-simulado`;
- `prova-codigo`;
- `projeto`;
- `laboratorio`.

Cada tentativa acadêmica preservará `activityId`, unidade e destino. Backups antigos com `lesson` ou `playground` continuam válidos e são migrados sem perder tentativas.

## Feedback do mediador

O estudante poderá registrar:

- disciplina e entrega;
- nota de 0 a 100;
- data;
- texto original do comentário;
- itens classificados manualmente como elogio, problema, sugestão ou requisito;
- plano de melhoria associado.

O sistema não inventará a intenção do professor. O comentário original permanece visível, e toda classificação pode ser editada. A entrega enviada fica congelada como evidência; a melhoria cria uma revisão independente.

### Caso inicial: entrega U2

O PDF de 23/09/2026 será usado apenas como evidência de produto, não incorporado ao repositório. A plataforma registrará que:

- a nota foi 85;
- classe, funções e explicação foram elogiadas;
- o mediador mencionou repetição, mas o PDF exportado mostra uma única classe e uma única função de contagem;
- persistência foi sugerida como melhoria, não como requisito original;
- a conclusão do estudante já reconheceu que os livros somem ao fechar.

O plano “Evolua seu projeto” ensinará antes de cobrar:

1. `with open` e codificação UTF-8;
2. JSON e conversão entre objetos e dicionários;
3. `try/except FileNotFoundError`;
4. reconstrução de objetos;
5. teste de ida e volta: cadastrar, salvar, esvaziar memória, carregar e buscar.

Compreensão de lista, `vars` e `**` não serão pressupostos. A versão básica usará laços explícitos; recursos compactos aparecerão depois como refatoração explicada.

O teste de conclusão executará o ciclo real em um arquivo temporário do Pyodide. A interface avisará que o arquivo do navegador é temporário e que persistência durável deve ser conferida ao executar o programa baixado no computador.

## Transparência editorial

A contagem será derivada dos dados: quinze questões recebidas do AVA e cinco treinos da Unidade 4 baseados na apostila. Nenhuma tela chamará conteúdo sintetizado de questão recebida ou oficial.

O README será corrigido para separar 27/09, 30/09 e 17/10. Documentos históricos manterão sua data, mas receberão aviso quando descreverem uma premissa superada.

## Estados e migração

Novos campos serão normalizados com limites de tamanho e listas de IDs válidos. Backups existentes continuam abrindo. Dados inválidos de nota, data, origem, questão ou destino são rejeitados sem descartar o restante do progresso.

O merge entre backups preservará a tentativa acadêmica mais informativa e combinará feedbacks por ID, sem duplicar a mesma avaliação. Esta sprint não muda o transporte Gist; a concorrência de nuvem será tratada separadamente.

## Interface

Na Faculdade, um único cartão “Preparação para a prova” mostrará fase, cobertura e três próximas ações. O estudante poderá abrir detalhes sem ser obrigado a ler um painel extenso.

O resultado do simulado mostrará cobertura por unidade e não apenas porcentagem. Erros terão ação de recuperação. O feedback do mediador ficará junto da entrega correspondente, com distinção visual entre “entrega enviada” e “versão de melhoria”.

No celular, a ação atual aparece primeiro e todos os controles têm alvo mínimo de 44 px. A Sprint 2 fará a auditoria WCAG completa; esta sprint não introduzirá novos problemas conhecidos de foco ou contraste.

## Erros e honestidade

- Falha ao abrir um destino mantém a sessão e mostra uma mensagem recuperável.
- Data ausente usa a data local atual; data inválida nunca participa do cálculo.
- Não existe afirmação de envio ao AVA, alteração de nota ou validação pelo mediador.
- Uma sugestão não bloqueia a conclusão da entrega original.
- Um feedback vazio ou uma nota sem comentário pode ser salvo, mas não gera automaticamente um plano de melhoria.

## Estratégia de testes

O desenvolvimento será test-first. Cada comportamento novo começa com um teste que falha pelo motivo esperado.

### Domínio

- fases D−1, D0 e D+1 para 27/09, 30/09 e 17/10;
- ausência de valores não finitos em qualquer quantidade de pendências;
- elegibilidade por todas as aulas necessárias;
- prioridade de nunca vistas e erros antes de itens firmes;
- equilíbrio entre unidades;
- compressão pré-prova sem apagar histórico;
- destinos existentes para todas as questões;
- migração e merge das novas origens e feedbacks;
- separação entre requisito original e sugestão.

### Execução real

- persistência U2 no Python real: salvar, limpar, carregar e buscar;
- arquivo ausente retorna catálogo vazio com explicação;
- acentos sobrevivem ao JSON em UTF-8;
- duas execuções não duplicam livros.

### Navegador

- plano antes, durante e depois do período de estudo;
- simulado com erro, recuperação, retorno e preservação da sessão;
- cobertura em desktop e 390×844 sem rolagem horizontal;
- registro do feedback U2 e abertura do módulo de melhoria;
- backup e restauração preservam tudo sem prêmio duplicado.

### Regressão e entrega

- `npm test`;
- auditorias de ementa, progressão e perguntas;
- testes de Faculdade, entregas, projetos, jornada, iniciante, visual e abas;
- build de produção com base `/pycampus/`;
- orçamento de bundle existente;
- revisão independente do diff;
- push para `main`, acompanhamento do GitHub Pages e verificação da versão publicada.

## Critérios de conclusão

1. Nenhuma data ou estado renderiza `Infinity`, `NaN` ou plano impossível.
2. O plano inclui conteúdo, recuperação e simulado conforme a fase.
3. Questões nunca cobram assunto além dos seus pré-requisitos no modo estudado.
4. Toda questão possui origem e destino pedagógico válidos.
5. A seleção cobre itens elegíveis novos antes de repetir itens firmes.
6. Os dois tipos de prova têm nomes e objetivos distintos.
7. Tentativas acadêmicas mantêm origem após backup e merge.
8. O feedback do mediador não altera a entrega enviada e gera melhoria opcional rastreável.
9. A persistência U2 é ensinada e executada de ponta a ponta.
10. Datas e procedência são consistentes na interface e documentação.
11. Suíte completa, build, revisão, deploy e produção são verificados.
12. Uma nova auditoria após o deploy produz o backlog priorizado da Sprint 2.

