// Cruza a ementa das quatro apostilas com o que a trilha da faculdade realmente ensina.
//
// A lista de assuntos abaixo foi tirada dos PDFs da disciplina, não da plataforma — senão a
// auditoria só confirmaria o que já existe. Cada assunto traz os termos que provam que ele
// apareceu no texto que o estudante lê: teoria das aulas, trechos comentados, exemplos,
// desafios, tarefas do professor, projetos e as questões dos exercícios.
//
//   node scripts/auditar-ementa.mjs
import { aulasDaFaculdade, tarefasDaFaculdade, unidades } from '../src/faculdade.js';
import { ensinoDaFaculdade } from '../src/faculdade-ensino.js';
import { projetosDaFaculdade } from '../src/faculdade-projetos.js';
import { exerciciosDaFaculdade } from '../src/faculdade-exercicios.js';

const NL = String.fromCharCode(10);
const texto = (valor) => {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'string') return valor + ' ';
  if (Array.isArray(valor)) return valor.map(texto).join(' ');
  if (typeof valor === 'object') return Object.values(valor).map(texto).join(' ');
  return '';
};

const porUnidade = {};
for (const unidade of unidades) porUnidade[unidade.id] = '';
const somar = (unidade, valor) => {
  if (porUnidade[unidade] !== undefined) porUnidade[unidade] += texto(valor);
};
for (const aula of aulasDaFaculdade)
  somar(aula.unidade, [aula.titulo, aula.teoria, aula.exemplo, aula.desafio, aula.starter,
    aula.pergunta, aula.opcoes, aula.focoFaculdade, aula.notaAmbiente]);
for (const tarefa of tarefasDaFaculdade)
  somar(tarefa.unidade, [tarefa.titulo, tarefa.enunciado, tarefa.pratica]);
for (const projeto of projetosDaFaculdade)
  somar(projeto.unidade, [projeto.titulo, projeto.teoria, projeto.roteiro, projeto.desafio, projeto.starter]);
for (const exercicio of exerciciosDaFaculdade)
  somar(exercicio.unidade, exercicio.questoes.map((questao) =>
    [questao.enunciado, questao.opcoes, questao.porque, questao.codigo]));
for (const [aulaId, ensino] of Object.entries(ensinoDaFaculdade)) {
  const aula = aulasDaFaculdade.find((item) => item.id === aulaId);
  if (aula) somar(aula.unidade, ensino);
}

const minusculo = (valor) => valor.toLocaleLowerCase('pt-BR');
const tudo = minusculo(Object.values(porUnidade).join(' '));

