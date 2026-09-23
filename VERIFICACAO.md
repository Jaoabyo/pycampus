# Verificação da entrega

## Aula e entrega uma etapa por vez (relatado pelo estudante) · 23/09/2026

- O estudante: "tem muita coisa nas telas em vez de só a atividade passo a passo". A aula mostrava guia, degraus, código do professor, desafio, Lumi, revisão e registro de uma vez, com dois editores, em 3.653 px de altura.
- Agora cada aula da faculdade tem cinco etapas (Aprender, Construir, Professor, Desafio, Revisar), com "Etapa N de 5" no topo e Voltar/Próxima no fim; só a etapa atual aparece. A primeira etapa tem 1.057 px e nenhum editor. Os miniprojetos continuam numa página só. A mensagem de acerto do desafio diz para ir à etapa Revisar.
- Na entrega, enquanto o reforço não termina, só ele aparece, com "Ir para o trabalho"; depois, um botão reabre. Antes: reforço e trabalho juntos, com dois editores.
- O editor dos degraus se chamava "grafico.py" em qualquer aula; agora é "degraus.py".
- `npm test`: 379 testes; check-faculdade, jornada do iniciante (ajustadas para as etapas), entregas e recompensas aprovadas; 390 px sem rolagem.

## Ajuda de erro para classes, com os nomes do código (medido no histórico do estudante) · 23/09/2026

- O backup mostrou 95 execuções com erro, 94 delas em classes e objetos (aula de Classes, miniprojeto do contador de visitas, biblioteca), sempre os mesmos enganos: método sem self (14 vezes), método chamado na lista em vez do objeto, a classe Pessoa usada no lugar do objeto pessoa1, método que a classe não tem, nome usado antes de ser criado. A ajuda genérica por tipo não apontava nenhuma dessas causas.
- `src/error-guide-classes.js` lê o código (classes, métodos, atributos, objetos criados) e explica a causa com os nomes do estudante: "O método pessoas_unicas está sem o self", "Use o seu objeto: registro.pessoas_unicas()", "Pessoa é a classe; o objeto tem outro nome: pessoa1", "A classe Pessoa não tem status: tem nome, idade, cumprimentar e aniversario", "livros foi usado antes de ser criado". Todas as 23 mensagens distintas do histórico foram reproduzidas; 12 testes fixam as reais.
- A tela da entrega não tinha ajuda de erro nenhuma; agora tem. Conferido na tela real com livros usado antes de criado.
- `npm test`: **379 testes**; pacote inicial 184,4 kB (limite 185,5 kB: está perto).

## Reforço da biblioteca e conferência nos passos da entrega da Unidade 2 (relatado pelo estudante) · 23/09/2026

- O estudante: "o sistema de biblioteca está muito complexo, não consegui pegar o conteúdo que preciso saber para construir". No backup dele: a função de cadastro (casdastro_livro) estava com recuo dentro da classe Livro, virando método; quantidade_disponive sem o l; cadastrar e listar na mesma função; nenhuma chamada. E o passo "busca" aparecia concluído sem busca nenhuma no código.
- Causa do passo falso: passos de construir sem conferência aceitavam qualquer código com mais de 30 caracteres. A entrega da biblioteca ganhou seis conferências que chamam o código: cadastrar_livro fora da classe (reconhece um def sem self dentro da classe e cita o nome do estudante), cadastro que põe um Livro com os quatro dados, quatro livros no catálogo, busca que acha sem diferença de maiúsculas no segundo livro da lista, busca ausente devolvendo None, contagem por gênero igual à dos livros cadastrados. A tela mostra só as conferências até o passo atual, para o cadastro não aparecer reprovado por causa da busca.
- Reforço: a biblioteca em oito degraus no topo da entrega (classe, objeto, catálogo, cadastro fora da classe, listagem, busca, contagem, gráfico), conferidos chamando o código. O degrau do cadastro explica o recuo; o da busca explica o return None depois do for. Medido pelo teste de que nada aparece sem explicação antes.
- `check-faculdade-degraus`: **204 programas no Pyodide**, incluindo o código real do backup, barrado com "A casdastro_livro está com recuo, dentro da classe Livro"; a solução de referência passa nas seis conferências. Entregas, recompensas e check-faculdade aprovados; `npm test`: **367 testes**; pacote inicial 181,5 kB. Na tela real: reforço aberto, degrau aponta quantidade_disponive, conferência do cadastro mostra só os três itens do passo.

## As 16 aulas com degraus, e nada sem explicação antes · 23/09/2026

- Pedido do estudante: "quero completo todas, garantir que nada passe sem antes explicar". Agora as 16 aulas têm trilha de degraus (Unidade 1: tipos e divisões, condicionais, repetições, funções; sequências; Unidade 4: web, lógica de app, testes, machine learning com NumPy).
- Na Unidade 1 dá para "acertar" com print("Adulto") sem if. Duas sondas novas testam o comportamento: uma roda o código de novo, escondido, com outros valores (idade 8, 18, 60; outras listas), e a outra chama as funções do estudante com entradas novas (saudacao("Bia"), calcular_media([10, 5])). Uma função que mostra com print em vez de devolver com return é reprovada com a explicação do None.
- A garantia virou teste: `novidadesDaAulaInteira` mede, na ordem da tela, cada degrau e a solução de referência de cada desafio; nada pode usar o que não foi ensinado antes ou explicado no próprio texto. Ela achou quatro lacunas, corrigidas: import numpy as np, import matplotlib.pyplot as plt, abs() e AUTOINCREMENT no desafio de SQL. Conferido apagando uma explicação: o teste acusa.
- O medidor tinha um defeito: não reconhecia type(valor) numa explicação como a função type explicada. Corrigido; nenhuma ponte sobrou.
- Um while falso, com os números escritos direto, passava porque a variação procurava linhas soltas que o degrau do range também mostrava. As variações agora exigem a sequência inteira e em ordem.
- `check-faculdade-degraus`: **187 programas no Pyodide**. `check-faculdade`: 100 programas (o teste passou a mirar o editor do exemplo dentro do Ampliar, porque os degraus vêm antes). Entregas, preparo e recompensas aprovados. `npm test`: **366 testes**; build; pacote inicial 180,6 kB. Na tela real: if fixo reprovado pedindo if e else, print no lugar de return reprovado, chamadas escondidas não aparecem na saída, 390 px sem rolagem.

## Degraus em sete aulas e revisão de todo o texto da faculdade · 23/09/2026

- Pedido do estudante: "avalie todo conteúdo da faculdade e garanta tudo operacional, de qualidade e explicado bonito assim". Medido: só 2 das 16 aulas tinham degraus; o maior salto entre guia e código do professor estava em Classes (24 linhas), Visualização (28), pandas (17 e 19) e Conjuntos/dicionários/NumPy (21).
- Degraus novos: pandas Series e DataFrame (6), pandas transformar e filtrar (4), Visualização com linha, df.plot, groupby, média contra soma e gráfico do grupo (5), Conjuntos/dicionários/NumPy (6) e Classes com o mesmo Veiculo e Carro do professor, até herança e sobrescrita (6). Uma sonda de variáveis descreve o que o programa deixou (Series, DataFrames, arrays, conjuntos, dicionários, classes e objetos com seus atributos), e o worker passou a devolver também os pontos das linhas dos gráficos.
- O degrau do status reprova o erro clássico de prova: print dentro do método em vez de return, que mostra o texto seguido de None.
- Uma revisão de todo o texto (teoria, guias, pontes, degraus, revisões) conferiu os valores citados e as respostas marcadas, e apontou erros que foram corrigidos: eu tinha escrito, em quatro lugares, que sem plt.close "executar de novo desenha por cima", o que é falso aqui, porque o worker fecha todas as figuras ao fim de cada execução; a ponte do matplotlib.use("Agg") agora manda apagar a linha no Colab; o guia de SQL passou a usar a lista de colunas no INSERT (sem ela, o desafio de Contatos quebra); SGBD, injeção de SQL e o efeito real do commit foram explicados; loc contra iloc virou pegadinha explicada com o próprio exemplo; unittest.main no notebook ganhou argv=['']; desafios que mandavam "criar" o que o código inicial já trazia foram reescritos. 29 correções.
- `check-faculdade-degraus`: **100 programas no Pyodide**, certos aprovam e erros típicos reprovam pelo motivo certo. `check-faculdade`: 100 programas batem. `npm test`: **365 testes aprovados**; build aprovado. Na tela real: Classes e pandas reprovam o erro com a explicação e avançam no certo; sonda invisível; 390 px sem rolagem horizontal.
- Ainda não coberto: degraus das Unidades 1 e 4; and/or (r1), range/while/continue (r2) e assert/doctest (u4a3) só aparecem na teoria; em várias revisões a alternativa correta é a mais longa.

## Degraus de SQL conferidos pelo banco, e o 150 que não aparecia (relatado pelo estudante) · 23/09/2026

- O estudante testou os degraus de gráfico no site: "ficou de um nível excelente, achei bem divertido". Notou que a barra de 150 não tinha número no eixo: o Matplotlib marca de 20 em 20. A conclusão da trilha agora ensina plt.bar_label para escrever o valor em cima de cada barra.
- A aula de SQL ganhou seis degraus (criar tabela, chave e tipos, inserir com ? e commit, consultar, UPDATE e DELETE com WHERE). Uma sonda roda depois do código do estudante e lê o banco de verdade: tabelas, colunas, tipos, chave primária, linhas e se há mudança sem commit. Ela vai no fim para não mudar o número de linha dos erros, e sua linha é tirada da saída antes de chegar à tela.
- `check-faculdade-degraus`: **38 programas no Pyodide** (gráfico, bar_label e 20 casos de SQL); certos aprovam e erros típicos reprovam pelo motivo certo: tipo errado, tabela com outro nome, close() no meio, sem chave, sem commit, valor escrito dentro do SQL, UPDATE e DELETE sem WHERE. Na tela real: tipo errado reprovado, certo avança, sonda invisível. `npm test`: **365 testes aprovados**; build aprovado.

