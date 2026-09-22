# Entregas práticas e qualidade de ensino da faculdade

Data: 22 de setembro de 2026  
Prazo das entregas: 27 de setembro de 2026

## Intenção e critério de sucesso

O estudante usa o PyCampus como ambiente principal para aprender Linguagem de Programação e está atrasado na disciplina: concluiu 6 das 16 aulas. O objetivo não é apenas disponibilizar respostas. A plataforma deve ensinar cada técnica antes de cobrá-la, permitir que o estudante construa as quatro atividades práticas com entendimento e produzir materiais que possam ser abertos no Google Colab e enviados no AVA.

O trabalho estará correto quando:

- as 16 aulas continuarem curtas, mas todo recurso exigido por seus desafios e pelas atividades estiver explicado e praticado antes do uso;
- as quatro atividades práticas dos roteiros oficiais tiverem estúdios próprios, com passos pequenos, execução real quando compatível, pistas graduais e reflexão;
- o mesmo conteúdo acadêmico continuar aparecendo em Minha faculdade, Minha formação, Projetos, busca, prova e plano diário sem cópias divergentes;
- cada atividade puder gerar um notebook `.ipynb` compatível com Google Colab e um relatório imprimível em PDF;
- o progresso, o código e os textos do estudante sobreviverem ao recarregamento e ao backup;
- nenhuma tela afirmar que enviou algo para o AVA: o envio final continua sendo uma ação manual do estudante;
- testes automáticos provarem que exemplos, soluções, notebooks e migrações funcionam.

Como restam cinco dias entre a data deste documento e o prazo, a ordem de entrega é orientada a risco: primeiro entram os estúdios utilizáveis, a persistência e as exportações; em seguida a integração nas demais abas; por último os refinamentos visuais que não bloqueiam o estudo. A plataforma deve indicar uma agenda intensiva até 27/09, sem prometer que estudar ou entregar aconteceu automaticamente.

## Evidência dos materiais

A pasta contém 33 PDFs: 28 arquivos únicos e cinco cópias repetidas. Os 28 documentos únicos são quatro apostilas, vinte apresentações e quatro roteiros de aula prática. Todos pertencem à disciplina Linguagem de Programação.

Os roteiros oficiais encontrados são:

1. Unidade 1 — sistema de gestão de notas: cadastrar notas numa lista, calcular média, determinar aprovação com corte 7 e exibir relatório.
2. Unidade 2 — sistema de biblioteca: classe `Livro`, lista de livros, cadastro, listagem, busca por título e gráfico da quantidade por gênero.
3. Unidade 3 — análise de vendas: SQLite, pandas, análise, Matplotlib/Seaborn, conclusões e sugestões para a empresa.
4. Unidade 4 — classificação de flores Iris: TensorFlow, pandas, scikit-learn, separação treino/teste, normalização, rede neural, avaliação e previsões.

Os quatro pedem Google Colab, código comentado, testes com entradas diferentes e entrega de relatório `.docx` ou `.pdf` com uma execução registrada e uma explicação breve da lógica. A captura do AVA informa Word/PDF e limite de 10 MB.

## Decisão de arquitetura

Será criado um módulo profundo para as entregas acadêmicas. Sua interface deve oferecer poucas operações:

- listar e localizar entregas;
- obter o estado normalizado de uma entrega;
- verificar requisitos do código e do relatório;
- construir um notebook Colab;
- construir um relatório HTML imprimível.

Toda complexidade específica de cada roteiro fica na implementação desse módulo: passos, código inicial, requisitos, casos de teste, células do notebook e seções do relatório. As telas consomem a mesma interface. Isso evita escrever uma versão em Minha faculdade e outra versão diferente em Projetos.

Arquivos previstos:

