// Pontes: a explicação curta de cada coisa que o código do professor usa e o guia não mostrou.
//
// O guia de uma aula ensina poucos trechos, bem explicados. O exemplo do material vem depois e
// reúne muito mais — o estudante descreveu como "do nada vem uma porrada de código que eu nunca
// vi". Cada ponte aparece logo antes desse código, com o valor que ele produz no próprio
// exemplo. A lista não é escrita de memória: tests/faculdade-novidades.test.js mede os termos
// novos de cada exemplo e falha se algum ficar sem ponte, ou se uma ponte sobrar sem uso.
const ponte = (termos, mostra, explicacao) => ({ termos, mostra, explicacao });

export const pontesDasAulas = {
  u1a1: [
    ponte(['type()', '.__name__'], 'type(nome).__name__',
      'type(valor) pergunta ao Python de que tipo é o valor, e .__name__ pega só o nome desse tipo. Por isso type(nome).__name__ mostra str (texto) e type(nota_1).__name__ mostra int (inteiro). Sem o .__name__, print(type(nota_1)) mostra <class \'int\'>, o formato que aparece no Colab e na prova.'),
    ponte(['True'], 'True',
      'True é o valor "verdadeiro" do tipo bool; o outro valor possível é False. Escreve-se sem aspas e com a primeira letra maiúscula: fez_inscricao = True registra que a inscrição foi feita.'),
  ],
  r2: [
    ponte(['break'], 'break',
      'break encerra o for na hora, mesmo que ainda haja itens na lista. Ao encontrar a nota 0, o laço para: só 5 e 4 entram na soma, os valores depois do 0 nunca são lidos, e a média sai 4.5.'),
  ],
  r3: [
    ponte(['lambda'], 'lambda numero: numero * 2',
      'lambda cria uma função pequena numa linha só, sem def. lambda numero: numero * 2 recebe numero e devolve o dobro. Guardada em dobro, ela é chamada como qualquer função: dobro(4) dá 8.'),
  ],
  u2a2: [
    ponte(['.add'], 'meu_conjunto.add(10)',
      'add coloca um valor no conjunto. Adicionar 20 duas vezes não duplica: um conjunto guarda cada valor uma vez só.'),
    ponte(['.remove'], 'meu_conjunto.remove(20)',
      'remove tira o valor do conjunto. Se o valor não estiver lá, o Python avisa com um erro (KeyError).'),
    ponte(['sorted()'], 'sorted(meu_conjunto)',
      'sorted devolve uma lista em ordem crescente. Um conjunto não tem ordem garantida, por isso o exemplo usa sorted para mostrar sempre [10, 20].'),
    ponte(['dict()'], 'dict([("nome", "Maria"), ("idade", 25)])',
      'dict cria um dicionário a partir de pares. Cada tupla (chave, valor) da lista vira uma entrada: "nome" ligado a "Maria", "idade" ligado a 25.'),
    ponte(['zip()'], 'zip(["nome", "idade"], ["Maria", 25])',
      'zip junta duas listas posição por posição: ("nome", "Maria") e ("idade", 25). Com dict em volta, a primeira lista vira as chaves e a segunda os valores. Os quatro dicionários ficam iguais, e o print mostra True.'),
    ponte(['numpy', '.array'], 'import numpy as np\nnp.array([1, 2, 3, 4, 5])',
      'NumPy é a biblioteca de contas com muitos números; np é o apelido, como o m do math. np.array cria um array, parecido com uma lista, mas que faz a conta em todos os itens de uma vez: my_array ** 2 eleva cada número ao quadrado e dá 1, 4, 9, 16 e 25.'),
  ],
  u2a3: [
    ponte(['super()'], 'super().__init__(marca, modelo, ano)',
      'super() dá acesso à classe-pai. Esta linha roda o __init__ de Veiculo, que já guarda marca, modelo, ano e velocidade; o Carro só acrescenta a potencia. Sem ela, você repetiria as quatro linhas do pai. Repare também que o Carro reescreve acelerar: carro1.acelerar(50) usa a versão do Carro, que soma 50 e mais 150 de potência, e por isso o status mostra 200 km/h, e não 50.'),
  ],
  u2a4: [
    ponte(['.log2'], 'm.log2(1024)',
      'log2 responde: 2 elevado a quanto dá 1024? Dá 10.0, porque multiplicar dez vezes o número 2 (2 × 2 × ... × 2) dá 1024.'),
    ponte(['factorial()'], 'from math import factorial',
      'from math import factorial traz só a função factorial, que passa a ser chamada sem o math. na frente. factorial(5) é 5 × 4 × 3 × 2 × 1 = 120.'),
    ponte(['matplotlib', '.use'], 'import matplotlib\nmatplotlib.use("Agg")',
      'Matplotlib é a biblioteca de gráficos. matplotlib.use("Agg") manda desenhar o gráfico como imagem, sem abrir janela. No PyCampus o gráfico aparece com ou sem essa linha. No Colab, apague-a: ela pode impedir o gráfico de aparecer embaixo da célula, e o trabalho ficaria sem gráfico.'),
    ponte(['matplotlib.pyplot', '.pyplot'], 'import matplotlib.pyplot as plt',
      'pyplot é a parte do Matplotlib que desenha. import matplotlib.pyplot as plt a carrega com o apelido plt, do mesmo jeito que import math as m.'),
    ponte(['.bar'], 'plt.bar(meses, vendas)',
      'bar desenha uma barra por item. A primeira lista dá o nome embaixo de cada barra e a segunda dá a altura, par a par: Janeiro com 120, Fevereiro com 90. As duas listas precisam ter o mesmo tamanho.'),
    ponte(['color='], 'color="royalblue"',
      'color= é um parâmetro nomeado: em vez de depender da posição, você diz o nome da opção e o valor. color="royalblue" pinta as barras de azul; tirar essa parte deixa a cor padrão.'),
    ponte(['.xlabel', '.ylabel'], 'plt.xlabel("Mes")\nplt.ylabel("Vendas (em unidades)")',
      'xlabel escreve o nome do eixo de baixo (x) e ylabel o do eixo do lado (y). Sem eles, quem lê o gráfico vê as barras, mas não sabe o que os números significam.'),
    ponte(['.title'], 'plt.title("Vendas Mensais")',
      'title escreve o título no topo do gráfico.'),
    ponte(['.gca', '.patches', '.get_title'], 'plt.gca().patches\nplt.gca().get_title()',
      'As duas últimas linhas não desenham nada: elas conferem o gráfico em texto. gca() pega o gráfico atual; patches é a lista das barras desenhadas, e len conta 5; get_title() lê o título de volta. Você não precisa delas para fazer um gráfico.'),
  ],
  u3a1: [
    ponte(['SQL IF', 'SQL NOT', 'SQL EXISTS'], 'CREATE TABLE IF NOT EXISTS',
      'IF NOT EXISTS faz o CREATE TABLE só criar a tabela quando ela ainda não existe. Num banco guardado em arquivo, como o dados_vendas.db do trabalho, executar a célula de novo sem isso daria erro de tabela já existente. Com :memory:, como aqui, o banco nasce vazio a cada execução.'),
    ponte(['SQL INTEGER', 'SQL REAL'], 'INTEGER, REAL, TEXT',
      'São os tipos das colunas. INTEGER guarda números inteiros (estoque 50), REAL guarda números com casas decimais (preço 19.99) e TEXT guarda texto (nome).'),
    ponte(['SQL PRIMARY', 'SQL KEY'], 'id INTEGER PRIMARY KEY',
      'PRIMARY KEY faz do id o identificador de cada linha: dois produtos nunca têm o mesmo id. Se o INSERT não informa o id, o SQLite numera sozinho, e a Camiseta ganha o id 1.'),
    ponte(['SQL NULL'], 'nome TEXT NOT NULL',
      'NULL é o "vazio" do SQL. NOT NULL proíbe deixar a coluna vazia: todo produto precisa ter nome e preço, e um INSERT sem eles é recusado.'),
    ponte(['SQL UPDATE', 'SQL SET', 'SQL WHERE'], 'UPDATE Produtos SET preco = ? WHERE id = ?',
      'UPDATE altera linhas que já existem. SET diz o que muda (o preço) e WHERE escolhe quais linhas mudam (a de id 1). Sem o WHERE, todas as linhas receberiam o preço novo.'),
    ponte(['SQL DELETE'], 'DELETE FROM Produtos WHERE id = ?',
      'DELETE apaga linhas. Aqui o WHERE também é o que protege: com ele só a linha de id 1 sai; sem ele, a tabela inteira ficaria vazia.'),
    ponte(['.fetchone'], 'cursor.fetchone()',
      'fetchone pega só o primeiro resultado da consulta, como uma tupla: (\'Camiseta\', 24.99). fetchall, que o guia mostrou, pega todos numa lista.'),
  ],
  u3a2: [
    ponte(['.index', 'index='], 'pd.Series(dados["Idade"], index=dados["Nome"])',
      'O índice é o rótulo de cada valor de uma Series; series2.index guarda A, B e C. index= escolhe esses rótulos na criação: aqui os nomes viram os rótulos das idades, e a Series mostra Alice 25, Bob 30 e assim por diante. A última linha do print, dtype: int64, só informa o tipo dos valores: números inteiros.'),
    ponte(['list()'], 'list(series2.index)',
      'list transforma o que receber numa lista comum, que o print mostra entre colchetes: [\'A\', \'B\', \'C\'].'),
    ponte(['.shape'], 'df.shape',
      'shape diz o tamanho da tabela como (linhas, colunas). (5, 2) são cinco pessoas e duas colunas.'),
    ponte(['.columns'], 'df.columns',
      'columns são os nomes das colunas do DataFrame: Nome e Idade.'),
  ],
  u3a3: [
    ponte(['.drop_duplicates', 'keep='], 'df.drop_duplicates(keep="last")',
      'drop_duplicates apaga as linhas repetidas: o Produto A aparece duas vezes, com os mesmos dados. keep="last" escolhe qual cópia fica, a última. Por isso shape passa de (5, 4) para (4, 4).'),
    ponte(['inplace='], 'inplace=True',
      'inplace=True altera o próprio df. Sem ele, drop_duplicates devolveria uma tabela nova e o df continuaria com as duplicadas.'),
    ponte(['.loc'], 'df.loc[1]',
      'loc busca uma linha pelo rótulo do índice, não pela posição. Depois de tirar a duplicada, sobraram os rótulos 1, 2, 3 e 4; df.loc[1] mostra a linha do Produto B com todas as colunas, em pé: à esquerda os nomes das colunas, e Name: 1 é o rótulo da linha. Pegadinha de prova: o rótulo 0 saiu com a duplicada, então df.loc[0] daria KeyError, enquanto df.iloc[0], que busca pela posição, traz o Produto B.'),
  ],
  u3a4: [
    ponte(['.plot'], 'plt.plot(x, y)\ndf.plot(...)',
      'plt.plot(x, y) liga os pontos com uma linha: é o gráfico de linha. df.plot é o atalho do pandas, que desenha direto a partir das colunas da tabela.'),
    ponte(['.lines'], 'plt.gca().lines',
      'lines é a lista das linhas desenhadas, do mesmo jeito que patches é a lista das barras. len conta 1 linha.'),
    ponte(['y=', 'kind='], 'df.plot(x="Produto", y="qtde_vendida", kind="bar")',
      'x= escolhe a coluna do eixo de baixo, y= a coluna das alturas e kind= o tipo de gráfico: bar é barras; também existem line (linha) e pie (pizza).'),
    ponte(['.groupby', '.count'], 'contas.groupby("time")["total_bill"].count()',
      'groupby("time") separa as contas por período (Lunch e Dinner) e ["total_bill"] escolhe a coluna do valor. Depois, mean tira a média de cada grupo, sum soma e count conta quantas contas há: Dinner 3, Lunch 2. São as mesmas contas do estimator do Seaborn: pela média, Dinner 40.0 contra Lunch 15.0; pela soma, 120.0 contra 30.0, porque há mais jantares.'),
  ],
};

