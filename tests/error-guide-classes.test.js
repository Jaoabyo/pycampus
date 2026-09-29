import test from 'node:test';
import assert from 'node:assert/strict';
import { carregarDiagnosticos, readError } from '../src/error-guide.js';

// No site, esta parte chega sob demanda depois do primeiro erro.
await carregarDiagnosticos();

// As mensagens são as que o estudante recebeu de verdade, tiradas do histórico dele.
const pessoa = 'class Pessoa:\n    def __init__(self, nome, idade):\n        self.nome = nome\n        self.idade = idade\n\n    def cumprimentar(self):\n        return f"Ola, meu nome e {self.nome}."\n\n    def aniversario(self):\n        self.idade += 1\n\npessoa1 = Pessoa("Joao", 30)\n';
const registroSemSelf = 'visitas = ["Ana", "Bia", "Ana", "Caio"]\n\nclass Registro:\n    def __init__(self, visitas):\n        self.visitas = visitas\n\n    def pessoas_unicas():\n        return len(set(self.visitas))\n\nregistro = Registro(visitas)\n';
const saida = (msg, linha = 12) => `Traceback (most recent call last):\n  File "seu_codigo.py", line ${linha}, in <module>\n${msg}`;
const ajuda = (msg, codigo, linha) => readError(saida(msg, linha), codigo);

test('método sem self: diz o nome do método e como escrever', () => {
  const r = ajuda('TypeError: Registro.pessoas_unicas() takes 0 positional arguments but 1 was given', registroSemSelf);
  assert.match(r.title, /pessoas_unicas está sem o self/);
  assert.equal(r.steps[0], 'Escreva def pessoas_unicas(self):');
});

test('método chamado pela classe: aponta o objeto que já existe', () => {
  const r = ajuda("TypeError: Registro.pessoas_unicas() missing 1 required positional argument: 'self'", registroSemSelf.replace('def pessoas_unicas():', 'def pessoas_unicas(self):'));
  assert.match(r.title, /chamado pela classe/);
  assert.match(r.steps[0], /registro\.pessoas_unicas\(\)/);
});

test('método chamado na lista: explica que é do objeto, em português', () => {
  const codigo = registroSemSelf.replace('def pessoas_unicas():', 'def pessoas_unicas(self):');
  const r = ajuda("AttributeError: 'list' object has no attribute 'pessoas_unicas'", codigo);
  assert.match(r.title, /pessoas_unicas é do objeto Registro, não de um\(a\) lista/);
  assert.match(r.steps[0], /registro\.pessoas_unicas\(\)/);
});

test('classe usada depois de um ponto: cria o objeto sem ponto', () => {
  const r = ajuda("AttributeError: 'list' object has no attribute 'Registro'", registroSemSelf);
  assert.match(r.title, /Registro é uma classe/);
});

test('Pessoa no lugar de pessoa1: separa classe de objeto', () => {
  const r = ajuda("NameError: name 'pessoa' is not defined. Did you mean: 'Pessoa'?", pessoa);
  assert.match(r.title, /Pessoa é a classe/);
  assert.match(r.steps[0], /pessoa1/);
});

test('método que a classe não tem: lista o que ela tem', () => {
  const r = ajuda("AttributeError: 'Pessoa' object has no attribute 'status'", pessoa);
  assert.match(r.title, /A classe Pessoa não tem status/);
  assert.match(r.meaning, /cumprimentar e aniversario/);
});

test('grafia trocada: mostra o nome certo', () => {
  const r = ajuda("AttributeError: 'Pessoa' object has no attribute 'comprimentar'. Did you mean: 'cumprimentar'?", pessoa);
  assert.match(r.title, /é cumprimentar/);
});

