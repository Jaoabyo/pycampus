const requisito = (id, descricao, regex) => ({
  id,
  descricao,
  atende: (codigo) => regex.test(codigo),
});

// Sínteses das habilidades praticadas; separadas da contagem das 16 aulas.
export const projetosDaFaculdade = [
  {
    id: 'projeto-u1',
    unidade: 'u1',
    titulo: 'Miniprojeto: boletim de notas',
    minutos: 35,
    guia: 'r3',
    teoria: [
      'Você vai juntar conversão, repetição, função e decisão. As quatro aulas da Unidade 1 preparam esses recursos. Primeiro transforme os textos em números; depois calcule a média; por último escolha a situação do aluno.',
    ],
    roteiro: [
      'Dentro de calcular_media, comece total em zero. Percorra os textos e some cada float(nota).',
      'Devolva total dividido por len(notas). Chame a função fora do bloco e guarde a média.',
      'Use if e else: média maior ou igual a 7 recebe Aprovado; caso contrário, Revisar. Mostre a média e a situação.',
    ],
    desafio:
      'Crie calcular_media(notas) para receber a lista de notas em texto, converter cada valor com float e calcular a média usando for. Mostre a média. Depois use if/else para mostrar Aprovado quando ela for maior ou igual a 7, ou Revisar caso contrário. Teste também outras notas para conferir as duas situações.',
    starter:
      'notas = ["6", "8", "7", "9"]\n# 1. Defina a funcao\n# 2. Calcule a media\n# 3. Escolha e mostre a situacao\n',
    esperado: 'Media: 7.5\nAprovado',
    pergunta: 'Por que a conversão precisa acontecer antes de somar as notas?',
    opcoes: [
      'As notas estão em texto; a soma da média precisa de números',
      'Não precisa: sum soma textos que parecem números',
      'Para arredondar as notas antes da média',
    ],
    resposta: 0,
    explicacao:
      'As notas chegam como texto, e sum não soma texto: sum(["6", "8"]) dá erro de tipo. float transforma cada texto em número; o acumulador reúne os valores, return entrega a média e if escolhe a situação a partir dela.',
    requisitosCodigo: [
      requisito(
        'funcao',
        'definir calcular_media e devolver a média',
        /def\s+calcular_media\s*\([\s\S]*return/,
      ),
      requisito('conversao', 'usar float na conversão', /float\s*\(/),
      requisito('laco', 'percorrer as notas com for', /\bfor\b/),
      requisito(
        'decisao',
        'escolher uma situação com if e else',
        /\bif\b[\s\S]*\belse\b/,
      ),
    ],
  },
  {
    id: 'projeto-u2',
    unidade: 'u2',
    titulo: 'Miniprojeto: contador de visitas',
    minutos: 35,
    guia: 'u2a3',
    teoria: [
      'Vamos combinar uma classe com uma lista de visitas. Cada nome é uma visita; nomes repetidos são visitas da mesma pessoa. O objeto guarda essa lista e um método conta as pessoas diferentes.',
    ],
    roteiro: [
      'Defina a classe Registro. Em __init__(self, visitas), guarde visitas em self.visitas.',
      'Crie pessoas_unicas(self), que devolve len(set(self.visitas)). set tira os nomes repetidos; len conta os que ficaram.',
      'Crie registro com a lista dada. Use len(registro.visitas) para o total de visitas e registro.pessoas_unicas() para pessoas diferentes.',
    ],
    desafio:
      'Implemente Registro e seu método pessoas_unicas. Guarde a lista de visitas no objeto e mostre o total de visitas e de pessoas diferentes. Depois acrescente uma visita repetida: qual contagem deve mudar?',
    starter:
      'visitas = ["Ana", "Bia", "Ana", "Caio"]\n# Defina Registro, crie registro e mostre as duas contagens\n',
    esperado: 'Visitas: 4\nPessoas: 3',
    pergunta: 'Se Ana visitar de novo, o que muda?',
    opcoes: [
      'Visitas aumenta; pessoas diferentes continua igual',
      'As duas contagens aumentam',
      'Nenhuma contagem muda',
    ],
    resposta: 0,
    explicacao:
      'A lista registra cada ocorrência. O conjunto usado pelo método mantém Ana uma vez só, independentemente de quantas visitas ela fez.',
    requisitosCodigo: [
      requisito('classe', 'definir a classe Registro', /class\s+Registro\b/),
      requisito(
        'atributo',
        'guardar as visitas em self.visitas',
        /self\.visitas\s*=/,
      ),
      requisito(
        'metodo',
        'definir pessoas_unicas com retorno',
        /def\s+pessoas_unicas[\s\S]*return/,
      ),
      requisito('conjunto', 'eliminar repetidos com set', /set\s*\(/),
      requisito('objeto', 'criar um Registro', /registro\s*=\s*Registro\s*\(/),
    ],
  },
  {
    id: 'projeto-u3',
    unidade: 'u3',
    titulo: 'Miniprojeto: relatório de vendas',
    minutos: 35,
    guia: 'u3a3',
    teoria: [
      'Você vai responder uma pergunta a partir de uma tabela: quais produtos passaram da meta de receita? Leia os dados, filtre as linhas e apresente os nomes e a quantidade. O relatório deve resultar dos dados, sem escrever os nomes finais manualmente.',
    ],
    roteiro: [
      'Use a tabela vendas do editor. Compare a coluna receita com o limite 100.',
      'Aplique essa comparação à tabela e guarde as linhas selecionadas.',
      'Mostre list(selecionadas["nome"]) e len(selecionadas). Teste a receita 100: ela não deve entrar, pois o pedido é maior que 100.',
    ],
    desafio:
      'Filtre vendas para receitas maiores que 100. Exiba os nomes selecionados como lista e o número de linhas selecionadas. Depois altere o limite e confira se os dois resultados continuam consistentes.',
    starter:
      'import pandas as pd\nvendas = pd.DataFrame({"nome": ["A", "B", "C", "D"], "receita": [120, 80, 150, 100]})\n# Filtre, extraia os nomes e conte as linhas\n',
    esperado: "Produtos: ['A', 'C']\nQuantidade: 2",
    pergunta: 'Por que o produto D não aparece no relatório?',
    opcoes: [
      'Sua receita é 100; a condição pede maior que 100',
      'Porque só cabem dois produtos',
      'Porque o filtro remove sempre a última linha',
    ],
    resposta: 0,
    explicacao:
      'Maior que (>) exclui a igualdade. Se a regra fosse maior ou igual (>=), D também entraria.',
    requisitosCodigo: [
      requisito(
        'filtro',
        'filtrar as receitas maiores que 100',
        /vendas\s*\[\s*vendas\s*\[["']receita["']\]\s*>\s*100\s*\]/,
      ),
      requisito(
        'nomes',
        'extrair a coluna nome como lista',
        /list\s*\([^\n]*\[["']nome["']\]/,
      ),
      requisito('quantidade', 'contar as linhas com len', /len\s*\(/),
    ],
  },
  {
    id: 'projeto-u4',
    unidade: 'u4',
    titulo: 'Projeto de síntese: calculadora testada',
    minutos: 45,
    guia: 'u4a3',
    teoria: [
      'A lógica de uma calculadora deve funcionar antes de ser ligada a botões. Você vai construir e testar essa lógica com os recursos que já praticou. Este projeto roda em Python e não cria uma interface mobile.',
    ],
    roteiro: [
      'Implemente calcular(a, b, operacao). Se operacao for "soma", devolva a + b; senão, devolva a - b. O projeto considera somente soma e subtração.',
      'Na classe TestCalculadora, escreva três métodos test_: soma de 2 e 3, subtração de 5 e 2 e subtração de 2 e 5.',
      'Use self.assertEqual com resultados esperados 5, 3 e -3. Execute os testes e depois provoque um erro de propósito na função para ver o teste detectá-lo. Corrija antes de registrar.',
    ],
    desafio:
      'Construa calcular para as operações soma e subtração. Escreva três testes com assertEqual, incluindo um resultado negativo. O executor está pronto: ele deve mostrar três testes e nenhuma falha. Depois explique qual teste detectaria trocar a subtração por soma.',
    starter:
      'import unittest\nimport io\n\ndef calcular(a, b, operacao):\n    pass\n\nclass TestCalculadora(unittest.TestCase):\n    pass\n\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(TestCalculadora)\nresultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)\nprint("Testes:", resultado.testsRun)\nprint("Falhas:", len(resultado.failures) + len(resultado.errors))\n',
    esperado: 'Testes: 3\nFalhas: 0',
    pergunta: 'Por que incluir uma subtração com resultado negativo?',
    opcoes: [
      'Para verificar um caso diferente dos resultados positivos',
      'Para ter mais testes, que é o que garante um código bom',
      'Não muda nada: se funciona com positivos, funciona com negativos',
    ],
    resposta: 0,
    explicacao:
      'Casos diferentes verificam comportamentos diferentes. Três testes passando são evidência para esses casos, não prova de que toda entrada possível foi coberta.',
    requisitosCodigo: [
      requisito(
        'funcao',
        'implementar calcular com retorno',
        /def\s+calcular[\s\S]*return/,
      ),
      requisito('decisao', 'escolher a operação com if', /\bif\b/),
      requisito('testes', 'usar assertEqual nos testes', /assertEqual\s*\(/),
      {
        id: 'tres',
        descricao: 'escrever três métodos test_',
        atende: (codigo) =>
          (codigo.match(/def\s+test_\w+\s*\(/g) || []).length >= 3,
      },
    ],
  },
];
