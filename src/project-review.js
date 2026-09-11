export function applyProjectReview(projects) {
  const update = (id, patch) => Object.assign(projects.find(p => p.id === id), patch);
  update('calculadora', {
    brief: 'Primeira versão: um programa que recebe uma renda e três despesas numéricas válidas, soma as despesas e mostra o saldo. Use variáveis, input, float, operadores e print. Ainda não precisa classificar o saldo como positivo/negativo, criar um menu ou capturar erros.',
    requirements: ['Receber renda e três despesas válidas com input e float', 'Somar as despesas em uma variável total_despesas', 'Calcular saldo = renda - total_despesas e mostrar os valores', 'Experimentar três conjuntos de valores e conferir as contas manualmente', 'Escrever comentários explicando a ordem das operações'],
    prerequisites: ['entrada', 'operadores', 'strings'],
    preparation: 'Comece com números fixos. Quando a conta funcionar, troque cada valor por uma leitura: texto = input() e valor = float(texto). No estúdio, execute e responda às quatro perguntas, uma por vez. Para mostrar duas casas, a forma ensinada em textos é f"{saldo:.2f}"; a formatação é opcional nesta primeira versão.',
    extensions: 'Depois da aula de condições, mostre uma classificação do saldo. Depois de Tratando exceções, acrescente try/except ValueError. Esses recursos não são requisitos desta etapa.'
  });
  update('quiz', {
    prerequisites: ['entrada', 'condicoes', 'while', 'funcoes'],
    preparation: 'Crie primeiro uma função perguntar(enunciado, correta): mostre o enunciado, leia a resposta e devolva 1 se acertou ou 0 se errou. Chame essa função uma vez e teste. Depois repita cinco chamadas, somando os retornos em pontos. As questões podem ficar escritas diretamente nas chamadas: listas e dicionários serão ensinados depois.',
    extensions: 'Depois da etapa de estruturas, guarde as perguntas em uma lista de dicionários. Persistir resultados vem após arquivos e JSON.'
  });
  update('tarefas', {
    prerequisites: ['listas', 'dicionarios', 'for', 'funcoes', 'condicoes'],
    preparation: 'Comece com tarefas = [] e um contador proximo_id = 1. Cada cadastro adiciona um dicionário usando append. Para buscar, percorra a lista e compare o id. Para excluir, guarde o índice encontrado e use pop(indice) após o laço, evitando alterar a lista enquanto a percorre.',
    extensions: 'Salvar e recuperar tarefas de um arquivo JSON é um passo posterior à etapa de persistência. Não é obrigatório nesta versão em memória.'
  });
  update('banco', {
    brief: 'Modele um simulador educacional de clientes e contas, sem dinheiro real. Nesta primeira versão, use números inteiros em centavos: 150 representa R$ 1,50. Implemente depósito, saque, transferência e um histórico de movimentos em uma lista.',
    requirements: ['Modelar Cliente e Conta com atributos e métodos', 'Impedir valores negativos e saques acima do saldo', 'Validar uma transferência antes de alterar as duas contas', 'Guardar o tipo e o valor de cada movimento em uma lista', 'Conferir manualmente depósito, saque insuficiente e transferência'],
    prerequisites: ['construtor', 'encapsulamento', 'excecoes', 'listas', 'dicionarios'],
    preparation: 'Crie a classe Conta com saldo_centavos = 0 e historico = [] dentro de __init__. Faça um depósito funcionar antes de implementar saque. Para transferir, verifique todas as regras primeiro; só então desconte de uma conta e acrescente na outra. Use ValueError para operações inválidas e try/except no trecho que conversa com o usuário.',
    extensions: 'Decimal, datas em extrato e testes automatizados são ampliações posteriores. Não são exigidos sem uma introdução específica. Para formatar centavos, divida por 100 apenas na apresentação.'
  });
  update('estoque', {
    requirements: ['Criar uma tabela de produtos com id, nome e estoque', 'Cadastrar, consultar e atualizar produtos com parâmetros SQL', 'Validar entradas e saídas e confirmar as mudanças em transações', 'Gerar um relatório de estoque a partir de uma consulta', 'Demonstrar que os dados persistem ao fechar e reabrir o banco local'],
    prerequisites: ['crud', 'transacoes', 'excecoes'],
    preparation: 'No computador, troque sqlite3.connect(":memory:") por sqlite3.connect("estoque.db"). Crie a tabela uma vez com CREATE TABLE IF NOT EXISTS. Reutilize os exemplos de SELECT, INSERT e UPDATE parametrizados. No with con:, aplique a mudança de estoque só depois de validar a quantidade. Feche a conexão e reabra o arquivo para comprovar a persistência.',
    extensions: 'Relacionar uma tabela de movimentos, escrever CSV e automatizar backup são extensões. A aula introdutória só apresenta leitura de CSV; não é necessário descobrir csv.writer sozinho para concluir a versão inicial.'
  });
  update('api', {
    brief: 'Primeiro construa e teste a lógica de hábitos com funções, dicionários e SQLite. Depois conecte os serviços a rotas FastAPI no ambiente local, seguindo o tutorial preparatório indicado. As aulas web do campus introduzem conceitos e lógica; não são um tutorial completo de autenticação de produção.',
    prerequisites: ['servicos', 'paginacao', 'validacao', 'crud'],
    preparation: 'Etapa 1: criar_habito, buscar_habito e listar_habitos funcionam como funções Python. Etapa 2: faça persistência com o padrão SQLite já praticado. Antes da etapa 3 (servidor), complete no tutorial do FastAPI os capítulos First Steps, Path Parameters, Request Body e Handling Errors. Esses capítulos ensinam app = FastAPI(), decoradores de rotas e modelos de entrada, que não devem ser adivinhados.',
    preparationLink: 'https://fastapi.tiangolo.com/tutorial/',
    requirements: ['Construir funções de criação, leitura, edição e remoção de hábitos', 'Validar entradas e implementar paginação nas funções', 'Persistir os hábitos em SQLite com consultas parametrizadas', 'Completar o tutorial preparatório e expor os serviços em rotas locais', 'Documentar como executar e demonstrar as requisições locais'],
    extensions: 'Login, sessões e isolamento por usuário só entram depois do tutorial de segurança do framework. Não publique dados reais nem considere a aplicação multiusuário pronta apenas com a regra de autorização do exercício.'
  });
  update('qualidade-projeto', {
    prerequisites: ['testes', 'tipagem', 'logs', 'arquitetura', 'git'],
    preparation: 'Comece extraindo as regras em funções que podem ser chamadas sem servidor. Escreva testes no padrão mostrado na aula: preparar valores, chamar a função e usar assert. Para rodá-los com pytest, conclua o guia preparatório abaixo sobre instalação, descoberta de testes e falhas antes de configurar ferramentas adicionais.',
    preparationLink: 'https://docs.pytest.org/en/stable/getting-started.html',
    requirements: ['Separar as regras de negócio das rotas e do banco', 'Testar sucesso, valores de limite e falhas esperadas das funções', 'Adicionar anotações de tipo nas funções principais', 'Registrar eventos sem segredos e revisar as mudanças com Git', 'Documentar a execução dos testes e uma decisão de arquitetura'],
    extensions: 'CI em nuvem, verificação estática e formatação automática exigem configuração própria. São ampliações posteriores, não requisitos que esta introdução presuma ensinados.'
  });
  update('final', {
    prerequisites: ['arquitetura', 'testes', 'deploy', 'servicos'],
    preparation: 'Comece por um fluxo completo pequeno: cadastrar um item, persistir e consultar. Consolide primeiro os projetos de estoque, API e testes. As aulas do campus dão a base de Python; interface web, migrações e autenticação de produção exigem estudos complementares. Escolha essas ampliações depois de ter uma versão local funcional.',
    requirements: ['Definir um problema, os usuários e cinco critérios observáveis', 'Entregar um fluxo local completo com entrada, regras e banco', 'Validar dados e tratar falhas esperadas sem perder a persistência', 'Testar os fluxos centrais e documentar a configuração', 'Entregar código, README e uma demonstração dos critérios atendidos'],
    extensions: 'Interface web completa, contas online, permissões e deploy público formam uma segunda entrega, após estudar as tecnologias correspondentes. A primeira versão pode usar terminal ou a API local já praticada.'
  });
}