## Código do professor sem "porrada de coisa nova", e gráfico em degraus (relatado pelo estudante) · 23/09/2026

- O estudante apontou que o exemplo do guia é pequeno e claro, mas o código do material vem depois com muita coisa nunca vista; e que a aula de Módulos mostrava um gráfico pronto e só pedia uma raiz quadrada.
- Medido, não suposto: `src/faculdade-novidades.js` extrai os termos do código do professor e desconta o que os guias anteriores mostraram. Havia **57 termos sem explicação nas aulas e 49 nos passos das entregas** (81 distintos, contando cada um na primeira aparição). A pior era Módulos e Matplotlib, com 14.
- `src/faculdade-pontes.js` explica cada um com o valor que ele produz no próprio exemplo, mostrado antes do código ("N coisas novas neste código"). `tests/faculdade-novidades.test.js` falha se um termo novo ficar sem ponte ou se uma ponte sobrar; conferido removendo uma ponte, que o teste acusou.
- O worker passou a devolver, com cada imagem, os dados do gráfico (alturas, nomes das barras, título e eixos). A aula de Módulos ganhou cinco degraus de gráfico de barras conferidos por esses dados, não pelo texto do código.
- `check-faculdade-degraus`: **18 programas no Pyodide**, certos aprovam e errados reprovam pelo motivo certo. `check-faculdade`: 100 programas batem. `npm test`: **361 testes aprovados**; build aprovado. Na tela real (1440 px e 390 px): degrau errado reprovado, certo avança, progresso sobrevive ao recarregar, sem rolagem horizontal no celular.
- Corrigido nesta verificação: eu havia dito ao estudante que `.patches` nunca era explicado; o guia de Visualização explica. E a data da prova é 30/09, não 27/09.

## Prova rápida aparecendo antes da hora, e animação de sucesso (relatado pelo estudante)

O estudante colou um trecho da oficina e apontou dois problemas: a "Prova rápida" e a pergunta "escolha uma linha do seu código" apareciam já na Etapa 1 (Preveja), antes de o estudante ter escrito qualquer código; e pediu uma animação quando o código roda certo.

- **Causa raiz confirmada**: uma sessão anterior havia adicionado uma 5ª aba "Confira" à lista de etapas da oficina, mas as seções de prova rápida e pontuação continuavam renderizadas **incondicionalmente** no fim do componente, fora de qualquer verificação de etapa. Isso significava que elas apareciam em TODAS as etapas, inclusive na primeira, contradizendo o próprio texto da prova rápida ("sem voltar para o código", "que você investigou na etapa 2" — nada disso tinha acontecido ainda).
- Corrigido: a barra de etapas foi içada para fora do cartão de trabalho (para continuar visível em todas as etapas) e o conteúdo passou a ser condicional — cartão de exercício (previsão/investigação/código) para as etapas 1 a 4, e cartão de "Confira" (prova rápida + pontuação) só na etapa 5.
- Ao mesmo tempo corrigido o pedido de "o código que ele fala está acima, mas na verdade está abaixo": a etapa 5 agora mostra o código que o estudante escreveu na etapa Crie **logo acima** da pergunta "escolha uma linha do código acima", com aviso claro quando ainda não escreveu nada.
- **Animação de sucesso**: `CodeEditor.jsx` ganhou uma prop `celebrate` (contador, não booleano — cada acerto novo incrementa e força a animação a tocar de novo mesmo em acertos consecutivos). Ao acertar, um brilho verde pulsa nas bordas do editor e um selo "✨ Deu certo!" aparece ao lado de "✓ Executado", com fade automático. Por ser parte do componente compartilhado, a mesma animação passou a valer nas aulas, no laboratório* não se aplica (sem saída esperada), no estúdio de projeto e nas pontes de função — não só na oficina.
- **Regressão que a própria verificação pegou**: ao tirar a barra de etapas de dentro de `.practice-work`, a barra perdeu a regra de CSS `.practice-work .tab-row{flex-wrap:wrap}` que a fazia quebrar linha no celular — ela dependia da posição no DOM, não de uma classe própria. As 5 abas passaram a exceder 390px de largura. Corrigido dando à barra uma classe própria (`practice-stage-tabs`) e movendo a regra de quebra de linha para ela, independente de onde ela estiver no HTML.
- Verificado em Edge headless: nas etapas 1 a 4, nem a prova rápida nem a pontuação aparecem; na etapa 5, aparecem junto com o código exato que o estudante escreveu antes; ao rodar código com a saída certa, aparece o brilho e o selo "Deu certo!"; a 390 px, sem estouro horizontal.
- Build e os 80 testes automatizados passando depois da correção.

## Duas lacunas de conteúdo encontradas e corrigidas nesta verificação

- A aula de **exceções** ganhou um segundo bloco (`raise ValueError(...)`) em uma sessão anterior, mas ninguém atualizou o glossário visível: o teste que garante "toda função usada no exemplo está explicada sem precisar clicar" pegou isso (`excecoes: ValueError`). Adicionado ao glossário visível de `excecoes`.
- A ponte de função "Uma função que faz uma pergunta" tinha `expected: 'azul'`, mas a saída real do Pyodide para `input(mensagem)` sem interação (modo com entrada pré-preenchida) é a mensagem do prompt **seguida, sem quebra de linha, da resposta** — porque `input()` não pula linha sozinho, e o `print()` seguinte emenda na mesma linha. A saída esperada era, portanto, impossível de bater. Corrigido para `'Qual é sua cor favorita? azul'`, com o desafio explicando por quê. As 8 soluções de referência das pontes foram executadas no Pyodide real para confirmar: 8/8 aprovadas.

## Auditoria de nivelamento: verificação não concluída (relatar com honestidade)

Foi disparada uma auditoria automatizada (workflow com IA) para varrer aulas, miniprojetos, projetos, a regra de liberação e o visual, comparando com cursos de referência pesquisados na internet. A etapa de busca de achados rodou (106 achados brutos, incluindo pesquisa real sobre CS50P, Python for Everybody, scaffolding e faded worked examples), mas a etapa de **verificação adversarial** — que existe justamente para descartar falso positivo — falhou por inteiro: todos os 106 agentes verificadores atingiram o limite de uso da sessão antes de responder.

**O resultado "0 achados confirmados" não significa "está tudo certo".** Significa que a verificação não rodou. Os 106 achados brutos (não verificados) ficaram registrados no journal da execução (`wf_6b0b767b-2b7`) e podem ser reaproveitados depois, retomando só a etapa de verificação, sem gastar de novo com a busca. Isso não foi refeito nesta sessão para não repetir o mesmo estouro de limite.

## Oito estúdios com orientação e documentação própria

- Oito projetos, 42 passos. Cada passo tem tarefa curta, pelo menos duas pistas e pergunta de compreensão. O estúdio não oferece solução completa nem botão para inseri-la.
- Etapas abertas são conferidas pelo estudante; sete etapas da calculadora também comparam uma saída conhecida. Registrar exige explicação, conferência declarada e execução bem-sucedida nos passos do navegador. Não é avaliação semântica da resposta.
- README em cinco perguntas, com rascunho salvo, prévia em texto e download. Guia GitHub específico para o arquivo de cada projeto. Não foi realizada publicação externa.
- 45 testes aprovados. O teste de navegador abre os oito estúdios, consulta pistas separadamente, escreve explicações e READMEs, baixa e lê oito arquivos README, verifica o guia GitHub e a distinção dos passos locais da API. Confere input, registro, restauração e layout de 390 px.
- Sete soluções da calculadora permanecem em tests/calculator-reference.js e executam no Pyodide. Projetos abertos não possuem corretor automático de lógica e o servidor local de cada estudante não foi executado nestes testes.
- Novos campos de posição, explicação e README sanitizados nos backups. Códigos anteriores, aulas, marcações e XP preservados.
- Orientações de README e envio de arquivos conferidas na documentação oficial do GitHub; ponte de servidor conferida em https://fastapi.tiangolo.com/tutorial/first-steps/.

## Roteiros guiados e input interativo — 9 de setembro de 2026

- Resultado final: 43 testes automatizados e build de produção aprovados. Cabeçalhos do servidor principal em 5173 conferidos sem alterar o armazenamento do estudante.

- Calculadora: sete passos com objetivo, três ações, exemplo executável, explicação, pequena variação e desfazer troca de código. IDs anteriores e códigos salvos mantidos; novas etapas de pergunta e conversão não retiram aulas/XP.
- Sete outros projetos têm cinco etapas de orientação com critério de conferência manual. O executor guiado completo nesta entrega é o da calculadora.
- GitHub: publicação pelo navegador explicada e acessível antes de concluir; envio não executado pela plataforma. Referência: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository.
- Input: worker espera por buffer compartilhado, pergunta aparece no editor, resposta continua o mesmo programa e vai para o histórico. Espera do estudante não consome os 15 segundos de execução. Interromper encerra o worker mesmo durante a pergunta. Entradas preenchidas previamente continuam disponíveis.
- Edge isolado em 5176: sete exemplos da calculadora e dois conjuntos adicionais aprovados, incluindo saldo negativo; 96 execuções do currículo aprovadas. Interface: pergunta/resposta, espera superior a 15 segundos, histórico, interrupção, preservação/desfazer, roteiro do quiz, filtro da oficina, navegação entre etapas e layout de 390 px aprovados.
- Oficina: filtro por aula de apoio concluída, navegação anterior/próxima e solução consultável com convite para explicar e tentar novamente. Não há avaliação automática de domínio por explicação livre.
- Fontes técnicas: https://pyodide.org/en/0.27.7/usage/streams.html; requisitos de cabeçalhos para hospedagem documentados no README. Testes locais não equivalem à validação em um provedor de hospedagem.

