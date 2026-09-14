// Comparar só a saída aceita atalho. Na aula de entrada, o enunciado mandava converter o texto
// em inteiro, mas a saída esperada era o próprio valor digitado: `print(input())` passava sem
// converter nada. Em 21 das 47 aulas dava para escrever `print("resposta")` e concluir.
//
// A regra aqui é deliberadamente **cega ao formato do código**. Nome de variável, ordem das
// linhas, laço em vez de soma, função em vez de expressão: tudo livre. O estudante resolve do
// jeito dele. O que se mede é outra coisa — se a resposta foi calculada ou apenas digitada.
//
// Nada disto é julgado por modelo de linguagem. São medidas em JavaScript, com o mesmo
// resultado sempre, porque um "está certo" errado é pior do que não conferir.

const NL = String.fromCharCode(10);

// Comentário não é código executado: o enunciado pode citar o valor ali sem ser trapaça.
// Isso também deixa o próprio início do exercício (que é só comentário) sempre válido.
const semComentarios = codigo => String(codigo || '').split(NL).map(linha => linha.split('#')[0]).join(NL);

const solucaoGuardada = lesson => (lesson?.puzzle?.blocks || []).map(bloco => bloco.code).join(NL);
const aspas = [String.fromCharCode(34), String.fromCharCode(39)];

// Procurar `int(` como texto solto casa dentro de `print(` — foi assim que `print(input())`
// passou pela exigência de conversão sem converter nada. A chamada só conta quando o nome
// começa de verdade: nada de letra, dígito, sublinhado ou ponto grudado antes dele.
const chama = (codigo, nome) => new RegExp('(?<![\\w.])' + nome + '\\s*\\(').test(codigo);

// Aulas cujo assunto é a própria conversão: sem ela o exercício perde o sentido, mesmo que a
// saída batesse por outro caminho. Só entra aqui o que a solução guardada comprovadamente usa.
const EXIGE_CHAMADA = {
  etiqueta: [['int', 'converter o texto da etiqueta em inteiro, como pede o exercício']],
  entrada: [['int', 'transformar em número o texto que veio do input()']],
  arquivos: [['open', 'abrir o arquivo']],
  tcc: [['all', 'verificar de uma vez se todos os requisitos foram atendidos']]
};

// A técnica que a aula ensina. O texto vem do próprio `objective` de cada aula, então isto não
// inventa exigência nova: cobra o que a aula já diz que veio ensinar.
//
// Isto continua cego ao formato: exigir `if` não é exigir um jeito de escrever o if, e nome de
// variável, ordem e estrutura seguem livres. Cada entrada é provada duas vezes nos testes — pela
// solução de referência e por uma solução alternativa escrita de outro jeito. Se alguma recusar
// um caminho legítimo, ela sai.
const b = String.fromCharCode(92) + 'b';
const tecnica = (fonte, descricao) => ({ re: new RegExp(fonte), descricao });
const EXIGE_TECNICA = {
  variaveis: [tecnica('^[^=\\n]*[A-Za-z_]\\w*\\s*=[^=]', 'guardar o valor numa variável antes de mostrá-lo')],
  condicoes: [tecnica(b + 'if' + b, 'decidir com if'), tecnica(b + 'el(if|se)' + b, 'tratar o outro caminho com elif ou else')],
  booleanos: [tecnica(b + 'and' + b, 'combinar as duas condições com and')],
  complexidade: [tecnica(b + '(for|while)' + b, 'percorrer a lista com um laço, em uma única passagem')],
  classes: [tecnica(b + 'class' + b, 'definir uma classe')],
  construtor: [tecnica('__init__', 'guardar o dado no construtor __init__')],
  heranca: [tecnica('class\\s+\\w+\\s*\\(\\s*\\w', 'criar uma classe que herda de outra')],
  dataclasses: [tecnica('@\\s*dataclass', 'marcar a classe com @dataclass')],
  excecoes: [tecnica(b + 'try' + b, 'colocar a operação dentro de try'), tecnica(b + 'except' + b, 'tratar o erro com except')],
  json: [tecnica(b + 'json' + b, 'usar o módulo json em vez de fatiar o texto na mão')],
  sql: [tecnica(b + 'sqlite3' + b, 'usar o banco de dados, que é o assunto da aula')],
  crud: [tecnica(b + 'sqlite3' + b, 'usar o banco de dados'), tecnica(b + 'UPDATE' + b, 'atualizar o registro com UPDATE')],
  rest: [tecnica(b + 'def' + b, 'implementar a busca como função')],
  validacao: [tecnica(b + 'raise' + b, 'lançar o erro com raise'), tecnica(b + 'except' + b, 'capturar esse erro com except')],
  autenticacao: [tecnica(b + 'def' + b, 'implementar a regra como função')],
  servicos: [tecnica(b + 'def' + b, 'escrever o serviço como função')],
  testes: [tecnica(b + 'assert' + b, 'comparar o comportamento com assert')],
  logs: [tecnica(b + 'logging' + b, 'registrar pelo logging, não por print')],
  // Técnica e não chamada: `chama()` recusa nome precedido de ponto, e `statistics.median(...)`
  // é um caminho perfeitamente válido.
  analise: [tecnica(b + 'median\\s*\\(', 'calcular a mediana com median, que é o assunto da aula')],
  deploy: [tecnica('getenv|environ', 'ler a variável de ambiente, com valor padrão')],

  // Miniprojetos cuja resposta aparece legitimamente no código, então a regra do literal se
  // isenta sozinha. Sem isto eles ficariam sem nenhuma exigência automática.
  portaria: [tecnica(b + 'if' + b, 'decidir com if'), tecnica(b + 'else' + b, 'tratar o outro caminho com else')],
  excecao: [tecnica(b + 'try' + b, 'colocar a conversão dentro de try'), tecnica(b + 'except' + b, 'tratar o erro com except')],
  permissao: [tecnica(b + 'def' + b, 'escrever a regra como função, para valer nos dois casos')],
  registro: [tecnica(b + 'logging' + b, 'registrar pelo logging, não por print')],
  ambiente: [tecnica('getenv|environ', 'ler do ambiente, com valor padrão')]
};

