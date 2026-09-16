// Small exercises before combining functions, input and scoring in the quiz.
// O enunciado e as pistas nunca entregam o programa pronto. A única solução que existe aqui
// é a que alimenta o quebra-cabeça de blocos embaralhados, um apoio pedagógico deliberado e
// opcional: ela fica privada ao módulo, não é exportada, e só aparece já embaralhada na tela.
import { toBlocks } from './parsons.js';

const bridges = [
  {
    id: 'ponte-funcao-chamar', title: 'Criar não é executar',
    concept: 'def guarda instruções com um nome. Elas só acontecem quando você escreve esse nome com (). Os quatro espaços mostram o que pertence à função. A chamada fica sem esses espaços, depois do bloco.',
    example: 'def avisar():\n    print("A porta abriu")\n\navisar()',
    starter: 'def iniciar():\n    print("Vamos estudar")\n\n# Chame iniciar aqui, fora do bloco.\n',
    challenge: 'A função iniciar já está escrita. Acrescente uma única linha para executá-la e mostrar Vamos estudar.', expected: 'Vamos estudar', stdin: '',
    question: 'Qual linha executa uma função chamada iniciar?', options: ['print(iniciar)', 'iniciar()', 'def iniciar():'], answer: 1,
    hints: ['Você não precisa de outro print: ele já está dentro da função.', 'Olhe a última linha do exemplo. Escreva o nome da sua função seguido de (). Sem (), você apenas se refere à função.'],
    prerequisites: ['funcoes']
  },
  {
    id: 'ponte-funcao-retornar', title: 'Devolver, guardar e mostrar',
    concept: 'return entrega um valor para a linha que chamou a função. Ele não mostra esse valor. Primeiro chame e guarde o retorno em uma variável; depois mostre a variável com print. São duas ações.',
    example: 'def mensagem():\n    return "Bom dia"\n\ntexto = mensagem()\nprint(texto)',
    starter: 'def assunto():\n    return "Python"\n\n# 1. Chame assunto e guarde o retorno em texto.\n# 2. Mostre texto.\n',
    challenge: 'A função assunto devolve Python. Guarde esse retorno em texto e mostre texto. Use uma linha para guardar e outra para mostrar.', expected: 'Python', stdin: '',
    question: 'Se você mantiver texto = assunto() e apagar print(texto), o que acontece?', options: ['O texto continua guardado, mas não aparece na saída', 'A função deixa de executar', 'return mostra Python mesmo sem print'], answer: 0,
    hints: ['O lado direito de = precisa chamar a função com (). O lado esquerdo é o nome que guardará a resposta.', 'Compare texto = mensagem() com o nome da sua função. Depois use o print que você já conhece. return print(...) devolveria None, pois print mostra o texto, mas não devolve esse texto.'],
    prerequisites: ['ponte-funcao-chamar']
  },
  {
    id: 'ponte-funcao-parametro', title: 'Entregar um valor à função',
    concept: 'Em def triplo(numero), numero é um nome que recebe o valor da chamada. triplo(4) entrega 4 a numero. Esse nome que recebe um valor se chama parâmetro. Você pode mudar o valor da chamada sem reescrever a função.',
    example: 'def triplo(numero):\n    return numero * 3\n\nresultado = triplo(4)\nprint(resultado)',
    starter: 'def dobro(numero):\n    return numero * 2\n\n# Chame dobro com 5, guarde o retorno e mostre.\n',
    challenge: 'A função dobro já calcula o dobro do número recebido. Chame-a com 5, guarde em resultado e mostre resultado.', expected: '10', stdin: '',
    question: 'Na chamada dobro(5), que valor chega ao nome numero?', options: ['2', '10', '5'], answer: 2,
    hints: ['O valor vai dentro dos parênteses da chamada. A conta já está pronta dentro da função.', 'Siga as duas últimas linhas do exemplo: chamada guardada em resultado, depois print(resultado). Troque o nome da função e o valor recebido.'],
    prerequisites: ['ponte-funcao-retornar', 'operadores']
  },
  {
    id: 'ponte-funcao-dois-parametros', title: 'Dois valores, na mesma ordem',
    concept: 'Vírgulas separam os valores. Em def juntar(inicio, fim), o primeiro valor da chamada chega a inicio e o segundo chega a fim. Os nomes ajudam a saber para que cada valor serve.',
    example: 'def juntar(inicio, fim):\n    return inicio + fim\n\ntexto = juntar("Bom ", "dia")\nprint(texto)',
    starter: 'def somar(primeiro, segundo):\n    return primeiro + segundo\n\n# Chame somar com 7 e 3. Guarde e mostre o retorno.\n',
    challenge: 'Chame somar passando 7 e 3, nesta ordem. Guarde o retorno em total e mostre total. A função já está escrita.', expected: '10', stdin: '',
    question: 'Em somar(7, 3), o que cada nome recebe?', options: ['primeiro recebe 3 e segundo recebe 7', 'primeiro recebe 7 e segundo recebe 3', 'Os dois recebem 10'], answer: 1,
    hints: ['A chamada precisa de dois valores separados por vírgula, dentro do mesmo par de parênteses.', 'Escreva total = nome_da_funcao(valor1, valor2), usando os nomes e valores do enunciado. Depois mostre total.'],
    prerequisites: ['ponte-funcao-parametro', 'strings']
  },
  {
    id: 'ponte-funcao-comparar', title: 'Comparar dois textos',
    concept: '== pergunta se dois valores são iguais. = guarda um valor. "azul" == "azul" dá True; "azul" == "verde" dá False. input sempre devolve texto: para comparar textos, a resposta esperada também precisa ser texto.',
    example: 'def mesmo_nome(recebido, esperado):\n    return recebido == esperado\n\nigual = mesmo_nome("Ana", "Bia")\nprint(igual)',
    starter: 'def mesma_cor(recebida, esperada):\n    # Devolva o resultado da comparação entre recebida e esperada.\n    pass\n\nresultado = mesma_cor("azul", "azul")\nprint(resultado)',
    challenge: 'Substitua pass por uma linha que devolva se recebida e esperada são iguais. A chamada de teste já está pronta. pass é apenas um espaço provisório: não faz nada.', expected: 'True', stdin: '',
    question: 'Por que "20" == 20 dá False?', options: ['Porque um valor é texto e o outro é número', 'Porque == só compara números', 'Porque precisa usar = no lugar de =='], answer: 0,
    hints: ['Você já sabe devolver com return. O valor devolvido aqui será o resultado de uma comparação.', 'Use == entre os dois nomes recebidos. Mantenha a linha dentro da função, com quatro espaços.'],
    prerequisites: ['ponte-funcao-dois-parametros', 'condicoes', 'tipos']
  },
  {
    id: 'ponte-funcao-ponto', title: 'Escolher o que devolver',
    concept: 'Uma função pode escolher entre dois retornos com if e else. return 1 entrega o número 1; return 0 entrega 0. Nenhum deles mostra uma mensagem. Ao encontrar return, Python termina essa chamada da função.',
    example: 'def vale_ponto(quantidade):\n    if quantidade >= 3:\n        return 1\n    else:\n        return 0\n\nponto = vale_ponto(4)\nprint(ponto)',
    starter: 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        # Devolva um ponto para cores iguais.\n        pass\n    else:\n        # Devolva zero para cores diferentes.\n        pass\n\nponto = ponto_por_cor("azul", "azul")\nprint(ponto)',
    challenge: 'Troque cada pass pelo retorno pedido. Cores iguais devolvem 1; diferentes devolvem 0. Não acrescente input ainda: teste uma coisa por vez.', expected: '1', stdin: '',
    question: 'Se as cores forem diferentes, qual resultado essa regra precisa devolver?', options: ['O texto "0"', 'Sempre 1', 'O número 0'], answer: 2,
    hints: ['O if e o else já estão prontos. Só faltam dois números, um em cada return.', 'Compare os retornos do exemplo. Como o return está dentro do if ou do else, ele usa oito espaços; if e else usam quatro. Depois troque uma cor para conferir o caminho de erro.'],
    prerequisites: ['ponte-funcao-comparar']
  },
  {
    id: 'ponte-funcao-entrada', title: 'Uma função que faz uma pergunta',
    concept: 'A pergunta pode chegar como um parâmetro. Dentro da função, input(mensagem) mostra essa pergunta e espera o que a pessoa digitar. Guarde o texto recebido e devolva com return. Quem chamou escolhe o que fazer com esse texto.',
    example: 'def ler_nome(mensagem):\n    resposta = input(mensagem)\n    return resposta\n\nnome = ler_nome("Qual é seu nome? ")\nprint(nome)',
    exampleStdin: 'Ana',
    starter: 'def ler_cor(mensagem):\n    # Leia uma resposta usando mensagem como pergunta.\n    # Depois devolva a resposta lida.\n    pass\n\ncor = ler_cor("Qual é sua cor favorita? ")\nprint(cor)',
    challenge: 'Complete ler_cor em duas linhas: leia a resposta e devolva o texto recebido. Neste teste, digite azul quando o programa perguntar. A pergunta também aparece na saída, porque input mostra a mensagem antes de esperar a resposta, sem pular linha sozinha.', expected: 'Qual é sua cor favorita? azul', stdin: 'azul',
    question: 'Depois de digitar azul, qual valor fica em cor?', options: ['O texto da pergunta', 'O texto "azul", devolvido pela função', 'A função ler_cor'], answer: 1,
    hints: ['Use resposta = input(mensagem) como no exemplo de nome. mensagem já contém a pergunta recebida.', 'Na linha seguinte, devolva resposta com return. Deixe as duas linhas dentro da função. Não use return print(resposta): mostrar e devolver são ações diferentes.'],
    prerequisites: ['ponte-funcao-ponto', 'entrada']
  },
  {
    id: 'ponte-funcao-reutilizar', title: 'Somar retornos, uma chamada por vez',
    concept: 'A mesma função pode trabalhar várias vezes com valores diferentes. Cada chamada devolve seu próprio resultado. Primeiro guarde os retornos em nomes separados; só depois some esses números.',
    example: 'def dobro(numero):\n    return numero * 2\n\nprimeiro = dobro(2)\nsegundo = dobro(3)\ntotal = primeiro + segundo\nprint(total)',
    starter: 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        return 1\n    else:\n        return 0\n\nprimeiro = ponto_por_cor("azul", "azul")\nsegundo = ponto_por_cor("verde", "azul")\n# Some os dois retornos em total e mostre.\n',
    challenge: 'As duas chamadas já estão prontas: uma acerta e outra erra. Some primeiro e segundo em total e mostre total. Não some os textos das cores.', expected: '1', stdin: '',
    question: 'Se os dois retornos forem 1, quanto vale a soma deles?', options: ['2', '1', 'O texto "11"'], answer: 0,
    hints: ['primeiro e segundo já guardam números. A soma é igual às contas com variáveis da primeira etapa.', 'Crie total usando + entre os nomes e mostre com print. Depois mude a segunda cor para azul e confira se o total acompanha a mudança.'],
    prerequisites: ['ponte-funcao-entrada']
  }
];