- `src/faculdade-entregas.js`: fonte única das quatro entregas, requisitos e estado normalizado;
- `src/faculdade-exportacao.js`: geradores puros de notebook Colab e relatório imprimível;
- `src/FaculdadeEntrega.jsx`: estúdio de construção e preparação do envio;
- `src/faculdade-entrega.css`: estilos responsivos e de impressão;
- `tests/faculdade-entregas.test.js`: contratos, validação e backup;
- `tests/faculdade-exportacao.test.js`: notebook, relatório e segurança da exportação;
- `tests/faculdade-entregas-reference.js`: soluções executáveis usadas apenas pelos testes;
- ajustes pequenos em `Faculdade.jsx`, `FaculdadeIntegrada.jsx`, `faculdade-integrada.js`, `progress.js`, `merge-progress.js` e nos verificadores de navegador.

Não será criado um segundo sistema genérico de projetos nem serão misturadas essas entregas com os oito projetos de portfólio. Os quatro miniprojetos acadêmicos atuais continuam como preparação curta; as quatro entregas oficiais aparecem depois deles como trabalho maior.

## Modelo de uma entrega

Cada entrada de `entregasDaFaculdade` terá:

- `id`, `unidade`, `titulo`, `origem`, `prazo`, `minutos`;
- `objetivo` e `resultadoEsperado`;
- `preRequisitos`: ids das aulas e práticas que ensinam as técnicas;
- `passos`: título, explicação, tarefa, pista em degraus, teste e pergunta de reflexão;
- `starter`, `esperado`, `stdin` quando necessário;
- `ambiente`: `pycampus` ou `colab`, com uma prática local separada quando a entrega exigir bibliotecas incompatíveis;
- `requisitosCodigo`: verificações abertas da técnica, sem exigir nomes idênticos aos da referência;
- `casosDeTeste`: entradas e resultados que o estudante precisa demonstrar;
- `notebook`: células Markdown e código que serão montadas com o trabalho salvo;
- `relatorio`: seções e perguntas que geram o documento imprimível;
- `notaAmbiente`: diferenças honestas entre Pyodide e Colab.

O estado normalizado será guardado em `state.faculdade.entregas[id]`:

- `codigo`;
- `passosConcluidos`;
- `saida` e data da última execução correta;
- `logica`, `testes`, `conclusao` e `insights` quando aplicável;
- `prontoParaExportar` derivado, nunca confiado diretamente ao backup;
- `concluidaEm`, registrada somente depois da conferência final do estudante.

Dados antigos continuam válidos. Campos desconhecidos, textos excessivos, ids inválidos e estados impossíveis serão removidos na normalização.

## Fluxo pedagógico

Cada entrega seguirá a mesma sequência visível:

1. **Antes de construir** — mostra o que já foi aprendido, o que ainda falta e links diretos para as aulas necessárias.
2. **Entenda o problema** — traduz o roteiro oficial para uma lista curta de comportamentos observáveis.
3. **Construa em passos** — um conceito por passo; primeiro previsão, depois trecho explicado, pequena alteração e implementação própria.
4. **Execute e teste** — o estudante roda casos normais e limites. Saída pronta impressa manualmente não satisfaz os requisitos de técnica.
5. **Explique com suas palavras** — campos específicos para lógica, testes e conclusão. O Lumi pode fazer perguntas, mas não escrever a entrega pelo estudante.
6. **Prepare o Colab** — baixa um `.ipynb` contendo título, objetivos, explicações do estudante e o código final.
7. **Prepare o relatório** — abre uma versão limpa e imprimível. O estudante usa “Imprimir → Salvar como PDF”.
8. **Envie no AVA** — checklist final: executar no Colab, conferir identificação, gerar PDF abaixo de 10 MB e enviar manualmente.

Os botões avançam somente quando o passo atual foi executado ou respondido. Voltar nunca apaga trabalho. A conclusão não concede respostas automáticas nem finge avaliação docente.

## Conteúdo das quatro entregas

### Unidade 1 — Gestão de notas

Passos de ensino:

