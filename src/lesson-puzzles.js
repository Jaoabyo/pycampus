import { toBlocks } from './parsons.js';

// Solução de referência de cada aula, para o quebra-cabeça de blocos embaralhados (Parsons).
// Mostrar a solução em blocos é um apoio pedagógico deliberado: o estudante monta a ordem e a
// indentação em vez de escrever do zero. É diferente da solução de teste em
// tests/curriculum-solutions.js, que fica fora do pacote da aplicação de propósito, só para
// checagem automatizada — aqui a revelação é intencional.
const solutions = {
  ola: 'print("Meu primeiro programa em Python!")',
  variaveis: 'linguagem = "Python"\nprint(linguagem)',
  tipos: 'texto = "21"\nnumero = int(texto)\nprint(numero)\nprint(type(numero))',
  operadores: 'quantidade = 3\npreco = 20\ndesconto = 5\nsubtotal = quantidade * preco\ntotal = subtotal - desconto\nprint(total)',
  strings: 'texto = "  python  "\nlimpo = texto.strip()\nmaiusculo = limpo.upper()\nprint(maiusculo)',
  entrada: 'texto = input()\nnumero = int(texto)\nprint(numero + 1)',
  condicoes: 'nota = 6\nif nota >= 7:\n    print("Aprovado")\nelif nota >= 5:\n    print("Recuperação")\nelse:\n    print("Reprovado")',
  booleanos: 'idade = 20\ntem_ingresso = True\nmaior_de_idade = idade >= 18\npermitido = maior_de_idade and tem_ingresso\nprint(permitido)',
  for: 'total = 0\nfor numero in range(1, 6):\n    total = total + numero\nprint(total)',
  while: 'numero = 1\nwhile numero <= 3:\n    print(numero)\n    numero = numero + 1',
  funcoes: 'def quadrado(numero):\n    return numero * numero\n\nprint(quadrado(7))',
  decomposicao: 'def media(a, b, c):\n    total = a + b + c\n    return total / 3\n\nprint(media(7, 8, 9))',
  listas: 'numeros = [10, 20, 30]\nnumeros.append(40)\nprint(sum(numeros))',
  dicionarios: 'produto = {"nome": "Livro", "estoque": 10}\nproduto["estoque"] = produto["estoque"] + 5\nprint(produto["estoque"])',
  conjuntos: 'numeros = [3, 1, 3, 2, 1]\nunicos = set(numeros)\nprint(sorted(unicos))',
  comprehensions: 'quadrados = [n * n for n in range(1, 5)]\nprint(quadrados)',
  ordenacao: 'precos = [15, 50, 10, 30]\nordenados = sorted(precos, reverse=True)\nprint(ordenados)',
  complexidade: 'numeros = [2, 1, 2, 3, 2, 4]\ncontagem = 0\nfor item in numeros:\n    if item == 2:\n        contagem = contagem + 1\nprint(contagem)',
  classes: 'class Aluno:\n    def estudar(self):\n        return "Estudando Python"\n\nprint(Aluno().estudar())',
  construtor: 'class Produto:\n    def __init__(self, nome):\n        self.nome = nome\n\nprint(Produto("Teclado").nome)',
  encapsulamento: 'class Conta:\n    def __init__(self):\n        self._saldo = 0\n    def depositar(self, valor):\n        if valor <= 0:\n            return False\n        self._saldo = self._saldo + valor\n    @property\n    def saldo(self):\n        return self._saldo\n\nc = Conta()\nc.depositar(50)\nc.depositar(25)\nprint(c.saldo)',
  heranca: 'class Animal:\n    def som(self):\n        return "..."\n\nclass Cachorro(Animal):\n    def som(self):\n        return "Au au"\n\nprint(Cachorro().som())',
  dataclasses: 'from dataclasses import dataclass\n\n@dataclass\nclass Produto:\n    nome: str\n    preco: float\n\nprint(Produto("Mouse", 80).preco)',
  excecoes: 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Divisão inválida")',
  arquivos: 'with open("meta.txt", "w", encoding="utf-8") as arquivo:\n    arquivo.write("Aprender todos os dias")\nwith open("meta.txt", encoding="utf-8") as arquivo:\n    print(arquivo.read())',
  json: 'import json\ntexto = \'{"linguagem": "Python", "versao": 3}\'\ndados = json.loads(texto)\nprint(dados["linguagem"])',
  csv: 'import csv\nimport io\narquivo = io.StringIO("item,valor\\nLivro,30\\nCaneta,5")\ntotal = 0\nfor linha in csv.DictReader(arquivo):\n    total = total + int(linha["valor"])\nprint(total)',
  sql: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE produtos (nome TEXT)")\ncon.execute("INSERT INTO produtos VALUES (?)", ("Livro",))\nprint(con.execute("SELECT nome FROM produtos").fetchone()[0])\ncon.close()',
  crud: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE produtos (id INTEGER, estoque INTEGER)")\ncon.execute("INSERT INTO produtos VALUES (?, ?)", (1, 10))\ncon.execute("UPDATE produtos SET estoque = ? WHERE id = ?", (15, 1))\nprint(con.execute("SELECT estoque FROM produtos WHERE id = ?", (1,)).fetchone()[0])\ncon.close()',
  transacoes: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE vendas (valor INTEGER)")\nwith con:\n    con.executemany("INSERT INTO vendas VALUES (?)", [(25,), (50,), (75,)])\nprint(con.execute("SELECT SUM(valor) FROM vendas").fetchone()[0])\ncon.close()',
  http: 'resposta = {"status": 201}\nprint(resposta["status"])',
  rest: 'tarefas = [{"id": 1, "titulo": "Ler"}, {"id": 2, "titulo": "Praticar"}]\ndef buscar_tarefa(tarefa_id):\n    for tarefa in tarefas:\n        if tarefa["id"] == tarefa_id:\n            return tarefa\n    return None\n\nprint(buscar_tarefa(2)["titulo"])',
  validacao: 'def validar_preco(preco):\n    if preco < 0:\n        raise ValueError("Preço inválido")\n    return preco\n\ntry:\n    validar_preco(-5)\nexcept ValueError:\n    print("Preço inválido")',
  autenticacao: 'def pode_editar(usuario_id, dono_id, admin=False):\n    return usuario_id == dono_id or admin\n\nprint(pode_editar(2, 1, True))',
  paginacao: 'itens = list(range(1, 11))\npagina = 3\ntamanho = 2\ninicio = (pagina - 1) * tamanho\nfim = inicio + tamanho\nprint(itens[inicio:fim])',
  servicos: 'def criar_tarefa(titulo):\n    return {"titulo": titulo, "concluida": False}\n\nprint(criar_tarefa("Estudar")["concluida"])',
  testes: 'def dobro(numero):\n    return numero * 2\n\nassert dobro(0) == 0\nassert dobro(4) == 8\nprint("Testes passaram")',
  tipagem: 'def somar(a: int, b: int) -> int:\n    return a + b\n\nprint(somar(20, 22))',
  modulos: 'from math import factorial\nprint(factorial(5))',
  git: 'comando = "git diff"\nprint(comando)',
  logs: 'import logging\nlogging.basicConfig(level=logging.INFO, format="%(message)s", force=True)\nlogging.error("Falha na conexão")',
  arquitetura: 'def total_com_desconto(subtotal, taxa):\n    return subtotal * (1 - taxa)\n\nprint(total_com_desconto(200, 0.25))',
  geradores: 'def pares():\n    for n in range(3):\n        yield n * 2\n\nprint(list(pares()))',
  decoradores: 'from functools import wraps\ndef maiusculo(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs).upper()\n    return wrapper\n\n@maiusculo\ndef ola():\n    return "python"\n\nprint(ola())',
  async: 'import asyncio\nasync def quadrado(n):\n    return n * n\n\nprint(await asyncio.gather(quadrado(3), quadrado(4)))',
  analise: 'from statistics import median\nvalores = [10, 20, 30, 40, 500]\nprint(median(valores))',
  deploy: 'import os\nmodo = os.getenv("PYCAMPUS_MODO", "local")\nprint(modo)',
  tcc: 'requisitos = {"cadastro": True, "testes": True, "documentacao": True}\nprint(all(requisitos.values()))'
};