// Solução de referência de cada ponte, para o quebra-cabeça de blocos embaralhados.
// Mostrar em blocos é apoio deliberado; a cópia em tests/function-bridge-reference.js existe
// só para a checagem automatizada e fica fora do pacote da aplicação de propósito.
const solutions = {
  'ponte-funcao-chamar': 'def iniciar():\n    print("Vamos estudar")\n\niniciar()',
  'ponte-funcao-retornar': 'def assunto():\n    return "Python"\n\ntexto = assunto()\nprint(texto)',
  'ponte-funcao-parametro': 'def dobro(numero):\n    return numero * 2\n\nresultado = dobro(5)\nprint(resultado)',
  'ponte-funcao-dois-parametros': 'def somar(primeiro, segundo):\n    return primeiro + segundo\n\ntotal = somar(7, 3)\nprint(total)',
  'ponte-funcao-comparar': 'def mesma_cor(recebida, esperada):\n    return recebida == esperada\n\nresultado = mesma_cor("azul", "azul")\nprint(resultado)',
  'ponte-funcao-ponto': 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        return 1\n    else:\n        return 0\n\nponto = ponto_por_cor("azul", "azul")\nprint(ponto)',
  'ponte-funcao-entrada': 'def ler_cor(mensagem):\n    resposta = input(mensagem)\n    return resposta\n\ncor = ler_cor("Qual é sua cor favorita? ")\nprint(cor)',
  'ponte-funcao-reutilizar': 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        return 1\n    else:\n        return 0\n\nprimeiro = ponto_por_cor("azul", "azul")\nsegundo = ponto_por_cor("verde", "azul")\ntotal = primeiro + segundo\nprint(total)'
};

