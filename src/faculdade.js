// A disciplina Linguagem de Programação (Anhanguera), na ordem da ementa.
//
// Por que esta trilha existe separada das 8 etapas: as etapas são sequenciais — moduleIsOpen
// exige toda etapa anterior completa — e o estudante está na etapa 02. Pôr a Unidade 2 e a
// Unidade 3 da faculdade como etapa 09 as deixaria travadas atrás de 48 aulas e 8 projetos,
// que é exatamente o contrário do que serve para quem tem prova chegando. Aqui não há trava:
// a faculdade cobra este conteúdo agora.
//
// Todo exemplo parte do material do professor. Os erros tipográficos dos PDFs são corrigidos e,
// quando uma biblioteca não roda no navegador (KivyMD e TensorFlow), a mesma ideia é praticada
// numa versão pequena e executável. Nenhuma saída esperada foi escrita de cabeça:
// scripts/check-faculdade.mjs executa exemplo, início e solução de cada aula no Pyodide real.

const aula = (id, titulo, unidade, teoria, exemplo, desafio, starter, esperado, pergunta, opcoes, resposta = 0, extras = {}) =>
  ({ id, titulo, unidade, teoria: teoria.split('|'), exemplo, desafio, starter, esperado, pergunta, opcoes, resposta, minutos: 20, ...extras });

