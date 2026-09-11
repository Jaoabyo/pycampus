// Plain-language introductions. The full explanation remains available below.
export const simpleExplanations = {
  ola: ['Vamos pedir ao computador para mostrar uma mensagem.', 'print("Olá!") significa: mostre Olá! na tela. Escreva a mensagem entre aspas, dentro dos parênteses.'],
  variaveis: ['Pense em uma variável como um nome para lembrar uma informação.', 'nome = "Ana" guarda o texto Ana com o nome nome. Depois, print(nome) mostra Ana. Leia = como “recebe”.'],
  tipos: ['Compare "21" e 21. Com aspas, Python lê um texto. Sem aspas, lê um número.', 'int(texto) transforma um texto como "21" no número 21. print mostra o valor na tela.'],
  operadores: ['Imagine comprar dois produtos de 10 reais. A conta é 2 vezes 10.', 'Em Python, vezes se escreve *. Então 2 * 10 dá 20. Use + para somar, - para tirar e / para dividir.'],
  strings: ['Um texto pode ter letras, números e espaços. Em Python, ele também é chamado de string.', 'texto.strip() tira os espaços das pontas. texto.upper() deixa as letras maiúsculas e texto.lower() deixa todas minúsculas — útil para comparar respostas sem se importar com maiúsculas. Os parênteses fazem a ação acontecer.'],
  entrada: ['Até aqui, você escreveu os valores no código. Agora, o programa vai fazer uma pergunta e esperar sua resposta.', 'texto = input("Qual é sua idade? ") mostra a pergunta e guarda o que você responder como texto. Para fazer uma conta com a idade, use numero = int(texto) na próxima linha.'],
  condicoes: ['if quer dizer “se”. elif quer dizer “senão, se”. else quer dizer “senão”.', 'Python verifica na ordem e escolhe o primeiro caso verdadeiro. Os espaços no começo da linha mostram o que fazer naquele caso.'],
  booleanos: ['Às vezes, uma decisão depende de duas coisas: ter idade suficiente e ter ingresso.', 'and exige as duas. or aceita pelo menos uma. True significa verdadeiro; False significa falso.'],
  for: ['Quer repetir uma ação várias vezes? Use for.', 'range(1, 4) fornece 1, 2 e 3. O 4 fica de fora. A linha com espaços no início será repetida para cada número.'],
  while: ['while significa “enquanto”. Repita uma ação enquanto a condição for verdadeira.', 'Uma contagem pode continuar enquanto o número for maior que zero. Mude o número a cada volta para a repetição terminar.'],
  funcoes: ['Uma função reúne passos que você quer usar de novo. Pense em uma receita com um nome.', 'def cria a receita. Chamar a função faz os passos acontecerem. return entrega o resultado; print mostra algo na tela.'],
  decomposicao: ['Um problema grande fica mais fácil quando você faz uma parte por vez.', 'Para uma média: primeiro some as notas, depois divida pela quantidade de notas. Só então mostre a resposta.'],
  listas: ['Uma lista guarda vários valores juntos, como uma lista de compras.', 'Os valores ficam entre [ e ]. A primeira posição é 0. append acrescenta um valor no final.'],
  dicionarios: ['Pense em uma ficha de produto: nome, preço e estoque.', 'Um dicionário guarda cada informação com uma identificação. produto["estoque"] busca o valor do estoque.'],
  conjuntos: ['Um conjunto guarda valores sem repetição. Serve, por exemplo, para descobrir quais números diferentes você tem.', 'set(numeros) remove as repetições. Já uma tupla guarda uma sequência que não pode ser alterada depois de criada.'],
  comprehensions: ['Você já sabe repetir com for. Agora vamos usar essa repetição para montar uma lista.', 'Para cada número, fazemos uma conta e guardamos a resposta na lista. Leia o exemplo por partes.'],
  ordenacao: ['Ordenar é colocar os valores em uma ordem, como preços do menor para o maior.', 'sorted(precos) faz isso. Com reverse=True, a ordem muda: do maior para o menor.'],
  complexidade: ['Para achar um nome em uma lista, talvez você precise olhar vários nomes.', 'Vamos observar quantos passos o programa precisa fazer quando a lista cresce.'],
  classes: ['Um sistema pode ter vários alunos, cada um com seu nome e suas notas.', 'Uma classe define o modelo de aluno. Cada aluno criado a partir desse modelo é um objeto.'],
  construtor: ['Ao criar uma conta, você precisa guardar informações como o titular e o saldo.', '__init__ prepara essas informações quando o objeto é criado. self indica o próprio objeto.'],
  encapsulamento: ['Uma conta precisa de regras: um depósito negativo, por exemplo, não deve mudar o saldo.', 'Vamos colocar a regra junto da ação para conferir o valor antes de guardar a mudança.'],
  heranca: ['Dois tipos de conta podem compartilhar algumas ações e ter outras diferentes.', 'A herança permite reaproveitar o que eles têm em comum. Cada tipo ainda pode ter seu próprio comportamento.'],
  dataclasses: ['Algumas classes servem principalmente para guardar informações, como nome e preço.', 'Uma dataclass escreve parte desse trabalho repetitivo para você. Vamos ver o que ela prepara no exemplo.'],
  excecoes: ['Nem toda entrada funciona: o texto "abc" não pode virar um número inteiro.', 'try reúne a ação que pode falhar. except diz como responder a um erro específico. Quando uma regra sua não é respeitada, raise avisa o erro para que ele também possa ser tratado.'],
  arquivos: ['Quer guardar uma informação para ler depois? Você pode escrever em um arquivo.', 'Vamos abrir o arquivo, usar seu conteúdo e fechá-lo. O bloco with cuida do fechamento.'],
  json: ['Dois programas precisam de uma forma combinada de trocar informações.', 'JSON é uma dessas formas. Vamos transformar dados Python em texto JSON e ler esse texto de volta.'],
  csv: ['Imagine uma planilha com uma linha por produto e colunas para nome e preço.', 'Um arquivo CSV guarda essa tabela em texto. Vamos ler uma linha de cada vez.'],
  sql: ['Um banco de dados guarda informações organizadas em tabelas.', 'SQL é a linguagem usada para pedir ações ao banco, como guardar um produto ou buscar seu nome.'],
  crud: ['Um cadastro costuma precisar de quatro ações: criar, consultar, atualizar e apagar.', 'CRUD é só uma abreviação dessas ações. Vamos praticá-las no banco de dados.'],
  transacoes: ['Uma transferência tira dinheiro de uma conta e coloca em outra. As duas mudanças precisam dar certo juntas.', 'Uma transação reúne mudanças: elas são confirmadas juntas ou desfeitas se ocorrer um erro.'],
  http: ['Quando você abre uma página, seu navegador faz um pedido a outro computador.', 'HTTP define como esse pedido e a resposta são enviados. Um código como 404 informa que algo não foi encontrado.'],
  rest: ['Uma API permite que um programa peça informações ou ações a outro.', 'Pense em pedidos como “buscar o hábito 3” ou “criar um hábito”. Vamos organizar essas ações.'],
  validacao: ['Antes de guardar um cadastro, confira se os dados fazem sentido.', 'Um nome vazio ou uma idade em texto podem precisar de correção. Validar é conferir essas regras.'],
  autenticacao: ['Primeiro, descubra quem está usando o sistema. Depois, confira o que essa pessoa pode fazer.', 'Entrar na conta e ter permissão para apagar um registro são verificações diferentes.'],
  paginacao: ['Uma lista com mil resultados é difícil de mostrar de uma vez.', 'Paginar é entregar uma parte por vez. Filtrar é escolher apenas os resultados que atendem a uma condição.'],
  servicos: ['Uma ação, como cadastrar um hábito, pode funcionar primeiro como uma função Python.', 'Depois, o servidor recebe pedidos e chama essa função. Vamos entender essa ligação.'],
  testes: ['Você pode escrever uma verificação para conferir se uma função entrega a resposta esperada.', 'assert compara o que aconteceu com o que deveria acontecer. Se a condição for falsa, a verificação falha.'],
  tipagem: ['Uma função fica mais fácil de usar quando diz que tipo de informação espera receber.', 'Anotações como int e str documentam isso. Elas não convertem os valores nem impedem erros sozinhas.'],
  modulos: ['Você não precisa colocar todo o programa no mesmo arquivo.', 'import permite usar código de outro módulo. Um ambiente virtual separa os pacotes usados por cada projeto.'],
  git: ['Imagine salvar versões do projeto para conseguir consultar o que mudou.', 'Git guarda esse histórico. git diff mostra as diferenças que você fez nos arquivos.'],
  logs: ['Quando algo dá errado, ajuda ter um registro do que o programa estava fazendo.', 'Logs são essas mensagens. Podemos indicar se uma mensagem é uma informação, um aviso ou um erro.'],
  arquitetura: ['Em um sistema, ler dados, fazer contas e mostrar respostas são tarefas diferentes.', 'Separar essas tarefas facilita mudar uma parte sem precisar reescrever tudo.'],
  geradores: ['Você nem sempre precisa preparar todos os resultados de uma vez.', 'Um gerador entrega um valor por vez. yield entrega o valor atual e permite continuar dali no próximo pedido.'],
  decoradores: ['Às vezes, você quer acrescentar uma ação antes ou depois de uma função.', 'Um decorador envolve a função com esse comportamento. Vamos acompanhar primeiro a função por dentro.'],
  async: ['Enquanto um pedido espera uma resposta, o programa pode adiantar outra tarefa.', 'async e await ajudam a organizar essas esperas. Isso não faz toda conta pesada ficar mais rápida.'],
  analise: ['Uma lista de números pode responder perguntas: qual é a média? Qual valor fica no meio?', 'Vamos calcular essas medidas e entender o que cada resposta diz sobre os dados.'],
  deploy: ['Um programa precisa de instruções e configurações para funcionar em outro ambiente.', 'Vamos separar as configurações do código e conferir o que é necessário para executar a entrega.'],
  tcc: ['Agora você vai juntar o que aprendeu para resolver um problema completo.', 'Escolha uma primeira versão pequena. Faça uma ação funcionar, teste e só então acrescente a próxima.']
};