Verificado em 8 de setembro de 2026, no ambiente local.

## Explicações mais simples

- As 48 aulas receberam uma introdução curta em linguagem cotidiana. A explicação completa continua acessível por um botão expansível.
- Aula de tipos com significados e exemplos de str, int, float, bool e type; fluxo numerado entre ideia, exemplo e exercício.
- 22 testes e build aprovados. Repetida a verificação isolada de 96 execuções e dos fluxos de interface, incluindo layout a 390 px. Nenhuma mudança no progresso do estudante.

## Revisão da sequência de aprendizagem

- 22 testes automatizados aprovados, incluindo pré-requisitos das 48 aulas e dos oito projetos, alinhamento dos passos com os exemplos e preservação de código, conclusões e XP.
- 96 execuções no Pyodide real aprovadas: 48 exemplos sem erro e 48 soluções com a saída esperada.
- Corrigida a mistura de mensagens de carregamento de pacotes com a saída do estudante, que afetava novas execuções de SQLite.
- Interface verificada em Edge headless, origem isolada 5176: aviso de revisão, preservação do código antigo, reinício explícito, passos, dicas progressivas, conclusão, próxima aula, preparação de projetos e input com entrada de exemplo.
- Layout a 390 px sem transbordamento horizontal; imagens curriculum-review-mobile.png e curriculum-review-preview.png. Build de produção aprovado.
- Essa verificação confirma execução e relações declaradas de pré-requisitos; não comprova domínio do aluno nem substitui revisão docente independente. Detalhes em REVISAO-PEDAGOGICA.md.

- `npm.cmd test`: 6 testes aprovados. Cobrem concessão única de XP, sequência em limites de datas, semana começando na segunda, validação de backups, XP de projetos e integridade da trilha.
- `npm.cmd run build`: compilação de produção aprovada, sem aviso de bundle grande após restringir os ícones importados.
- Os **48 exemplos de aula** foram executados no interpretador Pyodide real, em Web Worker: 48 aprovações, zero erros.
- Fluxo da primeira aula: execução, alternativa de revisão, conclusão, 100 XP e persistência após recarregar.
- Perfil e metas: edição e salvamento.
- Calendário: criação de sessão e registro de conclusão.
- Projetos: marcação dos cinco requisitos e conclusão por autoavaliação.
- Simulador: nota 6 aprova no modo baseado na aula 1 do PDF; a mesma nota segue para recuperação no modo fictício com `elif`.
- Backup: arquivo JSON exportado e criado em Downloads; restauração validada pela interface com um arquivo JSON de teste.
- Laboratório: `input()` com entrada Ana, saída correspondente, interrupção de laço infinito e apresentação de `ZeroDivisionError`.
- Oito páginas verificadas em larguras de **390, 768 e 1440 pixels**, sem overflow horizontal.
- Console do navegador: nenhum erro da aplicação observado.
- Dados fictícios usados na verificação removidos do perfil do navegador de testes ao final.

Prévia de desktop: `dashboard-preview.png`. Prévia de celular: `mobile-preview.png`.

As verificações não incluem auditoria completa de acessibilidade, análise de segurança para código hostil, revisão docente do conteúdo nem avaliação automática dos projetos de alunos.

## Diário de aprendizagem

- Total atualizado: 11 testes unitários aprovados, incluindo migração de backups antigos, retenção por quantidade e tamanho, restauração de tentativas interrompidas e conteúdo do relatório.
- Testado em origem separada (`127.0.0.1:5174`) para não alterar o progresso do estudante em `5173`.
- Erro seguido de correção gera duas tentativas com códigos distintos; saída anterior ao erro preservada.
- Reflexão preservada após recarregar; início e conclusão não duplicam a tentativa.
- Interrupção manual e saída da página registradas; exercícios guardam a aula e a correspondência da saída esperada.
- Conclusão de aula continua funcionando com o registro de histórico.
- Conteúdo do relatório Markdown verificado no navegador, incluindo código, erro e reflexão; largura de 390 px sem overflow.
- Build de produção aprovado após a atualização.

## Investigação, XP de prática, guia de erros e dicas de estilo

- `npm.cmd test`: 33 testes aprovados. Os novos cobrem: investigação com três alternativas e resposta correta em posições variadas; a linha a explicar existindo de fato no exemplo; intervalos de revisão 3/7/16/35 com reinício após pedir ajuda; migração de registros salvos antes dos intervalos crescentes; XP de prática exigindo investigação correta mais as duas etapas de código, sem poder ser farmado; registro do dia treinado na sequência, uma única vez, sobrevivendo a um backup; e o comportamento das dicas de estilo e do leitor de erros.
- Um teste verifica que **os próprios exemplos da plataforma** (24 da oficina e 48 das aulas) não disparam nenhuma dica de estilo. Ele reprovou na primeira execução e revelou uma linha de 80 caracteres no exemplo da aula `crud`; o exemplo foi dividido em consulta e leitura, o que também explica melhor `fetchone()[0]`. Passo a passo da aula atualizado junto.
- As 96 execuções do Pyodide real (48 exemplos e 48 soluções de referência) foram repetidas depois dessa mudança: 96/96 aprovadas, além dos fluxos de interface do verificador de currículo.
- Fluxo completo em Edge headless, origem isolada 5177: previsão, execução, alternativa errada e depois correta na investigação, etapa de mudança e etapa de criação executadas no Python real, com a lista de requisitos passando de 0 para 3 e o aviso "Miniprojeto treinado · +40 XP". Os 40 XP apareceram no cartão de nível, o selo "Treinado" no cartão do miniprojeto e o dia entrou na sequência de estudos.
- Guia de erro verificado no laboratório com `print(sobremesa)`: identificou `NameError`, apontou a linha 1 e listou as verificações do tipo. O traceback exibido não contém mais quadros internos do Pyodide e mostra `File "seu_codigo.py", line 1`, mantendo o formato real do Python.
- Dicas de estilo verificadas com `nome="Ana"`: apontaram a linha 1 e não apareceram junto com o bloco de erro.
- Layout a 390 px sem transbordamento e console do navegador sem erros. Prévias: `practice-investigate.png` e `error-guide.png`.
- Esta verificação não avalia a qualidade das explicações escritas pelo estudante, não garante que a alternativa correta da investigação seja a única leitura defensável do código e não substitui revisão docente.

## Liberação obrigatória das etapas (pedido pelo estudante)

O estudante pediu que avançar de etapa exigisse concluir aulas, miniprojetos e projeto. A lógica (`src/progression.js`) e seus testes já existiam de uma sessão anterior, mas **não estavam ligados na interface**: `App.jsx` citava `progression` uma única vez, então nada travava de fato.

- Encontrado e corrigido antes de tudo: a suíte estava vermelha porque `tests/function-bridges.test.js` chamava `normalizeState` sem `version: 1`, o que joga na validação de backup. O teste nunca havia rodado. Corrigido o teste, não a validação.
- Ligações feitas: guarda em `openLesson` e em `openProject` com aviso do que falta; etapa travada com selo, aulas desabilitadas com cadeado e nota explicando; projeto da etapa desabilitado; cartões de projeto e de miniprojeto travados com motivo no rodapé; botão principal do painel roteando para o trabalho pendente.
- Corrigido um rótulo que passou a ser mentira: "Todas as aulas estão disponíveis" virou "Cada etapa abre quando a anterior estiver completa".
- **Nada conquistado é retirado**: `lessonAllowed` mantém aberta qualquer aula já concluída. Sem isso, o estudante com 9 aulas feitas e nenhum miniprojeto perderia acesso ao que já tinha estudado no momento em que a regra passou a valer.
- O teste do botão do painel reprovou e revelou um caso real: com as 6 aulas da etapa concluídas e miniprojetos pendentes, não existe "próxima aula aberta". Em vez de apontar para uma aula travada, foi criada `pendingStageWork`, que devolve o que destrava agora — aula, pontes, miniprojetos ou projeto — e o rótulo do botão passou a dizer qual é.
- 78 testes aprovados (eram 74). Os quatro novos cobrem a preservação de aula concluída, a frase do que falta, a etapa que realmente bloqueia e o roteamento do botão.
- Prova em Edge headless, origem isolada 5177: com estado novo, 7 etapas travadas, as 6 aulas e o projeto da etapa 02 desabilitados, nota citando a etapa 01 e a etapa 01 sem nenhuma aula travada; na aba Projetos, 7 cartões travados com "etapa em andamento"; com estado de veterano, `Repetições com for` (concluída) segue clicável e `Decompondo um problema` travada; abrir aula travada pela busca mostra aviso e não entra na aula. Layout a 390 px sem transbordamento, console sem erros. Prévia: `gating-locked.png`.
- Um seletor do meu próprio teste contava 7 aulas travadas onde há 6, porque o botão do projeto também é filho de `.lesson-list`; apertado com `:has(.lesson-status)`.
- Limite: a regra usa o estado salvo. Restaurar um backup antigo mantém as conclusões e, com elas, o acesso ao que já foi concluído.

## Revisão cobrando o que a aula não mostrou, e treino dirigido pelo diário

O estudante teve dificuldade real na aula de compreensões, identificou `range(1, 5)` como o ponto da virada e perguntou por que a revisão cobrava o `if`, que o exemplo nunca usa. Depois pediu para eu ler o relatório do diário e criar uma aba com treinos a partir das dificuldades dele.

