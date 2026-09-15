import { workshopGuides } from './project-workshops.js';

// The task appears first. Syntax is revealed only when the learner requests a hint.
const prompts = {
  quiz: [
    ['Faça uma pergunta de conta e diga se a resposta está certa.', 'A resposta de input é texto ou número? Como você pode compará-la com a resposta esperada?'],
    ['Transforme essa pergunta em uma função que devolve um ponto por acerto.', 'Qual é a diferença entre mostrar um ponto com print e devolver um ponto com return?'],
    ['Faça cinco perguntas e some os pontos recebidos.', 'Onde o placar começa? O que acontece com ele a cada acerto?'],
    ['Pergunte se a pessoa quer jogar outra rodada.', 'O que precisa mudar para a repetição terminar? Onde o placar deve voltar a zero?'],
    ['Crie suas próprias perguntas e teste o jogo completo.', 'Como você conferiu que os pontos da rodada anterior não vazam para a nova?']
  ],
  tarefas: [
    ['Guarde uma tarefa com número, título e indicação de conclusão.', 'Por que uma lista ajuda quando você precisa guardar mais de uma tarefa?'],
    ['Acrescente outra tarefa e mostre o número e o título de cada uma.', 'O que muda a cada volta do for?'],
    ['Encontre uma tarefa pelo número e marque só ela como concluída.', 'Como o programa sabe qual tarefa deve mudar? E se o número não existir?'],
    ['Remova uma tarefa escolhida, mantendo as outras.', 'Por que é melhor encontrar a posição antes de remover o item da lista?'],
    ['Junte as ações em um menu que repete até a pessoa escolher sair.', 'Como você evita reutilizar o mesmo número em duas tarefas novas?']
  ],
  banco: [
    ['Crie uma conta com titular, saldo inicial zero e histórico vazio.', 'Por que cada conta precisa ter sua própria lista de movimentos?'],
    ['Acrescente a ação de depositar, aceitando apenas valores positivos.', 'Você confere o valor antes ou depois de mudar o saldo? Por quê?'],
    ['Acrescente a ação de sacar, sem permitir saldo negativo.', 'O que deve acontecer com o saldo quando o saque é recusado?'],
    ['Transfira um valor de uma conta para outra, depois de conferir as regras.', 'Se a transferência falhar, quais saldos devem permanecer como estavam?'],
    ['Mostre os movimentos e teste as duas contas juntas.', 'Por que manter os cálculos em centavos inteiros evita algumas imprecisões?']
  ],
  estoque: [
    ['Crie um banco com uma tabela para número, nome e quantidade dos produtos.', 'O que precisa acontecer quando o programa abre uma tabela que já existe?'],
    ['Cadastre um produto e busque o registro para conferir.', 'Por que os valores devem ser enviados como parâmetros da consulta?'],
    ['Permita entrada e saída de unidades, recusando estoque negativo.', 'Qual regra você verifica antes de gravar a nova quantidade?'],
    ['Mostre um relatório com os produtos cadastrados.', 'Como você sabe que o relatório está lendo o banco e não um texto fixo?'],
    ['Feche e reabra a conexão para conferir que o produto continua no arquivo.', 'O que é diferente entre salvar o código do editor e salvar os dados do banco?']
  ],
  api: [
    ['Crie e busque um hábito usando funções Python.', 'Que informação a função de criação precisa devolver para você buscar o hábito depois?'],
    ['Recuse nomes vazios e divida a lista em páginas pequenas.', 'Uma lista vazia e um nome inválido significam a mesma coisa?'],
    ['Guarde os hábitos em SQLite e acrescente funções para editar e remover.', 'Como você confirma que atualizar um hábito não alterou os outros?'],
    ['Prepare no computador a primeira rota HTTP do seu serviço.', 'O que o servidor faz quando recebe uma requisição e qual função executa a regra?'],
    ['Conecte as rotas às ações de criar, consultar, editar e remover.', 'Como a resposta informa a diferença entre uma criação bem-sucedida e um id inexistente?']
  ],
  'qualidade-projeto': [
    ['Escolha uma regra do seu programa e coloque-a em uma função.', 'Por que fica mais fácil testar quando a função recebe valores em vez de chamar input?'],
    ['Escreva um teste que confira uma resposta conhecida.', 'Como você comprova que o teste falha quando existe um defeito?'],
    ['Teste um caso comum, um limite e uma entrada inválida.', 'Que erro passaria despercebido se você testasse apenas um caso comum?'],
    ['Organize os testes em funções e execute todos dentro da plataforma.', 'Como cada teste prepara seus dados sem depender do resultado do anterior?'],
    ['Acrescente tipos e mensagens de diagnóstico. Explique a organização.', 'Qual responsabilidade fica na função de cálculo e qual fica na apresentação?']
  ],
  final: [
    ['Escolha uma pessoa, um problema e cinco coisas que sua primeira versão deve fazer.', 'Como outra pessoa vai conferir, na prática, se cada critério foi atendido?'],
    ['Construa uma única ação completa: receber, conferir, fazer e responder.', 'Qual é o menor fluxo que já resolve uma parte útil do problema?'],
    ['Guarde os dados dessa ação em um banco SQLite.', 'O que precisa continuar existindo quando a conexão for reaberta?'],
    ['Teste as regras e trate as falhas que você espera receber.', 'Uma entrada inválida deixa os dados do banco intactos? Como você testou isso?'],
    ['Demonstre os cinco critérios e prepare a entrega.', 'O que outra pessoa precisa saber para executar seu programa sem sua ajuda?']
  ]
};

export const coachedProjects = Object.fromEntries(Object.entries(prompts).map(([id, items]) => {
  const guide = workshopGuides[id === 'qualidade-projeto' ? 'qualidade' : id];
  return [id, items.map(([task, question], index) => ({
    id: `construcao-${index + 1}`, title: guide[index][0], instruction: task, why: task,
    expected: null, check: guide[index][2], question,
    hints: ['Descreva o passo em português antes de escrever. Quais valores entram e o que precisa mudar?', guide[index][1]],
    mode: id === 'api' && index >= 3 ? 'local' : id === 'final' && index === 0 ? 'plan' : 'browser'
  }))];
}));

