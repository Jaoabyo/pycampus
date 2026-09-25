// Os "Exercícios de unidades" do AVA, no formato em que a disciplina cobra: enunciado, cinco
// alternativas e uma só correta.
//
// A diferença para o AVA é o campo `porque`. Lá a nota aparece e o assunto acaba; aqui a
// explicação vem depois da resposta, com o motivo de a certa estar certa e, quando o distrator
// engana de verdade, o motivo de a errada parecer certa. A prova presencial também é de
// múltipla escolha, então o formato é o certo — o que falta no AVA é saber por que a certa é
// certa, e é isso que decide quando dois distratores parecem plausíveis.
//
// Procedência: as quatro unidades reproduzem as questões que o estudante recebeu no AVA. A
// Unidade 4 era escrita a partir da apostila até o exercício dela ser aberto. O campo
// `recebido` separa os dois casos e a tela mostra essa diferença: material de estudo não pode
// se passar por prova recebida.

const q = (id, enunciado, opcoes, resposta, porque, codigo = null) =>
  ({ id, enunciado, opcoes, resposta, porque, codigo });

// O código das questões 2 e 4 da Unidade 4, como aparece no AVA.
const UNITTEST_DO_AVA = [
  'import unittest', '', 'def add(a, b):', '    return a + b', '',
  'class TestAddition(unittest.TestCase):', '    def test_add_positive_numbers(self):', '        self.assertEqual(add(2, 3), 5)', '',
  '    def test_add_negative_numbers(self):', '        self.assertEqual(add(-2, -3), -5)', '',
  "if __name__ == '__main__':", '    import unittest', "    unittest.main(argv=['first-arg-is-ignored'], exit=False)", '    print()'].join('\n');

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
    origem: 'Exercício de unidades · recebido no AVA', recebido: true,
    questoes: [
      q('u3q1', 'Qual é o principal parâmetro usado para criar uma série no pandas, que pode conter um único valor, uma lista de valores ou um dicionário?',
        ['Parâmetro "dtype"', 'Parâmetro "name"', 'Parâmetro "index"', 'Parâmetro "data"', 'Parâmetro "shape"'], 3,
        'data é o que a Series guarda, e é o único sem valor-padrão: sem ele não há série. index, dtype e name existem e são opcionais — index nomeia as posições, dtype força o tipo e name batiza a série. shape não é parâmetro de criação: é um atributo que informa o formato depois de pronta.'),

      q('u3q2', 'No exemplo fornecido, qual método é usado para criar visualizações gráficas com base nos dados em um DataFrame do pandas?',
        ['visualize()', 'plot()', 'create_chart()', 'show_graph()', 'display_chart()'], 1,
        'plot() vem embutido no DataFrame e na Series, construído sobre o Matplotlib. O parâmetro kind escolhe o desenho: bar para barras, pie para pizza, line para linhas. Os outros quatro nomes não existem no pandas — são invenções plausíveis, que é justamente o que um bom distrator faz.',
        ['import pandas as pd', '', 'dados = {', "    'Produto': ['A', 'B', 'C'],", "    'qtde_vendida': [33, 50, 45]", '}', 'df = pd.DataFrame(dados)', "df.plot(x='Produto', y='qtde_vendida', kind='bar')", "df.plot(x='Produto', y='qtde_vendida', kind='pie')", "df.plot(x='Produto', y='qtde_vendida', kind='line')"].join('\n')),

      q('u3q3', 'Selecione a alternativa que corresponde a uma das categorias principais das instruções em SQL.',
        ['Lógica de Consulta (Query Logic)',
          'Linguagem de Relatórios (Reporting Language)',
          'Linguagem de Administração (Administration Language)',
          'Linguagem de Controle (Control Language)',
          'Linguagem de Manipulação de Dados (Data Manipulation Language)'], 4,
        'As três categorias são DDL (Data Definition Language), DML (Data Manipulation Language) e DCL (Data Control Language). A DML é a que aparece aqui com o nome exato — é a das instruções SELECT, INSERT, UPDATE e DELETE. Atenção à quarta alternativa: "Linguagem de Controle (Control Language)" chega perto da DCL, mas a categoria se chama Data Control Language, e as outras três são nomes inventados.'),

      q('u3q4', 'No exemplo apresentado, em que uma Series é criada a partir de um dicionário, o que se tornam os índices da Series?',
        ['Valores numéricos', 'Códigos de cores', 'Nomes dos valores', 'Chaves do dicionário', 'Posições numéricas'], 3,
        'As chaves viram os rótulos das linhas e os valores viram os dados: A, B, C, D e E de um lado; 100, 200, 300, 400 e 500 do outro. É a diferença para uma Series criada a partir de lista, em que o pandas gera sozinho um índice de posições numéricas — 0, 1, 2 e assim por diante.',
        ['import pandas as pd', '', '# Criando um dicionário com pares chave-valor', "data = {'A': 100, 'B': 200, 'C': 300, 'D': 400, 'E': 500}", '', '# Criando uma Series a partir do dicionário', 'series2 = pd.Series(data)', '', 'print(series2)', '', '# resultado', '# A    100', '# B    200', '# C    300', '# D    400', '# E    500', '# dtype: int64'].join('\n')),

      q('u3q5', 'Como você utilizaria o método loc para acessar as informações referentes à terceira linha do DataFrame df_selic?',
        ['df_selic.loc[2]', 'df_selic.loc[3]', 'df_selic.loc[0]', 'df_selic.loc[[0, 2, 3]]', 'df_selic.loc[70]'], 4,
        'A pergunta se refere à terceira linha exibida no exemplo da apostila, df_selic.loc[[0, 20, 70]]: os rótulos mostrados são 0, 20 e 70, portanto a terceira é acessada com loc[70]. loc busca pelo RÓTULO do índice, não pela posição. Se a pergunta pedisse a terceira posição de um DataFrame, o caminho seria iloc[2].')
    ]
  },

  {
    id: 'ex-u4', unidade: 'u4', titulo: 'Exercício da Unidade 4',
    origem: 'Exercício de unidades · recebido no AVA', recebido: true,
    questoes: [
      q('u4q1', 'Qual é o principal propósito do KivyMD em relação ao Kivy?',
        ['Oferecer uma experiência exclusiva em dispositivos iOS',
          'Substituir completamente o framework Kivy',
          'Integrar os princípios de design do Material Design',
          'Fornecer suporte exclusivo para dispositivos Android',
          'Limitar as capacidades do Kivy'], 2,
        'O KivyMD é uma extensão: ele roda em cima do Kivy e acrescenta os componentes com a aparência do Material Design, o padrão visual do Google. Por ser extensão, ele não substitui nem limita o Kivy. E nada nele é exclusivo de um sistema: os dois são multiplataforma.'),

      q('u4q2', 'Qual é a principal função da classe TestAddition no exemplo apresentado?',
        ['Definir a função add que realiza a soma de dois números',
          'Organizar os testes unitários para a função add usando a estrutura do módulo unittest',
          'Garantir que a função unittest.main() seja chamada explicitamente',
          'Iniciar a execução do script quando importado como um módulo em outro script',
          'Fornecer assertivas poderosas para verificar o comportamento esperado do código'], 1,
        'TestAddition herda de unittest.TestCase e junta, num lugar só, os testes da função add: cada método que começa com test_ é um teste. A função add é definida fora da classe. O distrator que mais engana é o das assertivas: quem fornece o assertEqual é o TestCase, do unittest, não a classe que você escreveu.',
        UNITTEST_DO_AVA),

      q('u4q3', 'Quais são as principais características do KivyMD?',
        ['Uso exclusivo em dispositivos Android',
          'Padrões de design próprios',
          'Apenas componentes visuais básicos',
          'Integração exclusiva com dispositivos iOS',
          'Material Design, componentes prontos para uso e suporte a múltiplas plataformas'], 4,
        'São as três do texto: segue o Material Design do Google, traz componentes prontos (botões, caixas de diálogo, cartões) e roda em Android, iOS, Windows, Linux e macOS. As erradas contradizem cada uma: o design não é próprio, e sim o do Google; os componentes vão além do básico; e nada é exclusivo de um sistema.'),

      q('u4q4', "O que indica a condição if __name__ == '__main__': no exemplo apresentado?",
        ['Inicia a execução do script apenas se a função add for definida corretamente',
          'Garante que a classe TestAddition seja executada apenas se o script for importado como um módulo em outro script',
          'Inicia a execução do script apenas se a função unittest.main() for chamada explicitamente',
          'Inicia a execução do script apenas se a classe TestAddition for definida corretamente',
          'Garante que a suíte de testes seja executada apenas se o script for executado diretamente (não importado como módulo)'], 4,
        'Quando você roda o arquivo direto, o Python dá a ele o nome __main__; quando outro arquivo o importa, o nome passa a ser o do módulo. Então o bloco só executa os testes no primeiro caso. A segunda alternativa é a armadilha: ela diz exatamente o contrário, importado em vez de executado diretamente.',
        UNITTEST_DO_AVA),

      q('u4q5', 'Quais são os benefícios mencionados para os desenvolvedores ao optarem por Python no desenvolvimento mobile?',
        ['Compatibilidade exclusiva com Android',
          'Desempenho superior em comparação com linguagens nativas',
          'Limitações de acesso a recursos específicos do dispositivo',
          'Comunidade ativa, vasta biblioteca de módulos e agilidade proporcionada pela linguagem',
          'Redução da reutilização de código entre diferentes sistemas operacionais'], 3,
        'A resposta repete os três benefícios do próprio enunciado: comunidade ativa, muitas bibliotecas e agilidade. As outras não são benefícios. Limitar o acesso ao aparelho e reutilizar menos código são desvantagens, e o Python costuma ser mais lento que as linguagens nativas, não mais rápido.')
    ]
  }
];

export const exercicioDaUnidade = id => exerciciosDaFaculdade.find(item => item.unidade === id) || null;
export const totalDeQuestoes = exerciciosDaFaculdade.reduce((soma, item) => soma + item.questoes.length, 0);