- Nova regra verificada: **a revisão de uma aula não pode cobrar termo que a aula não mostrou** no exemplo, no exercício ou no texto visível. A varredura encontrou **cinco casos**: `str` em entrada, `break` em while, `if` em compreensões, `rollback` em transações e `type hint` em tipagem. Todos corrigidos com glossário visível, incluindo a forma filtrada `[n * 2 for n in range(4) if n > 1]` e o limite do `range(1, 5)` que o estudante apontou.
- Uma chave `transacoes` duplicada em `beginnerNotes` fazia a última vencer e anulava a adição; unificada.
- **Treino dirigido** (`diagnosis.js` + `TargetedPractice.jsx`): cinco padrões detectados por regra sobre as tentativas do diário, ordenados por frequência, cada um com a linha real do estudante, data, origem, treino curto verificado pela saída e atalho para a aula.
- Diagnóstico rodado contra o relatório real de 9 de setembro, com 46 tentativas: **7 ocorrências** de duas atribuições na mesma linha (`despesa_1 = input() = float(dispesa_1)`), **6** de nome inexistente (`linguagem = Python`, sem aspas), **5** de valor dentro de `input()` (`float(input(1200.0))`) e **3** de atribuição sem o igual (`despesa_3 float(300.00)`).
- Três defeitos meus corrigidos durante a verificação: a evidência apontava um comentário porque regras baseadas na mensagem de erro casam com qualquer linha; `diagnosis.js` lia `at` quando o diário grava `startedAt`, deixando a data vazia; e o contador de treinos ficava escondido dentro do texto do botão, invisível justamente quando o cartão estava aberto — virou pílula sempre visível.
- 55 testes aprovados. Os novos cobrem a regra da revisão, a detecção dos padrões com as linhas reais, a ausência de padrão em código correto, a ordenação por frequência, a regra do `range` só valendo para tentativa de aula que errou a saída, e a limpeza de treinos em backups.
- Prova no navegador com o histórico reconstruído do relatório: os cinco cartões aparecem, o topo mostra "7 tentativas" com a linha `float(dispesa_1)` datada, o padrão sem registro fica em destaque discreto, um treino foi resolvido no Python real, a pílula foi para 1/2 e o estado sobreviveu ao recarregamento. Layout a 390 px sem transbordamento. Prévia: `targeted-preview.png`.
- Limites: a detecção é por expressão regular sobre código e mensagem de erro, então pode errar nos dois sentidos; a aba não avalia domínio, e o relatório em Markdown continua sendo a via para análise externa mais profunda.

## Função usada sem ter sido ensinada (relatado pelo estudante)

O estudante encontrou `total = sum(numeros)` no exemplo da aula de listas, não achou explicação e precisou perguntar em outro chat, fora da plataforma. A explicação existia, mas só na aba do passo 3 do exemplo comentado e dentro de "Ver a explicação completa", ambas fechadas por padrão. Na prática, a aula cobrava uma função que nunca mostrou.

- A regra passou a ser explícita: **toda função ou método chamado no exemplo de uma aula precisa estar explicado no texto que aparece sem nenhum clique** — a explicação simples ou o glossário — nesta aula ou em uma anterior.
- Uma varredura das 48 aulas encontrou **32 usos sem explicação visível em 16 aulas**: `sum` em listas, `sorted` em conjuntos, `open`/`write`/`read` em arquivos, `json.loads`, `io.StringIO` e `csv.DictReader`, `sqlite3.connect`/`execute`/`fetchone`/`close`/`executemany`, `isinstance` e `ValueError`, `sqrt`, `logging.basicConfig`, `wraps`, `asyncio.sleep`/`gather`, `mean`/`median`, `os.getenv`, `all` e `values`.
- O glossário visível existia em uma única aula (tipos). Agora existe em 15, com 24 termos novos escritos em linguagem direta e com resultado concreto, como `sum([10, 20, 30]) devolve 60`.
- Dois defeitos do próprio verificador foram corrigidos durante a varredura: comandos SQL dentro de strings viravam falsos positivos (`VALUES`, `SUM`, nomes de tabela) e a palavra `class` dentro de `dataclass` era lida como definição de classe, escondendo o uso de `Item`.
- 49 testes aprovados. Quatro são novos: a regra do texto visível nas 48 aulas, a mesma regra aplicada aos 24 exemplos da oficina contra a aula de apoio, a checagem específica de `sum`, `len` e `append` na aula de listas e um limite de tamanho para o glossário não virar parede de texto.
- Verificado em Edge headless: na aula de listas os quatro termos aparecem no passo 1 sem abrir aba nem detalhe, com `devolve 60` no texto, e nenhum `<details>` vem aberto. Layout a 390 px sem transbordamento. Prévia: `lesson-glossary.png`.
- Esta regra garante que a função aparece explicada; não garante que a explicação seja suficiente para todo estudante. Continuar relatando o que ficou confuso segue sendo o melhor sinal.

### Regressão de tamanho do pacote

- O build havia voltado a emitir o aviso de pacote acima de 500 kB (512,95 kB), que esta verificação registrava como resolvido.
- Corrigido no `vite.config.js` separando `react`/`scheduler` e `lucide-react` em pacotes próprios: 303,53 kB de aplicação, 192,48 kB de React e 17 kB de ícones, sem aviso. Mesmo total, com as bibliotecas aproveitando cache entre versões.
- Divisão de pacote pode quebrar a ordem de carga, então o build de produção foi aberto em `127.0.0.1:4178` e navegado por painel, oficina, projetos e formação, sem erro de console e sem requisição falha.

## Estúdio do projeto, do primeiro passo ao GitHub (pedido pelo estudante)

O estudante ia começar a Calculadora de orçamento e apontou que o projeto só tinha a lista de requisitos: faltava construir passo a passo dentro da plataforma, com instrução em vez de dica, e faltava aprender a publicar no GitHub e ter o link conferido.

- Cinco passos autorais para `calculadora`, cada um com instrução e saída esperada, verificados pelo mesmo executor Pyodide das aulas: guardar os valores, somar as despesas, calcular o saldo com duas casas, trocar os valores fixos por `input()` com `float()` e montar o relatório de três linhas. O último passo entrega o programa completo.
- Sem apoio extra de propósito: o estúdio não tem código inicial, botão de pista nem passos comentados. Um teste garante que nenhuma instrução entrega código pronto (`print(` ou `= float(`), e a verificação em navegador confere que as palavras "pista" e "ajudinha" não aparecem na área de trabalho.
- Guia de publicação com os oito comandos (`git --version`, `cd`, `init`, `add`, `commit`, `branch -M main`, `remote add`, `push -u`), cada um com botão de copiar e uma linha explicando o que faz, mais o aviso de criar o repositório vazio no GitHub. Os comandos rodam no terminal do estudante: a plataforma não executa Git.
- O campo de link aceita apenas `https://github.com/usuario/repositorio` (com ou sem `.git` e barra final). "Conferir no GitHub" consulta `api.github.com` e distingue repositório encontrado, 404, limite de acessos (403), outros códigos e falha de rede.
- 42 testes aprovados. Os cinco novos cobrem integridade dos passos, entradas declaradas nos passos que leem `input()`, conclusão só com todos os passos verificados, o padrão de endereço aceito e recusado (incluindo `http://`, GitLab, caminho de issue e `javascript:`) e a limpeza de backups: código truncado em 50 000 caracteres, passos inexistentes descartados e projetos desconhecidos ignorados.
- Prova de ponta a ponta em Edge headless, origem isolada 5177: as cinco soluções de referência foram digitadas e executadas no Python real, cada passo ficou verde na ordem, o guia de publicação só apareceu depois do quinto, o link em GitLab foi recusado com mensagem de formato, o link do GitHub foi salvo, a conferência mostrou repositório encontrado e depois a mensagem de não encontrado, e recarregar preservou o código e os cinco passos. Prévias: `project-studio.png` e `project-publish.png`.
- Corrigidos na verificação: um parágrafo com `<code>` e `<strong>` que virou colunas por causa de `display:flex`, a migalha que mostrava "Configurações" no estúdio e o item "Projetos" que não ficava destacado no menu.
- Limites: a conferência confirma existência e acesso público do repositório, não a qualidade nem a autoria do código; os XP do projeto continuam vindo da autoavaliação dos cinco requisitos; e os outros sete projetos ainda não têm passos autorais.

## XP na tela e prova rápida no fim (relatado pelo estudante)

O estudante pediu que concluir um miniprojeto mostrasse o XP na tela como nas aulas, e que a pergunta de investigação aparecesse no fim, com sentido no lugar onde está.

- `buildCelebration` passou a detectar miniprojetos treinados, com título "Miniprojeto treinado!", o nome do miniprojeto e os 40 XP. O foguinho continua sendo da primeira **aula** do dia, como o README descreve.
- A pergunta de múltipla escolha saiu da etapa 2 e virou a seção **Prova rápida**, depois das quatro etapas: ela pergunta sobre o mecanismo do exemplo investigado e pede resposta de memória. A etapa 2 mantém o rastreio e a explicação da linha com as próprias palavras. O requisito de XP passou a se chamar "Prova rápida respondida corretamente".
- A seção de relato foi absorvida: a explicação escrita ficou na prova rápida e o agendamento da revisão no cartão de XP, reduzindo de quatro para três blocos depois do editor.
- 37 testes aprovados. O novo teste de comemoração confirma título, nome, 40 XP, `practice: true`, que o foguinho **não** acende, que não celebra duas vezes e que não celebra faltando a prova rápida ou faltando uma das etapas de código.
- Fluxo completo em Edge headless, origem isolada 5177, no primeiro miniprojeto: verificado que a etapa 2 não tem mais alternativas, que a prova rápida tem as três no fim, que concluir as etapas de mudar e criar **não** dispara comemoração, e que acertar a prova rápida abre o diálogo "Miniprojeto treinado!" com "+40 XP" e o nome do miniprojeto. Depois de confirmar, o nível mostra 40 / 500 XP e recarregar a página não celebra de novo.
- Layout conferido a 390 px sem transbordamento, console sem erros. Prévia: `practice-celebration.png`.
- A comemoração declara o que foi verificado: acerto da prova rápida e as duas etapas de código com a saída esperada, sem afirmar que todas as possibilidades do programa foram testadas.

## Visual da oficina e do interior das aulas (relatado pelo estudante)

