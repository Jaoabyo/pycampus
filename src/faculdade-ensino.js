// Exemplos pequenos, independentes e explicados antes do desafio. O material
// ampliado da disciplina continua disponível como aprofundamento, após esta base.
const passo = (codigo, explicacao) => ({ codigo, explicacao });
const guia = (
  objetivo,
  passos,
  antes,
  depois,
  saida,
  pergunta,
  opcoes,
  explicacao,
) => ({
  objetivo,
  passos,
  codigo: passos.map((p) => p.codigo).join('\n'),
  treino: { antes, depois, saida },
  revisao: { pergunta, opcoes, resposta: 0, explicacao },
});

export const ensinoDaFaculdade = {
  u1a1: guia(
    'Transformar notas escritas como texto em números e calcular uma média.',
    [
      passo(
        'nota_a = "4"\nnota_b = "8"',
        'O sinal = guarda o valor da direita no nome da esquerda. As aspas fazem "4" e "8" serem textos (str), mesmo parecendo números. Use ponto para decimais em Python: 8.5.',
      ),
      passo(
        'numero_a = float(nota_a)\nnumero_b = float(nota_b)',
        'float(...) recebe o texto entre parênteses e devolve um número decimal: 4.0 e 8.0. Guardamos os resultados em outros nomes. int("4") também converte, mas para inteiro; int("4.5") não funciona. Os textos originais continuam guardados.',
      ),
      passo(
        'media = (numero_a + numero_b) / 2',
        'O + soma: 4.0 + 8.0 = 12.0. Os parênteses mandam somar antes de dividir. A barra / divide por 2 porque há duas notas. O resultado é 6.0. Sem os parênteses, a divisão aconteceria primeiro.',
      ),
      passo(
        'print(f"Media: {media}")',
        'print(...) mostra algo na saída. O f antes das aspas permite colocar o valor de uma variável dentro de {chaves}. O texto Media: fica como foi escrito; {media} vira 6.0. Portanto aparece Media: 6.0. Não é preciso criar outra variável para mostrar a média.',
      ),
    ],
    'nota_a = "4"',
    'nota_a = "6"',
    'Media: 7.0',
    'Por que usamos float(nota_a) antes de calcular a média?',
    [
      'Para transformar o texto da nota em número e fazer a conta',
      'Para mostrar a nota na tela',
      'Para guardar a nota como texto',
    ],
    'As aspas indicam texto. float converte esse texto para número; + e / fazem a conta, e print exibe o resultado. Aqui não usamos input(): as notas já estão no programa.',
  ),

  r1: guia(
    'Escolher um caminho com if, elif e else e verificar uma condição adicional.',
    [
      passo(
        'idade = 10\ntem_ingresso = True',
        'idade guarda um inteiro. True significa verdadeiro e False significa falso: são valores bool, sem aspas. tem_ingresso registra se a pessoa tem ingresso.',
      ),
      passo(
        'if idade < 12:\n    filme = 1\nelif idade < 18:\n    filme = 2\nelse:\n    filme = 3',
        '< pergunta se o valor da esquerda é menor. if testa primeiro: 10 < 12 é verdadeiro, então filme recebe 1. elif só é testado se o if falhar; else fica com os demais casos. Os dois-pontos abrem um bloco. Os quatro espaços indicam quais linhas pertencem a ele.',
      ),
      passo(
        'if tem_ingresso:\n    print(f"Filme {filme} disponivel")\nelse:\n    print("Sem ingressos")',
        'Este é um segundo teste, independente da faixa etária. Se tem_ingresso for True, mostra o filme escolhido; se for False, mostra Sem ingressos. Na f-string, {filme} é substituído pelo número guardado.',
      ),
    ],
    'idade = 10',
    'idade = 20',
    'Filme 3 disponivel',
    'Quando o elif idade < 18 é testado?',
    [
      'Quando o teste idade < 12 foi falso',
      'Mesmo depois de o primeiro if ser verdadeiro',
      'Apenas quando tem_ingresso é False',
    ],
    'Em uma cadeia if/elif/else, apenas o primeiro caminho verdadeiro é executado. Com idade 20, os dois testes são falsos e o else escolhe o filme 3.',
  ),

  r2: guia(
    'Somar uma lista usando uma repetição e um acumulador.',
    [
      passo(
        'notas = [2, 4, 6]\ntotal = 0',
        'Os colchetes criam uma lista: três valores separados por vírgulas. total começa em zero porque ainda não somamos nada. Esse valor que cresce a cada volta é chamado acumulador.',
      ),
      passo(
        'for nota in notas:\n    total = total + nota',
        'for pega um elemento da lista por vez e o chama de nota. Na primeira volta, total vira 0 + 2 = 2; na segunda, 2 + 4 = 6; na terceira, 6 + 6 = 12. A linha com quatro espaços se repete. total += nota é outra escrita para essa atualização.',
      ),
      passo(
        'print(total)',
        'Sem os quatro espaços, print fica fora do laço e mostra o total uma única vez, depois das três voltas. Se estivesse dentro do bloco, mostraria os totais parciais: 2, 6 e 12.',
      ),
    ],
    'notas = [2, 4, 6]',
    'notas = [2, 4, 8]',
    '14',
    'Por que total começa em 0 antes do for?',
    [
      'Para acumular a soma sem acrescentar um valor extra',
      'Para repetir a lista zero vezes',
      'Para impedir que nota mude',
    ],
    'A cada volta somamos uma nota ao valor anterior. Começar em zero fora do laço preserva o total acumulado; reiniciar dentro do laço apagaria as somas anteriores.',
  ),

  r3: guia(
    'Criar uma função que recebe notas e devolve a média.',
    [
      passo(
        'def calcular_media(notas):\n    soma = sum(notas)\n    quantidade = len(notas)\n    return soma / quantidade',
        'def define uma função: um trecho que podemos chamar pelo nome. notas é o parâmetro, o nome usado dentro dela para a lista recebida. sum soma os itens; len conta os itens. return devolve a divisão para quem chamou. Os quatro espaços mantêm essas instruções dentro da função. A lista precisa ter ao menos uma nota para a divisão ser válida.',
      ),
      passo(
        'resultado = calcular_media([2, 6])',
        'Chamar a função com [2, 6] faz notas representar essa lista. sum dá 8 e len dá 2, então return devolve 4.0. Esse valor fica guardado em resultado. Definir a função sozinho não a executa.',
      ),
      passo(
        'print(resultado)',
        'print exibe o valor devolvido. return e print têm papéis diferentes: return permite reaproveitar o resultado em outra conta; print apenas o mostra.',
      ),
    ],
    'calcular_media([2, 6])',
    'calcular_media([4, 8])',
    '6.0',
    'Qual instrução devolve a média para a variável resultado?',
    [
      'return soma / quantidade',
      'print(resultado)',
      'def calcular_media(notas):',
    ],
    'return entrega o valor ao código que chamou a função. O print de fora usa esse valor para exibi-lo.',
  ),

  u2a1: guia(
    'Contar e percorrer uma tupla mostrando posição e valor.',
    [
      passo(
        'cores = ("azul", "verde")',
        'Parênteses com valores separados por vírgulas formam uma tupla. Ela guarda uma sequência que não pode ter seus itens trocados. Uma lista usa colchetes e permite alterações.',
      ),
      passo(
        'print(len(cores))',
        'len conta quantos elementos a sequência tem: aqui são 2. Não conta as letras dos nomes.',
      ),
      passo(
        'for posicao, cor in enumerate(cores):\n    print(posicao, cor)',
        'enumerate entrega dois valores em cada volta: posição e item. A primeira posição é 0. Os nomes antes de in recebem esse par. print com vírgula mostra os dois separados por espaço: 0 azul e depois 1 verde.',
      ),
    ],
    'cores = ("azul", "verde")',
    'cores = ("azul", "verde", "rosa")',
    '3\n0 azul\n1 verde\n2 rosa',
    'O que enumerate(cores) fornece em cada volta?',
    [
      'A posição e o valor de uma cor',
      'Apenas a quantidade total de cores',
      'Uma cópia alterável da tupla',
    ],
    'enumerate combina a contagem, começando em zero, com o elemento visitado. len responde outra pergunta: quantos elementos existem ao todo.',
  ),

  u2a2: guia(
    'Eliminar valores repetidos e contar quantos valores diferentes existem.',
    [
      passo(
        'valores = [2, 2, 5, 5, 8]',
        'Esta lista tem cinco itens. Um mesmo número pode ocupar várias posições, por isso quantidade de itens e quantidade de valores diferentes não significam a mesma coisa.',
      ),
      passo(
        'diferentes = set(valores)',
        'set cria um conjunto com os valores únicos: 2, 5 e 8. Repetições são removidas. Um conjunto não serve para preservar posições; não conte com a ordem em que ele é exibido.',
      ),
      passo(
        'print(len(diferentes))',
        'len conta os elementos do conjunto: 3. Também podemos escrever print(len(set(valores))): primeiro set elimina repetições, depois len conta, por fim print mostra.',
      ),
    ],
    'valores = [2, 2, 5, 5, 8]',
    'valores = [2, 2, 5, 5, 8, 9]',
    '4',
    'Por que len(set(valores)) pode ser menor que len(valores)?',
    [
      'Porque set remove repetições antes da contagem',
      'Porque len ignora o último elemento',
      'Porque set remove todos os números pares',
    ],
    'A lista conta ocorrências, inclusive repetidas. O conjunto mantém cada valor uma única vez.',
  ),

  u2a3: guia(
    'Criar um objeto e chamar um método que altera seus dados.',
    [
      passo(
        'class Contador:\n    def __init__(self, valor):\n        self.valor = valor',
        'class define um molde de objetos. __init__ roda ao criar um objeto. self representa aquele objeto; self.valor é um dado guardado nele. valor, sem self., é a entrada recebida. O segundo nível de espaços coloca a atribuição dentro do método.',
      ),
      passo(
        '    def avancar(self):\n        self.valor += 1',
        'Ainda dentro da classe, def cria um método: uma função ligada ao objeto. avancar soma 1 ao seu valor. += atualiza o dado guardado; não precisa receber o valor de novo.',
      ),
      passo(
        'contador = Contador(4)\ncontador.avancar()\nprint(contador.valor)',
        'Sem recuo, voltamos ao programa principal. Contador(4) cria o objeto com valor 4. O ponto acessa um método ou atributo. Os parênteses em avancar() chamam a ação, que muda o valor para 5. print lê o atributo atualizado. No desafio, Pessoa usa o mesmo padrão com nome e idade.',
      ),
    ],
    'contador = Contador(4)',
    'contador = Contador(9)',
    '10',
    'O que contador.avancar() faz neste exemplo?',
    [
      'Altera o valor guardado naquele objeto',
      'Cria outra classe chamada avancar',
      'Apenas imprime o valor atual',
    ],
    'O método recebe o próprio objeto como self e aumenta self.valor. A exibição só acontece no print seguinte.',
  ),

  u2a4: guia(
    'Importar uma ferramenta matemática com apelido e usar seu resultado.',
    [
      passo(
        'import math as m',
        'import disponibiliza um módulo, um conjunto de ferramentas. math vem com Python. as m dá o apelido m para usarmos nas próximas linhas; isso não instala nada.',
      ),
      passo(
        'raiz = m.sqrt(81)',
        'O ponto escolhe a ferramenta sqrt do módulo. sqrt calcula a raiz quadrada: qual número multiplicado por si mesmo dá 81? A resposta é 9.0. O valor entre parênteses é a entrada da função.',
      ),
      passo(
        'print(int(raiz))',
        'int converte 9.0 para o inteiro 9, que print mostra. int não arredonda uma raiz com fração: corta a parte decimal. Aqui a raiz é exata.',
      ),
    ],
    'raiz = m.sqrt(81)',
    'raiz = m.sqrt(100)',
    '10',
    'Após import math as m, como chamamos a raiz quadrada?',
    ['m.sqrt(...)', 'math = sqrt(...)', 'import.sqrt(...)'],
    'O apelido m passa a ser o nome usado para acessar as funções do módulo, como sqrt.',
  ),

  u3a1: guia(
    'Inserir um registro usando parâmetros e consultar uma tabela SQLite.',
    [
      passo(
        'import sqlite3\nconn = sqlite3.connect(":memory:")\ncursor = conn.cursor()',
        'sqlite3 vem com Python. connect abre um banco temporário na memória. conn representa a conexão; cursor é o objeto pelo qual enviamos comandos SQL. Os parênteses chamam cada função ou método.',
      ),
      passo(
        'cursor.execute("CREATE TABLE Pessoas (nome TEXT, cidade TEXT)")',
        'execute envia um comando ao banco. CREATE TABLE cria a tabela Pessoas com duas colunas de texto. A estrutura precisa existir antes de inserirmos os dados. SQL é a linguagem dentro das aspas; Python envia esse texto ao banco.',
      ),
      passo(
        'cursor.execute("INSERT INTO Pessoas VALUES (?, ?)", ("Ana", "Recife"))\nconn.commit()',
        'INSERT INTO insere uma linha. Cada ? recebe um valor da tupla separada: Ana vai para nome e Recife para cidade. Não monte SQL colando dados no texto. commit confirma a gravação da transação.',
      ),
      passo(
        'cursor.execute("SELECT * FROM Pessoas")\nprint(cursor.fetchall())\nconn.close()',
        "SELECT * consulta todas as colunas. fetchall devolve uma lista de registros; cada registro é uma tupla. print mostra [('Ana', 'Recife')]. close fecha a conexão depois da leitura.",
      ),
    ],
    '("Ana", "Recife")',
    '("Ana", "Natal")',
    "[('Ana', 'Natal')]",
    'Para que servem os dois ? no INSERT do exemplo?',
    [
      'Receber nome e cidade enviados separadamente',
      'Criar duas tabelas',
      'Ler todas as pessoas cadastradas',
    ],
    'Os marcadores separam o comando SQL dos dados. Os dois valores da tupla preenchem os marcadores na mesma ordem.',
  ),

  u3a2: guia(
    'Criar uma série de números no pandas e calcular sua média.',
    [
      passo(
        'import pandas as pd',
        'pandas é uma biblioteca de análise de dados. as pd cria o apelido convencional pd. Na primeira execução, o ambiente pode precisar baixar a biblioteca.',
      ),
      passo(
        'idades = pd.Series([10, 20, 30])',
        'pd.Series recebe uma lista e cria uma sequência de dados com índices. Cada número ocupa uma posição. Series é uma dimensão; DataFrame organiza várias colunas numa tabela.',
      ),
      passo(
        'print(idades.mean())',
        'mean é o método que calcula a média da série: (10 + 20 + 30) / 3 = 20.0. O ponto acessa o método da série e os parênteses o executam. print mostra só o resultado.',
      ),
    ],
    'pd.Series([10, 20, 30])',
    'pd.Series([20, 30, 40])',
    '30.0',
    'O que idades.mean() calcula?',
    [
      'A média dos valores da série',
      'O maior valor da série',
      'A quantidade de colunas de uma tabela',
    ],
    'mean soma os valores e divide pela quantidade de valores válidos. Neste exemplo não há dados ausentes.',
  ),

  u3a3: guia(
    'Filtrar linhas de uma tabela e extrair a coluna de nomes.',
    [
      passo(
        'import pandas as pd\nvendas = pd.DataFrame({"nome": ["Livro", "Caderno"], "receita": [40, 90]})',
        'O dicionário tem uma chave por coluna. As listas têm a mesma quantidade de itens: Livro corresponde a 40 e Caderno a 90. DataFrame transforma essa estrutura em tabela.',
      ),
      passo(
        'selecionadas = vendas[vendas["receita"] > 50]',
        'Leia de dentro para fora. vendas["receita"] acessa a coluna; > 50 produz False para 40 e True para 90. Os colchetes externos mantêm somente as linhas True. A tabela original não muda.',
      ),
      passo(
        'print(list(selecionadas["nome"]))',
        'selecionadas["nome"] pega apenas os nomes das linhas restantes. list converte essa coluna em lista Python. print mostra [\'Caderno\']. No desafio, mude a comparação para o limite pedido.',
      ),
    ],
    '> 50',
    '> 30',
    "['Livro', 'Caderno']",
    'O que os colchetes externos fazem em vendas[vendas["receita"] > 50]?',
    [
      'Mantêm as linhas cuja comparação é verdadeira',
      'Substituem todas as receitas por 50',
      'Ordenam os nomes alfabeticamente',
    ],
    'A comparação cria uma seleção de True e False. Aplicar essa seleção à tabela preserva só as linhas que atendem à condição.',
  ),

  u3a4: guia(
    'Montar barras com rótulos e conferir quantas foram criadas.',
    [
      passo(
        'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt',
        'Matplotlib monta gráficos. Agg permite criar a figura sem abrir uma janela. pyplot é a parte que usaremos, com apelido plt. Neste exercício verificamos a estrutura criada por texto; não exibimos a imagem do gráfico.',
      ),
      passo(
        'meses = ["Mar", "Abr"]\nvendas = [60, 80]\nplt.bar(meses, vendas)',
        'Cada rótulo da primeira lista combina com a altura na mesma posição da segunda lista. bar cria uma barra por par: Mar com 60, Abr com 80. As listas precisam ter tamanhos compatíveis.',
      ),
      passo(
        'plt.title("Vendas")\nprint("Barras:", len(plt.gca().patches))\nplt.close()',
        'title define o título. gca() pega o eixo atual, a região onde as barras foram desenhadas. patches reúne as formas das barras; len conta essas formas. print separa o texto e a contagem com um espaço. close libera a figura ao terminar.',
      ),
    ],
    'plt.bar(meses, vendas)',
    'plt.bar(["Mar", "Abr", "Mai"], [60, 80, 90])',
    'Barras: 3',
    'O que determina a altura de cada barra em plt.bar(meses, vendas)?',
    [
      'O valor correspondente na lista vendas',
      'O número de letras de cada mês',
      'O título do gráfico',
    ],
    'A primeira lista fornece os rótulos; a segunda fornece as alturas. title só nomeia o gráfico, sem mudar os dados.',
  ),

  r4: guia(
    'Relacionar as camadas da web usando um dicionário Python.',
    [
      passo(
        'camadas = {"front-end": "HTML", "back-end": "Python"}',
        'Chaves criam um dicionário: cada chave se liga a um valor por dois-pontos. Aqui ele é apenas um mapa de conceitos, não um site funcionando. Front-end é a interface vista pela pessoa; back-end processa regras e dados no servidor.',
      ),
      passo(
        'print("Interface:", camadas["front-end"])',
        'Consultar a chave front-end com colchetes devolve HTML. HTML estrutura a página; CSS pode cuidar do visual e JavaScript das interações. O print mostra o rótulo e o valor separados por espaço.',
      ),
      passo(
        'print("Servidor:", camadas["back-end"])',
        'Consultar back-end devolve Python. Flask é uma ferramenta Python para construir aplicações no servidor. No desafio, consulte as duas chaves e use os rótulos Front-end: e Back-end:.',
      ),
    ],
    '"back-end": "Python"',
    '"back-end": "Flask"',
    'Interface: HTML\nServidor: Flask',
    'No mapa apresentado, qual camada processa regras e dados no servidor?',
    ['Back-end', 'Front-end', 'HTML por si só'],
    'O back-end executa as regras no servidor. O dicionário apenas representa essa separação; executar este exemplo não inicia um servidor web.',
  ),

  u4a2: guia(
    'Representar e numerar as abas de uma interface.',
    [
      passo(
        'abas = ["Inicio", "Ajuda"]',
        'Cada texto representa o nome de uma aba. Uma aba agrupa conteúdo de uma interface. Esta lista é um modelo em Python, não cria botões ou uma janela KivyMD.',
      ),
      passo(
        'for numero, aba in enumerate(abas, start=1):',
        'enumerate fornece posição e nome. start=1 muda o começo da contagem: em vez de 0 e 1, teremos 1 e 2. numero e aba recebem esses dois valores a cada volta. Os dois-pontos abrem o bloco repetido.',
      ),
      passo(
        '    print(numero, aba)',
        'Os quatro espaços ligam print ao for. A vírgula faz print separar número e nome com um espaço. MDTabs, no aplicativo completo, organiza abas visuais; aqui treinamos a lista que representa seus conteúdos.',
      ),
    ],
    'abas = ["Inicio", "Ajuda"]',
    'abas = ["Inicio", "Ajuda", "Perfil"]',
    '1 Inicio\n2 Ajuda\n3 Perfil',
    'Para que serve start=1 em enumerate(abas, start=1)?',
    [
      'Começar a numeração em 1',
      'Pular a primeira aba',
      'Executar só uma volta',
    ],
    'start muda apenas o número inicial. Todos os elementos da lista continuam sendo visitados.',
  ),

  u4a3: guia(
    'Escrever um teste que compara o resultado observado com o esperado.',
    [
      passo(
        'import unittest\nimport io\ndef triplo(numero):\n    return numero * 3',
        'unittest fornece ferramentas de teste. io será usado pelo executor para guardar seu relatório. A função triplo recebe um número e devolve sua multiplicação por 3; por exemplo, triplo(2) devolve 6.',
      ),
      passo(
        'class TestTriplo(unittest.TestCase):\n    def test_positivo(self):\n        self.assertEqual(triplo(2), 6)',
        'A classe herda as ferramentas de TestCase. O nome test_ permite ao carregador descobrir o método. self dá acesso a assertEqual: o primeiro argumento é o resultado observado, o segundo é o esperado. Se forem diferentes, o teste falha. Repare nos dois níveis de recuo.',
      ),
      passo(
        'suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestTriplo)\nresultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)',
        'Este é o executor pronto: loadTestsFromTestCase reúne os testes da classe; run os executa. stream=io.StringIO() guarda o relatório em memória para exibirmos apenas um resumo. No desafio esse trecho já estará preenchido.',
      ),
      passo(
        'print("Testes:", resultado.testsRun)\nprint("Falhas:", len(resultado.failures) + len(resultado.errors))',
        'testsRun informa quantos testes rodaram. failures registra comparações que falharam; errors registra erros durante a execução. Somar os dois comprimentos dá o total de problemas. No desafio, crie três métodos para testar zero, positivo e negativo; por exemplo, dobro de -2 deve ser -4.',
      ),
    ],
    'self.assertEqual(triplo(2), 6)',
    'self.assertEqual(triplo(2), 7)',
    'Testes: 1\nFalhas: 1',
    'O que acontece se esperamos 7, mas triplo(2) devolve 6?',
    [
      'O teste registra uma falha de comparação',
      'A função passa a devolver 7 automaticamente',
      'O teste não é executado',
    ],
    'O teste não altera a função. Ele evidencia a diferença entre observado e esperado. Uma falha também pode indicar uma expectativa escrita errada, como aqui.',
  ),

  u4a4: guia(
    'Ajustar uma reta a dados conhecidos e usá-la numa previsão simples.',
    [
      passo(
        'import numpy as np\nmeses = np.array([1, 2, 3])\nvendas = np.array([10, 20, 30])',
        'np é o apelido do NumPy. array cria uma sequência numérica usada nos cálculos. As posições formam pares: mês 1 vendeu 10, mês 2 vendeu 20, mês 3 vendeu 30. Essas respostas conhecidas caracterizam aprendizado supervisionado.',
      ),
      passo(
        'coeficientes = np.polyfit(meses, vendas, 1)',
        'polyfit ajusta um polinômio aos pares de dados. O último argumento, 1, escolhe uma reta. Aqui o padrão é crescer 10 por mês. coeficientes guarda os números que descrevem essa reta; não guarda a previsão pronta.',
      ),
      passo(
        'previsao = np.polyval(coeficientes, 4)',
        'polyval aplica a reta ao novo mês, 4, produzindo aproximadamente 40. Um ajuste com números decimais pode ter pequenas diferenças de precisão. Isto é uma extrapolação simples, não uma garantia de vendas futuras.',
      ),
      passo(
        'print("Previsao:", round(float(previsao)))',
        'float converte o número NumPy para decimal Python; round sem outro argumento arredonda para o inteiro mais próximo. print mostra Previsao: 40. Para avaliar qualidade de previsão, precisaríamos comparar com dados reais separados do treino.',
      ),
    ],
    'np.polyval(coeficientes, 4)',
    'np.polyval(coeficientes, 5)',
    'Previsao: 50',
    'Qual função aplica a reta já ajustada a um mês novo?',
    ['np.polyval', 'np.polyfit', 'np.array'],
    'polyfit ajusta a reta usando os pares conhecidos. polyval usa os coeficientes para estimar um valor novo; isso não comprova acurácia em dados futuros.',
  ),
};

