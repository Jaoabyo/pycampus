export const workshopGuides = {
  quiz: [
    ['Uma pergunta', 'Comece mostrando uma pergunta com print. Leia resposta = input(). Use if resposta == "4": para a pergunta “Quanto é 2 + 2?”.', 'Teste com 4 e depois com 5. Só o primeiro caso deve mostrar Acertou.'],
    ['Uma função, aos poucos', 'Antes de juntar o quiz, pratique chamar, devolver, receber um valor, receber dois valores e comparar na sequência de funções. No estúdio, transforme só a leitura em função; depois mova a comparação; só então acrescente os retornos de pontos.', 'Guarde o retorno em uma variável e mostre fora da função. Teste acerto e erro separadamente: os retornos devem ser 1 e 0.'],
    ['Cinco perguntas', 'Crie pontos = 0. Faça cinco chamadas explícitas: pontos = pontos + perguntar(...). Use perguntas diferentes. Você ainda não precisa de listas.', 'Acerte todas: pontos deve ser 5. Erre todas: deve ser 0.'],
    ['Jogar novamente', 'Depois que uma rodada funcionar, coloque-a dentro de while jogar == "s":. Defina jogar = "s" antes e leia a nova escolha no final.', 'Responda n ao final. O programa deve terminar. Confira se pontos volta a 0 no início de cada rodada.'],
    ['Sua versão', 'Troque as perguntas pelo conteúdo da faculdade. Mostre a pontuação com uma frase e comente onde começa cada rodada.', 'Teste uma rodada com dois acertos. O placar deve ser 2, mesmo depois de uma rodada anterior com cinco acertos.']
  ],
  tarefas: [
    ['Primeiro cadastro', 'Comece com tarefas = []. Crie tarefa = {"id": 1, "titulo": "Estudar", "feita": False} e acrescente com tarefas.append(tarefa).', 'Mostre tarefas. Deve conter um dicionário com o título Estudar.'],
    ['Mostrar as tarefas', 'Use for tarefa in tarefas: e mostre tarefa["id"] e tarefa["titulo"]. Depois adicione uma segunda tarefa com id 2.', 'Os dois títulos precisam aparecer uma vez cada.'],
    ['Buscar e concluir', 'Defina id_procurado = 1. Percorra tarefas e, quando tarefa["id"] == id_procurado, faça tarefa["feita"] = True.', 'Só a tarefa 1 deve mudar. Teste também um id inexistente, como 99.'],
    ['Apagar', 'Use range(len(tarefas)) para procurar o índice. Guarde o índice encontrado e, depois do for, use tarefas.pop(indice). Se não encontrou, não chame pop.', 'Exclua a tarefa 1. A tarefa 2 deve permanecer. Não remova itens enquanto percorre a lista.'],
    ['Menu', 'Transforme as ações em funções. Use while e input para escolher cadastrar, listar, concluir, apagar ou sair. Gere um id crescente para cada novo cadastro.', 'Faça o ciclo completo de cadastro até exclusão. Esta versão funciona em memória; fechar o programa apaga os dados.']
  ],
  banco: [
    ['Uma conta', 'Crie class Conta: com def __init__(self, titular):. Dentro, guarde self.titular, self.saldo_centavos = 0 e self.historico = [].', 'Crie duas contas. Alterar o histórico de uma não deve alterar a outra.'],
    ['Depositar', 'Crie depositar(self, valor). Se valor <= 0, use raise ValueError. Caso contrário, some valor ao saldo e registre o depósito no histórico.', 'Depositar 1000 deve produzir saldo 1000 centavos. Depositar -1 deve falhar sem mudar o saldo.'],
    ['Sacar', 'Antes de subtrair, confira valor positivo e saldo suficiente. Registre a saída somente após passar pelas duas regras.', 'Saque 300 de um saldo 1000: sobram 700. Tentar sacar 800 deve manter 700.'],
    ['Transferir', 'Receba a conta de destino e o valor. Valide o valor, a conta de destino e o saldo antes de alterar qualquer conta. Registre os dois lados.', 'Uma transferência válida conserva a soma dos saldos. Uma inválida não deve alterar nenhuma conta.'],
    ['Apresentar', 'Mostre o histórico com for. Divida centavos por 100 apenas para apresentar reais; mantenha os cálculos em inteiros.', 'Demonstre depósito, saque recusado e transferência. Este é um simulador educacional, sem dinheiro real.']
  ],
  estoque: [
    ['Tabela', 'No computador, abra sqlite3.connect("estoque.db"). Use CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, nome TEXT, estoque INTEGER).', 'Execute duas vezes: a tabela deve continuar existindo sem erro.'],
    ['Cadastrar', 'Use INSERT INTO produtos (nome, estoque) VALUES (?, ?) e passe os valores em uma tupla, como ("Livro", 3). Confirme com commit.', 'SELECT deve devolver o produto com estoque 3.'],
    ['Entrada e saída', 'Busque o estoque pelo id. Calcule o novo valor em Python e recuse resultados negativos. Use UPDATE parametrizado dentro de with con:.', 'Entrar 2 e sair 1 de um estoque 3 deve deixar 4. Saída maior deve ser recusada.'],
    ['Relatório', 'Use SELECT id, nome, estoque FROM produtos. Percorra fetchall() com for e mostre uma linha por produto.', 'Cadastre dois produtos e confira os dois registros no relatório.'],
    ['Persistência', 'Feche con, encerre o programa e execute novamente apontando para o mesmo arquivo estoque.db.', 'O estoque deve continuar salvo. O banco :memory: do navegador serve para ensaio, não para este teste de persistência.']
  ],
  api: [
    ['Função antes de rota', 'Crie criar_habito(nome) e buscar_habito(id) trabalhando com uma lista de dicionários. Teste com chamadas e print, sem servidor.', 'Crie Ler e recupere o mesmo nome pelo id.'],
    ['Regras', 'Recuse nome vazio com ValueError. Separe listar_habitos(inicio, limite) para devolver uma fatia dos resultados.', 'Teste nome vazio, id inexistente e duas páginas sem repetir os mesmos itens.'],
    ['Guardar no banco', 'Troque a lista por uma tabela SQLite. Reutilize INSERT e SELECT com parâmetros da etapa de banco.', 'Encerre e reabra a conexão local. O hábito deve continuar salvo.'],
    ['Preparar o servidor', 'Abra o tutorial oficial indicado na preparação. Faça First Steps, Path Parameters, Request Body e Handling Errors. Execute a primeira rota antes de ligar o banco.', 'Abra /docs no servidor local e envie uma requisição. Confira o status e o corpo da resposta.'],
    ['Ligar as partes', 'Faça cada rota chamar a função correspondente. Converta erros de validação em respostas apropriadas e escreva como iniciar o projeto.', 'Demonstre criar, consultar, editar e remover. Autenticação de produção exige estudo e implementação adicionais.']
  ],
  qualidade: [
    ['Escolha uma função', 'Separe uma função do seu projeto que recebe valores e devolve um resultado, sem input dentro dela.', 'Chame com um caso conhecido e confira a resposta manualmente.'],
    ['Primeiro teste', 'Crie uma verificação com assert resultado == esperado. Faça um teste passar e altere o esperado de propósito para ver a falha.', 'Restaure o esperado. O teste precisa passar novamente.'],
    ['Casos de limite', 'Liste um caso comum, um limite e uma entrada inválida. Escreva um teste para cada comportamento definido.', 'Provoque um defeito pequeno na função: pelo menos um teste deve detectá-lo.'],
    ['pytest local', 'Siga o tutorial preparatório de pytest indicado na preparação. Nomeie o arquivo test_servico.py e as funções test_....', 'Execute python -m pytest e leia o resumo de casos aprovados e falhos.'],
    ['Organize a entrega', 'Separe cálculo, leitura e apresentação em funções. Registre mensagens úteis de erro, sem colocar senhas ou dados privados no log.', 'Outra pessoa deve conseguir executar os testes seguindo seu README.']
  ],
  final: [
    ['Uma pessoa, um problema', 'Escreva: quem vai usar, qual problema quer resolver e uma única ação indispensável. Exemplo: cadastrar uma tarefa de estudo.', 'Consiga descrever a primeira versão em três frases, sem lista de recursos futuros.'],
    ['Fluxo pequeno', 'Implemente entrada, validação, ação e resposta para essa função principal. Comece com terminal e dados em memória.', 'Demonstre a ação do começo ao fim com um caso válido e um inválido.'],
    ['Guardar e conferir os dados', 'Modele uma tabela SQLite e substitua os dados em memória. No navegador, o arquivo do banco é temporário: vale apenas enquanto o ambiente Python continua aberto. Para manter os dados entre execuções, baixe o programa e execute no computador usando um arquivo .db.', 'No navegador, feche e reabra só a conexão, sem reiniciar o ambiente Python, e confira o registro. No computador, encerre e reabra o programa apontando para o mesmo .db. Fechar a plataforma ou reiniciar o executor não preserva o banco do navegador.'],
    ['Confiabilidade', 'Separe as funções e escreva testes para a regra principal e para entradas inválidas. Explique as mensagens de erro ao usuário.', 'Execute todos os testes e faça uma demonstração manual completa.'],
    ['Entregar e ampliar', 'Escreva README com propósito, instalação, execução, testes e limitações. Publique o código quando decidir compartilhar. Interface web e hospedagem podem ser uma segunda versão.', 'Peça a uma pessoa para seguir o README. Anote onde ela precisou de ajuda e melhore essa parte.']
  ]
};