O estudante apontou que a oficina não tinha o cuidado visual do painel e da aba de projetos, e que o interior das aulas era confuso. As duas coisas foram refeitas com os mesmos recursos que o projeto já usava.

- **Oficina**: abertura com o mesmo `hero` do painel (gradiente, sobrenome, título com palavra destacada, botão branco, rodapé de números) e uma ilustração nova da mesma família da arte do painel — órbitas, peça de vidro, sinais flutuantes, estrelas e legenda —, trocando o logo do Python por um cartão de código com uma lupa.
- Os 24 cartões passaram a ter a estrutura do cartão de projeto: faixa colorida de 147 px com círculos concêntricos, ícone grande de traço fino, rótulo "MINIPROJETO NN", chaves decorativas, pílula da etapa, XP, barra de progresso das três etapas e rodapé com a data de revisão. Verificado que as 24 faixas e o selo "treinado" aparecem.
- Os quatro passos ganharam cartões numerados com tile colorido, no padrão dos cartões de etapa do painel.
- **Interior das aulas**: os passos não pulam mais de coluna. À esquerda ficam 1 Entenda a ideia e 2 Veja como se escreve; à direita, 3 Agora tente você (tarefa e editor no mesmo cartão, como na oficina) e 4 Revisão rápida, seguidos da caixa de conclusão e do convite opcional para a oficina, que antes abria a coluna e competia com o desafio.
- Todo passo usa o mesmo cabeçalho: tile colorido com ícone, "PASSO N DE 4" e título, com pílula "feito" quando o passo está satisfeito. Uma trilha no topo leva a cada passo e marca em verde os que já estão certos.
- A caixa de conclusão ganhou cabeçalho e lista de requisitos com ícones, mostrando quais das duas condições faltam.
- O glossário de termos virou grade de duas colunas, reduzindo a rolagem antes do exemplo.
- Duas colisões de CSS encontradas e corrigidas na verificação: `.python-tile svg` forçava 97 px em qualquer ícone dentro da peça de vidro, esticando a lupa da ilustração; e `.project-visual>span:not(.visual-braces)` posiciona à esquerda com especificidade (0,2,1), o que empurrava o selo "treinado" para cima do rótulo do cartão. Ambas resolvidas com seletores mais específicos e comentário explicando o motivo, sem `!important`.
- 36 testes e build aprovados. Verificado em Edge headless a 1440 px e a 390 px, sem transbordamento e sem erros de console. Prévias: `practice-preview.png`, `practice-mobile.png`, `lesson-preview.png` e `lesson-mobile.png`.
- `Icon` e `Progress` estavam duplicados em cada arquivo novo; foram extraídos para `ui.jsx` e reaproveitados, e o editor da aula e do laboratório continua sendo o mesmo `CodeEditor.jsx`.

## Quebra-cabeça de código (problema de Parsons)

- `npm.cmd test`: 36 testes aprovados. Os três novos verificam que os blocos de cada um dos 24 quebra-cabeças reconstroem exatamente a solução de referência (com a indentação), que o embaralhamento é estável por miniprojeto e nunca entrega as peças já em ordem, que existe uma peça extra e que ela não é uma linha da solução, e que a montagem só conta como resolvida com ordem **e** indentação corretas.
- O teste do distrator reprovou na primeira execução por comparar substrings: `nome.strip()` aparece dentro de `limpo = nome.strip()`. A invariante correta é comparar linha por linha, porque o distrator deve ser **parecido** com uma linha da solução sem ser nenhuma delas.
- As 24 soluções de referência foram executadas no Pyodide real, com o contexto pronto do miniprojeto longo: 24/24 produziram a saída esperada.
- Fluxo completo em Edge headless, origem isolada 5177, no miniprojeto de `if/else`: as seis peças aparecem (cinco da solução mais o engano `else idade < 18:`), a montagem na ordem certa deixa a peça errada de fora, a conferência sem indentação acusa "3 de 5 linhas no lugar" e marca as duas linhas internas como erro de espaços, e depois de indentar as duas a montagem é aprovada com as cinco linhas em verde.
- Confirmado que montar o quebra-cabeça **não** concede XP nem marca requisitos: o nível permaneceu em 0 / 500 XP e a lista de requisitos continuou vazia. O registro aparece apenas como uma nota no bloco de XP.
- Layout a 390 px ajustado para o código ocupar uma linha própria e os controles ficarem abaixo, sem transbordamento. Console do navegador sem erros. Prévias: `parsons-preview.png` e `parsons-mobile.png`.
- Esta verificação não avalia se o quebra-cabeça reduz a dificuldade de escrever do zero para este estudante; isso só aparece na prática ao longo do tempo.

### Oficina com o visual do projeto (relatado pelo estudante)

- O estudante apontou que a oficina não parecia parte da plataforma: usava um `textarea` cru em vez do editor com aparência de IDE do laboratório, e a tarefa de cada etapa não se destacava.
- O editor foi extraído de `App.jsx` para `CodeEditor.jsx` e agora é o **mesmo componente** na aula, no laboratório e na oficina: aba com nome de arquivo, indicador de linguagem, números de linha, Tab de quatro espaços, Ctrl + Enter, barra de execução e console com estado. Na oficina, as etapas de leitura abrem em modo somente leitura, com `exemplo_<id>.py`, e as de escrita em `meu_<id>.py`. O painel de entrada padrão só aparece onde é usado.
- A tarefa de cada etapa passou a usar o bloco `.challenge` com `.expected` que a aula já usava: sobrenome da etapa em destaque, o que fazer e a saída esperada.
- Cada um dos 24 miniprojetos ganhou ícone próprio, com a cor da etapa da formação a que pertence, no padrão dos oito projetos. Verificado que os 24 ícones aparecem.
- Nova comparação linha por linha quando o programa roda mas a saída difere, na oficina e no exercício da aula, com as linhas divergentes destacadas. Verificada com `print("errado")` contra a saída esperada.
- Menu reordenado: "Visão geral" voltou a ser o primeiro item.
- Verificado a 1440 px e a 390 px, sem transbordamento e sem erros de console. Prévias: `practice-preview.png`, `practice-investigate.png` e `practice-mobile.png`.

### Correção de afordância nos seletores (relatada pelo estudante)

- O estudante apontou que as etapas inativas da oficina pareciam texto apagado, sem indicar que eram clicáveis. A causa: o reset global remove borda e fundo de todo `button`, e `.tab-row` pintava apenas a opção ativa.
- Corrigido no próprio `.tab-row`, com os tokens que o projeto já usa em `.button.outline` e nas alternativas de resposta: fundo branco, borda de 1 px, texto mais escuro e realce roxo ao passar o mouse. A opção ativa mantém o preenchimento roxo.
- A correção alcança os quatro usos do componente: etapas da oficina, botões de relato da revisão, filtro da formação e filtro do diário de aprendizagem, além do simulador de dois ou três caminhos.
- As etapas já concluídas passaram a exibir uma marca verde. Verificado em Edge headless que a marca aparece somente nas etapas realmente feitas (investigação correta e etapa de mudança), e não na de criação ainda pendente.
- Conferido a 1440 px e a 390 px, onde as quatro etapas quebram em duas linhas sem transbordamento. Testes e build repetidos após a mudança.

## Oficina de prática

- `npm.cmd test`: 26 testes aprovados, incluindo um novo arquivo (`practice-content.test.js`) que confirma ids únicos, pré-requisito existente para os 24 miniprojetos, ausência de campos vazios, sintaxe compatível com a aula de apoio (sem lista antes de listas, sem `raise` antes de exceções) e o cálculo de revisão de `nextReview`.
- Os 24 exemplos e mais 24 soluções de referência (mudança e criação dos 12 miniprojetos mais novos: decomposição, tuplas e conjuntos, compreensões, ordenação, complexidade, classes, construtores, encapsulamento, herança, dataclasses, exceções e arquivos) foram executados no Pyodide real: 48/48 aprovados.
- Interface verificada em Edge headless, origem isolada 5177: os 24 miniprojetos aparecem na visão "Todos"; a aba "Revisar hoje" mostra a contagem correta e a mensagem de nenhuma revisão pendente antes do primeiro relato.
- Fluxo de um miniprojeto: as três etapas (prever, mudar uma parte, criar) trocam de código independentemente; a etapa "prever" mantém o exemplo somente leitura.
- Layout a 390 px sem transbordamento horizontal, sidebar recolhida atrás do menu, como nas demais páginas. Prévias: `practice-preview.png` e `practice-mobile.png`.
- Console do navegador sem erros durante a navegação.
- Esta verificação cobre navegação, layout, persistência do relato e a saída real dos 24 exemplos e das 24 soluções de referência; não avalia a qualidade das explicações escritas pelo estudante nem substitui revisão docente.

## Celebrações de conclusão

- 17 testes unitários aprovados: incluem primeira aula do dia, nova data local, XP sem repetição, emblemas, subida de nível e projetos.
- Fluxo real no navegador: exercício e revisão corretos abrem “Você conseguiu!”; a aula só é registrada após confirmar; a celebração seguinte mostra XP, foguinho e primeiro emblema.
- Segunda aula no mesmo dia celebra a conclusão sem acender novamente o foguinho; repetir a animação não adiciona XP.
- Projeto concluído abre uma celebração sobre o diálogo do projeto; confirmar volta ao projeto.
- Subida para nível 2 exibida; voltar ao código e concluir pelo botão da aula funciona; Escape fecha a celebração.
- Nenhuma celebração reaparece ao recarregar o progresso existente. Importar backup sincroniza a referência de comparação, sem celebrar conquistas importadas como novas.
- Layout verificado a 390 px; movimento reduzido desativa as animações. Uma parte dos testes usou cliques sem aguardar quadros de animação porque a aba do navegador de testes estava em segundo plano.
- Testes em `127.0.0.1:5175`, separados do progresso do estudante. Prévia: `celebration-preview.png`.