1. representar as notas numa lista;
2. validar e converter os valores;
3. criar `calcular_media` e diferenciar `return` de `print`;
4. decidir a situação com `if/else` e corte maior ou igual a 7;
5. organizar entrada, processamento e relatório em funções;
6. testar aprovação, reprovação e nota no limite 7.

O relatório mostra as notas, a média com duas casas e a situação. A implementação deve aceitar notas diferentes; imprimir apenas o exemplo não conclui a atividade.

### Unidade 2 — Biblioteca

Passos de ensino:

1. modelar `Livro` com título, autor, gênero e quantidade;
2. criar objetos e armazená-los numa lista;
3. cadastrar sem repetir a lógica;
4. listar com laço e acessar atributos;
5. buscar por título de forma tolerante a maiúsculas/minúsculas;
6. agregar quantidades por gênero num dicionário;
7. gerar gráfico de barras com Matplotlib;
8. testar busca existente, busca ausente e mais de um livro do mesmo gênero.

O PyCampus verificará o gráfico por seus dados e pela quantidade de barras, pois o executor atual não renderiza a imagem. O notebook Colab exibirá o gráfico normalmente.

### Unidade 3 — Análise de vendas

Passos de ensino:

1. conectar ao SQLite e explicar conexão, cursor e transação;
2. criar a tabela de forma repetível com `IF NOT EXISTS`;
3. inserir os quatorze registros sem duplicá-los a cada execução;
4. carregar a consulta num DataFrame;
5. inspecionar tipos, ausências e duplicações;
6. calcular total, média e receita por categoria;
7. localizar melhores categorias e períodos;
8. criar visualizações coerentes;
9. escrever insights baseados nos números e sugestões para a empresa;
10. fechar recursos e repetir a execução para provar que o notebook é reproduzível.

O mesmo código deverá rodar no PyCampus e no Colab. Como Seaborn não está instalado no Pyodide, o código tentará importá-lo e usará Matplotlib como alternativa quando ele não existir. No Colab, Seaborn será usado. A tela explicará essa diferença; não haverá `pip install` dentro do executor do PyCampus.

### Unidade 4 — Classificador de flores Iris

Passos de ensino:

1. distinguir características de entrada (`X`) e rótulos de saída (`y`);
2. conhecer as quatro medidas do conjunto Iris e suas três espécies;
3. separar treino e teste e explicar por que avaliar nos mesmos dados seria enganoso;
4. ajustar `StandardScaler` somente com o treino e transformar treino e teste;
5. entender uma rede `Sequential`, camadas `Dense`, ativação `relu` e saída `softmax`;
6. compilar com otimizador, função de perda e métrica coerentes com classificação multiclasse;
7. treinar com `fit`, acompanhar épocas sem confundir treino com avaliação;
8. avaliar com `evaluate` e interpretar acurácia como medida limitada;
9. prever probabilidades, usar a maior com `argmax` e recuperar o nome da espécie;
10. executar no Colab, registrar a acurácia real e testar novas amostras.

O notebook final usará TensorFlow e scikit-learn, como o roteiro exige. Essas bibliotecas não rodam no Pyodide do PyCampus. A preparação dentro da plataforma usará um classificador pequeno e executável para ensinar características, rótulos, separação, normalização, previsão e acurácia; ela não fingirá ser a rede neural. O código TensorFlow será construído em células explicadas e validado estruturalmente no PyCampus, mas a conclusão exigirá que o estudante o execute no Google Colab e registre o resultado observado.

## Melhoria das 16 aulas

As aulas atuais serão auditadas por uma matriz “ensinado → visto rodando → alterado → cobrado”. Para cada símbolo, função, método ou conceito usado em um desafio, projeto, exercício do AVA ou entrega prática, deverá existir antes:

- uma explicação em linguagem simples;
- um trecho executável visível;
- uma pequena alteração guiada;
- uma pergunta de recuperação coerente com o que apareceu.

