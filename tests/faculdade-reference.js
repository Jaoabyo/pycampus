// Uma solução por desafio da trilha da faculdade. Ela é executada no Pyodide real por
// scripts/check-faculdade.mjs e precisa produzir exatamente a saída que o desafio promete.
// Sem isto, "saída esperada" seria um palpite — e palpite já quebrou este projeto antes.
const NL = String.fromCharCode(10);

export const solucoesDaFaculdade = {
  r1: [
    'idade = 15',
    'tem_ingresso = True',
    'if idade < 12:',
    '    filme = 1',
    'elif idade < 18:',
    '    filme = 2',
    'else:',
    '    filme = 3',
    'if tem_ingresso:',
    '    print(f"Filme {filme} disponivel")'
  ].join(NL),

  r2: [
    'notas = [5, 4, 3, 2, 1]',
    'total = 0',
    'for nota in notas:',
    '    total += nota',
    'print(total)'
  ].join(NL),

  r3: [
    'def calcular_media(notas):',
    '    return sum(notas) / len(notas)',
    '',
    'print(calcular_media([7, 8, 9]))'
  ].join(NL),

  r4: [
    'camadas = {"front-end": "HTML", "back-end": "Flask"}',
    'print("Front-end:", camadas["front-end"])',
    'print("Back-end:", camadas["back-end"])'
  ].join(NL),

  u2a1: [
    'dias = ("seg", "ter", "qua")',
    'print(len(dias))',
    'for p, d in enumerate(dias):',
    '    print(p, d)'
  ].join(NL),

  u2a2: [
    'notas = [7, 8, 7, 9, 8, 10]',
    'print(len(set(notas)))'
  ].join(NL),

  u2a3: [
    'class Pessoa:',
    '    def __init__(self, nome, idade):',
    '        self.nome = nome',
    '        self.idade = idade',
    '',
    '    def cumprimentar(self):',
    '        return f"Ola, meu nome e {self.nome}."',
    '',
    '    def aniversario(self):',
    '        self.idade += 1',
    '',
    'pessoa1 = Pessoa("Joao", 30)',
    'print(pessoa1.cumprimentar())',
    'pessoa1.aniversario()',
    'print(pessoa1.idade)'
  ].join(NL),

  u2a4: [
    'import math as m',
    'print(int(m.sqrt(144)))'
  ].join(NL),

  u3a1: [
    'import sqlite3',
    'conn = sqlite3.connect(":memory:")',
    'cursor = conn.cursor()',
    'cursor.execute("CREATE TABLE Contatos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT)")',
    'cursor.execute("INSERT INTO Contatos (nome, email) VALUES (?, ?)", ("Maria", "maria@email.com"))',
    'conn.commit()',
    'cursor.execute("SELECT * FROM Contatos")',
    'print(cursor.fetchall())'
  ].join(NL),

  u3a2: [
    'import pandas as pd',
    'idades = pd.Series([20, 30, 40])',
    'print(idades.mean())'
  ].join(NL),

  u3a3: [
    'import pandas as pd',
    'vendas = pd.DataFrame({"nome": ["A", "B", "C"], "receita": [120, 80, 150]})',
    'print(list(vendas[vendas["receita"] > 100]["nome"]))'
  ].join(NL),

  u3a4: [
    'import matplotlib',
    'matplotlib.use("Agg")',
    'import matplotlib.pyplot as plt',
    'plt.bar(["Jan", "Fev"], [120, 90])',
    'plt.title("Vendas")',
    'print("Barras:", len(plt.gca().patches))'
  ].join(NL)
};