## Quebra-cabeça em toda atividade (11/09/2026)

- Utilitários movidos para `src/parsons.js` e usados agora pelas aulas (`src/lesson-puzzles.js`), pelas pontes de função e pelos miniprojetos, sem duplicar a lógica de embaralhamento.
- `npm.cmd test`: 86 testes aprovados. Os cinco novos em `tests/lesson-puzzles.test.js` comparam os blocos de cada aula e de cada ponte com as soluções de referência escritas de forma independente em `tests/` — as mesmas que já foram executadas no Pyodide real. Se alguém mudar uma solução sem mudar a outra, o teste quebra.
- Uma aula ficou de fora de propósito: `ola` tem uma linha só, e ordenar um bloco único não seria exercício. O teste fixa essa exceção, então nenhuma outra aula pode ficar sem quebra-cabeça por descuido.
- `npm.cmd run build` sem avisos de tamanho de pacote.
- Navegador (msedge, prévia de produção em `127.0.0.1:5176`), a 1440 px e 390 px: o quebra-cabeça foi montado peça por peça na aula "Textos, números e booleanos" e a conferência aceitou a montagem nos dois tamanhos. Sem erros de página, sem erros de console e sem rolagem horizontal.
- O tabuleiro agora decide empilhar por consulta de contêiner (`@container`), não por largura de tela, porque na aula ele vive numa coluna estreita mesmo no desktop — antes as peças quebravam no meio do código.
- Não verificado: se montar blocos ajuda este estudante a escrever do zero depois. Isso só aparece com o uso.

## Lumi: mascote com IA local, e avaliação do projeto publicado (11/09/2026)

- Ollama 0.34 instalado com winget; modelo `qwen2.5-coder:14b` (9,5 GB) rodando 100% na GPU (RTX 5060 Ti, 16 GB). Geração medida em ~45 tokens/s, resposta em menos de 1 s. O primeiro carregamento do modelo leva cerca de 80 s, por isso a plataforma o aquece quando o painel abre e pede `keep_alive` de 30 minutos.
- A ajuda sobe em quatro degraus e **os dois primeiros nunca mostram código**. Essa regra não é confiada ao modelo: `sanitizeReply` remove blocos de código das respostas dos degraus 1 e 2, permite no máximo duas linhas no degrau 3 e só libera tudo no degrau 4. Testado inclusive com bloco de código não fechado.
- Cada degrau tem ajuda escrita e revisada que funciona com o Ollama desligado. Com a IA fora do ar o painel diz isso e continua útil.
- O prompt recebe só os assuntos já estudados até a aula atual, para o Lumi não "ajudar" com recurso que o estudante ainda não viu.
- Navegador (msedge, prévia de produção), 1440 px e 390 px: erro real de `TypeError` numa aula, os quatro degraus percorridos, resposta do Ollama chegando ao navegador sem problema de CORS. Degrau 1 devolveu uma pergunta socrática; degrau 4, o código correto. Sem erros de console e sem rolagem horizontal.
- **Avaliação do projeto**: o link do GitHub que já era salvo agora é lido pela API pública (até 4 arquivos, 12000 caracteres) e avaliado com uma rubrica por requisito. Verificado de ponta a ponta contra um repositório público real de calculadora de orçamento: nota 7,0–8,0, aprovado, com motivo por requisito.
- A aprovação é decidida pela nota no código (`nota >= 7`), nunca pelo campo que o modelo declara sobre si mesmo, e `normalizeState` recalcula isso ao restaurar um backup — um arquivo editado à mão não concede 250 XP.
- Projeto aprovado concede os mesmos 250 XP, conta como atividade do dia (fogo) e desbloqueia o emblema novo "Aprovado na revisão". A celebração diz qual das duas portas foi usada, em vez de atribuir ao estudante uma autoavaliação que não foi dele.
- Limite honesto: a nota é a opinião de um modelo de 14B lendo o código. Ela não executa o programa nem garante que ele funcione.

## Nivelamento dos passos de projeto (11/09/2026)

- Novo `tests/project-levelling.test.js` estende ao projeto a regra que já valia para aulas e miniprojetos: nenhum passo pode exigir uma função que o estudante nunca viu. Ele encontrou três lacunas reais — `.lower()`, `pop()` e a lista de dicionários — confirmando a auditoria.
- `.lower()` passou a ser ensinado na aula de textos e `pop()` na aula de listas, ao lado de `append`. É onde eles pertencem.
- `tarefas` foi renivelado de 5 para 10 passos, no mesmo padrão já usado no `quiz`: os cinco ids originais mantêm o sentido e as anotações salvas, e os cinco novos preenchem os degraus que faltavam (uma tarefa sozinha antes da lista de dicionários; ler chave dentro do for; achar antes de alterar; descobrir a posição antes de remover; uma ação virando função antes do menu).
- Saltos de **estrutura** não ficaram no teste: toda expressão regular que tentei confundia "exigir" com "ensinar". Eles seguem registrados na lista de dívida do teste, revisados a olho.
- Dívida restante, herdada da auditoria e ainda não nivelada: `banco`, `estoque`, `api`, `qualidade-projeto` e `final`. O teste falha se qualquer projeto fora dessa lista regredir.

## Correções relatadas pelo estudante (11/09/2026)

- **A nota não mudava depois de melhorar o código.** O modelo afirmava que um arquivo cheio de comentários não tinha nenhum, e repetia isso em três avaliações seguidas — inclusive quando obrigado a citar a linha que comprovasse. A correção não foi insistir no prompt: o que é contável passou a ser contado em JavaScript (`codeFacts`) e entregue pronto ao modelo, marcado como verdadeiro. Verificado contra o repositório real do estudante: de 4/5 para 5/5 requisitos, três rodadas seguidas, e agora também no navegador em 1440 px e 390 px.
- Confirmado que o arquivo com espaço e parênteses no nome (`orcamento (1).py`) é lido sem problema pela API do GitHub; a suspeita de erro de codificação de URL foi testada e descartada.
- **Sem saída depois de aprovado.** O estúdio não oferecia nenhum caminho adiante. Agora, com o projeto concluído, aparece um cartão apontando o próximo passo real (`pendingStageWork`), com o botão que leva até ele.
- **Tudo numa tela só.** O estúdio virou duas fases — Construir e Entregar — no mesmo padrão de abas já usado na oficina. O editor e a conferência somem na entrega; o README, a publicação e a nota somem na construção.
- Regressão que eu mesmo introduzi e corrigi: no celular, os dois botões de fase ocupavam 100% cada dentro de um `.tab-row` que não quebra linha, empurrando a página 349 px na horizontal. Achado medindo a cadeia de ancestrais do elemento que transbordava, não por inspeção visual.
- Variação observada: em uma execução isolada o modelo marcou 4/5 no mesmo repositório. Depois dos fatos medidos, as verificações seguintes deram 5/5 nos dois tamanhos de tela. A nota continua sendo julgamento de um modelo e pode variar entre execuções.

## Lições personalizadas do Lumi e o vaga-lume na interface (11/09/2026)

- Cada engano do Treino dirigido ganhou o botão "Lição do Lumi para este engano". O modelo escreve uma lição curta — explicação, exemplo, desafio — sobre o engano que o diário registrou.
- **Nada aparece sem passar por três portões**: formato completo; vocabulário restrito ao que já foi ensinado até a aula de origem do padrão; e execução no Pyodide real, onde o exemplo e a solução do desafio precisam produzir exatamente as saídas que a própria lição promete. São três tentativas; falhando as três, a lição é recusada com o motivo, em vez de mostrar algo não verificado.
- O portão de execução pegou erro de verdade: no padrão "nome escrito de dois jeitos" o modelo insistia em um exemplo que levanta NameError enquanto prometia imprimir "Python". Corrigido instruindo que o exemplo mostra o jeito certo e o engano se explica em palavras.
- Outro defeito pego na verificação em tela: o desafio dizia "corrija o código abaixo" com o editor vazio. Agora enunciados que apontam para código inexistente são recusados, e há teste para isso.
- Lições do Lumi **não valem XP** — gerar é um clique, e valer pontos abriria farm. Contam como atividade do dia, e só quando o estudante resolve o desafio, não quando a lição é gerada.
- O Lumi ganhou o botão de ajuda também dentro do estúdio do projeto, com o contexto do passo, e passou a aparecer sozinho na terceira execução seguida sem sair do lugar.
- O vaga-lume agora atravessa a tela devagar, com brilho próprio, sem interceptar cliques e desligado para quem pede menos movimento no sistema.
- Verificado em 1440 px e 390 px: lição gerada, conferida e exibida, sem erros de console e sem rolagem horizontal. 118 testes automatizados passando.

## Passagem completa pela jornada de um iniciante (11/09/2026)

Roteiro automatizado percorrendo painel → primeira aula → três erros seguidos → conclusão → todas as abas, em 1440 px e 390 px, com a IA local ligada e desligada. Ele mede transbordo horizontal, erros de console, páginas vazias e ausência de chamada para o próximo passo. Achados e correções:

- **O Lumi não aparecia sozinho.** A contagem de tentativas vivia dentro do próprio componente, que é desmontado a cada execução (o estado volta a "rodando"). O contador passou a viver na atividade e chega como `attempts`. Confirmado: na terceira tentativa seguida ele abre em aula, miniprojeto, ponte e projeto.
- **Com a IA desligada**, o Lumi continua abrindo, mostra a ajuda escrita e avisa o motivo. É o caminho que garante não ficar preso sem o Ollama, e agora está coberto pelo roteiro.
- **Frases partidas em colunas.** Parágrafos com `display:flex` transformavam cada `<strong>` e `<code>` em coluna: o aviso da IA desligada, a regra de XP da oficina e o aviso das pontes travadas saíam desalinhados. O texto passou a ir dentro de um `<span>`.
- **A oficina abria com oito cadeados.** As pontes de função ficavam no topo, antes de qualquer coisa que o estudante pudesse fazer; foram para depois da lista de miniprojetos, que é onde importam.
- **Projetos: os oito cards diziam "etapa em andamento"**, sem dizer o que fazer. Agora cada card mostra o que exatamente falta ("Faltam 5 aulas, 4 miniprojetos e 1 projeto na etapa 01").
- **Texto factualmente errado** na página de projetos: "a plataforma não revisa repositórios automaticamente" deixou de ser verdade quando o Lumi passou a ler e avaliar o repositório. Corrigido.
- O único erro de console que sobra no modo offline é o próprio pedido bloqueado pelo teste; o código o trata.

