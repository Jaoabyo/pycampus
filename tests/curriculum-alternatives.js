// Um segundo jeito de resolver cada desafio que tem requisito automático.
//
// O estudante levantou a objeção certa: "o aluno pode mudar os nomes das variáveis, o código, e
// dar no mesmo resultado — você não valida nada disso?". Uma conferência que só aceitasse a
// solução guardada reprovaria um acerto, que é o pior erro que esta plataforma pode cometer.
//
// Então cada aula abaixo tem uma solução deliberadamente diferente da de referência: outros
// nomes de variáveis e, onde cabe, outro caminho (`+ [40]` no lugar de `append`, `sort` no lugar
// de `sorted`, `update` no lugar de atribuição por chave, `**` no lugar de `*`). Duas exigências,
// as duas verificadas:
//
//   1. rodando no Pyodide de verdade, produzem a saída esperada da aula;
//   2. `requisitosFaltando()` não reclama de nenhuma.
//
// Se algum requisito recusar um destes caminhos, ele está exigindo formato e precisa sair.
const alternativas = {
  tipos: 'valor_texto = "21"\nconvertido = int(valor_texto)\nprint(convertido)\nprint(type(convertido))',
  operadores: 'itens = 3\nunitario = 20\nabatimento = 5\nprint(itens * unitario - abatimento)',
  strings: 'bruto = "  python  "\nprint(bruto.strip().upper())',
  entrada: 'resposta = input()\nidade_atual = int(resposta)\nprint(idade_atual + 1)',
  for: 'acumulado = 0\nfor valor in range(1, 6):\n    acumulado += valor\nprint(acumulado)',
  while: 'contador = 1\nwhile contador < 4:\n    print(contador)\n    contador += 1',
  funcoes: 'def quadrado(numero):\n    return numero ** 2\n\nprint(quadrado(7))',
  decomposicao: 'def media(a, b, c):\n    valores = [a, b, c]\n    return sum(valores) / len(valores)\n\nprint(media(7, 8, 9))',
  listas: 'numeros = [10, 20, 30]\nnumeros = numeros + [40]\nprint(sum(numeros))',
  dicionarios: 'produto = {"nome": "Livro", "estoque": 10}\nproduto.update({"estoque": produto["estoque"] + 5})\nprint(produto["estoque"])',
  conjuntos: 'numeros = [3, 1, 3, 2, 1]\nunicos = sorted(set(numeros))\nprint(unicos)',
  comprehensions: 'quadrados = [valor ** 2 for valor in range(1, 5)]\nprint(quadrados)',
  ordenacao: 'precos = [15, 50, 10, 30]\nprecos.sort(reverse=True)\nprint(precos)',
  encapsulamento: 'class Conta:\n    def __init__(self):\n        self.__saldo = 0\n    def depositar(self, quantia):\n        self.__saldo += quantia\n    def ver_saldo(self):\n        return self.__saldo\n\nminha = Conta()\nminha.depositar(50)\nminha.depositar(25)\nprint(minha.ver_saldo())',
  csv: 'import csv\nimport io\narquivo = io.StringIO("item,valor\\nLivro,30\\nCaneta,5")\nleitor = csv.DictReader(arquivo)\nsoma = sum(int(registro["valor"]) for registro in leitor)\nprint(soma)',
  transacoes: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE lancamento (valor INTEGER)")\ncon.executemany("INSERT INTO lancamento VALUES (?)", [(25,), (50,), (75,)])\ncon.commit()\nprint(con.execute("SELECT SUM(valor) FROM lancamento").fetchone()[0])\ncon.close()',
  paginacao: 'itens = list(range(1, 11))\npagina = 3\ntamanho = 2\ninicio = (pagina - 1) * tamanho\nprint(itens[inicio:inicio + tamanho])',
  tipagem: 'def somar(a: int, b: int) -> int:\n    resultado = a + b\n    return resultado\n\nprint(somar(20, 22))',
  modulos: 'import math\nprint(math.factorial(5))',
  arquitetura: 'def total_com_desconto(subtotal, taxa):\n    desconto = subtotal * taxa\n    return subtotal - desconto\n\nprint(total_com_desconto(200, 0.25))',
  geradores: 'def pares():\n    for valor in range(0, 6, 2):\n        yield valor\n\nprint(list(pares()))',
  decoradores: 'def em_maiusculas(funcao):\n    def interna():\n        return funcao().upper()\n    return interna\n\n@em_maiusculas\ndef linguagem():\n    return "python"\n\nprint(linguagem())',
  async: 'import asyncio\n\nasync def elevar(base):\n    return base * base\n\nprint(await asyncio.gather(elevar(3), elevar(4)))',

  variaveis: 'nome_da_linguagem = "Python"\nprint(nome_da_linguagem)',
  // Mesma regra, testada do menor para o maior: a ordem dos ramos é escolha de quem escreve.
  condicoes: 'media_final = 6\nif media_final < 5:\n    print("Reprovado")\nelif media_final < 7:\n    print("Recuperação")\nelse:\n    print("Aprovado")',
  booleanos: 'anos = 20\ningresso_na_mao = True\nprint(anos >= 18 and ingresso_na_mao)',
  complexidade: 'valores = [2, 1, 2, 3, 2, 4]\naparicoes = 0\nfor atual in valores:\n    if atual == 2:\n        aparicoes += 1\nprint(aparicoes)',
  classes: 'class Aluno:\n    def estudar(self):\n        return "Estudando Python"\n\nmeu_aluno = Aluno()\nprint(meu_aluno.estudar())',
  construtor: 'class Produto:\n    def __init__(self, nome):\n        self.nome = nome\n\nteclado = Produto("Teclado")\nprint(teclado.nome)',
  heranca: 'class Animal:\n    def som(self):\n        return "..."\n\nclass Cachorro(Animal):\n    def som(self):\n        return "Au au"\n\nmeu_pet = Cachorro()\nprint(meu_pet.som())',
  dataclasses: 'from dataclasses import dataclass\n\n@dataclass\nclass Produto:\n    nome: str\n    preco: float\n\nmouse = Produto("Mouse", 80)\nprint(mouse.preco)',
  excecoes: 'try:\n    resultado = 10 / 0\n    print(resultado)\nexcept ZeroDivisionError:\n    print("Divisão inválida")',
  arquivos: 'caminho = "meta.txt"\nwith open(caminho, "w", encoding="utf-8") as saida:\n    saida.write("Aprender todos os dias")\nwith open(caminho, encoding="utf-8") as entrada:\n    conteudo = entrada.read()\nprint(conteudo)',
  json: 'import json\nbruto = \'{"linguagem": "Python", "versao": 3}\'\nprint(json.loads(bruto)["linguagem"])',
  sql: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE produtos (nome TEXT)")\ncon.executemany("INSERT INTO produtos VALUES (?)", [("Livro",)])\nlinha = con.execute("SELECT nome FROM produtos").fetchone()\nprint(linha[0])\ncon.close()',
  crud: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE produtos (id INTEGER, estoque INTEGER)")\ncon.execute("INSERT INTO produtos VALUES (?, ?)", (1, 10))\nnovo_estoque = 15\ncon.execute("UPDATE produtos SET estoque = ? WHERE id = ?", (novo_estoque, 1))\nlinha = con.execute("SELECT estoque FROM produtos WHERE id = ?", (1,)).fetchone()\nprint(linha[0])\ncon.close()',
  http: 'criado = 201\nresposta = {"status": criado}\nprint(resposta["status"])',
  rest: 'tarefas = [{"id": 1, "titulo": "Ler"}, {"id": 2, "titulo": "Praticar"}]\n\ndef buscar_tarefa(tarefa_id):\n    encontradas = [item for item in tarefas if item["id"] == tarefa_id]\n    return encontradas[0] if encontradas else None\n\nprint(buscar_tarefa(2)["titulo"])',
  // Imprime a própria mensagem do erro em vez de repetir o texto: outro caminho, mesma saída.
  validacao: 'def validar_preco(preco):\n    if preco < 0:\n        raise ValueError("Preço inválido")\n    return preco\n\ntry:\n    validar_preco(-5)\nexcept ValueError as erro:\n    print(erro)',
  autenticacao: 'def pode_editar(usuario_id, dono_id, admin=False):\n    if admin:\n        return True\n    return usuario_id == dono_id\n\nprint(pode_editar(2, 1, True))',
  servicos: 'def criar_tarefa(titulo):\n    tarefa = {"titulo": titulo}\n    tarefa["concluida"] = False\n    return tarefa\n\nprint(criar_tarefa("Estudar")["concluida"])',
  testes: 'def dobro(numero):\n    return numero + numero\n\nfor entrada, esperado in [(0, 0), (4, 8)]:\n    assert dobro(entrada) == esperado\nprint("Testes passaram")',
  git: 'comando_de_revisao = "git diff"\nprint(comando_de_revisao)',
  logs: 'import logging\nlogging.basicConfig(level=logging.ERROR, format="%(message)s", force=True)\nregistrador = logging.getLogger("campus")\nregistrador.error("Falha na conexão")',
  analise: 'import statistics\nvalores = [10, 20, 30, 40, 500]\nprint(statistics.median(valores))',
  deploy: 'from os import environ\nmodo = environ.get("PYCAMPUS_MODO", "local")\nprint(modo)',
  tcc: 'requisitos = [("cadastro", True), ("testes", True), ("documentacao", True)]\nprint(all(feito for _, feito in requisitos))'
};

export const aulasComAlternativa = Object.keys(alternativas);
export const alternativeSolution = id => alternativas[id];
