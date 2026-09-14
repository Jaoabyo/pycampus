import { toBlocks } from './parsons.js';
export { shuffledPieces, puzzleSolved } from './parsons.js';

const project = (id, title, prerequisite, story, example, output, modify, modified, create, expected, hint) => ({ id, title, prerequisite, story, example, output, modify, modified, create, expected, hint });
const authored = [
  project('cartao', 'Meu cartão de apresentação', 'variaveis', 'Mostre seu nome em um cartão feito com código.', 'nome = "Ana"\nprint(nome)', 'Ana', 'Troque Ana por Bia e execute.', 'Bia', 'Crie nome com o texto Leo e mostre o nome. Comece sem copiar.', 'Leo', 'Guarde o texto entre aspas. Depois use print com o nome da variável.'),
  project('etiqueta', 'Uma etiqueta que vira número', 'tipos', 'Uma etiqueta traz a quantidade como texto. Vamos ler esse número.', 'texto = "12"\nnumero = int(texto)\nprint(numero)', '12', 'Mude o texto para "15".', '15', 'Guarde "30" em texto, converta com int e mostre o número.', '30', 'numero = int(texto) faz a conversão. print(numero) mostra o resultado.'),
  project('compra', 'Caixa da lojinha', 'operadores', 'Primeiro calcule uma compra. Só depois acrescente um desconto.', 'quantidade = 2\npreco = 10\nsubtotal = quantidade * preco\nprint(subtotal)', '20', 'Mude quantidade para 3. Mantenha o preço.', '30', 'Com 3 produtos de 20 reais, calcule o subtotal. Retire um desconto de 10 e mostre o total.', '50', 'Faça uma conta por linha: subtotal = quantidade * preco. Depois total = subtotal - desconto.'),
  project('crachas', 'Organizador de crachás', 'strings', 'Nomes digitados podem vir com espaços e letras minúsculas.', 'nome = "  ana  "\nlimpo = nome.strip()\nprint(limpo.upper())', 'ANA', 'Troque o nome por "  bia  ".', 'BIA', 'Guarde "  leo  " em nome. Remova os espaços e mostre em maiúsculas.', 'LEO', 'Use strip para limpar e upper para deixar as letras maiúsculas.'),
  project('portaria', 'Portaria por idade', 'condicoes', 'Uma regra fictícia permite entrar a partir de 18 anos.', 'idade = 20\nif idade >= 18:\n    print("Pode entrar")\nelse:\n    print("Ainda não")', 'Pode entrar', 'Mude idade para 17 e observe o outro caminho.', 'Ainda não', 'Crie idade = 18. Use if e else para mostrar Adulto a partir de 18 e Menor abaixo disso.', 'Adulto', 'A idade 18 está incluída em >= 18. else não recebe condição.'),
  project('bilheteria', 'Ingresso e idade', 'booleanos', 'Para entrar neste evento fictício, é preciso ter idade e ingresso.', 'idade = 18\ningresso = True\nprint(idade >= 18 and ingresso)', 'True', 'Mude ingresso para False.', 'False', 'Defina idade = 16 e ingresso = True. Mostre primeiro se ela tem 18 anos ou mais E ingresso; depois, se tem 18 anos ou mais OU ingresso.', 'False\nTrue', 'Use and para exigir as duas condições.'),
  project('poupanca', 'Meu cofrinho', 'for', 'Some os depósitos de 1, 2 e 3 reais.', 'total = 0\nfor deposito in range(1, 4):\n    total = total + deposito\nprint(total)', '6', 'Inclua também o depósito de 4 reais mudando o limite do range.', '10', 'Some os depósitos de 1 a 5 reais com for. Mostre apenas o total.', '15', 'range(1, 6) inclui 1 até 5. O print final fica fora do for.'),
  project('contagem', 'Contagem do foguete', 'while', 'Mostre uma contagem antes da partida.', 'numero = 3\nwhile numero > 0:\n    print(numero)\n    numero = numero - 1', '3\n2\n1', 'Comece em 2, mantendo o restante.', '2\n1', 'Conte de 3 até 1 com while. Depois do laço, mostre Partiu!.', '3\n2\n1\nPartiu!', 'O print de Partiu! fica sem os espaços do bloco, depois da repetição.'),
  project('servico', 'Preço de um serviço', 'funcoes', 'Uma função calcula o preço a partir das horas trabalhadas.', 'def cobrar(horas):\n    return horas * 10\n\nprint(cobrar(2))', '20', 'Chame cobrar com 3 horas.', '30', 'Crie cobrar(horas), cobrando 20 por hora. Mostre o preço de 4 horas.', '80', 'return horas * 20 entrega o preço. Chame cobrar(4) dentro de print.'),
  project('cesta', 'Minha cesta de compras', 'listas', 'Some os preços guardados em uma lista.', 'precos = [10, 20]\nprecos.append(5)\nprint(sum(precos))', '35', 'Troque o preço acrescentado de 5 para 15.', '45', 'Crie precos com 10 e 20. Acrescente 30 usando append e mostre a soma.', '60', 'append altera a lista. Não faça precos = precos.append(30).'),
  project('estoquezinho', 'Estoque de um produto', 'dicionarios', 'Atualize a ficha de estoque de um livro.', 'produto = {"nome": "Livro", "estoque": 3}\nproduto["estoque"] = produto["estoque"] + 2\nprint(produto["estoque"])', '5', 'Troque a entrada de 2 unidades por 4.', '7', 'Crie o produto com estoque 12. Retire 3 unidades e mostre o estoque restante.', '9', 'Busque produto["estoque"], subtraia 3 e guarde na mesma chave.'),
  project('cadastro', 'Cadastro salvo em JSON', 'json', 'Transforme uma ficha em texto e leia a ficha de volta.', 'import json\nficha = {"nome": "Ana"}\ntexto = json.dumps(ficha)\nlida = json.loads(texto)\nprint(lida["nome"])', 'Ana', 'Troque Ana por Bia na ficha original.', 'Bia', 'Crie uma ficha com nome Leo, converta para JSON, leia de volta e mostre o nome recuperado.', 'Leo', 'dumps cria o texto JSON; loads lê esse texto. A leitura retorna o dicionário.'),
  project('boletim', 'Boletim de três provas', 'decomposicao', 'Some três notas e divida pelo total de provas para achar a média.', 'def media(a, b, c):\n    total = a + b + c\n    return total / 3\n\nprint(media(6, 8, 10))', '8.0', 'Troque as notas para 5, 7 e 9.', '7.0', 'Crie soma(a, b) que devolve a soma dos dois valores. Mostre soma(10, 15).', '25', 'Guarde total = a + b antes do return. return total entrega o resultado para quem chamou.'),
  project('chamada', 'Sem repetir na chamada', 'conjuntos', 'Uma lista de presença tem nomes repetidos. Descubra quem apareceu, sem repetição.', 'nomes = ["Ana", "Bia", "Ana"]\nunicos = set(nomes)\nprint(sorted(unicos))', "['Ana', 'Bia']", 'Troque a lista de nomes para ["Bia", "Bia", "Leo"].', "['Bia', 'Leo']", 'Crie uma lista com os números 4, 2, 4 e 1. Remova as repetições com set e mostre a lista ordenada com sorted.', '[1, 2, 4]', 'sorted(set(numeros)) remove repetições e depois ordena. Use direto dentro do print.'),
  project('promocao', 'Dobro de cada preço', 'comprehensions', 'Uma promoção dobra o preço de cada item da lista, em uma linha só.', 'precos = [10, 20, 30]\ndobrados = [preco * 2 for preco in precos]\nprint(dobrados)', '[20, 40, 60]', 'Troque a lista de preços para [5, 15].', '[10, 30]', 'Crie uma compreensão de lista com os quadrados de 1, 2 e 3 (n * n) e mostre a lista.', '[1, 4, 9]', 'Escreva [n * n for n in [1, 2, 3]]. O for percorre a lista; a expressão à esquerda transforma cada valor.'),
  project('ranking', 'Ranking de vendas', 'ordenacao', 'Ordene as vendas do maior para o menor para descobrir o destaque do mês.', 'vendas = [120, 80, 200]\nordenadas = sorted(vendas, reverse=True)\nprint(ordenadas)', '[200, 120, 80]', 'Troque as vendas para [50, 300, 100].', '[300, 100, 50]', 'Ordene a lista [7, 2, 9, 4] do menor para o maior, sem reverse, e mostre a lista.', '[2, 4, 7, 9]', 'sorted(lista) já devolve do menor para o maior. reverse=True inverteria essa ordem.'),
  project('contador', 'Quantas vezes apareceu?', 'complexidade', 'Percorra uma lista de respostas e conte quantas vezes um valor aparece.', 'respostas = ["a", "b", "a", "a"]\ncontagem = 0\nfor resposta in respostas:\n    if resposta == "a":\n        contagem = contagem + 1\nprint(contagem)', '3', 'Troque a condição para contar "b" em vez de "a".', '1', 'Crie numeros = [2, 5, 2, 2, 9, 2]. Conte quantas vezes 2 aparece, sem usar count, e mostre o total.', '4', 'Comece com contagem = 0 antes do for. Some 1 a contagem sempre que o item for igual a 2.'),
  project('estudante', 'Meu primeiro objeto', 'classes', 'Crie uma classe simples e veja um método em ação.', 'class Saudacao:\n    def falar(self):\n        return "Olá!"\n\nprint(Saudacao().falar())', 'Olá!', 'Troque o texto retornado por "Oi, tudo bem?".', 'Oi, tudo bem?', 'Crie a classe Loja com um método abrir que retorna "Loja aberta!". Instancie e mostre o retorno de abrir.', 'Loja aberta!', 'def abrir(self): return "Loja aberta!" fica dentro da classe, com self como parâmetro. Chame Loja().abrir() dentro do print.'),
  project('perfil', 'Guardando dados no objeto', 'construtor', 'Use o construtor para que cada objeto nasça com seu próprio nome.', 'class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\nprint(Pessoa("Ana").nome)', 'Ana', 'Troque "Ana" por "Leo" ao criar a pessoa.', 'Leo', 'Crie a classe Livro com um construtor que guarda titulo. Mostre o titulo de Livro("Duna").', 'Duna', 'def __init__(self, titulo): self.titulo = titulo guarda o valor recebido. Livro("Duna").titulo acessa esse atributo.'),
  project('cofre', 'Depósito com regra', 'encapsulamento', 'Um cofre só aceita valores positivos. Guarde dois depósitos e confira o total.', 'class Cofre:\n    def __init__(self):\n        self._total = 0\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self._total = self._total + valor\n    @property\n    def total(self):\n        return self._total\n\ncofre = Cofre()\ncofre.guardar(20)\nprint(cofre.total)', '20', 'Depois de cofre.guardar(20), chame também cofre.guardar(15) antes do print.', '35', 'Crie um Cofre (pode reaproveitar a classe do exemplo). Guarde 50 e depois 30 e mostre o total.', '80', 'Chame guardar duas vezes antes do print. @property permite escrever cofre.total sem parênteses.'),
  project('animais', 'Cada bicho com seu som', 'heranca', 'Uma classe filha reaproveita a classe mãe e muda só o que precisa.', 'class Animal:\n    def som(self):\n        return "..."\n\nclass Gato(Animal):\n    def som(self):\n        return "Miau"\n\nprint(Gato().som())', 'Miau', 'Troque "Miau" por "Au au" no método som de Gato.', 'Au au', 'Crie Passaro herdando de Animal e sobrescreva som para retornar "Piu". Mostre a chamada.', 'Piu', 'class Passaro(Animal): repete o método som com um novo retorno. Herança reaproveita o que não muda.'),
  project('ficha', 'Ficha sem repetir código', 'dataclasses', 'Uma dataclass cria o construtor para você, a partir dos campos anotados.', 'from dataclasses import dataclass\n\n@dataclass\nclass Item:\n    nome: str\n    preco: float\n\nprint(Item("Livro", 30).nome)', 'Livro', 'Troque "Livro" por "Caderno" ao criar o item.', 'Caderno', 'Crie uma dataclass Aluno com nome e nota. Mostre a nota de Aluno("Bia", 9.5).', '9.5', '@dataclass antes da classe evita escrever __init__ à mão. nota: float declara o campo com o tipo esperado.'),
  project('excecao', 'Erro tratado com cuidado', 'excecoes', 'Capture um erro esperado e mostre uma mensagem clara, sem derrubar o programa.', 'try:\n    numero = int("abc")\n    print(f"Convertido: {numero}")\nexcept ValueError:\n    print("Digite um número inteiro")', 'Digite um número inteiro', 'Troque "abc" por "10".', 'Convertido: 10', 'Tente converter "dez" em número com int(). Capture ValueError e mostre "Não é um número".', 'Não é um número', 'int("dez") gera ValueError porque o texto não representa um número inteiro. Coloque a conversão dentro do try.'),
  project('lembrete', 'Salvando um lembrete', 'arquivos', 'Escreva um lembrete em um arquivo e leia o que foi salvo.', 'with open("nota.txt", "w", encoding="utf-8") as arquivo:\n    arquivo.write("Estudar Python")\nwith open("nota.txt", encoding="utf-8") as arquivo:\n    print(arquivo.read())', 'Estudar Python', 'Troque o texto escrito para "Revisar listas".', 'Revisar listas', 'Escreva "Praticar todo dia" em um arquivo chamado meta.txt, depois leia e mostre o conteúdo.', 'Praticar todo dia', 'Abra o arquivo com "w" para escrever e depois abra de novo, sem "w", para ler com .read().')
];

