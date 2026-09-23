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

// Na Unidade 1 dá para "acertar" escrevendo print("Adulto") sem if nenhum. Por isso estas duas
// sondas testam o comportamento, não a saída de uma execução só.
// A de variações roda o código do estudante de novo, escondido, com outros valores no lugar dos
// do começo (outra idade, outra lista) e guarda o que cada versão mostrou.
// A de chamadas chama as funções do estudante com entradas novas e guarda o que elas devolvem.
// As duas recebem o código como literal JSON, que também é um texto válido em Python.
export const sondaDeVariacoes = (codigo, variacoes = []) => `
try:
    import json as _pc_json, io as _pc_io, contextlib as _pc_ctx
    _pc_src = ${JSON.stringify(String(codigo || ''))}
    _pc_res = []
    for _pc_trocas in ${JSON.stringify(variacoes.map((v) => v.trocas))}:
        _pc_buf = _pc_io.StringIO()
        _pc_item = {"trocou": all(_pc_de in _pc_src for _pc_de, _pc_para in _pc_trocas)}
        _pc_versao = _pc_src
        for _pc_de, _pc_para in _pc_trocas:
            _pc_versao = _pc_versao.replace(_pc_de, _pc_para, 1)
        try:
            with _pc_ctx.redirect_stdout(_pc_buf):
                exec(_pc_versao, {"__name__": "__main__"})
            _pc_item["ok"] = True
        except Exception as _pc_e:
            _pc_item["ok"] = False
            _pc_item["erro"] = type(_pc_e).__name__ + ": " + str(_pc_e)
        _pc_item["saida"] = _pc_buf.getvalue()
        _pc_res.append(_pc_item)
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"variacoes": _pc_res}, ensure_ascii=False))
except Exception as _pc_erro:
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"erro": str(_pc_erro)}))
`;

export const sondaDeChamadas = (expressoes = []) => `
try:
    import json as _pc_json, io as _pc_io, contextlib as _pc_ctx
    def _pc_js(v, fundo=0):
        if v is None or isinstance(v, (bool, int, float, str)):
            return v
        if fundo > 3:
            return repr(v)
        if hasattr(v, "tolist"):
            return _pc_js(v.tolist(), fundo + 1)
        if isinstance(v, (list, tuple)):
            return [_pc_js(x, fundo + 1) for x in v]
        if isinstance(v, dict):
            return {str(k): _pc_js(x, fundo + 1) for k, x in v.items()}
        return repr(v)
    _pc_res = []
    for _pc_expr in ${JSON.stringify(expressoes)}:
        _pc_buf = _pc_io.StringIO()
        try:
            with _pc_ctx.redirect_stdout(_pc_buf):
                _pc_v = eval(_pc_expr, globals())
            _pc_res.append({"expr": _pc_expr, "ok": True, "tipo": type(_pc_v).__name__, "valor": _pc_js(_pc_v), "imprimiu": _pc_buf.getvalue()})
        except Exception as _pc_e:
            _pc_res.append({"expr": _pc_expr, "ok": False, "erro": type(_pc_e).__name__ + ": " + str(_pc_e), "imprimiu": _pc_buf.getvalue()})
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"chamadas": _pc_res}, ensure_ascii=False))
except Exception as _pc_erro:
    print("\\n${MARCA_DA_SONDA}" + _pc_json.dumps({"erro": str(_pc_erro)}))
`;

const linhas = (saida) => String(saida || '').split('\n').map((l) => l.trim());
const temLinha = (saida, linha) => linhas(saida).includes(linha);
// As linhas pedidas, nesta ordem e seguidas, em algum ponto da saída.
const temSequencia = (saida, sequencia) => {
  const ls = linhas(saida);
  return ls.some((_, i) => sequencia.every((l, j) => ls[i + j] === l));
};

// Confere cada variação: o que precisa aparecer e o que não pode aparecer. A primeira linha que
// a variação troca precisa continuar no código; sem ela, não há como testar outros valores.
const conferirVariacoes = (sonda, variacoes, linhaInicial) => {
  if (!sonda || sonda.erro || !Array.isArray(sonda.variacoes)) return falta('Não consegui testar o código com outros valores. Execute de novo.');
  for (const [i, v] of variacoes.entries()) {
    const r = sonda.variacoes[i];
    if (!r?.trocou) return falta(`Mantenha a linha ${linhaInicial} no começo, do jeito que está: a conferência troca esse valor para testar os outros casos.`);
    if (!r.ok) return falta(`Com ${v.quando}, o programa deu erro: ${r.erro}.`);
    const faltando = (v.espera || []).find((l) => !temLinha(r.saida, l));
    if (faltando) return falta(`Testei com ${v.quando} e não apareceu ${faltando}. ${v.dica || ''}`.trim());
    // Linhas soltas podem vir de outro degrau do mesmo código; a sequência tem de aparecer inteira e em ordem.
    if (v.sequencia && !temSequencia(r.saida, v.sequencia)) return falta(`Testei com ${v.quando} e não apareceu ${v.sequencia.join(', ')}, nessa ordem. ${v.dica || ''}`.trim());
    const sobrando = (v.naoEspera || []).find((l) => temLinha(r.saida, l));
    if (sobrando) return falta(`Testei com ${v.quando} e apareceu ${sobrando}, que não deveria. ${v.dica || ''}`.trim());
  }
  return aprovado();
};

