// "Ver a mesma ideia com outro exemplo": um segundo exemplo em cada degrau, com outro assunto.
//
// Um exemplo só ensina o caso dele. Quem não entendeu com vendas às vezes entende com notas ou
// com um cardápio, e ver a mesma ideia em dois lugares é o que mostra o que muda e o que fica.
// Cada código roda sozinho, do import ao print, para poder ser colado no editor. A saída foi
// medida no Pyodide (scripts/check-faculdade-resumo.mjs), e o código só usa o que o
// degrau e os anteriores já ensinaram (tests/faculdade-outros-exemplos.test.js).
//
// Começa pelas cinco aulas que o estudante ainda não tinha feito na véspera da prova.

const outro = (explica, codigo, saida) => ({ explica, codigo, saida });

export const outrosExemplos = {
  u3a4: {
    linha: outro(
      'Mesma ideia com temperaturas: cada dia é um ponto, e a linha mostra a temperatura subindo ao longo da semana. O print só confirma um dado; o gráfico aparece quando você roda o código no editor.',
      'import matplotlib.pyplot as plt\ndias = [1, 2, 3, 4, 5]\ntemperaturas = [22, 25, 24, 28, 30]\nplt.plot(dias, temperaturas)\nplt.close()\nprint("Maior temperatura:", max(temperaturas))',
      'Maior temperatura: 30',
    ),
    'pandas-plot': outro(
      'Mesma ideia com as notas de uma turma: x= diz o que vai embaixo de cada barra (o nome) e y= diz a altura (a nota). Troque kind="bar" por kind="line" e a mesma tabela vira um gráfico de linha.',
      'import matplotlib.pyplot as plt\nimport pandas as pd\nnotas = pd.DataFrame({"aluno": ["Ana", "Bia", "Caio"], "nota": [8, 6, 9]})\nnotas.plot(x="aluno", y="nota", kind="bar")\nplt.close()\nprint(notas["nota"].max())',
      '9',
    ),
    groupby: outro(
      'Mesma ideia com lojas: groupby("loja") junta as linhas de cada loja, e sum() soma os valores dentro de cada grupo. O Centro tem 3 vendas (100 + 200 + 30) e o Bairro tem 2 (50 + 70).',
      'import pandas as pd\nvendas = pd.DataFrame({"loja": ["Centro", "Bairro", "Centro", "Bairro", "Centro"], "valor": [100, 50, 200, 70, 30]})\npor_loja = vendas.groupby("loja")["valor"].sum()\nprint(por_loja["Centro"], por_loja["Bairro"])',
      '330 120',
    ),
    media: outro(
      'O Centro vendeu 330 no total, mas em 3 vendas: a média é 110. A soma diz quanto entrou, a média diz quanto vale cada venda e a contagem diz quantas foram. São três perguntas diferentes sobre o mesmo dado.',
      'import pandas as pd\nvendas = pd.DataFrame({"loja": ["Centro", "Bairro", "Centro", "Bairro", "Centro"], "valor": [100, 50, 200, 70, 30]})\nmedia = vendas.groupby("loja")["valor"].mean()\nquantas = vendas.groupby("loja")["valor"].count()\nprint("Centro: media", media["Centro"], "em", quantas["Centro"], "vendas")',
      'Centro: media 110.0 em 3 vendas',
    ),
    'grafico-do-grupo': outro(
      'O resultado do groupby já é uma Series, e ela desenha sozinha: uma barra por loja. Os grupos saem em ordem alfabética, por isso Bairro vem antes de Centro.',
      'import matplotlib.pyplot as plt\nimport pandas as pd\nvendas = pd.DataFrame({"loja": ["Centro", "Bairro", "Centro"], "valor": [100, 50, 200]})\npor_loja = vendas.groupby("loja")["valor"].sum()\npor_loja.plot(kind="bar", title="Total por loja")\nplt.close()\nprint(list(por_loja.index))',
      "['Bairro', 'Centro']",
    ),
  },

  r4: {
    'dicionario-de-listas': outro(
      'Mesma ideia num cardápio: cada chave é uma seção, e o valor dela é a lista inteira de itens. Na web é igual: a chave é a camada, e a lista traz as ferramentas daquela camada.',
      'cardapio = {"bebidas": ["Suco", "Café"], "lanches": ["Pão de queijo", "Coxinha", "Pastel"]}\nprint(cardapio["lanches"])',
      "['Pão de queijo', 'Coxinha', 'Pastel']",
    ),
    'dois-colchetes': outro(
      'O primeiro colchete escolhe a seção e devolve a lista; o segundo escolhe o item pela posição, contando do 0. cardapio["bebidas"][1] é o segundo item das bebidas.',
      'cardapio = {"bebidas": ["Suco", "Café"], "lanches": ["Pão de queijo", "Coxinha", "Pastel"]}\nprint(cardapio["lanches"][0])\nprint(cardapio["bebidas"][1])',
      'Pão de queijo\nCafé',
    ),
    append: outro(
      'append acrescenta no fim da lista que está dentro do dicionário. O dicionário continua com as mesmas chaves; só a lista das bebidas cresceu.',
      'cardapio = {"bebidas": ["Suco", "Café"]}\ncardapio["bebidas"].append("Chá")\nprint(cardapio["bebidas"])',
      "['Suco', 'Café', 'Chá']",
    ),
    'percorrer-camadas': outro(
      'items() entrega cada seção junto com a lista dela, e len conta quantos itens a lista tem. É o mesmo laço das camadas, com outro assunto.',
      'cardapio = {"bebidas": ["Suco", "Café"], "lanches": ["Pão de queijo", "Coxinha", "Pastel"]}\nfor secao, itens in cardapio.items():\n    print(secao, len(itens))',
      'bebidas 2\nlanches 3',
    ),
  },

  u4a2: {
    'dados-da-tela': outro(
      'Mesma ideia num app de agenda: antes de desenhar a tela, o programa guarda o que vai mostrar. O KivyMD desenharia uma aba para cada item da lista.',
      'app = {"nome": "Agenda", "abas": ["Hoje", "Semana", "Contatos"]}\nprint(app["nome"], "tem", len(app["abas"]), "abas")',
      'Agenda tem 3 abas',
    ),
    enumerate: outro(
      'Mesma ideia numa lista de tarefas: enumerate entrega o número e a tarefa juntos, e start=1 faz a contagem começar em 1, como numa lista de verdade.',
      'tarefas = ["Estudar", "Treinar", "Dormir"]\nfor numero, tarefa in enumerate(tarefas, start=1):\n    print(numero, tarefa)',
      '1 Estudar\n2 Treinar\n3 Dormir',
    ),
    'ao-tocar': outro(
      'No app de verdade, quem chama essa função é o botão, pelo on_press. Aqui você mesmo chama, para ver o que ela devolve quando o botão Salvar é tocado.',
      'def ao_tocar_botao(nome_do_botao):\n    return f"Você tocou em {nome_do_botao}"\n\nprint(ao_tocar_botao("Salvar"))',
      'Você tocou em Salvar',
    ),
    'classe-do-app': outro(
      'No KivyMD você não chama o build: o KivyMD chama sozinho quando o app abre. Aqui você chama na mão para ver o que ele monta. É uma classe comum, igual às da Unidade 2.',
      'class AgendaApp:\n    def build(self):\n        return "Tela: Hoje"\n\napp = AgendaApp()\nprint(app.build())',
      'Tela: Hoje',
    ),
  },

  u4a3: {
    assert: outro(
      'Mesma ideia com outra função: cada assert confere um resultado. Se um deles estivesse errado, o programa pararia ali com AssertionError, e o print do fim nunca apareceria.',
      'def maior_de_idade(idade):\n    return idade >= 18\n\nassert maior_de_idade(20) == True\nassert maior_de_idade(15) == False\nprint("Os dois asserts passaram")',
      'Os dois asserts passaram',
    ),
    doctest: outro(
      'O exemplo com >>> fica dentro da docstring, e a linha de baixo é o resultado esperado. Como o resultado é um texto, ele aparece entre aspas simples, do jeito que o Python mostra. Quando tudo passa, o doctest não escreve nada.',
      'def saudacao(nome):\n    """Monta uma saudação.\n\n    >>> saudacao("Ana")\n    \'Olá, Ana\'\n    """\n    return "Olá, " + nome\n\nimport doctest\ndoctest.run_docstring_examples(saudacao, globals())\nprint("O exemplo da docstring passou")',
      'O exemplo da docstring passou',
    ),
    unittest: outro(
      'Aqui aparece também como rodar a bateria e contar o resultado, igual ao exemplo do professor. O test_limite testa exatamente 18, a fronteira: é nos limites que os erros costumam aparecer.',
      'import unittest\nimport io\n\ndef maior_de_idade(idade):\n    return idade >= 18\n\nclass TestIdade(unittest.TestCase):\n    def test_adulto(self):\n        self.assertEqual(maior_de_idade(20), True)\n\n    def test_limite(self):\n        self.assertEqual(maior_de_idade(18), True)\n\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(TestIdade)\nresultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)\nprint("Testes:", resultado.testsRun, "Falhas:", len(resultado.failures))',
      'Testes: 2 Falhas: 0',
    ),
  },

  u4a4: {
    dados: outro(
      'Mesma ideia com estudo: a entrada são as horas estudadas, e a resposta certa é a nota tirada. Ter a resposta de cada exemplo é o que faz isso ser aprendizado supervisionado.',
      'import numpy as np\nhoras = np.array([1, 2, 3, 4])\nnotas = np.array([5, 6, 7, 8])\nprint(len(horas), "exemplos, cada um com a sua nota")',
      '4 exemplos, cada um com a sua nota',
    ),
    treinar: outro(
      'A reta aprendida diz: cada hora a mais de estudo soma 1 ponto na nota, e a reta parte do 4. Esse é o padrão que explica os exemplos.',
      'import numpy as np\nhoras = np.array([1, 2, 3, 4])\nnotas = np.array([5, 6, 7, 8])\ncoeficientes = np.polyfit(horas, notas, 1)\nprint(round(float(coeficientes[0]), 1), round(float(coeficientes[1]), 1))',
      '1.0 4.0',
    ),
    prever: outro(
      'Com o padrão aprendido, dá para prever um caso que não estava nos dados: 5 horas de estudo. A reta calcula 1 × 5 + 4, que dá 9.',
      'import numpy as np\nhoras = np.array([1, 2, 3, 4])\nnotas = np.array([5, 6, 7, 8])\ncoeficientes = np.polyfit(horas, notas, 1)\nprint("Nota prevista para 5 horas:", round(float(np.polyval(coeficientes, 5))))',
      'Nota prevista para 5 horas: 9',
    ),
    'treino-teste': outro(
      'O modelo aprendeu só com 3 exemplos e foi testado no quarto, que ele não viu. Previu 8, e a nota real foi 9: errou por 1. É esse erro no dado novo que diz se o modelo funciona.',
      'import numpy as np\nhoras = np.array([1, 2, 3, 4])\nnotas = np.array([5, 6, 7, 9])\ncoef_treino = np.polyfit(horas[:3], notas[:3], 1)\nerro = abs(np.polyval(coef_treino, 4) - notas[3])\nprint("Erro no teste:", round(float(erro), 2))',
      'Erro no teste: 1.0',
    ),
  },
};