Melhorias prioritárias:

- diferenciar `loc` por rótulo de `iloc` por posição, usando o exemplo oficial `loc[[0, 20, 70]]`;
- aprofundar listas, classes, métodos e busca antes da entrega da biblioteca;
- ensinar agregação por dicionário antes do gráfico por gênero;
- separar conexão, cursor, `execute`, `commit` e consulta antes da análise SQLite;
- ensinar DataFrame, limpeza, agregação e gráfico em passos independentes;
- distinguir execução no PyCampus, no Colab e em ambiente local;
- transformar os encerramentos dos slides em revisões curtas de recuperação, sem aumentar o total fixo de 16 aulas antes da prova.

O total permanece em 16 aulas. Conteúdo complementar entra nos guias e práticas das aulas correspondentes, não como novas aulas que fariam o progresso do estudante regredir de 6/16 para 6/N.

## Integração nas abas

- **Visão geral:** próxima aula ou próxima etapa de uma entrega, escolhida pelo prazo e pelos pré-requisitos.
- **Minha formação:** conexão explícita entre competências gerais e cada entrega acadêmica.
- **Oficina de prática:** novas práticas pequenas apenas quando houver um degrau ausente, como agregar gêneros ou testar limite 7.
- **Projetos:** seção “Entregas da faculdade” com os quatro trabalhos, prazo, progresso e botão continuar.
- **Minha faculdade:** cada unidade apresenta aulas, miniprojeto, exercício do AVA e entrega oficial nessa ordem.
- **Modo prova:** continua cobrando somente aulas concluídas; não mistura o texto pronto dos relatórios.
- **Diário e calendário:** execução e conclusão das etapas contam como estudo; exportar arquivo, sozinho, não conta como domínio.
- **Busca:** encontra entregas, passos e conceitos associados.

## Exportação e segurança

### Notebook

O `.ipynb` será JSON válido no formato nbformat 4, gerado no navegador. Não conterá tokens, caminhos locais ou respostas secretas. Cada notebook incluirá identificação editável, enunciado resumido, células de construção, testes e conclusão. A Unidade 3 usará caminhos relativos e banco criado pelo próprio notebook.

### Relatório

O relatório será HTML sem dependências externas, com folha de impressão A4. Ele mostrará identificação, objetivo, código final, registro da saída, casos testados, explicação e conclusão. O texto do estudante será escapado antes de entrar no HTML. Um botão abrirá a impressão do navegador para salvar como PDF. A tela lembrará do limite de 10 MB e de conferir o arquivo antes do envio.

O PyCampus não enviará arquivos diretamente para o AVA e não armazenará credenciais acadêmicas.

## Testes e validação

O desenvolvimento seguirá TDD. A verificação inclui:

- contratos das quatro entregas e dos pré-requisitos;
- soluções de referência executadas no Python real;
- requisitos recusando saídas decoradas;
- notebook válido, com células esperadas e código salvo;
- relatório escapando HTML e contendo todas as seções obrigatórias;
- normalização, backup e junção de progresso;
- fluxo mobile e desktop no Playwright;
- ausência de erros de console e rolagem horizontal;
- build e limite de pacote;
- auditoria da ementa e matriz “ensinado antes de cobrado”.

Comandos finais: `npm test`, `npm run auditar:ementa`, `npm run test:faculdade`, `npm run test:iniciante`, `npm run test:abas`, `npm run build` e `npm run test:bundle`.

## Fora do escopo imediato

- envio automático para o AVA;
- geração de `.docx` com biblioteca adicional;
- execução de KivyMD ou TensorFlow no navegador;
- alteração do total de 16 aulas;
- reestruturação ampla de `App.jsx` durante o período de estudo.

Quando novos PDFs chegarem, eles serão classificados como aula, exercício ou entrega e conectados ao mesmo módulo, sem criar uma trilha paralela.