// Igualdade que aceita listas e dicionários e tolera a última casa decimal dos números.
const igualProfundo = (a, b) => {
  if (typeof b === 'number') return typeof a === 'number' && mesmoNumero(a, b);
  if (Array.isArray(b)) return Array.isArray(a) && a.length === b.length && b.every((x, i) => igualProfundo(a[i], x));
  if (b && typeof b === 'object') return !!a && typeof a === 'object' && !Array.isArray(a) && Object.keys(b).length === Object.keys(a).length && Object.keys(b).every((k) => igualProfundo(a[k], b[k]));
  return a === b;
};
const chamada = (sonda, expr) => sonda?.chamadas?.find((c) => c.expr === expr);
const conferirChamadas = (sonda, esperadas, nomeDaFuncao) => {
  if (!sonda || sonda.erro || !Array.isArray(sonda.chamadas)) return falta('Não consegui chamar a sua função. Execute de novo.');
  for (const [expr, esperado] of esperadas) {
    const c = chamada(sonda, expr);
    if (!c?.ok) {
      if (/NameError/.test(c?.erro || '')) return falta(`Não encontrei ${nomeDaFuncao} no programa. Confira se o nome está escrito igual ao pedido, com as mesmas letras.`);
      return falta(`Chamei ${expr} e deu erro: ${c?.erro}.`);
    }
    if (c.valor === null && c.imprimiu.trim()) return falta(`Chamei ${expr}: a função mostrou ${c.imprimiu.trim()} com print, mas devolveu None. Troque o print de dentro da função por return.`);
    if (!igualProfundo(c.valor, esperado)) return falta(`Chamei ${expr} e ela devolveu ${JSON.stringify(c.valor)}; o esperado é ${JSON.stringify(esperado)}.`);
  }
  return aprovado();
};



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
        ensina: 'A linha que já está no editor, import matplotlib.pyplot as plt, carrega o pyplot, a parte do Matplotlib que desenha, com o apelido plt. plt.bar recebe duas listas: primeiro os nomes das barras, depois as alturas. Mesmo com uma barra só, o nome e a altura vão cada um dentro de colchetes, como listas de um item.',
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
        ensina: 'Com uma lista, dobrar cada valor pede um for. Um array do NumPy faz a conta em todos de uma vez: valores * 2 dobra cada item. import numpy as np carrega o numpy com o apelido np, como o m do math.',
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
  u1a1: {
    titulo: 'Agora guarde valores e faça contas, um degrau por vez',
    introducao: 'Aqui você cria variáveis, descobre o tipo de cada valor, converte texto em número e faz contas. A conferência olha as variáveis que ficaram no programa e o que ele mostrou.',
    inicial: '',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você criou variáveis, leu o tipo de cada valor, converteu texto em número como se ele viesse do input() e usou as três divisões do Python. Essa diferença entre /, // e % é pergunta comum de prova.',
    degraus: [
      {
        id: 'variaveis',
        titulo: 'Guardar valores',
        ensina: 'Uma variável é um nome que guarda um valor. O sinal = guarda o valor da direita no nome da esquerda; não é o "igual" da matemática. Texto vai entre aspas; número vai sem aspas.',
        exemplo: 'nome = "Ana"\nidade = 20',
        pedido: 'Crie a variável nome com o texto Ana e a variável idade com o número 20.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const v = variaveis(sonda);
          if (v.nome?.valor !== 'Ana') return falta('A variável nome precisa guardar o texto "Ana", entre aspas.');
          if (v.idade?.tipo === 'str') return falta('A idade ficou como texto, porque está entre aspas. Número vai sem aspas: idade = 20.');
          return v.idade?.valor === 20 ? aprovado() : falta('A variável idade precisa guardar o número 20.');
        },
      },
      {
        id: 'tipos',
        titulo: 'O tipo de cada valor',
        ensina: 'type(valor) diz o tipo do valor: int é número inteiro, float é número com casas decimais, str é texto e bool é True ou False. Em Python a casa decimal usa ponto, não vírgula: 1.65. print(type(idade)) mostra <class \'int\'>.',
        exemplo: 'altura = 1.65\nprint(type(idade))\nprint(type(altura))',
        pedido: 'Crie altura com 1.65 e mostre o tipo de idade e o tipo de altura.',
        conferir: ({ saida, sonda }) => {
          if (variaveis(sonda).altura?.tipo === 'str') return falta('A altura ficou como texto. Use ponto e sem aspas: altura = 1.65.');
          if (!temLinha(saida, "<class 'int'>")) return falta("Falta mostrar o tipo da idade: print(type(idade)) mostra <class 'int'>.");
          return temLinha(saida, "<class 'float'>") ? aprovado() : falta("Falta mostrar o tipo da altura: print(type(altura)) mostra <class 'float'>.");
        },
      },
      {
        id: 'converter',
        titulo: 'Texto que vira número',
        ensina: 'O input() sempre devolve texto, mesmo quando a pessoa digita um número. Para fazer conta, converta: float("7.5") vira o número 7.5 e int("7") vira 7. int("7.5") dá erro (ValueError), porque int não aceita texto com ponto.',
        exemplo: 'nota_texto = "7.5"\nnota = float(nota_texto)',
        pedido: 'Guarde o texto "7.5" em nota_texto, como se tivesse vindo do input(), e converta para número em nota.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const v = variaveis(sonda);
          if (v.nota_texto?.valor !== '7.5') return falta('nota_texto precisa guardar o texto "7.5", com aspas.');
          return v.nota?.tipo === 'float' && mesmoNumero(v.nota.valor, 7.5) ? aprovado() : falta('nota precisa ser o número 7.5: use float(nota_texto).');
        },
      },
      {
        id: 'conta',
        titulo: 'Conta e f-string',
        ensina: 'Os parênteses mandam somar antes de dividir: sem eles, a divisão vem primeiro. Com um f antes das aspas, o texto vira uma f-string, e o nome de uma variável entre chaves é trocado pelo valor dela.',
        exemplo: 'media = (nota + 8.5) / 2\nprint(f"Media: {media}")',
        pedido: 'Calcule a média entre nota e 8.5 e mostre no formato Media: 8.0.',
        conferir: ({ saida }) => {
          if (temLinha(saida, 'Media: 11.75')) return falta('Saiu 11.75: sem parênteses, o Python dividiu 8.5 por 2 antes de somar. Escreva (nota + 8.5) / 2.');
          return temLinha(saida, 'Media: 8.0') ? aprovado() : falta('A saída precisa ter a linha Media: 8.0. Confira o f antes das aspas e o {media} entre chaves.');
        },
      },
      {
        id: 'divisoes',
        titulo: 'As três divisões',
        ensina: 'A barra / sempre dá float: 7 / 2 é 3.5, e até 8 / 2 dá 4.0. As duas barras // fazem a divisão inteira e jogam fora a parte decimal: 7 // 2 dá 3. O % dá o resto: 7 % 2 dá 1. É com o resto que se descobre se um número é par, quando numero % 2 dá 0.',
        exemplo: 'print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)',
        pedido: 'Mostre, uma por linha, 7 dividido por 2, a divisão inteira de 7 por 2 e o resto.',
        conferir: ({ saida, codigo }) => {
          const limpo = semComentarios(codigo);
          if (!/\/\//.test(limpo) || !/%/.test(limpo)) return falta('Use as operações de verdade: // para a divisão inteira e % para o resto.');
          return temSequencia(saida, ['3.5', '3', '1']) ? aprovado() : falta('A saída precisa mostrar 3.5, 3 e 1, nessa ordem e uma por linha.');
        },
      },
    ],
  },

  r1: {
    titulo: 'Agora faça o programa decidir, um degrau por vez',
    introducao: 'Uma condição só está certa se funcionar para qualquer valor, não só para o que está no código. Por isso, depois de cada execução, a conferência roda o seu programa de novo, escondido, com outras idades, e confere se a resposta muda como deveria.',
    inicial: 'idade = 15\ntem_ingresso = True\n\n',
    sonda: (codigo, degrau) => sondaDeVariacoes(codigo, degrau.variacoes),
    conclusao: 'Você escreveu decisões com if, elif e else, combinou condições com and e or e inverteu uma com not, e cada uma foi testada com vários valores, não só com o que estava no código.',
    degraus: [
      {
        id: 'if-else',
        titulo: 'Um caminho ou outro',
        ensina: 'if testa uma condição; se ela for verdadeira, roda o bloco de baixo. else pega todos os outros casos. Os dois-pontos abrem o bloco, e os quatro espaços dizem quais linhas pertencem a ele. >= quer dizer maior ou igual.',
        exemplo: 'if idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")',
        pedido: 'Mostre Maior de idade quando a idade for 18 ou mais, e Menor de idade nos outros casos.',
        variacoes: [
          { trocas: [], quando: 'idade 15', espera: ['Menor de idade'], naoEspera: ['Maior de idade'] },
          { trocas: [['idade = 15', 'idade = 18']], quando: 'idade 18', espera: ['Maior de idade'], naoEspera: ['Menor de idade'], dica: 'Com 18 já é maior de idade: use >=, não >.' },
          { trocas: [['idade = 15', 'idade = 40']], quando: 'idade 40', espera: ['Maior de idade'], naoEspera: ['Menor de idade'] },
        ],
        conferir: ({ sonda, codigo }) => (/\bif\b[\s\S]*\belse\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r1.degraus[0].variacoes, 'idade = 15')
          : falta('Escreva a decisão com if e else: o programa tem de escolher o texto pela idade, e não mostrar um texto fixo.')),
      },
      {
        id: 'elif',
        titulo: 'Mais de dois caminhos',
        ensina: 'elif quer dizer "senão, se": ele só é testado quando o teste de cima foi falso. O Python roda só o primeiro bloco verdadeiro e pula o resto, por isso a ordem importa. Se idade < 18 viesse antes de idade < 12, uma criança de 8 anos cairia em Adolescente.',
        exemplo: 'if idade < 12:\n    print("Criança")\nelif idade < 18:\n    print("Adolescente")\nelse:\n    print("Adulto")',
        pedido: 'Mostre Criança abaixo de 12 anos, Adolescente de 12 até 17 e Adulto de 18 em diante.',
        variacoes: [
          { trocas: [], quando: 'idade 15', espera: ['Adolescente'], naoEspera: ['Criança', 'Adulto'] },
          { trocas: [['idade = 15', 'idade = 8']], quando: 'idade 8', espera: ['Criança'], naoEspera: ['Adolescente', 'Adulto'], dica: 'Confira a ordem: o teste de idade < 12 vem primeiro.' },
          { trocas: [['idade = 15', 'idade = 12']], quando: 'idade 12', espera: ['Adolescente'], naoEspera: ['Criança'], dica: 'Com 12 já não é criança: use idade < 12.' },
          { trocas: [['idade = 15', 'idade = 18']], quando: 'idade 18', espera: ['Adulto'], naoEspera: ['Adolescente'] },
        ],
        conferir: ({ sonda, codigo }) => (/\belif\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r1.degraus[1].variacoes, 'idade = 15')
          : falta('Use elif para o caminho do meio.')),
      },
      {
        id: 'and',
        titulo: 'Duas condições ao mesmo tempo: and',
        ensina: 'and exige que as duas condições sejam verdadeiras. Aqui, para entrar, a pessoa precisa ter 12 anos ou mais e ter ingresso: faltando qualquer uma, não entra. tem_ingresso já é True ou False, então pode ser usado direto, sem == True.',
        exemplo: 'if idade >= 12 and tem_ingresso:\n    print("Pode entrar")\nelse:\n    print("Não pode entrar")',
        pedido: 'Mostre Pode entrar só quando a idade for 12 ou mais e houver ingresso; senão, Não pode entrar.',
        variacoes: [
          { trocas: [], quando: 'idade 15 com ingresso', espera: ['Pode entrar'], naoEspera: ['Não pode entrar'] },
          { trocas: [['tem_ingresso = True', 'tem_ingresso = False']], quando: 'idade 15 sem ingresso', espera: ['Não pode entrar'], naoEspera: ['Pode entrar'], dica: 'Sem ingresso não entra: as duas condições precisam valer, com and.' },
          { trocas: [['idade = 15', 'idade = 10']], quando: 'idade 10 com ingresso', espera: ['Não pode entrar'], naoEspera: ['Pode entrar'] },
        ],
        conferir: ({ sonda, codigo }) => (/\band\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r1.degraus[2].variacoes, 'idade = 15 e tem_ingresso = True')
          : falta('Junte as duas condições com and.')),
      },
      {
        id: 'or',
        titulo: 'Basta uma: or',
        ensina: 'or aceita quando pelo menos uma condição é verdadeira. Meia-entrada vale para quem tem menos de 18 ou 60 anos ou mais. Não confunda: == compara dois valores, enquanto = guarda um valor numa variável.',
        exemplo: 'if idade < 18 or idade >= 60:\n    print("Meia-entrada")\nelse:\n    print("Inteira")',
        pedido: 'Mostre Meia-entrada para menores de 18 ou pessoas de 60 anos ou mais; senão, Inteira.',
        variacoes: [
          { trocas: [], quando: 'idade 15', espera: ['Meia-entrada'], naoEspera: ['Inteira'] },
          { trocas: [['idade = 15', 'idade = 30']], quando: 'idade 30', espera: ['Inteira'], naoEspera: ['Meia-entrada'] },
          { trocas: [['idade = 15', 'idade = 60']], quando: 'idade 60', espera: ['Meia-entrada'], naoEspera: ['Inteira'], dica: 'Com 60 já tem meia-entrada: use >= 60.' },
        ],
        conferir: ({ sonda, codigo }) => (/\bor\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r1.degraus[3].variacoes, 'idade = 15')
          : falta('Junte as duas condições com or.')),
      },
      {
        id: 'not',
        titulo: 'O contrário: not',
        ensina: 'not inverte uma condição: not tem_ingresso é verdadeiro quando tem_ingresso é False. Serve para ler o caso negativo primeiro, do jeito que se fala: "se não tem ingresso".',
        exemplo: 'if not tem_ingresso:\n    print("Compre o ingresso")\nelse:\n    print("Boa sessão")',
        pedido: 'Mostre Compre o ingresso quando não houver ingresso; senão, Boa sessão.',
        variacoes: [
          { trocas: [], quando: 'com ingresso', espera: ['Boa sessão'], naoEspera: ['Compre o ingresso'] },
          { trocas: [['tem_ingresso = True', 'tem_ingresso = False']], quando: 'sem ingresso', espera: ['Compre o ingresso'], naoEspera: ['Boa sessão'] },
        ],
        conferir: ({ sonda, codigo }) => (/\bnot\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r1.degraus[4].variacoes, 'tem_ingresso = True')
          : falta('Use not tem_ingresso no if.')),
      },
    ],
  },

  r2: {
    titulo: 'Agora faça o programa repetir, um degrau por vez',
    introducao: 'Uma repetição só está certa se funcionar para qualquer lista, não só para a que está no código. Por isso a conferência roda o seu programa de novo, escondido, com outras listas e outros números, e confere o resultado.',
    inicial: 'notas = [7, 8, 9]\n\n',
    sonda: (codigo, degrau) => sondaDeVariacoes(codigo, degrau.variacoes),
    conclusao: 'Você usou as quatro ferramentas de repetição da aula: for com acumulador, range, while e os atalhos break e continue. Cada uma foi testada com outros valores, e não só com os do código.',
    degraus: [
      {
        id: 'for-soma',
        titulo: 'Percorrer e somar',
        ensina: 'for nota in notas pega um item da lista por vez e guarda em nota. Para somar, crie um acumulador antes do laço, total = 0, e some cada nota dentro dele com total += nota, que é o mesmo que total = total + nota. Cuidado: =+ é outra coisa e troca o total em vez de somar.',
        exemplo: 'total = 0\nfor nota in notas:\n    total += nota\nprint(total)',
        pedido: 'Some as notas com for e mostre só o total.',
        variacoes: [
          { trocas: [], quando: 'as notas 7, 8 e 9', espera: ['24'] },
          { trocas: [['notas = [7, 8, 9]', 'notas = [1, 2, 3, 4]']], quando: 'as notas 1, 2, 3 e 4', espera: ['10'], dica: 'O total tem de vir da lista: confira o total += nota dentro do for.' },
          { trocas: [['notas = [7, 8, 9]', 'notas = []']], quando: 'uma lista vazia', espera: ['0'], dica: 'Comece o total em 0, antes do for.' },
        ],
        conferir: ({ sonda, codigo }) => (/\bfor\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r2.degraus[0].variacoes, 'notas = [7, 8, 9]')
          : falta('Some com um laço for.')),
      },
      {
        id: 'range',
        titulo: 'Contar com range',
        ensina: 'range gera uma sequência de números. range(1, 6) vai de 1 até 5: o número do fim fica de fora. range(5), só com um número, começa do 0 e vai até 4. Com for, cada volta recebe um número da sequência.',
        exemplo: 'for i in range(1, 6):\n    print(i)',
        pedido: 'Mostre os números de 1 a 5, um por linha, usando range.',
        variacoes: [],
        conferir: ({ saida, codigo }) => {
          if (!/\brange\s*\(/.test(semComentarios(codigo))) return falta('Use range para gerar os números.');
          if (temSequencia(saida, ['1', '2', '3', '4', '5', '6'])) return falta('Apareceu o 6: em range(1, 7) o fim fica de fora, mas aqui o pedido termina no 5. Use range(1, 6).');
          return temSequencia(saida, ['1', '2', '3', '4', '5']) ? aprovado() : falta('A saída precisa ter 1, 2, 3, 4 e 5, um por linha. Lembre que o fim do range fica de fora: range(1, 6).');
        },
      },
      {
        id: 'while',
        titulo: 'Repetir enquanto for verdade',
        ensina: 'while repete o bloco enquanto a condição for verdadeira. Dentro dele, alguma coisa precisa mudar a condição, senão o laço nunca termina: aqui, contador -= 1 diminui 1 a cada volta. Se esquecer, o PyCampus para o programa depois de 15 segundos.',
        exemplo: 'contador = 3\nwhile contador > 0:\n    print(contador)\n    contador -= 1\nprint("Fim!")',
        pedido: 'Faça uma contagem regressiva de 3 até 1 com while e mostre Fim! no final.',
        variacoes: [
          { trocas: [], quando: 'contador 3', sequencia: ['3', '2', '1', 'Fim!'] },
          { trocas: [['contador = 3', 'contador = 5']], quando: 'contador 5', sequencia: ['5', '4', '3', '2', '1', 'Fim!'], dica: 'A contagem tem de começar do valor do contador, não de um número fixo.' },
        ],
        conferir: ({ sonda, saida, codigo }) => {
          if (!/\bwhile\b/.test(semComentarios(codigo))) return falta('Use while para a contagem.');
          if (!temSequencia(saida, ['3', '2', '1', 'Fim!'])) return falta('A saída precisa mostrar 3, 2, 1 e depois Fim!, um por linha.');
          return conferirVariacoes(sonda, degrausDaFaculdade.r2.degraus[2].variacoes, 'contador = 3');
        },
      },
      {
        id: 'break',
        titulo: 'Parar no meio: break',
        ensina: 'break encerra o laço na hora, mesmo que ainda haja itens. Serve para procurar: assim que acha o que queria, o programa para de olhar o resto da lista.',
        exemplo: 'valores = [8, 6, 3, 9, 2]\nfor v in valores:\n    if v < 5:\n        print("Achei", v)\n        break',
        pedido: 'Procure o primeiro valor menor que 5 em valores e pare o laço assim que achar.',
        variacoes: [
          { trocas: [], quando: 'os valores 8, 6, 3, 9, 2', espera: ['Achei 3'], naoEspera: ['Achei 2'], dica: 'Só o primeiro deve aparecer: falta o break logo depois do print.' },
          { trocas: [['valores = [8, 6, 3, 9, 2]', 'valores = [4, 1]']], quando: 'os valores 4 e 1', espera: ['Achei 4'], naoEspera: ['Achei 1'], dica: 'Só o primeiro deve aparecer: falta o break logo depois do print.' },
        ],
        conferir: ({ sonda, codigo }) => (/\bbreak\b/.test(semComentarios(codigo))
          ? conferirVariacoes(sonda, degrausDaFaculdade.r2.degraus[3].variacoes, 'valores = [8, 6, 3, 9, 2]')
          : falta('Use break para parar o laço quando achar.')),
      },
      {
        id: 'continue',
        titulo: 'Pular um item: continue',
        ensina: 'continue pula o resto da volta atual e vai direto para o próximo item, sem parar o laço. É o contrário do break: o break sai do laço, o continue só pula aquele item.',
        exemplo: 'for v in valores:\n    if v < 5:\n        continue\n    print(v)',
        pedido: 'Mostre só os valores de 5 para cima, pulando os outros com continue.',
        variacoes: [
          { trocas: [['valores = [8, 6, 3, 9, 2]', 'valores = [70, 4, 50]']], quando: 'os valores 70, 4 e 50', espera: ['70', '50'], dica: 'Os valores mostrados têm de vir da lista, pulando só os menores que 5.' },
        ],
        conferir: ({ sonda, saida, codigo }) => {
          if (!/\bcontinue\b/.test(semComentarios(codigo))) return falta('Use continue para pular os valores menores que 5.');
          if (!temSequencia(saida, ['8', '6', '9'])) return falta('A saída precisa mostrar 8, 6 e 9, um por linha, nessa ordem.');
          return conferirVariacoes(sonda, degrausDaFaculdade.r2.degraus[4].variacoes, 'valores = [8, 6, 3, 9, 2]');
        },
      },
    ],
  },

  r3: {
    titulo: 'Agora crie suas funções, um degrau por vez',
    introducao: 'Uma função só está certa se funcionar com qualquer entrada. Por isso, depois de cada execução, a conferência chama a sua função com valores novos e confere o que ela devolve.',
    inicial: '',
    sonda: (codigo, degrau) => sondaDeChamadas(degrau.chamadas.map(([expr]) => expr)),
    conclusao: 'Você criou funções com um e dois parâmetros, usou sum e len, deu um valor padrão a um parâmetro e escreveu uma lambda. Todas foram chamadas com entradas novas, e todas devolveram o valor com return.',
    degraus: [
      {
        id: 'def-return',
        titulo: 'Criar e devolver',
        ensina: 'def cria uma função: o nome, os parâmetros entre parênteses e os dois-pontos. return devolve o resultado para quem chamou. Se a função só fizer print, ela mostra o texto mas devolve None, e quem chamou fica sem o valor.',
        exemplo: 'def saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("Ana"))',
        pedido: 'Crie a função saudacao, que recebe um nome e devolve Olá, nome!, e mostre a saudação da Ana.',
        chamadas: [['saudacao("Bia")', 'Olá, Bia!'], ['saudacao("Carlos")', 'Olá, Carlos!']],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r3.degraus[0].chamadas, 'saudacao'),
      },
      {
        id: 'dois-parametros',
        titulo: 'Dois parâmetros',
        ensina: 'Uma função pode receber vários valores, separados por vírgula. Na chamada, eles entram na mesma ordem: em soma(2, 3), o 2 vai para a e o 3 vai para b.',
        exemplo: 'def soma(a, b):\n    return a + b',
        pedido: 'Crie a função soma, que recebe dois números e devolve a soma deles.',
        chamadas: [['soma(2, 3)', 5], ['soma(-1, 1)', 0], ['soma(10, 0.5)', 10.5]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r3.degraus[1].chamadas, 'soma'),
      },
      {
        id: 'media',
        titulo: 'Usar funções prontas dentro da sua',
        ensina: 'sum(lista) soma todos os itens e len(lista) conta quantos são. Dividindo um pelo outro, você tem a média de qualquer lista, de qualquer tamanho.',
        exemplo: 'def calcular_media(notas):\n    return sum(notas) / len(notas)',
        pedido: 'Crie a função calcular_media, que recebe uma lista de notas e devolve a média.',
        chamadas: [['calcular_media([7, 8, 9])', 8], ['calcular_media([10, 5])', 7.5], ['calcular_media([6])', 6]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r3.degraus[2].chamadas, 'calcular_media'),
      },
      {
        id: 'padrao',
        titulo: 'Um parâmetro com valor padrão',
        ensina: 'Um parâmetro pode ter valor padrão: taxa=10 faz a taxa valer 10 quando quem chama não informa. aumento(1000) usa 10%; aumento(1000, 50) usa 50%.',
        exemplo: 'def aumento(salario, taxa=10):\n    return salario + salario * taxa / 100',
        pedido: 'Crie a função aumento, com taxa padrão de 10, que devolve o salário com o aumento em porcentagem.',
        chamadas: [['aumento(1000)', 1100], ['aumento(1000, 50)', 1500], ['aumento(200, 0)', 200]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r3.degraus[3].chamadas, 'aumento'),
      },
      {
        id: 'lambda',
        titulo: 'Uma função numa linha: lambda',
        ensina: 'lambda cria uma função pequena numa linha, sem def e sem return: o que vem depois dos dois-pontos já é o que ela devolve. Guardada numa variável, ela é chamada como qualquer função.',
        exemplo: 'quadrado = lambda x: x * x\nprint(quadrado(5))',
        pedido: 'Crie quadrado com lambda, devolvendo o número multiplicado por ele mesmo.',
        chamadas: [['quadrado(5)', 25], ['quadrado(-3)', 9], ['quadrado(0)', 0]],
        conferir: ({ sonda, codigo }) => (/\blambda\b/.test(semComentarios(codigo))
          ? conferirChamadas(sonda, degrausDaFaculdade.r3.degraus[4].chamadas, 'quadrado')
          : falta('Crie quadrado com lambda: quadrado = lambda x: x * x.')),
      },
    ],
  },
  r4: {
    titulo: 'Agora organize as camadas da web, um degrau por vez',
    introducao: 'O exemplo do professor guarda as ferramentas de cada camada da web num dicionário de listas. Aqui você monta, consulta e amplia esse dicionário. A conferência consulta o que ficou guardado no programa.',
    inicial: '',
    sonda: (codigo, degrau) => sondaDeChamadas(degrau.chamadas.map(([expr]) => expr)),
    conclusao: 'Você montou um dicionário de listas, consultou um item com dois colchetes, acrescentou uma ferramenta e percorreu as camadas. E agora sabe o que cada camada faz: o front-end é o que a pessoa vê; o back-end processa e guarda os dados no servidor.',
    degraus: [
      {
        id: 'dicionario-de-listas',
        titulo: 'Um dicionário de listas',
        ensina: 'O front-end é a parte que a pessoa vê e usa: HTML monta a página, CSS cuida do visual e JavaScript dá as ações. O back-end roda no servidor, com as regras e os dados: é onde o Python entra, com Flask ou Django. Num dicionário, o valor de cada chave pode ser uma lista inteira.',
        exemplo: 'camadas = {\n    "front-end": ["HTML", "CSS", "JavaScript"],\n    "back-end": ["Python", "Flask", "Django"],\n}',
        pedido: 'Monte o dicionário camadas com as ferramentas de front-end e de back-end do exemplo.',
        chamadas: [['camadas', { 'front-end': ['HTML', 'CSS', 'JavaScript'], 'back-end': ['Python', 'Flask', 'Django'] }]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r4.degraus[0].chamadas, 'camadas'),
      },
      {
        id: 'dois-colchetes',
        titulo: 'Consultar com dois colchetes',
        ensina: 'camadas["back-end"] devolve a lista inteira do back-end. Um segundo colchete escolhe um item dessa lista pela posição, que começa em 0: camadas["back-end"][1] é Flask.',
        exemplo: 'print(camadas["back-end"][1])',
        pedido: 'Guarde em ferramenta o primeiro item do front-end, consultando o dicionário, e mostre.',
        chamadas: [['ferramenta', 'HTML']],
        conferir: ({ sonda, codigo }) => (/camadas\s*\[\s*["']front-end["']\s*\]\s*\[\s*0\s*\]/.test(semComentarios(codigo))
          ? conferirChamadas(sonda, degrausDaFaculdade.r4.degraus[1].chamadas, 'ferramenta')
          : falta('Pegue o item pelo dicionário: ferramenta = camadas["front-end"][0].')),
      },
      {
        id: 'append',
        titulo: 'Acrescentar numa lista do dicionário',
        ensina: 'append coloca um item no fim de uma lista. Como camadas["back-end"] é uma lista, dá para acrescentar direto nela: a lista dentro do dicionário muda.',
        exemplo: 'camadas["back-end"].append("FastAPI")',
        pedido: 'Acrescente FastAPI às ferramentas de back-end.',
        chamadas: [['camadas["back-end"]', ['Python', 'Flask', 'Django', 'FastAPI']]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.r4.degraus[2].chamadas, 'camadas'),
      },
      {
        id: 'percorrer-camadas',
        titulo: 'Percorrer as camadas',
        ensina: 'items() entrega cada par (chave, valor). Aqui o valor é uma lista, então len(ferramentas) conta quantas ferramentas cada camada tem.',
        exemplo: 'for camada, ferramentas in camadas.items():\n    print(camada, len(ferramentas))',
        pedido: 'Mostre cada camada ao lado de quantas ferramentas ela tem.',
        chamadas: [],
        conferir: ({ saida }) => (temLinha(saida, 'front-end 3') && temLinha(saida, 'back-end 4') ? aprovado()
          : falta('A saída precisa ter as linhas front-end 3 e back-end 4. Use print(camada, len(ferramentas)) dentro do for.')),
      },
    ],
  },

  u4a2: {
    titulo: 'Agora monte a lógica de um app, um degrau por vez',
    introducao: 'O KivyMD precisa de tela de computador e não roda no navegador, então aqui você monta a lógica que fica por trás do app: os dados da tela, as abas numeradas, o que acontece ao tocar num botão e a classe do app. No computador, é esse mesmo código que o KivyMD usa.',
    inicial: '',
    sonda: (codigo, degrau) => sondaDeChamadas(degrau.chamadas.map(([expr]) => expr)),
    conclusao: 'Você montou a parte do app que não depende da tela: os dados, as abas numeradas com enumerate, a função que responde ao toque e a classe do app com o método build. No KivyMD de verdade, a classe herda de MDApp e o build devolve os componentes da tela.',
    degraus: [
      {
        id: 'dados-da-tela',
        titulo: 'Os dados da tela',
        ensina: 'Um framework é um conjunto de ferramentas prontas para construir um tipo de programa; o KivyMD é um framework de apps para celular e computador. Antes de desenhar qualquer tela, o app precisa saber o que mostrar: aqui, um dicionário guarda o nome do framework e a lista das abas.',
        exemplo: 'interface = {"framework": "KivyMD", "abas": ["Inicio", "Calculadora", "Historico"]}',
        pedido: 'Monte o dicionário interface com o framework KivyMD e as abas Inicio, Calculadora e Historico.',
        chamadas: [['interface', { framework: 'KivyMD', abas: ['Inicio', 'Calculadora', 'Historico'] }]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a2.degraus[0].chamadas, 'interface'),
      },
      {
        id: 'enumerate',
        titulo: 'Abas numeradas com enumerate',
        ensina: 'enumerate entrega cada item junto com a sua posição. Por padrão a contagem começa em 0; start=1 faz começar em 1, que é como se numeram as abas numa tela.',
        exemplo: 'for numero, aba in enumerate(interface["abas"], start=1):\n    print(f"Aba {numero}: {aba}")',
        pedido: 'Mostre cada aba com o seu número, começando em 1, no formato Aba 1: Inicio.',
        chamadas: [],
        conferir: ({ saida, codigo }) => {
          if (!/\benumerate\s*\(/.test(semComentarios(codigo))) return falta('Use enumerate para numerar as abas.');
          if (temLinha(saida, 'Aba 0: Inicio')) return falta('A contagem começou em 0. Use start=1 dentro do enumerate.');
          return temSequencia(saida, ['Aba 1: Inicio', 'Aba 2: Calculadora', 'Aba 3: Historico']) ? aprovado() : falta('A saída precisa ter Aba 1: Inicio, Aba 2: Calculadora e Aba 3: Historico, uma por linha.');
        },
      },
      {
        id: 'ao-tocar',
        titulo: 'O que acontece ao tocar',
        ensina: 'Num app, o botão não faz nada sozinho: ele chama uma função quando é tocado. No KivyMD isso se escreve on_press=... e a função recebe o que foi tocado. Aqui você escreve essa função; quem a chama é o botão.',
        exemplo: 'def ao_tocar(aba):\n    return f"Abrindo {aba}"',
        pedido: 'Crie a função ao_tocar, que recebe o nome da aba e devolve Abrindo e o nome.',
        chamadas: [['ao_tocar("Calculadora")', 'Abrindo Calculadora'], ['ao_tocar("Historico")', 'Abrindo Historico']],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a2.degraus[2].chamadas, 'ao_tocar'),
      },
      {
        id: 'classe-do-app',
        titulo: 'A classe do app',
        ensina: 'Um app KivyMD é uma classe, e o método build é o que o KivyMD chama para montar a tela quando o app abre. No computador, a classe herda de MDApp e o build devolve os componentes; aqui, sem a tela, o build devolve só o nome da aba que abre primeiro.',
        exemplo: 'class CalculadoraApp:\n    def build(self):\n        return interface["abas"][0]',
        pedido: 'Crie a classe CalculadoraApp com o método build, que devolve a primeira aba da interface.',
        chamadas: [['CalculadoraApp().build()', 'Inicio']],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a2.degraus[3].chamadas, 'CalculadoraApp'),
      },
    ],
  },

  u4a3: {
    titulo: 'Agora teste o seu código, um degrau por vez',
    introducao: 'Testar é deixar o computador conferir se o código faz o que promete. Aqui você usa as três formas da aula: assert, doctest e unittest. A conferência roda os seus testes de verdade e confere quantos passaram.',
    inicial: '',
    sonda: (codigo, degrau) => sondaDeChamadas(degrau.chamadas.map(([expr]) => expr)),
    conclusao: 'Você testou com as três ferramentas da aula: assert para uma conferência rápida, doctest para um exemplo que mora na documentação e unittest para uma bateria de testes organizada. No Colab, rode o unittest com unittest.main(argv=[\'\'], exit=False).',
    degraus: [
      {
        id: 'assert',
        titulo: 'A conferência mais simples: assert',
        ensina: 'assert confere uma afirmação. Se ela for verdadeira, nada acontece e o programa segue; se for falsa, o programa para com AssertionError, mostrando a linha. É o jeito mais rápido de ter certeza de um resultado.',
        exemplo: 'def dobro(numero):\n    return numero * 2\n\nassert dobro(4) == 8\nassert dobro(0) == 0\nprint("Tudo certo")',
        pedido: 'Crie a função dobro e confira com assert que dobro(4) dá 8 e dobro(0) dá 0.',
        chamadas: [['dobro(5)', 10], ['dobro(-2)', -4]],
        conferir: ({ sonda, codigo }) => ((semComentarios(codigo).match(/\bassert\b/g) || []).length >= 2
          ? conferirChamadas(sonda, degrausDaFaculdade.u4a3.degraus[0].chamadas, 'dobro')
          : falta('Escreva pelo menos dois assert: um para dobro(4) e outro para dobro(0).')),
      },
      {
        id: 'doctest',
        titulo: 'Um exemplo na documentação: doctest',
        ensina: 'A docstring é o texto entre três aspas logo abaixo do def, que explica a função. O doctest procura nela as linhas que começam com >>>, executa e compara com a linha de baixo. Assim o exemplo da documentação nunca fica desatualizado. Para rodar, use doctest.run_docstring_examples(triplo, globals()): ele não mostra nada quando tudo passa.',
        exemplo: 'def triplo(numero):\n    """Devolve o triplo do número.\n\n    >>> triplo(2)\n    6\n    """\n    return numero * 3\n\nimport doctest\ndoctest.run_docstring_examples(triplo, globals())',
        pedido: 'Crie a função triplo com um exemplo >>> na docstring e rode o doctest.',
        chamadas: [
          ['triplo(7)', 21],
          ['len(__import__("doctest").DocTestFinder().find(triplo, globs=globals())[0].examples)', 1],
          ['__import__("doctest").DocTestRunner(verbose=False).run(__import__("doctest").DocTestFinder().find(triplo, globs=globals())[0]).failed', 0],
        ],
        conferir: ({ sonda }) => {
          const r = conferirChamadas(sonda, degrausDaFaculdade.u4a3.degraus[1].chamadas.slice(0, 1), 'triplo');
          if (!r.ok) return r;
          const exemplos = chamada(sonda, degrausDaFaculdade.u4a3.degraus[1].chamadas[1][0]);
          if (!exemplos?.ok || exemplos.valor < 1) return falta('A docstring de triplo ainda não tem um exemplo com >>>. Escreva >>> triplo(2) e, na linha de baixo, 6.');
          const falhas = chamada(sonda, degrausDaFaculdade.u4a3.degraus[1].chamadas[2][0]);
          return falhas?.ok && falhas.valor === 0 ? aprovado() : falta('O exemplo da docstring não bate com o que a função devolve. Confira o valor escrito embaixo do >>>.');
        },
      },
      {
        id: 'unittest',
        titulo: 'Uma bateria de testes: unittest',
        ensina: 'unittest organiza vários testes numa classe que herda de unittest.TestCase. Cada método que começa com test_ é um teste, e assertEqual(a, b) confere se a é igual a b. Um bom conjunto testa o caso comum, o zero e um negativo, porque é nos limites que os erros aparecem.',
        exemplo: 'import unittest\n\nclass TestDobro(unittest.TestCase):\n    def test_positivo(self):\n        self.assertEqual(dobro(4), 8)\n\n    def test_zero(self):\n        self.assertEqual(dobro(0), 0)\n\n    def test_negativo(self):\n        self.assertEqual(dobro(-2), -4)',
        pedido: 'Crie a classe TestDobro com três testes: o caso comum, o zero e um número negativo.',
        chamadas: [['(lambda r: [r.testsRun, len(r.failures) + len(r.errors)])(__import__("unittest").TextTestRunner(stream=__import__("io").StringIO()).run(__import__("unittest").defaultTestLoader.loadTestsFromTestCase(TestDobro)))', [3, 0]]],
        conferir: ({ sonda }) => {
          const c = chamada(sonda, degrausDaFaculdade.u4a3.degraus[2].chamadas[0][0]);
          if (!c?.ok) return falta(/NameError/.test(c?.erro || '') ? 'Não encontrei a classe TestDobro.' : `Não consegui rodar os testes: ${c?.erro}.`);
          const [rodados, falhas] = c.valor;
          if (rodados !== 3) return falta(`A classe tem ${rodados} ${rodados === 1 ? 'teste' : 'testes'}; o pedido é 3. Cada teste é um método que começa com test_.`);
          return falhas === 0 ? aprovado() : falta(`${falhas} ${falhas === 1 ? 'teste falhou' : 'testes falharam'}. Confira os valores esperados em cada assertEqual.`);
        },
      },
    ],
  },

  u4a4: {
    titulo: 'Agora treine um modelo pequeno, um degrau por vez',
    introducao: 'O TensorFlow não roda no navegador, então aqui você faz o mesmo caminho do machine learning com NumPy: separar os dados, treinar, prever e conferir o modelo com dados que ele não viu. A conferência olha os valores que o seu programa calculou.',
    inicial: 'import numpy as np\n\n',
    sonda: (codigo, degrau) => sondaDeChamadas(degrau.chamadas.map(([expr]) => expr)),
    conclusao: 'Você fez o ciclo inteiro de um modelo supervisionado: dados com resposta conhecida, treino, previsão e teste com um dado guardado de fora. É o mesmo caminho do trabalho da Unidade 4, que usa train_test_split e o TensorFlow no Colab.',
    degraus: [
      {
        id: 'dados',
        titulo: 'Os dados, com as respostas',
        ensina: 'Aprendizado supervisionado é aprender com exemplos que já têm a resposta certa. Aqui, para cada mês (a entrada) já se sabe quanto foi vendido (a resposta). Os dados vão em arrays do NumPy.',
        exemplo: 'meses = np.array([1, 2, 3, 4])\nvendas = np.array([100, 120, 140, 160])',
        pedido: 'Guarde os meses 1 a 4 em meses e as vendas 100, 120, 140 e 160 em vendas.',
        chamadas: [['meses', [1, 2, 3, 4]], ['vendas', [100, 120, 140, 160]]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a4.degraus[0].chamadas, 'meses e vendas'),
      },
      {
        id: 'treinar',
        titulo: 'Treinar: achar o padrão',
        ensina: 'Treinar é achar o padrão que melhor explica os dados. np.polyfit(meses, vendas, 1) procura a reta que passa mais perto dos pontos; o 1 quer dizer reta. Ela devolve dois números: 20, quanto as vendas crescem por mês, e 80, de onde a reta parte.',
        exemplo: 'coeficientes = np.polyfit(meses, vendas, 1)\nprint(coeficientes)',
        pedido: 'Treine a reta com polyfit e guarde o resultado em coeficientes.',
        chamadas: [['[round(float(c), 6) for c in coeficientes]', [20, 80]]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a4.degraus[1].chamadas, 'coeficientes'),
      },
      {
        id: 'prever',
        titulo: 'Prever um caso novo',
        ensina: 'Prever é usar o padrão aprendido num caso que não estava nos dados. np.polyval(coeficientes, 5) calcula o ponto da reta no mês 5: 20 × 5 + 80, que dá 180.',
        exemplo: 'previsao = np.polyval(coeficientes, 5)\nprint("Previsao:", round(float(previsao)))',
        pedido: 'Guarde em previsao a venda prevista para o mês 5 e mostre.',
        chamadas: [['round(float(previsao), 6)', 180]],
        conferir: ({ sonda }) => conferirChamadas(sonda, degrausDaFaculdade.u4a4.degraus[2].chamadas, 'previsao'),
      },
      {
        id: 'treino-teste',
        titulo: 'Testar com um dado que o modelo não viu',
        ensina: 'Um modelo tem de ser conferido com dados que ele não usou no treino; senão, é como corrigir a prova com o gabarito na mão. meses[:3] pega os três primeiros meses: treine só com eles e teste no mês 4, que ficou de fora. abs() tira o sinal do número, para o erro sair sempre positivo: abs(-3) dá 3. É o que o train_test_split faz no trabalho.',
        exemplo: 'coef_treino = np.polyfit(meses[:3], vendas[:3], 1)\nerro = abs(np.polyval(coef_treino, 4) - vendas[3])\nprint("Erro no teste:", round(float(erro), 2))',
        pedido: 'Treine só com os três primeiros meses, preveja o mês 4 e guarde em erro a diferença para a venda real.',
        chamadas: [['round(float(erro), 6)', 0]],
        conferir: ({ sonda, codigo }) => (/\[\s*:\s*3\s*\]/.test(semComentarios(codigo))
          ? conferirChamadas(sonda, degrausDaFaculdade.u4a4.degraus[3].chamadas, 'erro')
          : falta('Treine só com os três primeiros meses: meses[:3] e vendas[:3].')),
      },
    ],
  },
  u2a1: {
    titulo: 'Agora trabalhe com listas, tuplas e textos, um degrau por vez',
    introducao: 'Lista, tupla e texto são sequências: guardam itens em ordem, cada um numa posição. Aqui você cria, consulta, muda e transforma sequências. A conferência olha o que ficou guardado nas variáveis e o que o programa mostrou.',
    inicial: '',
    sonda: SONDA_DAS_VARIAVEIS,
    conclusao: 'Você usou posições positivas e negativas, mudou uma lista, viu por que a tupla não muda, fatiou e contou num texto, numerou com enumerate e transformou uma lista inteira numa linha. São as ferramentas que a prova cobra sobre sequências.',
    degraus: [
      {
        id: 'posicoes',
        titulo: 'Posições: do começo e do fim',
        ensina: 'Uma lista guarda itens em ordem, entre colchetes. Cada item tem uma posição, e a primeira é 0, não 1. Posições negativas contam do fim: compras[-1] é o último item, sem precisar saber o tamanho da lista.',
        exemplo: 'compras = ["arroz", "feijão", "café"]\nprint(compras[0])\nprint(compras[-1])',
        pedido: 'Crie a lista compras com arroz, feijão e café e mostre o primeiro e o último item.',
        conferir: ({ sonda, saida, codigo }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          if (!mesmosValores(variaveis(sonda).compras?.valor, ['arroz', 'feijão', 'café'])) return falta('A lista compras precisa ter arroz, feijão e café, nessa ordem.');
          if (!/\[\s*-1\s*\]/.test(semComentarios(codigo))) return falta('Pegue o último item pela posição negativa: compras[-1].');
          return temSequencia(saida, ['arroz', 'café']) ? aprovado() : falta('A saída precisa mostrar arroz e depois café, um por linha.');
        },
      },
      {
        id: 'mudar-lista',
        titulo: 'A lista pode mudar',
        ensina: 'Lista é mutável: dá para trocar um item pela posição e acrescentar outros depois de criada. compras[1] = "macarrão" troca o segundo item; append coloca um item novo no fim.',
        exemplo: 'compras[1] = "macarrão"\ncompras.append("leite")',
        pedido: 'Troque o feijão por macarrão e acrescente leite no fim da lista.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const lista = variaveis(sonda).compras?.valor;
          return mesmosValores(lista, ['arroz', 'macarrão', 'café', 'leite']) ? aprovado()
            : falta(`A lista ficou ${texto(lista || [])}; o esperado é "arroz", "macarrão", "café", "leite". O feijão está na posição 1.`);
        },
      },
      {
        id: 'tupla',
        titulo: 'A tupla não muda',
        ensina: 'Uma tupla é como uma lista, mas entre parênteses e imutável: depois de criada, não dá para trocar, tirar nem acrescentar itens. dias[0] = "dom" dá TypeError. Use tupla para o que não deve mudar, como os dias da semana.',
        exemplo: 'dias = ("seg", "ter", "qua")\nprint(len(dias))',
        pedido: 'Crie a tupla dias com seg, ter e qua e mostre quantos itens ela tem.',
        conferir: ({ sonda, saida }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const dias = variaveis(sonda).dias;
          if (dias?.tipo === 'list') return falta('dias ficou como lista, porque está entre colchetes. Tupla vai entre parênteses: ("seg", "ter", "qua").');
          if (dias?.tipo !== 'tuple' || !mesmosValores(dias.valor, ['seg', 'ter', 'qua'])) return falta('Crie a tupla dias com "seg", "ter" e "qua".');
          return temLinha(saida, '3') ? aprovado() : falta('Falta mostrar o tamanho: print(len(dias)) mostra 3.');
        },
      },
      {
        id: 'fatiar',
        titulo: 'Fatiar e contar num texto',
        ensina: 'Um texto também é uma sequência, de letras. texto[:5] fatia do começo até antes da posição 5: pega as 5 primeiras letras. count("o") conta quantas vezes o aparece. "Python" in texto responde True ou False.',
        exemplo: 'texto = "Explorando Python"\nprint(texto[:5])\nprint(texto.count("o"))',
        pedido: 'Guarde "Explorando Python" em texto e mostre as 5 primeiras letras e quantas vezes a letra o aparece.',
        conferir: ({ saida, codigo }) => {
          const limpo = semComentarios(codigo);
          if (!/\[\s*0?\s*:\s*5\s*\]/.test(limpo)) return falta('Fatie com texto[:5].');
          if (!/\.count\s*\(/.test(limpo)) return falta('Conte com texto.count("o").');
          return temSequencia(saida, ['Explo', '3']) ? aprovado() : falta('A saída precisa mostrar Explo e depois 3, um por linha.');
        },
      },
      {
        id: 'enumerate',
        titulo: 'Posição e item juntos: enumerate',
        ensina: 'enumerate entrega cada item junto com a sua posição, começando em 0. Com for posicao, dia in enumerate(dias), cada volta recebe os dois, sem precisar de um contador.',
        exemplo: 'for posicao, dia in enumerate(dias):\n    print(posicao, dia)',
        pedido: 'Mostre cada dia da tupla ao lado da sua posição.',
        conferir: ({ saida, codigo }) => (/\benumerate\s*\(/.test(semComentarios(codigo))
          ? (temSequencia(saida, ['0 seg', '1 ter', '2 qua']) ? aprovado() : falta('A saída precisa ter 0 seg, 1 ter e 2 qua, uma por linha.'))
          : falta('Use enumerate(dias) no for.')),
      },
      {
        id: 'compreensao',
        titulo: 'Transformar a lista inteira numa linha',
        ensina: 'Uma list comprehension cria uma lista nova a partir de outra, numa linha: [p * 0.9 for p in precos] quer dizer "p vezes 0.9, para cada p em precos". É o mesmo que um for com append. map faz o mesmo com uma função, e filter guarda só os itens que passam num teste.',
        exemplo: 'precos = [10, 20, 30]\ncom_desconto = [p * 0.9 for p in precos]\nprint(com_desconto)',
        pedido: 'Crie precos com 10, 20 e 30 e guarde em com_desconto cada preço com 10% de desconto.',
        conferir: ({ sonda }) => {
          const erro = semSonda(sonda);
          if (erro) return erro;
          const lista = variaveis(sonda).com_desconto?.valor;
          return mesmosValores(lista, [9, 18, 27]) ? aprovado()
            : falta(lista ? `com_desconto ficou ${texto(lista)}; com 10% de desconto são 9.0, 18.0 e 27.0: multiplique por 0.9.` : 'Não encontrei a lista com_desconto.');
        },
      },
    ],
  },
};
