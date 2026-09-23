// "Como fazer" de cada passo dos projetos da Formação.
//
// Os passos diziam o que fazer, mas nunca como: o campo "why" era uma cópia do enunciado nos 70
// passos, nenhum passo trazia exemplo de código e quase nenhum conferia o resultado. O estudante
// disse do quiz: "não especifica direito, é algo muito raso e não explica nada". Aqui cada passo
// ganha a explicação da ideia e um exemplo pequeno em OUTRO assunto (cores, animais), para ele
// entender o jeito e aplicar no próprio quiz sem copiar a resposta. A saída de cada exemplo é
// medida no Pyodide por scripts/check-project-ensino.mjs, com as entradas indicadas.

const passo = (explica, exemplo, entrada, saida) => ({ explica, exemplo, entrada, saida });

export const ensinoDosProjetos = {
  calculadora: {
    valores: passo(
      'Uma variável é um nome que guarda um valor. O sinal = guarda o valor da direita no nome da esquerda. Cada informação ganha o seu nome, uma por linha. Números com casas decimais usam ponto: 3000.0. print mostra o valor guardado.',
      'dinheiro = 100.0\narroz = 25.0\nfeijao = 10.5\nprint(dinheiro)',
      '',
      '100.0',
    ),
    total: passo(
      'Para somar, use + entre os nomes das variáveis. O resultado vai para uma variável nova, que guarda o total. Assim você pode usar esse total depois, sem somar de novo.',
      'arroz = 25.0\nfeijao = 10.5\nleite = 6.0\ntotal = arroz + feijao + leite\nprint(total)',
      '',
      '41.5',
    ),
    saldo: passo(
      'O que sobra é o dinheiro menos o total: use -. Para mostrar com duas casas decimais, a f-string tem um formato: {sobra:.2f}. O :.2f muda só a aparência do número, não a conta.',
      'dinheiro = 100.0\ntotal = 41.5\nsobra = dinheiro - total\nprint(f"{sobra:.2f}")',
      '',
      '58.50',
    ),
    pergunta: passo(
      'input mostra a pergunta e espera a pessoa digitar. O que ela digita fica guardado na variável da esquerda. Na linha de baixo, print mostra o que foi recebido.',
      'nome = input("Qual é o seu nome? ")\nprint(nome)',
      'Ana',
      'Qual é o seu nome? Ana',
    ),
    conversao: passo(
      'input sempre devolve texto, mesmo quando a pessoa digita um número. Para fazer conta, converta: float(texto) vira um número com casas decimais. Use dois nomes: um para o texto lido e outro para o número.',
      'texto = input("Quanto custa o arroz? ")\npreco = float(texto)\nprint(preco)',
      '25',
      'Quanto custa o arroz? 25.0',
    ),
    entrada: passo(
      'Agora os valores vêm do teclado, e não mais escritos no código. Para cada valor: pergunta com input e converte com float. As contas vêm depois das perguntas, do mesmo jeito que já estavam.',
      'dinheiro = float(input("Quanto você tem? "))\narroz = float(input("Quanto custa o arroz? "))\nsobra = dinheiro - arroz\nprint(f"{sobra:.2f}")',
      '100\n25',
      'Quanto você tem? Quanto custa o arroz? 75.00',
    ),
    relatorio: passo(
      'Um relatório mostra cada valor com o seu nome. Na f-string, o texto fica fora das chaves e a variável fica dentro: f"Sobra: {sobra:.2f}". Um print para cada linha.',
      'dinheiro = 100.0\ntotal = 41.5\nsobra = dinheiro - total\nprint(f"Dinheiro: {dinheiro:.2f}")\nprint(f"Gastos: {total:.2f}")\nprint(f"Sobra: {sobra:.2f}")',
      '',
      'Dinheiro: 100.00\nGastos: 41.50\nSobra: 58.50',
    ),
  },
  tarefas: {
    'tarefas-uma-tarefa': passo(
      'Um dicionário guarda várias informações de uma coisa só, cada uma com um nome, a chave. Ele vai entre chaves { }: "titulo": "Matrix" liga a chave titulo ao valor Matrix. Para ler uma informação, use a chave entre colchetes: filme["titulo"].',
      'filme = {"id": 1, "titulo": "Matrix", "visto": False}\nprint(filme["titulo"])',
      '',
      'Matrix',
    ),
    'construcao-1': passo(
      'Uma lista pode guardar dicionários inteiros. Começa vazia, com [ ], e append coloca o dicionário todo dentro dela, e não só o título. Cada posição da lista passa a ser um filme completo.',
      'filme = {"id": 1, "titulo": "Matrix", "visto": False}\nfilmes = []\nfilmes.append(filme)\nprint(filmes)',
      '',
      '[{\'id\': 1, \'titulo\': \'Matrix\', \'visto\': False}]',
    ),
    'tarefas-ler-chave': passo(
      'for filme in filmes pega um dicionário por volta e guarda na variável filme. Dentro do for, filme["titulo"] lê o título daquele filme. Com um filme na lista, o for dá uma volta só.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nfor filme in filmes:\n    print(filme["titulo"])',
      '',
      'Matrix',
    ),
    'construcao-2': passo(
      'Um segundo filme é outro dicionário, com o mesmo formato e outros valores, colocado com append. Agora o for dá duas voltas, e em cada uma mostra o número e o título daquele filme.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nfilmes.append({"id": 2, "titulo": "Up", "visto": False})\nfor filme in filmes:\n    print(filme["id"], filme["titulo"])',
      '',
      '1 Matrix\n2 Up',
    ),
    'tarefas-achar': passo(
      'Para achar um filme pelo número, o for olha todos e o if escolhe só o que interessa: filme["id"] == id_procurado. Repare: == compara, enquanto = guarda um valor.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nid_procurado = 2\nfor filme in filmes:\n    if filme["id"] == id_procurado:\n        print(filme["titulo"])',
      '',
      'Up',
    ),
    'construcao-3': passo(
      'Ler é filme["visto"]; trocar é filme["visto"] = True. Escrever numa chave que já existe troca o valor guardado. Como o if escolhe só o filme certo, só ele muda. Depois, mostrar todos confirma quem mudou.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nfor filme in filmes:\n    if filme["id"] == 2:\n        filme["visto"] = True\nfor filme in filmes:\n    print(filme["titulo"], filme["visto"])',
      '',
      'Matrix False\nUp True',
    ),
    'tarefas-posicao': passo(
      'Às vezes você quer o lugar do filme na lista, e não o filme. range(len(filmes)) dá as posições 0, 1, 2 e assim por diante. Comece posicao com -1, que quer dizer "não achei"; quando o if encontra, guarda a posição.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nposicao = -1\nfor i in range(len(filmes)):\n    if filmes[i]["id"] == 2:\n        posicao = i\nprint(posicao)',
      '',
      '1',
    ),
    'construcao-4': passo(
      'pop(posicao) tira da lista o item daquela posição. Mas só pode tirar se achou: por isso o if posicao != -1 vem antes. Se o número não existir, posicao continua -1 e nada é removido.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nposicao = -1\nfor i in range(len(filmes)):\n    if filmes[i]["id"] == 2:\n        posicao = i\nif posicao != -1:\n    filmes.pop(posicao)\nprint(len(filmes))\nfor filme in filmes:\n    print(filme["titulo"])',
      '',
      '1\nMatrix',
    ),
    'tarefas-uma-funcao': passo(
      'Uma função dá nome a uma ação. listar recebe a lista e mostra todos; ela não precisa devolver nada, porque o trabalho dela é mostrar. Depois de criada com def, a função só roda quando é chamada: listar(filmes).',
      'def listar(filmes):\n    for filme in filmes:\n        print(filme["id"], filme["titulo"])\n\nfilmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nlistar(filmes)',
      '',
      '1 Matrix\n2 Up',
    ),
    'construcao-5': passo(
      'Um menu é um while que repete até a pessoa escolher sair: cada volta lê a opção com input e o if chama a ação certa. Para dar um número novo a cada cadastro, guarde um contador (proximo_id) e some 1 depois de usar. strip() tira os espaços e evita cadastrar um título vazio.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nproximo_id = 2\n\ndef listar(filmes):\n    for filme in filmes:\n        print(filme["id"], filme["titulo"])\n\nopcao = ""\nwhile opcao != "0":\n    opcao = input("1 listar, 2 cadastrar, 0 sair: ")\n    if opcao == "1":\n        listar(filmes)\n    elif opcao == "2":\n        titulo = input("Título: ").strip()\n        if titulo:\n            filmes.append({"id": proximo_id, "titulo": titulo, "visto": False})\n            proximo_id += 1\n        else:\n            print("O título não pode ficar vazio.")\nprint("Até logo!")',
      '2\nUp\n1\n0',
      '1 listar, 2 cadastrar, 0 sair: Título: 1 listar, 2 cadastrar, 0 sair: 1 Matrix\n2 Up\n1 listar, 2 cadastrar, 0 sair: Até logo!',
    ),
  },
  quiz: {
    'construcao-1': passo(
      'input mostra a pergunta e espera a pessoa digitar. O que ela digita volta como texto e fica guardado na variável. Depois, if compara esse texto com a resposta certa: se for igual, roda o bloco de baixo; se não, roda o bloco do else. Como input sempre devolve texto, a resposta certa também vai entre aspas: "4", e não 4.',
      'resposta = input("Qual a cor do céu? ")\nif resposta == "azul":\n    print("Acertou!")\nelse:\n    print("Tente de novo.")',
      'azul',
      'Qual a cor do céu? Acertou!',
    ),
    'quiz-ler-em-funcao': passo(
      'Uma função dá nome a uma tarefa. Aqui a tarefa é só perguntar: ela recebe o texto da pergunta no parâmetro enunciado, lê a resposta com input e devolve essa resposta com return. Quem chama guarda o que voltou numa variável. O if ainda fica fora da função, do mesmo jeito que estava.',
      'def perguntar(enunciado):\n    resposta = input(enunciado)\n    return resposta\n\nresposta = perguntar("Qual a cor do céu? ")\nif resposta == "azul":\n    print("Acertou!")\nelse:\n    print("Tente de novo.")',
      'verde',
      'Qual a cor do céu? Tente de novo.',
    ),
    'quiz-segundo-valor': passo(
      'Agora a função recebe duas coisas: a pergunta e a resposta certa. Na chamada, os valores entram na ordem dos parâmetros: o primeiro vai para enunciado, o segundo para correta. Com o if dentro da função, a mesma função serve para qualquer pergunta: você só muda o que passa na chamada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n    else:\n        print("Errou. A resposta era", correta)\n\nperguntar("Qual a cor do céu? ", "azul")\nperguntar("Quantas patas tem um gato? ", "4")',
      'azul\n3',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Errou. A resposta era 4',
    ),
    'construcao-2': passo(
      'print só mostra uma mensagem na tela; o programa não consegue usar o que foi mostrado. return entrega um valor para quem chamou, e esse valor pode ser guardado e somado depois. Por isso a função devolve 1 quando acerta e 0 quando erra: o feedback continua no print, e o ponto sai pelo return.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nponto = perguntar("Qual a cor do céu? ", "azul")\nprint("Ponto:", ponto)',
      'azul',
      'Qual a cor do céu? Acertou!\nPonto: 1',
    ),
    'quiz-duas-perguntas': passo(
      'Cada chamada da função devolve 1 ou 0. Guardando cada retorno numa variável, dá para somar os dois e ter o placar. Repare que se soma o ponto devolvido, e não a resposta digitada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nprimeiro = perguntar("Qual a cor do céu? ", "azul")\nsegundo = perguntar("Quantas patas tem um gato? ", "4")\npontos = primeiro + segundo\nprint("Pontos:", pontos)',
      'azul\n3',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Errou.\nPontos: 1',
    ),
    'construcao-3': passo(
      'Com cinco perguntas, fica mais simples usar um acumulador: pontos começa em 0, e cada chamada soma o seu ponto com pontos += .... No fim, pontos tem o total. É o mesmo acumulador da média de notas.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\npontos = 0\npontos += perguntar("Qual a cor do céu? ", "azul")\npontos += perguntar("Quantas patas tem um gato? ", "4")\npontos += perguntar("Qual animal mia? ", "gato")\nprint("Placar:", pontos, "de 3")',
      'azul\n4\ncachorro',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Acertou!\nQual animal mia? Errou.\nPlacar: 2 de 3',
    ),
    'quiz-alternativas': passo(
      'Com alternativas, a pessoa digita só uma letra, e a resposta certa da chamada passa a ser essa letra. strip() tira espaços das pontas e lower() deixa tudo minúsculo: assim " B" também vale como "b". A função continua igual, só mudam os valores da chamada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado).strip().lower()\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou. Era a letra", correta)\n        return 0\n\npontos = 0\npontos += perguntar("Qual a cor do céu? a) verde b) azul c) roxo ", "b")\nprint("Placar:", pontos)',
      ' B',
      'Qual a cor do céu? a) verde b) azul c) roxo Acertou!\nPlacar: 1',
    ),
    'quiz-resposta-invalida': passo(
      'while repete enquanto a condição for verdadeira. Aqui a condição é "a resposta não é a, nem b, nem c". Enquanto for assim, a função avisa e pede de novo. Só quando vier uma letra válida o laço termina e o if corrige. Por isso uma letra inválida não ganha nem perde ponto: ela nem chega ao if.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado).strip().lower()\n    while resposta != "a" and resposta != "b" and resposta != "c":\n        print("Digite só a, b ou c.")\n        resposta = input(enunciado).strip().lower()\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nperguntar("Qual a cor do céu? a) verde b) azul c) roxo ", "b")',
      'x\n\nb',
      'Qual a cor do céu? a) verde b) azul c) roxo Digite só a, b ou c.\nQual a cor do céu? a) verde b) azul c) roxo Digite só a, b ou c.\nQual a cor do céu? a) verde b) azul c) roxo Acertou!',
    ),
    'quiz-escolha-rodada': passo(
      'Para saber se a pessoa quer jogar de novo, primeiro é preciso perguntar e guardar a resposta. Ela fica numa variável, jogar, e no próximo passo o programa vai usar essa variável para decidir se repete. Aqui só se pergunta e se guarda.',
      'print("Placar: 3 de 5")\njogar = input("Jogar de novo? (s/n) ")\nprint("Você escolheu:", jogar)',
      's',
      'Placar: 3 de 5\nJogar de novo? (s/n) Você escolheu: s',
    ),
    'construcao-4': passo(
      'while jogar == "s": repete a rodada inteira enquanto a pessoa responder s. Por isso jogar começa valendo "s", para a primeira rodada acontecer. Tudo o que é da rodada vai dentro do while, com quatro espaços: zerar os pontos, as perguntas, o placar e a pergunta final. A pergunta final muda jogar, e é isso que permite o laço terminar. A função fica fora do while: ela é criada uma vez e usada em todas as rodadas.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        return 1\n    return 0\n\njogar = "s"\nwhile jogar == "s":\n    pontos = 0\n    pontos += perguntar("Qual a cor do céu? ", "azul")\n    print("Placar:", pontos)\n    jogar = input("Jogar de novo? (s/n) ")\nprint("Fim de jogo.")',
      'azul\ns\nverde\nn',
      'Qual a cor do céu? Placar: 1\nJogar de novo? (s/n) Qual a cor do céu? Placar: 0\nJogar de novo? (s/n) Fim de jogo.',
    ),
    'construcao-5': passo(
      'O quiz já funciona; agora ele fica com a sua cara. Troque as cinco perguntas por assuntos que você estudou e confira a letra certa de cada uma. Para o README, anote o que você testou de verdade: uma rodada sem acertos, uma com todos os acertos, uma letra inválida seguida de uma válida, e duas rodadas para mostrar que o placar recomeça em zero.',
      '# Exemplo de uma pergunta sua, reaproveitando a mesma função:\n# pontos += perguntar("O que print faz? a) mostra na tela b) guarda um valor c) repete ", "a")\nprint("Troque as perguntas e teste cada caso.")',
      '',
      'Troque as perguntas e teste cada caso.',
    ),
  },
};

export const ensinoDoPasso = (projetoId, passoId) => ensinoDosProjetos[projetoId]?.[passoId] || null;