// As entregas contam como já visto o que as aulas até a unidade delas ensinaram e o que as
// entregas anteriores explicaram, então cada termo só precisa de ponte na primeira aparição.
export const pontesDasEntregas = {
  'u1-construir-acumulador': [
    ponte(['not', 'None'], 'if not notas:\n    return None',
      'not inverte o teste: if not notas é verdadeiro quando a lista está vazia. return None devolve "nenhum valor", o jeito do Python dizer que não há média para calcular, em vez de dividir por zero.'),
  ],
  'u2-construir-generos': [
    ponte(['.keys', '.values'], 'contagem.keys(), contagem.values()',
      'keys() são as chaves do dicionário (os gêneros) e values() os valores (as contagens). plt.bar usa as chaves como nomes das barras e os valores como alturas.'),
  ],
  'u2-testar-fluxos': [
    ponte(['assert'], 'assert',
      'assert confere uma afirmação. Se ela for verdadeira, nada acontece; se for falsa, o programa para com AssertionError e mostra onde. É o teste mais simples que existe.'),
    ponte(['buscar_livro()'], 'buscar_livro(livros, "dom casmurro") is not None',
      'buscar_livro é a função de busca que você escreveu no passo anterior; se deu outro nome a ela, use o seu. is not None confirma que ela encontrou algo: a busca devolve None quando não acha o livro.'),
  ],
  'u3-entender-banco': [
    ponte(['SQL DATE'], 'data_venda DATE',
      'DATE avisa que a coluna guarda datas, mas o SQLite não tem um tipo de data de verdade: a data fica guardada como texto no formato ano-mês-dia, por exemplo "2024-01-15", o que faz a ordem alfabética ser também a ordem das datas.'),
  ],
  'u3-construir-sqlite': [
    ponte(['SQL DROP'], 'DROP TABLE IF EXISTS vendas1',
      'DROP TABLE apaga a tabela inteira, e IF EXISTS evita erro quando ela ainda não existe. Apagar antes de criar faz a célula poder rodar quantas vezes for preciso sem duplicar as vendas.'),
  ],
  'u3-construir-dataframe': [
    ponte(['.head'], 'df_vendas.head()',
      'head mostra só as 5 primeiras linhas da tabela. É o jeito rápido de conferir se os dados chegaram certos sem imprimir tudo.'),
  ],
  'u3-construir-graficos': [
    ponte(['.tight_layout', '.show'], 'plt.tight_layout()\nplt.show()',
      'tight_layout ajusta as margens para os nomes das barras não ficarem cortados. show mostra o gráfico: no Colab ele aparece embaixo da célula; no PyCampus o gráfico aparece sozinho, com ou sem show.'),
  ],
  'u3-testar-dados': [
    ponte(['.all'], '(df_vendas["valor_venda"] >= 0).all()',
      'A comparação >= 0 é feita em cada venda e gera uma coluna de True e False. all() responde se todos são True, ou seja, se nenhuma venda é negativa.'),
  ],
  'u4-entender-problema': [
    ponte(['.data', '.target'], 'iris.data, iris.target',
      'iris.data são as medidas das flores, quatro números por flor. iris.target é a espécie de cada flor, escrita como número: 0, 1 ou 2.'),
  ],
  'u4-entender-treino-teste': [
    ponte(['train_test_split()', 'test_size=', 'stratify='], 'train_test_split(X, y, test_size=0.2, stratify=y)',
      'train_test_split divide os dados em quatro partes: medidas e espécies de treino, medidas e espécies de teste. test_size=0.2 separa 20% para o teste. stratify=y mantém a mesma proporção de cada espécie nos dois lados.'),
  ],
  'u4-entender-escala': [
    ponte(['StandardScaler()'], 'scaler = StandardScaler()',
      'StandardScaler é a ferramenta que põe todas as medidas na mesma escala, com média 0 e desvio padrão 1. Esta linha só cria a ferramenta; quem aprende a escala a partir dos dados é o fit_transform da linha seguinte.'),
  ],
  'u4-entender-rede': [
    ponte(['.keras', '.layers'], 'tf.keras.layers.Dense(...)',
      'keras é a parte do TensorFlow que monta redes neurais, e layers são as camadas. Dense é uma camada em que cada neurônio recebe todos os valores da camada anterior.'),
    ponte(['shape=', 'activation='], 'Input(shape=(4,)), activation="relu"',
      'shape=(4,) diz que cada flor entra com 4 números. activation= escolhe a conta que cada camada aplica: relu na camada do meio, softmax na saída, que transforma os três resultados em probabilidades que somam 1.'),
  ],
  'u4-entender-treino': [
    ponte(['.fit', 'epochs='], 'model.fit(X_treino, y_treino, epochs=40)',
      'fit é o treino: o modelo olha os dados de treino e ajusta seus pesos. epochs=40 repete essa passada completa 40 vezes.'),
    ponte(['verbose='], 'verbose=0',
      'verbose=0 só desliga as mensagens de progresso que o TensorFlow imprimiria a cada época. Não muda o resultado.'),
  ],
  'u4-entender-saida': [
    ponte(['axis='], 'probabilidades.argmax(axis=1)',
      'argmax procura a posição do maior valor. axis=1 manda procurar dentro de cada linha, e cada linha tem as três probabilidades de uma flor: o resultado é a espécie mais provável de cada uma.'),
  ],
};