test('atributo pedido na classe: só fala do objeto quando o atributo existe', () => {
  assert.match(ajuda("AttributeError: type object 'Pessoa' has no attribute 'nome'", pessoa).title, /Pessoa é o molde; nome fica no objeto/);
  assert.match(ajuda("AttributeError: type object 'Pessoa' has no attribute 'status'", pessoa).title, /A classe Pessoa não tem status/);
});

test('método chamado como função solta e valores a mais na chamada', () => {
  assert.match(ajuda("NameError: name 'cumprimentar' is not defined", pessoa).steps[0], /pessoa1\.cumprimentar\(\)/);
  const r = ajuda('TypeError: Pessoa.aniversario() takes 1 positional argument but 2 were given', pessoa);
  assert.match(r.meaning, /aniversario não recebe nenhum valor/);
});

test('nome usado antes de ser criado, e maiúscula trocada', () => {
  const codigo = 'class Livro:\n    def __init__(self, titulo):\n        self.titulo = titulo\n\nprint(len(livros))\n\nlivros = []\n';
  assert.match(ajuda("NameError: name 'livros' is not defined", codigo, 5).title, /livros foi usado antes de ser criado/);
  assert.match(ajuda("NameError: name 'Livros' is not defined", 'livros = []\nprint(Livros)\n', 2).title, /Livros e livros são nomes diferentes/);
});

test('self fora da classe e sugestão do próprio Python', () => {
  assert.match(ajuda("NameError: name 'self' is not defined", pessoa).title, /self só existe dentro de um método/);
  assert.match(ajuda("AttributeError: module 'math' has no attribute 'sqr'. Did you mean: 'sqrt'?", 'import math\nprint(math.sqr(4))\n', 2).title, /O nome certo é sqrt/);
});

test('um erro que não é de classe continua com a ajuda do tipo', () => {
  assert.equal(ajuda('ZeroDivisionError: division by zero', 'print(1 / 0)\n', 1).title, 'Divisão por zero');
});

// Recuo: os casos são os do quiz do estudante (23 dos 54 erros dele eram de recuo).
test('recuo a mais: aponta a linha e o recuo da linha de cima', () => {
  const codigo = 'pontos = 0\n    print(pontos)\n';
  const r = ajuda('IndentationError: unexpected indent', codigo, 2);
  assert.match(r.title, /A linha 2 tem espaços a mais/);
  assert.match(r.steps[0], /com 0 espaços/);
});

test('recuo que não volta para um bloco aberto: diz quais blocos estão abertos', () => {
  const codigo = 'jogar = "s"\nwhile jogar == "s":\n        pontos = 0\n        jogar = input("De novo? ")\n    print("fim de jogo")\n';
  const r = ajuda('IndentationError: unindent does not match any outer indentation level', codigo, 5);
  assert.match(r.title, /A linha 5 tem 4 espaços e não se alinha com nenhum bloco aberto/);
  assert.match(r.meaning, /blocos abertos usam 0 e 8 espaços/);
});

// A mensagem de verdade do backup de 28/09: o pandas termina o traceback só com KeyError: 'preco'.
test('coluna que não existe no DataFrame: diz quais colunas a tabela tem', () => {
  const codigo = 'import pandas as pd\nvendas = pd.DataFrame({"nome": ["A", "B", "C"], "receita": [120, 80, 150]})\n# Filtre com teste booleano e mostre a lista de nomes\n\nacima_de_100 = vendas[vendas["preco"] > 100]\nprint(acima_de_100)\n';
  const saidaDoPandas = '  File "pandas/_libs/hashtable_class_helper.pxi", line 7089, in pandas._libs.hashtable.PyObjectHashTable.get_item\nKeyError: \'preco\'\n\nThe above exception was the direct cause of the following exception:\n\nTraceback (most recent call last):\n  File "seu_codigo.py", line 5, in <module>\nKeyError: \'preco\'';
  const r = readError(saidaDoPandas, codigo);
  assert.equal(r.line, 5);
  assert.match(r.title, /A coluna preco não existe em vendas/);
  assert.match(r.meaning, /as colunas nome e receita/);
  assert.match(r.steps[0], /"nome" e "receita"/);
  // Grafia quase igual vira sugestão direta, e colunas criadas depois também contam.
  const depois = 'import pandas as pd\ndados = {"nome": ["A"], "quantidade": [2], "receita": [10]}\nvendas = pd.DataFrame(dados)\nvendas["preco"] = vendas["receita"] / vendas["quantidade"]\nprint(vendas["prco"])\n';
  assert.equal(ajuda("KeyError: 'prco'", depois, 5).steps[0], 'Troque "prco" por "preco".');
  // Um dicionário comum continua com a ajuda geral de chave.
  assert.equal(ajuda("KeyError: 'b'", 'd = {"a": 1}\nprint(d["b"])\n', 2).title, 'Essa chave não existe no dicionário');
});