export const beginnerNotes = {
  tipos: [
    ['str', 'Texto: "Ana" ou "21". Repare nas aspas.'],
    ['int', 'Número inteiro: 21. Aqui não há aspas.'],
    ['float', 'Número com casas decimais: 7.5. Use ponto.'],
    ['bool', 'Verdadeiro ou falso: True ou False, sem aspas.'],
    ['type(numero)', 'Pergunta ao Python: que tipo de valor está em numero?'],
    ["<class 'int'>", 'Essa resposta só quer dizer: é um número inteiro. Você não precisa escrever class.']
  ],
  entrada: [
    ['input("Sua renda: ")', 'O texto dentro dos parênteses é a pergunta que aparece na tela. Não é a resposta: quem responde é você, digitando.'],
    ['str', 'input() sempre devolve texto, mesmo quando você digita 3000. Sem converter, "3000" não serve para contas.'],
    ['float(input("Renda: "))', 'Primeiro input() lê o que foi digitado; depois float() transforma esse texto em número. Tudo isso em uma única atribuição.'],
    ['ler e converter', 'Neste exercício, use uma linha para receber o texto e outra para convertê-lo. Não escreva renda = input(...) = float(...): o resultado de uma chamada não pode ser o lugar onde você guarda um valor.']
  ],
  while: [
    ['break', 'Encerra o laço na hora, mesmo que a condição ainda seja verdadeira.'],
    ['continue', 'Pula o resto desta volta e segue para a próxima repetição.'],
    ['numero = numero - 1', 'A variável de controle precisa caminhar para a condição ficar falsa. Sem isso, o laço não termina.']
  ],
  comprehensions: [
    ['[n * 2 for n in range(4)]', 'Leia primeiro o for: n passa por 0, 1, 2 e 3. A expressão da esquerda transforma cada valor. Resultado: [0, 2, 4, 6].'],
    ['range(1, 5)', 'Começa em 1 e para antes do 5: devolve 1, 2, 3 e 4. O segundo número fica de fora.'],
    ['[n * 2 for n in range(4) if n > 1]', 'O if no fim filtra: só entram os valores que passam no teste. Aqui o resultado é [4, 6].']
  ],
  transacoes: [
    ['con.executemany(comando, valores)', 'Roda o mesmo comando uma vez para cada item da lista de valores.'],
    ['SUM(valor)', 'Função do próprio SQL: soma a coluna e devolve um único resultado.'],
    ['commit', 'Confirma as mudanças pendentes: a partir daí elas valem no banco.'],
    ['rollback', 'Desfaz as mudanças ainda não confirmadas, voltando ao estado anterior.']
  ],
  tipagem: [
    ['def dobro(n: int) -> int', 'A anotação diz o que se espera: n é inteiro e a função devolve inteiro.'],
    ['type hint', 'É documentação da intenção. O Python não converte o valor nem bloqueia outro tipo por causa dela.']
  ],
  listas: [
    ['[10, 20]', 'Os colchetes criam a lista. As vírgulas separam os valores.'],
    ['numeros.append(30)', 'Acrescenta 30 no fim da lista. A própria lista muda; não escreva numeros = numeros.append(30).'],
    ['sum(numeros)', 'Soma todos os números da lista de uma vez e devolve o total. sum([10, 20, 30]) devolve 60.'],
    ['len(numeros)', 'Conta quantos itens existem na lista. len([10, 20, 30]) devolve 3.'],
    ['numeros.pop(0)', 'Tira da lista o item daquela posição. Em [10, 20, 30], pop(0) tira o 10 e a lista fica [20, 30].']
  ],
  conjuntos: [
    ['set(numeros)', 'Cria um conjunto a partir da lista, descartando os valores repetidos.'],
    ['sorted(valores)', 'Devolve uma lista nova com os valores em ordem crescente. O original não muda.'],
    ['a & b', 'Interseção: fica só o que aparece nos dois conjuntos.']
  ],
  arquivos: [
    ['open("nota.txt", "w", encoding="utf-8")', 'Abre o arquivo. Com "w" você escreve do zero; sem o "w" apenas lê. O encoding cuida dos acentos.'],
    ['arquivo.write(texto)', 'Escreve o texto dentro do arquivo aberto.'],
    ['arquivo.read()', 'Lê todo o conteúdo do arquivo e devolve como texto.'],
    ['with', 'Garante que o arquivo é fechado no fim do bloco, mesmo se algo der errado.']
  ],
  json: [
    ['json.dumps(ficha)', 'Transforma o dicionário Python em um texto no formato JSON.'],
    ['json.loads(texto)', 'Faz o caminho inverso: lê o texto JSON e devolve o dicionário.']
  ],
  csv: [
    ['io.StringIO(texto)', 'Cria um arquivo de texto na memória, para praticar leitura de CSV sem depender de um arquivo no disco.'],
    ['csv.DictReader(arquivo)', 'Lê o CSV usando a primeira linha como nome das colunas. Cada linha vira um dicionário.'],
    ['linha["valor"]', 'Busca a coluna pelo nome. O valor vem como texto: use int() ou float() para calcular.']
  ],
  sql: [
    ['sqlite3.connect(":memory:")', 'Abre a conexão com o banco. ":memory:" cria um banco temporário, que desaparece quando você fecha.'],
    ['con.execute(comando)', 'Envia um comando SQL para o banco.'],
    ['fetchone()', 'Traz a primeira linha do resultado como uma tupla. O [0] pega a primeira coluna dessa linha.'],
    ['con.close()', 'Fecha a conexão quando o trabalho termina.']
  ],
  excecoes: [
    ['except ValueError:', 'Captura esse erro específico, quando ele acontece dentro do try. O programa não para; ele executa o bloco de resposta.'],
    ['raise ValueError("Valor deve ser positivo")', 'Cria esse erro com a mensagem escolhida e o lança. raise interrompe o caminho normal ali mesmo; um except ValueError mais acima pode tratá-lo.']
  ],
  validacao: [
    ['isinstance(nome, str)', 'Responde se o valor é daquele tipo. Devolve True quando nome é texto.'],
    ['ValueError("Nome obrigatório")', 'Cria o erro que indica valor inválido. Com raise, ele interrompe a função com essa mensagem.'],
    ['not nome.strip()', 'Verdadeiro quando o texto fica vazio depois de remover os espaços.']
  ],
  modulos: [
    ['from math import sqrt', 'Pega uma função pronta do módulo math. Depois você usa sqrt direto, sem escrever math.'],
    ['sqrt(81)', 'Calcula a raiz quadrada: devolve 9.0.']
  ],
  logs: [
    ['logging.basicConfig(level=logging.INFO, force=True)', 'Configura o registro: define o nível mínimo que aparece e refaz a configuração se já existia uma.'],
    ['logging.info(mensagem)', 'Registra um acontecimento normal. logging.error registra uma falha.']
  ],
  decoradores: [
    ['from functools import wraps', 'Traz o wraps, que preserva o nome e a documentação da função original.'],
    ['@wraps(func)', 'Aplicado ao wrapper, mantém a identidade da função decorada.'],
    ['*args, **kwargs', 'Recebem quaisquer argumentos e os repassam para a função original, sem precisar listá-los.']
  ],
  async: [
    ['asyncio.sleep(0.01)', 'Espera esse tempo sem travar o restante do programa. É a pausa da versão assíncrona.'],
    ['asyncio.gather(a, b)', 'Executa várias coroutines ao mesmo tempo e devolve a lista dos resultados na ordem em que foram passadas.']
  ],
  analise: [
    ['mean(valores)', 'Média: soma os valores e divide pela quantidade. Um valor muito alto distorce o resultado.'],
    ['median(valores)', 'Mediana: o valor do meio depois de ordenar. Sofre menos com valores extremos.']
  ],
  deploy: [
    ['os.getenv("APP_ENV", "desenvolvimento")', 'Lê uma variável de ambiente. O segundo valor é o padrão usado quando ela não existe.']
  ],
  tcc: [
    ['requisitos.values()', 'Devolve apenas os valores do dicionário, sem as chaves.'],
    ['all(valores)', 'Devolve True somente quando todos os valores são verdadeiros.']
  ]
};