coachedProjects.api[2].hints.push('Reutilize as consultas com parâmetros do projeto de estoque. Além de INSERT e SELECT, acrescente UPDATE para editar o nome e DELETE para remover pelo id. Teste as quatro funções antes das rotas.');
coachedProjects['qualidade-projeto'][3].title = 'Rodar todos os testes';
coachedProjects['qualidade-projeto'][3].hints[1] = 'Crie funções com nomes como test_caso_comum e test_limite, colocando assert dentro de cada uma. Chame cada função ao final do arquivo. Sem erro, os asserts passaram; acrescente uma mensagem no final para confirmar. pytest no computador é uma extensão posterior.';
coachedProjects['qualidade-projeto'][3].check = 'Execute todas as funções de teste. Provoque um defeito na função principal, veja um teste falhar e depois corrija. Uma mensagem escrita sem executar os asserts não comprova os testes.';
// The original five ids keep their meaning and saved notes. New ids fill the
// previously missing construction steps; historical work is never overwritten.
const coachStep = (id, title, instruction, question, hints, check, prerequisiteBridgeIds = []) => ({
  id, title, instruction, why: instruction, question, hints, check,
  expected: null, mode: 'browser', prerequisiteBridgeIds
});
coachedProjects.quiz = [
  coachStep('construcao-1', 'Uma pergunta, dois caminhos',
    'Faça só uma pergunta de conta com input. Guarde a resposta e use if e else para mostrar Acertou ou Tente de novo. Ainda não crie função nem placar.',
    'Qual valor você comparou? Por que a resposta esperada precisa ter o mesmo tipo da resposta digitada?',
    ['input devolve texto. Comece comparando com outro texto, entre aspas; assim você não precisa converter a resposta.', 'Para testar uma cor em outro programa: resposta = input("Qual cor? "). Depois if resposta == "azul": escolhe o caminho de acerto. Adapte a ideia para a sua pergunta.'],
    'Execute duas vezes: uma resposta certa e uma errada. Registre o que aparece em cada caso.'),
  coachStep('quiz-ler-em-funcao', 'Uma função só para perguntar',
    'Agora crie perguntar(enunciado). Mova somente a leitura da resposta para dentro dela e devolva o texto lido. Chame a função uma vez, guarde o retorno em resposta e mantenha seu if fora dela.',
    'O que entra em enunciado e o que sai no return? Onde seu if continua neste passo?',
    ['Pense em três ações: receber o enunciado, ler com input e devolver o texto recebido. A comparação continua fora da função por enquanto.', 'No exercício de cor, ler_cor(mensagem) lia resposta = input(mensagem) e devolvia resposta. Adapte esse pequeno modelo. Na chamada, passe sua pergunta entre aspas e guarde o retorno.'],
    'Ao chamar a função, a pergunta deve aparecer uma vez. Digite a resposta e confira que o if de fora ainda escolhe o feedback correto.',
    ['ponte-funcao-chamar', 'ponte-funcao-retornar', 'ponte-funcao-parametro', 'ponte-funcao-entrada']),
  coachStep('quiz-segundo-valor', 'Levar a resposta correta junto',
    'Acrescente correta como segundo parâmetro de perguntar. Passe a resposta correta como texto ao chamar. Mova o if e o else para dentro da função e compare a resposta digitada com correta. Neste passo, continue só mostrando o feedback.',
    'Na sua chamada, qual valor vai para enunciado e qual vai para correta?',
    ['O primeiro valor da chamada chega ao primeiro nome; o segundo chega ao segundo. Mantenha os dois valores como textos.', 'Dentro da função, o if tem quatro espaços e os prints dos caminhos têm oito. Se ainda existir return resposta antes do if, remova esse retorno: ele encerraria a função antes da comparação.'],
    'Faça uma chamada e teste acerto e erro. Em seguida, troque a pergunta e a resposta na chamada, sem mudar o corpo da função.',
    ['ponte-funcao-dois-parametros', 'ponte-funcao-comparar']),
  coachStep('construcao-2', 'Devolver um ponto',
    'Sua função já pergunta e escolhe o feedback. Acrescente return 1 depois do print de acerto e return 0 depois do print de erro. Guarde o retorno da chamada em ponto e mostre ponto fora da função.',
    'Qual é a diferença entre o print do feedback dentro da função e o ponto devolvido por return?',
    ['Faça uma mudança em cada caminho: o acerto devolve um número e o erro devolve outro. print continua mostrando a mensagem.', 'Guarde o retorno como na prática: nome = funcao(valores). Só depois mostre a variável. Não use return print(...): o print não devolve um ponto.'],
    'Na execução com acerto, confira o feedback e o número 1. Com erro, confira o feedback e o número 0. Se aparecer None, procure um caminho que não devolve o ponto.',
    ['ponte-funcao-ponto', 'ponte-funcao-reutilizar']),
  coachStep('quiz-duas-perguntas', 'Somar só duas perguntas',
    'Faça duas chamadas de perguntar com perguntas diferentes. Guarde os retornos em primeiro e segundo. Depois some os dois em pontos e mostre pontos. Ainda não faça cinco perguntas.',
    'O que você está somando: as respostas digitadas ou os números devolvidos pela função?',
    ['Uma chamada por linha deixa visível de onde veio cada ponto. Cada chamada devolve 1 ou 0.', 'A soma dos retornos usa o mesmo + da calculadora. Teste as combinações 1 + 1, 1 + 0 e 0 + 0 sem escrever um placar fixo.'],
    'Execute três partidas curtas: dois acertos dão 2; um acerto dá 1; nenhum dá 0.',
    ['ponte-funcao-reutilizar']),
  coachStep('construcao-3', 'Crescer para cinco perguntas',
    'Suas duas perguntas já funcionam. Acrescente uma terceira e confira o total. Depois acrescente a quarta e a quinta, sempre guardando cada retorno e incluindo-o na soma.',
    'Se só a quinta resposta estiver certa, qual valor deve aparecer no placar? Como você conferiu?',
    ['Continue com chamadas escritas uma por linha. Você não precisa de listas nem de um for para cinco perguntas.', 'Dê um nome a cada retorno e some todos somente depois das perguntas. Se preferir um acumulador, comece pontos em zero e some cada retorno ao que já estava guardado.'],
    'Cinco acertos devem dar 5. Nenhum acerto deve dar 0. Somente a última certa deve dar 1.'),
  coachStep('quiz-alternativas', 'Escolher entre a, b e c',
    'Mude apenas a primeira pergunta para oferecer três alternativas identificadas por a, b e c. A resposta correta da chamada passa a ser uma dessas letras. Quando funcionar, faça o mesmo nas outras quatro perguntas.',
    'O que mudou no enunciado e na resposta correta? Por que a função de pontuar continua funcionando?',
    ['Você pode escrever a pergunta em uma linha: Qual cor? a) azul b) verde c) roxo. Quem joga digita só uma letra.', 'Guarde a letra correta como texto na chamada. Não compare com o texto completo da alternativa. Use strip().lower() na resposta se quiser aceitar espaços e letras maiúsculas; esses métodos devolvem um novo texto.'],
    'Teste uma alternativa certa e outra errada em cada pergunta. A letra correta precisa corresponder à alternativa mostrada.'),
  coachStep('quiz-resposta-invalida', 'Pedir de novo se não for uma alternativa',
    'Antes de corrigir a resposta, confira se ela é a, b ou c. Se a pessoa escrever outra coisa, peça novamente. Comece testando uma única pergunta.',
    'Por que uma letra inválida não deve ganhar um ponto nem passar para a próxima pergunta?',
    ['Você já conhece while: ele repete enquanto a condição é verdadeira. Aqui a condição é não ser nenhuma das três letras.', 'Use a ideia resposta != "a" and resposta != "b" and resposta != "c". Dentro desse while, leia uma nova resposta. O if que corrige fica depois do laço, ainda dentro da função. Não devolva um ponto antes de terminar essa conferência.'],
    'Digite x, depois uma resposta vazia, depois uma letra válida. As duas primeiras devem pedir novamente; só a letra válida é corrigida. Teste também uma alternativa válida errada: ela vale zero.'),
  coachStep('quiz-escolha-rodada', 'Perguntar se quer continuar',
    'Depois do placar, use input para perguntar se a pessoa quer outra rodada: s para sim, n para não. Guarde essa escolha em jogar. Por enquanto, o programa apenas recebe a escolha; ainda não repete.',
    'Por que guardar a escolha é necessário antes de decidir repetir?',
    ['Deixe essa pergunta depois de todas as perguntas do quiz e depois do print do placar.', 'Leia a escolha como texto. O próximo passo vai comparar jogar com "s"; aqui confira apenas se você recebeu o que foi digitado.'],
    'Responda n no final e confira que o programa termina. Responda s numa nova execução e confira a variável com um print temporário.'),
  coachStep('construcao-4', 'Repetir uma rodada pronta',
    'Defina jogar com o texto s antes da primeira rodada. Coloque as chamadas, o cálculo do placar e a pergunta final dentro de while jogar == "s":. A definição da função perguntar continua fora do while.',
    'Quais linhas formam uma rodada? Qual delas muda jogar para que o laço possa terminar?',
    ['O while pergunta se deve começar uma rodada. A pergunta de continuar, no fim, atualiza a escolha para a próxima volta.', 'Coloque quatro espaços antes de cada linha que pertence à rodada. Se usar um acumulador, zere pontos no começo de cada rodada, dentro do while. Os retornos de cada chamada também precisam ser recebidos de novo.'],
    'Faça uma rodada com todos os acertos, escolha s e faça outra sem acertos. Os placares devem ser 5 e 0. Escolha n e confira que o programa termina.'),
  coachStep('construcao-5', 'Sua versão e sua conferência',
    'Escolha cinco perguntas suas sobre o que estudou. Troque os enunciados e as alternativas e confira a letra correta de cada uma. Depois prepare os exemplos de uso e os testes para seu README.',
    'Escolha uma chamada e explique: o que entra, como a resposta é conferida e de onde vem o ponto?',
    ['Mude uma pergunta por vez e teste antes de continuar. Você está reutilizando a função que construiu, sem precisar reescrevê-la.', 'Anote três situações para o README: zero acertos, cinco acertos e uma letra inválida seguida de uma válida. Inclua também duas rodadas para mostrar que o placar reinicia.'],
    'Demonstre as cinco perguntas com alternativas, feedback, entrada inválida e nova rodada. Registre os resultados que você realmente observou.')
];
// Uma auditoria de nivelamento mostrou que o primeiro passo pedia uma lista de dicionários
// sem que nenhuma aula tivesse mostrado uma, e que apagar exigia posição e pop de uma vez.
// Os cinco ids originais continuam com o mesmo sentido e as anotações já salvas; os novos
// preenchem os degraus que faltavam entre eles.
coachedProjects.tarefas = [
  coachStep('tarefas-uma-tarefa', 'Uma tarefa só',
    'Antes da lista, crie uma tarefa sozinha: um dicionário com id 1, titulo "Estudar" e feita valendo False. Mostre só o título dela.',
    'Por que guardar as três informações juntas é melhor do que criar três variáveis soltas?',
    ['Descreva em português o que a tarefa precisa guardar antes de escrever. Quantas informações são?',
      'Um dicionário usa chaves e valores: tarefa = {"id": 1, "titulo": "Estudar", "feita": False}. Para ler uma informação, use tarefa["titulo"].'],
    'Mostre o título e confira que aparece Estudar. Tente também mostrar tarefa["feita"] e veja False aparecer.'),
  coachStep('construcao-1', 'Primeiro cadastro',
    'Agora crie uma lista vazia de tarefas e coloque dentro dela a tarefa que você acabou de montar. Mostre a lista inteira.',
    'O que a lista guarda agora: três valores soltos ou uma tarefa completa em cada posição?',
    ['Descreva o passo em português antes de escrever. O que entra na lista: o dicionário todo ou só o título?',
      'Comece com tarefas = []. Depois use tarefas.append(tarefa), do mesmo jeito que você acrescentou números a uma lista. Cada posição da lista passa a guardar um dicionário inteiro.'],
    'Mostre tarefas. Deve aparecer uma lista com um dicionário dentro, com o título Estudar.'),
  coachStep('tarefas-ler-chave', 'Ler dentro do laço',
    'Percorra a lista de tarefas com for e, a cada volta, mostre apenas o título daquela tarefa. Ainda com uma tarefa só na lista.',
    'A cada volta do for, o que a variável do laço guarda: a lista toda ou uma tarefa?',
    ['Diga em voz alta o que o for recebe em cada volta antes de escrever a linha de dentro.',
      'Escreva for tarefa in tarefas: e, na linha indentada, mostre tarefa["titulo"]. A variável tarefa recebe um dicionário por volta.'],
    'Deve aparecer só o título, sem chaves e sem aspas em volta. Acrescente mentalmente uma segunda tarefa e diga quantas linhas apareceriam.'),
  coachStep('construcao-2', 'Mostrar as tarefas',
    'Acrescente uma segunda tarefa, com id 2 e outro título, e mostre o número e o título de cada uma.',
    'O que muda a cada volta do for e o que continua igual?',
    ['Descreva o passo em português: o que precisa acontecer antes do for e o que acontece dentro dele.',
      'Monte o segundo dicionário igual ao primeiro, mudando id e titulo, e use append de novo. Dentro do for, mostre tarefa["id"] e tarefa["titulo"] na mesma linha.'],
    'Devem aparecer duas linhas, cada uma com número e título. Troque a ordem dos append e confira que a saída acompanha.'),
  coachStep('tarefas-achar', 'Achar a tarefa certa',
    'Defina id_procurado = 2. Percorra as tarefas e mostre o título apenas da tarefa que tem esse id. Ainda não mude nada nela.',
    'Como o programa decide que aquela é a tarefa certa? O que acontece quando o id não bate?',
    ['Antes de escrever, diga qual comparação separa a tarefa certa das outras.',
      'Dentro do for, use if tarefa["id"] == id_procurado: e mostre o título na linha indentada dentro do if. Lembre que == compara e = atribui.'],
    'Deve aparecer só um título. Troque id_procurado para 99 e confira que nada aparece, sem erro.'),
  coachStep('construcao-3', 'Buscar e concluir',
    'Encontre a tarefa pelo número e marque só ela como concluída. Depois mostre todas para conferir quais mudaram.',
    'Como o programa sabe qual tarefa deve mudar? E se o número não existir?',
    ['Descreva em português a diferença entre ler uma informação e trocar o valor dela.',
      'Reaproveite o if do passo anterior e, no lugar de mostrar, escreva tarefa["feita"] = True. Escrever numa chave que já existe troca o valor guardado.'],
    'Só a tarefa procurada deve ficar com feita valendo True. Teste também um id inexistente, como 99, e confira que nenhuma mudou.'),
  coachStep('tarefas-posicao', 'Descobrir a posição',
    'Descubra em qual posição da lista está a tarefa com id 2 e mostre esse número de posição. Ainda não remova nada.',
    'Por que aqui você precisa da posição, e não da tarefa em si?',
    ['Diga primeiro o que você quer de volta: a tarefa ou o lugar dela na lista?',
      'range(len(tarefas)) dá as posições 0, 1, 2… Use for posicao in range(len(tarefas)): e compare tarefas[posicao]["id"] com o id procurado. Guarde a posição encontrada numa variável.'],
    'Com duas tarefas e o id 2, deve aparecer 1, porque a contagem começa em zero. Teste com um id que não existe e veja que nenhuma posição é encontrada.'),
  coachStep('construcao-4', 'Apagar',
    'Remova da lista a tarefa escolhida, mantendo as outras. Se o número não existir, não remova nada.',
    'Por que é melhor encontrar a posição antes de remover o item da lista?',
    ['Descreva em português o que deve acontecer nos dois casos: encontrou e não encontrou.',
      'Com a posição guardada, use tarefas.pop(posicao) depois que o for terminar. Comece a variável de posição com um valor que signifique "não achei", como -1, e só chame pop quando ela tiver mudado.'],
    'A lista deve ficar sem a tarefa apagada e com as outras intactas. Teste apagar um id inexistente e confira que nada é removido e nada quebra.'),
  coachStep('tarefas-uma-funcao', 'Uma ação virando função',
    'Transforme apenas a ação de listar tarefas em uma função que recebe a lista e mostra todas. Chame essa função uma vez.',
    'O que a função precisa receber de fora para funcionar com qualquer lista?',
    ['Antes de escrever, diga o que entra na função e o que ela faz. Ela devolve algo ou só mostra?',
      'Use def listar(tarefas): e mova para dentro o for que você já tem. Depois chame listar(tarefas). Uma ação de cada vez: as outras continuam fora por enquanto.'],
    'A saída precisa continuar igual à de antes de criar a função. Chame a função duas vezes e confira que mostra a lista duas vezes.'),
  coachStep('construcao-5', 'Menu',
    'Junte as ações em um menu que repete até a pessoa escolher sair, gerando um número novo para cada tarefa cadastrada.',
    'Como você evita reutilizar o mesmo número em duas tarefas novas?',
    ['Descreva o menu em português: quais opções existem e o que encerra a repetição.',
      'Transforme cada ação em função, como você fez com listar. Use while com input para ler a escolha e if para chamar a função certa. Para o id novo, guarde um contador que cresce a cada cadastro.',
      'Antes de cadastrar, use strip para conferir se o título tem conteúdo. Para ids inexistentes, mostre uma mensagem e volte ao menu sem alterar as tarefas.'],
    'Cadastre duas tarefas, liste, conclua uma, apague outra e saia. Confira que os números não se repetem e que sair encerra o programa.')
];
// Auditoria das 70 perguntas de reflexão (scripts/auditar-perguntas.mjs, 210 julgamentos do
// modelo local em 3 passadas): 12 suspeitos, dos quais 11 eram falso positivo na leitura humana
// — o modelo reprova pergunta conceitual que não repete o vocabulário do enunciado. O único
// real estava em banco/construcao-2, que perguntava a ordem da conferência, assunto já decidido
// no passo anterior, em vez do registro no histórico, que é o que este passo acrescenta.
// A auditoria fica como ferramenta de leitura, nunca como portão: ela sinaliza, quem decide lê.
// Prova disso: depois de reescrita, a pergunta de banco/construcao-2 fala literalmente do
// registro no histórico, e o modelo continua acusando que ela ignora a técnica do passo.
// A auditoria apontou cinco saltos aqui: o construtor pedia três atributos de uma vez, o
// depósito exigia raise ValueError (que só é ensinado no módulo 05), a retirada juntava duas
// guardas sem nunca ter praticado uma, a transferência estreava "método que recebe outro
// objeto" e a apresentação misturava laço, centavos e classe composta. Os cinco ids originais
// continuam com o mesmo sentido e as anotações salvas; os novos preenchem os degraus.
coachedProjects.banco = [
  coachStep('banco-conta-simples', 'A classe mais simples',
    'Antes de qualquer regra: crie a classe Conta guardando apenas o nome do titular, e mostre esse nome a partir de uma conta criada.',
    'O que o self guarda que a variável comum não guardaria?',
    ['Diga em português o que uma conta precisa saber quando nasce. Comece por uma informação só.',
      'Use class Conta: e def __init__(self, titular):. Dentro, escreva self.titular = titular. Depois crie conta = Conta("Ana") e mostre conta.titular.'],
    'Crie duas contas com titulares diferentes e mostre os dois nomes. Cada objeto guarda o seu.'),
  coachStep('construcao-1', 'Uma conta',
    'Agora a mesma conta nasce também com saldo zero e um histórico vazio. Mostre o saldo e o histórico de uma conta recém-criada.',
    'Por que cada conta precisa ter sua própria lista de movimentos?',
    ['Descreva o que muda no nascimento da conta. Quantas informações ela passa a guardar?',
      'No mesmo __init__, acrescente self.saldo_centavos = 0 e self.historico = []. Os colchetes criam uma lista vazia nova para cada conta.'],
    'Crie duas contas e acrescente um texto ao histórico de uma delas com append. O histórico da outra precisa continuar vazio.'),
  coachStep('banco-guarda-simples', 'Uma regra por vez',
    'Crie o método depositar, que aceita apenas valores positivos. Por enquanto ele só soma ao saldo e devolve True quando aceitou, ou False quando recusou.',
    'O que a função devolve quando recusa, e por que devolver algo é melhor do que só não fazer nada?',
    ['Antes de escrever, diga em voz alta a regra em uma frase: quando o depósito deve ser recusado?',
      'Escreva def depositar(self, valor):. Comece com if valor <= 0: e return False. Depois da condição, some ao saldo e termine com return True.'],
    'Deposite 1000 e confira o saldo. Depois deposite -1 e confira que a resposta foi False e o saldo não mudou.'),
  coachStep('construcao-2', 'Depositar',
    'Faça o depósito aceito registrar o movimento no histórico, além de mudar o saldo.',
    'O depósito recusado pode deixar linha no histórico? Em que ponto do método você pôs o registro para isso não acontecer?',
    ['Diga em português onde o registro entra: antes da regra, depois dela, ou dentro do caminho que aceitou?',
      'Use self.historico.append("deposito de 1000") no mesmo trecho que já soma ao saldo. O depósito recusado não pode deixar rastro no histórico.'],
    'Depositar 1000 deve produzir saldo 1000 centavos e uma linha no histórico. Depositar -1 não pode mudar nem o saldo nem o histórico.'),
  coachStep('banco-duas-regras', 'Duas regras na mesma decisão',
    'Crie o método pode_sacar, que responde True ou False para um valor: ele precisa ser positivo e caber no saldo. Este método apenas responde, não mexe em nada.',
    'As duas regras precisam ser verdadeiras juntas ou basta uma? O que isso significa em Python?',
    ['Escreva as duas condições em português antes de codar. Elas se somam ou se substituem?',
      'Pode ser um if para cada regra, com return False em cada um, e return True no fim. Ou uma linha só com and, como na aula de booleanos.'],
    'Com saldo 1000: pode_sacar(300) responde True, pode_sacar(800000) responde False e pode_sacar(-5) também. O saldo continua 1000 nos três testes.'),
  coachStep('construcao-3', 'Sacar',
    'Agora crie sacar, que usa a resposta de pode_sacar para decidir, e só então subtrai do saldo e registra a saída.',
    'O que deve acontecer com o saldo quando o saque é recusado?',
    ['Diga o que o saque faz a mais do que só responder sim ou não.',
      'Comece com if not self.pode_sacar(valor): return False. Depois disso o caminho já está liberado: subtraia e registre no histórico.'],
    'Saque 300 de um saldo 1000: sobram 700. Tentar sacar 800000 deve manter 700 e não registrar nada.'),
  coachStep('banco-outra-conta', 'Um método que recebe outra conta',
    'Crie o método mesmo_titular, que recebe outra conta e responde se as duas pertencem à mesma pessoa. Nada de dinheiro ainda.',
    'Dentro do método, o que é self e o que é a outra conta?',
    ['Diga em português o que entra: um número, um texto, ou uma conta inteira?',
      'Use def mesmo_titular(self, outra):. Dentro, compare self.titular com outra.titular. O ponto funciona igual em qualquer objeto, inclusive no que chegou como parâmetro.'],
    'Crie duas contas com o mesmo titular e duas com titulares diferentes, e confira as duas respostas.'),
  coachStep('construcao-4', 'Transferir',
    'Transfira um valor de uma conta para outra, conferindo as regras antes de mexer em qualquer saldo.',
    'Se a transferência falhar, quais saldos devem permanecer como estavam?',
    ['Descreva a ordem: o que precisa ser verificado antes de tirar de um lado e pôr no outro?',
      'O método recebe a conta de destino e o valor, como no passo anterior. Reaproveite pode_sacar para a origem e depositar para o destino, em vez de refazer as regras.'],
    'Uma transferência válida conserva a soma dos saldos das duas contas. Uma inválida não pode alterar nenhuma delas.'),
  coachStep('banco-mostrar-reais', 'De centavos para reais',
    'Mostre o saldo em reais a partir dos centavos guardados, sem mudar a forma como o saldo é calculado.',
    'Por que guardar centavos inteiros e só dividir na hora de mostrar?',
    ['Diga a diferença entre o número que o programa usa para contar e o número que a pessoa lê.',
      'Divida o saldo por 100 apenas dentro do print. A variável do saldo continua inteira, em centavos: dividir ali quebraria as contas seguintes.'],
    'Com saldo 1250 centavos, deve aparecer 12.5 na tela, e o saldo guardado continua 1250.'),
  coachStep('construcao-5', 'Apresentar',
    'Mostre o histórico completo das duas contas e demonstre um depósito, um saque recusado e uma transferência.',
    'Como você prova, pela saída do programa, que a regra recusou o saque em vez de simplesmente não ter rodado?',
    ['Planeje a demonstração antes: quais operações, nesta ordem, provam que cada regra funciona?',
      'Percorra self.historico com for e mostre uma linha por movimento. Use a divisão por 100 do passo anterior para os valores em reais.',
      'Para ir além, se quiser: crie uma classe Cliente com um atributo nome e associe cada Conta a um Cliente, mostrando o nome do titular no histórico. É ampliação, não requisito.'],
    'Demonstre depósito, saque recusado e transferência, com o histórico das duas contas. Este é um simulador educacional, sem dinheiro real.')
];
coachedProjects['qualidade-projeto'][4].hints.push('Acrescente anotações como valor: int e -> int nas funções adequadas. Para revisar alterações com Git: na pasta do projeto, use git init, git add com o nome do arquivo e git commit para guardar uma primeira versão. Depois edite uma linha e execute git diff. Estude a aula de Git antes desses comandos.');
coachedProjects.final[4].hints.push('No README, registre cada critério e um teste que demonstra o resultado. Informe a configuração e os limites do programa; registre somente o que você testou.');

