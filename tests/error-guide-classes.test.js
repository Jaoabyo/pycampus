import test from 'node:test';
import assert from 'node:assert/strict';
import { readError } from '../src/error-guide.js';

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