// O erro de verdade da entrega da U1 em 29/09: a função já devolvia None, mas o código de fora
// separava o resultado sem conferir.
test('separar o None de uma função: pede para conferir antes de separar, com os nomes do código', () => {
  const codigo = 'notas = []\n\ndef calcular_media(notas):\n    if not notas:\n       return None\n    total = 0\n    for nota in notas:\n        total += nota\n    media = total / len(notas)\n    situacao = "Aprovado" if media >= 7 else "Reprovado"\n    return media, situacao, notas\nmedia, situacao, notas = calcular_media(notas)\n\nprint("Notas:",notas)\n';
  const r = ajuda('TypeError: cannot unpack non-iterable NoneType object', codigo, 12);
  assert.match(r.title, /calcular_media devolveu None/);
  assert.match(r.meaning, /media, situacao e notas/);
  assert.equal(r.steps[0], 'Guarde o resultado inteiro primeiro: resultado = calcular_media(notas)');
  assert.match(r.steps[1], /if resultado is None/);
});

// "Perhaps you forgot a comma?" com os códigos de verdade do histórico: 16 execuções seguidas na
// aula de gráficos, 4 na de web e uma no trabalho da biblioteca.
test('vírgula esquecida: aponta entre quais dois pedaços ela falta', () => {
  const msg = 'SyntaxError: invalid syntax. Perhaps you forgot a comma?';
  const grafico = 'import matplotlib.pyplot as plt\nmesses = ["Jan", "Fev"]\nvendas = [120, 90]\nplt.bar(messes, vendas)\nplt.title("Vendas")\nprint("Barras:"  len(plt.gca().patches))\n';
  const r = ajuda(msg, grafico, 6);
  assert.equal(r.title, 'Falta uma vírgula na linha 6, entre "Barras:" e len');
  assert.equal(r.steps[0], 'Coloque uma vírgula logo depois de "Barras:", antes de len.');
  assert.match(ajuda(msg, 'achado = None\nprint("Busca 2 :" achado.titulo if achado else "Não encontrado")\n', 2).title, /entre "Busca 2 :" e achado/);
  // Um item por linha num dicionário: a vírgula falta no fim da linha que o Python aponta.
  const web = 'camadas = {\n"front-end": ["HTML"]\n"back-end": ["Flask"]\n}\nprint(camadas)\n';
  const d = ajuda(msg, web, 2);
  assert.equal(d.title, 'Falta uma vírgula no fim da linha 2');
  assert.match(d.steps[0], /depois de \]/);
});

test('duas chaves num colchete só: explica que vira uma dupla', () => {
  const codigo = 'camadas = {\n"front-end": ["HTML"],\n"back-end": ["Flask"]\n}\nprint(camadas["front-end", "back-end"])\n';
  const r = ajuda("KeyError: ('front-end', 'back-end')", codigo, 5);
  assert.equal(r.title, 'Um colchete com vírgula procura uma chave só');
  assert.match(r.meaning, /^camadas\['front-end', 'back-end'\] não pega as duas chaves/);
});
