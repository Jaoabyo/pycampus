// Dependencies name lessons that appear earlier, not estimated student mastery.
const paths = {
  ola: [[], 'Escrever uma chamada de print com aspas e parênteses.'],
  variaveis: [['ola'], 'Criar uma variável com = e acessar seu valor sem aspas.'],
  tipos: [['variaveis'], 'Distinguir texto de número, converter com int e consultar type, sem contas.'],
  operadores: [['variaveis', 'tipos'], 'Montar uma conta em etapas: valores, operação, resultado e print.'],
  strings: [['variaveis', 'tipos'], 'Chamar métodos com ponto e parênteses e guardar o texto retornado.'],
  entrada: [['tipos', 'strings'], 'Ler uma entrada real com input e converter o texto recebido.'],
  condicoes: [['tipos', 'operadores'], 'Escrever comparações e blocos if, elif e else na ordem correta.'],
  booleanos: [['condicoes'], 'Combinar duas condições que você já sabe escrever.'],
  for: [['operadores', 'condicoes'], 'Percorrer range e acompanhar a atualização de um acumulador.'],
  while: [['for'], 'Repetir enquanto uma condição for verdadeira e atualizar o controle.'],
  funcoes: [['operadores', 'condicoes'], 'Definir parâmetros, devolver um resultado e chamar a função.'],
  decomposicao: [['funcoes'], 'Dividir o cálculo de uma média em passos sem depender de listas.'],
  listas: [['for', 'decomposicao'], 'Criar uma lista, adicionar um elemento e somar seus valores.'],
  dicionarios: [['listas', 'variaveis'], 'Ler e atualizar um valor usando sua chave.'],
  conjuntos: [['listas'], 'Remover duplicatas e apresentar os valores em ordem previsível.'],
  comprehensions: [['listas', 'for', 'operadores'], 'Transformar um laço simples em uma compreensão de lista.'],
  ordenacao: [['listas', 'conjuntos', 'dicionarios'], 'Pedir uma ordenação decrescente com um argumento nomeado.'],
  complexidade: [['funcoes', 'listas', 'for'], 'Contar elementos em uma única passagem e explicar o crescimento do trabalho.'],
  classes: [['funcoes'], 'Definir uma classe, criar um objeto e chamar um método.'],
  construtor: [['classes'], 'Guardar um dado em self durante a inicialização do objeto.'],
  encapsulamento: [['construtor', 'condicoes'], 'Controlar uma atualização por um método e ler uma propriedade.'],
  heranca: [['classes', 'construtor'], 'Especializar um método herdado e observar o resultado.'],
  dataclasses: [['construtor'], 'Aprender a importação e a sintaxe dos campos antes de usar @dataclass.'],
  excecoes: [['tipos', 'condicoes', 'funcoes'], 'Colocar uma operação em try e tratar um erro específico com except.'],
  arquivos: [['excecoes', 'strings'], 'Abrir, escrever, fechar e ler um arquivo com with.'],
  json: [['arquivos', 'dicionarios', 'dataclasses'], 'Importar um módulo e converter texto JSON em dicionário.'],
  csv: [['json', 'for', 'dicionarios', 'tipos'], 'Ler linhas de CSV e converter uma coluna antes de acumulá-la.'],
  sql: [['conjuntos', 'json'], 'Criar uma tabela e usar parâmetros antes de consultar uma coluna.'],
  crud: [['sql'], 'Atualizar um registro com WHERE e parâmetros.'],
  transacoes: [['crud', 'arquivos'], 'Inserir registros em uma transação e consultar uma soma no banco.'],
  http: [['dicionarios'], 'Identificar o status de uma resposta, sem precisar iniciar um servidor.'],
  rest: [['http', 'funcoes', 'listas', 'dicionarios'], 'Buscar um recurso com um laço conhecido, sem geradores ainda.'],
  validacao: [['excecoes', 'rest'], 'Lançar e tratar ValueError para uma regra de entrada.'],
  autenticacao: [['booleanos', 'funcoes', 'validacao'], 'Aplicar a regra dono ou administrador; login é um passo adicional.'],
  paginacao: [['listas', 'operadores'], 'Aprender fatiamento e calcular os índices de uma página.'],
  servicos: [['rest', 'validacao', 'autenticacao'], 'Separar um serviço Python do servidor que o chamará.'],
  testes: [['funcoes', 'excecoes'], 'Escrever assert para comparar comportamento com resultado esperado.'],
  tipagem: [['funcoes', 'dataclasses'], 'Anotar os tipos de parâmetros e retorno sem confundir com validação.'],
  modulos: [['dataclasses', 'json'], 'Revisar importações e entender a separação das dependências do projeto.'],
  git: [['modulos', 'arquivos'], 'Identificar o comando de revisão de mudanças antes de usá-lo no terminal.'],
  logs: [['modulos', 'excecoes'], 'Configurar o formato fornecido e registrar uma mensagem de erro.'],
  arquitetura: [['funcoes', 'testes', 'servicos'], 'Manter um cálculo independente da interface e da persistência.'],
  geradores: [['funcoes', 'for', 'listas'], 'Trocar o retorno único por valores produzidos com yield.'],
  decoradores: [['funcoes', 'strings', 'dataclasses'], 'Entender o wrapper, os argumentos e o retorno antes de aplicar o decorador.'],
  async: [['funcoes', 'modulos', 'geradores'], 'Criar coroutines e aguardar os resultados com await e gather.'],
  analise: [['listas', 'modulos'], 'Usar median e explicar o que a medida representa.'],
  deploy: [['modulos', 'arquitetura'], 'Ler uma configuração de ambiente com um valor padrão.'],
  tcc: [['dicionarios', 'booleanos', 'testes', 'deploy'], 'Verificar requisitos com all e distinguir essa checagem da entrega do sistema.'],
};

