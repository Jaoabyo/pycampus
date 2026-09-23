import { conferencia } from './faculdade-conferencias.js';
import { PRAZO_TRABALHO } from './faculdade.js';

const PRAZO = PRAZO_TRABALHO;
const FASES = ['entender', 'construir', 'testar', 'explicar', 'exportar'];
const CAMPOS_TEXTO = {
  codigo: 50000,
  saida: 12000,
  logica: 4000,
  testes: 4000,
  conclusao: 4000,
  insights: 4000,
  saidaExterna: 12000,
  observacao: 600,
};
const CAMPOS_DATA = ['executadaEm', 'executadaNoColabEm', 'concluidaEm'];

const texto = (valor, limite) => typeof valor === 'string' ? valor.slice(0, limite) : '';
const dataValida = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return '';
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.valueOf())) return '';
  const local = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
  return local === valor ? valor : '';
};
const idsValidos = (valores, passos) => {
  const permitidos = new Set(passos.map(({ id }) => id));
  return [...new Set(Array.isArray(valores) ? valores.filter((id) => permitidos.has(id)) : [])];
};
const textoMaisLongo = (a, b) => b.length > a.length ? b : a;

// O link do notebook vai impresso no PDF que a faculdade recebe. Só entra endereco http(s):
// um "javascript:" impresso num trabalho academico nao ajuda ninguem e e um risco a toa.
const enderecoValido = (valor) => {
  if (typeof valor !== 'string') return '';
  const limpo = valor.trim().slice(0, 400);
  if (!/^https?:\/\//i.test(limpo)) return '';
  try {
    new URL(limpo);
    return limpo;
  } catch {
    return '';
  }
};

// Os gráficos da última execução vão para o PDF da entrega, então são guardados junto do
// trabalho. Só entra PNG vindo do próprio worker: qualquer outra coisa gravada aqui acabaria
// desenhada dentro do arquivo que o estudante envia à faculdade. O limite existe porque o
// AVA recusa acima de 10 MB e o progresso inteiro cabe no navegador.
const LIMITE_DE_IMAGENS = 4;
const TAMANHO_MAXIMO_DA_IMAGEM = 900000;
const imagensValidas = (valores) => (Array.isArray(valores) ? valores : [])
  .filter((item) => typeof item === 'string'
    && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(item)
    && item.length <= TAMANHO_MAXIMO_DA_IMAGEM)
  .slice(0, LIMITE_DE_IMAGENS);

// O roteiro pede literalmente "um print do código executado pelo menos uma vez" — uma captura
// de tela, não o código transcrito. O PyCampus não consegue fotografar a tela do estudante,
// então ele anexa a própria captura e ela entra no PDF. Aceita PNG e JPEG, que é o que as
// ferramentas de recorte do Windows produzem.
const LIMITE_DE_CAPTURAS = 3;
const TAMANHO_MAXIMO_DA_CAPTURA = 2800000;
export const capturasValidas = (valores) => (Array.isArray(valores) ? valores : [])
  .filter((item) => typeof item === 'string'
    && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(item)
    && item.length <= TAMANHO_MAXIMO_DA_CAPTURA)
  .slice(0, LIMITE_DE_CAPTURAS);
const dataMaisRecente = (a, b) => b > a ? b : a;

const expressaoSempreFalsa = (valor) => {
  let expressao = String(valor).trim();
  while (expressao.startsWith('(') && expressao.endsWith(')')) expressao = expressao.slice(1, -1).trim();
  return /^(?:False|None|0(?:\.0+)?|not\s+True|\[\]|\{\}|\(\)|["']{2})$/.test(expressao);
};

const analisarCodigoPython = (codigo = '') => {
  const fonte = String(codigo);
  const caracteres = fonte.split('');
  const strings = [];
  let indice = 0;
  while (indice < fonte.length) {
    if (fonte[indice] === '#') {
      while (indice < fonte.length && fonte[indice] !== '\n') caracteres[indice++] = ' ';
      continue;
    }
    if (fonte[indice] !== '"' && fonte[indice] !== "'") {
      indice += 1;
      continue;
    }
    const inicio = indice;
    const aspas = fonte[indice];
    const tamanho = fonte.slice(indice, indice + 3) === aspas.repeat(3) ? 3 : 1;
    indice += tamanho;
    const inicioConteudo = indice;
    while (indice < fonte.length) {
      if (fonte[indice] === '\\') {
        caracteres[indice++] = ' ';
        if (indice < fonte.length) caracteres[indice++] = ' ';
        continue;
      }
      if (fonte.slice(indice, indice + tamanho) === aspas.repeat(tamanho)) break;
      indice += 1;
    }
    const fimConteudo = indice;
    indice = Math.min(fonte.length, indice + tamanho);
    strings.push({ inicio, conteudo: fonte.slice(inicioConteudo, fimConteudo) });
    for (let posicao = inicio; posicao < indice; posicao += 1) {
      if (caracteres[posicao] !== '\n') caracteres[posicao] = ' ';
    }
  }

  const linhas = caracteres.join('').split('\n');
  let recuoMorto = null;
  for (let linha = 0; linha < linhas.length; linha += 1) {
    const atual = linhas[linha];
    const conteudo = atual.trim();
    const recuo = atual.length - atual.trimStart().length;
    if (recuoMorto !== null && conteudo && recuo <= recuoMorto) recuoMorto = null;
    if (recuoMorto !== null) linhas[linha] = ' '.repeat(atual.length);
    const condicional = conteudo.match(/^(?:if|while)\s+(.+)\s*:\s*$/);
    if (condicional && expressaoSempreFalsa(condicional[1])) recuoMorto = recuo;
  }
  return { executavel: linhas.join('\n'), strings };
};

const passo = (id, fase, titulo, explicacao, exemplo, evidencia, extras = {}) => ({
  id, fase, titulo, explicacao, exemplo, evidencia, ...extras,
});

const criterioCodigo = (id, descricao, teste) => ({
  id,
  descricao,
  atende: (trabalho = {}) => teste.test(analisarCodigoPython(trabalho.codigo).executavel),
});

// O segundo argumento é o trabalho cru. Quase todo critério olha só o código executável, mas
// alguns precisam do original: comentários, por exemplo, são apagados pela análise justamente
// para que ninguém finja implementação dentro de um comentário — e é neles que o roteiro
// manda explicar a lógica.
const criterioEstrutural = (id, descricao, analisar) => ({
  id,
  descricao,
  atende: (trabalho = {}) => analisar(analisarCodigoPython(trabalho.codigo), trabalho),
});

const stringEmChamada = ({ executavel, strings }, chamada, conteudo) => strings.some((item) => {
  const antes = executavel.slice(Math.max(0, item.inicio - 100), item.inicio);
  return chamada.test(antes) && conteudo.test(item.conteudo);
});

const criterioTexto = (id, descricao, campo, minimo = 30) => ({
  id,
  descricao,
  atende: (trabalho = {}) => String(trabalho[campo] || '').trim().length >= minimo,
});

const criterioExecucaoColab = {
  id: 'execucao-colab',
  descricao: 'registrar a saída real e a data da execução no Google Colab',
  atende: (trabalho = {}) => String(trabalho.saidaExterna || '').trim().length >= 20
    && Boolean(dataValida(trabalho.executadaNoColabEm)),
};

const criterioPassos = (ids) => ({
  id: 'passos-guiados',
  descricao: 'concluir os passos guiados com suas evidências',
  atende: (trabalho = {}) => {
    const concluidos = new Set(Array.isArray(trabalho.passosConcluidos) ? trabalho.passosConcluidos : []);
    return ids.every((id) => concluidos.has(id));
  },
});

const dadosComuns = {
  prazo: PRAZO,
  origem: 'Roteiro oficial de aula prática · Linguagem de Programação',
};

const praticaLocalU4 = {
  aviso: 'Esta prática ensina o pipeline de classificação, mas não é uma rede neural. A entrega TensorFlow roda no Google Colab.',
  esperado: 'Treino: 6\nTeste: 3\nAcuracia local: 100.0%',
  codigo: [
    'dados = [',
    '    ([1.0, 1.1], 0), ([1.2, 0.9], 0), ([0.8, 1.0], 0),',
    '    ([4.0, 4.1], 1), ([4.2, 3.9], 1), ([3.8, 4.0], 1),',
    '    ([1.1, 1.0], 0), ([4.1, 4.0], 1), ([3.9, 4.2], 1),',
    ']',
    'treino = dados[:6]',
    'teste = dados[6:]',
    '',
    'def normalizar(amostra):',
    '    return [valor / 5 for valor in amostra]',
    '',
    'centros = {0: normalizar([1.0, 1.0]), 1: normalizar([4.0, 4.0])}',
    'def prever(amostra):',
    '    normalizada = normalizar(amostra)',
    '    distancias = {}',
    '    for rotulo, centro in centros.items():',
    '        distancias[rotulo] = sum((a - b) ** 2 for a, b in zip(normalizada, centro))',
    '    return min(distancias, key=distancias.get)',
    '',
    'acertos = sum(prever(amostra) == rotulo for amostra, rotulo in teste)',
    'acuracia = acertos / len(teste)',
    'print("Treino:", len(treino))',
    'print("Teste:", len(teste))',
    'print(f"Acuracia local: {acuracia * 100:.1f}%")',
  ].join('\n'),
};

const passosU1 = [
  passo(
    'u1-entender-lista', 'entender', 'Guarde várias notas juntas',
    'Uma lista mantém vários valores em ordem. Cada nota continua sendo um item separado e pode ser percorrida depois.',
    'notas = [6.0, 7.0, 8.0]\nprint(notas[0])  # primeira nota',
    'Preveja a primeira nota e execute o exemplo antes de alterar um valor.',
  ),
  passo(
    'u1-entender-media', 'entender', 'Transforme notas em uma média',
    'A média é a soma das notas dividida pela quantidade. sum(notas) soma; len(notas) conta. A lista não pode estar vazia.',
    'notas = [6.0, 7.0, 8.0, 9.0]\nmedia = sum(notas) / len(notas)\nprint(media)',
    'Explique com suas palavras o papel de sum e len.',
  ),
  passo(
    'u1-construir-cadastro', 'construir', 'Cadastre e valide as notas',
    'Crie uma lista e acrescente notas numéricas. Para dados digitados, converta o texto com float antes de usar append.',
    'notas = []\nnotas.append(float("7.5"))\nnotas.append(float("8"))',
    'Seu código final contém uma lista com pelo menos quatro notas.',
  ),
  passo(
    'u1-construir-acumulador', 'construir', 'Percorra e acumule sem pular etapas',
    'for pega uma nota por vez. O acumulador começa em zero e recebe cada valor; len conta quantas notas participaram. Antes de dividir, trate a lista vazia para evitar divisão por zero.',
    'if not notas:\n    return None\ntotal = 0\nfor nota in notas:\n    total += nota\nmedia = total / len(notas)',
    'Altere uma nota, preveja o novo total e confira a média; depois teste uma lista vazia.',
  ),
  passo(
    'u1-construir-funcao', 'construir', 'Separe o cálculo em uma função',
    'Uma função dá nome à regra e devolve um resultado com return. Assim o cálculo pode ser testado com listas diferentes.',
    'def calcular_media(notas):\n    return sum(notas) / len(notas)',
    'Crie calcular_media e use o valor devolvido fora da função.',
  ),
  passo(
    'u1-construir-situacao', 'construir', 'Decida a situação pelo limite sete',
    'A regra oficial usa média maior ou igual a 7. O sinal de igualdade importa: média exatamente 7 também é aprovação.',
    'situacao = "Aprovado" if media >= 7 else "Reprovado"',
    'Mostre nome, notas, média e situação em um relatório legível.',
  ),
  passo(
    'u1-testar-limites', 'testar', 'Teste os dois caminhos e o limite',
    'Um teste útil tenta valores que podem revelar erro: abaixo de 7, exatamente 7 e acima de 7.',
    'casos = [[5, 6], [7, 7], [8, 9]]',
    'Registre os três casos testados e confirme suas situações.',
  ),
  passo(
    'u1-explicar-logica', 'explicar', 'Explique a lógica sem repetir o código',
    'Explique entrada, processamento e saída: quais dados chegam, como a média é obtida e como a decisão é tomada.',
    'Entrada: lista de notas. Processamento: soma, divisão e comparação. Saída: relatório.',
    'Escreva uma explicação própria e uma conclusão sobre os testes.',
  ),
  passo(
    'u1-exportar', 'exportar', 'Prepare notebook e relatório',
    'O notebook deve rodar do início ao fim. O relatório precisa mostrar código, execução, testes e explicação.',
    'Execute tudo novamente antes de exportar e confira o PDF gerado.',
    'Conclua os critérios e confira os dois arquivos antes do envio ao AVA.',
  ),
];

const passosU2 = [
  passo(
    'u2-entender-classe', 'entender', 'Modele um livro',
    'Uma classe descreve o formato dos objetos. __init__ recebe os dados na criação; self representa o objeto atual.',
    'class Livro:\n    def __init__(self, titulo, autor, genero, quantidade_disponivel):\n        self.titulo = titulo\n        self.autor = autor\n        self.genero = genero\n        self.quantidade_disponivel = quantidade_disponivel',
    'Crie um Livro e mostre seu título.',
  ),
  passo(
    'u2-entender-colecao', 'entender', 'Guarde objetos em uma lista',
    'A lista funciona como o catálogo da biblioteca. append cadastra um novo objeto sem apagar os anteriores.',
    'livros = []\nlivros.append(Livro("Dom Casmurro", "Machado de Assis", "Romance", 3))',
    'Cadastre dois livros de gêneros diferentes.',
  ),
  passo(
    'u2-entender-funcao', 'entender', 'Dê um nome ao cadastro',
    'Uma função evita repetir o modo de criar e guardar livros. Ela recebe os dados, cria um Livro e usa append no catálogo recebido.',
    'def cadastrar_livro(livros, titulo, autor, genero, quantidade_disponivel):\n    livros.append(Livro(titulo, autor, genero, quantidade_disponivel))',
    'Altere os dados da chamada e confirme qual novo objeto entrou na lista.',
  ),
  passo(
    'u2-entender-busca', 'entender', 'Compare títulos sem diferença de caixa',
    'lower() cria versões minúsculas para a comparação. O texto original do livro não é alterado; somente a comparação usa a forma normalizada.',
    'titulo_salvo = "Dom Casmurro"\nbusca = "DOM CASMURRO"\nprint(titulo_salvo.lower() == busca.lower())',
    'Troque a busca por um título ausente e preveja False antes de executar no editor.',
  ),
  passo(
    'u2-entender-contagem', 'entender', 'Acumule uma contagem por gênero',
    'O dicionário usa o gênero como chave. get(genero, 0) devolve zero quando a chave ainda não existe; somar um registra a ocorrência atual.',
    'contagem = {}\ngenero = "Romance"\ncontagem[genero] = contagem.get(genero, 0) + 1\nprint(contagem)',
    'Repita a atualização para Romance e confirme que a contagem muda de 1 para 2.',
  ),
  passo(
    'u2-construir-cadastro', 'construir', 'Crie a função de cadastro',
    'A função recebe o catálogo e os dados, constrói o objeto e o adiciona. Ela concentra uma responsabilidade clara.',
    'def cadastrar_livro(livros, titulo, autor, genero, quantidade_disponivel):\n    livros.append(Livro(titulo, autor, genero, quantidade_disponivel))',
    'Cadastre pelo menos quatro livros por meio da função.',
  ),
  passo(
    'u2-construir-listagem', 'construir', 'Liste o catálogo',
    'Percorra cada objeto com for e leia seus atributos. Não imprima títulos escritos manualmente fora da lista.',
    'for livro in livros:\n    print(livro.titulo, "-", livro.autor, "-", livro.genero, "-", livro.quantidade_disponivel)',
    'A listagem exibe os dados de todos os objetos cadastrados.',
  ),
  passo(
    'u2-construir-busca', 'construir', 'Busque sem depender de maiúsculas',
    'lower() permite comparar versões normalizadas do título. A função devolve o objeto encontrado ou None.',
    'if livro.titulo.lower() == titulo_buscado.lower():\n    return livro',
    'Faça uma busca existente e uma inexistente.',
  ),
  passo(
    'u2-construir-generos', 'construir', 'Conte livros por gênero',
    'Um dicionário associa cada gênero à sua contagem. get(genero, 0) fornece zero na primeira ocorrência. Termine o gráfico com plt.close(): se o programa desenhar outro gráfico depois, ele começa numa figura nova, em vez de misturar as barras.',
    'contagem[livro.genero] = contagem.get(livro.genero, 0) + 1\nplt.bar(contagem.keys(), contagem.values())\nplt.close()',
    'Gere um gráfico de barras usando os gêneros e suas contagens.',
  ),
  passo(
    'u2-testar-fluxos', 'testar', 'Teste cadastro, busca e contagem',
    'Teste título com caixa diferente, título inexistente e dois livros do mesmo gênero.',
    'assert buscar_livro(livros, "dom casmurro") is not None',
    'Registre os resultados dos três testes.',
  ),
  passo(
    'u2-explicar-logica', 'explicar', 'Explique objetos e coleção',
    'Mostre a diferença entre a classe Livro, cada objeto Livro e a lista que reúne esses objetos.',
    'Classe é o molde; objeto é um livro concreto; lista é o catálogo.',
    'Escreva a lógica e o que seus testes provaram.',
  ),
  passo(
    'u2-exportar', 'exportar', 'Prepare a entrega da biblioteca',
    'O notebook deve apresentar cadastro, listagem, busca e gráfico na ordem em que foram construídos.',
    'Execute todas as células e confira se o gráfico aparece antes de salvar o relatório.',
    'Exporte notebook e relatório com a execução registrada.',
  ),
];

const passosU3 = [
  passo(
    'u3-entender-banco', 'entender', 'Entenda tabela, linha e coluna',
    'SQLite guarda dados em tabelas. O roteiro da faculdade define a tabela vendas1: cada venda é uma linha e id_venda, data_venda, produto, categoria e valor_venda são colunas. AUTOINCREMENT faz o banco gerar o id_venda sozinho, por isso o INSERT não informa essa coluna.',
    'CREATE TABLE vendas1 (\n    id_venda INTEGER PRIMARY KEY AUTOINCREMENT,\n    data_venda DATE,\n    produto TEXT,\n    categoria TEXT,\n    valor_venda REAL\n)',
    'Identifique qual coluna não pode se repetir e por quê.',
  ),
  passo(
    'u3-entender-fluxo', 'entender', 'Separe gravar de consultar',
    'connect abre o banco, execute envia SQL e commit confirma mudanças. SELECT consulta sem alterar os registros. O roteiro usa o arquivo dados_vendas.db, então o banco continua existindo depois que a célula termina.',
    'conexao = sqlite3.connect("dados_vendas.db")\ncursor = conexao.cursor()',
    'Explique quando commit é necessário.',
  ),
  passo(
    'u3-entender-agregacao', 'entender', 'Agrupe antes de resumir',
    'groupby separa as linhas por categoria; selecionar valor_venda escolhe a medida; sum calcula um total para cada grupo. O resultado continua derivado dos dados.',
    'por_categoria = df_vendas.groupby("categoria")["valor_venda"].sum()\nprint(por_categoria)',
    'Troque categoria por produto e explique como muda a pergunta respondida.',
  ),
  passo(
    'u3-construir-sqlite', 'construir', 'Crie a base do roteiro, de forma reproduzível',
    'Copie a tabela vendas1 e as quatorze vendas do roteiro. O roteiro escreve CREATE TABLE direto, mas rodar a célula duas vezes daria erro de tabela existente e duplicaria as vendas: por isso apague a tabela antes de criar. O resultado continua sendo o do professor.',
    'cursor.execute("DROP TABLE IF EXISTS vendas1")',
    'Crie a tabela vendas1 e insira as quatorze vendas do roteiro.',
  ),
  passo(
    'u3-construir-dataframe', 'construir', 'Leve a consulta ao pandas',
    'O roteiro pula esta ponte: no Passo 2 ele já fala do DataFrame df_vendas sem mostrar como ele nasce. Quem cria é read_sql_query, que executa o SELECT e devolve o resultado como DataFrame.',
    'df_vendas = pd.read_sql_query("SELECT * FROM vendas1", conexao)\nprint(df_vendas.head())',
    'Mostre as primeiras linhas e os tipos das colunas.',
  ),
  passo(
    'u3-construir-analise', 'construir', 'Responda perguntas com dados',
    'Calcule a receita total, o ticket médio, o produto de maior valor e a receita agrupada por categoria.',
    'por_categoria = df_vendas.groupby("categoria")["valor_venda"].sum()',
    'Apresente números derivados do DataFrame, sem escrevê-los manualmente.',
  ),
  passo(
    'u3-construir-graficos', 'construir', 'Transforme resultados em gráficos',
    'Matplotlib está disponível no PyCampus. O roteiro também pede Seaborn, que só existe no Colab: escreva o gráfico de modo que ele funcione com Seaborn quando houver e com Matplotlib quando não houver. Termine cada gráfico com plt.close(): assim o gráfico seguinte, por categoria ou por produto, começa numa figura nova em vez de se misturar a este e passar a mentir.',
    'por_categoria.plot(kind="bar", title="Receita por categoria")\nplt.tight_layout()\nplt.show()\nplt.close()',
    'Crie um gráfico por categoria e outro por produto.',
  ),
  passo(
    'u3-testar-dados', 'testar', 'Teste consistência e reexecução',
    'Confira o número de linhas, a ausência de valores negativos e o total esperado. Rode novamente e confirme que as vendas não duplicaram.',
    'assert len(df_vendas) == 14\nassert (df_vendas["valor_venda"] >= 0).all()',
    'Registre os testes e o resultado da segunda execução.',
  ),
  passo(
    'u3-explicar-insights', 'explicar', 'Transforme números em decisões',
    'Um insight liga evidência a uma ação. Cite o número observado, sua interpretação e uma sugestão para a empresa.',
    'Evidência → interpretação → ação sugerida.',
    'Escreva pelo menos três insights baseados nos resultados.',
  ),
  passo(
    'u3-exportar', 'exportar', 'Prepare análise e relatório',
    'O notebook deve criar seu próprio banco, analisar, plotar e concluir sem depender de caminho do computador.',
    'Reinicie e execute todas as células no Colab para confirmar reprodutibilidade.',
    'Exporte os arquivos e confira gráficos, saídas e insights.',
  ),
];

const passosU4 = [
  passo(
    'u4-entender-problema', 'entender', 'Separe características e rótulo',
    'No Iris, quatro medidas são as características de entrada; a espécie é o rótulo que o modelo tenta prever.',
    'X = iris.data      # medidas\ny = iris.target    # espécie',
    'Explique a diferença entre uma característica e o rótulo.',
  ),
  passo(
    'u4-entender-treino-teste', 'entender', 'Reserve dados para avaliação',
    'O modelo aprende no treino e é conferido em exemplos separados de teste. random_state permite repetir a mesma divisão.',
    'X_treino, X_teste, y_treino, y_teste = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)',
    'Explique por que avaliar nos mesmos dados de treino seria enganoso.',
  ),
  passo(
    'u4-entender-escala', 'entender', 'Aprenda a escala sem olhar o teste',
    'fit_transform calcula média e escala apenas com o treino e já o transforma. transform reutiliza esses mesmos parâmetros no teste, evitando vazamento de informação.',
    'scaler = StandardScaler()\nX_treino = scaler.fit_transform(X_treino)\nX_teste = scaler.transform(X_teste)',
    'Explique por que não usamos fit_transform novamente em X_teste.',
  ),
  passo(
    'u4-entender-rede', 'entender', 'Leia a arquitetura de entrada para saída',
    'Sequential organiza camadas em ordem. Input recebe quatro medidas; Dense com relu aprende combinações; a saída softmax produz três probabilidades.',
    'model = tf.keras.Sequential([\n    tf.keras.layers.Input(shape=(4,)),\n    tf.keras.layers.Dense(12, activation="relu"),\n    tf.keras.layers.Dense(3, activation="softmax"),\n])',
    'Identifique por que a entrada tem quatro valores e a saída tem três.',
  ),
  passo(
    'u4-entender-treino', 'entender', 'Entenda uma época e a validação',
    'Cada época percorre o treino uma vez. validation_split separa uma parte do treino para acompanhar generalização sem tocar no teste final.',
    'historico = model.fit(X_treino, y_treino, epochs=40, validation_split=0.2, verbose=0)',
    'Compare accuracy e val_accuracy e explique por que elas podem divergir.',
  ),
  passo(
    'u4-entender-saida', 'entender', 'Separe avaliação de predição',
    'evaluate resume o desempenho no conjunto reservado. predict devolve probabilidades por amostra; argmax escolhe o índice com maior probabilidade.',
    'perda, acuracia = model.evaluate(X_teste, y_teste, verbose=0)\nprobabilidades = model.predict(X_teste[:3], verbose=0)\nprevisoes = probabilidades.argmax(axis=1)',
    'Antes de executar no Colab, diga o formato esperado para três previsões.',
  ),
  passo(
    'u4-construir-escala', 'construir', 'Normalize sem vazar o teste',
    'O scaler aprende média e escala somente no treino. Depois a mesma transformação é aplicada ao teste.',
    'scaler = StandardScaler()\nX_treino = scaler.fit_transform(X_treino)\nX_teste = scaler.transform(X_teste)',
    'Use fit_transform no treino e somente transform no teste.',
  ),
  passo(
    'u4-construir-modelo', 'construir', 'Monte a rede neural',
    'A camada de entrada recebe quatro medidas. A saída tem três probabilidades, uma para cada espécie.',
    'model = tf.keras.Sequential([\n    tf.keras.layers.Input(shape=(4,)),\n    tf.keras.layers.Dense(12, activation="relu"),\n    tf.keras.layers.Dense(3, activation="softmax"),\n])',
    'Compile com uma perda compatível com rótulos inteiros e métrica accuracy.',
  ),
  passo(
    'u4-construir-treino', 'construir', 'Treine e acompanhe épocas',
    'Uma época percorre o conjunto de treino. validation_split acompanha dados separados dentro do treino sem usar o teste final.',
    'historico = model.fit(X_treino, y_treino, epochs=40, validation_split=0.2, verbose=0)',
    'Treine no Colab e observe accuracy e val_accuracy.',
  ),
  passo(
    'u4-testar-avaliacao', 'testar', 'Avalie em dados reservados',
    'evaluate mede perda e acurácia no teste. Acurácia resume acertos, mas não explica sozinha todos os erros.',
    'perda, acuracia = model.evaluate(X_teste, y_teste, verbose=0)',
    'Registre a acurácia real produzida no Colab.',
  ),
  passo(
    'u4-testar-predicao', 'testar', 'Converta probabilidades em espécie',
    'predict devolve três probabilidades. argmax escolhe o índice da maior; target_names recupera o nome da espécie.',
    'probabilidades = model.predict(amostra, verbose=0)\nindice = probabilidades.argmax(axis=1)[0]\nprint(iris.target_names[indice])',
    'Teste pelo menos três amostras e registre probabilidades e espécie.',
  ),
  passo(
    'u4-explicar-resultados', 'explicar', 'Interprete sem prometer perfeição',
    'Explique divisão, escala, treino, acurácia e uma limitação. Não diga que alta acurácia prova que o modelo serve para qualquer flor.',
    'Resultado observado + interpretação + limitação.',
    'Escreva sua explicação e conclusão com a acurácia real.',
  ),
  passo(
    'u4-exportar-colab', 'exportar', 'Execute e prepare a entrega no Colab',
    'TensorFlow e scikit-learn não são executados pelo Pyodide desta página. O notebook oficial deve ser aberto e executado no Google Colab.',
    'Ambiente final: Google Colab, com todas as células executadas em ordem.',
    'Cole a saída real do Colab, registre a data e só então exporte o relatório.',
  ),
];

const comPassos = (entrega, passos) => ({
  ...dadosComuns,
  ...entrega,
  passos,
  criterios: [
    ...entrega.criterios,
    criterioPassos(passos.filter(({ fase }) => fase !== 'exportar').map(({ id }) => id)),
  ],
});

export const entregasDaFaculdade = [
  comPassos({
    id: 'entrega-u1',
    unidade: 'u1',
    titulo: 'Sistema de gestão de notas',
    resumo: 'Cadastre notas em uma lista, calcule a média, aplique o limite 7 e apresente um relatório de aprovação.',
    minutos: 100,
    ambienteEntrega: 'pycampus',
    preRequisitos: ['u1a1', 'r1', 'r2', 'r3'],
    codigoInicial: 'notas = [6.0, 7.0, 8.0, 9.0]\n\n# Construa calcular_media, a situação e o relatório.\n',
    testesOrientados: ['média abaixo de 7', 'média exatamente 7', 'média acima de 7', 'lista vazia tratada sem divisão por zero'],
    entregaveis: ['notebook Google Colab com código comentado', 'relatório PDF com execução, testes e explicação'],
    criterios: [
      criterioCodigo('lista-de-notas', 'usar uma lista de notas', /\bnotas\s*=\s*\[[\s\S]*?\]/),
      criterioCodigo('funcao-media', 'calcular a média em uma função com retorno', /def\s+calcular_media\s*\([\s\S]*(?:sum\s*\(|\bfor\b)[\s\S]*return/),
      criterioCodigo('lista-vazia', 'tratar a lista vazia antes da divisão', /if\s+(?:not\s+notas|len\s*\(\s*notas\s*\)\s*==\s*0)/),
      criterioCodigo('limite-sete', 'decidir aprovação com média maior ou igual a 7', />=\s*7/),
      // O roteiro é literal: "Exibir as notas inseridas, a média e a situação do aluno". Um
      // relatório que mostra só a média e a situação atende dois terços do que foi pedido.
      // A análise apaga o conteúdo das strings para ninguém fingir código dentro de texto — mas
      // o relatório é justamente uma f-string, e as notas aparecem lá dentro. Aqui a busca é no
      // código sem comentários, porque o que se procura é uma linha que imprime, não uma que
      // simula imprimir.
      criterioEstrutural('relatorio', 'exibir as notas, a média e a situação no relatório', (analise, trabalho) => {
        const semComentarios = String(trabalho?.codigo || '')
          .split('\n').map((linha) => linha.replace(/#.*$/, '')).join('\n');
        return /print\s*\([\s\S]*(?:media|média)[\s\S]*(?:situacao|situação|aprovad|reprovad)/i.test(semComentarios)
          && /print\s*\([^)]*notas/i.test(semComentarios);
      }),
      // "Comente o código para explicar cada parte da lógica implementada" está nos
      // PROCEDIMENTOS e no CHECKLIST do roteiro, e é o que o professor lê primeiro.
      criterioEstrutural('comentarios', 'comentar o código explicando a lógica', (analise, trabalho) => {
        // Comentário no fim da linha conta igual ao de linha própria — é até o mais usado para
        // explicar o que aquela linha faz, que é o que o roteiro pede. Contar só os de linha
        // própria reprovava um código bem comentado.
        const comentarios = String(trabalho?.codigo || '').split('\n')
          .map((linha) => {
            const posicao = linha.indexOf('#');
            // Um "#" dentro de string não é comentário; contá-lo deixaria o critério enganável.
            if (posicao < 0 || /["'][^"']*$/.test(linha.slice(0, posicao))) return '';
            return linha.slice(posicao).replace(/^#+\s*/, '').trim();
          })
          .filter((conteudo) => conteudo.length >= 10
            // Os comentários que já vinham no esqueleto não contam: não foram escritos por ele.
            && !/^\d\.\s|^Construa\b|^Defina\b|^Escolha\b/i.test(conteudo));
        return comentarios.length >= 3;
      }),
      criterioTexto('explicacao-logica', 'explicar entrada, cálculo e decisão', 'logica', 60),
      criterioTexto('registro-testes', 'registrar os casos testados', 'testes', 40),
      criterioTexto('conclusao', 'escrever uma conclusão própria', 'conclusao', 30),
    ],
    // O contrato precisa estar escrito: sem ele, "faça o relatório" não diz o que a função
    // recebe nem o que devolve, e o estudante adivinha.
    contrato: 'calcular_media(notas) recebe uma lista de números e devolve a média. Devolver também a situação, como em (media, situacao), é aceito.',
    conferencias: [
      conferencia('media-correta', 'a média de [6, 7, 8, 9] é 7.5', 'u1-construir-funcao',
        'r = calcular_media([6, 7, 8, 9])\n'
        + 'm = r[0] if isinstance(r, (tuple, list)) else r\n'
        + 'ok = abs(float(m) - 7.5) < 0.01\n'
        + 'detalhe = "calcular_media([6, 7, 8, 9]) devolveu %r; a soma 6+7+8+9 e 30 e 30/4 e 7.5" % (m,)'),
      conferencia('media-outra-lista', 'a mesma função serve para outra lista', 'u1-construir-funcao',
        'r = calcular_media([10, 5])\n'
        + 'm = r[0] if isinstance(r, (tuple, list)) else r\n'
        + 'ok = abs(float(m) - 7.5) < 0.01\n'
        + 'detalhe = "calcular_media([10, 5]) devolveu %r; o esperado e 7.5" % (m,)'),
      conferencia('limite-aprovado', 'média exatamente 7 aprova', 'u1-construir-situacao',
        'ok = False\n'
        + 'detalhe = "nao encontrei a situacao para a media 7"\n'
        + 'r = calcular_media([7, 7])\n'
        + 'if isinstance(r, (tuple, list)) and len(r) > 1:\n'
        + '    ok = "aprov" in str(r[1]).lower()\n'
        + '    detalhe = "com media 7 a situacao veio %r; sete e o limite, entao aprova" % (r[1],)\n'
        + 'else:\n'
        + '    ok = True\n'
        + '    detalhe = "a funcao devolve so a media; a situacao e conferida pelo relatorio"'),
      conferencia('limite-reprovado', 'média abaixo de 7 reprova', 'u1-construir-situacao',
        'ok = False\n'
        + 'detalhe = "nao encontrei a situacao para uma media abaixo de 7"\n'
        + 'r = calcular_media([5, 6])\n'
        + 'if isinstance(r, (tuple, list)) and len(r) > 1:\n'
        + '    ok = "reprov" in str(r[1]).lower()\n'
        + '    detalhe = "com media 5.5 a situacao veio %r" % (r[1],)\n'
        + 'else:\n'
        + '    ok = True\n'
        + '    detalhe = "a funcao devolve so a media; a situacao e conferida pelo relatorio"'),
      conferencia('lista-vazia', 'a lista vazia não quebra o programa', 'u1-construir-funcao',
        'try:\n'
        + '    calcular_media([])\n'
        + '    ok = True\n'
        + '    detalhe = "a lista vazia foi tratada sem erro"\n'
        + 'except ZeroDivisionError:\n'
        + '    ok = False\n'
        + '    detalhe = "dividir por len([]) e dividir por zero; trate a lista vazia antes da divisao"'),
    ],
  }, passosU1),
  comPassos({
    id: 'entrega-u2',
    unidade: 'u2',
    titulo: 'Sistema de biblioteca',
    resumo: 'Modele Livro com título, autor, gênero e quantidade disponível, faça cadastro, listagem e busca e gere um gráfico com a quantidade por gênero.',
    minutos: 140,
    ambienteEntrega: 'pycampus',
    preRequisitos: ['u2a1', 'u2a2', 'u2a3', 'u2a4'],
    codigoInicial: 'class Livro:\n    def __init__(self, titulo, autor, genero, quantidade_disponivel):\n        self.titulo = titulo\n        self.autor = autor\n        self.genero = genero\n        self.quantidade_disponivel = quantidade_disponivel\n\nlivros = []\n',
    testesOrientados: ['cadastro de quatro livros', 'busca com maiúsculas diferentes', 'busca inexistente', 'dois livros no mesmo gênero'],
    entregaveis: ['notebook Colab com classe, funções, testes e gráfico', 'relatório PDF com resultado e explicação'],
    criterios: [
      // O roteiro nomeia os quatro atributos: título, autor, gênero e quantidade disponível.
      criterioCodigo('classe-livro', 'definir a classe Livro com os quatro atributos do roteiro', /class\s+Livro\b[\s\S]*self\.titulo[\s\S]*self\.autor[\s\S]*self\.genero[\s\S]*self\.quantidade_disponivel/),
      criterioCodigo('cadastro-livros', 'cadastrar objetos Livro em uma lista', /append\s*\(\s*Livro\s*\(/),
      criterioCodigo('busca-titulo', 'implementar busca por título', /def\s+buscar[\s\S]*\.titulo[\s\S]*\.lower\s*\(/),
      criterioCodigo('contagem-genero', 'agregar a quantidade por gênero', /\.get\s*\([\s\S]*genero|Counter\s*\(/),
      criterioEstrutural('grafico-genero', 'criar gráfico de barras por gênero', (analise) => (
        /\.bar\s*\(/.test(analise.executavel)
        || analise.strings.some((item) => (
          /^bar$/i.test(item.conteudo.trim())
          && /\.plot\s*\([^)]*kind\s*=\s*$/.test(analise.executavel.slice(Math.max(0, item.inicio - 140), item.inicio))
        ))
      )),
      criterioTexto('explicacao-logica', 'explicar classe, objetos e catálogo', 'logica', 60),
      criterioTexto('registro-testes', 'registrar os testes de cadastro e busca', 'testes', 40),
      criterioTexto('conclusao', 'escrever uma conclusão própria', 'conclusao', 30),
    ],
  }, passosU2),
  comPassos({
    id: 'entrega-u3',
    unidade: 'u3',
    titulo: 'Análise de vendas com SQLite e pandas',
    resumo: 'Crie a base SQLite vendas1 do roteiro, analise as vendas com pandas em df_vendas e comunique resultados em gráficos Matplotlib e insights.',
    minutos: 160,
    ambienteEntrega: 'pycampus',
    preRequisitos: ['u3a1', 'u3a2', 'u3a3', 'u3a4'],
    codigoInicial: 'import sqlite3\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Passo 1.1: Conectar ao banco de dados (ou criar, se nao existir)\nconexao = sqlite3.connect("dados_vendas.db")\n\n# Passo 1.2: Criar um cursor\ncursor = conexao.cursor()\n',
    testesOrientados: ['quatorze linhas em vendas1', 'valores de venda não negativos', 'total calculado', 'segunda execução sem duplicar vendas'],
    entregaveis: ['notebook Colab reproduzível com banco, análise e gráficos', 'relatório PDF com três análises e sugestões'],
    criterios: [
      criterioEstrutural('banco-sqlite', 'criar e consultar a tabela vendas1 do roteiro', (analise) => (
        /sqlite3\.connect\s*\(/.test(analise.executavel)
        && stringEmChamada(analise, /\.execute\s*\(\s*$/, /CREATE\s+TABLE\s+vendas1/i)
        && stringEmChamada(analise, /pd\.read_sql(?:_query)?\s*\(\s*$/, /SELECT[\s\S]*vendas1/i)
      )),
      criterioEstrutural('parametros-sql', 'inserir valores com parâmetros SQL', (analise) => (
        stringEmChamada(analise, /\.execute(?:many)?\s*\(\s*$/, /\?/)
      )),
      criterioCodigo('dataframe-pandas', 'carregar a consulta no DataFrame df_vendas', /df_vendas\s*=\s*pd\.read_sql(?:_query)?\s*\(/),
      // valor_venda só aparece como chave de coluna, ou seja, dentro de uma string — e o
      // verificador ignora strings de propósito. Por isso a coluna é conferida entre os
      // literais e a agregação continua sendo exigida no código que realmente executa.
      criterioEstrutural('analises', 'resumir valor_venda com ao menos uma agregação', (analise) => (
        analise.strings.some(({ conteudo }) => /valor_venda/i.test(conteudo))
        && /\b(?:groupby|sum|mean)\s*\(/.test(analise.executavel)
      )),
      criterioCodigo('graficos', 'gerar gráfico Matplotlib', /(?:plt\.|\.plot\s*\()/),
      criterioTexto('registro-testes', 'registrar testes e reexecução', 'testes', 50),
      criterioTexto('insights', 'escrever três insights da análise', 'insights', 100),
      criterioTexto('conclusao', 'concluir com sugestões para a empresa', 'conclusao', 50),
    ],
  }, passosU3),
  comPassos({
    id: 'entrega-u4',
    unidade: 'u4',
    titulo: 'Classificação de flores Iris',
    resumo: 'Prepare o conjunto Iris, divida treino e teste, faça normalização, treine uma rede TensorFlow e interprete avaliação e predição.',
    minutos: 180,
    ambienteEntrega: 'colab',
    avisoAmbiente: 'A preparação pode ser estudada no PyCampus, mas TensorFlow e scikit-learn devem ser executados no Google Colab.',
    praticaLocal: praticaLocalU4,
    preRequisitos: ['r4', 'u4a2', 'u4a3', 'u4a4'],
    codigoInicial: 'import tensorflow as tf\nfrom sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\n',
    testesOrientados: ['formas dos conjuntos de treino e teste', 'scaler ajustado somente no treino', 'avaliação em dados reservados', 'predição de três amostras'],
    entregaveis: ['notebook Google Colab executado com TensorFlow', 'relatório PDF com acurácia real, predições e limitações'],
    criterios: [
      criterioCodigo('dataset-iris', 'carregar o conjunto Iris', /load_iris\s*\(/),
      criterioCodigo('divisao-treino-teste', 'separar treino e teste de forma reproduzível', /train_test_split\s*\([\s\S]*random_state\s*=\s*42/),
      criterioCodigo('normalizacao', 'ajustar StandardScaler no treino e transformar o teste', /StandardScaler\s*\([\s\S]*fit_transform\s*\([\s\S]*transform\s*\(/),
      criterioCodigo('modelo-tensorflow', 'construir e treinar uma rede TensorFlow', /tf\.keras[\s\S]*Sequential[\s\S]*\.fit\s*\(/),
      criterioCodigo('avaliacao', 'avaliar o modelo nos dados de teste', /\.evaluate\s*\(/),
      criterioCodigo('predicao', 'gerar e interpretar uma predição', /\.predict\s*\([\s\S]*(?:argmax|np\.argmax)/),
      criterioExecucaoColab,
      criterioTexto('explicacao-logica', 'explicar o pipeline e suas limitações', 'logica', 100),
      criterioTexto('conclusao', 'concluir com a acurácia observada', 'conclusao', 50),
    ],
  }, passosU4),
];

for (const entrega of entregasDaFaculdade) {
  const fases = [...new Set(entrega.passos.map(({ fase }) => fase))];
  if (fases.join('|') !== FASES.join('|')) {
    throw new Error(`A entrega ${entrega.id} não percorre as cinco fases na ordem pedagógica.`);
  }
}

export const idsDasEntregasDaFaculdade = entregasDaFaculdade.map(({ id }) => id);

export const entregaDaFaculdade = (id) =>
  entregasDaFaculdade.find((entrega) => entrega.id === id) || null;

export const situacaoDosPreRequisitos = (entrega, state = {}) => {
  const feitos = new Set(state.faculdade?.feitas || []);
  return (entrega?.preRequisitos || []).map((id) => ({ id, concluido: feitos.has(id) }));
};

function normalizarRascunho(raw, entrega) {
  if (!entrega) return null;
  const trabalho = {
    passosConcluidos: idsValidos(raw?.passosConcluidos, entrega.passos),
  };
  for (const [campo, limite] of Object.entries(CAMPOS_TEXTO)) {
    trabalho[campo] = texto(raw?.[campo], limite);
  }
  for (const campo of CAMPOS_DATA) trabalho[campo] = dataValida(raw?.[campo]);
  trabalho.imagens = imagensValidas(raw?.imagens);
  trabalho.capturas = capturasValidas(raw?.capturas);
  trabalho.linkColab = enderecoValido(raw?.linkColab);
  return trabalho;
}

// A versão concluída é conservada para que experimentar no editor não retire uma conquista.
// Na restauração, validamos o conteúdo de novo: um booleano ou um número de XP não basta.
export function normalizarTrabalhoDaEntrega(raw, entrega) {
  if (!entrega) return null;
  const trabalho = normalizarRascunho(raw, entrega);
  const anterior = raw?.conquista ? normalizarRascunho(raw.conquista, entrega) : null;
  const conquista = trabalhoConcluidoDaEntrega(entrega, anterior) ? anterior
    : trabalhoConcluidoDaEntrega(entrega, trabalho) ? trabalho : null;
  if (conquista) {
    // Saídas gráficas já ficam no rascunho; a evidência de recompensa não duplica imagens.
    trabalho.conquista = { ...conquista, imagens: [], capturas: [] };
  }
  return trabalho;
}

export const trabalhoConcluidoDaEntrega = (entrega, trabalho) => Boolean(trabalho
  && dataValida(trabalho.concluidaEm)
  && entrega.passos.every(p => trabalho.passosConcluidos?.includes(p.id))
  && entregaProntaParaExportar(entrega, trabalho));

export function juntarTrabalhosDaEntrega(a, b, entrega) {
  const aqui = normalizarTrabalhoDaEntrega(a, entrega);
  const la = normalizarTrabalhoDaEntrega(b, entrega);
  if (!a && !b) return null;
  const unido = {
    passosConcluidos: [...new Set([...aqui.passosConcluidos, ...la.passosConcluidos])],
  };
  for (const campo of Object.keys(CAMPOS_TEXTO)) {
    unido[campo] = textoMaisLongo(aqui[campo], la[campo]);
  }
  for (const campo of CAMPOS_DATA) unido[campo] = dataMaisRecente(aqui[campo], la[campo]);
  // Os gráficos acompanham a execução mais recente, não se somam: juntar as figuras dos dois
  // aparelhos poria no PDF um gráfico que não corresponde à saída registrada.
  unido.imagens = la.imagens.length && la.executadaEm >= aqui.executadaEm ? la.imagens : aqui.imagens;
  // As capturas o estudante anexa a mao; juntar as dos dois aparelhos nao duplica trabalho.
  unido.capturas = capturasValidas([...aqui.capturas, ...la.capturas]);
  unido.linkColab = la.linkColab || aqui.linkColab;
  const conquista = aqui.conquista || la.conquista;
  if (conquista) unido.conquista = conquista;
  return unido;
}

export function atividadeDaEntregaValida(valor) {
  if (typeof valor !== 'string' || !valor.startsWith('faculdade-entrega:')) return false;
  const [, entregaId, passoId, sobra] = valor.split(':');
  if (sobra !== undefined) return false;
  const entrega = entregaDaFaculdade(entregaId);
  return Boolean(entrega?.passos.some(({ id }) => id === passoId));
}

export function requisitosFaltandoDaEntrega(entrega, trabalho = {}) {
  if (!entrega) return [];
  return entrega.criterios.filter((criterio) => !criterio.atende(trabalho));
}

export const entregaProntaParaExportar = (entrega, trabalho) =>
  Boolean(entrega) && requisitosFaltandoDaEntrega(entrega, trabalho).length === 0;

export const entregaLiberadaParaExportacao = (entrega, trabalho, state) => (
  entregaProntaParaExportar(entrega, trabalho)
  && situacaoDosPreRequisitos(entrega, state).every(({ concluido }) => concluido)
);