// Etapa "Investigar" do método PRIMM: uma pergunta sobre o mecanismo do código e uma linha para explicar sem consultar.
// A alternativa correta é sempre escrita primeiro e depois rotacionada, para não ficar sempre na mesma posição.
const ask = (question, options, line, why) => ({ question, options, line, why });
const investigations = {
  cartao: ask('Por que print(nome) mostra Ana, e não a palavra nome?', ['Porque nome sem aspas é o nome da variável, e Python usa o valor guardado nela', 'Porque print sempre remove as aspas de qualquer texto', 'Porque a variável precisa estar em maiúsculas para aparecer'], 'nome = "Ana"', 'Com aspas você escreve um texto literal; sem aspas, você usa o nome de uma variável e Python busca o valor dela.'),
  etiqueta: ask('Se os dois mostram 12, o que muda entre texto e numero?', ['O tipo: texto é str e numero é int, então só numero serve para contas', 'Nada muda; int() só deixa o código mais organizado', 'texto fica em maiúsculas e numero em minúsculas'], 'numero = int(texto)', 'O valor na tela parece igual, mas "12" + 1 daria erro e 12 + 1 daria 13. O tipo decide quais operações fazem sentido.'),
  compra: ask('O que aconteceria se a linha do subtotal viesse antes de preco = 10?', ['NameError: Python lê de cima para baixo e preco ainda não existiria', 'Nada: Python procura a variável nas linhas seguintes', 'O subtotal seria zero'], 'subtotal = quantidade * preco', 'A ordem das linhas é a ordem da execução. Uma variável só existe depois da linha que a cria.'),
  crachas: ask('Depois de limpo = nome.strip(), o que continua guardado em nome?', ['Continua "  ana  ": strip() devolve um texto novo e não altera o original', 'Passa a ser "ana", porque strip() muda a variável', 'Fica vazio, porque o texto foi movido'], 'print(limpo.upper())', 'Strings são imutáveis: métodos como strip() e upper() devolvem um novo texto em vez de alterar o que já existe.'),
  portaria: ask('Com idade = 20, por que o print do else não executa?', ['Porque a condição do if foi verdadeira, e o else só roda quando ela é falsa', 'Porque else só funciona quando existe um elif no meio', 'Porque os dois executam, mas só o primeiro aparece na tela'], 'if idade >= 18:', 'if e else são caminhos alternativos: exatamente um dos dois executa.'),
  bilheteria: ask('O que idade >= 18 produz antes de o and ser avaliado?', ['Um booleano: True, porque 18 é igual ao limite', 'O número 18', 'O texto "True"'], 'print(idade >= 18 and ingresso)', 'Uma comparação sempre resulta em True ou False. O and combina dois booleanos.'),
  poupanca: ask('Quais valores total assume, na ordem, durante as três repetições?', ['1, depois 3, depois 6', '0, depois 1, depois 2', '6 nas três vezes'], 'total = total + deposito', 'O acumulador guarda o resultado parcial: cada repetição soma o valor atual ao que já estava guardado.'),
  contagem: ask('O que aconteceria se a linha numero = numero - 1 fosse apagada?', ['O laço repetiria para sempre, porque a condição nunca ficaria falsa', 'O programa mostraria apenas 3 e terminaria', 'Python faria a subtração automaticamente'], 'while numero > 0:', 'Todo while precisa de algo que caminhe para encerrar a condição; sem isso o laço é infinito.'),
  servico: ask('Quem recebe o valor devolvido pelo return?', ['A chamada cobrar(2), que fica no lugar do resultado dentro do print', 'A própria função, que guarda o valor para a próxima chamada', 'O parâmetro horas'], 'return horas * 10', 'return entrega o valor para quem chamou a função. Sem print, nada aparece na tela — o valor só é devolvido.'),
  cesta: ask('Por que não se escreve precos = precos.append(5)?', ['Porque append altera a lista e devolve None: a atribuição apagaria a lista', 'Porque append só funciona com textos', 'Porque precos viraria um número'], 'precos.append(5)', 'Alguns métodos alteram o objeto no lugar e devolvem None. Chame append sozinho, sem atribuir.'),
  estoquezinho: ask('O que "estoque" entre colchetes representa?', ['A chave que localiza o valor dentro do dicionário', 'A posição 1, como em uma lista', 'O tipo do valor guardado'], 'produto["estoque"] = produto["estoque"] + 2', 'Dicionário se acessa por chave, não por posição. A mesma chave serve para ler e para atualizar.'),
  cadastro: ask('Qual é a diferença entre ficha e texto depois do dumps?', ['ficha é um dicionário Python; texto é uma string no formato JSON', 'São idênticos: dumps apenas copia o dicionário', 'texto é um arquivo salvo no computador'], 'lida = json.loads(texto)', 'dumps serializa (objeto → texto) e loads desserializa (texto → objeto). JSON é um formato de texto para trocar dados.'),
  boletim: ask('Na chamada media(6, 8, 10), qual parâmetro recebe o 8?', ['b, porque os argumentos entram na ordem dos parâmetros declarados', 'a, porque é sempre o primeiro a receber', 'c, porque 8 é o valor do meio'], 'return total / 3', 'Argumentos posicionais são associados na ordem: o primeiro vai para o primeiro parâmetro, e assim por diante.'),
  chamada: ask('Por que sorted() é usado antes de mostrar o conjunto?', ['Porque a ordem de um set não é previsível, e sorted devolve uma lista em ordem', 'Porque um set não pode ser impresso', 'Porque é o sorted que remove as repetições'], 'unicos = set(nomes)', 'set garante valores únicos, não ordem. Quem elimina duplicatas é o set; quem dá ordem previsível é o sorted.'),
  promocao: ask('Em que ordem essa linha é executada?', ['Primeiro o for percorre precos; para cada valor, preco * 2 é calculado e guardado na nova lista', 'Primeiro preco * 2 roda uma vez, depois o for copia o resultado', 'A multiplicação e o for acontecem em listas separadas'], 'dobrados = [preco * 2 for preco in precos]', 'Leia a compreensão começando pelo for: ele fornece cada valor, e a expressão da esquerda transforma esse valor.'),
  ranking: ask('Depois dessa linha, como fica a lista vendas?', ['Continua [120, 80, 200]: sorted devolve uma lista nova e não altera a original', 'Fica [200, 120, 80], porque sorted ordena no lugar', 'Fica vazia, porque os valores foram movidos'], 'ordenadas = sorted(vendas, reverse=True)', 'sorted() devolve uma lista nova; quem altera a própria lista é o método lista.sort(), que retorna None.'),
  contador: ask('Por que o print fica fora do for?', ['Para mostrar o total uma vez, no fim; dentro do laço apareceria um número por repetição', 'Porque print não funciona dentro de laços', 'Porque o for precisa terminar com print para não dar erro'], 'if resposta == "a":', 'A indentação define o que pertence ao laço. Fora do bloco, a linha roda uma vez, depois de todas as repetições.'),
  estudante: ask('O que os parênteses em Saudacao() fazem?', ['Criam um objeto (instância) da classe, que então pode chamar falar()', 'Chamam o método falar diretamente', 'Apagam a classe da memória'], 'def falar(self):', 'A classe é a planta; a instância é o objeto construído a partir dela. self é a própria instância recebida pelo método.'),
  perfil: ask('Quando o __init__ é executado?', ['No momento em que o objeto é criado, com Pessoa("Ana")', 'Somente quando alguém lê .nome', 'Uma única vez, ao definir a classe'], 'self.nome = nome', '__init__ é chamado na criação do objeto e guarda os dados próprios daquela instância em self.'),
  cofre: ask('Para que serve o return False quando o valor é zero ou negativo?', ['Encerra o método antes de somar, protegendo o total de um valor inválido', 'Mostra uma mensagem de erro na tela', 'Zera o total já guardado'], 'self._total = self._total + valor', 'Encapsular é concentrar a regra em um único lugar: quem usa a classe não consegue somar um valor inválido por fora.'),
  animais: ask('Por que Gato() mostra Miau e não os três pontos de Animal?', ['Porque Gato define seu próprio som, que sobrescreve o método herdado', 'Porque Animal não tem o método som', 'Porque o último método definido no arquivo sempre vence'], 'class Gato(Animal):', 'A subclasse herda tudo e pode sobrescrever o que precisa mudar. Python procura o método primeiro na classe do objeto.'),
  ficha: ask('O que o @dataclass economiza de código aqui?', ['O __init__: os campos anotados já criam o construtor que recebe nome e preco', 'A necessidade de importar módulos', 'A escolha dos tipos de cada campo'], 'preco: float', '@dataclass gera __init__ e __repr__ a partir dos campos. As anotações documentam o tipo, mas não validam o valor.'),
  excecao: ask('Por que o print dentro do try não executa?', ['Porque int("abc") falha antes dele, e a execução salta direto para o except', 'Porque prints dentro de try são ignorados', 'Porque o except roda sempre, antes do try'], 'except ValueError:', 'Quando uma exceção acontece, o resto do bloco try é abandonado e Python procura um except compatível.'),
  lembrete: ask('Para que serve o with ao abrir o arquivo?', ['Garante que o arquivo seja fechado ao fim do bloco, mesmo se algo falhar', 'Abre o arquivo duas vezes, uma para cada modo', 'Impede que o arquivo seja lido depois'], 'arquivo.write("Estudar Python")', 'with cuida de fechar o arquivo automaticamente. Sem ele, é preciso chamar close() e o arquivo pode ficar aberto se houver erro.')
};
// Solução de referência da etapa "Crie você". Serve para montar o quebra-cabeça de blocos embaralhados
// (problema de Parsons), usado como apoio quando escrever do zero ainda é difícil.
const solutions = {
  cartao: 'nome = "Leo"\nprint(nome)',
  etiqueta: 'texto = "30"\nnumero = int(texto)\nprint(numero)',
  compra: 'quantidade = 3\npreco = 20\ndesconto = 10\nsubtotal = quantidade * preco\ntotal = subtotal - desconto\nprint(total)',
  crachas: 'nome = "  leo  "\nlimpo = nome.strip()\nprint(limpo.upper())',
  portaria: 'idade = 18\nif idade >= 18:\n    print("Adulto")\nelse:\n    print("Menor")',
  bilheteria: 'idade = 16\ningresso = True\nprint(idade >= 18 and ingresso)\nprint(idade >= 18 or ingresso)',
  poupanca: 'total = 0\nfor deposito in range(1, 6):\n    total = total + deposito\nprint(total)',
  contagem: 'numero = 3\nwhile numero > 0:\n    print(numero)\n    numero = numero - 1\nprint("Partiu!")',
  servico: 'def cobrar(horas):\n    return horas * 20\n\nprint(cobrar(4))',
  cesta: 'precos = [10, 20]\nprecos.append(30)\nprint(sum(precos))',
  estoquezinho: 'produto = {"nome": "Livro", "estoque": 12}\nproduto["estoque"] = produto["estoque"] - 3\nprint(produto["estoque"])',
  cadastro: 'import json\nficha = {"nome": "Leo"}\ntexto = json.dumps(ficha)\nlida = json.loads(texto)\nprint(lida["nome"])',
  boletim: 'def soma(a, b):\n    total = a + b\n    return total\n\nprint(soma(10, 15))',
  chamada: 'numeros = [4, 2, 4, 1]\nunicos = set(numeros)\nprint(sorted(unicos))',
  promocao: 'quadrados = [n * n for n in [1, 2, 3]]\nprint(quadrados)',
  ranking: 'numeros = [7, 2, 9, 4]\nprint(sorted(numeros))',
  contador: 'numeros = [2, 5, 2, 2, 9, 2]\ncontagem = 0\nfor numero in numeros:\n    if numero == 2:\n        contagem = contagem + 1\nprint(contagem)',
  estudante: 'class Loja:\n    def abrir(self):\n        return "Loja aberta!"\n\nprint(Loja().abrir())',
  perfil: 'class Livro:\n    def __init__(self, titulo):\n        self.titulo = titulo\n\nprint(Livro("Duna").titulo)',
  cofre: 'class Cofre:\n    def __init__(self):\n        self._total = 0\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self._total = self._total + valor\n    @property\n    def total(self):\n        return self._total\n\ncofre = Cofre()\ncofre.guardar(50)\ncofre.guardar(30)\nprint(cofre.total)',
  animais: 'class Animal:\n    def som(self):\n        return "..."\n\nclass Passaro(Animal):\n    def som(self):\n        return "Piu"\n\nprint(Passaro().som())',
  ficha: 'from dataclasses import dataclass\n\n@dataclass\nclass Aluno:\n    nome: str\n    nota: float\n\nprint(Aluno("Bia", 9.5).nota)',
  excecao: 'try:\n    numero = int("dez")\nexcept ValueError:\n    print("Não é um número")',
  lembrete: 'with open("meta.txt", "w", encoding="utf-8") as arquivo:\n    arquivo.write("Praticar todo dia")\nwith open("meta.txt", encoding="utf-8") as arquivo:\n    print(arquivo.read())'
};
// Contexto já pronto acima do quebra-cabeça, quando montar tudo seria longo demais.
const semPrefixo = (solucao, prefixo) => {
  const codigo = String(solucao || '');
  if (!prefixo) return codigo;
  return codigo.startsWith(prefixo) ? codigo.slice(prefixo.length).replace(new RegExp("^[\\n]+"), "") : codigo;
};
const prefixes = { cofre: 'class Cofre:\n    def __init__(self):\n        self._total = 0\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self._total = self._total + valor\n    @property\n    def total(self):\n        return self._total' };
// Linha plausível e errada, para o estudante ter de rejeitar um engano comum em vez de só ordenar o certo.
const distractors = {
  cartao: 'print("nome")', etiqueta: 'numero = str(texto)', compra: 'total = subtotal + desconto', crachas: 'nome.strip()',
  portaria: 'else idade < 18:', bilheteria: 'print(ingresso and idade)', poupanca: 'total = deposito', contagem: 'numero = numero + 1',
  servico: 'print(horas * 20)', cesta: 'precos = precos.append(30)', estoquezinho: 'produto["estoque"] - 3', cadastro: 'lida = json.dumps(texto)',
  boletim: 'print(total)', chamada: 'unicos = sorted(numeros)', promocao: 'quadrados = [n * n in [1, 2, 3]]', ranking: 'numeros.sort(reverse=True)',
  contador: 'contagem = contagem + numero', estudante: 'print(Loja.abrir())', perfil: 'titulo = titulo', cofre: 'cofre.total = 80',
  animais: 'class Passaro:', ficha: 'nota = float', excecao: 'except ValueError', lembrete: 'print(arquivo)'
};