// Miniprojeto, ponte de função e aula guardam a solução em campos diferentes, mas o problema é o
// mesmo: comparar saída não prova que o exercício foi feito. Estas duas linhas são o que muda de
// um para o outro; toda a regra abaixo é compartilhada.
export const referenciaDoExercicio = item => semComentarios([item?.solution, solucaoGuardada(item)].find(t => String(t || '').trim()) || '');

export function requisitosDaAula(lesson) {
  if (!lesson) return [];
  const lista = [];
  const solucao = referenciaDoExercicio(lesson);

  for (const [nome, motivo] of EXIGE_CHAMADA[lesson.id] || []) {
    lista.push({
      id: `chama-${nome}`,
      descricao: `usar ${nome}() para ${motivo}`,
      atende: codigo => chama(semComentarios(codigo), nome)
    });
  }

  // Se a aula fornece uma resposta para input(), o valor tem de entrar por ali.
  if (String(lesson.stdin || '').trim()) {
    lista.push({
      id: 'usa-input',
      descricao: 'ler o valor com input(), em vez de escrevê-lo no código',
      atende: codigo => chama(semComentarios(codigo), 'input')
    });
  }

  for (const { re, descricao } of EXIGE_TECNICA[lesson.id] || []) {
    lista.push({ id: `tecnica:${re.source}`, descricao, atende: codigo => re.test(semComentarios(codigo)) });
  }

  // A saída esperada não pode estar escrita no código — a não ser quando a própria solução
  // guardada a escreve, como na primeira aula, cujo desafio é literalmente mostrar uma frase.
  // Essa isenção automática é o que garante que a regra nunca recuse um caminho legítimo.
  const linhas = String(lesson.expected || '').split(NL).map(linha => linha.trim()).filter(Boolean);
  if (solucao) {
    for (const valor of linhas) {
      if (solucao.includes(valor)) continue;
      lista.push({
        id: `sem-literal:${valor}`,
        descricao: `chegar a ${valor} calculando, e não escrevendo esse valor direto no código`,
        atende: codigo => !semComentarios(codigo).includes(valor)
      });
    }
    // Onde a resposta aparece legitimamente no código (um texto que a classe devolve, por
    // exemplo), a regra acima não pega o atalho mais óbvio de todos: imprimir a resposta e
    // pronto. Aqui ele é recusado — a não ser quando escrever aquela frase É o exercício, como
    // na primeira aula, e a própria solução guardada faz exatamente isso.
    const saida = linhas.join(NL);
    const impressaoDireta = texto => aspas.some(aspa => texto.includes(`print(${aspa}${saida}${aspa})`));
    if (linhas.length === 1 && !impressaoDireta(solucao)) {
      lista.push({
        id: 'sem-print-literal',
        descricao: `produzir ${saida} com código, em vez de imprimir esse texto pronto`,
        atende: codigo => !impressaoDireta(semComentarios(codigo))
      });
    }
  }
  return lista;
}

// O que ainda falta no código do estudante. Lista vazia significa que o exercício foi cumprido.
export function requisitosFaltando(lesson, codigo) {
  return requisitosDaAula(lesson).filter(item => !item.atende(codigo));
}