// Os saltos apontados aqui: a aula de SQL só usa banco em memória, e o passo 1 já pedia
// arquivo com IF NOT EXISTS; commit e fetchall não aparecem em código executado em aula
// nenhuma; e a entrada/saída juntava ler, calcular, conferir a regra e gravar dentro de
// with con:. Cada uma dessas ideias ganhou seu próprio degrau.
coachedProjects.estoque = [
  coachStep('estoque-memoria', 'O banco que você já conhece',
    'Comece exatamente como na aula: um banco em memória, uma tabela de produtos com id, nome e estoque, um produto inserido e esse produto lido de volta.',
    'O que acontece com esse banco quando o programa termina?',
    ['Descreva as quatro ações em português antes de escrever: abrir, criar, inserir, ler.',
      'Use sqlite3.connect(":memory:"), CREATE TABLE produtos, INSERT com valores entre parênteses e SELECT com fetchone, como na aula de SQL.'],
    'O produto inserido precisa aparecer na leitura. Execute duas vezes e repare que o banco sempre começa vazio.'),
  coachStep('construcao-1', 'Tabela',
    'Agora troque o banco em memória por um arquivo, de modo que executar o programa duas vezes não apague nem duplique a tabela.',
    'O que precisa acontecer quando o programa abre uma tabela que já existe?',
    ['Diga o que muda entre guardar na memória e guardar num arquivo. O que sobrevive ao fim do programa?',
      'Troque ":memory:" por "estoque.db". E como a tabela agora sobrevive, CREATE TABLE IF NOT EXISTS evita o erro de tentar criar de novo o que já existe.'],
    'Execute duas vezes seguidas: a tabela deve continuar existindo, sem erro na segunda execução.'),
  coachStep('estoque-gravar-de-verdade', 'Gravar para valer',
    'Insira um produto, feche a conexão, abra o arquivo de novo e procure o produto. Descubra se ele sobreviveu.',
    'O que faltou para a gravação valer, e por que o SQLite não grava sozinho?',
    ['Antes de testar, escreva sua previsão: o produto vai estar lá ou não?',
      'Se o produto sumiu, faltou confirmar a gravação com con.commit() antes de fechar. Sem isso o SQLite desfaz o que foi feito. Refaça o teste com o commit no lugar.'],
    'Depois do commit, o produto precisa aparecer na segunda abertura do arquivo. Sem commit, não aparece — vale ver os dois resultados.'),
  coachStep('construcao-2', 'Cadastrar',
    'Cadastre um produto com nome e quantidade vindos de variáveis, nunca escritos dentro do texto da consulta, e busque o registro para conferir.',
    'Por que os valores devem ser enviados como parâmetros da consulta?',
    ['Diga a diferença entre montar o texto da consulta com os valores dentro e enviar os valores separados.',
      'Use INSERT INTO produtos (nome, estoque) VALUES (?, ?) e envie os dois valores, "Livro" e 3, como segundo argumento do execute, como na aula de CRUD. Confirme com commit.'],
    'O SELECT deve devolver o produto com estoque 3. Tente cadastrar um nome com aspas dentro e veja que nada quebra.'),
  coachStep('estoque-ler-varias', 'Ler vários de uma vez',
    'Cadastre um segundo produto e mostre todos os produtos da tabela, um por linha.',
    'O que muda entre pedir um registro e pedir todos eles?',
    ['Diga o que você espera receber: um produto ou uma lista de produtos?',
      'fetchone devolve um registro; fetchall devolve a lista com todos. Percorra essa lista com for e mostre uma linha por produto, como você faria com qualquer lista.'],
    'Com dois produtos cadastrados, devem aparecer duas linhas. Cadastre um terceiro e confira que aparecem três, sem mudar o código.'),
  coachStep('estoque-calcular-antes', 'Calcular antes de gravar',
    'Leia o estoque de um produto, calcule em Python quanto ficaria depois de uma entrada de 2 unidades e mostre o valor calculado. Ainda não grave.',
    'Por que calcular primeiro e só depois decidir se grava?',
    ['Separe as três ações em português: ler, calcular, mostrar. Onde entraria a gravação?',
      'Busque o estoque com SELECT e fetchone, guarde o número numa variável e some 2 a ela. O resultado do fetchone vem numa tupla: o primeiro valor é acessado com [0].'],
    'Com estoque 3, o valor calculado precisa ser 5, e o banco precisa continuar com 3 — nada foi gravado ainda.'),
  coachStep('construcao-3', 'Entrada e saída',
    'Agora grave o novo valor, recusando qualquer operação que deixaria o estoque negativo.',
    'Qual regra você verifica antes de gravar a nova quantidade?',
    ['Diga em que ponto exato a regra entra: antes de calcular, depois de calcular, ou depois de gravar?',
      'Com o valor já calculado, use if novo < 0 para recusar antes de gravar. Para gravar, UPDATE produtos SET estoque = ? WHERE id = ?, com os valores como parâmetros.',
      'Colocar o UPDATE dentro de with con: confirma a gravação sozinho ao final do bloco, como na aula de transações — e desfaz tudo se algo falhar no meio.'],
    'Entrar 2 e sair 1 de um estoque 3 deve deixar 4. Uma saída maior que o estoque deve ser recusada e não pode alterar o banco.'),
  coachStep('construcao-4', 'Relatório',
    'Mostre um relatório com todos os produtos: número, nome e quantidade atual.',
    'Como você sabe que o relatório está lendo o banco e não um texto fixo?',
    ['Planeje a saída antes: quais colunas aparecem e em que ordem?',
      'Reaproveite o fetchall com for do passo anterior, agora trazendo SELECT id, nome, estoque FROM produtos.'],
    'Cadastre dois produtos e confira os dois no relatório. Mude o estoque de um deles e rode o relatório de novo: o número precisa acompanhar.'),
  coachStep('construcao-5', 'Persistência',
    'Prove que os dados sobrevivem: feche a conexão, abra o arquivo de novo e mostre o relatório.',
    'O que é diferente entre salvar o código do editor e salvar os dados do banco?',
    ['Descreva o teste que provaria a persistência para outra pessoa, passo a passo.',
      'Feche a conexão com con.close() e abra uma nova para "estoque.db" antes do SELECT. O arquivo existe no ambiente Python enquanto a sessão do projeto estiver aberta; para persistência durável, baixe o código e repita no computador.'],
    'Crie um produto, feche a conexão, reabra o mesmo arquivo e confira o produto. No computador, teste também encerrar e reabrir o programa. Não espere persistência do banco ao fechar a plataforma.')
];