// Each row explains actual syntax from the runnable example, in reading order.
const advanced = {
  classes: [
    [['class Saudacao:', 'class abre a definição. Saudacao é o nome escolhido e os dois-pontos iniciam o corpo.'], ['    def falar(self):\n        return "Olá!"', 'O método fica dentro da classe. self recebe o objeto automaticamente. return tem mais quatro espaços porque está dentro do método.'], ['print(Saudacao().falar())', 'Saudacao() cria um objeto. .falar() chama o método desse objeto. print mostra o texto devolvido.']],
    ['Defina class Aluno: e, dentro dela, def estudar(self):.', 'O método deve retornar o texto pedido. Fora da classe, crie o objeto, chame .estudar() e mostre o retorno.']
  ],
  construtor: [
    [['class Pessoa:', 'Define o modelo dos objetos Pessoa.'], ['    def __init__(self, nome):\n        self.nome = nome', '__init__ recebe o objeto em self e o argumento em nome. self.nome é o atributo guardado no objeto.'], ['print(Pessoa("Ana").nome)', 'Cria a pessoa com Ana e consulta seu atributo nome. O ponto acessa dados ou métodos do objeto.']],
    ['Dentro do construtor, associe nome a self.nome.', 'A linha final já cria Produto("Teclado") e mostra o atributo. Substitua somente pass.']
  ],
  encapsulamento: [
    [['self._saldo = 0', 'Cada conta começa com seu próprio saldo. O sublinhado sinaliza uso interno.'], ['if valor <= 0:\n            return False', 'Um depósito inválido sai do método sem mudar o saldo. O return pode encerrar cedo uma função.'], ['@property\n    def saldo(self):\n        return self._saldo', '@property permite ler a resposta do método como atributo: c.saldo, sem parênteses.'], ['c = Conta()\nc.depositar(20)\nprint(c.saldo)', 'Cria, altera pelo método e lê pela propriedade. O print mostra 20.']],
    ['Copie a definição da classe, até antes de c = Conta(). Crie sua conta abaixo dela.', 'Chame depositar duas vezes, com 50 e 25, e mostre conta.saldo. Não escreva saldo().']
  ],
  heranca: [
    [['class Gato(Animal):', 'Animal entre parênteses indica a classe base. Gato herda seus comportamentos.'], ['    def som(self):\n        return "Miau"', 'O mesmo nome som define a versão da subclasse, que será escolhida para objetos Gato.'], ['print(Gato().som())', 'Cria Gato, chama sua versão de som e mostra Miau.']],
    ['Escreva class Cachorro(Animal): abaixo da classe fornecida.', 'Dentro de Cachorro, defina som(self) retornando Au au. Fora da classe, imprima Cachorro().som().']
  ],
  dataclasses: [
    [['from dataclasses import dataclass', 'Importa um recurso pronto. O nome do módulo e o nome do recurso aparecem separados por import.'], ['@dataclass\nclass Item:', 'Aplica o recurso à classe. Ele cria um construtor usando os campos declarados.'], ['    nome: str\n    preco: float', 'Anota dois campos com nome: tipo. Essas anotações não fazem validação automática.'], ['print(Item("Livro", 30).nome)', 'O construtor recebe os campos na ordem declarada. O ponto consulta o atributo nome.']],
    ['Use @dataclass imediatamente antes de class Produto:. Declare os campos nome e preco com anotações.', 'Crie Produto("Mouse", 80) e imprima seu atributo preco.']
  ],
  excecoes: [
    [['try:\n    numero = int("abc")', 'try abre o bloco que pode falhar. int não consegue converter abc e lança ValueError.'], ['except ValueError:\n    print("Digite um número inteiro")', 'A execução pula para a resposta desse tipo de erro. except fica alinhado com try; seu corpo tem quatro espaços.'], ['valor = -1\ntry:\n    if valor <= 0:', 'A segunda parte confere uma regra nossa: aceitar apenas valores maiores que zero. O if fica dentro do try.'], ['        raise ValueError("Valor deve ser positivo")', 'raise provoca o erro de propósito, porque -1 não respeita a regra. A linha tem oito espaços: está dentro do if, que está dentro do try.'], ['    print(valor)\nexcept ValueError:\n    print("Valor deve ser positivo")', 'Com -1, o raise pula o print(valor) e vai para except. Com 10, não ocorre erro: print(valor) mostra 10 e o except não executa.']],
    ['Coloque a operação 10 / 0 dentro de try:.', 'Use except ZeroDivisionError: para esse erro específico e imprima Divisão inválida dentro do tratador.']
  ],
  arquivos: [
    [['with open("mensagem.txt", "w", encoding="utf-8") as arquivo:', 'open recebe caminho, modo e encoding. as dá um nome ao arquivo aberto. with fecha o recurso ao sair do bloco.'], ['    arquivo.write("Olá, Python!")', 'Escreve o texto no arquivo aberto para escrita. O modo w substitui o conteúdo anterior.'], ['with open("mensagem.txt", encoding="utf-8") as arquivo:\n    print(arquivo.read())', 'Abre novamente, agora para leitura, que é o padrão. read lê o conteúdo e print o exibe.']],
    ['No primeiro with, abra meta.txt no modo w e escreva o texto pedido.', 'No segundo with, abra o mesmo caminho para leitura e imprima arquivo.read().']
  ],
  json: [
    [['import json', 'Disponibiliza o módulo. Suas funções serão acessadas com json. antes do nome.'], ['dados = json.loads(\'{"nome": "Ana", "nivel": 2}\')', 'Aspas simples delimitam a string Python; as duplas dentro dela pertencem ao JSON. loads transforma o texto em dicionário.'], ['print(dados["nome"])', 'Depois da conversão, o acesso por chave é o mesmo que você já conhece.']],
    ['Guarde json.loads(texto) em dados.', 'Acesse dados["linguagem"] e mostre o valor. Não é necessário alterar o texto JSON manualmente.']
  ],
  csv: [
    [['import csv\nimport io', 'Importa o leitor de CSV e a ferramenta de arquivo em memória.'], ['arquivo = io.StringIO("nome,nota\\nAna,9\\nBia,8")', 'StringIO faz o texto se comportar como arquivo. Cada \\n representa uma quebra de linha.'], ['for linha in csv.DictReader(arquivo):\n    print(linha["nome"])', 'DictReader usa o cabeçalho como chaves. O for recebe um dicionário por linha.']],
    ['Comece total = 0. Percorra csv.DictReader(arquivo) em um for.', 'Converta linha["valor"] com int e some ao total. Mostre total somente depois do laço.']
  ],
  sql: [
    [['con = sqlite3.connect(":memory:")', 'Abre um banco temporário e guarda a conexão em con.'], ['con.execute("CREATE TABLE alunos (nome TEXT)")', 'SQL cria uma tabela chamada alunos com uma coluna textual chamada nome.'], ['con.execute("INSERT INTO alunos VALUES (?)", ("Ana",))', '? recebe o valor separado. ("Ana",) é uma tupla de um elemento, reconhecida pela vírgula.'], ['print(con.execute("SELECT nome FROM alunos").fetchone()[0])', 'SELECT consulta; fetchone pega uma linha; [0] pega sua primeira coluna. print mostra Ana.']],
    ['Siga os mesmos três comandos: CREATE TABLE produtos (nome TEXT), INSERT com ? e SELECT nome FROM produtos.', 'Passe ("Livro",) como parâmetros da inserção. Extraia a coluna com fetchone()[0] e feche a conexão depois.']
  ],
  crud: [
    [['con.execute("INSERT INTO tarefas VALUES (?, ?)", (1, "Estudar"))', 'Insere id e título na ordem dos placeholders.'], ['con.execute("UPDATE tarefas SET titulo = ? WHERE id = ?", ("Praticar", 1))', 'SET define a coluna alterada. WHERE restringe o registro. Os argumentos continuam separados do SQL.'], ['consulta = con.execute("SELECT titulo FROM tarefas WHERE id = ?", (1,))', 'Consulta o registro pelo mesmo identificador. O retorno é um cursor, não o valor final.'], ['print(consulta.fetchone()[0])', 'fetchone() devolve a primeira linha como tupla; [0] pega a primeira coluna dela, o título.']],
    ['Crie produtos com id INTEGER e estoque INTEGER. Insira (1, 10) com parâmetros.', 'Atualize estoque para 15 com WHERE id = 1 usando placeholders; consulte estoque e extraia a primeira coluna.']
  ],
  transacoes: [
    [['with con:', 'Agrupa alterações: confirma se o bloco terminar com sucesso e desfaz se houver uma exceção. Não fecha a conexão.'], ['    con.executemany("INSERT INTO vendas VALUES (?)", [(10,), (20,)])', 'Executa a mesma inserção para cada tupla da lista. Cada tupla fornece uma linha.'], ['print(con.execute("SELECT SUM(valor) FROM vendas").fetchone()[0])', 'SUM é uma função de SQL que soma a coluna. O resultado consultado aqui é 30.']],
    ['Crie uma tabela com coluna valor INTEGER e use as tuplas (25,), (50,) e (75,) para as inserções.', 'Consulte SELECT SUM(valor) FROM sua_tabela e imprima fetchone()[0]. Feche a conexão após a consulta.']
  ],
  http: [
    [['resposta = {"status": 200, "body": {"mensagem": "Olá, web!"}}', 'Um dicionário externo contém outro em body. O número representa o status; o corpo contém os dados.'], ['print(resposta["body"]["mensagem"])', 'O primeiro acesso obtém o dicionário body. O segundo obtém mensagem dentro dele.']],
    ['Crie resposta = {"status": 201}.', 'Mostre resposta["status"]. Este exercício modela dados de resposta, sem realizar uma requisição.']
  ],
  rest: [
    [['for tarefa in tarefas:\n        if tarefa["id"] == tarefa_id:\n            return tarefa', 'Percorre a coleção, compara o identificador e devolve o recurso quando encontra.'], ['    return None', 'Se terminou o laço sem encontrar, devolve None para representar ausência.'], ['print(buscar_tarefa(1)["titulo"])', 'Chama a busca e acessa o título do recurso encontrado. Antes de acessar em um programa real, trate o caso None.']],
    ['Defina buscar_tarefa(tarefa_id), percorra tarefas e compare tarefa["id"] com tarefa_id.', 'Devolva a tarefa encontrada. Fora da função, chame com 2 e imprima a chave titulo.']
  ],
  validacao: [
    [['if not isinstance(nome, str) or not nome.strip():', 'isinstance verifica o tipo. Um texto vazio é falso. or rejeita tipo inválido ou texto que ficou vazio; o curto-circuito evita chamar strip em um tipo inválido.'], ['        raise ValueError("Nome obrigatório")', 'raise interrompe o fluxo normal com uma exceção e uma mensagem.'], ['    return nome.strip()', 'Só devolve o texto limpo se a validação passou.']],
    ['Dentro de validar_preco, teste preco < 0 e lance ValueError.', 'Chame validar_preco(-5) dentro de try e capture ValueError com a mensagem pedida.']
  ],
  autenticacao: [
    [['def pode_editar(usuario_id, dono_id, admin=False):', 'O terceiro parâmetro tem valor padrão. Se for omitido, fica False.'], ['    return usuario_id == dono_id or admin', 'Permite se os identificadores são iguais ou se admin é verdadeiro.'], ['print(pode_editar(3, 3))', 'Como o usuário é o dono, retorna True mesmo sem administrador.']],
    ['Combine usuario_id == dono_id com admin usando or.', 'Não use and: isso exigiria que a pessoa fosse dona e administradora ao mesmo tempo.']
  ],
  paginacao: [
    [['inicio = (pagina - 1) * tamanho', 'Converte a página, que começa em 1, para o índice inicial, que começa em 0.'], ['fim = inicio + tamanho', 'Calcula o índice final exclusivo.'], ['print(itens[inicio:fim])', 'O fatiamento inclui inicio e para antes de fim. Para página 2 e tamanho 3, os valores são [4, 5, 6].']],
    ['Para página 3 e tamanho 2, calcule inicio = (pagina - 1) * tamanho.', 'Use itens[inicio:inicio + tamanho]. O segundo limite não é incluído.']
  ],
  servicos: [
    [['def verificar_saude():\n    return {"status": "ok"}', 'A função devolve dados sem conhecer o protocolo HTTP. Isso permite chamá-la e testá-la diretamente.'], ['print(verificar_saude()["status"])', 'O serviço devolve um dicionário. A consulta da chave status usa a mesma sintaxe estudada antes.']],
    ['Em criar_tarefa, devolva um dicionário com as chaves titulo e concluida.', 'Use o parâmetro titulo como valor e o booleano False sem aspas. Não é necessário iniciar FastAPI neste exercício.']
  ],
  testes: [
    [['assert somar(2, 3) == 5', 'assert avalia a comparação. Se for falsa, gera AssertionError; se for verdadeira, continua.'], ['assert somar(-1, 1) == 0\nprint("Testes passaram")', 'Verifica outro caso antes de mostrar a mensagem. Se um assert falhasse, não chegaria ao print.']],
    ['Implemente dobro com return numero * 2 e faça os dois asserts pedidos.', 'Deixe a mensagem final depois dos asserts, fora da função. Testes devem verificar resultados, não apenas imprimir sucesso.']
  ],
  tipagem: [
    [['def saudacao(nome: str) -> str:', 'nome: str anota o parâmetro. -> str anota o retorno. O : final ainda abre o corpo.'], ['    return f"Olá, {nome}"', 'A f-string substitui o valor de nome. As anotações não alteram a execução desta linha.']],
    ['Anote a: int e b: int nos parâmetros e -> int antes dos dois-pontos finais.', 'No corpo, retorne a + b. Fora dele, imprima a chamada solicitada.']
  ],
  modulos: [
    [['from math import sqrt', 'Disponibiliza somente sqrt do módulo math. Com essa forma, a chamada não precisa de math. antes do nome.'], ['print(sqrt(81))', 'sqrt calcula a raiz quadrada. A chamada devolve 9.0. No desafio, você importará uma função diferente do mesmo módulo.']],
    ['Troque sqrt por factorial na importação de math.', 'factorial(5) calcula 1 * 2 * 3 * 4 * 5. Mostre o retorno da chamada.']
  ],
  git: [
    [['comando = "git status"', 'As aspas fazem disso um texto. Guardar um comando não o executa no terminal.'], ['print(comando)', 'Mostra o comando para revisão. O uso real de Git acontece fora do laboratório Python.']],
    ['O comando que mostra diferenças é git diff. Guarde-o como texto.', 'Use print(comando). Não digite git diff como se fosse uma instrução Python.']
  ],
  logs: [
    [['logging.basicConfig(level=logging.INFO, format="%(message)s", force=True)', 'Define quais mensagens aparecem e como são exibidas. O formato fornecido mostra só o texto da mensagem.'], ['logging.info("Processamento iniciado")', 'Registra a mensagem no nível INFO. Para uma falha, use logging.error com a mesma sintaxe de chamada.']],
    ['A configuração já está pronta no código inicial. Escreva logging.error com a mensagem entre aspas.', 'Não precisa montar um dicionário nem usar print neste desafio.']
  ],
  arquitetura: [
    [['def total_com_desconto(subtotal, taxa):\n    return subtotal * (1 - taxa)', 'A função só calcula. taxa deve ser uma fração: 0.1 representa 10%. Não depende de tela, HTTP ou banco.'], ['print(total_com_desconto(100, 0.1))', 'A apresentação fica fora da regra. O resultado é 90.0.']],
    ['Calcule subtotal * (1 - taxa) e devolva o resultado.', 'Para 0.25, a parte que será paga é 0.75 do subtotal. O print da chamada já está fornecido.']
  ],
  geradores: [
    [['def contagem(limite):\n    for n in range(limite):\n        yield n', 'yield entrega um valor e pausa. A próxima solicitação continua de onde parou no for.'], ['print(list(contagem(3)))', 'list consome os valores produzidos e monta [0, 1, 2]. A lista é criada só aqui.']],
    ['Dentro de pares, percorra range(3) e use yield n * 2.', 'O print(list(pares())) já vai consumir o gerador. Não use return com apenas um valor.']
  ],
  decoradores: [
    [['def maiusculo(func):', 'Recebe uma função como argumento, sem chamá-la ainda.'], ['    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs).upper()', 'A função interna chama a original, encaminha argumentos e transforma o texto retornado.'], ['    return wrapper', 'Devolve a função interna, sem parênteses: ela ainda será chamada depois.'], ['@maiusculo\ndef ola():\n    return "olá"', 'Aplica a transformação à função definida logo abaixo. wraps, do exemplo completo, preserva seus metadados.']],
    ['Reutilize a estrutura do decorador do exemplo. A função decorada deve retornar python.', 'Chame a função decorada dentro de print. O wrapper transforma o retorno em PYTHON.']
  ],
  async: [
    [['async def dobro(n):\n    await asyncio.sleep(0.01)\n    return n * 2', 'async cria uma coroutine. await aguarda a operação assíncrona; depois a função devolve o cálculo.'], ['print(await asyncio.gather(dobro(2), dobro(3)))', 'gather reúne as chamadas. await recebe os resultados [4, 6] na ordem das chamadas.']],
    ['Defina async def quadrado(n): e retorne n * n.', 'Use await asyncio.gather(quadrado(3), quadrado(4)) e imprima a lista. Aqui o laboratório permite await no nível superior.']
  ],
  analise: [
    [['from statistics import mean, median', 'A vírgula permite importar dois recursos do mesmo módulo.'], ['valores = [10, 12, 13, 100]\nprint(mean(valores))\nprint(median(valores))', 'mean mostra 33.75. median usa os valores centrais 12 e 13 e mostra 12.5. São medidas diferentes sobre a mesma lista.']],
    ['Chame median passando valores como argumento.', 'A lista tem cinco números. Depois de ordenar, o terceiro é o valor central. Confira a previsão antes de executar.']
  ],
  deploy: [
    [['import os', 'Disponibiliza funções relacionadas ao ambiente de execução.'], ['ambiente = os.getenv("APP_ENV", "desenvolvimento")', 'O primeiro argumento é o nome buscado; o segundo é o valor usado se ele não existir.'], ['print(ambiente)', 'Mostra o valor efetivo. Uma configuração de produção deve ser fornecida pelo ambiente, não fixada no código.']],
    ['Use os.getenv com o nome PYCAMPUS_MODO e o padrão local.', 'Guarde ou imprima o retorno. Não crie essa variável de ambiente antes de testá-la.']
  ],
  tcc: [
    [['requisitos = {"cadastro": True, "testes": True, "documentacao": False}', 'Cada chave identifica um critério e cada booleano informa se foi atendido.'], ['print(all(requisitos.values()))', 'values fornece os valores; all verifica todos. Como há um False, o exemplo mostra False. Isso só verifica os valores declarados.']],
    ['Use requisitos.values() para obter os booleanos do dicionário.', 'Passe esses valores para all e mostre o resultado. No desafio, os três estão True.']
  ],
};

export function attachLessonGuides(all) {
  for (const [id, [prerequisites, objective]] of Object.entries(paths)) {
    const lesson = all[id];
    if (!lesson) throw new Error(`Missing lesson ${id}`);
    lesson.prerequisites = prerequisites;
    lesson.objective = objective;
    lesson.revision = 2;
    if (advanced[id]) {
      lesson.walkthrough = advanced[id][0].map(([code, explanation]) => ({ code, explanation }));
      lesson.hints = advanced[id][1];
    }
  }
}
