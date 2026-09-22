# Roteiro das entregas práticas — até 27/09/2026

Este roteiro organiza os quatro trabalhos oficiais de Linguagem de Programação. O objetivo é aprender e produzir evidências próprias, não apenas copiar uma solução. O PyCampus salva o rascunho no navegador; faça também um backup em Configurações antes de limpar dados ou trocar de aparelho.

## As quatro entregas

| Unidade | Trabalho | Base antes de construir | Resultado final |
| --- | --- | --- | --- |
| 1 | Sistema de gestão de notas | variáveis e conversões, condicionais, repetição e funções | média, situação, casos de limite, notebook e relatório |
| 2 | Sistema de biblioteca | sequências, coleções, classes/objetos e módulos/gráficos | cadastro, listagem, busca, contagem por gênero e gráfico |
| 3 | Análise de vendas | SQLite, pandas, manipulação e visualização | tabela `vendas1` e `df_vendas` do roteiro, análises, gráficos, três insights e sugestões |
| 4 | Classificação de flores Iris | web, interfaces, testes e fundamentos de machine learning | pipeline, rede TensorFlow no Colab, avaliação e predições |

Em cada estúdio, siga a ordem **Entender → Construir → Testar → Explicar → Exportar**. Não marque um passo só para avançar: a explicação, a saída e o checklist são as evidências que ajudam a localizar o que ainda precisa ser aprendido.

## Duas coisas erradas nos roteiros da faculdade

Confira no PDF antes de seguir o checklist; estes dois pontos foram verificados nos arquivos originais.

1. **O CHECKLIST das Unidades 2, 3 e 4 foi copiado da Unidade 1.** Nos três, ele ainda manda "implementar as funcionalidades de adicionar notas, calcular média, determinar situação e exibir relatório final" — que é o trabalho de notas da Unidade 1. Quem manda é a seção **ATIVIDADE PROPOSTA**: biblioteca na 2, vendas na 3, Iris na 4. Siga essa.
2. **O roteiro da Unidade 3 pula uma linha essencial.** O Passo 1 cria a tabela `vendas1`, e o Passo 2 já fala do DataFrame `df_vendas` como se ele existisse — mas nunca mostra como ele nasce. A ponte que falta é `df_vendas = pd.read_sql_query("SELECT * FROM vendas1", conexao)`. O estúdio da Unidade 3 ensina exatamente essa linha.

Ainda na Unidade 3: o roteiro escreve `CREATE TABLE vendas1` sem `IF NOT EXISTS`, então rodar a célula uma segunda vez dá erro e duplicaria as vendas. O estúdio apaga a tabela antes de criar (`DROP TABLE IF EXISTS vendas1`), o que mantém o resultado do professor e deixa o notebook reexecutável — o Colab pede "Executar tudo" mais de uma vez.

## Agenda intensiva

- **22/09 — Unidade 1:** revisar as quatro aulas-base, construir a gestão de notas e testar média abaixo de 7, exatamente 7, acima de 7 e lista vazia.
- **23/09 — Unidade 2:** revisar coleções e classes, construir a biblioteca e conferir busca existente, busca inexistente e contagem por gênero.
- **24/09 — Unidade 3:** revisar SQLite e pandas, construir a análise de vendas, reexecutar sem duplicar registros e escrever três insights com números.
- **25/09 — Unidade 4:** estudar treino/teste, normalização, avaliação e predição; construir o notebook Iris e executar a prática local para entender o pipeline.
- **26/09 — Colab e relatórios:** executar os quatro notebooks do início ao fim no Google Colab, registrar saídas reais, abrir os relatórios e salvar os PDFs.
- **27/09 — conferência e envio:** revisar a identificação e os critérios, verificar o limite de 10 MB e enviar manualmente no AVA antes do horário informado pela faculdade.

Se um dia atrasar, não pule a base para “ganhar tempo”: conclua primeiro a Unidade 1, depois a 2, a 3 e a 4. Na última revisão, priorize critérios pendentes e erros reais de execução.

## Como levar o notebook ao Google Colab

1. Na fase **Exportar**, escolha **Baixar notebook**.
2. Abra [Google Colab](https://colab.research.google.com/), escolha **Arquivo → Fazer upload de notebook** e selecione o `.ipynb`.
3. Use **Ambiente de execução → Executar tudo**.
4. Leia cada erro pela última linha, corrija a causa e execute novamente desde o início.
5. Na Unidade 3, o roteiro pede **Seaborn**, que não existe no PyCampus. O código do estúdio já tenta `import seaborn` e cai no Matplotlib quando ele falta: no Colab o Seaborn existe, então o gráfico sai no estilo pedido sem você mudar nada. Confirme na saída qual biblioteca foi usada antes da captura.
6. Na Unidade 4, copie para o PyCampus a acurácia e as predições realmente observadas e registre a data. A prática local não substitui a rede TensorFlow.
7. Salve uma cópia final do notebook com as células executadas.

## Relatório, capturas e PDF

Na fase **Exportar**, escolha **Abrir relatório**. Confira se aparecem código, saída, casos testados, explicação e conclusão. Quando o roteiro ou o AVA pedir uma imagem, faça uma captura que mostre a célula executada e a saída correspondente; não use uma saída de outro teste.

Use **Ctrl+P → Salvar como PDF**, abra o arquivo salvo e confira todas as páginas. O PDF deve ficar abaixo de **10 MB**. Se ultrapassar, recorte capturas para a área relevante ou comprima as imagens antes de gerar novamente.

## Conferência final no AVA

- nome e identificação corretos;
- notebook abre e executa do começo ao fim;
- saída real visível, especialmente na Unidade 4;
- testes normais, limites e falhas explicados;
- relatório legível e PDF abaixo de 10 MB;
- nomes dos arquivos correspondem à unidade;
- arquivos selecionados no campo certo do AVA;
- confirmação de envio visível antes de fechar a página.

O **envio final continua sendo responsabilidade do estudante**. O PyCampus não entra na conta da faculdade, não guarda credenciais e não envia arquivos ao AVA.