// O salto apontado aqui estava no terceiro passo: ele trocava a lista por um banco, e no
// mesmo fôlego pedia editar e remover — sendo que DELETE não aparece em aula nenhuma.
// Agora a troca do armazenamento, a edição e a remoção são três degraus.
coachedProjects.api = [
  ...coachedProjects.api.slice(0, 2),
  coachStep('api-tabela', 'Trocar a lista por uma tabela',
    'Guarde os hábitos numa tabela SQLite em vez de numa lista, mantendo criar e buscar funcionando exatamente como antes.',
    'O que mudou por dentro das suas funções, e o que continuou igual para quem as chama?',
    ['Diga em português o que cada função fazia com a lista e o que ela fará com a tabela.',
      'Crie a tabela habitos com id e nome. Dentro de criar_habito, troque o append por um INSERT com parâmetros; dentro de buscar_habito, troque a busca no for por um SELECT com WHERE id = ?.'],
    'Criar e buscar precisam responder a mesma coisa de antes. É o sinal de que você trocou o armazenamento sem quebrar o serviço.'),
  coachStep('api-editar', 'Editar um hábito',
    'Acrescente a função de editar o nome de um hábito pelo id, e prove que os outros hábitos não mudaram.',
    'Como você tem certeza de que a edição pegou só o hábito certo?',
    ['Antes de escrever, diga qual parte identifica o hábito e qual parte é o valor novo.',
      'UPDATE habitos SET nome = ? WHERE id = ?, com os dois valores como parâmetros, como na aula de CRUD. Sem o WHERE, o banco altera todas as linhas.'],
    'Com três hábitos, edite o do meio e liste os três: só um pode ter mudado.'),
  coachStep('construcao-3', 'Guardar no banco',
    'Acrescente a remoção de um hábito pelo id e confira que ela some do banco, sem levar os outros junto.',
    'Como você confirma que atualizar ou remover um hábito não alterou os outros?',
    ['Diga o que precisa acontecer com o id removido e com os ids que ficaram.',
      'DELETE FROM habitos WHERE id = ? apaga a linha daquele id. É o mesmo cuidado do UPDATE: sem o WHERE, o comando apaga a tabela inteira.',
      'Teste as quatro funções — criar, buscar, editar e remover — antes de pensar nas rotas.'],
    'Remova um hábito e liste os restantes. Tente remover um id que não existe e confira que nada quebra nem some.'),
  ...coachedProjects.api.slice(3)
];