## A etapa "Preveja" passou a avaliar a previsão (11/09/2026)

- Relatado pelo estudante: escreveu a previsão certa no miniprojeto, o exemplo rodou, e nada aconteceu — nem reconhecimento, nem animação.
- Causa: a etapa 1 comparava a saída do exemplo com a saída esperada **do próprio exemplo**. Isso bate sempre, então a mensagem ("Bateu com a saída do exemplo") e a animação disparavam em toda execução, independentemente do que o estudante tinha escrito. A previsão era só guardada como texto, nunca lida.
- Agora `predictionMatches` compara a previsão escrita com a saída real, ignorando maiúsculas, acentos, pontuação e texto em volta ("acho que vai mostrar X" vale). Todas as linhas da saída precisam aparecer.
- Acertar mostra "Você previu certo!" e a animação. Errar **não** é tratado como falha: aparece a previsão e a saída lado a lado, em tom neutro, porque prever errado e comparar é o ponto do método. Nada trava.
- Verificado no navegador em 1440 px e 390 px, nos dois caminhos: previsão errada não comemora e mostra a comparação; previsão certa é reconhecida e anima. 120 testes automatizados.

## Varredura: o que a plataforma pede e nunca responde (11/09/2026)

Pedido do estudante depois do bug da previsão: procurar mais casos do mesmo tipo. Auditei toda ação que o estudante produz e conferi se a plataforma responde ao **conteúdo** dela.

**Nenhum outro caso de afirmação falsa.** Tudo que concede XP ou libera etapa é verificado de verdade: prova rápida comparada com a resposta certa, código comparado com a saída esperada no Pyodide real, quebra-cabeça conferido por ordem e indentação, nota de projeto lida do repositório. O único que fingia conferência era a etapa "Preveja", já corrigido.

**Mas havia um buraco sistemático:** quatro campos de explicação escrita eram salvos e nunca lidos por nada — a explicação da linha (etapa 2 da oficina), a reflexão (etapa 5), a explicação por passo de projeto e a explicação do engano no Treino dirigido. O texto da plataforma sempre foi honesto ("a plataforma não julga automaticamente se o texto demonstra domínio"), então não era mentira; era escrever no vazio, bem no ponto que mais importa para o objetivo do estudante, que é saber explicar.

- O Lumi passou a ler essas explicações a pedido, dizendo o que ficou certo, o que faltou dizer e uma pergunta para aprofundar. **Ele não conclui etapa e não dá XP** — os requisitos continuam sendo prova respondida e código com a saída certa, e a tela diz isso.
- O botão fica bloqueado enquanto não há texto escrito, e com o Ollama desligado a mensagem explica o motivo.
- Verificado no navegador, 1440 px e 390 px, com uma explicação incompleta de propósito: apontou corretamente que faltava falar da atribuição e perguntou o que a primeira linha guarda. 123 testes automatizados.

## Publicação, app no celular e IA no site (11/09/2026)

- Site no ar em `https://jaoabyo.github.io/pycampus/`, publicado pelo GitHub Actions a cada envio para `main`, **depois** de a suíte passar.
- Repositório limpo: 3,8 MB de capturas de desenvolvimento saíram do versionamento.
- App instalável: manifesto, ícone próprio (o Lumi) e service worker verificados no site ao vivo — todos respondendo 200, service worker registrado no escopo `/pycampus/`. As aulas passam a abrir sem internet depois do primeiro acesso.
- Lembrete de estudo com permissão de notificação. Sem servidor não há push: o aviso em segundo plano depende do aparelho permitir disparo periódico, e a tela diz exatamente isso em vez de prometer.
- **A IA passou a funcionar no site publicado.** O endereço do Ollama deixou de ser fixo; três travas precisavam cair juntas, e cada uma foi diagnosticada por teste: página https não pode chamar http (resolvido por túnel https), o Ollama recusa origem não declarada (`OLLAMA_ORIGINS`) e recusa `Host` estranho (`--http-host-header`). Verificado de ponta a ponta: o Lumi respondeu no celular, no site, com o modelo rodando no computador.
- Limite honesto: o endereço do túnel gratuito muda a cada início, e sem o computador ligado não há conversa — só as dicas escritas, que funcionam sempre.
- **Degrau 1 do Lumi agora é garantido no código.** Instruído a responder só com uma pergunta, o modelo obedeceu em dois de três testes e no terceiro entregou a correção antes de perguntar. `onlyQuestion` descarta tudo antes da primeira pergunta; resposta sem pergunta não vai para a tela. Quatro execuções seguidas depois da mudança: nenhuma vazou. 124 testes.

## Nivelamento concluído nos oito projetos (11/09/2026)

- `banco` (5 → 10 passos): o construtor pedia três atributos de uma vez, o depósito exigia `raise ValueError` — ensinado só no módulo 05 —, a retirada juntava duas guardas sem ter praticado uma, e a transferência estreava "método que recebe outro objeto". Cada ideia ganhou seu degrau, e a guarda passou a usar `return False`, que é o que a aula de encapsulamento ensina.
- `estoque` (5 → 9): saltava do banco em memória da aula para arquivo com `IF NOT EXISTS`, e cobrava `commit` e `fetchall`, ausentes de qualquer código executado em aula. Agora há um passo que repete a aula, um que descobre o `commit` pela ausência dele, e um só para `fetchall`.
- `api` (5 → 7): trocar a lista por banco, editar e remover eram um passo só, com `DELETE` estreando ali. Viraram três.
- `qualidade-projeto` (5 → 7): extrair uma regra do próprio código e nomear funções `test_` nunca tinham sido praticados; ganharam um ensaio cada, num exemplo pronto.
- `final` (5 → 9): o fluxo completo, a modelagem da tabela com a migração e a tríade separar/testar/tratar falhas vinham cada uma num único passo.
- Total: de 53 para 70 passos. Os ids originais continuam com o mesmo sentido e as anotações já salvas.
- `tests/project-levelling.test.js` passa com a **lista de dívida vazia**. Ele também aprendeu que um projeto batiza as próprias funções: nomes em português com sublinhado (`criar_habito`, `pode_sacar`) são do exercício, enquanto `print`, `append`, `fetchall` e `commit` continuam sendo cobrados como vocabulário a ensinar.
- 133 testes e a jornada do iniciante sem regressão.

## Visualizador de execução (11/09/2026)

- O worker ganhou um segundo modo: com `trace: true`, roda o programa sob `sys.settrace` e devolve, para cada linha percorrida, as variáveis daquele instante e a saída já impressa. É a técnica do Python Tutor, feita dentro do Pyodide que a plataforma já usa.
- Conferido no Python real com um laço: o rastro mostra a volta à linha do `for`, `total` indo de 0 a 1, 3 e 6, `numero` de 1 a 3, e a saída crescendo linha a linha. 13 passos para um programa de 5 linhas.
- A tela destaca a linha atual e **pinta de amarelo só as variáveis que mudaram naquele passo** — é o que faz a causa ficar visível. Tem passo a passo, reprodução automática e linha do tempo arrastável.
- Roda num worker próprio e descartável: a visualização nunca entra no diário de tentativas do estudante.
- Limite de 400 passos, com aviso na tela quando o programa é maior, em vez de travar o navegador.
- Aparece no passo 2 de cada aula, com o exemplo daquela aula, e no Laboratório, com o código livre.
- Verificado em 1440 px e 390 px na aula "Contas e operadores": começa no passo 1, a linha destacada muda ao avançar, as variáveis aparecem com os valores certos e uma delas fica destacada. Sem erro de console e sem rolagem horizontal.
- Um detalhe de acessibilidade corrigido no caminho: os controles chamavam-se "Próximo passo", igual ao botão do passo a passo comentado da aula — duas coisas diferentes com o mesmo nome na mesma tela.

## Modo prova (11/09/2026)

- Aba nova: cinco questões sorteadas entre as aulas **já concluídas**, com editor vazio, sem dica, sem quebra-cabeça e sem o Lumi. Abre a partir de três aulas concluídas.
- Verificado no navegador, 1440 px e 390 px, que nenhum dos três apoios aparece na tela da prova, e que a solução de referência da aula sorteada é aceita pela comparação de saída.
- O relatório final diz quantas foram aceitas, o tempo, e lista as aulas para revisar com atalho para cada uma. Encerrar antes do fim conta as não respondidas como erradas — verificado: 1 de 4 com 3 para revisar.
- **A prova não concede XP**, de propósito: ela mede o que já foi aprendido, e pagar de novo inflaria o nível sem aprendizado novo. Conta como atividade do dia e as tentativas entram no diário, alimentando o treino dirigido.
- Três minutos por questão é referência, não limite: passar disso entra no relatório e não reprova.
- Registros de prova passam por `normalizeProvas`: data inválida, acertos maiores que o total e aulas inexistentes são descartados, como em todo o resto do estado.
- 140 testes, jornada do iniciante sem regressão.

## Auditoria: as cinco frentes que faltavam (11/09/2026)

A verificação anterior falhou por limite de sessão, deixando 85 achados brutos sem veredito. Desta vez os achados foram extraídos dos transcripts dos agentes e conferidos contra o código atual, um a um, sem disparar novos agentes.