const ligacao = (explicadoEm, exemplo, alteracao, cobradoEm) => ({
  explicadoEm, exemplo, alteracao, cobradoEm,
});

// Este mapa é a ponte auditável entre as aulas curtas e os trabalhos maiores.
// Cada conceito chega ao estúdio somente depois de ser explicado, visto e alterado.
export const matrizDeEnsinoDasEntregas = {
  lista: ligacao('r2', 'notas = [2, 4, 6]', 'trocar 6 por 8 e prever o total', 'entrega-u1:u1-entender-lista'),
  acumulador: ligacao('r2', 'total = total + nota', 'mudar o valor inicial e explicar o efeito', 'entrega-u1:u1-construir-acumulador'),
  media: ligacao('r3', 'return sum(notas) / len(notas)', 'calcular com outra lista', 'entrega-u1:u1-entender-media'),
  'limite-sete': ligacao('r1', 'if idade < 12', 'alterar idade para atravessar o limite', 'entrega-u1:u1-construir-situacao'),
  relatorio: ligacao('u1a1', 'print(f"Media: {media}")', 'alterar as notas e conferir a saída', 'entrega-u1:u1-construir-situacao'),
  classe: ligacao('u2a3', 'class Pessoa:', 'criar uma segunda Pessoa', 'entrega-u2:u2-entender-classe'),
  self: ligacao('u2a3', 'self.nome = nome', 'alterar o nome entregue ao objeto', 'entrega-u2:u2-entender-classe'),
  'lista-de-objetos': ligacao('u2a3', 'pessoa1 = Pessoa("Joao", 30)', 'guardar dois objetos em uma lista', 'entrega-u2:u2-entender-colecao'),
  cadastro: ligacao('r3', 'def calcular_media(notas):', 'chamar a função com outra entrada', 'entrega-u2:u2-construir-cadastro'),
  busca: ligacao('u2a1', 'for p, d in enumerate(dias):', 'procurar um item que não existe', 'entrega-u2:u2-construir-busca'),
  'contagem-genero': ligacao('u2a2', 'len(set(notas))', 'repetir um valor e comparar a contagem', 'entrega-u2:u2-construir-generos'),
  'grafico-barras': ligacao('u3a4', 'plt.bar(["Jan", "Fev"], [120, 90])', 'alterar uma altura e ler o gráfico', 'entrega-u2:u2-construir-generos'),
};