// Dois saltos aqui: extrair uma regra do próprio código nunca tinha sido praticado, e as
// funções test_ não existem em arquivo nenhum do curso. Cada um ganhou um degrau de ensaio.
coachedProjects['qualidade-projeto'] = [
  coachStep('qualidade-extrair-exemplo', 'Extrair uma regra, num exemplo pronto',
    'Pegue este programa curto e mova a regra do desconto para uma função que recebe os valores e devolve o resultado: preco = 200; desconto = 0.1; final = preco - preco * desconto; e o print do final.',
    'O que a função precisa receber para funcionar sem depender de nada de fora dela?',
    ['Diga quais valores entram e qual valor sai. A função mostra algo ou devolve algo?',
      'Escreva def preco_final(preco, desconto): com o cálculo dentro e return do resultado. O print fica fora, em quem chamou a função.'],
    'O programa precisa imprimir o mesmo 180.0 de antes. Chame a função com outros valores e confira que ela responde sem nenhum print dentro.'),
  coachedProjects['qualidade-projeto'][0],
  coachedProjects['qualidade-projeto'][1],
  coachedProjects['qualidade-projeto'][2],
  coachStep('qualidade-nomear-testes', 'Um teste com nome',
    'Pegue dois dos seus asserts e coloque cada um dentro de uma função com nome que comece por test_. Chame as duas no fim do arquivo.',
    'O que você ganha ao dar nome a um teste, em vez de deixar o assert solto?',
    ['Diga em voz alta o que cada assert está conferindo. Esse é o nome da função.',
      'Por exemplo: def test_caso_comum(): com o assert dentro, e depois test_caso_comum() no fim do arquivo para executá-la. O nome começando por test_ é convenção: ferramentas de teste procuram por ele.'],
    'Execute: sem erro, os dois testes passaram. Estrague um dos valores esperados de propósito e confira que o erro aponta o nome da função que falhou.'),
  coachedProjects['qualidade-projeto'][3],
  coachedProjects['qualidade-projeto'][4]
];

