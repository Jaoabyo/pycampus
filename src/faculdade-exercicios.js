// Os "Exercícios de unidades" do AVA, no formato em que a disciplina cobra: enunciado, cinco
// alternativas e uma só correta.
//
// A diferença para o AVA é o campo `porque`. Lá a nota aparece e o assunto acaba; aqui a
// explicação vem depois da resposta, com o motivo de a certa estar certa e, quando o distrator
// engana de verdade, o motivo de a errada parecer certa. Reconhecer a alternativa não é o
// objetivo — o objetivo é a prova presencial, onde não há alternativa nenhuma.
//
// Procedência: as Unidades 1 e 2 reproduzem as questões que o estudante recebeu no AVA. As
// Unidades 3 e 4 foram escritas a partir das apostilas, no mesmo formato, porque o exercício
// delas ainda não foi aberto. O campo `recebido` separa os dois casos e a tela mostra essa
// diferença: material de estudo não pode se passar por prova recebida.

const q = (id, enunciado, opcoes, resposta, porque, codigo = null) =>
  ({ id, enunciado, opcoes, resposta, porque, codigo });

export const exerciciosDaFaculdade = [
  {
    id: 'ex-u1', unidade: 'u1', titulo: 'Exercício da Unidade 1',
    origem: 'Exercício de unidades · recebido no AVA', recebido: true,
    questoes: [
      q('u1q1', 'Com base no código fornecido, qual é a finalidade da função calcular_media?',
        ['A função calcular_media retorna a média das notas do aluno',
          'A função calcular_media imprime as notas do aluno',
          'A função calcular_media verifica se o aluno foi aprovado ou reprovado',
          'A função calcular_media classifica as notas do aluno em ordem crescente',
          'A função calcular_media calcula a média ponderada das notas do aluno'], 0,
        'sum(lista_notas) soma todos os valores e len(lista_notas) diz quantos são. A divisão de um pelo outro é a definição de média, e return devolve esse número a quem chamou. Dois distratores merecem atenção: a função não imprime nada — quem chama decide o que fazer com o resultado; e a média é simples, não ponderada, porque ponderada exigiria um peso diferente para cada nota.',
        ['def calcular_media(lista_notas):', '    soma = sum(lista_notas)', '    media = soma / len(lista_notas)', '    return media', '', 'notas_aluno = [85, 90, 78, 92, 88]', 'media = calcular_media(notas_aluno)'].join('\n')),

      q('u1q2', 'Qual das opções mostra a chamada correta de uma função definida pelo usuário chamada dobrar, que dobra o valor de um número, aplicada a uma lista de números?',
        ['resultados = aplicar_funcao(dobrar, lista_de_numeros)',
          'resultados = lista_de_numeros.dobrar()',
          'resultados = dobrar(lista_de_numeros)',
          'resultados = lista_de_numeros.apply(dobrar)',
          'resultados = lista_de_numeros.map(dobrar)'], 0,
        'O enunciado diz que dobrar recebe UM número. Para alcançar a lista inteira, a função precisa ser passada como argumento para algo que percorra a lista — é o que map() faz e o que aplicar_funcao representa aqui. As outras falham por motivos diferentes: .dobrar() inventa um método que a lista não tem; .map() e .apply() existem em JavaScript e em pandas, não em listas do Python; e dobrar(lista_de_numeros) entregaria a lista inteira a uma função que espera um número só.'),

      q('u1q3', 'Qual é a principal filosofia de Python em relação à legibilidade do código?',
        ['Código deve ser o mais obscuro possível',
          'Código deve ser o mais curto possível',
          'Código deve ser facilmente legível, uma vez que é lido com mais frequência do que é escrito',
          'Código deve ser altamente comentado',
          'Código deve conter uma sintaxe complexa'], 2,
        'É a frase de Guido van Rossum, criador da linguagem, formalizada na PEP 8 — o guia de estilo do Python. Ser curto não é o objetivo: código curto demais costuma ser difícil de ler. Comentar muito também não substitui código claro; o ideal é que o código se explique e o comentário conte o que ele não consegue dizer.'),

      q('u1q4', 'Com base no código fornecido, qual é a finalidade da função verificar_numero_par?',
        ['Verificar se o número é divisível por 3',
          'Verificar se o número é um número primo',
          'Calcular a raiz quadrada do número',
          'Verificar se o número é positivo ou negativo',
          'Verificar se o número é divisível por 2'], 4,
        'O operador % devolve o resto da divisão. Se numero % 2 dá resto zero, a divisão por 2 foi exata — e um número divisível por 2 é, por definição, par. Para testar divisão por 3, o código precisaria de % 3.',
        ['def verificar_numero_par(numero):', '    if numero % 2 == 0:', '        return True', '    else:', '        return False', '', 'numero = 14', 'resultado = verificar_numero_par(numero)'].join('\n')),

      q('u1q5', 'Qual foi o principal motivo para a popularidade do Python?',
        ['Sua tipagem estática',
          'Sua sintaxe complexa',
          'Sua legibilidade e sintaxe simples',
          'Sua orientação a objetos',
          'Sua velocidade de execução'], 2,
        'Velocidade é justamente o ponto fraco do Python perto de C ou Java — ele é interpretado. A tipagem é dinâmica, não estática. Orientação a objetos ele tem, mas muitas linguagens também têm e nem por isso ficaram populares. O que o distingue é a legibilidade: a curva de aprendizado curta levou a linguagem para a web, a automação, a análise de dados e a inteligência artificial.')
    ]
  },

  {
    id: 'ex-u2', unidade: 'u2', titulo: 'Exercício da Unidade 2',
    origem: 'Exercício de unidades · recebido no AVA', recebido: true,
    questoes: [
      q('u2q1', 'Qual é uma das principais vantagens de usar módulos de terceiros em Python?',
        ['Módulos de terceiros não são confiáveis e não devem ser usados em projetos Python',
          'Módulos de terceiros são incorporados ao núcleo do Python, tornando-os uma parte essencial da linguagem',
          'Módulos de terceiros oferecem funcionalidades básicas, enquanto os módulos built-in são mais avançados',
          'Módulos de terceiros permitem que os desenvolvedores ampliem as funcionalidades de seus projetos sem precisar desenvolver tudo do zero',
          'Módulos de terceiros são pagos e geralmente têm custos proibitivos'], 3,
        'É o argumento do reaproveitamento: NumPy, pandas e Matplotlib resolvem problemas que levariam meses para reescrever. Os distratores invertem fatos do material — de terceiros não fazem parte do núcleo (esses são os built-in, como math e os), não são menos avançados que os built-in, e a esmagadora maioria é de código aberto e gratuita, distribuída pelo PyPI e instalada com pip.'),

      q('u2q2', 'Após a execução do código acima, qual será o valor de element_at_index_2?',
        ['3', '4', '5', '1', '2'], 0,
        'O índice de uma sequência começa em 0. Então my_array[0] é 1, my_array[1] é 2 e my_array[2] é 3 — a terceira posição, não o terceiro contado a partir de 1. Marcar 2 é o engano clássico de contar as posições começando em 1; marcar 4 seria ler o índice como se fosse a quarta posição.',
        ['import numpy as np', '', '# Criação de um array NumPy', 'my_array = np.array([1, 2, 3, 4, 5])', '', '# Operação 1: Elevar cada elemento ao quadrado', 'squared_array = my_array ** 2', '', '# Operação 2: Calcular a soma de todos os elementos', 'sum_of_elements = np.sum(my_array)', '', '# Operação 3: Acessar o elemento no índice 2', 'element_at_index_2 = my_array[2]'].join('\n')),

      q('u2q3', 'O que é polimorfismo em programação orientada a objetos?',
        ['Polimorfismo é a capacidade de uma classe ter múltiplos construtores',
          'Polimorfismo é a capacidade de diferentes classes responderem de forma diferente à mesma mensagem, permitindo tratar objetos de diferentes classes de maneira uniforme',
          'Polimorfismo é a ocultação de atributos e métodos de uma classe',
          'Polimorfismo é a criação de classes em Python',
          'Polimorfismo é a criação de listas em Python'], 1,
        'Cachorro e Gato herdam de Animal e cada um responde ao mesmo fazer_barulho() de um jeito — é isso que permite percorrer uma lista de animais chamando o mesmo método em todos. Atenção ao distrator mais perigoso: ocultar atributos e métodos é encapsulamento, outro pilar da orientação a objetos.'),

      q('u2q4', 'Qual é a biblioteca Python comumente usada para suportar a computação científica e que oferece funcionalidades como arrays multidimensionais e operações sofisticadas?',
        ['NumPy', 'Pandas', 'Matplotlib', 'TensorFlow', 'Scikit-Learn'], 0,
        'Array multidimensional e operação em massa são a definição do NumPy. As outras têm cada uma o seu domínio: pandas trabalha dados tabulares em DataFrames, Matplotlib faz gráficos, TensorFlow e Scikit-Learn são de machine learning. Vale lembrar que o pandas é construído sobre o NumPy.'),

      q('u2q5', 'Qual é a maneira correta de importar uma biblioteca em Python?',
        ['Usar a palavra-chave "library" seguida pelo nome da biblioteca',
          'Incluir o arquivo da biblioteca no diretório do projeto',
          'Usar a palavra-chave "import" seguida pelo nome da biblioteca',
          'Copiar e colar o código da biblioteca diretamente no script Python',
          'Não é possível importar bibliotecas em Python'], 2,
        'import é a palavra reservada, e existem três formas de usá-la: import math, depois math.sqrt(25); import math as m, com apelido; ou from math import sqrt, trazendo só o que você vai usar. A palavra-chave library não existe em Python, e copiar o código para dentro do script é exatamente o que o import evita.')
    ]
  },

  {
    id: 'ex-u3', unidade: 'u3', titulo: 'Exercício da Unidade 3',
    origem: 'Escrito a partir da apostila da Unidade 3', recebido: false,
    questoes: [
      q('u3q1', 'O comando CREATE TABLE pertence a qual categoria de instruções SQL?',
        ['DML, porque manipula os dados guardados nas tabelas',
          'DDL, porque define e altera a estrutura do banco de dados',
          'DCL, porque controla as permissões de acesso',
          'DQL, porque devolve dados para o programa',
          'Nenhuma: CREATE TABLE não é uma instrução SQL'], 1,
        'DDL é Data Definition Language e define estrutura: CREATE, ALTER e DROP. DML manipula dados: SELECT, INSERT, UPDATE e DELETE. DCL cuida de permissão: GRANT e REVOKE. Criar uma tabela é definir estrutura, então é DDL.'),

      q('u3q2', 'Por que conn.commit() é necessário depois de um INSERT no sqlite3?',
        ['Porque ele confirma a transação e grava as alterações no arquivo do banco',
          'Porque ele fecha a conexão com o banco de dados',
          'Porque ele cria o cursor usado para executar o comando',
          'Porque ele converte o resultado em uma lista de tuplas',
          'Porque ele apaga os dados anteriores da tabela'], 0,
        'Sem commit, a inserção fica só na transação aberta e se perde quando o programa termina. Fechar a conexão é conn.close(), criar o cursor é conn.cursor(), e trazer o resultado como lista de tuplas é cursor.fetchall().'),

      q('u3q3', 'O que df.drop_duplicates(keep="last", inplace=True) faz em um DataFrame?',
        ['Remove as linhas repetidas mantendo a última ocorrência e salva a mudança no próprio DataFrame',
          'Remove as colunas repetidas e devolve um DataFrame novo',
          'Mantém apenas as linhas repetidas e descarta as demais',
          'Ordena o DataFrame e remove os valores nulos',
          'Cria uma cópia do DataFrame sem alterar o original'], 0,
        'São dois parâmetros e cada um decide uma coisa. keep="last" escolhe qual das cópias sobrevive — a última. inplace=True sobrescreve o objeto na memória em vez de devolver um novo, e é por isso que a atribuição não é necessária. Com inplace=False, o original ficaria intacto.'),

      q('u3q4', 'No barplot do Seaborn, o que o parâmetro estimator define?',
        ['A cor das barras do gráfico',
          'A quantidade de barras que cabem na figura',
          'A ordem das categorias no eixo X',
          'O tamanho da fonte dos rótulos',
          'A conta que cada barra representa: a média por padrão, ou sum, ou len'], 4,
        'É o parâmetro que mais muda a conclusão do gráfico. Com a média, dois grupos podem parecer equivalentes; com sum, um deles parece gastar muito mais; com len você descobre que ele apenas tem mais observações. Por isso a apostila insiste: a barra mais alta não fala sozinha, é preciso saber que conta ela representa.'),

      q('u3q5', 'O que o teste booleano df[df["preco"] > 50] devolve?',
        ['Apenas as linhas em que a coluna preco é maior que 50',
          'A quantidade de linhas com preco maior que 50',
          'O DataFrame com os preços menores que 50 trocados por 50',
          'O DataFrame ordenado pela coluna preco',
          'Uma lista com todos os valores da coluna preco'], 0,
        'A comparação de dentro produz uma Series de True e False, uma marca por linha. Usada entre colchetes, ela filtra: só as linhas marcadas como True permanecem, e o resultado continua sendo um DataFrame. Para contar as linhas você usaria len() ou .shape em cima desse resultado.')
    ]
  },

  {
    id: 'ex-u4', unidade: 'u4', titulo: 'Exercício da Unidade 4',
    origem: 'Escrito a partir da apostila da Unidade 4', recebido: false,
    questoes: [
      q('u4q1', 'Qual camada de uma aplicação web cuida da lógica, do processamento e do armazenamento de dados?',
        ['O front-end, com HTML, CSS e JavaScript',
          'A folha de estilo CSS',
          'O navegador, que executa Python diretamente',
          'O back-end, com linguagens como Python e frameworks como Django e Flask',
          'A API, que substitui as duas camadas'], 3,
        'O front-end é a interface com a qual a pessoa interage. O back-end fica no servidor e cuida da regra de negócio, do processamento e do banco de dados. A API não substitui camada nenhuma: ela é o contrato por onde as duas conversam. E o navegador não executa Python nativamente — é por isso que existe o Pyodide.'),

      q('u4q2', 'Qual é a função do MDTabs no KivyMD?',
        ['Organizar o conteúdo em abas dentro da interface do aplicativo',
          'Treinar um modelo de machine learning',
          'Executar consultas SQL no celular',
          'Compilar o aplicativo para Android',
          'Criar gráficos de barras na tela'], 0,
        'MDTabs separa conteúdos em abas para não sobrecarregar uma tela só — é organização de interface. KivyMD é a camada de Material Design sobre o Kivy, que por sua vez é o framework de interfaces multitouch. Nada disso treina modelo nem executa SQL.'),

      q('u4q3', 'No unittest, por que os métodos de teste normalmente começam com test_?',
        ['Porque é assim que o carregador os reconhece e executa automaticamente',
          'Porque assertEqual só funciona com esse prefixo',
          'Porque o prefixo transforma o método em variável global',
          'Porque sem ele o método vira privado da classe',
          'Porque o prefixo define a ordem de execução dos testes'], 0,
        'O unittest descobre os testes pelo nome. Um método sem o prefixo test_ continua existindo na classe, mas nunca é executado pelo runner — e um teste que não roda dá a falsa impressão de que tudo passou. assertEqual funciona em qualquer método, e a ordem de execução é alfabética.'),

      q('u4q4', 'Prever as vendas futuras a partir do histórico de meses e vendas é exemplo de qual tipo de aprendizado?',
        ['Não supervisionado, porque não existe resposta conhecida',
          'Por reforço, porque o modelo recebe recompensas a cada acerto',
          'Supervisionado, porque o treino usa entradas acompanhadas das saídas corretas',
          'Nenhum: previsão de vendas não é machine learning',
          'Supervisionado e não supervisionado ao mesmo tempo'], 2,
        'A marca do supervisionado é ter a resposta certa durante o treino: para cada mês, você já sabe quanto foi vendido. No não supervisionado não há rótulo e o algoritmo procura grupos sozinho, como no agrupamento de clientes por padrão de compra. No reforço, um agente aprende interagindo com um ambiente e recebendo recompensas.'),

      q('u4q5', 'O que o módulo doctest faz?',
        ['Executa os exemplos marcados com >>> na documentação e compara com o resultado escrito',
          'Mede quanto tempo cada função leva para executar',
          'Gera a documentação do projeto em HTML',
          'Substitui o unittest em projetos grandes',
          'Verifica se o código segue a PEP 8'], 0,
        'O doctest lê as docstrings, encontra os blocos com o prompt >>> e executa cada um, comparando a saída real com a que está escrita ali. A vantagem é manter exemplo e código sincronizados: se a função mudar e o exemplo não, o teste falha. Ele não substitui o unittest — para projetos maiores, a apostila indica o unittest pela organização em classes e pelas assertions mais completas.')
    ]
  }
];

export const exercicioDaUnidade = id => exerciciosDaFaculdade.find(item => item.unidade === id) || null;
export const totalDeQuestoes = exerciciosDaFaculdade.reduce((soma, item) => soma + item.questoes.length, 0);
