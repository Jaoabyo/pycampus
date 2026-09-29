// "O que cai na prova": um cartão curto por aula, para a revisão rápida antes da prova.
//
// A prova é de múltipla escolha e cobra reconhecer o conceito e ler código curto, não escrever
// um programa inteiro. Cada cartão traz o assunto em uma frase, os pares que a prova gosta de
// trocar e um código pequeno com a saída dele. A saída foi medida no Pyodide
// (scripts/check-faculdade-resumo.mjs), nunca escrita de cabeça, e o código só usa o que a
// aula e as anteriores já ensinaram (tests/faculdade-resumo.test.js).

const cartao = (frase, naoConfunda, codigo, saida) => ({ frase, naoConfunda, codigo, saida });

export const resumosDaFaculdade = {
  u1a1: cartao(
    'Python é uma linguagem de alto nível e fácil de ler. Cada valor tem um tipo, e o Python descobre o tipo sozinho pelo valor.',
    [
      'int é número inteiro (7); float é número com ponto (7.5); str é texto, entre aspas ("7"); bool é True ou False.',
      'input() sempre devolve texto. Para fazer conta, converta com int() ou float().',
      'PEP 8 é o guia de estilo do Python. Ele existe porque o código é lido muito mais vezes do que é escrito.',
    ],
    'idade = "20"\nprint(type(idade))\nidade = int(idade)\nprint(type(idade), idade + 1)',
    "<class 'str'>\n<class 'int'> 21",
  ),
  r1: cartao(
    'if escolhe um caminho quando a condição é True. elif testa outro caminho só se os de cima falharam. else fica com o resto.',
    [
      '= guarda um valor; == compara dois valores e responde True ou False.',
      'and exige as duas condições verdadeiras; or aceita uma só; not inverte.',
      'else não leva condição. A ordem dos elif importa: o primeiro verdadeiro ganha e os outros nem são testados.',
    ],
    'nota = 6\nif nota >= 7:\n    print("Aprovado")\nelif nota >= 5:\n    print("Recuperação")\nelse:\n    print("Reprovado")',
    'Recuperação',
  ),
  r2: cartao(
    'for percorre uma lista ou um range, um item por volta. while repete enquanto a condição for verdadeira.',
    [
      'range(1, 6) dá 1, 2, 3, 4 e 5: o número final fica de fora.',
      'break para o laço inteiro; continue pula só o resto daquela volta.',
      'for serve quando você sabe quantas voltas vai dar; while, quando não sabe.',
    ],
    'for numero in range(1, 6):\n    if numero == 2:\n        continue\n    if numero == 4:\n        break\n    print(numero)',
    '1\n3',
  ),
  r3: cartao(
    'Uma função é um bloco de código com nome. def cria a função, os parâmetros recebem os dados e return devolve o resultado.',
    [
      'return devolve o valor para quem chamou; print só mostra na tela.',
      'Built-in já vem pronta no Python (len, sum, max); a sua você cria com def.',
      'lambda é uma função curta, de uma linha só: lambda numero: numero * 3.',
    ],
    'def dobro(numero):\n    return numero * 2\n\ntriplo = lambda numero: numero * 3\nprint(dobro(4), triplo(4))',
    '8 12',
  ),
  u2a1: cartao(
    'Lista e tupla guardam vários valores em ordem. A primeira posição é a 0.',
    [
      'Lista usa [ ] e pode mudar; tupla usa ( ) e não muda depois de criada.',
      'Fatia: s[0:2] pega da posição 0 até antes da 2.',
      'Tupla de um item só precisa da vírgula: ("a",). Sem ela, é só o texto "a".',
    ],
    'cores = ["azul", "verde", "rosa"]\nprint(cores[0], cores[2])\nprint(cores[0:2])\ndias = ("seg", "ter")\nprint(len(dias))',
    "azul rosa\n['azul', 'verde']\n2",
  ),
  u2a2: cartao(
    'set guarda valores sem repetir. dict guarda pares de chave e valor. NumPy faz a conta com todos os itens de uma vez.',
    [
      '{} vazio é um dicionário; o conjunto vazio é set().',
      'Na lista você pega pela posição (notas[0]); no dicionário, pela chave (aluno["nome"]).',
      'Com NumPy, array ** 2 eleva todos os itens ao quadrado, sem for.',
    ],
    'import numpy as np\nnotas = [7, 8, 7, 9]\nprint(len(set(notas)))\naluno = {"nome": "Ana", "idade": 20}\nprint(aluno["nome"])\nprint(np.array([1, 2, 3]) ** 2)',
    '3\nAna\n[1 4 9]',
  ),
  u2a3: cartao(
    'A classe é o molde; o objeto é o que nasce dele. Atributos são os dados do objeto, e métodos são as ações dele.',
    [
      'Encapsulamento junta dados e ações num objeto e controla o acesso; polimorfismo é classes diferentes respondendo de um jeito diferente à mesma mensagem.',
      '__init__ é o construtor: roda quando o objeto nasce. self é o próprio objeto.',
      'Herança: class Carro(Veiculo) faz Carro receber tudo de Veiculo. super() chama a classe-pai.',
    ],
    'class Cachorro:\n    def falar(self):\n        return "Au"\n\nclass Gato:\n    def falar(self):\n        return "Miau"\n\nfor bicho in [Cachorro(), Gato()]:\n    print(bicho.falar())',
    'Au\nMiau',
  ),
  u2a4: cartao(
    'Módulo é um arquivo com funções prontas para reaproveitar. Você traz um módulo para o seu código com import.',
    [
      'import math, depois math.sqrt(25). import math as m, depois m.sqrt(25). from math import sqrt, depois sqrt(25).',
      'Built-in já vem no Python (math, os, random). De terceiros se instala com pip (NumPy, pandas, Matplotlib). Próprio é o que você mesmo escreve.',
      'plt.plot faz linha; plt.bar faz barras; plt.title põe o título; plt.xlabel e plt.ylabel dão nome aos eixos.',
    ],
    'import math as m\nfrom math import sqrt\nprint(m.sqrt(25), sqrt(16))',
    '5.0 4.0',
  ),
  u3a1: cartao(
    'SQL é a linguagem para falar com banco de dados. O SQLite guarda o banco inteiro num arquivo, e o Python já traz o módulo sqlite3.',
    [
      'DDL mexe na estrutura: CREATE, ALTER, DROP. DML mexe nos dados: SELECT, INSERT, UPDATE, DELETE. DCL controla o acesso: GRANT, REVOKE.',
      'CRUD é Create, Read, Update e Delete, ou seja, INSERT, SELECT, UPDATE e DELETE.',
      'Sem commit, a mudança não fica gravada. fetchone traz um registro; fetchall traz todos.',
      'Use ? no comando e passe os valores separados. É isso que impede a injeção de SQL.',
      'Com AUTOINCREMENT, o SQLite numera o id sozinho, e o INSERT informa só as outras colunas.',
    ],
    'import sqlite3\nconn = sqlite3.connect(":memory:")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE Contatos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)")\ncursor.execute("INSERT INTO Contatos (nome) VALUES (?)", ("Maria",))\nconn.commit()\ncursor.execute("SELECT * FROM Contatos")\nprint(cursor.fetchall())',
    "[(1, 'Maria')]",
  ),
  u3a2: cartao(
    'O pandas trabalha com tabelas. A Series é uma coluna só, com rótulos; o DataFrame é a tabela inteira, com linhas e colunas.',
    [
      'A Series tem uma dimensão; o DataFrame tem duas.',
      'Numa Series feita de dicionário, as chaves viram os índices.',
      'read_ lê (read_csv, read_excel, read_sql); to_ grava (to_csv, to_excel).',
    ],
    'import pandas as pd\nprecos = pd.Series({"A": 100, "B": 200})\nprint(list(precos.index))\ndf = pd.DataFrame({"nome": ["Ana", "Bia"], "idade": [20, 30]})\nprint(df.shape)\nprint(df["idade"].mean())',
    "['A', 'B']\n(2, 2)\n25.0",
  ),
  u3a3: cartao(
    'Antes de analisar, você arruma a tabela: tira as linhas repetidas, cria colunas e filtra as linhas que interessam.',
    [
      'loc usa o rótulo da linha; iloc usa a posição. Depois de um filtro, os dois deixam de coincidir.',
      'drop_duplicates() tira as linhas repetidas; inplace=True muda a própria tabela.',
      'No filtro, o nome da tabela aparece duas vezes: vendas[vendas["receita"] > 100].',
    ],
    'import pandas as pd\nvendas = pd.DataFrame({"nome": ["A", "B", "C"], "receita": [120, 80, 150]})\ncaras = vendas[vendas["receita"] > 100]\nprint(list(caras["nome"]))\nprint(caras.loc[2]["nome"], caras.iloc[1]["nome"])',
    "['A', 'C']\nC C",
  ),
  u3a4: cartao(
    'Gráficos contam a história dos dados. O Matplotlib é a base; o pandas e o Seaborn são construídos sobre ele.',
    [
      'No pandas, df.plot(kind="bar") faz barras; kind também aceita line e pie.',
      'No Seaborn, o barplot calcula a MÉDIA por padrão. estimator=sum soma; estimator=len conta.',
      'Média, soma e contagem do mesmo dado contam histórias diferentes. Olhe o contexto, não só a barra mais alta.',
    ],
    'import pandas as pd\ncontas = pd.DataFrame({"periodo": ["almoco", "jantar", "jantar"], "total": [10, 20, 40]})\nmedia = contas.groupby("periodo")["total"].mean()\nsoma = contas.groupby("periodo")["total"].sum()\nprint("jantar: media", media["jantar"], "soma", soma["jantar"])',
    'jantar: media 30.0 soma 60',
  ),
  r4: cartao(
    'Front-end é a parte que a pessoa vê; back-end é o que roda no servidor, com as regras e os dados. A API liga os dois.',
    [
      'Front-end: HTML dá a estrutura, CSS dá a aparência e JavaScript dá o comportamento.',
      'Back-end com Python: Django, Flask e FastAPI.',
      'Python não substitui o HTML no navegador. Ele gera as páginas ou os dados no servidor.',
    ],
    'camadas = {"front-end": ["HTML", "CSS", "JavaScript"], "back-end": ["Python", "Flask", "Django"]}\nprint(camadas["front-end"][2])\nprint(camadas["back-end"][1])',
    'JavaScript\nFlask',
  ),
  u4a2: cartao(
    'Kivy é o framework Python para aplicativos de toque. O KivyMD roda em cima dele e dá o visual do Material Design, do Google.',
    [
      'O KivyMD não substitui o Kivy: ele é uma extensão do Kivy.',
      'Os dois são multiplataforma: Android, iOS, Windows, Linux e macOS.',
      'Vantagens do Python no mobile: comunidade ativa, muitas bibliotecas e agilidade. Desvantagem: é mais lento que o nativo (Swift, Kotlin).',
      'Widget é um bloco da tela; MDTabs separa o conteúdo em abas; on_press liga o botão a um método.',
    ],
    'abas = ["Calculadora", "Historico"]\nfor numero, aba in enumerate(abas, start=1):\n    print(f"Aba {numero}: {aba}")',
    'Aba 1: Calculadora\nAba 2: Historico',
  ),
  u4a3: cartao(
    'Um teste confere sozinho se o código faz o que devia. A aula mostra três jeitos: assert, doctest e unittest.',
    [
      'assert para o programa se a condição for falsa. doctest roda os exemplos com >>> da documentação. unittest organiza os testes em classes.',
      'No unittest, a classe herda de unittest.TestCase e cada teste começa com test_. O assertEqual vem do TestCase.',
      'if __name__ == "__main__": roda os testes só quando você executa o arquivo direto, não quando outro arquivo o importa.',
    ],
    'def somar(a, b):\n    return a + b\n\nassert somar(2, 3) == 5\nprint("passou")',
    'passou',
  ),
  u4a4: cartao(
    'Machine learning é o computador aprendendo padrões com dados para prever casos novos.',
    [
      'Supervisionado: os dados vêm com a resposta certa (mês e vendas). Não supervisionado: sem resposta, o algoritmo acha grupos (K-Means). Reforço: aprende com recompensas e penalidades.',
      'Treinar ajusta o modelo; avaliar mede se ele acerta dados que não viu. Por isso se separa treino de teste.',
      'TensorFlow é a biblioteca do Google para criar e treinar modelos, principalmente redes neurais.',
    ],
    'import numpy as np\nmeses = np.array([1, 2, 3, 4])\nvendas = np.array([100, 120, 140, 160])\nreta = np.polyfit(meses, vendas, 1)\nprint(round(float(np.polyval(reta, 5))))',
    '180',
  ),
};