const regra = (id, descricao, teste) => ({
  id, descricao,
  atende: typeof teste === 'function' ? teste : codigo => teste.test(codigo)
});
const semComentarios = codigo => String(codigo || '').split('\n').map(linha => linha.replace(/#.*$/, '')).join('\n');

// Saída correta é necessária, mas não prova que o assunto foi usado. Estas regras são poucas e
// deliberadamente abertas: não cobram nome de variável nem uma solução idêntica à referência;
// apenas a técnica central anunciada no enunciado. Assim `print("15")` não conclui uma aula de
// repetição, enquanto outra solução legítima com for continua aceita.
export const requisitosFaltandoDaFaculdade = (item, codigo) => {
  const limpo = semComentarios(codigo);
  return (item?.requisitosCodigo || []).filter(requisito => !requisito.atende(limpo));
};

// O calendário da disciplina separa três datas que antes estavam fundidas numa só. Confundi-las
// custa dias de estudo: a plataforma marcava a prova em 27/09 quando ela é em 30/09, e tratava
// o trabalho com o mesmo prazo da prova quando ele vai até outubro.
export const FIM_DO_ESTUDO = '2026-09-27';   // fim do período de estudo no AVA: aulas concluídas
export const DATA_PROVA = '2026-09-30';      // primeira chamada, dentro da janela de 26/09 a 03/10
export const PRAZO_TRABALHO = '2026-10-17';  // o calendário diz 17/10 e a tela de envio, 27/10:
                                             // vale a mais curta, que é a que não corre risco.

const comoData = (iso) => {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Uma data por extenso, para as datas aparecerem na tela sem ninguém reescrever "27 de
// setembro" à mão em seis lugares — que foi como a data errada se espalhou.
export const porExtenso = (iso) => {
  const data = comoData(iso);
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
};
export const emNumeros = (iso) => {
  const data = comoData(iso);
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
};

const diasAte = (iso, hoje) => {
  const alvo = comoData(iso);
  const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.ceil((alvo - dataAtual) / 86400000);
};

export const diasAteProva = (hoje = new Date()) => diasAte(DATA_PROVA, hoje);
export const diasAteOFimDoEstudo = (hoje = new Date()) => diasAte(FIM_DO_ESTUDO, hoje);

export const unidades = [
  {
    id: 'u1', numero: '1', titulo: 'Introdução à Linguagem Python', cor: 'yellow', icone: 'BookOpenCheck',
    resumo: 'Linguagem Python, ferramentas, variáveis, tipos, condicionais, repetições e funções.',
    competencia: 'Conhecer os fundamentos e aplicar o pensamento lógico para construir programas em Python.'
  },
  {
    id: 'u2', numero: '2', titulo: 'Explorando Recursos do Python', cor: 'purple', icone: 'Boxes',
    resumo: 'Sequências, listas, tuplas, conjuntos, dicionários, NumPy, classes, herança, módulos e Matplotlib.',
    competencia: 'Identificar os pilares da orientação a objetos e sua utilização na linguagem de programação com Python.'
  },
  {
    id: 'u3', numero: '3', titulo: 'Introdução à Análise de Dados com Python', cor: 'blue', icone: 'ChartNoAxesColumn',
    resumo: 'SQL e SQLite, CRUD, pandas, manipulação de dados e visualização com Matplotlib e Seaborn.',
    competencia: 'Compreender os principais recursos de banco de dados e bibliotecas na linguagem Python.'
  },
  {
    id: 'u4', numero: '4', titulo: 'Aplicações com Python', cor: 'teal', icone: 'PanelsTopLeft',
    resumo: 'Programação web e mobile, testes automatizados e fundamentos de machine learning.',
    competencia: 'Diferenciar contextos de utilização do Python e escolher ferramentas adequadas para cada aplicação.'
  }
];

export const aulasDaFaculdade = [
  // ————————————————————————————— Unidade 1 —————————————————————————————
  aula('u1a1', 'A linguagem Python: ferramentas, variáveis e tipos', 'u1',
    'Python é uma linguagem de alto nível, lançada por Guido van Rossum em 1991. Sua sintaxe legível, a comunidade e o ecossistema explicam o uso em automação, web, análise de dados e inteligência artificial. PEP 8 reúne convenções para manter o código consistente e fácil de ler.|O interpretador executa o código Python. Uma IDE reúne editor e ferramentas, como VS Code e PyCharm. Jupyter Notebook e Google Colab executam blocos no navegador; o PyCampus usa CPython compilado para o navegador pelo Pyodide.|Uma variável guarda uma referência a um valor. O Python reconhece o tipo pelo valor atribuído: int para inteiros, float para decimais, str para textos e bool para True ou False. type(valor) revela esse tipo.|input() sempre devolve texto. Para fazer contas, converta com int() ou float(). O fluxo básico de um algoritmo é entrada, processamento e saída; f-strings permitem combinar texto e valores na apresentação.',
    ['nome = "Ana"', 'nota_1 = 7', 'nota_2 = 8.5', 'fez_inscricao = True', '', 'media = (nota_1 + nota_2) / 2', 'print(type(nome).__name__)', 'print(type(nota_1).__name__)', 'print(f"{nome}: media {media}")', 'print("Inscricao:", fez_inscricao)'].join('\n'),
    'As quatro notas chegaram como texto. Converta cada uma para número, calcule a média e mostre exatamente “Media: 7.0”.',
    ['nota_1 = "6"', 'nota_2 = "7"', 'nota_3 = "7"', 'nota_4 = "8"', '# Converta, calcule a media e mostre o resultado', ''].join('\n'),
    'Media: 7.0',
    'Por que usamos float(nota_1) antes de calcular a média?',
    ['Para transformar o texto da nota em número e permitir a conta', 'Para mostrar a nota automaticamente', 'Para manter a nota como texto'], 0,
    { naFormacao: ['Olá, Python', 'Variáveis e memória', 'Tipos e conversões', 'Entrada de dados'], origem: 'Unidade 1 · Aula 1',
      requisitosCodigo: [
        regra('conversao', 'converter as notas com int() ou float()', /\b(?:int|float)\s*\(/),
        regra('media', 'calcular a média com soma e divisão', /\+[^\n]*\/\s*4|sum\s*\([^)]*\)\s*\/\s*4/)
      ] }),

  aula('r1', 'Condicionais: operadores, lógica e decisões', 'u1',
    'Os operadores relacionais comparam valores: <, <=, >, >=, == e !=. O resultado de cada comparação é True ou False. Os operadores and, or e not combinam ou invertem essas condições.|if testa o primeiro caminho. elif testa outro caminho somente quando os anteriores falham. else trata tudo o que sobrou e não recebe condição. A ordem importa: teste primeiro a faixa mais específica ou organize limites sem deixar buracos.|No exercício dos três filmes, idade e disponibilidade precisam ser verificadas juntas. Uma pessoa pode estar na faixa correta e ainda assim não conseguir assistir se não houver ingresso.|Na formação geral, este conteúdo também aparece em “Decisões com if, elif e else” e “Combinando condições”. Aqui ele fica liberado para a revisão da prova.',
    ['idade = 15', 'tem_ingresso = True', '', 'if idade < 12:', '    filme = 1', 'elif idade < 18:', '    filme = 2', 'else:', '    filme = 3', '', 'if tem_ingresso:', '    print(f"Filme {filme} disponivel")', 'else:', '    print("Sem ingressos")'].join('\n'),
    'Use idade e tem_ingresso para mostrar exatamente “Filme 2 disponivel”. Organize as faixas com if, elif e else e confirme que existe ingresso.',
    'idade = 15\ntem_ingresso = True\n# Descubra o filme e verifique o ingresso\n',
    'Filme 2 disponivel',
    'Em uma cadeia if / elif / else, quando o bloco elif é testado?',
    ['Somente quando as condições anteriores foram falsas', 'Sempre, mesmo depois de um if verdadeiro', 'Somente quando existe um else'], 0,
    { naFormacao: ['Decisões com if, elif e else', 'Combinando condições'], origem: 'Unidade 1 · Aula 2',
      requisitosCodigo: [regra('if', 'decidir a faixa com if', /\bif\b/), regra('alternativa', 'tratar outra faixa com elif ou else', /\b(?:elif|else)\b/), regra('ingresso', 'usar tem_ingresso na decisão', /\bif\s+tem_ingresso\b|\band\s+tem_ingresso\b/)] }),

  aula('r2', 'Repetições: for, while, range, break e continue', 'u1',
    'for percorre uma sequência ou os valores de range. range(1, 6) produz 1, 2, 3, 4 e 5: o limite final fica de fora.|while repete enquanto uma condição for verdadeira. Ele é indicado quando a quantidade de repetições não é conhecida antes. Atualize a condição dentro do laço para evitar repetição infinita.|break encerra o laço atual. continue pula o restante daquela volta e segue para a próxima. Exemplo: num programa que pede cinco notas, digitar 0 pode acionar break e encerrar antes da quinta.|Na formação geral, revise “Repetições com for” e “Repetições com while”. Esta aula reúne exatamente os controles citados pelo professor.',
    ['notas = [5, 4, 0, 3, 5]', 'soma = 0', 'quantidade = 0', '', 'for nota in notas:', '    if nota == 0:', '        break', '    soma += nota', '    quantidade += 1', '', 'print("Filmes avaliados:", quantidade)', 'print("Media:", soma / quantidade)'].join('\n'),
    'Percorra as notas [5, 4, 3, 2, 1] com for e mostre somente a soma. Use range ou percorra a lista diretamente.',
    'notas = [5, 4, 3, 2, 1]\ntotal = 0\n# Some usando for e mostre o total\n',
    '15',
    'Qual comando encerra imediatamente o laço atual?',
    ['break', 'continue', 'range'], 0,
    { naFormacao: ['Repetições com for', 'Repetições com while'], origem: 'Unidade 1 · Aula 3',
      requisitosCodigo: [regra('for', 'percorrer as notas com for', /\bfor\b/), regra('acumula', 'acumular os valores durante a repetição', /\+=|=\s*\w+\s*\+|\bsum\s*\(/)] }),

  aula('r3', 'Funções: built-ins, parâmetros, retorno e lambda', 'u1',
    'Funções built-in já vêm prontas no Python: print, len, sum, max, min e type são exemplos. Elas evitam reescrever operações comuns.|Uma função criada por você começa com def. Parâmetros recebem os dados; return devolve o resultado para quem chamou. print apenas exibe e não substitui return.|lambda cria uma função anônima curta com uma única expressão. Por exemplo, dobro = lambda numero: numero * 2. Use lambda quando a operação for pequena e local; para regras maiores, def fica mais legível.|Na formação geral, este assunto aparece em “Suas primeiras funções”, “Decompondo um problema” e na aula de ordenação com lambda.',
    ['def calcular_media(notas):', '    return sum(notas) / len(notas)', '', 'media = calcular_media([7, 8, 9])', 'print(media)', '', 'dobro = lambda numero: numero * 2', 'print(dobro(4))'].join('\n'),
    'Crie a função calcular_media(notas), usando sum e len, e mostre a média de [7, 8, 9].',
    'def calcular_media(notas):\n    # devolva a media\n    pass\n\nprint(calcular_media([7, 8, 9]))\n',
    '8.0',
    'Qual é a diferença principal entre return e print?',
    ['return devolve um valor ao código; print apenas o exibe', 'print devolve um valor e return apenas exibe', 'Não existe diferença'], 0,
    { naFormacao: ['Suas primeiras funções', 'Decompondo um problema', 'Ordenando e filtrando'], origem: 'Unidade 1 · Aula 4',
      requisitosCodigo: [regra('def', 'criar calcular_media com def', /\bdef\s+calcular_media\s*\(/), regra('return', 'devolver a média com return', /\breturn\b/), regra('sum-len', 'calcular usando sum() e len()', /\bsum\s*\([^)]*\)[\s\S]*\blen\s*\(/)] }),

  // ————————————————————————————— Unidade 2 —————————————————————————————
  aula('u2a1', 'Estruturas de dados I: sequências, listas e tuplas', 'u2',
    'Em Python tudo gira em torno de objetos. Sequências são estruturas que guardam coleções ordenadas, indexadas por inteiros não negativos: o primeiro elemento está no índice 0 e o último na posição n - 1, onde n é o tamanho.|As operações comuns a toda sequência, do Quadro 1 da apostila: x in s testa se um item existe; s + t concatena; n * s repete; s[i] acessa uma posição; s[i:j] fatia da posição i até antes de j; s[i:j:k] fatia com passo k; len(s) dá o tamanho; min(s) e max(s) dão o menor e o maior; s.count(x) conta ocorrências.|Texto (str) também é sequência, e é imutável: não dá para trocar uma letra por atribuição. Listas são sequências mutáveis — dá para adicionar, remover e alterar. O método index devolve a posição de um valor na lista.|Tuplas são sequências imutáveis. Crie com parênteses: vazia com (), com valores com ("a", "b", "c"), ou com o construtor tuple(). Uma vez criada, não muda. Tupla com um único item precisa da vírgula: ("a",). Sem ela, ("a") é só o texto "a" entre parênteses. enumerate() devolve a posição e o valor a cada volta, o que evita controlar um contador à mão.|Para transformar ou filtrar uma sequência inteira existem três caminhos. A list comprehension é o jeito pythônico: [item.lower() for item in linguagens] devolve uma lista nova com cada item em minúsculas. map(funcao, sequencia) aplica a função a cada elemento — list(map(lambda x: x * 5.25, precos)) converte todos os preços de uma vez. filter(funcao, sequencia) guarda só os elementos em que a função dá True: list(filter(lambda x: x % 2 == 0, numeros)) devolve apenas os pares. Repare que map e filter recebem a função como argumento e devolvem um objeto que precisa de list() para virar lista.',
    ['texto = "Explorando a diversidade de linguagens de programacao com Python."',
      'print(f"Tamanho do texto = {len(texto)}")',
      'print(f"Python in texto = {\'Python\' in texto}")',
      'print(f"Quantidade de e no texto = {texto.count(\'e\')}")',
      'print(f"As 5 primeiras letras sao: {texto[:5]}")',
      '',
      'cores = ["vermelho", "azul", "verde"]',
      'for cor in cores:',
      '    print(f"Posicao = {cores.index(cor)}, cor = {cor}")',
      '',
      'vogais = ("a", "e", "i", "o", "u")',
      'print(f"Tipo do objeto vogais = {type(vogais)}")',
      'for p, x in enumerate(vogais):',
      '    print(f"Posicao = {p}, valor = {x}")'].join('\n'),
    'Crie a tupla dias com "seg", "ter" e "qua". Mostre o tamanho dela, depois percorra com enumerate mostrando "0 seg", "1 ter" e "2 qua", um por linha.',
    'dias = ("seg", "ter", "qua")\n# Mostre o tamanho e depois percorra com enumerate\n',
    '3\n0 seg\n1 ter\n2 qua',
    'Qual é a diferença essencial entre lista e tupla?',
    ['A lista é mutável e a tupla não pode ser alterada depois de criada', 'A tupla só aceita texto e a lista só aceita números', 'A tupla é mais rápida porque não usa índices'],
    0, { origem: 'Unidade 2 · Aula 1', naFormacao: ['Trabalhando com textos', 'Listas e índices', 'Tuplas e conjuntos', 'Compreensões de listas'],
      requisitosCodigo: [regra('tupla', 'guardar os dias numa tupla', /dias\s*=\s*\(/), regra('len', 'mostrar o tamanho com len()', /\blen\s*\(/), regra('enumerate', 'percorrer posição e valor com enumerate()', /\benumerate\s*\(/)] }),

  aula('u2a2', 'Estruturas de dados II: conjuntos, dicionários e NumPy', 'u2',
    'Um conjunto (set) guarda elementos únicos, sem repetição, como um conjunto da matemática. Ele habilita união, interseção e diferença, e serve para eliminar duplicados. Crie com chaves — {"a", "b"} — ou com set(iteravel). add(valor) acrescenta e remove(valor) retira. Cuidado com a pegadinha: {} vazio cria um dicionário, não um conjunto; o conjunto vazio é set().|Dicionários (dict) associam chaves a valores e são mutáveis. Quatro formas de criar, todas equivalentes: começar vazio com {} e atribuir por chave; escrever os pares direto — {"nome": "Maria", "idade": 25}; usar dict([("nome", "Maria")]); ou combinar duas listas com dict(zip(chaves, valores)).|Acesse um valor com dicionario[chave] e atribua com dicionario[chave] = novo_valor.|NumPy é a biblioteca para computação científica: arrays multidimensionais e operações em massa. Importe com import numpy as np. Um array opera elemento a elemento: my_array ** 2 eleva todos ao quadrado de uma vez, sem laço. np.sum soma tudo. Aqui no PyCampus o NumPy é baixado sozinho quando você escreve o import.',
    ['meu_conjunto = set()',
      'meu_conjunto.add(10)',
      'meu_conjunto.add(20)',
      'meu_conjunto.add(20)',
      'print("Conjunto:", sorted(meu_conjunto))',
      'meu_conjunto.remove(20)',
      'print("Depois de remover 20:", sorted(meu_conjunto))',
      '',
      'dici_1 = {}',
      'dici_1["nome"] = "Maria"',
      'dici_1["idade"] = 25',
      'dici_2 = {"nome": "Maria", "idade": 25}',
      'dici_3 = dict([("nome", "Maria"), ("idade", 25)])',
      'dici_4 = dict(zip(["nome", "idade"], ["Maria", 25]))',
      'print(dici_1 == dici_2 == dici_3 == dici_4)',
      '',
      'import numpy as np',
      'my_array = np.array([1, 2, 3, 4, 5])',
      'print("Ao quadrado:", my_array ** 2)',
      'print("Soma:", np.sum(my_array))',
      'print("Indice 2:", my_array[2])'].join('\n'),
    'A lista notas tem valores repetidos. Use um conjunto para descobrir quantos valores DIFERENTES existem e mostre só esse número.',
    'notas = [7, 8, 7, 9, 8, 10]\n# Use set() e len() em uma linha\n',
    '4',
    'Para que serve um conjunto (set)?',
    ['Guardar valores únicos, sem repetição', 'Guardar pares de chave e valor', 'Guardar valores em ordem fixa que não muda'],
    0, { origem: 'Unidade 2 · Aula 2', naFormacao: ['Dicionários: chave e valor', 'Tuplas e conjuntos'], focoFaculdade: 'NumPy e suas operações com arrays são conteúdo específico desta trilha.',
      requisitosCodigo: [regra('set', 'eliminar repetições com set()', /\bset\s*\(/), regra('len', 'contar os valores diferentes com len()', /\blen\s*\(/)] }),

  aula('u2a3', 'Classes, métodos e herança', 'u2',
    'A orientação a objetos organiza o código em torno de objetos, cada um representando algo do mundo real. A classe é o molde; o objeto é o que nasce dele. Uma classe reúne atributos (os dados, o estado) e métodos (os comportamentos).|Os cinco componentes que a apostila cobra: atributos, métodos, encapsulamento (juntar dados e comportamento numa entidade e controlar o acesso), herança (uma classe herdar de outra) e polimorfismo (classes diferentes respondendo de formas diferentes à mesma mensagem).|Em Python, class abre a classe. O método __init__ é o construtor: roda quando o objeto é criado e inicializa os atributos. self é a convenção que se refere à própria instância — self.nome = nome guarda o valor naquele objeto.|A classe-filha é declarada com o nome da classe-pai entre parênteses: class Carro(Veiculo). Ela herda atributos e métodos e pode reescrevê-los. super().__init__(...) chama o construtor da classe-pai em vez de repetir o código dele. Python aceita herança múltipla: class Filha(Pai1, Pai2).',
    ['class Veiculo:',
      '    def __init__(self, marca, modelo, ano):',
      '        self.marca = marca',
      '        self.modelo = modelo',
      '        self.ano = ano',
      '        self.velocidade = 0',
      '',
      '    def acelerar(self, incremento):',
      '        self.velocidade += incremento',
      '',
      '    def status(self):',
      '        return f"Marca: {self.marca}, Modelo: {self.modelo}, Ano: {self.ano}, Velocidade: {self.velocidade} km/h"',
      '',
      'class Carro(Veiculo):',
      '    def __init__(self, marca, modelo, ano, potencia):',
      '        super().__init__(marca, modelo, ano)',
      '        self.potencia = potencia',
      '',
      '    def acelerar(self, incremento):',
      '        self.velocidade += incremento + self.potencia',
      '',
      'carro1 = Carro("Toyota", "Corolla", 2022, 150)',
      'carro1.acelerar(50)',
      'print(carro1.status())'].join('\n'),
    'A classe Pessoa já está pronta. Crie a pessoa1 com nome Joao e idade 30, mostre o cumprimento e depois a idade depois de um aniversário.',
    ['class Pessoa:',
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
      '# Crie pessoa1, mostre o cumprimento, faca aniversario e mostre a nova idade',
      ''].join('\n'),
    'Ola, meu nome e Joao.\n31',
    'Para que serve super().__init__(...) na classe-filha?',
    ['Chamar o construtor da classe-pai em vez de repetir o código dele', 'Criar um objeto novo da classe-pai', 'Impedir que a classe-filha altere os atributos'],
    0, { origem: 'Unidade 2 · Aula 3', naFormacao: ['Classes e objetos', 'Construtores e atributos', 'Encapsulamento e propriedades', 'Herança e polimorfismo'],
      requisitosCodigo: [regra('instancia', 'criar pessoa1 chamando Pessoa(...)', /pessoa1\s*=\s*Pessoa\s*\(/), regra('metodo', 'chamar o método aniversario()', /pessoa1\.aniversario\s*\(/)] }),

  aula('u2a4', 'Módulos, bibliotecas e Matplotlib', 'u2',
    'Módulos são componentes de código que reúnem funções, e servem para reaproveitar código entre programas. Na prática um módulo é uma biblioteca de funções: math traz funções matemáticas, os traz funções do sistema operacional.|Três formas de usar um módulo. A primeira carrega tudo e você chama pelo nome do módulo: import math, depois math.sqrt(25). A segunda dá um apelido: import math as m, depois m.sqrt(25). A terceira carrega só o que você vai usar: from math import sqrt, e então sqrt(25) direto.|Os módulos se classificam em três tipos. Built-in vêm no interpretador e não precisam de instalação: math, os, sys, random, datetime, re, collections. De terceiros são criados fora e distribuídos pelo PyPI, instalados com pip install nome — é o caso de NumPy, pandas e Matplotlib. Próprios são os que você mesmo escreve.|Matplotlib é a biblioteca de gráficos mais usada em Python. O módulo pyplot dá a interface de alto nível: import matplotlib.pyplot as plt. plt.plot faz um gráfico de linha, plt.bar um de barras, plt.xlabel e plt.ylabel rotulam os eixos, plt.title dá o título e plt.show exibe. Aqui no PyCampus o gráfico aparece logo abaixo da saída do programa.',
    ['import math',
      'print("sqrt(25) =", math.sqrt(25))',
      '',
      'import math as m',
      'print("log2(1024) =", m.log2(1024))',
      '',
      'from math import factorial',
      'print("factorial(5) =", factorial(5))',
      '',
      'import matplotlib',
      'matplotlib.use("Agg")',
      'import matplotlib.pyplot as plt',
      '',
      'meses = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio"]',
      'vendas = [120, 90, 150, 80, 200]',
      'plt.bar(meses, vendas, color="royalblue")',
      'plt.xlabel("Mes")',
      'plt.ylabel("Vendas (em unidades)")',
      'plt.title("Vendas Mensais")',
      'print("Barras no grafico:", len(plt.gca().patches))',
      'print("Titulo:", plt.gca().get_title())'].join('\n'),
    'Importe o módulo math com o apelido m e mostre a raiz quadrada de 144 como número inteiro.',
    '# Importe com apelido e mostre a raiz de 144\n',
    '12',
    'O que import math as m muda em relação a import math?',
    ['Passa a chamar as funções por m.sqrt em vez de math.sqrt', 'Carrega só a função sqrt na memória', 'Instala o módulo math antes de usar'],
    0, { origem: 'Unidade 2 · Aula 4', naFormacao: ['Módulos e ambientes virtuais'], focoFaculdade: 'Matplotlib e a criação dos gráficos da apostila são aprofundados aqui.',
      requisitosCodigo: [regra('apelido', 'importar math com um apelido', /\bimport\s+math\s+as\s+\w+/), regra('sqrt', 'calcular a raiz com sqrt()', /\.sqrt\s*\(/)] }),

  // ————————————————————————————— Unidade 3 —————————————————————————————
  aula('u3a1', 'Banco de dados: SQL, SQLite e CRUD', 'u3',
    'SQL é a linguagem para falar com bancos relacionais, padronizada pelo ANSI em 1986. Suas instruções se agrupam em três categorias, e a prova cobra os nomes: DDL (Data Definition Language) define a estrutura — CREATE, ALTER, DROP; DML (Data Manipulation Language) mexe nos dados — SELECT, INSERT, UPDATE, DELETE; DCL (Data Control Language) controla o acesso — GRANT e REVOKE.|SQLite é um banco completo escrito em C que não precisa de servidor separado: ele lê e escreve direto num arquivo. Um banco inteiro, com tabelas, índices e visões, cabe num único arquivo. Python traz o módulo sqlite3 embutido.|Antes de qualquer comando é preciso conectar dois processos distintos: o seu programa e o SGBD. ODBC (Open Database Connectivity) e JDBC (Java Database Connectivity) são as interfaces padronizadas que tornam isso possível. Quem traduz as chamadas para a língua de cada banco é o driver — e é por causa dele que uma aplicação troca de SGBD sem recompilar o código. No Python, o PEP 249 (Python Database API Specification v2.0) fixa as regras que todo módulo de banco deve seguir; a principal é oferecer um connect(parametros...). Por isso trocar de banco costuma significar trocar só os parâmetros da conexão.|CRUD é Create, Read, Update e Delete. Os passos são sempre os mesmos: abrir a conexão, criar um cursor e executar o comando, gravar com commit e fechar. Sem o commit, o SQLite desfaz o que foi feito.|Nunca monte a consulta concatenando valores dentro do texto. Use ? como marcador e passe os valores separados: cursor.execute("INSERT INTO Contatos (nome) VALUES (?)", (nome,)). Isso é o que impede injeção de SQL. fetchone devolve um registro; fetchall devolve todos.',
    ['import sqlite3',
      '',
      'conn = sqlite3.connect(":memory:")',
      'cursor = conn.cursor()',
      'cursor.execute("""',
      '    CREATE TABLE IF NOT EXISTS Produtos (',
      '        id INTEGER PRIMARY KEY,',
      '        nome TEXT NOT NULL,',
      '        preco REAL NOT NULL,',
      '        estoque INTEGER',
      '    )',
      '""")',
      '',
      'cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Camiseta", 19.99, 50))',
      'conn.commit()',
      '',
      'cursor.execute("SELECT * FROM Produtos")',
      'print("Depois do INSERT:", cursor.fetchall())',
      '',
      'cursor.execute("UPDATE Produtos SET preco = ? WHERE id = ?", (24.99, 1))',
      'conn.commit()',
      'cursor.execute("SELECT nome, preco FROM Produtos")',
      'print("Depois do UPDATE:", cursor.fetchone())',
      '',
      'cursor.execute("DELETE FROM Produtos WHERE id = ?", (1,))',
      'conn.commit()',
      'cursor.execute("SELECT * FROM Produtos")',
      'print("Depois do DELETE:", cursor.fetchall())',
      'conn.close()'].join('\n'),
    'A tabela Contatos já está criada e aberta. Insira o contato Maria com o e-mail maria@email.com usando parâmetros com ?, confirme com commit e mostre o resultado de SELECT * FROM Contatos.',
    ['import sqlite3',
      'conn = sqlite3.connect(":memory:")',
      'cursor = conn.cursor()',
      'cursor.execute("CREATE TABLE Contatos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT)")',
      '# Insira Maria com parametros, confirme e mostre a tabela',
      ''].join('\n'),
    "[(1, 'Maria', 'maria@email.com')]",
    'CREATE TABLE pertence a qual categoria do SQL?',
    ['DDL, porque define a estrutura do banco', 'DML, porque manipula os dados', 'DCL, porque controla o acesso'],
    0, { origem: 'Unidade 3 · Aula 1', naFormacao: ['Seu primeiro banco SQLite'], focoFaculdade: 'As categorias DDL, DML e DCL e o ciclo CRUD completo são cobrados aqui.',
      requisitosCodigo: [regra('insert', 'inserir o contato com INSERT', /\bINSERT\s+INTO\b/i), regra('parametros', 'passar os valores por parâmetros com ?', /VALUES\s*\(\s*\?\s*,\s*\?\s*\)/i), regra('commit', 'confirmar a mudança com commit()', /\.commit\s*\(/), regra('select', 'consultar a tabela com SELECT', /\bSELECT\b/i)] }),

  aula('u3a2', 'pandas: Series e DataFrame', 'u3',
    'pandas é a biblioteca de código aberto para manipular e analisar dados em tabelas e séries temporais. Ela é construída sobre o NumPy. Importe com import pandas as pd.|Duas estruturas sustentam tudo. A Series é unidimensional, como uma lista com rótulos. O DataFrame é bidimensional, como uma tabela com linhas e colunas.|Crie uma Series a partir de uma lista — pd.Series([10, 20, 30]) — e os índices viram 0, 1, 2. A partir de um dicionário, as chaves viram os índices e os valores viram os dados. O parâmetro index define rótulos próprios.|Sobre a Series você aplica cálculos direto: mean() dá a média, sum() a soma, max() e min() os extremos. Um DataFrame nasce de um dicionário de listas, em que cada chave é uma coluna.|pandas lê dados estruturados de muitas origens, sempre com o prefixo read_: read_csv, read_json, read_html, read_excel, read_sql. Para escrever, os métodos to_: to_csv, to_json, to_excel, to_sql. read_html procura as tabelas <table> de uma página e devolve uma lista de DataFrames.',
    ['import pandas as pd',
      '',
      'series1 = pd.Series([10, 20, 30, 40, 50])',
      'print(series1.sum(), series1.mean())',
      '',
      'data = {"A": 100, "B": 200, "C": 300}',
      'series2 = pd.Series(data)',
      'print("Indices:", list(series2.index))',
      '',
      'dados = {"Nome": ["Alice", "Bob", "Carol", "David", "Eve"], "Idade": [25, 30, 22, 35, 28]}',
      'serie_idades = pd.Series(dados["Idade"], index=dados["Nome"])',
      'print(serie_idades)',
      'print("Media de Idades:", serie_idades.mean())',
      '',
      'df = pd.DataFrame(dados)',
      'print("Formato do DataFrame:", df.shape)',
      'print("Colunas:", list(df.columns))'].join('\n'),
    'Monte uma Series com as idades 20, 30 e 40 e mostre só a média, sem texto em volta.',
    'import pandas as pd\n# Crie a Series e mostre a media\n',
    '30.0',
    'Qual é a diferença entre Series e DataFrame?',
    ['A Series é unidimensional e o DataFrame é bidimensional, como uma tabela', 'A Series só guarda números e o DataFrame só guarda texto', 'A Series é imutável e o DataFrame é mutável'],
    0, { origem: 'Unidade 3 · Aula 2', naFormacao: ['Análise de dados e estatística'], focoFaculdade: 'Series, DataFrame e os métodos read_ e to_ são aprofundados nesta trilha.',
      requisitosCodigo: [regra('series', 'montar uma Series do pandas', /\bpd\.Series\s*\(/), regra('mean', 'calcular a média com mean()', /\.mean\s*\(/)] }),

  aula('u3a3', 'pandas: capturar, transformar e extrair informação', 'u3',
    'Dados brutos quase nunca chegam prontos. A etapa de captura e transformação é o que os torna utilizáveis, e é onde mora a maior parte do trabalho real.|Linhas duplicadas distorcem qualquer conta. drop_duplicates() remove as repetidas; keep="last" mantém a última ocorrência e inplace=True salva a mudança no próprio DataFrame, em vez de devolver uma cópia.|Criar uma coluna nova é uma atribuição: df["nova_coluna"] = valor. Se o valor for único, o pandas o repete em todas as linhas. Se for um cálculo entre colunas, ele é feito linha a linha — df["preco"] = df["receita"] / df["quantidade"].|Para extrair informação existem dois caminhos principais. loc seleciona pelo rótulo do índice: df.loc[0] traz a linha de rótulo 0, df.loc[[0, 2]] traz duas linhas. iloc seleciona pela posição. Os dois coincidem enquanto o índice é 0, 1, 2…, mas deixam de coincidir depois de uma seleção: em sel = df.loc[[0, 20, 70]], a terceira linha tem rótulo 70 — ela é sel.loc[70] ou sel.iloc[2], e sel.loc[2] dá KeyError, porque não existe rótulo 2 ali. É a pegadinha que a prova cobra. O teste booleano compara uma coluna inteira e devolve True ou False para cada linha; usado dentro de df[...] ele filtra — df[df["preco"] > 50] traz só as linhas em que o preço passa de 50.',
    ['import pandas as pd',
      '',
      'data = {',
      '    "nome": ["Produto A", "Produto B", "Produto C", "Produto A", "Produto E"],',
      '    "quantidade": [3, 1, 4, 3, 2],',
      '    "tipo": ["Eletronico", "Vestuario", "Alimento", "Eletronico", "Alimento"],',
      '    "receita": [120, 80, 60, 120, 90]',
      '}',
      'df = pd.DataFrame(data)',
      'print("Antes:", df.shape)',
      '',
      'df.drop_duplicates(keep="last", inplace=True)',
      'print("Depois de tirar duplicadas:", df.shape)',
      '',
      'df["preco do item"] = df["receita"] / df["quantidade"]',
      'print(df.loc[1])',
      '',
      'itens_acima_de_50 = df[df["preco do item"] > 50]',
      'print("Itens acima de 50 reais:", list(itens_acima_de_50["nome"]))'].join('\n'),
    'O DataFrame vendas já existe. Mostre só os nomes dos produtos cuja receita passa de 100, como uma lista.',
    ['import pandas as pd',
      'vendas = pd.DataFrame({"nome": ["A", "B", "C"], "receita": [120, 80, 150]})',
      '# Filtre com teste booleano e mostre a lista de nomes',
      ''].join('\n'),
    "['A', 'C']",
    'O que faz df[df["preco"] > 50]?',
    ['Devolve só as linhas em que a coluna preco passa de 50', 'Troca por 50 todos os preços menores', 'Ordena o DataFrame pela coluna preco'],
    0, { origem: 'Unidade 3 · Aula 3', naFormacao: ['Análise de dados e estatística'], focoFaculdade: 'drop_duplicates, loc, filtros booleanos e criação de colunas são conteúdo específico desta trilha.',
      requisitosCodigo: [regra('filtro', 'filtrar o DataFrame com uma comparação maior que 100', /vendas\s*\[[\s\S]*?\[\s*["']receita["']\s*\]\s*>\s*100[\s\S]*?\]/), regra('nomes', 'selecionar a coluna nome do resultado', /\[\s*["']nome["']\s*\]/)] }),

  aula('u3a4', 'Visualização de dados: Matplotlib, pandas e Seaborn', 'u3',
    'Gráficos contam a história dos dados. Três caminhos, do mais manual ao mais especializado.|Matplotlib é a base. O pyplot cria e gerencia a figura e o eixo sozinho, e você chama plt.plot, plt.bar, plt.xlabel, plt.title. O outro estilo, orientado a objetos, cria figura e eixos explicitamente com plt.subplots e chama métodos sobre eles.|pandas tem plot() embutido, construído sobre o Matplotlib: df.plot(x="Produto", y="qtde_vendida", kind="bar") — e kind aceita bar, pie, line e outros.|Seaborn é construído sobre o Matplotlib e traz conjuntos de dados prontos, como tips. O que o diferencia é o parâmetro estimator do barplot: por padrão ele calcula a MÉDIA, mas aceita sum para somar e len para contar. Essa escolha muda a conclusão.|A apostila insiste num ponto que costuma cair em prova: o mesmo dado, com estimadores diferentes, conta histórias diferentes. Na soma os homens parecem gastar muito mais; com len você descobre que eles são muitos mais na base. Interpretar gráfico exige olhar o contexto, não só a barra mais alta.',
    ['import matplotlib',
      'matplotlib.use("Agg")',
      'import matplotlib.pyplot as plt',
      'import pandas as pd',
      '',
      'x = [1, 2, 3, 4, 5]',
      'y = [2, 4, 1, 3, 5]',
      'plt.plot(x, y)',
      'plt.xlabel("Eixo X")',
      'plt.ylabel("Eixo Y")',
      'plt.title("Exemplo de Grafico de Linha")',
      'print("Linhas no grafico:", len(plt.gca().lines))',
      'plt.close()',
      '',
      'dados = {"Produto": ["A", "B", "C"], "qtde_vendida": [33, 50, 45]}',
      'df = pd.DataFrame(dados)',
      'eixo = df.plot(x="Produto", y="qtde_vendida", kind="bar")',
      'print("Barras pelo pandas:", len(eixo.patches))',
      'plt.close()',
      '',
      'contas = pd.DataFrame({"time": ["Lunch", "Lunch", "Dinner", "Dinner", "Dinner"],',
      '                       "total_bill": [10.0, 20.0, 30.0, 40.0, 50.0]})',
      'print("Media por periodo:")',
      'print(contas.groupby("time")["total_bill"].mean())',
      'print("Soma por periodo:")',
      'print(contas.groupby("time")["total_bill"].sum())',
      'print("Contagem por periodo:")',
      'print(contas.groupby("time")["total_bill"].count())'].join('\n'),
    'Monte um gráfico de barras com os meses Jan e Fev e as vendas 120 e 90, ponha o título Vendas e mostre quantas barras a figura tem, no formato: Barras: 2',
    ['import matplotlib',
      'matplotlib.use("Agg")',
      'import matplotlib.pyplot as plt',
      '# Monte as barras, ponha o titulo e mostre a contagem',
      ''].join('\n'),
    'Barras: 2',
    'No barplot do Seaborn, o que o parâmetro estimator faz?',
    ['Escolhe a conta da barra: média por padrão, ou sum, ou len', 'Escolhe a cor das barras', 'Escolhe quantas barras cabem no gráfico'],
    0, { origem: 'Unidade 3 · Aula 4', naFormacao: ['Análise de dados e estatística'], focoFaculdade: 'Matplotlib, pandas.plot, Seaborn e estimator são aprofundados nesta trilha.',
      requisitosCodigo: [regra('bar', 'montar o gráfico com bar()', /\.bar\s*\(/), regra('titulo', 'definir o título com title()', /\.title\s*\(/), regra('contagem', 'contar as barras criadas na figura', /\.patches\b/)] }),

  // ————————————————————————————— Unidade 4 —————————————————————————————
  aula('r4', 'Web: front-end, back-end e Python', 'u4',
    'O front-end é a parte visível com a qual a pessoa interage. HTML estrutura o conteúdo, CSS cuida da apresentação e JavaScript adiciona comportamento. React, Vue e Angular ajudam a construir interfaces.|O back-end processa regras, dados e comunicação com o servidor. Python é usado principalmente aqui com Django, Flask e FastAPI. Uma API conecta as duas camadas por requisições e respostas HTTP.|Python não substitui HTML no navegador. Ele pode gerar HTML no servidor ou fornecer dados para uma interface. A página de perfil proposta pelo professor pertence ao front-end; seu envio e armazenamento pertencem ao back-end.|Na formação geral, “Como a web funciona” aprofunda HTTP e a etapa de APIs trata FastAPI. Esta aula está liberada aqui porque o conteúdo pertence à Unidade 4 da disciplina.',
    ['camadas = {', '    "front-end": ["HTML", "CSS", "JavaScript"],', '    "back-end": ["Python", "Flask", "Django"]', '}', '', 'print("Front-end:", camadas["front-end"][0])', 'print("Back-end:", camadas["back-end"][1])'].join('\n'),
    'Crie um dicionário com front-end igual a HTML e back-end igual a Flask. Mostre uma linha para cada camada exatamente como na saída esperada.',
    'camadas = {"front-end": "HTML", "back-end": "Flask"}\n# Mostre as duas camadas consultando o dicionario\n',
    'Front-end: HTML\nBack-end: Flask',
    'Qual camada cuida da lógica, do processamento e do armazenamento no servidor?',
    ['Back-end', 'Front-end', 'CSS'], 0,
    { naFormacao: ['Como a web funciona', 'Projetando uma API REST', 'Da função ao servidor'], origem: 'Unidade 4 · Aula 1',
      requisitosCodigo: [regra('dicionario', 'consultar os valores guardados no dicionário camadas', /camadas\s*\[["']front-end["']\s*\][\s\S]*camadas\s*\[["']back-end["']\s*\]/)] }),

  aula('u4a2', 'Programação mobile: Kivy, KivyMD e interfaces', 'u4',
    'Desenvolvimento mobile cria aplicativos para smartphones e tablets. Swift é comum no iOS e Kotlin ou Java no Android; com Python, Kivy e BeeWare permitem compartilhar grande parte do código entre plataformas.|Kivy é um framework de interfaces gráficas multitouch. KivyMD acrescenta componentes inspirados no Material Design, como botões, cartões, caixas de diálogo e barras de navegação. O benefício é a consistência visual; os custos incluem desempenho menor que o nativo e limitações de integração com alguns recursos do aparelho.|Widgets são os blocos da interface. Um layout organiza widgets; MDTabs separa conteúdos em abas para não sobrecarregar uma única tela. Eventos como on_press ligam um botão a um método do programa.|KivyMD não roda dentro do Pyodide e o próprio material informa que o Google Colab não gera o aplicativo. Por isso o exemplo abaixo pratica a organização das abas em Python; o aplicativo completo da calculadora deve ser executado localmente com KivyMD.',
    ['interface = {', '    "framework": "KivyMD",', '    "abas": ["Calculadora", "Historico"],', '    "multiplataforma": True', '}', '', 'print("Framework:", interface["framework"])', 'for numero, aba in enumerate(interface["abas"], start=1):', '    print(f"Aba {numero}: {aba}")'].join('\n'),
    'Organize as abas Inicio, Calculadora e Historico. Percorra a lista com enumerate começando em 1 e mostre cada número e nome exatamente como na saída esperada.',
    'abas = ["Inicio", "Calculadora", "Historico"]\n# Percorra as abas com enumerate(..., start=1)\n',
    '1 Inicio\n2 Calculadora\n3 Historico',
    'Qual é a função do MDTabs no KivyMD?',
    ['Organizar conteúdos em abas dentro da interface', 'Treinar um modelo de machine learning', 'Executar consultas SQL no celular'], 0,
    { naFormacao: ['Classes e objetos', 'Eventos e interfaces'], focoFaculdade: 'Kivy, KivyMD, widgets e MDTabs são conteúdo específico da Unidade 4.', origem: 'Unidade 4 · Aula 2', notaAmbiente: 'A interface KivyMD completa precisa ser executada no computador. Aqui você pratica a estrutura e a lógica que controlam as abas.',
      requisitosCodigo: [regra('for', 'percorrer as abas com for', /\bfor\b/), regra('enumerate', 'numerar as abas com enumerate(..., start=1)', /\benumerate\s*\([^)]*start\s*=\s*1/)] }),

  aula('u4a3', 'Testes com Python: assert, doctest e unittest', 'u4',
    'Testes verificam automaticamente se o comportamento observado coincide com o esperado. Um bom conjunto inclui o caso comum, limites, entradas vazias e situações de erro.|assert interrompe a execução quando uma condição é falsa. É útil para exercícios e verificações internas, mas não substitui validação de entrada em produção porque pode ser desativado pelo modo otimizado do Python.|doctest executa exemplos escritos na documentação com o marcador >>> e compara o resultado. Isso mantém exemplos e código sincronizados.|unittest organiza testes em classes que herdam de unittest.TestCase. Cada método começa com test_ e usa verificações como assertEqual. unittest.main() descobre e executa os testes; no notebook usa-se exit=False para não encerrar o ambiente.',
    ['import unittest', 'import io', '', 'def somar(a, b):', '    return a + b', '', 'class TestSomar(unittest.TestCase):', '    def test_positivos(self):', '        self.assertEqual(somar(2, 3), 5)', '', '    def test_limite(self):', '        self.assertEqual(somar(0, 0), 0)', '', 'suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestSomar)', 'resultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)', 'print("Testes:", resultado.testsRun)', 'print("Falhas:", len(resultado.failures) + len(resultado.errors))'].join('\n'),
    'Implemente dobro(numero) e complete TestDobro com três métodos: teste 0, 4 e -2 usando assertEqual. O executor já mostra a quantidade de testes e falhas.',
    ['import unittest', 'import io', '', 'def dobro(numero):', '    # devolva o dobro', '    pass', '', 'class TestDobro(unittest.TestCase):', '    # Crie tres metodos test_... com assertEqual', '    pass', '', 'suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestDobro)', 'resultado = unittest.TextTestRunner(stream=io.StringIO()).run(suite)', 'print("Testes executados:", resultado.testsRun)', 'print("Falhas:", len(resultado.failures) + len(resultado.errors))'].join('\n'),
    'Testes executados: 3\nFalhas: 0',
    'No unittest, por que os métodos normalmente começam com test_?',
    ['Para que o carregador os descubra automaticamente como testes', 'Para transformar o método em variável global', 'Porque assertEqual só funciona com esse prefixo'], 0,
    { naFormacao: ['Testes automatizados'], focoFaculdade: 'A Unidade 4 compara assert, doctest e unittest.', origem: 'Unidade 4 · Aula 3',
      requisitosCodigo: [regra('funcao', 'implementar dobro() com return', /\bdef\s+dobro\s*\([^)]*\)\s*:[\s\S]*?\breturn\b/), regra('classe', 'criar testes herdando de unittest.TestCase', /class\s+TestDobro\s*\(\s*unittest\.TestCase\s*\)/), regra('tres-testes', 'escrever três métodos cujo nome começa com test_', codigo => (codigo.match(/\bdef\s+test_\w*\s*\(/g) || []).length >= 3), regra('assert-equal', 'comparar resultados com assertEqual()', /\.assertEqual\s*\(/)] }),

  aula('u4a4', 'Machine learning: modelos, treinamento e previsão', 'u4',
    'Machine learning é uma área da inteligência artificial em que modelos aprendem padrões a partir de dados para prever ou decidir em casos novos. Treinar ajusta parâmetros; avaliar mede se o padrão se generaliza além dos dados usados no ajuste.|No aprendizado supervisionado, cada entrada vem acompanhada da saída correta, como mês e vendas ou e-mail e rótulo spam. No não supervisionado, não há rótulos: o algoritmo procura grupos ou estruturas. No reforço, um agente aprende ao receber recompensas e penalidades enquanto interage com um ambiente.|Árvores de decisão, redes neurais, SVM e K-Means são exemplos citados no material. TensorFlow é uma biblioteca do Google para criar e treinar modelos, especialmente redes neurais.|TensorFlow não está disponível no navegador e o exemplo extenso do PDF contém etapas fora de ordem. Para aprender o fluxo sem fingir que uma rede neural rodou, o exemplo usa NumPy para ajustar uma reta: separar dados, ajustar um padrão, prever um mês novo e interpretar a limitação.',
    ['import numpy as np', '', 'meses = np.array([1, 2, 3, 4])', 'vendas = np.array([200, 220, 250, 280])', '', 'coeficientes = np.polyfit(meses, vendas, 1)', 'previsao = np.polyval(coeficientes, 5)', '', 'print("Tipo: supervisionado")', 'print("Previsao mes 5:", round(float(previsao)))'].join('\n'),
    'Use np.polyfit para ajustar uma reta às vendas 100, 120, 140 e 160 dos meses 1 a 4. Use np.polyval para prever o mês 5 e mostre “Previsao: 180”.',
    ['import numpy as np', 'meses = np.array([1, 2, 3, 4])', 'vendas = np.array([100, 120, 140, 160])', '# Ajuste a reta, preveja o mes 5 e mostre o valor arredondado', ''].join('\n'),
    'Previsao: 180',
    'Por que a previsão de vendas é um caso de aprendizado supervisionado?',
    ['Porque o treinamento usa entradas acompanhadas das vendas corretas', 'Porque os dados não têm nenhuma resposta conhecida', 'Porque um agente recebe recompensas dentro de um jogo'], 0,
    { naFormacao: ['Análise de dados e estatística'], focoFaculdade: 'Tipos de treinamento e TensorFlow são conteúdo específico da Unidade 4.', origem: 'Unidade 4 · Aula 4', notaAmbiente: 'O PDF usa TensorFlow. O PyCampus executa uma regressão pequena com NumPy para praticar o mesmo fluxo sem afirmar que TensorFlow roda no navegador.',
      requisitosCodigo: [regra('ajuste', 'ajustar o padrão com np.polyfit()', /\bnp\.polyfit\s*\(/), regra('previsao', 'prever o mês novo com np.polyval()', /\bnp\.polyval\s*\(/)] })
];

// Aplicações "Vamos exercitar" e "É hora de praticar" dos oito PDFs. Elas ficam como roteiro
// de projeto, separadas do desafio curto de cada aula, porque são maiores e misturam assuntos.
export const tarefasDaFaculdade = [
  { id: 't-media-notas', unidade: 'u1', titulo: 'Média de notas do professor', origem: 'Unidade 1 · Aula 1',
    enunciado: 'O professor precisa avaliar os estudantes constantemente e quer automatizar a média das notas. Receba quatro notas, converta cada uma para número, calcule a média e informe se a pessoa foi aprovada, com média maior ou igual a 6.',
    pratica: ['input', 'int', 'float', 'if', 'else', 'f-string'] },
  { id: 't-condicionais', unidade: 'u1', titulo: 'Três filmes por faixa etária', origem: 'Unidade 1 · Aula 2',
    enunciado: 'Há 3 filmes por semana. O primeiro é para menores de 12 anos; o segundo para maiores ou iguais a 12 e menores de 18; o terceiro para maiores ou iguais a 18. Considere também a disponibilidade de ingressos.',
    pratica: ['if', 'elif', 'else', 'operadores relacionais', 'and'] },
  { id: 't-repeticao', unidade: 'u1', titulo: 'Notas de cinco filmes', origem: 'Unidade 1 · Aula 3',
    enunciado: 'Percorra os cinco filmes (Filme 1 a Filme 5) e receba para cada um uma nota de 1 a 5. Deixe sempre uma forma da pessoa encerrar o programa antes do fim.',
    pratica: ['for', 'while', 'range', 'break', 'continue'] },
  { id: 't-funcoes', unidade: 'u1', titulo: 'Média de notas automatizada', origem: 'Unidade 1 · Aula 4',
    enunciado: 'Automatize a média de notas dos alunos. Parta do código da aula anterior e melhore usando funções definidas por você, com parâmetro e retorno.',
    pratica: ['def', 'parâmetro', 'return', 'lambda'] },
  { id: 't-desconto', unidade: 'u1', titulo: 'Calculadora de desconto', origem: 'Unidade 1 · Aula 5',
    enunciado: 'Receba o preço de um eletrodoméstico e a porcentagem de desconto, calcule o valor descontado e o preço final e apresente os resultados com duas casas decimais.',
    pratica: ['input', 'float', 'porcentagem', 'operações', 'f-string'] },
  { id: 't-web', unidade: 'u4', titulo: 'Página de perfil pessoal', origem: 'Unidade 4 · Aula 1',
    enunciado: 'Crie uma página de perfil pessoal e identifique o que pertence ao front-end. Explique qual parte ficaria no back-end se o perfil fosse salvo.',
    pratica: ['HTML', 'CSS', 'front-end', 'back-end', 'Flask'] },
  { id: 't-convidados', unidade: 'u2', titulo: 'Convidados que não confirmaram', origem: 'Unidade 2 · Aula 1',
    enunciado: 'Você gerencia a lista de convidados de uma festa e a lista de quem confirmou presença. Identifique quem ainda não confirmou, para convidar de novo.',
    pratica: ['tupla', 'lista', 'list comprehension', 'not in'] },
  { id: 't-evento', unidade: 'u2', titulo: 'Evento científico: regiões, afiliações e interesses', origem: 'Unidade 2 · Aula 2',
    enunciado: 'Participantes de várias regiões se inscreveram num evento científico, cada um com localização, afiliação e áreas de interesse. Use conjuntos para as regiões distintas, um dicionário para agrupar as afiliações e NumPy para achar a área de interesse mais popular.',
    pratica: ['set', 'dict', 'numpy', 'np.unique', 'np.argmax'] },
  { id: 't-veiculo', unidade: 'u2', titulo: 'Classe Veículo com herança', origem: 'Unidade 2 · Aula 3',
    enunciado: 'A partir das características informadas, mostre um resumo e o status de um veículo. Crie a classe Veiculo com marca, modelo e ano, métodos para acelerar e frear, e depois as classes-filhas Carro e Bicicleta, cada uma com o seu comportamento próprio.',
    pratica: ['class', '__init__', 'self', 'herança', 'super()', 'sobrescrita de método'] },
  { id: 't-vendas-grafico', unidade: 'u2', titulo: 'Contagem de vendas em gráfico', origem: 'Unidade 2 · Aula 4',
    enunciado: 'Visualize a contagem de venda de um produto ao longo dos meses. Monte um gráfico de barras com os meses no eixo X e as vendas no eixo Y, com rótulos nos dois eixos e um título.',
    pratica: ['import', 'matplotlib.pyplot', 'plt.bar', 'plt.xlabel', 'plt.title'] },
  { id: 't-biblioteca', unidade: 'u2', titulo: 'Catálogo de livros com gráfico', origem: 'Unidade 2 · Aula 5',
    enunciado: 'Gerencie informações de livros de uma biblioteca e faça a contagem de livros por ano de publicação. Use uma classe Livro, uma lista como acervo e um gráfico da distribuição por ano.',
    pratica: ['class', '__init__', '__str__', 'lista', 'matplotlib'] },
  { id: 't-contatos', unidade: 'u3', titulo: 'Tabela de contatos com CRUD', origem: 'Unidade 3 · Aula 1',
    enunciado: 'Crie a tabela Contatos para a comunicação da empresa, guardando nome, e-mail e telefone. Pratique as quatro operações: inserir os contatos, ler e exibir, atualizar um telefone e excluir um contato.',
    pratica: ['sqlite3', 'CREATE TABLE', 'executemany', 'SELECT', 'UPDATE', 'DELETE'] },
  { id: 't-idade-media', unidade: 'u3', titulo: 'Idade média dos clientes da loja', origem: 'Unidade 3 · Aula 2',
    enunciado: 'A direção da loja quer saber em qual público investir e pediu a idade média dos clientes. Monte uma Series do pandas com os nomes como índice e as idades como valores, exiba a série e calcule a média.',
    pratica: ['pandas', 'pd.Series', 'index', 'mean'] },
  { id: 't-itens-50', unidade: 'u3', titulo: 'Itens acima de R$ 50,00', origem: 'Unidade 3 · Aula 3',
    enunciado: 'Por um erro no sistema de vendas, o valor unitário não aparece e existem linhas duplicadas. Remova as duplicatas, calcule o preço do item dividindo a receita pela quantidade e mostre apenas os itens acima de R$ 50,00 para a ação de marketing.',
    pratica: ['DataFrame', 'drop_duplicates', 'nova coluna', 'teste booleano', 'loc'] },
  { id: 't-gorjetas', unidade: 'u3', titulo: 'Gastos e gorjetas por período', origem: 'Unidade 3 · Aula 4',
    enunciado: 'Responda com gráficos em qual período os clientes gastam mais em um restaurante e se é o mesmo período em que dão mais gorjeta. Compare o total e a média por período e explique por que as duas leituras podem divergir.',
    pratica: ['seaborn', 'barplot', 'estimator', 'groupby', 'matplotlib'] },
  { id: 't-funcionarios', unidade: 'u3', titulo: 'Funcionários no SQLite', origem: 'Unidade 3 · Aula 5',
    enunciado: 'Desenvolva um programa de gerenciamento de funcionários numa tabela SQLite, com id, nome, cargo e salário. Percorra o ciclo completo: criar, inserir, consultar, atualizar e deletar.',
    pratica: ['sqlite3', 'cursor', 'commit', 'CRUD'] },
  { id: 't-mobile', unidade: 'u4', titulo: 'Calculadora mobile com KivyMD', origem: 'Unidade 4 · Aula 2',
    enunciado: 'No computador, monte a interface da calculadora proposta pelo material. Separe a entrada, os botões numéricos, os operadores, limpar e calcular. Teste primeiro a lógica das operações antes de ligá-la aos botões.',
    pratica: ['KivyMD', 'widgets', 'GridLayout', 'eventos', 'tratamento de erro'] },
  { id: 't-testes', unidade: 'u4', titulo: 'Três maneiras de testar uma soma', origem: 'Unidade 4 · Aula 3',
    enunciado: 'Implemente sum_numbers e confira listas positivas, mistas e vazias primeiro com assert, depois com doctest e por fim com uma classe unittest.TestCase.',
    pratica: ['assert', 'doctest', 'unittest', 'assertEqual', 'casos-limite'] },
  { id: 't-vendas-ml', unidade: 'u4', titulo: 'Previsão de vendas', origem: 'Unidade 4 · Aula 4',
    enunciado: 'Organize os dados mensais de vendas, separe treino e avaliação, ajuste um modelo de regressão, compare previsto e real e explique por que um erro baixo no treino não garante bom resultado futuro.',
    pratica: ['aprendizado supervisionado', 'treino e teste', 'regressão', 'MSE', 'previsão'] },
  { id: 't-digitos', unidade: 'u4', titulo: 'Classificador de dígitos escritos à mão', origem: 'Unidade 4 · Aula 5',
    enunciado: 'Siga o estudo de caso do material com o conjunto MNIST: prepare imagens e rótulos, treine o classificador, meça a acurácia em dados separados e registre exemplos em que o modelo errou.',
    pratica: ['TensorFlow', 'MNIST', 'classificação', 'treino e teste', 'acurácia'] }
];

export const aulasDaUnidade = id => aulasDaFaculdade.filter(a => a.unidade === id);
export const tarefasDaUnidade = id => tarefasDaFaculdade.filter(t => t.unidade === id);
export const aulaDaFaculdade = id => aulasDaFaculdade.find(a => a.id === id) || null;

// A página e os testes usam a mesma regra: sempre existe uma ação concreta para continuar.
// IDs antigos ou desconhecidos não podem fazer o contador avançar nem apontar para uma aula falsa.
export const proximaAcaoDaFaculdade = (state = {}) => {
  const feitas = new Set(state.faculdade?.feitas || []);
  const conhecidas = aulasDaFaculdade.filter(aula => feitas.has(aula.id));
  const concluida = conhecidas.length === aulasDaFaculdade.length;
  const aula = concluida
    ? aulasDaFaculdade[0]
    : aulasDaFaculdade.find(item => !feitas.has(item.id)) || aulasDaFaculdade[0];
  const unidade = unidades.find(item => item.id === aula.unidade);
  const tarefa = tarefasDaUnidade(aula.unidade)[0];

  return {
    aula,
    unidade,
    tarefa,
    feitas: conhecidas.length,
    concluida,
    titulo: concluida ? 'Revisar a primeira aula' : aula.titulo,
    explicacao: concluida
      ? 'Você já passou por todo o conteúdo. Revise a primeira aula e refaça um desafio para fixar antes da prova.'
      : `A Unidade ${unidade?.numero || ''} começa por esta ideia. Depois desta aula, pratique: ${tarefa?.titulo || 'o desafio da unidade'}.`
  };
};

const isoLocal = data => [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
const somarDias = (data, quantidade) => new Date(data.getFullYear(), data.getMonth(), data.getDate() + quantidade);

// Divide as aulas pendentes em blocos pequenos e deixa o último dia livre para revisão.
// A agenda é derivada do estado: editar ou importar o progresso nunca apaga aulas concluídas.
export const planoDeEstudosDaFaculdade = (state = {}, hoje = new Date()) => {
  const feitas = new Set(state.faculdade?.feitas || []);
  const pendentes = aulasDaFaculdade.filter(aula => !feitas.has(aula.id));
  const estudadas = aulasDaFaculdade.length - pendentes.length;
  const diasRestantes = diasAteProva(hoje);
  // O AVA fecha o período de estudo antes da prova. Os dias entre um e outro não são sobra:
  // são os dias de revisão, e é neles que o conteúdo assenta. Por isso as aulas terminam no
  // fim do período de estudo, não na véspera da prova.
  // Zero dias de aula é um resultado legítimo: passado o período de estudo do AVA, o que resta
  // até a prova é revisão. Forçar um dia de aula ali empurraria conteúdo novo para a véspera.
  const diasDeEstudo = Math.max(0, Math.min(diasRestantes - 1, diasAteOFimDoEstudo(hoje)));
  const porDia = Math.max(1, Math.min(2, Math.ceil(pendentes.length / Math.max(1, diasDeEstudo))));
  const dias = diasRestantes > 0 && pendentes.length > 0
    ? Array.from({ length: diasRestantes }, (_, indice) => {
      const data = somarDias(hoje, indice);
      const revisao = indice >= diasDeEstudo;
      return { data: isoLocal(data), tipo: revisao ? 'revisao' : 'aulas', aulas: revisao ? [] : pendentes.slice(indice * porDia, (indice + 1) * porDia) };
    })
    : [{ data: isoLocal(hoje), tipo: 'revisao', aulas: [] }];
  const hojeIso = isoLocal(hoje);
  // Duas aulas por dia é um limite proposital: mais do que isso não se aprende, se atravessa.
  // Mas quando o limite não cobre o que falta, as aulas sobrando não aparecem em dia nenhum —
  // e um plano que termina em revisão daria a impressão de que tudo coube. Quem está atrasado
  // precisa saber disso, não descobrir na prova. Por isso o que não coube volta nomeado, junto
  // com o ritmo que caberia.
  const agendadas = new Set(dias.flatMap(dia => dia.aulas.map(aula => aula.id)));
  const foraDoPlano = pendentes.filter(aula => !agendadas.has(aula.id));
  const ritmoNecessario = pendentes.length > 0 ? Math.ceil(pendentes.length / diasDeEstudo) : 0;
  return {
    diasRestantes, estudadas, dias, porDia, foraDoPlano, ritmoNecessario,
    hoje: dias.find(dia => dia.data === hojeIso) || dias[0],
  };
};
