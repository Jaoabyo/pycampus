// Small practice tasks for the final three stages. The complete solution is used
// by the existing optional block puzzle; it is not placed in the learner's editor.
const toBlocks = code => code.split('\n').filter(line => line.trim()).map(line => ({
  code: line.trim(), indent: (line.length - line.trimStart().length) / 4
}));

const authored = [
  {
    id: 'resposta-api', title: 'Lendo uma resposta', prerequisite: 'http', icon: 'Globe',
    story: 'Vamos representar uma resposta com dicionários, como na aula de HTTP. Aqui você pratica os dados; ainda não precisa criar um servidor.',
    example: 'resposta = {"status": 200, "body": {"mensagem": "Consulta concluída"}}\nprint(resposta["body"]["mensagem"])',
    output: 'Consulta concluída',
    modify: 'Troque somente a mensagem para Cadastro concluído e execute.',
    modified: 'Cadastro concluído',
    create: 'Crie resposta com status 201 e, dentro de body, mensagem Criado. Mostre primeiro o status e depois a mensagem, um por linha.',
    expected: '201\nCriado',
    hint: 'Faça dois prints. Para o status, basta uma chave. Para a mensagem, primeiro entre em body e depois procure mensagem.',
    solution: 'resposta = {"status": 201, "body": {"mensagem": "Criado"}}\nprint(resposta["status"])\nprint(resposta["body"]["mensagem"])',
    distractor: 'print(resposta["mensagem"])',
    investigate: {
      question: 'Por que usamos duas chaves para chegar à mensagem?',
      options: ['Porque body guarda outro dicionário, e mensagem está dentro dele', 'Porque todo print precisa de duas chaves', 'Porque o número do status escolhe a mensagem automaticamente'],
      line: 'print(resposta["body"]["mensagem"])',
      why: 'O primeiro acesso pega o dicionário body. O segundo pega o texto que está na chave mensagem desse dicionário.'
    }
  },
  {
    id: 'pagina-habitos', title: 'Uma página por vez', prerequisite: 'paginacao', icon: 'ListTodo',
    story: 'Você tem seis itens, mas quer mostrar só dois por página. Vamos escolher o pedaço certo da lista.',
    example: 'itens = [10, 20, 30, 40, 50, 60]\npagina = 1\ntamanho = 2\ninicio = (pagina - 1) * tamanho\nfim = inicio + tamanho\nprint(itens[inicio:fim])',
    output: '[10, 20]',
    modify: 'Mude somente pagina para 2. Mantenha dois itens por página.',
    modified: '[30, 40]',
    create: 'Use a lista [10, 20, 30, 40, 50, 60]. Calcule o início e o fim da página 3 com tamanho 2 e mostre esse pedaço da lista.',
    expected: '[50, 60]',
    hint: 'A primeira página começa no índice zero. Desconte 1 do número da página antes de multiplicar pelo tamanho. O fim fica duas posições depois do início.',
    solution: 'itens = [10, 20, 30, 40, 50, 60]\npagina = 3\ntamanho = 2\ninicio = (pagina - 1) * tamanho\nfim = inicio + tamanho\nprint(itens[inicio:fim])',
    distractor: 'inicio = pagina * tamanho',
    investigate: {
      question: 'Por que aparece pagina - 1 na conta do início?',
      options: ['Porque a página 1 começa no índice 0 da lista', 'Porque Python sempre ignora a primeira página', 'Porque precisamos tirar um item de cada página'],
      line: 'inicio = (pagina - 1) * tamanho',
      why: 'Página 1 começa no índice 0; página 2, no índice 2; página 3, no índice 4. Tirar 1 faz os números das páginas combinarem com esses índices.'
    }
  },
  {
    id: 'regra-testada', title: 'Conferindo uma regra', prerequisite: 'testes', icon: 'ShieldCheck',
    story: 'Cada acerto vale dez pontos. Vamos pedir ao Python para conferir um caso sem acertos e um caso com acertos.',
    example: 'def pontuar(acertos):\n    return acertos * 10\n\nassert pontuar(0) == 0\nassert pontuar(2) == 20\nprint("Testes passaram")',
    output: 'Testes passaram',
    modify: 'Mantenha o teste com zero. No segundo assert, teste 3 acertos e espere 30 pontos.',
    modified: 'Testes passaram',
    create: 'Crie triplo(numero), que devolve três vezes o número. Use assert para conferir triplo(0) igual a 0 e triplo(4) igual a 12. Depois dos testes, mostre Conferido.',
    expected: 'Conferido',
    hint: 'Primeiro escreva a função. Depois, fora dela, compare duas chamadas com respostas que você calculou. Deixe o print depois dos dois asserts.',
    solution: 'def triplo(numero):\n    return numero * 3\n\nassert triplo(0) == 0\nassert triplo(4) == 12\nprint("Conferido")',
    distractor: 'assert triplo(4) == 4',
    investigate: {
      question: 'Se pontuar(2) devolver 10, o que acontece no segundo assert?',
      options: ['O teste falha e o print final não executa', 'O assert muda a resposta para 20', 'O programa mostra Testes passaram mesmo assim'],
      line: 'assert pontuar(2) == 20',
      why: 'assert confere a comparação. Se ela for falsa, acontece AssertionError e a execução para ali. Ele não corrige o resultado da função.'
    }
  },
  {
    id: 'contrato-funcao', title: 'Tipos que explicam a função', prerequisite: 'tipagem', icon: 'Code2',
    story: 'As anotações de tipo ajudam outra pessoa a entender quais valores sua função espera receber e devolver.',
    example: 'def dobro(numero: int) -> int:\n    return numero * 2\n\nprint(dobro(4))',
    output: '8',
    modify: 'Mude somente o valor da chamada de dobro: use 6 no lugar de 4.',
    modified: '12',
    create: 'Crie descontar(preco: float, desconto: float) -> float. Ela deve devolver o preço menos o desconto. Mostre o resultado de descontar(30.0, 5.0).',
    expected: '25.0',
    hint: 'Os dois nomes recebem os números na ordem da chamada. As anotações ficam na definição; a conta continua sendo uma subtração devolvida com return.',
    solution: 'def descontar(preco: float, desconto: float) -> float:\n    return preco - desconto\n\nprint(descontar(30.0, 5.0))',
    distractor: 'return preco + desconto',
    investigate: {
      question: 'O que -> int informa na definição de dobro?',
      options: ['Que o resultado esperado da função é um inteiro', 'Que Python transforma qualquer resultado em inteiro automaticamente', 'Que a função deve imprimir a palavra int'],
      line: 'def dobro(numero: int) -> int:',
      why: 'A seta anota o tipo esperado do retorno. Ela não faz conversão nem impede, sozinha, que a função devolva outro tipo.'
    }
  },
  {
    id: 'numeros-em-etapas', title: 'Um número por vez', prerequisite: 'geradores', icon: 'Workflow',
    story: 'Um gerador pode entregar um número, pausar e continuar depois. Aqui list pede todos os números para conseguirmos conferir a sequência.',
    example: 'def numeros(limite):\n    for numero in range(1, limite):\n        yield numero\n\nprint(list(numeros(4)))',
    output: '[1, 2, 3]',
    modify: 'Na chamada de numeros, troque o limite 4 por 3.',
    modified: '[1, 2]',
    create: 'Crie passos(limite). Percorra os números de 1 até antes de limite e entregue o dobro de cada um com yield. Mostre list(passos(4)).',
    expected: '[2, 4, 6]',
    hint: 'Use for com range(1, limite). Dentro dele, yield entrega o dobro do número atual. O limite continua de fora do range.',
    solution: 'def passos(limite):\n    for numero in range(1, limite):\n        yield numero * 2\n\nprint(list(passos(4)))',
    distractor: 'return numero * 2',
    investigate: {
      question: 'O que yield faz depois de entregar um número?',
      options: ['Pausa a função e permite continuar quando o próximo valor for pedido', 'Encerra a função definitivamente, como return', 'Mostra o número na tela sem precisar de print'],
      line: '        yield numero',
      why: 'yield entrega um valor e guarda o ponto em que a função parou. A próxima solicitação continua dali; return encerraria a função.'
    }
  },
  {
    id: 'valor-do-meio', title: 'Encontrando o valor do meio', prerequisite: 'analise', icon: 'Layers',
    story: 'Três entregas levaram tempos diferentes. Vamos achar o tempo do meio, sem deixar a entrega mais demorada decidir o resultado sozinha.',
    example: 'from statistics import median\ntempos = [10, 20, 90]\nprint(median(tempos))',
    output: '20',
    modify: 'Troque somente o tempo 90 por 30. Antes de executar, pense se o valor do meio muda.',
    modified: '20',
    create: 'Importe median de statistics. Guarde [15, 5, 25] em tempos e mostre a mediana. A função encontra o meio mesmo quando a lista não está ordenada.',
    expected: '15',
    hint: 'Use o mesmo formato de importação do exemplo. Depois entregue a lista à função median e mostre o resultado.',
    solution: 'from statistics import median\ntempos = [15, 5, 25]\nprint(median(tempos))',
    distractor: 'print(sum(tempos))',
    investigate: {
      question: 'Por que a mediana de [10, 20, 90] é 20?',
      options: ['Porque 20 fica no meio dos três valores ordenados', 'Porque 20 é a soma dividida por três', 'Porque median sempre escolhe a primeira posição da lista'],
      line: 'print(median(tempos))',
      why: 'Os valores ordenados são 10, 20 e 90. O central é 20. A média usaria outra conta: somar os três e dividir por três.'
    }
  }
];

export const additionalPractices = authored.map((item, index) => {
  const { distractor, investigate, ...practice } = item;
  const offset = index % investigate.options.length;
  return {
    ...practice,
    puzzle: { blocks: toBlocks(practice.solution), prefix: '', distractor },
    investigate: {
      ...investigate,
      options: [...investigate.options.slice(offset), ...investigate.options.slice(0, offset)],
      answer: (investigate.options.length - offset) % investigate.options.length
    }
  };
});