**Gating — 14 achados, todos já corrigidos.** A frente acusava que as pontes de função travavam a formação para sempre, que `normalizeState` apagava `functionBridges`, que cartão travado era só cosmético e que `practiceIsOpen` era importado e nunca usado. Dez verificações mecânicas mostram que tudo isso foi resolvido quando o gating foi ligado de fato. O achado de que `is-locked` não existia em CSS nenhum também está vencido: existe em `lesson.css` — minha primeira checagem olhou só `styles.css` e teria dado falso positivo.

**Visual — 16 achados, 2 confirmados e corrigidos agora.** O Diário de aprendizagem não tinha um único ícone na tela inteira e o bloco de entrega do projeto tinha um `h2` solto. Os dois ganharam o cabeçalho com tile colorido do padrão. O achado sobre Configurações sem tile é verdade, mas a tela inteira usa esse padrão: mudar só os cartões novos deixaria a tela inconsistente. Os demais foram resolvidos no caminho.

**Miniprojetos — 2 confirmados e corrigidos, ambos sérios.**
- `estoquezinho` tinha a etapa "Crie" esperando **a mesma saída** da etapa "Mude". Dava para concluir o miniprojeto e ganhar os 40 XP colando o código anterior, sem escrever a subtração pedida. A tarefa passou a usar estoque 12 e o teste novo impede que isso volte a acontecer em qualquer miniprojeto.
- `cofre` manda "reaproveitar a classe do exemplo" na etapa "Crie", mas o exemplo sai da tela nessa etapa. Agora ele fica consultável ali, recolhido.
- Conferido no Python real: **as 24 soluções produzem a saída esperada**.

**Aulas — 16 achados, verificados e em aberto.** A regra da explicação visível está cumprida (o teste passa). Os achados são sobre distância entre exemplo e desafio — o `while` conta para baixo no exemplo e para cima no desafio; `complexidade` mostra busca com `return` e pede contador acumulado; `validacao` só lança a exceção e o desafio pede lançar e capturar. São observações pedagógicas legítimas que exigem reescrever conteúdo, e ficam registradas para a próxima rodada.

**Pesquisa — 13 achados, parcialmente vencidos pelo trabalho posterior.** "Parsons não é usado como degrau nas funções" caiu quando o quebra-cabeça passou a existir em toda atividade. "Não existe tabela de rastreio de parâmetro e retorno" foi endereçado pelo visualizador de execução. Seguem em aberto: as pontes de função não têm etapa de previsão antes de rodar, nem auto-explicação escrita, e o estudante não testa o retorno da própria função com `assert` antes do módulo 07.

**Resumo honesto:** dos 85 achados sem veredito, a maioria estava vencida pelo trabalho feito desde então; 4 eram reais e foram corrigidos agora; os de conteúdo de aula e de sequência das pontes continuam abertos e nomeados, em vez de dados como resolvidos.

## Progresso na nuvem, relatório e recomeçar do zero (13/09/2026)

- **Progresso guardado num Gist privado da conta do próprio estudante.** Sem servidor nosso e sem conta nova: o token do GitHub, com escopo apenas de Gists, fica no `localStorage` daquele navegador e nunca entra no repositório. Sobe sozinho 20 segundos depois da última mudança, e só quando algo mudou de verdade — o GitHub não é chamado a cada tecla. Trazer de outro aparelho cai no mesmo diálogo de junção já verificado: juntar é o caminho normal, substituir fica atrás do aviso.
- **Relatório para avaliação externa**, montado do que a plataforma registrou: progresso, onde mais travou no período, padrões do diagnóstico com a linha do próprio estudante, as explicações que ele escreveu e os resultados das provas. A tela avisa quando faz três dias ou mais. Verificado com um campus vazio: o texto sai honesto ("nenhuma ainda", "ainda não fiz nenhuma prova"), sem `undefined` nem `NaN`.
- **Recomeçar do zero**, com exportação oferecida antes de apagar.
- **Armadilha encontrada no caminho, e ela é do projeto inteiro:** as páginas (`Dashboard`, `Settings`, …) são funções declaradas dentro de `App`. Cada render de `App` cria uma identidade nova de componente, então o React desmonta e remonta a subárvore e **apaga todo `useState` local**. O relatório sumia no mesmo clique que o criava. A correção foi derivar o texto do estado em vez de guardá-lo; a armadilha ficou registrada no cofre, porque vai morder de novo.
- 148 testes, jornada do iniciante sem regressão, verificado em 1440 px e 390 px.
- **O túnel do Lumi para o celular parou de funcionar nesta rede:** o endereço `trycloudflare.com` não resolve mais o DNS daqui, embora tenha funcionado em 11/09. A IA local no computador está intacta — isso afeta apenas o acesso pelo celular ao site publicado.

## Página "Sobre e limites" estava quebrada (13/09/2026)

- Relatado pelo estudante. A página montava os cartões soltos, sem o contêiner que o resto do produto usa: os seis ficavam **colados, com folga zero**, parecendo um bloco quebrado, e o texto se esticava por 1440 px sem largura de leitura.
- Causa: `.card` não tem margem própria; o espaçamento vem sempre do contêiner (`.settings-list`, `.targeted-list`, …). Eu montei a tela sem nenhum — exatamente o erro que a regra "interface nova se baseia no visual que já existe" existe para evitar.
- Corrigido reaproveitando `.settings-list`, que já dá o espaçamento de 20 px e a largura de leitura de 820 px.
- **A jornada automatizada passou a medir isso**: cartões empilhados com menos de 6 px de folga viram problema, em todas as abas. O detector foi provado contra a versão publicada com o defeito — acusou os 5 cartões com folga 0 — e contra a corrigida, onde não acusa nada. Um detector que nunca dispara não vale nada.
- A jornada também passou a visitar as abas novas, Modo prova e Sobre e limites, que não estavam cobertas.
- Corrigido no caminho: a página ainda dizia que o progresso é só do aparelho, o que deixou de ser verdade quando a nuvem entrou.
# Revisão para estudar · 14/09/2026

Conferência do estado atual após as mudanças feitas com Claude. Os testes de navegador usaram
perfis temporários: não editaram o armazenamento nem a conta do estudante.

- `npm test`: **215 testes aprovados**; `npm run build`: compilação aprovada.
- `npm run test:curriculum`: **143 programas** executados no Pyodide e jornada de aula aprovada.
- `node scripts/check-study-flow.mjs`: **13 telas em 1440 e 390 px**, sem erros React ou
  transbordo horizontal; miniprojeto completo com previsão incorreta, erro Python, correção,
  rejeição de resposta sem conversão, confirmação animada, prova, XP e retomada após recarga.
- `node scripts/check-project-study.mjs`: oito estúdios, edição/baixar README, guia de GitHub,
  entrada pré-preenchida do passo retomado sem isolamento e callback de interrupção único.
- `node scripts/check-published-study.mjs`: build servido sem COOP/COEP; service worker isolou
  a página, input perguntou e a resposta 21 produziu 22. Não foi uma publicação no GitHub Pages.
- Lumi local `qwen2.5-coder:14b`: os três casos de leitura de explicação passaram em uma rodada.
  Isso não garante acerto em toda resposta, nem verifica o túnel da IA para o celular.

Correções: ordem visual da oficina; prova final após Mude e Crie; acerto antigo não permanece
depois de editar/errar; número parcial não vale como previsão; etiqueta exige conversão; XP
conquistado não some durante revisão; posição salva; instruções honestas de entradas automáticas;
retomada de entradas no projeto; interrupção resolve quem aguarda a execução do Python.

Limites: saída e requisitos medidos não provam todos os comportamentos nem domínio do aluno.
Não houve publicação, envio de repositório, sincronização com Gist ou alteração das credenciais.
As capturas locais ficam em `artifacts/study/`.

## Acabamento visual · 14/09/2026

- O **Modo prova** ganhou uma abertura visual com propósito, regras e ação principal bem separados.
- O **Treino dirigido** usa duas colunas no computador e expande o cartão aberto para facilitar a prática; no celular, mantém uma coluna.
- **Configurações** aproveita melhor a largura do computador, preservando a ordem e a leitura vertical no celular.
- `npm test`: **215 testes aprovados**; `npm run build`: aprovado.
- `node scripts/check-study-flow.mjs`: **26 capturas** em 1440 e 390 px, sem transbordo horizontal, além do miniprojeto real aprovado.

## Segunda rodada de acabamento visual · 14/09/2026

- A Oficina de prática distribui os cinco passos na mesma linha em telas largas; o layout muda para três, duas e uma coluna conforme a largura diminui.
- O estado vazio do Diário orienta o primeiro uso com o fluxo “Escreva → Execute → Revise”.
- O mapa de atividade do Perfil ganhou tamanho e contraste para tornar os dias estudados identificáveis.
- A página Sobre usa duas colunas no computador para os blocos complementares e preserva leitura em uma coluna no celular.
- `npm test`: **215 testes aprovados**; build e jornada visual em 1440 e 390 px aprovados.

## Roteiro visível no estúdio de projetos · 14/09/2026

- Cada estúdio agora mostra o passo atual, quantos passos de construção faltam e uma barra de progresso antes do editor.
- Ao registrar todos os passos, o mesmo bloco orienta a sequência de entrega: README, GitHub e conferência final.
- A barra só apresenta o estado já salvo; não libera etapas nem altera XP, requisitos ou critérios de aprovação.
- `npm test`: **215 testes aprovados**; build aprovado; `check-project-study` aprovou os oito estúdios, README, guia de entrega, retomada e interrupção do executor.

## Entrega guiada do projeto · 14/09/2026

- As três fases de entrega — escrever README, baixar/testar arquivos e publicar no GitHub — agora compartilham um roteiro visual, com a fase atual destacada.
- O conteúdo e a ordem continuam os mesmos; o ajuste só torna claro que uma fase prepara a próxima.
- `npm test`: **215 testes aprovados**; build aprovado.
