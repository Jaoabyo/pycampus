// Degraus: construir uma coisa de verdade, uma novidade por vez, com conferência em cada passo.
//
// A aula de Módulos mostrava um gráfico de barras completo e depois pedia só uma raiz quadrada:
// o estudante terminava sem ter desenhado barra nenhuma. Aqui ele monta o gráfico em cinco
// degraus, e cada degrau é conferido pelo que o gráfico realmente mostra. O worker devolve,
// junto com a imagem, as alturas das barras, os nomes embaixo delas, o título e os nomes dos
// eixos. Procurar "plt.bar" no texto aprovaria um gráfico com a barra errada.

const semComentarios = codigo => String(codigo || '').split('\n').map(l => l.replace(/#.*$/, '')).join('\n');
const mesmoNumero = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-9;
const mesmaLista = (a, b) => a.length === b.length && a.every((v, i) => mesmoNumero(v, b[i]));
const listaDe = valores => valores.map(v => (Number.isInteger(v) ? v : Number(v.toFixed(2)))).join(', ');

// O último gráfico desenhado. Cada figura traz a lista dos seus eixos; estes degraus usam um só.
const ultimoEixo = graficos => {
  const figuras = Array.isArray(graficos) ? graficos.filter(f => Array.isArray(f) && f.length) : [];
  return figuras.length ? figuras[figuras.length - 1][0] : null;
};

const aprovado = () => ({ ok: true });
const falta = motivo => ({ ok: false, motivo });

const semGrafico = 'Nenhum gráfico apareceu. Confira se o import está no topo e se existe uma linha com plt.bar(...).';

const conferirBarras = (eixo, alturas, nomes) => {
  if (!eixo) return falta(semGrafico);
  if (eixo.barras.length !== alturas.length) {
    return falta(`O gráfico tem ${eixo.barras.length} ${eixo.barras.length === 1 ? 'barra' : 'barras'}; este degrau pede ${alturas.length}.`);
  }
  if (!mesmaLista(eixo.barras, alturas)) {
    return falta(`As alturas saíram ${listaDe(eixo.barras)}; o pedido é ${listaDe(alturas)}. A altura vem da segunda lista do plt.bar.`);
  }
  if (nomes.some((nome, i) => eixo.rotulos[i] !== nome)) {
    return falta(`Os nomes embaixo das barras saíram ${eixo.rotulos.join(', ') || '(vazios)'}; o pedido é ${nomes.join(', ')}. O nome vem da primeira lista, entre aspas.`);
  }
  return aprovado();
};

const conferirEixos = eixo => {
  if (!eixo.eixo_x.trim()) return falta('O eixo de baixo ainda está sem nome. Use plt.xlabel("...").');
  if (!eixo.eixo_y.trim()) return falta('O eixo do lado ainda está sem nome. Use plt.ylabel("...").');
  return aprovado();
};

const EXEMPLO_FINAL = { nomes: ['Seg', 'Ter', 'Qua', 'Qui'], alturas: [2, 1, 3, 2] };

// A sonda roda depois do código do estudante, no mesmo programa, e descreve o que ficou de
// verdade: para SQL, as tabelas, colunas e linhas do banco aberto. Vai sempre no FIM, para
// que o número de linha de um erro do estudante continue sendo o dele. A linha que ela
// imprime é tirada da saída antes de chegar à tela.
export const MARCA_DA_SONDA = '__PYCAMPUS_SONDA__';
export const separarSonda = (saida) => {
  const texto = String(saida || '');
  const i = texto.lastIndexOf(MARCA_DA_SONDA);
  if (i < 0) return { saida: texto, sonda: null };
  const fim = texto.indexOf('\n', i);
  const json = texto.slice(i + MARCA_DA_SONDA.length, fim < 0 ? undefined : fim);
  const limpa = (texto.slice(0, i) + (fim < 0 ? '' : texto.slice(fim + 1))).replace(/\n+$/, '');
  try {
    return { saida: limpa || '(O programa terminou sem saída.)', sonda: JSON.parse(json) };
  } catch {
    return { saida: limpa, sonda: null };
  }
};

const SONDA_DO_BANCO = `
try:
    import json as _pc_json, sqlite3 as _pc_sqlite
    _pc_banco = {"conexoes": 0, "tabelas": {}, "pendente": False}
    for _pc_v in list(globals().values()):
        if isinstance(_pc_v, _pc_sqlite.Connection):
            _pc_banco["conexoes"] += 1
            try:
                _pc_banco["pendente"] = _pc_banco["pendente"] or _pc_v.in_transaction
                for (_pc_n,) in _pc_v.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall():
                    _pc_banco["tabelas"][_pc_n] = {
                        "colunas": [{"nome": c[1], "tipo": c[2].upper(), "chave": bool(c[5]), "obrigatoria": bool(c[3])} for c in _pc_v.execute('PRAGMA table_info("%s")' % _pc_n)],
                        "linhas": [list(r) for r in _pc_v.execute('SELECT * FROM "%s"' % _pc_n).fetchall()],
                    }
            except _pc_sqlite.ProgrammingError:
                _pc_banco["fechada"] = True
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps(_pc_banco, ensure_ascii=False))
except Exception as _pc_erro:
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"erro": str(_pc_erro)}))
`;

const semTabela = 'A tabela Produtos ainda não existe no banco. Confira o cursor.execute("CREATE TABLE Produtos (...)").';
const tabela = (banco) => banco?.tabelas?.Produtos || null;
const conferirBancoAberto = (banco) => {
  if (!banco || banco.erro) return falta('Não consegui ler o banco depois da execução. Execute de novo; se continuar, confira o import sqlite3.');
  if (banco.fechada) return falta('A conexão foi fechada com close(). Nos degraus, deixe o banco aberto: é assim que a conferência lê o que ficou nele.');
  if (!banco.conexoes) return falta('Não encontrei uma conexão aberta. Mantenha a linha conexao = sqlite3.connect(":memory:").');
  return aprovado();
};
const conferirColunas = (banco, esperadas) => {
  const t = tabela(banco);
  if (!t) return falta(semTabela);
  const nomes = t.colunas.map((c) => c.nome);
  for (const [nome, tipo] of esperadas) {
    const coluna = t.colunas.find((c) => c.nome === nome);
    if (!coluna) return falta(`A tabela tem as colunas ${nomes.join(', ')}; falta a coluna ${nome}.`);
    if (coluna.tipo !== tipo) return falta(`A coluna ${nome} ficou com o tipo ${coluna.tipo || '(sem tipo)'}; o pedido é ${tipo}.`);
  }
  const sobrando = nomes.filter((n) => !esperadas.some(([e]) => e === n));
  if (sobrando.length) return falta(`A tabela tem colunas a mais: ${sobrando.join(', ')}. Deixe só as pedidas.`);
  return aprovado();
};
const PRODUTOS = [['id', 'INTEGER'], ['nome', 'TEXT'], ['preco', 'REAL'], ['estoque', 'INTEGER']];
const linhasDe = (banco) => (tabela(banco)?.linhas || []);
const mostrarLinhas = (linhas) => linhas.length ? linhas.map((l) => `(${l.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ')})`).join(', ') : 'nenhuma linha';
const conferirLinhas = (banco, esperadas, dica) => {
  const linhas = linhasDe(banco);
  const igual = linhas.length === esperadas.length && esperadas.every((e, i) => e.every((v, j) => (typeof v === 'number' ? mesmoNumero(linhas[i][j], v) : linhas[i][j] === v)));
  return igual ? aprovado() : falta(`O banco ficou com ${mostrarLinhas(linhas)}; o esperado é ${mostrarLinhas(esperadas)}. ${dica}`);
};
const conferirCommit = (banco) => (banco.pendente
  ? falta('A mudança foi feita, mas ainda não foi gravada. Chame conexao.commit() depois do comando.')
  : aprovado());
const primeiro = (...conferencias) => conferencias.find((c) => !c.ok) || aprovado();
const usaInterrogacao = (codigo, comando) => new RegExp(`${comando}[^"']*\\?`, 'i').test(codigo);
// Todos os eixos desenhados na execução, de todas as figuras: um degrau pode ter vários gráficos.
const todosEixos = (graficos) => (Array.isArray(graficos) ? graficos : []).flatMap((f) => (Array.isArray(f) ? f : []));

// A segunda sonda descreve as variáveis que o programa deixou: números, textos, listas,
// conjuntos, dicionários, Series e DataFrames do pandas, arrays do NumPy, e os objetos e
// classes que o estudante criou. É o que permite conferir "a tabela tem estas linhas" ou "o
// objeto guardou estes atributos" em vez de procurar palavras no código.
const SONDA_DAS_VARIAVEIS = `
try:
    import json as _pc_json, types as _pc_types
    def _pc_simples(v, fundo=0):
        if v is None or isinstance(v, (bool, int, float, str)):
            return v
        if fundo > 2:
            return repr(v)[:80]
        if isinstance(v, (list, tuple)):
            return [_pc_simples(x, fundo + 1) for x in list(v)[:50]]
        if isinstance(v, (set, frozenset)):
            return sorted([_pc_simples(x, fundo + 1) for x in v], key=repr)[:50]
        if isinstance(v, dict):
            return {str(k): _pc_simples(x, fundo + 1) for k, x in list(v.items())[:50]}
        if hasattr(v, "item") and hasattr(v, "dtype") and getattr(v, "shape", None) == ():
            return v.item()
        return repr(v)[:80]
    def _pc_descrever(v):
        nome_tipo = type(v).__name__
        modulo = type(v).__module__ or ""
        if modulo.startswith("pandas") and nome_tipo == "Series":
            return {"tipo": "Series", "indice": [_pc_simples(i) for i in list(v.index)[:50]], "valores": [_pc_simples(x) for x in v.tolist()[:50]]}
        if modulo.startswith("pandas") and nome_tipo == "DataFrame":
            return {"tipo": "DataFrame", "colunas": [str(c) for c in v.columns], "indice": [_pc_simples(i) for i in list(v.index)[:50]], "linhas": [[_pc_simples(x) for x in linha] for linha in v.values.tolist()[:50]]}
        if modulo.startswith("numpy") and nome_tipo == "ndarray":
            return {"tipo": "ndarray", "valores": _pc_simples(v.tolist())}
        if isinstance(v, type):
            return {"tipo": "classe", "nome": v.__name__, "bases": [b.__name__ for b in v.__bases__], "metodos": sorted(k for k, x in vars(v).items() if callable(x) and (k == "__init__" or not k.startswith("__")))}
        if isinstance(v, (set, frozenset)):
            return {"tipo": "set", "valores": _pc_simples(v)}
        if isinstance(v, (bool, int, float, str, list, tuple, dict)) or v is None:
            return {"tipo": nome_tipo, "valor": _pc_simples(v)}
        if hasattr(v, "__dict__") and not callable(v):
            return {"tipo": "objeto", "classe": nome_tipo, "bases": [b.__name__ for b in type(v).__mro__[1:-1]], "atributos": {k: _pc_simples(x) for k, x in list(vars(v).items())[:30]}}
        return None
    _pc_vars = {}
    for _pc_k, _pc_v in list(globals().items()):
        if _pc_k.startswith("_") or isinstance(_pc_v, (_pc_types.ModuleType, _pc_types.FunctionType, _pc_types.BuiltinFunctionType)):
            continue
        try:
            _pc_d = _pc_descrever(_pc_v)
        except Exception:
            _pc_d = None
        if _pc_d is not None:
            _pc_vars[_pc_k] = _pc_d
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"variaveis": _pc_vars}, ensure_ascii=False, default=str))
except Exception as _pc_erro:
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"erro": str(_pc_erro)}))
`;

// Ajudantes para conferir as variáveis descritas pela sonda.
const variaveis = (sonda) => sonda?.variaveis || {};
const doTipo = (sonda, tipo) => Object.entries(variaveis(sonda)).filter(([, v]) => v.tipo === tipo);
const mesmosValores = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length
  && a.every((x, i) => (typeof b[i] === 'number' ? mesmoNumero(x, b[i]) : Array.isArray(b[i]) ? mesmosValores(x, b[i]) : x === b[i]));
const texto = (valores) => valores.map((v) => (typeof v === 'string' ? `"${v}"` : v)).join(', ');
const semSonda = (sonda) => (!sonda || sonda.erro
  ? falta('Não consegui ler as variáveis depois da execução. Execute de novo; se continuar, confira se o programa roda até o fim.')
  : null);
const saidaTem = (saida, ...trechos) => trechos.every((t) => String(saida).includes(t));


export const degrausDaFaculdade = {
  u2a4: {
    titulo: 'Agora monte um gráfico de barras, um degrau por vez',
    introducao: 'O exemplo do professor mostra o gráfico pronto. Aqui você constrói o seu, acrescentando uma coisa por degrau. Cada degrau confere o gráfico que você desenhou de verdade: quantas barras, com que altura e com que nomes.',
    inicial: 'import matplotlib.pyplot as plt\n\n',
    conclusao: 'Você montou um gráfico de barras completo, com os seus dados. Um extra: no gráfico de Jan, Fev e Mar, o eixo do lado ia de 20 em 20, e a barra de 150 ficava sem número marcando a altura. Para escrever o valor em cima de cada barra, guarde o que o plt.bar devolve e passe para plt.bar_label: barras = plt.bar(dias, horas) e depois plt.bar_label(barras).',
    degraus: [
      {
        id: 'uma-barra',
        titulo: 'Uma barra só',
        ensina: 'plt.bar recebe duas listas: primeiro os nomes das barras, depois as alturas. Mesmo com uma barra só, o nome e a altura vão cada um dentro de colchetes, como listas de um item.',
        exemplo: 'plt.bar(["Jan"], [120])',
        pedido: 'Desenhe uma barra chamada Jan com altura 120.',
        conferir: ({ graficos }) => conferirBarras(ultimoEixo(graficos), [120], ['Jan']),
      },
      {
        id: 'listas',
        titulo: 'Várias barras, guardadas em listas',
        ensina: 'Com mais barras, guarde os nomes numa lista e as alturas em outra, e passe as duas para o plt.bar. O primeiro nome combina com a primeira altura, o segundo com a segunda, e assim por diante.',
        exemplo: 'meses = ["Jan", "Fev", "Mar"]\nvendas = [120, 90, 150]\nplt.bar(meses, vendas)',
        pedido: 'Troque a barra única por três: Jan 120, Fev 90 e Mar 150, guardando os nomes numa lista e as alturas em outra.',
        conferir: ({ graficos, codigo }) => {
          const barras = conferirBarras(ultimoEixo(graficos), [120, 90, 150], ['Jan', 'Fev', 'Mar']);
          if (!barras.ok) return barras;
          if (!/\bplt\.bar\s*\(\s*[A-Za-z_]\w*\s*,\s*[A-Za-z_]\w*\s*[,)]/.test(semComentarios(codigo))) {
            return falta('O gráfico está certo, mas as listas foram escritas dentro do plt.bar. Guarde cada uma numa variável, como meses e vendas, e passe os nomes delas.');
          }
          return aprovado();
        },
      },
      {
        id: 'eixos',
        titulo: 'Nome dos eixos',
        ensina: 'plt.xlabel escreve o nome do eixo de baixo e plt.ylabel o do eixo do lado. Sem eles, quem lê o gráfico não sabe se 150 são reais, unidades ou clientes.',
        exemplo: 'plt.xlabel("Mês")\nplt.ylabel("Vendas")',
        pedido: 'Dê nome aos dois eixos: por exemplo, Mês embaixo e Vendas do lado. Mantenha as três barras.',
        conferir: ({ graficos }) => {
          const eixo = ultimoEixo(graficos);
          const barras = conferirBarras(eixo, [120, 90, 150], ['Jan', 'Fev', 'Mar']);
          return barras.ok ? conferirEixos(eixo) : barras;
        },
      },
      {
        id: 'titulo',
        titulo: 'Título',
        ensina: 'plt.title escreve o título no topo. Um bom título diz o que o gráfico responde: "Vendas do 1º trimestre" diz mais do que "Gráfico".',
        exemplo: 'plt.title("Vendas do 1º trimestre")',
        pedido: 'Coloque um título no gráfico, mantendo as barras e os nomes dos eixos.',
        conferir: ({ graficos }) => {
          const eixo = ultimoEixo(graficos);
          const barras = conferirBarras(eixo, [120, 90, 150], ['Jan', 'Fev', 'Mar']);
          if (!barras.ok) return barras;
          const eixos = conferirEixos(eixo);
          if (!eixos.ok) return eixos;
          return eixo.titulo.trim() ? aprovado() : falta('O gráfico ainda está sem título. Use plt.title("...").');
        },
      },
      {
        id: 'seus-dados',
        titulo: 'Agora com os seus dados',
        ensina: 'Você já sabe montar o gráfico inteiro. Troque os dados por algo seu: horas de estudo por dia, gastos do mês, gols por rodada. Termine com plt.close(): o gráfico aparece do mesmo jeito, e, se o programa desenhar um segundo gráfico depois, ele começa numa figura nova em vez de cair em cima deste.',
        exemplo: 'dias = ["Seg", "Ter", "Qua", "Qui"]\nhoras = [2, 1, 3, 2]\nplt.bar(dias, horas)\nplt.xlabel("Dia")\nplt.ylabel("Horas de estudo")\nplt.title("Minha semana de estudo")\nplt.close()',
        pedido: 'Monte um gráfico com pelo menos 4 barras com dados seus, nome nos dois eixos, título e plt.close() no fim.',
        conferir: ({ graficos, codigo }) => {
          const eixo = ultimoEixo(graficos);
          if (!eixo) return falta(semGrafico);
          if (eixo.barras.length < 4) return falta(`O gráfico tem ${eixo.barras.length} ${eixo.barras.length === 1 ? 'barra' : 'barras'}; este degrau pede pelo menos 4.`);
          if (eixo.rotulos.slice(0, eixo.barras.length).some(r => !String(r).trim())) {
            return falta('Alguma barra ficou sem nome embaixo. Cada altura precisa de um nome na primeira lista.');
          }
          if (mesmaLista(eixo.barras, EXEMPLO_FINAL.alturas) && EXEMPLO_FINAL.nomes.every((n, i) => eixo.rotulos[i] === n)) {
            return falta('Esses são os dados do exemplo. Troque por dados seus, mesmo que inventados: é a escolha que mostra que você entendeu.');
          }
          const eixos = conferirEixos(eixo);
          if (!eixos.ok) return eixos;
          if (!eixo.titulo.trim()) return falta('O gráfico ainda está sem título. Use plt.title("...").');
          if (!/\bplt\.close\s*\(/.test(semComentarios(codigo))) return falta('Falta o plt.close() no fim.');
          return aprovado();
        },
      },
    ],
  },
  u3a1: {
    titulo: 'Agora monte um banco de verdade, um degrau por vez',
    introducao: 'O exemplo do professor cria, grava, altera e apaga tudo de uma vez. Aqui você faz uma coisa por degrau. Depois de cada execução, a conferência abre o banco e olha o que ficou nele: quais tabelas, quais colunas e quais linhas.',
    inicial: 'import sqlite3\n\nconexao = sqlite3.connect(":memory:")\ncursor = conexao.cursor()\n\n',
    sonda: SONDA_DO_BANCO,
    conclusao: 'Você fez o ciclo inteiro do CRUD num banco de verdade: criou a tabela, inseriu, consultou, alterou e apagou, usando ? para os valores e commit depois de cada mudança. É exatamente o que o exemplo do professor faz, agora com cada linha entendida.',
    degraus: [
      {
        id: 'criar-tabela',
        titulo: 'Criar a tabela',
        ensina: 'Uma tabela é como uma planilha: tem colunas com nome e tipo, e cada registro é uma linha. CREATE TABLE cria a tabela vazia. Entre parênteses vem cada coluna com seu tipo: TEXT guarda texto e REAL guarda números com casas decimais.',
        exemplo: 'cursor.execute("CREATE TABLE Produtos (nome TEXT, preco REAL)")',
        pedido: 'Crie a tabela Produtos com duas colunas: nome (TEXT) e preco (REAL).',
        conferir: ({ banco }) => primeiro(conferirBancoAberto(banco), conferirColunas(banco, [['nome', 'TEXT'], ['preco', 'REAL']])),
      },
      {
        id: 'id-e-estoque',
        titulo: 'Mais colunas e a chave',
        ensina: 'Toda tabela precisa de um jeito de achar cada linha sem confusão: é a chave primária. id INTEGER PRIMARY KEY cria um número único por linha, que o SQLite preenche sozinho. INTEGER é o tipo dos números inteiros, como a quantidade em estoque.',
        exemplo: 'cursor.execute("CREATE TABLE Produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL, estoque INTEGER)")',
        pedido: 'Mude o CREATE TABLE para ter quatro colunas: id (INTEGER PRIMARY KEY), nome (TEXT), preco (REAL) e estoque (INTEGER).',
        conferir: ({ banco }) => {
          const base = primeiro(conferirBancoAberto(banco), conferirColunas(banco, PRODUTOS));
          if (!base.ok) return base;
          const chave = tabela(banco).colunas.filter((c) => c.chave).map((c) => c.nome);
          if (chave.length === 1 && chave[0] === 'id') return aprovado();
          return falta(chave.length ? `A chave primária ficou em ${chave.join(', ')}; ela deve ser o id.` : 'Falta dizer que o id é a chave: id INTEGER PRIMARY KEY.');
        },
      },
      {
        id: 'inserir',
        titulo: 'Inserir com ? e gravar',
        ensina: 'INSERT INTO coloca uma linha na tabela. Os valores não vão escritos dentro do texto do SQL: cada ? marca um lugar, e os valores vêm depois, numa tupla, na mesma ordem. Isso protege o banco contra injeção de SQL. O id fica de fora porque o SQLite numera sozinho. commit grava de vez.',
        exemplo: 'cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Camiseta", 19.99, 50))\nconexao.commit()',
        pedido: 'Insira dois produtos, usando ?: Camiseta (19.99, estoque 50) e Caneca (29.9, estoque 20). Depois grave com commit.',
        conferir: ({ banco, codigo }) => {
          const base = primeiro(conferirBancoAberto(banco), conferirColunas(banco, PRODUTOS),
            conferirLinhas(banco, [[1, 'Camiseta', 19.99, 50], [2, 'Caneca', 29.9, 20]], 'Confira a ordem dos valores na tupla: nome, preço e estoque.'));
          if (!base.ok) return base;
          if (!usaInterrogacao(semComentarios(codigo), 'INSERT')) return falta('Os dados entraram, mas escritos dentro do SQL. Use um ? para cada valor e passe os valores numa tupla.');
          return conferirCommit(banco);
        },
      },
      {
        id: 'consultar',
        titulo: 'Consultar e mostrar',
        ensina: 'SELECT lê a tabela sem alterar nada; * significa todas as colunas. Depois do execute, fetchall() devolve todas as linhas numa lista, cada linha como uma tupla. É isso que o print mostra.',
        exemplo: 'cursor.execute("SELECT * FROM Produtos")\nprint(cursor.fetchall())',
        pedido: 'Consulte a tabela inteira e mostre o resultado com print(cursor.fetchall()).',
        conferir: ({ banco, saida }) => {
          const base = conferirBancoAberto(banco);
          if (!base.ok) return base;
          const esperado = "[(1, 'Camiseta', 19.99, 50), (2, 'Caneca', 29.9, 20)]";
          return saida.includes(esperado) ? aprovado() : falta(`A saída precisa mostrar as duas linhas: ${esperado}. Confira se o print está depois do SELECT.`);
        },
      },
      {
        id: 'atualizar',
        titulo: 'Alterar só uma linha',
        ensina: 'UPDATE muda linhas que já existem. SET diz o que muda e WHERE escolhe em quais linhas. Sem o WHERE, todas as linhas mudam: é o erro mais caro de SQL. Os valores de novo vão com ?.',
        exemplo: 'cursor.execute("UPDATE Produtos SET preco = ? WHERE id = ?", (24.99, 1))\nconexao.commit()',
        pedido: 'A Camiseta subiu para 24.99. Altere só o preço dela (id 1), usando ? e commit.',
        conferir: ({ banco, codigo }) => {
          const base = primeiro(conferirBancoAberto(banco),
            conferirLinhas(banco, [[1, 'Camiseta', 24.99, 50], [2, 'Caneca', 29.9, 20]], 'Só a linha de id 1 deve mudar: confira o WHERE.'));
          if (!base.ok) return base;
          if (!usaInterrogacao(semComentarios(codigo), 'UPDATE')) return falta('O preço mudou, mas o valor foi escrito dentro do SQL. Use ? no SET e no WHERE.');
          return conferirCommit(banco);
        },
      },
      {
        id: 'apagar',
        titulo: 'Apagar só uma linha',
        ensina: 'DELETE FROM apaga linhas. De novo, o WHERE é o que protege: sem ele, a tabela inteira fica vazia. A tupla com um valor só precisa da vírgula: (2,).',
        exemplo: 'cursor.execute("DELETE FROM Produtos WHERE id = ?", (2,))\nconexao.commit()',
        pedido: 'A Caneca saiu de linha. Apague só ela (id 2), usando ? e commit. A Camiseta deve continuar.',
        conferir: ({ banco, codigo }) => {
          const base = primeiro(conferirBancoAberto(banco),
            conferirLinhas(banco, [[1, 'Camiseta', 24.99, 50]], 'Só a linha de id 2 deve sair: confira o WHERE.'));
          if (!base.ok) return base;
          if (!usaInterrogacao(semComentarios(codigo), 'DELETE')) return falta('A linha saiu, mas o id foi escrito dentro do SQL. Use WHERE id = ? e passe (2,).');
          return conferirCommit(banco);
        },
      },
    ],
  },
  u3a2: {
    titulo: 'Agora monte suas tabelas do pandas, um degrau por vez',
    introducao: 'O exemplo do professor mostra Series e DataFrame prontos. Aqui você cria os seus, uma coisa por degrau. Depois de cada execução, a conferência olha as variáveis que ficaram no programa: quais valores, quais rótulos e quais colunas.',
    inicial: 'import pandas as pd\n\n',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você criou uma Series com rótulos, fez contas sem nenhum for, montou um DataFrame e leu o tamanho, as colunas e uma coluna dele. É o que o exemplo do professor faz, agora com cada linha entendida.',
    degraus: [
      {
        id: 'serie',
        titulo: 'Uma Series',
        ensina: 'Uma Series é uma coluna de valores. pd.Series([20, 30, 40]) cria essa coluna. Ao mostrar, o pandas coloca à esquerda os rótulos 0, 1 e 2, que ele cria sozinho, e embaixo o dtype, o tipo dos valores: int64 quer dizer números inteiros.',
        exemplo: 'idades = pd.Series([20, 30, 40])\nprint(idades)',
        pedido: 'Crie a Series idades com 20, 30 e 40 e mostre com print.',
        conferir: ({ sonda, saida }) => semSonda(sonda) || (
          doTipo(sonda, 'Series').some(([, s]) => mesmosValores(s.valores, [20, 30, 40]))
            ? (saidaTem(saida, 'dtype') ? aprovado() : falta('A Series foi criada, mas não apareceu na saída. Mostre com print(idades).'))
            : falta('Não encontrei uma Series com 20, 30 e 40. Confira os colchetes dentro de pd.Series([...]).')),
      },
      {
        id: 'rotulos',
        titulo: 'Rótulos com index=',
        ensina: 'Em vez de 0, 1 e 2, você pode dar nomes aos rótulos. index= recebe uma lista com um rótulo para cada valor, na mesma ordem: o primeiro rótulo fica com o primeiro valor.',
        exemplo: 'idades = pd.Series([25, 30, 22], index=["Alice", "Bob", "Carol"])\nprint(idades)',
        pedido: 'Troque a Series por idades 25, 30 e 22, com os rótulos Alice, Bob e Carol.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const series = doTipo(sonda, 'Series').map(([, s]) => s);
          const certa = series.find((s) => mesmosValores(s.valores, [25, 30, 22]));
          if (!certa) return falta('Não encontrei uma Series com 25, 30 e 22.');
          return mesmosValores(certa.indice, ['Alice', 'Bob', 'Carol']) ? aprovado()
            : falta(`Os rótulos ficaram ${texto(certa.indice)}; o pedido é "Alice", "Bob", "Carol". Eles vão em index=[...].`);
        },
      },
      {
        id: 'contas',
        titulo: 'Contas prontas e acesso pelo rótulo',
        ensina: 'A Series já sabe fazer contas, sem for: mean() dá a média, max() o maior valor e sum() a soma. Para pegar um valor só, use o rótulo entre colchetes: idades["Bob"] dá 30.',
        exemplo: 'print(idades.mean())\nprint(idades["Bob"])',
        pedido: 'Mostre a média das idades e depois a idade da Carol, pegando pelo rótulo.',
        conferir: ({ saida, codigo }) => {
          if (!saidaTem(saida, '25.666666666666668')) return falta('A média das idades 25, 30 e 22 é 25.666666666666668 e ela ainda não apareceu na saída. Use print(idades.mean()).');
          if (!/\[\s*["']Carol["']\s*\]/.test(semComentarios(codigo))) return falta('Falta pegar a idade da Carol pelo rótulo: idades["Carol"].');
          return saida.split('\n').some((l) => l.trim() === '22') ? aprovado() : falta('A idade da Carol (22) ainda não apareceu sozinha numa linha. Use print(idades["Carol"]).');
        },
      },
      {
        id: 'dataframe',
        titulo: 'Uma tabela: DataFrame',
        ensina: 'Um DataFrame é uma tabela com várias colunas. Ele nasce de um dicionário: cada chave vira o nome de uma coluna e cada lista vira os valores dela. Todas as listas precisam ter o mesmo tamanho, porque cada posição é uma linha.',
        exemplo: 'dados = {"Nome": ["Alice", "Bob", "Carol"], "Idade": [25, 30, 22]}\ndf = pd.DataFrame(dados)\nprint(df)',
        pedido: 'Monte o DataFrame df com as colunas Nome (Alice, Bob, Carol) e Idade (25, 30, 22) e mostre com print.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const tabelas = doTipo(sonda, 'DataFrame').map(([, t]) => t);
          if (!tabelas.length) return falta('Ainda não há nenhum DataFrame no programa. Use pd.DataFrame(dados).');
          const certa = tabelas.find((t) => mesmosValores(t.colunas, ['Nome', 'Idade']));
          if (!certa) return falta(`A tabela ficou com as colunas ${texto(tabelas[0].colunas)}; o pedido é "Nome", "Idade". As colunas são as chaves do dicionário.`);
          return mesmosValores(certa.linhas, [['Alice', 25], ['Bob', 30], ['Carol', 22]]) ? aprovado()
            : falta('As colunas estão certas, mas as linhas não. Confira se cada nome está na mesma posição da sua idade.');
        },
      },
      {
        id: 'forma',
        titulo: 'Tamanho e colunas',
        ensina: 'shape diz o tamanho da tabela como (linhas, colunas). columns guarda os nomes das colunas; list(...) transforma esses nomes numa lista comum para mostrar. Repare que shape e columns não têm parênteses: são informações guardadas, não ações.',
        exemplo: 'print(df.shape)\nprint(list(df.columns))',
        pedido: 'Mostre o tamanho do df e a lista com os nomes das colunas.',
        conferir: ({ saida }) => (saidaTem(saida, '(3, 2)')
          ? (saidaTem(saida, "['Nome', 'Idade']") ? aprovado() : falta("Falta a lista das colunas: print(list(df.columns)) mostra ['Nome', 'Idade']."))
          : falta('O tamanho (3, 2) ainda não apareceu na saída. Use print(df.shape), sem parênteses depois de shape.')),
      },
      {
        id: 'coluna',
        titulo: 'Uma coluna é uma Series',
        ensina: 'df["Idade"] pega uma coluna da tabela, e uma coluna é uma Series: por isso tem as mesmas contas prontas. df["Idade"].max() dá a maior idade da tabela.',
        exemplo: 'print(df["Idade"].max())',
        pedido: 'Mostre a maior idade da tabela, usando a coluna Idade do df.',
        conferir: ({ saida, codigo }) => (/\[\s*["']Idade["']\s*\]\s*\.\s*max\s*\(/.test(semComentarios(codigo))
          ? (saida.split('\n').some((l) => l.trim() === '30') ? aprovado() : falta('A maior idade (30) ainda não apareceu sozinha numa linha. Mostre com print(...).'))
          : falta('Falta pegar a coluna e pedir o maior valor: df["Idade"].max().')),
      },
    ],
  },

  u3a3: {
    titulo: 'Agora limpe e analise uma tabela de vendas, um degrau por vez',
    introducao: 'A tabela vendas já está no editor, e ela tem um problema: a Caneta aparece duas vezes. Aqui você limpa, calcula e filtra, uma coisa por degrau. A conferência olha a tabela que ficou no programa depois de cada execução.',
    inicial: 'import pandas as pd\n\nvendas = pd.DataFrame({\n    "nome": ["Caneta", "Caderno", "Mochila", "Caneta", "Estojo"],\n    "quantidade": [10, 4, 2, 10, 5],\n    "receita": [30, 80, 240, 30, 75],\n})\nprint(vendas)\n\n',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você fez o caminho completo de uma análise: tirou as linhas repetidas, criou uma coluna calculada, filtrou os itens que interessam e mostrou só os nomes. É o mesmo caminho do exemplo do professor e do trabalho da Unidade 3.',
    degraus: [
      {
        id: 'duplicadas',
        titulo: 'Tirar as linhas repetidas',
        ensina: 'drop_duplicates() apaga as linhas que são cópia exata de outra. Ele devolve uma tabela nova, então guarde o resultado de volta em vendas; outra forma é drop_duplicates(inplace=True), que altera a própria tabela.',
        exemplo: 'vendas = vendas.drop_duplicates()\nprint(vendas.shape)',
        pedido: 'Tire a Caneta repetida da tabela vendas e mostre o tamanho dela.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const tabela = variaveis(sonda).vendas;
          if (tabela?.tipo !== 'DataFrame') return falta('A variável vendas precisa continuar sendo a tabela. Guarde o resultado nela: vendas = vendas.drop_duplicates().');
          return tabela.linhas.length === 4 ? aprovado()
            : falta(`A tabela vendas ainda tem ${tabela.linhas.length} linhas; sem a Caneta repetida, são 4. drop_duplicates devolve uma tabela nova: guarde em vendas.`);
        },
      },
      {
        id: 'nova-coluna',
        titulo: 'Criar uma coluna calculada',
        ensina: 'Para criar uma coluna, escreva o nome novo entre colchetes e atribua um cálculo com outras colunas. A conta é feita linha por linha: a receita de cada item dividida pela quantidade dele dá o preço de uma unidade.',
        exemplo: 'vendas["preco"] = vendas["receita"] / vendas["quantidade"]\nprint(vendas)',
        pedido: 'Crie a coluna preco com a receita dividida pela quantidade.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const tabela = variaveis(sonda).vendas;
          const i = tabela?.colunas?.indexOf('preco') ?? -1;
          if (i < 0) return falta('A tabela vendas ainda não tem a coluna preco.');
          const precos = tabela.linhas.map((l) => l[i]);
          return mesmosValores(precos, [3, 20, 120, 15]) ? aprovado()
            : falta(`Os preços saíram ${texto(precos)}; o esperado é 3, 20, 120 e 15. Confira a ordem: receita dividida por quantidade.`);
        },
      },
      {
        id: 'filtro',
        titulo: 'Filtrar as linhas',
        ensina: 'vendas["preco"] > 10 compara cada preço com 10 e dá uma coluna de True e False. Colocada dentro de vendas[...], ela guarda só as linhas com True. O resultado é uma tabela nova.',
        exemplo: 'caros = vendas[vendas["preco"] > 10]\nprint(caros)',
        pedido: 'Guarde em caros só os itens com preço acima de 10.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const tabelas = doTipo(sonda, 'DataFrame').filter(([nome]) => nome !== 'vendas').map(([, t]) => t);
          const nomes = (t) => t.linhas.map((l) => l[t.colunas.indexOf('nome')]);
          if (!tabelas.length) return falta('Guarde o filtro numa tabela nova: caros = vendas[vendas["preco"] > 10].');
          return tabelas.some((t) => mesmosValores(nomes(t), ['Caderno', 'Mochila', 'Estojo'])) ? aprovado()
            : falta(`O filtro ficou com ${texto(nomes(tabelas[tabelas.length - 1]))}; acima de 10 são Caderno, Mochila e Estojo. Confira o sinal > e o número 10.`);
        },
      },
      {
        id: 'nomes',
        titulo: 'Mostrar só os nomes',
        ensina: 'caros["nome"] pega só a coluna dos nomes. list(...) transforma essa coluna numa lista comum, que o print mostra entre colchetes. É assim que se responde "quais são os itens?" sem mostrar a tabela inteira.',
        exemplo: 'print(list(caros["nome"]))',
        pedido: 'Mostre a lista com os nomes dos itens caros.',
        conferir: ({ saida }) => (saidaTem(saida, "['Caderno', 'Mochila', 'Estojo']") ? aprovado()
          : falta("A lista ['Caderno', 'Mochila', 'Estojo'] ainda não apareceu na saída. Use print(list(caros[\"nome\"])).")),
      },
    ],
  },
  u3a4: {
    titulo: 'Agora faça gráficos a partir dos dados, um degrau por vez',
    introducao: 'O exemplo do professor junta gráfico de linha, gráfico do pandas e agrupamento num código só. Aqui você faz um de cada vez. A conferência olha os gráficos que você desenhou e as tabelas que ficaram no programa.',
    inicial: 'import matplotlib.pyplot as plt\nimport pandas as pd\n\n',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você desenhou um gráfico de linha, um gráfico direto do pandas, agrupou dados com groupby e viu que a soma e a média do mesmo dado contam histórias diferentes. Esse último ponto é o que a apostila mais cobra: olhar o contexto, não só a barra mais alta.',
    degraus: [
      {
        id: 'linha',
        titulo: 'Gráfico de linha',
        ensina: 'plt.plot(x, y) marca cada par (x, y) como um ponto e liga os pontos com uma linha: é o gráfico para ver algo mudando em sequência, como vendas mês a mês. Termine com plt.close(): assim o próximo gráfico começa numa figura nova, em vez de ser desenhado por cima.',
        exemplo: 'x = [1, 2, 3, 4, 5]\ny = [2, 4, 1, 3, 5]\nplt.plot(x, y)\nplt.close()',
        pedido: 'Desenhe a linha com x de 1 a 5 e y igual a 2, 4, 1, 3 e 5, terminando com plt.close().',
        conferir: ({ graficos, codigo }) => {
          const linhas = todosEixos(graficos).flatMap((e) => e.pontos || []);
          if (!linhas.length) return falta('Nenhuma linha apareceu. Confira o plt.plot(x, y).');
          if (!linhas.some((l) => mesmosValores(l.y, [2, 4, 1, 3, 5]))) return falta(`A linha saiu com y = ${texto(linhas[0].y)}; o pedido é 2, 4, 1, 3, 5. O y é a segunda lista do plt.plot.`);
          return /\bplt\.close\s*\(/.test(semComentarios(codigo)) ? aprovado() : falta('Falta o plt.close() no fim do gráfico.');
        },
      },
      {
        id: 'pandas-plot',
        titulo: 'Gráfico direto do pandas',
        ensina: 'Um DataFrame desenha o próprio gráfico com plot(). x= escolhe a coluna que vai embaixo, y= a coluna das alturas e kind="bar" pede barras. É o mesmo Matplotlib por baixo, só que você não precisa separar as listas.',
        exemplo: 'df = pd.DataFrame({"Produto": ["A", "B", "C"], "qtde_vendida": [33, 50, 45]})\ndf.plot(x="Produto", y="qtde_vendida", kind="bar")\nplt.close()',
        pedido: 'Monte o df com os produtos A, B e C vendendo 33, 50 e 45, e desenhe as barras pelo pandas.',
        conferir: ({ graficos }) => {
          const eixo = todosEixos(graficos).find((e) => mesmosValores(e.barras, [33, 50, 45]));
          if (!eixo) return falta('Não encontrei um gráfico com as barras 33, 50 e 45. Confira o y= e o kind="bar".');
          return mesmosValores(eixo.rotulos.slice(0, 3), ['A', 'B', 'C']) ? aprovado() : falta('As barras estão certas, mas os nomes embaixo não são A, B e C. Confira o x="Produto".');
        },
      },
      {
        id: 'groupby',
        titulo: 'Agrupar e somar',
        ensina: 'groupby("time") separa as linhas em grupos, um por período. ["total_bill"] escolhe a coluna do valor, e sum() soma dentro de cada grupo. O resultado é uma Series: os rótulos são os grupos, em ordem alfabética, e os valores são as somas.',
        exemplo: 'contas = pd.DataFrame({"time": ["Lunch", "Lunch", "Dinner", "Dinner", "Dinner"],\n                       "total_bill": [10, 20, 30, 40, 50]})\nsoma = contas.groupby("time")["total_bill"].sum()\nprint(soma)',
        pedido: 'Monte a tabela contas do exemplo e guarde em soma o total gasto em cada período.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const series = doTipo(sonda, 'Series').map(([, s]) => s);
          const certa = series.find((s) => mesmosValores(s.indice, ['Dinner', 'Lunch']) && mesmosValores(s.valores, [120, 30]));
          if (certa) return aprovado();
          const agrupada = series.find((s) => mesmosValores(s.indice, ['Dinner', 'Lunch']));
          return falta(agrupada ? `O agrupamento deu ${texto(agrupada.valores)}; somando, Dinner dá 120 e Lunch dá 30. Confira se usou sum().` : 'Ainda não há uma Series agrupada por período. Use contas.groupby("time")["total_bill"].sum().');
        },
      },
      {
        id: 'media',
        titulo: 'A média conta outra história',
        ensina: 'Troque sum() por mean() e a pergunta muda: em vez de "quanto se gastou no total", vira "quanto gasta cada conta, em média". No Dinner o total é maior porque há mais contas (3 contra 2). Para saber quantas são, use count().',
        exemplo: 'media = contas.groupby("time")["total_bill"].mean()\nprint(media)',
        pedido: 'Guarde em media a média por período e mostre as duas Series, soma e media.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const series = doTipo(sonda, 'Series').map(([, s]) => s);
          if (!series.some((s) => mesmosValores(s.indice, ['Dinner', 'Lunch']) && mesmosValores(s.valores, [40, 15]))) {
            return falta('Não encontrei a média por período: Dinner 40 e Lunch 15. Use mean() no lugar de sum().');
          }
          return series.some((s) => mesmosValores(s.valores, [120, 30])) ? aprovado() : falta('A média está certa, mas a soma sumiu. Mantenha as duas para comparar.');
        },
      },
      {
        id: 'grafico-do-grupo',
        titulo: 'Gráfico do resultado',
        ensina: 'O resultado do groupby é uma Series, e toda Series também desenha: soma.plot(kind="bar") faz uma barra por grupo. title= já escreve o título, sem precisar de plt.title.',
        exemplo: 'soma.plot(kind="bar", title="Total por período")\nplt.close()',
        pedido: 'Desenhe as barras da soma por período, com um título.',
        conferir: ({ graficos }) => {
          const eixo = todosEixos(graficos).find((e) => mesmosValores(e.barras, [120, 30]));
          if (!eixo) return falta('Não encontrei um gráfico com as barras 120 e 30. Desenhe a partir de soma: soma.plot(kind="bar").');
          return eixo.titulo.trim() ? aprovado() : falta('O gráfico está certo, mas sem título. Use title="..." dentro do plot.');
        },
      },
    ],
  },
  u2a2: {
    titulo: 'Agora guarde dados do jeito certo, um degrau por vez',
    introducao: 'O exemplo do professor mostra conjunto, dicionário e NumPy num código só. Aqui você usa um de cada vez. A conferência olha as variáveis que ficaram no programa: o que tem no conjunto, as chaves do dicionário e os valores do array.',
    inicial: 'notas = [7, 8, 7, 10, 8]\n\n',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você usou as três estruturas da aula: o conjunto para tirar repetidos, o dicionário para dar nome a cada dado e o array do NumPy para fazer a mesma conta em todos os valores de uma vez.',
    degraus: [
      {
        id: 'conjunto',
        titulo: 'Tirar repetidos com um conjunto',
        ensina: 'Um conjunto (set) guarda cada valor uma vez só. set(notas) cria um conjunto com as notas sem as repetidas, e len diz quantos valores diferentes sobraram. Um conjunto não tem ordem nem posição: por isso não existe conjunto[0].',
        exemplo: 'diferentes = set(notas)\nprint(len(diferentes))',
        pedido: 'Guarde em diferentes as notas sem repetição e mostre quantas são.',
        conferir: ({ sonda, saida }) => semSonda(sonda) || (
          doTipo(sonda, 'set').some(([, c]) => mesmosValores([...c.valores].sort((a, b) => a - b), [7, 8, 10]))
            ? (saida.split('\n').some((l) => l.trim() === '3') ? aprovado() : falta('O conjunto está certo; falta mostrar quantos valores ele tem: print(len(diferentes)) mostra 3.'))
            : falta('Não encontrei um conjunto com 7, 8 e 10. Use set(notas).')),
      },
      {
        id: 'add-remove',
        titulo: 'Colocar e tirar do conjunto',
        ensina: 'add coloca um valor no conjunto e remove tira. Adicionar um valor que já está lá não muda nada, porque o conjunto não repete.',
        exemplo: 'diferentes.add(9)\ndiferentes.remove(7)',
        pedido: 'Coloque a nota 9 em diferentes e tire a nota 7.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const conjuntos = doTipo(sonda, 'set').map(([, c]) => [...c.valores].sort((a, b) => a - b));
          if (conjuntos.some((v) => mesmosValores(v, [8, 9, 10]))) return aprovado();
          return falta(conjuntos.length ? `O conjunto ficou com ${texto(conjuntos[0])}; o esperado é 8, 9 e 10.` : 'Não encontrei o conjunto diferentes.');
        },
      },
      {
        id: 'dicionario',
        titulo: 'Um dicionário: dados com nome',
        ensina: 'Um dicionário liga cada chave a um valor, entre chaves { }. Em vez de lembrar que a posição 0 é o nome, você pede pelo nome da chave: aluno["nome"] dá Ana.',
        exemplo: 'aluno = {"nome": "Ana", "idade": 20}\nprint(aluno["nome"])',
        pedido: 'Crie o dicionário aluno com nome Ana e idade 20, e mostre o nome pela chave.',
        conferir: ({ sonda, saida }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const certo = doTipo(sonda, 'dict').some(([, d]) => d.valor.nome === 'Ana' && d.valor.idade === 20);
          if (!certo) return falta('Não encontrei um dicionário com "nome": "Ana" e "idade": 20. Confira os dois-pontos entre cada chave e seu valor.');
          return saida.split('\n').some((l) => l.trim() === 'Ana') ? aprovado() : falta('Falta mostrar o nome pela chave: print(aluno["nome"]).');
        },
      },
      {
        id: 'mudar-dicionario',
        titulo: 'Mudar e acrescentar',
        ensina: 'Atribuir a uma chave que já existe troca o valor. Atribuir a uma chave nova acrescenta uma entrada. É a mesma escrita nos dois casos: aluno["chave"] = valor.',
        exemplo: 'aluno["idade"] = 21\naluno["curso"] = "ADS"',
        pedido: 'Faça a Ana fazer aniversário (idade 21) e acrescente o curso ADS.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const dicionarios = doTipo(sonda, 'dict').map(([, d]) => d.valor);
          if (dicionarios.some((d) => d.nome === 'Ana' && d.idade === 21 && d.curso === 'ADS')) return aprovado();
          const ana = dicionarios.find((d) => d.nome === 'Ana');
          if (!ana) return falta('Não encontrei o dicionário aluno.');
          return falta(ana.idade !== 21 ? `A idade ficou ${ana.idade}; o pedido é 21.` : 'Falta a chave curso com o valor "ADS".');
        },
      },
      {
        id: 'percorrer',
        titulo: 'Percorrer o dicionário',
        ensina: 'items() entrega cada par (chave, valor). Com for chave, valor in aluno.items(), cada volta do laço recebe um par, separado em dois nomes.',
        exemplo: 'for chave, valor in aluno.items():\n    print(chave, valor)',
        pedido: 'Mostre cada chave do aluno ao lado do seu valor, uma por linha.',
        conferir: ({ saida }) => (['nome Ana', 'idade 21', 'curso ADS'].every((l) => saida.split('\n').some((s) => s.trim() === l))
          ? aprovado()
          : falta('A saída precisa ter as linhas nome Ana, idade 21 e curso ADS. Use print(chave, valor) dentro do for.')),
      },
      {
        id: 'numpy',
        titulo: 'A mesma conta em todos os valores',
        ensina: 'Com uma lista, dobrar cada valor pede um for. Um array do NumPy faz a conta em todos de uma vez: valores * 2 dobra cada item. np é o apelido do NumPy, como o m do math.',
        exemplo: 'import numpy as np\nvalores = np.array([1, 2, 3, 4])\ndobro = valores * 2\nprint(dobro)',
        pedido: 'Crie o array valores com 1, 2, 3 e 4 e guarde em dobro cada um multiplicado por 2.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const arrays = doTipo(sonda, 'ndarray').map(([, a]) => a.valores);
          if (!arrays.length) return falta('Ainda não há um array do NumPy. Use np.array([...]) depois de import numpy as np.');
          return arrays.some((v) => mesmosValores(v, [2, 4, 6, 8])) ? aprovado() : falta('Não encontrei o array com 2, 4, 6 e 8. Multiplique o array inteiro: valores * 2.');
        },
      },
    ],
  },

  u2a3: {
    titulo: 'Agora monte as classes do professor, um degrau por vez',
    introducao: 'O exemplo do professor tem Veiculo e Carro prontos, com herança e método sobrescrito. Aqui você monta o mesmo, uma parte por degrau. A conferência olha as classes e os objetos que ficaram no programa e o que cada objeto guardou.',
    inicial: '',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você montou do zero o que o exemplo do professor mostra: uma classe com atributos e métodos, uma classe-filha que reaproveita o pai com super() e um método sobrescrito que faz o Carro acelerar diferente. É isso que herança e polimorfismo querem dizer.',
    degraus: [
      {
        id: 'classe',
        titulo: 'A classe e o primeiro objeto',
        ensina: 'Uma classe é o molde; o objeto é a coisa feita com ele. __init__ roda sozinho quando o objeto é criado e recebe os dados. self é o próprio objeto: self.marca = marca guarda a marca dentro dele.',
        exemplo: 'class Veiculo:\n    def __init__(self, marca, modelo):\n        self.marca = marca\n        self.modelo = modelo\n\ncarro1 = Veiculo("Toyota", "Corolla")',
        pedido: 'Crie a classe Veiculo com marca e modelo, e o objeto carro1 de um Toyota Corolla.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          if (!doTipo(sonda, 'classe').some(([, c]) => c.nome === 'Veiculo')) return falta('Ainda não há uma classe chamada Veiculo.');
          const objeto = doTipo(sonda, 'objeto').map(([, o]) => o).find((o) => o.classe === 'Veiculo');
          if (!objeto) return falta('A classe existe, mas nenhum objeto foi criado com ela. Faça carro1 = Veiculo("Toyota", "Corolla").');
          return objeto.atributos.marca === 'Toyota' && objeto.atributos.modelo === 'Corolla' ? aprovado()
            : falta(`O objeto guardou marca ${objeto.atributos.marca} e modelo ${objeto.atributos.modelo}. Confira o self.marca = marca e o self.modelo = modelo.`);
        },
      },
      {
        id: 'atributo-inicial',
        titulo: 'Um atributo que começa sozinho',
        ensina: 'Nem todo atributo vem de fora. Todo veículo começa parado, então a velocidade não precisa ser informada: dentro do __init__, self.velocidade = 0 dá esse valor inicial a todo objeto novo.',
        exemplo: '        self.velocidade = 0',
        pedido: 'Faça todo Veiculo começar com velocidade 0.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const objeto = doTipo(sonda, 'objeto').map(([, o]) => o).find((o) => o.classe === 'Veiculo');
          if (!objeto) return falta('Não encontrei o objeto carro1.');
          return objeto.atributos.velocidade === 0 ? aprovado() : falta('O carro1 não tem velocidade 0. Coloque self.velocidade = 0 dentro do __init__, com o mesmo recuo das outras linhas.');
        },
      },
      {
        id: 'metodo-que-muda',
        titulo: 'Um método que muda o objeto',
        ensina: 'Um método é uma função dentro da classe; o primeiro parâmetro é sempre self. acelerar soma o incremento à velocidade do próprio objeto. Para usar, chame pelo objeto: carro1.acelerar(50).',
        exemplo: '    def acelerar(self, incremento):\n        self.velocidade += incremento\n\ncarro1.acelerar(50)',
        pedido: 'Crie o método acelerar e faça o carro1 acelerar 50.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const classe = doTipo(sonda, 'classe').map(([, c]) => c).find((c) => c.nome === 'Veiculo');
          if (!classe?.metodos.includes('acelerar')) return falta('A classe Veiculo ainda não tem o método acelerar. Ele vai dentro da classe, com recuo.');
          const objeto = doTipo(sonda, 'objeto').map(([, o]) => o).find((o) => o.classe === 'Veiculo');
          return objeto?.atributos.velocidade === 50 ? aprovado() : falta(`O carro1 ficou com velocidade ${objeto?.atributos.velocidade}; depois de acelerar 50, são 50. Chame carro1.acelerar(50) depois de criar o objeto.`);
        },
      },
      {
        id: 'metodo-que-devolve',
        titulo: 'Um método que devolve um texto',
        ensina: 'Um método também pode só responder algo, sem mudar o objeto. status monta um texto com os atributos e o devolve com return; quem chamou decide o que fazer com ele, como mostrar com print.',
        exemplo: '    def status(self):\n        return f"{self.marca} {self.modelo} a {self.velocidade} km/h"\n\nprint(carro1.status())',
        pedido: 'Crie o método status e mostre o status do carro1.',
        conferir: ({ saida }) => {
          if (!saidaTem(saida, 'Toyota Corolla a 50 km/h')) return falta('A saída precisa mostrar Toyota Corolla a 50 km/h. Confira o return dentro do status e o print(carro1.status()).');
          // print dentro do método mostra o texto, mas o método devolve None, e o print de fora mostra esse None.
          return saida.split('\n').some((l) => l.trim() === 'None')
            ? falta('Apareceu um None depois do texto: o status está mostrando com print em vez de devolver com return. Troque o print de dentro do método por return.')
            : aprovado();
        },
      },
      {
        id: 'heranca',
        titulo: 'Herança: o Carro reaproveita o Veiculo',
        ensina: 'class Carro(Veiculo) cria uma classe-filha, que já nasce com tudo do pai. No __init__ dela, super().__init__(marca, modelo) roda o __init__ do Veiculo, que guarda marca, modelo e velocidade; o Carro só acrescenta a potencia.',
        exemplo: 'class Carro(Veiculo):\n    def __init__(self, marca, modelo, potencia):\n        super().__init__(marca, modelo)\n        self.potencia = potencia\n\nmeu_carro = Carro("Honda", "Civic", 150)',
        pedido: 'Crie a classe Carro, filha de Veiculo, com potencia, e o objeto meu_carro de um Honda Civic de potência 150.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const classe = doTipo(sonda, 'classe').map(([, c]) => c).find((c) => c.nome === 'Carro');
          if (!classe) return falta('Ainda não há uma classe chamada Carro.');
          if (!classe.bases.includes('Veiculo')) return falta('A classe Carro existe, mas não é filha de Veiculo. Escreva class Carro(Veiculo):.');
          const objeto = doTipo(sonda, 'objeto').map(([, o]) => o).find((o) => o.classe === 'Carro');
          if (!objeto) return falta('Nenhum objeto foi criado com a classe Carro.');
          if (objeto.atributos.velocidade !== 0) return falta('O meu_carro não tem velocidade. Isso acontece quando o super().__init__(marca, modelo) falta: o __init__ do Veiculo não roda.');
          return objeto.atributos.potencia === 150 && objeto.atributos.marca === 'Honda' ? aprovado() : falta('Confira os dados do meu_carro: Honda, Civic e potência 150.');
        },
      },
      {
        id: 'sobrescrita',
        titulo: 'O mesmo método, outro comportamento',
        ensina: 'Se a classe-filha escreve um método com o mesmo nome do pai, vale o da filha: é a sobrescrita. No Carro, acelerar soma também a potência. O carro1 continua acelerando do jeito do Veiculo; é isso que polimorfismo quer dizer.',
        exemplo: '    def acelerar(self, incremento):\n        self.velocidade += incremento + self.potencia\n\nmeu_carro.acelerar(50)\nprint(meu_carro.status())',
        pedido: 'Sobrescreva acelerar no Carro para somar a potência, faça o meu_carro acelerar 50 e mostre o status dele.',
        conferir: ({ sonda, saida }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const objetos = doTipo(sonda, 'objeto').map(([, o]) => o);
          const carro = objetos.find((o) => o.classe === 'Carro');
          const veiculo = objetos.find((o) => o.classe === 'Veiculo');
          if (carro?.atributos.velocidade !== 200) return falta(`O meu_carro ficou com velocidade ${carro?.atributos.velocidade}; com 50 de incremento e 150 de potência, são 200. O acelerar novo vai dentro da classe Carro.`);
          if (veiculo && veiculo.atributos.velocidade !== 50) return falta('O carro1 também mudou de jeito de acelerar. O método novo deve ficar só dentro do Carro.');
          return saidaTem(saida, 'Honda Civic a 200 km/h') ? aprovado() : falta('Falta mostrar o status: print(meu_carro.status()) mostra Honda Civic a 200 km/h.');
        },
      },
    ],
  },
};