// A ementa, assunto a assunto, com os termos que provam que ele foi ensinado.
const ementa = {
  u1: [
    ['Origem e filosofia da linguagem', ['guido van rossum', '1991']],
    ['PEP 8 e legibilidade', ['pep 8']],
    ['Interpretador, IDE e Colab', ['interpretador', 'colab']],
    ['Variáveis e os quatro tipos', ['int', 'float', 'str', 'bool']],
    ['type() para descobrir o tipo', ['type(']],
    ['input() devolve texto e precisa de conversão', ['input(', 'int(', 'float(']],
    ['f-string na saída', ['f-string', 'f"']],
    ['Operadores relacionais', ['>=', '!=', '==']],
    ['Operadores lógicos and, or, not', ['and', ' or ', 'not']],
    ['if, elif e else', ['if', 'elif', 'else']],
    ['for e range', ['for', 'range(']],
    ['while', ['while']],
    ['break e continue', ['break', 'continue']],
    ['Funções built-in', ['print', 'len(', 'sum(']],
    ['def, parâmetro e return', ['def ', 'return']],
    ['lambda', ['lambda']],
    ['Média de notas e situação do aluno', ['média', 'aprovado']],
    ['Calculadora de desconto', ['desconto']],
  ],
  u2: [
    ['Objetos e sequências', ['sequência', 'índice']],
    ['Operações comuns de sequência', ['len(', 'count(']],
    ['Fatiamento com passo', ['[:', '[i:j']],
    ['String é imutável', ['imutáv']],
    ['Listas e index()', ['lista', 'index(']],
    ['List comprehension', ['comprehension', 'listcomp']],
    ['map() e filter()', ['map(', 'filter(']],
    ['Tuplas e enumerate()', ['tupla', 'enumerate(']],
    ['Conjuntos: add, remove, valores únicos', ['set(', 'add(', 'remove(']],
    ['Dicionários e as formas de criar', ['dicionário', 'dict(', 'zip(']],
    ['NumPy: array e operação em massa', ['numpy', 'np.array', 'np.sum']],
    ['Classe, atributo e método', ['class ', 'atributo', 'método']],
    ['__init__ e self', ['__init__', 'self']],
    ['Encapsulamento', ['encapsulamento']],
    ['Herança e super()', ['herança', 'super()']],
    ['Polimorfismo', ['polimorfismo']],
    ['Módulos: import, as, from', ['import ', 'from ']],
    ['Built-in, de terceiros e próprios', ['built-in', 'terceiros', 'pypi']],
    ['Matplotlib: plot, bar e título', ['matplotlib', 'plt.', 'title']],
  ],
  u3: [
    ['SQL e as categorias DDL, DML e DCL', ['ddl', 'dml', 'dcl']],
    ['CREATE, SELECT, INSERT, UPDATE e DELETE', ['create table', 'select', 'insert', 'update', 'delete']],
    ['ODBC, JDBC e o papel do driver', ['odbc', 'jdbc', 'driver']],
    ['PEP 249 e connect()', ['pep 249', 'connect(']],
    ['SQLite sem servidor, gravando em arquivo', ['sqlite', 'servidor']],
    ['cursor, execute e commit', ['cursor', 'execute(', 'commit(']],
    ['CRUD completo', ['crud']],
    ['executemany e fetchall', ['executemany', 'fetchall']],
    ['pandas: DataFrame e Series', ['dataframe', 'series']],
    ['Series a partir de lista e de dicionário', ['pd.series', 'index=']],
    ['Métodos read_ e to_', ['read_csv', 'read_json', 'to_csv']],
    ['read_html para tabelas da web', ['read_html']],
    ['info(), shape e dtypes', ['info(', 'shape', 'dtypes']],
    ['drop_duplicates', ['drop_duplicates']],
    ['Criar uma coluna nova', ['nova coluna', 'df[']],
    ['loc e teste booleano', ['loc[', 'booleano']],
    ['Matplotlib: pyplot e estilo orientado a objetos', ['pyplot', 'subplots']],
    ['pandas.plot com kind', ['kind=']],
    ['Seaborn e load_dataset', ['seaborn', 'load_dataset']],
    ['estimator: média, sum e len', ['estimator']],
    ['Ler o gráfico pelo contexto, não pela barra mais alta', ['contexto']],
  ],
  u4: [
    ['Front-end: HTML, CSS e JavaScript', ['html', 'css', 'javascript']],
    ['Back-end e seus frameworks', ['back-end', 'django', 'flask']],
    ['APIs e FastAPI', ['api', 'fastapi']],
    ['Python no navegador não substitui HTML', ['navegador']],
    ['Mobile: Swift, Kotlin e Python', ['swift', 'kotlin']],
    ['Kivy e BeeWare', ['kivy', 'beeware']],
    ['KivyMD e Material Design', ['kivymd', 'material design']],
    ['Widgets e MDTabs', ['widget', 'mdtabs']],
    ['Multiplataforma e suas limitações', ['multiplataforma', 'desempenho']],
    ['assert', ['assert']],
    ['doctest com o prompt >>>', ['doctest', '>>>']],
    ['unittest, TestCase e assertEqual', ['unittest', 'testcase', 'assertequal']],
    ['Prefixo test_ e a descoberta automática', ['test_']],
    ['Machine learning: aprender padrões dos dados', ['machine learning', 'padr']],
    ['Aprendizado supervisionado', ['supervisionado']],
    ['Aprendizado não supervisionado', ['não supervisionado']],
    ['Aprendizado por reforço', ['reforço']],
    ['Modelos: árvore, rede neural, SVM e K-Means', ['árvore', 'rede', 'k-means']],
    ['TensorFlow', ['tensorflow']],
    ['Treino, avaliação e previsão', ['treino', 'previs']],
    ['MNIST e classificação de dígitos', ['mnist', 'dígito']],
  ],
};

let faltando = 0;
let total = 0;
const buracos = [];
for (const unidade of unidades) {
  const itens = ementa[unidade.id];
  const corpo = minusculo(porUnidade[unidade.id]);
  const ausentes = [];
  for (const [assunto, termos] of itens) {
    total++;
    const naUnidade = termos.some((termo) => corpo.includes(minusculo(termo)));
    const noGeral = termos.some((termo) => tudo.includes(minusculo(termo)));
    if (!naUnidade) {
      ausentes.push([assunto, noGeral]);
      faltando++;
      if (!noGeral) buracos.push(`Unidade ${unidade.numero}: ${assunto}`);
    }
  }
  console.log(`${NL}UNIDADE ${unidade.numero} — ${unidade.titulo}`);
  console.log(`  ${itens.length - ausentes.length} de ${itens.length} assuntos da apostila aparecem no texto da unidade`);
  for (const [assunto, noGeral] of ausentes) {
    console.log(`  FALTA: ${assunto}${noGeral ? '   (aparece em outra unidade)' : '   (NAO aparece em lugar nenhum)'}`);
  }
}
console.log(`${NL}TOTAL: ${total - faltando} de ${total} assuntos cobertos na propria unidade.`);

// Um assunto que a apostila cobra e a trilha não menciona é uma questão que o estudante perde
// na prova. Por isso isto falha em vez de apenas avisar.
if (buracos.length) {
  console.error(`${NL}A trilha não ensina ${buracos.length} assunto(s) da ementa:`);
  for (const buraco of buracos) console.error(`  - ${buraco}`);
  process.exit(1);
}
console.log('Nenhum assunto da ementa ficou de fora.');
