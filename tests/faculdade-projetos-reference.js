export const solucoesProjetosFaculdade = {
  'projeto-u1':
    'notas = ["6", "8", "7", "9"]\ndef calcular_media(notas):\n    total = 0\n    for nota in notas:\n        total += float(nota)\n    return total / len(notas)\nmedia = calcular_media(notas)\nprint(f"Media: {media}")\nif media >= 7:\n    print("Aprovado")\nelse:\n    print("Revisar")',
  'projeto-u2':
    'visitas = ["Ana", "Bia", "Ana", "Caio"]\nclass Registro:\n    def __init__(self, visitas):\n        self.visitas = visitas\n    def pessoas_unicas(self):\n        return len(set(self.visitas))\nregistro = Registro(visitas)\nprint("Visitas:", len(registro.visitas))\nprint("Pessoas:", registro.pessoas_unicas())',
  'projeto-u3':
    'import pandas as pd\nvendas = pd.DataFrame({"nome": ["A", "B", "C", "D"], "receita": [120, 80, 150, 100]})\nselecionadas = vendas[vendas["receita"] > 100]\nprint("Produtos:", list(selecionadas["nome"]))\nprint("Quantidade:", len(selecionadas))',
  'projeto-u4':
    'import unittest\nimport io\ndef calcular(a, b, operacao):\n    if operacao == "soma":\n        return a + b\n    return a - b\nclass TestCalculadora(unittest.TestCase):\n    def test_soma(self):\n        self.assertEqual(calcular(2, 3, "soma"), 5)\n    def test_subtracao(self):\n        self.assertEqual(calcular(5, 2, "subtracao"), 3)\n    def test_negativo(self):\n        self.assertEqual(calcular(2, 5, "subtracao"), -3)\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(TestCalculadora)\nresultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)\nprint("Testes:", resultado.testsRun)\nprint("Falhas:", len(resultado.failures) + len(resultado.errors))',
};