// Uma linha plausível e errada por ponte: o engano exato que aquela ponte existe para desfazer.
const distractors = {
  'ponte-funcao-chamar': 'iniciar',
  'ponte-funcao-retornar': 'print(assunto)',
  'ponte-funcao-parametro': 'resultado = dobro',
  'ponte-funcao-dois-parametros': 'total = somar(7)',
  'ponte-funcao-comparar': 'return recebida = esperada',
  'ponte-funcao-ponto': 'return "1"',
  'ponte-funcao-entrada': 'resposta = input()',
  'ponte-funcao-reutilizar': 'total = primeiro - segundo'
};


export const functionBridges = bridges.map(bridge => ({
  ...bridge, moduleId: 'logica', lessonId: 'funcoes', kind: 'bridge',
  exampleStdin: bridge.exampleStdin || '',
  puzzle: { blocks: toBlocks(solutions[bridge.id]), prefix: '', distractor: distractors[bridge.id] || '' }
}));

export const functionBridgeIds = functionBridges.map(bridge => bridge.id);

export function recordBridgeProgress(state, id, patch, date) {
  const bridge = functionBridges.find(item => item.id === id);
  if (!bridge) return state;
  const previous = state.functionBridges?.[id] || {};
  const next = { ...previous, ...patch };
  const completedBefore = previous.passed === true && previous.quizCorrect === true;
  const completedNow = next.passed === true && next.quizCorrect === true;
  const key = `bridge:${id}`;
  const activities = completedNow && !completedBefore && date
    ? { ...state.activities, [date]: [...new Set([...(state.activities?.[date] || []), key])] }
    : state.activities;
  return { ...state, functionBridges: { ...state.functionBridges, [id]: next }, activities };
}


// Só ids conhecidos entram, e o código guardado é limitado como nos outros editores.
export function normalizeBridges(input) {
  const result = {};
  for (const bridge of functionBridges) {
    const item = input?.functionBridges?.[bridge.id];
    if (!item || typeof item !== 'object') continue;
    result[bridge.id] = {
      passed: item.passed === true,
      quizCorrect: item.quizCorrect === true && item.answered === bridge.answer,
      answered: Number.isInteger(item.answered) && item.answered >= 0 && item.answered < bridge.options.length ? item.answered : null,
      code: typeof item.code === 'string' ? item.code.slice(0, 15000) : ''
    };
  }
  return result;
}
