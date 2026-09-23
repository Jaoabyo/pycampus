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

export const degrausDaFaculdade = {
  u2a4: {
    titulo: 'Agora monte um gráfico de barras, um degrau por vez',
    introducao: 'O exemplo do professor mostra o gráfico pronto. Aqui você constrói o seu, acrescentando uma coisa por degrau. Cada degrau confere o gráfico que você desenhou de verdade: quantas barras, com que altura e com que nomes.',
    inicial: 'import matplotlib.pyplot as plt\n\n',
    conclusao: 'Você montou um gráfico de barras completo, com os seus dados. Um extra: o eixo do lado mostra números de 20 em 20, então uma barra de 150 não tem número marcando a altura. Para escrever o valor em cima de cada barra, guarde o que o plt.bar devolve e passe para plt.bar_label: barras = plt.bar(dias, horas) e depois plt.bar_label(barras).',
    degraus: [
      {
        id: 'uma-barra',
        titulo: 'Uma barra só',
        ensina: 'plt.bar recebe duas listas: primeiro os nomes das barras, depois as alturas. Mesmo com uma barra só, cada uma vai entre colchetes.',
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
        ensina: 'Você já sabe montar o gráfico inteiro. Troque os dados por algo seu: horas de estudo por dia, gastos do mês, gols por rodada. Termine com plt.close(): o gráfico aparece do mesmo jeito, e executar de novo não desenha as barras novas por cima das antigas.',
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
    conclusao: 'Você fez o ciclo inteiro do CRUD num banco de verdade: criou a tabela, inseriu, consultou, alterou e apagou, sempre com ? e commit. É exatamente o que o exemplo do professor faz, agora com cada linha entendida.',
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
};

// Guardado por aula: quantos degraus já foram vencidos e o código em que o estudante parou.
export const normalizarDegraus = (entrada) => {
  const saida = {};
  for (const [aulaId, trilha] of Object.entries(degrausDaFaculdade)) {
    const salvo = entrada?.[aulaId];
    if (!salvo || typeof salvo !== 'object') continue;
    const feitos = Number.isInteger(salvo.feitos) ? Math.max(0, Math.min(trilha.degraus.length, salvo.feitos)) : 0;
    saida[aulaId] = { feitos, codigo: typeof salvo.codigo === 'string' ? salvo.codigo.slice(0, 20000) : trilha.inicial };
  }
  return saida;
};