// Cada miniprojeto tem seu próprio ícone, como as etapas e os projetos da formação.
const icons = {
  cartao: 'UserRound', etiqueta: 'Package', compra: 'Calculator', crachas: 'Award', portaria: 'ShieldCheck', bilheteria: 'Target',
  poupanca: 'Wallet', contagem: 'Rocket', servico: 'Clock3', cesta: 'ListTodo', estoquezinho: 'Database', cadastro: 'FolderCode',
  boletim: 'GraduationCap', chamada: 'Layers', promocao: 'Zap', ranking: 'Trophy', contador: 'Brain', estudante: 'Sprout',
  perfil: 'BookOpen', cofre: 'LockKeyhole', animais: 'Workflow', ficha: 'Gem', excecao: 'Lightbulb', lembrete: 'BookOpenCheck'
};
export const practiceProjects = authored.map((p, index) => {
  const found = investigations[p.id];
  const offset = index % found.options.length;
  return {
    ...p,
    icon: icons[p.id],
    solution: solutions[p.id],
    puzzle: { blocks: toBlocks(semPrefixo(solutions[p.id], prefixes[p.id])), prefix: prefixes[p.id] || '', distractor: distractors[p.id] || '' },
    investigate: { ...found, options: [...found.options.slice(offset), ...found.options.slice(0, offset)], answer: (found.options.length - offset) % found.options.length }
  };
});

