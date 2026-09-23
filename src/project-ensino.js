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