// Três saltos: o fluxo completo vinha de uma vez sobre um problema que o estudante acabou de
// inventar; modelar a tabela e migrar os dados eram o mesmo passo; e separar funções, testar
// e tratar falhas também. Os degraus novos praticam cada parte num pedaço pequeno do projeto.
coachedProjects.final = [
  coachedProjects.final[0],
  coachStep('final-uma-entrada', 'A menor entrada do seu sistema',
    'Do que você planejou, escolha UMA informação que o sistema precisa receber. Receba só ela e mostre de volta o que chegou.',
    'Essa informação chega como texto? Precisa virar número em algum momento?',
    ['Diga qual é a informação mais simples do seu plano. Se tiver dúvida, escolha a que tem menos regras.',
      'Uma linha para receber com input e outra para mostrar. Se for número, converta em uma terceira linha, separada.'],
    'Execute e responda um valor. O que aparece precisa ser exatamente o que você digitou.'),
  coachStep('final-uma-regra', 'A primeira regra',
    'Acrescente uma regra que aceite ou recuse essa informação, mostrando uma mensagem diferente em cada caso.',
    'O que exatamente torna um valor inválido no seu problema?',
    ['Escreva a regra em uma frase, em português, antes de escrever o if.',
      'Um if com a condição da recusa e um else para o caminho normal. Mensagens diferentes nos dois lados, para você ver qual caminho rodou.'],
    'Teste com um valor válido e um inválido. As duas mensagens precisam aparecer, cada uma na sua vez.'),
  coachedProjects.final[1],
  coachStep('final-modelar-tabela', 'Desenhar a tabela antes de usá-la',
    'Liste quais colunas a sua tabela precisa ter, com o tipo de cada uma, e crie a tabela vazia. Não grave nada ainda.',
    'Que informação do seu fluxo precisa sobreviver ao fim do programa, e qual é descartável?',
    ['Escreva as colunas numa lista em português primeiro: nome da coluna e que tipo de valor guarda.',
      'CREATE TABLE IF NOT EXISTS com as colunas que você listou, como nos projetos de estoque e de API. Um id inteiro costuma ser a primeira coluna.'],
    'Execute duas vezes e confira que a tabela existe e continua vazia. Uma consulta de contagem deve devolver zero registros.'),
  coachedProjects.final[2],
  coachStep('final-funcao-testada', 'Uma função sua, com um teste',
    'Separe uma regra do seu fluxo numa função que recebe valores e devolve o resultado, e escreva um assert que confira um caso conhecido.',
    'O que essa função precisa devolver para que um teste consiga julgá-la?',
    ['Escolha a regra mais simples que você já escreveu. Ela usa input por dentro? Então tire o input de lá.',
      'A função recebe os valores como parâmetros e termina com return. O teste é uma linha: assert sua_funcao(valores) == resultado_esperado.'],
    'Rode com o valor certo e sem erro. Depois troque o esperado de propósito, veja o assert falhar e volte ao certo.'),
  coachedProjects.final[3],
  coachedProjects.final[4]
];