// Uma linha plausível e errada por aula, para o estudante rejeitar um engano comum em vez de
// só ordenar o que já sabe estar certo. Cada uma reflete um erro real e específico do assunto.
const distractors = {
  ola: 'print(Meu primeiro programa em Python!)',
  variaveis: 'linguagem = Python',
  tipos: 'numero = str(texto)',
  operadores: 'total = subtotal + desconto',
  strings: 'limpo = texto.strip',
  entrada: 'print(texto + 1)',
  condicoes: 'elif nota > 5:',
  booleanos: 'permitido = maior_de_idade or tem_ingresso',
  for: 'for numero in range(1, 5):',
  while: 'numero = numero - 1',
  funcoes: 'return numero * 2',
  decomposicao: 'return total',
  listas: 'numeros = numeros.append(40)',
  dicionarios: 'produto["estoque"] = 5',
  conjuntos: 'unicos = sorted(numeros)',
  comprehensions: 'quadrados = [n * 2 for n in range(1, 5)]',
  ordenacao: 'ordenados = sorted(precos)',
  complexidade: 'contagem = contagem + item',
  classes: 'def estudar():',
  construtor: 'nome = nome',
  encapsulamento: 'self._saldo = valor',
  heranca: 'class Cachorro:',
  dataclasses: 'preco = float',
  excecoes: 'except ValueError:',
  arquivos: 'arquivo = open("meta.txt", "w")',
  json: 'dados = json.dumps(texto)',
  csv: 'total = total + linha["valor"]',
  sql: 'print(con.execute("SELECT nome FROM produtos").fetchone())',
  crud: 'con.execute(f"UPDATE produtos SET estoque = {15} WHERE id = {1}")',
  transacoes: 'con.commit()',
  http: 'resposta = {"status": 200}',
  rest: 'if tarefa["id"] = tarefa_id:',
  validacao: 'if preco <= 0:',
  autenticacao: 'return usuario_id == dono_id and admin',
  paginacao: 'fim = pagina * tamanho',
  servicos: 'return {"titulo": titulo, "concluida": True}',
  testes: 'assert dobro(4) == 4',
  tipagem: 'def somar(a: int, b: int):',
  modulos: 'import factorial from math',
  git: 'comando = "git status"',
  logs: 'logging.info("Falha na conexão")',
  arquitetura: 'return subtotal * (1 + taxa)',
  geradores: 'return n * 2',
  decoradores: 'return func.upper()',
  async: 'print(asyncio.gather(quadrado(3), quadrado(4)))',
  analise: 'from statistics import mean',
  deploy: 'modo = os.getenv("PYCAMPUS_MODO")',
  tcc: 'print(all(requisitos.keys()))'
};

// Chamado a partir de curriculum.js sobre a mesma tabela por id usada por applyCurriculumReview
// e attachLessonGuides: cada lição ganha .puzzle, no mesmo formato usado pelas pontes e miniprojetos.
export function attachLessonPuzzles(all) {
  for (const [id, solution] of Object.entries(solutions)) {
    const lesson = all[id];
    if (!lesson) throw new Error(`Missing lesson ${id}`);
    const blocks = toBlocks(solution);
    // Uma aula de uma linha só não tem ordem para descobrir: o quebra-cabeça viraria um chute
    // entre duas opções. Ela fica sem .puzzle e a tela simplesmente não oferece a ajuda.
    if (blocks.length < 2) continue;
    lesson.puzzle = { blocks, prefix: '', distractor: distractors[id] || '' };
  }
}
