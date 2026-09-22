// Cada exemplo local inclui sua preparação: o worker não depende do passo anterior.
const classeLivro = 'class Livro:\n    def __init__(self, titulo, autor, genero, quantidade_disponivel):\n        self.titulo = titulo\n        self.autor = autor\n        self.genero = genero\n        self.quantidade_disponivel = quantidade_disponivel';
const livro = 'Livro("Dom Casmurro", "Machado de Assis", "Romance", 3)';

export function exemploDaEntrega(entrega, passo) {
  if (passo.fase !== 'entender') return null;
  if (entrega.ambienteEntrega === 'colab') return { ambiente: 'colab', codigo: passo.exemplo };
  const pequenos = {
    'u1-entender-lista': { codigo: passo.exemplo, saida: '6.0' },
    'u1-entender-media': { codigo: passo.exemplo, saida: '7.5' },
    'u2-entender-classe': { codigo: `${passo.exemplo}\n\nmeu_livro = ${livro}\nprint(meu_livro.titulo)`, saida: 'Dom Casmurro' },
    'u2-entender-colecao': { codigo: `${classeLivro}\n\n${passo.exemplo}\nprint(livros[0].titulo)`, saida: 'Dom Casmurro' },
    'u2-entender-funcao': { codigo: `${classeLivro}\n\n${passo.exemplo}\n\nlivros = []\ncadastrar_livro(livros, "Dom Casmurro", "Machado de Assis", "Romance", 3)\nprint(livros[0].titulo)`, saida: 'Dom Casmurro' },
    'u2-entender-busca': { codigo: passo.exemplo, saida: 'True' },
    'u2-entender-contagem': { codigo: passo.exemplo, saida: "{'Romance': 1}" },
    'u3-entender-banco': { codigo: `import sqlite3\n# Usamos memória neste exemplo pequeno; o trabalho final usa dados_vendas.db.\nconexao = sqlite3.connect(":memory:")\ncursor = conexao.cursor()\ncursor.execute("""${passo.exemplo}""")\nprint("Tabela criada: vendas1")\nconexao.close()`, saida: 'Tabela criada: vendas1' },
    'u3-entender-fluxo': { codigo: `import sqlite3\n${passo.exemplo}\ncursor.execute("CREATE TABLE IF NOT EXISTS exemplo (produto TEXT)")\ncursor.execute("DELETE FROM exemplo")\ncursor.execute("INSERT INTO exemplo VALUES (?)", ("Caderno",))\nconexao.commit()\ncursor.execute("SELECT produto FROM exemplo")\nprint(cursor.fetchall())\nconexao.close()`, saida: "[('Caderno',)]" },
    'u3-entender-agregacao': { codigo: 'import pandas as pd\ndf_vendas = pd.DataFrame({\n    "produto": ["Caderno", "Caneta", "Livro"],\n    "categoria": ["Papelaria", "Papelaria", "Livraria"],\n    "valor_venda": [20, 10, 40],\n})\n' + passo.exemplo.replace('print(por_categoria)', 'print(por_categoria.to_dict())'), saida: "{'Livraria': 40, 'Papelaria': 30}" },
  };
  const exemplo = pequenos[passo.id];
  const preparacao = {
    'u2-entender-classe': 'Livro(...) cria um objeto usando a classe acima. meu_livro guarda esse objeto; .titulo acessa seu título. print mostra esse texto.',
    'u2-entender-colecao': 'Repetimos a classe Livro para este exemplo funcionar sozinho. livros[0] acessa o primeiro objeto da lista; .titulo lê o título dele.',
    'u2-entender-funcao': 'A classe vem primeiro. Depois definimos cadastrar_livro, criamos a lista vazia e chamamos a função com os dados do livro. print(livros[0].titulo) confere o cadastro.',
    'u3-entender-banco': 'import carrega sqlite3. connect(":memory:") abre um banco temporário; cursor() prepara os comandos. execute recebe o SQL entre aspas triplas. print confirma que ele terminou; close() fecha a conexão.',
    'u3-entender-fluxo': 'A tabela exemplo é apenas um treino. CREATE TABLE IF NOT EXISTS cria a tabela se necessário; DELETE limpa a execução anterior. INSERT grava o produto no lugar do ?, usando a tupla ("Caderno",). commit salva; SELECT consulta; fetchall devolve as linhas; close fecha o banco.',
    'u3-entender-agregacao': 'pd.DataFrame transforma o dicionário em tabela: cada chave nomeia uma coluna, e cada lista contém seus valores. groupby reúne as categorias e sum soma as vendas. to_dict() só transforma o resultado em um dicionário para facilitar sua leitura; não altera a soma.',
  };
  return exemplo ? { ambiente: 'pycampus', ...exemplo, preparacao: preparacao[passo.id] } : null;
}