export const calculatorCoaching = {
  valores: ['Guarde uma renda de 3000.0 e três despesas: 1200.0, 450.0 e 300.0. Mostre só a renda.', 'Se você tirar o print, a renda deixa de ser guardada ou apenas deixa de aparecer?', ['Cada informação precisa de um nome. Use uma linha para cada valor.', 'Lembre de outra situação: idade = 18 guarda um número; print(idade) mostra esse número. Use essa ideia com a renda.']],
  total: ['Some as três despesas e mostre quanto foi gasto ao todo.', 'Se a terceira despesa aumentar 100, o que deve acontecer com o total?', ['Mantenha as variáveis do passo anterior. Qual símbolo soma?', 'Guarde a soma em total_despesas. Mostre só essa variável para conferir o passo.']],
  saldo: ['Calcule quanto sobra da renda depois das despesas. Mostre com duas casas decimais.', 'As duas casas decimais mudaram o número guardado no saldo ou só a forma de mostrar? Como você provaria isso?', ['Use a renda e o total que você já calculou. Guarde o resultado em saldo.', 'Para mostrar casas decimais, um exemplo com outro valor é print(f"{preco:.2f}"). O formato muda a aparência, não a conta.']],
  pergunta: ['Faça uma pergunta sobre a despesa, guarde a resposta e mostre o que recebeu. Responda 1200 para testar.', 'O que input devolve: texto ou número? O que muda quando você coloca uma frase entre os parênteses?', ['Primeiro faça só a pergunta. Na próxima linha, mostre a resposta.', 'Em outro contexto: nome = input("Qual é seu nome? "). O texto entre aspas é a pergunta; nome guarda a resposta. Adapte para sua despesa.']],
  conversao: ['Leia a despesa como texto. Na próxima linha, transforme em número decimal e mostre. Responda 1200.', 'Por que ler a resposta e convertê-la são duas ações diferentes?', ['Use dois nomes: um para o texto lido, outro para o número convertido.', 'float converte texto numérico. Exemplo com outro contexto: temperatura = float(leitura). Não coloque uma chamada de função à esquerda de =.']],
  entrada: ['Troque os quatro valores fixos por perguntas e calcule o saldo com as respostas.', 'Se mudar a renda digitada, qual parte do seu programa precisa mudar para calcular o novo saldo?', ['Faça a dupla perguntar/converter uma vez e teste. Depois repita para as três despesas.', 'As contas ficam depois das perguntas. Reaproveite o cálculo do total e do saldo que você já construiu.']],
  relatorio: ['Mostre renda, despesas e saldo, cada um em uma linha com seu nome e duas casas.', 'Nas suas três linhas, o que fica fora das chaves e o que fica dentro? E se o saldo for negativo, isso é erro de Python ou resultado válido?', ['Use três prints, cada um mostrando uma das variáveis que você já calculou.', 'Na f-string, o nome que você quer mostrar fica fora das chaves. Exemplo de outra situação: print(f"Preço: {preco:.2f}").']]
};