// Um miniprojeto vale XP quando o estudante explicou o mecanismo (investigação correta),
// adaptou o exemplo e criou a própria versão com a saída esperada.
export const practiceXp = 40;
export const practiceDone = (item, project) => Boolean(item) && item.answered === project?.investigate?.answer && ['modify', 'create'].every(stage => item.passed?.includes(stage));
export const practiceSteps = (item, project) => [
  { id: 'investigate', label: 'Prova rápida respondida corretamente', done: item?.answered === project?.investigate?.answer },
  { id: 'modify', label: 'Etapa "Mude uma parte" com a saída esperada', done: Boolean(item?.passed?.includes('modify')) },
  { id: 'create', label: 'Etapa "Crie você" com a saída esperada', done: Boolean(item?.passed?.includes('create')) }
];

export function normalizeLearning(value = {}) {
  if (!value || typeof value !== 'object') return {};
  const result = {};
  for (const p of practiceProjects) {
    const item = value[p.id];
    if (!item || typeof item !== 'object') continue;
    const rating = ['help', 'solo'].includes(item.rating) ? item.rating : '';
    result[p.id] = {
      codes: Object.fromEntries(['modify', 'create'].filter(k => typeof item.codes?.[k] === 'string').map(k => [k, item.codes[k].slice(0, 15000)])),
      prediction: typeof item.prediction === 'string' ? item.prediction.slice(0, 1000) : '',
      notes: typeof item.notes === 'string' ? item.notes.slice(0, 1500) : '',
      reflection: typeof item.reflection === 'string' ? item.reflection.slice(0, 1500) : '',
      answered: Number.isInteger(item.answered) && item.answered >= 0 && item.answered < 3 ? item.answered : null,
      puzzled: item.puzzled === true,
      rating,
      // Records saved before graduating intervals existed have no streak; a past solo counts as the first one.
      streak: Number.isInteger(item.streak) && item.streak >= 0 ? Math.min(item.streak, 99) : (rating === 'solo' ? 1 : 0),
      reviewed: typeof item.reviewed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.reviewed) && !Number.isNaN(Date.parse(item.reviewed)) ? item.reviewed : '',
      passed: ['modify', 'create'].filter(k => item.passed?.includes(k))
    };
  }
  return result;
}

// Graduating intervals: each independent solve pushes the next review further away.
export const soloIntervals = [3, 7, 16, 35];
export function reviewInterval(item, rating) {
  if (rating !== 'solo') return 1;
  return soloIntervals[Math.min((item?.streak || 0), soloIntervals.length - 1)];
}
export function nextReview(item) {
  if (!item?.reviewed) return '';
  const days = item.rating === 'solo' ? soloIntervals[Math.min(Math.max(item.streak || 1, 1), soloIntervals.length) - 1] : 1;
  const date = new Date(`${item.reviewed}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// A etapa 1 pede uma previsão escrita à mão e depois roda o exemplo. Antes, a plataforma
// comparava a saída do exemplo com ela mesma — sempre batia, e a comemoração não dizia nada
// sobre o estudante. Aqui a comparação é com o que ele realmente escreveu.
const normalize = text => (typeof text === 'string' ? text : '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/["'`.,!?;:]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export function predictionMatches(prediction, output) {
  const written = normalize(prediction);
  if (!written) return false;
  const lines = String(output ?? '').split('\n').map(normalize).filter(Boolean);
  if (!lines.length) return false;
  // Vale escrever só a saída, ou escrevê-la dentro de uma frase ("acho que mostra X").
  return lines.every(line => written.includes(line));
}
