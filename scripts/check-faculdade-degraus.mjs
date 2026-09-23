// Executa os degraus da faculdade no Pyodide real e confere a conferência: cada degrau precisa
// aprovar a solução certa e reprovar os erros típicos de quem está começando, pelo motivo certo.
// Os degraus confiam nos dados que o worker devolve sobre o gráfico (alturas, nomes, título,
// eixos), então é aqui, e não num teste de Node, que isso pode ser provado.
//
//   npm run dev -- --port 5176 --strictPort    (em outro terminal)
//   node scripts/check-faculdade-degraus.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { degrausDaFaculdade, separarSonda } from '../src/faculdade-degraus.js';

const BASE = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await (await browser.newContext()).newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

// Várias execuções no MESMO worker, como na plataforma: prova também que os dados de um
// gráfico não vazam para a execução seguinte.
const rodarNoMesmoWorker = async (programas) => page.evaluate(async (lista) => {
  const worker = new Worker('/python-worker.js');
  const executar = (codigo) => new Promise((resolve) => {
    const prazo = setTimeout(() => resolve({ ok: false, output: '(passou de 240s)', graficos: [] }), 240000);
    const aoReceber = (evento) => {
      if (evento.data.type !== 'result') return;
      clearTimeout(prazo);
      worker.removeEventListener('message', aoReceber);
      resolve({ ok: evento.data.ok, output: String(evento.data.output || ''), graficos: evento.data.graficos || [], imagens: (evento.data.imagens || []).length });
    };
    worker.addEventListener('message', aoReceber);
    worker.postMessage({ type: 'run', code: codigo, stdin: '' });
  });
  const saidas = [];
  for (const codigo of lista) saidas.push(await executar(codigo));
  worker.terminate();
  return saidas;
}, programas);

const trilha = degrausDaFaculdade.u2a4;
const I = trilha.inicial;
const d2 = `${I}meses = ["Jan", "Fev", "Mar"]\nvendas = [120, 90, 150]\nplt.bar(meses, vendas)\n`;
const d3 = `${d2}plt.xlabel("Mês")\nplt.ylabel("Vendas")\n`;
const d4 = `${d3}plt.title("Vendas do 1º trimestre")\n`;

// [degrau, código, deve passar?, trecho esperado no motivo da reprovação]
const casos = [
  ['uma-barra', `${I}plt.bar(["Jan"], [120])\n`, true],
  ['uma-barra', `${I}plt.bar(["Jan"], [100])\n`, false, 'alturas saíram 100'],
  ['uma-barra', `${I}plt.bar(["Fev"], [120])\n`, false, 'nomes embaixo das barras saíram Fev'],
  ['uma-barra', `${I}plt.bar(["Jan", "Fev"], [120, 90])\n`, false, 'tem 2 barras'],
  ['uma-barra', `${I}print("sem gráfico")\n`, false, 'Nenhum gráfico apareceu'],
  ['listas', d2, true],
  ['listas', `${I}plt.bar(["Jan", "Fev", "Mar"], [120, 90, 150])\n`, false, 'escritas dentro do plt.bar'],
  ['listas', `${I}meses = ["Jan", "Fev", "Mar"]\nvendas = [120, 150, 90]\nplt.bar(meses, vendas)\n`, false, 'alturas saíram 120, 150, 90'],
  ['eixos', d3, true],
  ['eixos', `${d2}plt.xlabel("Mês")\n`, false, 'eixo do lado ainda está sem nome'],
  ['eixos', `${d2}plt.ylabel("Vendas")\n`, false, 'eixo de baixo ainda está sem nome'],
  ['titulo', d4, true],
  ['titulo', d3, false, 'sem título'],
  ['titulo', `${d4.replace('plt.xlabel("Mês")\n', '')}`, false, 'eixo de baixo'],
  ['seus-dados', `${I}gastos = ["Luz", "Água", "Internet", "Mercado"]\nvalores = [180, 90.5, 120, 640]\nplt.bar(gastos, valores)\nplt.xlabel("Conta")\nplt.ylabel("Reais")\nplt.title("Meus gastos de setembro")\nplt.close()\n`, true],
  ['seus-dados', `${I}${trilha.degraus[4].exemplo}\n`, false, 'dados do exemplo'],
  ['seus-dados', `${d4}plt.close()\n`, false, 'pelo menos 4'],
  ['seus-dados', `${I}gastos = ["Luz", "Água", "Internet", "Mercado"]\nvalores = [180, 90, 120, 640]\nplt.bar(gastos, valores)\nplt.xlabel("Conta")\nplt.ylabel("Reais")\nplt.title("Meus gastos")\n`, false, 'plt.close()'],
];

// O extra da conclusão: bar_label precisa existir no Matplotlib do navegador.
casos.push(['seus-dados', `${I}dias = ["Seg", "Ter", "Qua", "Qui"]
horas = [2, 1, 3, 5]
barras = plt.bar(dias, horas)
plt.bar_label(barras)
plt.xlabel("Dia")
plt.ylabel("Horas")
plt.title("Semana")
plt.close()
`, true]);

// SQL: a conferência lê o banco pela sonda que roda depois do código do estudante.
const sql = degrausDaFaculdade.u3a1;
const S = sql.inicial;
const criar4 = 'cursor.execute("CREATE TABLE Produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL, estoque INTEGER)")\n';
const inserir = 'cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Camiseta", 19.99, 50))\ncursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Caneca", 29.9, 20))\n';
const s3 = `${S}${criar4}${inserir}conexao.commit()
`;
const s4 = `${s3}cursor.execute("SELECT * FROM Produtos")
print(cursor.fetchall())
`;
const s5 = `${s4}cursor.execute("UPDATE Produtos SET preco = ? WHERE id = ?", (24.99, 1))
conexao.commit()
`;
const casosSql = [
  ['criar-tabela', `${S}cursor.execute("CREATE TABLE Produtos (nome TEXT, preco REAL)")
`, true],
  ['criar-tabela', `${S}cursor.execute("CREATE TABLE Produtos (nome TEXT, preco INTEGER)")
`, false, 'tipo INTEGER'],
  ['criar-tabela', `${S}cursor.execute("CREATE TABLE Produto (nome TEXT, preco REAL)")
`, false, 'ainda não existe'],
  ['criar-tabela', `${S}cursor.execute("CREATE TABLE Produtos (nome TEXT, preco REAL)")
conexao.close()
`, false, 'foi fechada'],
  ['id-e-estoque', `${S}${criar4}`, true],
  ['id-e-estoque', `${S}cursor.execute("CREATE TABLE Produtos (id INTEGER, nome TEXT, preco REAL, estoque INTEGER)")
`, false, 'Falta dizer que o id é a chave'],
  ['id-e-estoque', `${S}cursor.execute("CREATE TABLE Produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)")
`, false, 'falta a coluna estoque'],
  ['inserir', s3, true],
  ['inserir', `${S}${criar4}${inserir}`, false, 'ainda não foi gravada'],
  ['inserir', `${S}${criar4}cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES ('Camiseta', 19.99, 50)")
cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES ('Caneca', 29.9, 20)")
conexao.commit()
`, false, 'escritos dentro do SQL'],
  ['inserir', `${S}${criar4}cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Camiseta", 50, 19.99))
cursor.execute("INSERT INTO Produtos (nome, preco, estoque) VALUES (?, ?, ?)", ("Caneca", 29.9, 20))
conexao.commit()
`, false, 'ordem dos valores'],
  ['consultar', s4, true],
  ['consultar', `${s3}cursor.execute("SELECT * FROM Produtos")
`, false, 'precisa mostrar as duas linhas'],
  ['atualizar', s5, true],
  ['atualizar', `${s4}cursor.execute("UPDATE Produtos SET preco = ?", (24.99,))
conexao.commit()
`, false, 'confira o WHERE'],
  ['atualizar', `${s4}cursor.execute("UPDATE Produtos SET preco = ? WHERE id = ?", (24.99, 1))
`, false, 'ainda não foi gravada'],
  ['apagar', `${s5}cursor.execute("DELETE FROM Produtos WHERE id = ?", (2,))
conexao.commit()
`, true],
  ['apagar', `${s5}cursor.execute("DELETE FROM Produtos")
conexao.commit()
`, false, 'confira o WHERE'],
  ['apagar', `${s5}cursor.execute("DELETE FROM Produtos WHERE id = 2")
conexao.commit()
`, false, 'escrito dentro do SQL'],
];

const resultados = await rodarNoMesmoWorker(casos.map(([, codigo]) => codigo));
const resultadosSql = await rodarNoMesmoWorker(casosSql.map(([, codigo]) => `${codigo}
${sql.sonda}`));
const falhas = [];
casosSql.forEach(([id, codigo, devePassar, motivo], i) => {
  const r = resultadosSql[i];
  const { saida, sonda } = separarSonda(r.output);
  if (saida.includes('__PYCAMPUS')) falhas.push(`sql ${id} #${i}: a linha da sonda vazou para a saída`);
  const conferencia = r.ok ? sql.degraus.find((d) => d.id === id).conferir({ graficos: r.graficos, codigo, saida, banco: sonda }) : { ok: false, motivo: `erro ao executar: ${r.output}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`sql ${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · banco ${JSON.stringify(sonda)}`);
});
casos.forEach(([id, codigo, devePassar, motivo], i) => {
  const r = resultados[i];
  const degrau = trilha.degraus.find((d) => d.id === id);
  const conferencia = r.ok ? degrau.conferir({ graficos: r.graficos, codigo }) : { ok: false, motivo: `erro ao executar: ${r.output}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · gráficos ${JSON.stringify(r.graficos)}`);
});

// Trilhas conferidas pela sonda das variáveis e pelos gráficos: pandas e visualização.
// [trilha, degrau, código, deve passar?, trecho esperado no motivo]
const P = degrausDaFaculdade.u3a2.inicial;
const pr1 = `${P}idades = pd.Series([20, 30, 40])\nprint(idades)\n`;
const pr2 = `${P}idades = pd.Series([25, 30, 22], index=["Alice", "Bob", "Carol"])\nprint(idades)\n`;
const pr3 = `${pr2}print(idades.mean())\nprint(idades["Carol"])\n`;
const pr4 = `${pr3}dados = {"Nome": ["Alice", "Bob", "Carol"], "Idade": [25, 30, 22]}\ndf = pd.DataFrame(dados)\nprint(df)\n`;
const pr5 = `${pr4}print(df.shape)\nprint(list(df.columns))\n`;
const V = degrausDaFaculdade.u3a3.inicial;
const v1 = `${V}vendas = vendas.drop_duplicates()\nprint(vendas.shape)\n`;
const v2 = `${v1}vendas["preco"] = vendas["receita"] / vendas["quantidade"]\n`;
const v3 = `${v2}caros = vendas[vendas["preco"] > 10]\nprint(caros)\n`;
const G = degrausDaFaculdade.u3a4.inicial;
const g1 = `${G}x = [1, 2, 3, 4, 5]\ny = [2, 4, 1, 3, 5]\nplt.plot(x, y)\nplt.close()\n`;
const g2 = `${g1}df = pd.DataFrame({"Produto": ["A", "B", "C"], "qtde_vendida": [33, 50, 45]})\ndf.plot(x="Produto", y="qtde_vendida", kind="bar")\nplt.close()\n`;
const contas = 'contas = pd.DataFrame({"time": ["Lunch", "Lunch", "Dinner", "Dinner", "Dinner"],\n                       "total_bill": [10, 20, 30, 40, 50]})\n';
const g3 = `${g2}${contas}soma = contas.groupby("time")["total_bill"].sum()\nprint(soma)\n`;
const g4 = `${g3}media = contas.groupby("time")["total_bill"].mean()\nprint(media)\n`;
const casosVariaveis = [
  ['u3a2', 'serie', pr1, true],
  ['u3a2', 'serie', `${P}idades = pd.Series([20, 30, 40])\n`, false, 'não apareceu na saída'],
  ['u3a2', 'serie', `${P}idades = pd.Series([20, 30])\nprint(idades)\n`, false, 'Não encontrei uma Series'],
  ['u3a2', 'rotulos', pr2, true],
  ['u3a2', 'rotulos', `${P}idades = pd.Series([25, 30, 22], index=["Bob", "Alice", "Carol"])\n`, false, 'Os rótulos ficaram'],
  ['u3a2', 'contas', pr3, true],
  ['u3a2', 'contas', `${pr2}print(idades.mean())\n`, false, 'Carol pelo rótulo'],
  ['u3a2', 'dataframe', pr4, true],
  ['u3a2', 'dataframe', `${pr3}df = pd.DataFrame({"nome": ["Alice", "Bob", "Carol"], "idade": [25, 30, 22]})\n`, false, 'As colunas são as chaves'],
  ['u3a2', 'dataframe', `${pr3}df = pd.DataFrame({"Nome": ["Alice", "Bob", "Carol"], "Idade": [30, 25, 22]})\n`, false, 'as linhas não'],
  ['u3a2', 'forma', pr5, true],
  ['u3a2', 'forma', `${pr4}print(df.shape())\n`, false, 'erro ao executar'],
  ['u3a2', 'coluna', `${pr5}print(df["Idade"].max())\n`, true],
  ['u3a2', 'coluna', `${pr5}print(df["Idade"].min())\n`, false, 'Falta pegar a coluna'],
  ['u3a3', 'duplicadas', v1, true],
  ['u3a3', 'duplicadas', `${V}vendas.drop_duplicates(inplace=True)\n`, true],
  ['u3a3', 'duplicadas', `${V}vendas.drop_duplicates()\n`, false, 'ainda tem 5 linhas'],
  ['u3a3', 'nova-coluna', v2, true],
  ['u3a3', 'nova-coluna', `${v1}vendas["preco"] = vendas["quantidade"] / vendas["receita"]\n`, false, 'Os preços saíram'],
  ['u3a3', 'filtro', v3, true],
  ['u3a3', 'filtro', `${v2}caros = vendas[vendas["preco"] >= 20]\n`, false, 'O filtro ficou com "Caderno", "Mochila"'],
  ['u3a3', 'nomes', `${v3}print(list(caros["nome"]))\n`, true],
  ['u3a3', 'nomes', `${v3}print(caros["nome"])\n`, false, 'ainda não apareceu'],
  ['u3a4', 'linha', g1, true],
  ['u3a4', 'linha', `${G}x = [1, 2, 3, 4, 5]\ny = [2, 4, 1, 3, 5]\nplt.plot(y, x)\nplt.close()\n`, false, 'A linha saiu com y = 1, 2, 3, 4, 5'],
  ['u3a4', 'linha', `${G}x = [1, 2, 3, 4, 5]\ny = [2, 4, 1, 3, 5]\nplt.plot(x, y)\n`, false, 'Falta o plt.close()'],
  ['u3a4', 'pandas-plot', g2, true],
  ['u3a4', 'pandas-plot', `${g1}df = pd.DataFrame({"Produto": ["A", "B", "C"], "qtde_vendida": [33, 50, 45]})\ndf.plot(y="qtde_vendida", kind="bar")\nplt.close()\n`, false, 'não são A, B e C'],
  ['u3a4', 'groupby', g3, true],
  ['u3a4', 'groupby', `${g2}${contas}soma = contas.groupby("time")["total_bill"].mean()\n`, false, 'O agrupamento deu 40, 15'],
  ['u3a4', 'media', g4, true],
  ['u3a4', 'media', `${g2}${contas}media = contas.groupby("time")["total_bill"].mean()\n`, false, 'a soma sumiu'],
  ['u3a4', 'grafico-do-grupo', `${g4}soma.plot(kind="bar", title="Total por período")\nplt.close()\n`, true],
  ['u3a4', 'grafico-do-grupo', `${g4}soma.plot(kind="bar")\nplt.close()\n`, false, 'sem título'],
];
const resultadosVariaveis = await rodarNoMesmoWorker(casosVariaveis.map(([t, , codigo]) => `${codigo}\n${degrausDaFaculdade[t].sonda}`));
casosVariaveis.forEach(([t, id, codigo, devePassar, motivo], i) => {
  const r = resultadosVariaveis[i];
  const { saida, sonda } = separarSonda(r.output);
  if (saida.includes('__PYCAMPUS')) falhas.push(`${t} ${id} #${i}: a linha da sonda vazou para a saída`);
  const conferencia = r.ok ? degrausDaFaculdade[t].degraus.find((d) => d.id === id).conferir({ graficos: r.graficos, codigo, saida, banco: sonda, sonda }) : { ok: false, motivo: `erro ao executar: ${r.output.slice(-200)}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`${t} ${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · sonda ${JSON.stringify(sonda)?.slice(0, 600)} · gráficos ${JSON.stringify(r.graficos)?.slice(0, 400)}`);
});

// Unidade 2: estruturas de dados e classes, conferidas pela sonda das variáveis.
const A = degrausDaFaculdade.u2a2.inicial;
const a1 = `${A}diferentes = set(notas)\nprint(len(diferentes))\n`;
const a2 = `${a1}diferentes.add(9)\ndiferentes.remove(7)\n`;
const a3 = `${a2}aluno = {"nome": "Ana", "idade": 20}\nprint(aluno["nome"])\n`;
const a4 = `${a3}aluno["idade"] = 21\naluno["curso"] = "ADS"\n`;
const a5 = `${a4}for chave, valor in aluno.items():\n    print(chave, valor)\n`;
const cls = {
  base: 'class Veiculo:\n    def __init__(self, marca, modelo):\n        self.marca = marca\n        self.modelo = modelo\n',
  vel: '        self.velocidade = 0\n',
  acel: '\n    def acelerar(self, incremento):\n        self.velocidade += incremento\n',
  stat: '\n    def status(self):\n        return f"{self.marca} {self.modelo} a {self.velocidade} km/h"\n',
  carro: '\nclass Carro(Veiculo):\n    def __init__(self, marca, modelo, potencia):\n        super().__init__(marca, modelo)\n        self.potencia = potencia\n',
  sobre: '\n    def acelerar(self, incremento):\n        self.velocidade += incremento + self.potencia\n',
};
const c1 = `${cls.base}\ncarro1 = Veiculo("Toyota", "Corolla")\n`;
const c2 = `${cls.base}${cls.vel}\ncarro1 = Veiculo("Toyota", "Corolla")\n`;
const c3 = `${cls.base}${cls.vel}${cls.acel}\ncarro1 = Veiculo("Toyota", "Corolla")\ncarro1.acelerar(50)\n`;
const c4 = `${cls.base}${cls.vel}${cls.acel}${cls.stat}\ncarro1 = Veiculo("Toyota", "Corolla")\ncarro1.acelerar(50)\nprint(carro1.status())\n`;
const c5 = `${cls.base}${cls.vel}${cls.acel}${cls.stat}${cls.carro}\ncarro1 = Veiculo("Toyota", "Corolla")\ncarro1.acelerar(50)\nprint(carro1.status())\nmeu_carro = Carro("Honda", "Civic", 150)\n`;
const c6 = `${cls.base}${cls.vel}${cls.acel}${cls.stat}${cls.carro}${cls.sobre}\ncarro1 = Veiculo("Toyota", "Corolla")\ncarro1.acelerar(50)\nprint(carro1.status())\nmeu_carro = Carro("Honda", "Civic", 150)\nmeu_carro.acelerar(50)\nprint(meu_carro.status())\n`;
const casosU2 = [
  ['u2a2', 'conjunto', a1, true],
  ['u2a2', 'conjunto', `${A}print(len(notas))\n`, false, 'Não encontrei um conjunto'],
  ['u2a2', 'conjunto', `${A}diferentes = set(notas)\n`, false, 'falta mostrar quantos'],
  ['u2a2', 'add-remove', a2, true],
  ['u2a2', 'add-remove', `${a1}diferentes.add(9)\n`, false, 'ficou com 7, 8, 9, 10'],
  ['u2a2', 'dicionario', a3, true],
  ['u2a2', 'dicionario', `${a2}aluno = {"nome": "Ana", "idade": "20"}\nprint(aluno["nome"])\n`, false, 'Não encontrei um dicionário'],
  ['u2a2', 'mudar-dicionario', a4, true],
  ['u2a2', 'mudar-dicionario', `${a3}aluno["curso"] = "ADS"\n`, false, 'A idade ficou 20'],
  ['u2a2', 'percorrer', a5, true],
  ['u2a2', 'percorrer', `${a4}for chave in aluno:\n    print(chave)\n`, false, 'nome Ana, idade 21 e curso ADS'],
  ['u2a2', 'numpy', `${a5}import numpy as np\nvalores = np.array([1, 2, 3, 4])\ndobro = valores * 2\nprint(dobro)\n`, true],
  ['u2a2', 'numpy', `${a5}dobro = [v * 2 for v in [1, 2, 3, 4]]\n`, false, 'Ainda não há um array'],
  ['u2a2', 'numpy', `${a5}import numpy as np\nvalores = np.array([1, 2, 3, 4])\ndobro = valores + 2\n`, false, 'Não encontrei o array com 2, 4, 6 e 8'],
  ['u2a3', 'classe', c1, true],
  ['u2a3', 'classe', `class Veiculo:\n    def __init__(self, marca, modelo):\n        self.marca = modelo\n        self.modelo = marca\n\ncarro1 = Veiculo("Toyota", "Corolla")\n`, false, 'O objeto guardou marca Corolla'],
  ['u2a3', 'classe', cls.base, false, 'nenhum objeto foi criado'],
  ['u2a3', 'atributo-inicial', c2, true],
  ['u2a3', 'atributo-inicial', `${c1}velocidade = 0\n`, false, 'não tem velocidade 0'],
  ['u2a3', 'metodo-que-muda', c3, true],
  ['u2a3', 'metodo-que-muda', `${cls.base}${cls.vel}${cls.acel}\ncarro1 = Veiculo("Toyota", "Corolla")\n`, false, 'ficou com velocidade 0'],
  ['u2a3', 'metodo-que-devolve', c4, true],
  ['u2a3', 'metodo-que-devolve', `${cls.base}${cls.vel}${cls.acel}\n    def status(self):\n        print(f"{self.marca} {self.modelo} a {self.velocidade} km/h")\n\ncarro1 = Veiculo("Toyota", "Corolla")\ncarro1.acelerar(50)\nprint(carro1.status())\n`, false, 'Apareceu um None'],
  ['u2a3', 'heranca', c5, true],
  ['u2a3', 'heranca', `${cls.base}${cls.vel}${cls.acel}${cls.stat}\nclass Carro(Veiculo):\n    def __init__(self, marca, modelo, potencia):\n        self.potencia = potencia\n\ncarro1 = Veiculo("Toyota", "Corolla")\nmeu_carro = Carro("Honda", "Civic", 150)\n`, false, 'super().__init__'],
  ['u2a3', 'heranca', `${cls.base}${cls.vel}${cls.acel}${cls.stat}\nclass Carro:\n    def __init__(self, marca, modelo, potencia):\n        self.marca = marca\n        self.modelo = modelo\n        self.velocidade = 0\n        self.potencia = potencia\n\ncarro1 = Veiculo("Toyota", "Corolla")\nmeu_carro = Carro("Honda", "Civic", 150)\n`, false, 'não é filha de Veiculo'],
  ['u2a3', 'sobrescrita', c6, true],
  ['u2a3', 'sobrescrita', `${c5}meu_carro.acelerar(50)\nprint(meu_carro.status())\n`, false, 'são 200'],
];
const resultadosU2 = await rodarNoMesmoWorker(casosU2.map(([t, , codigo]) => `${codigo}\n${degrausDaFaculdade[t].sonda}`));
casosU2.forEach(([t, id, codigo, devePassar, motivo], i) => {
  const r = resultadosU2[i];
  const { saida, sonda } = separarSonda(r.output);
  if (saida.includes('__PYCAMPUS')) falhas.push(`${t} ${id} #${i}: a linha da sonda vazou para a saída`);
  const conferencia = r.ok ? degrausDaFaculdade[t].degraus.find((d) => d.id === id).conferir({ graficos: r.graficos, codigo, saida, banco: sonda, sonda }) : { ok: false, motivo: `erro ao executar: ${r.output.slice(-200)}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`${t} ${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · sonda ${JSON.stringify(sonda)?.slice(0, 700)}`);
});

// Unidades 1 e 4 e sequências: conferidas por variações do código e por chamadas às funções.
// [trilha, degrau, código, deve passar?, trecho esperado no motivo]
const sondaDe = (t, id, codigo) => {
  const trilhaAlvo = degrausDaFaculdade[t];
  const degrau = trilhaAlvo.degraus.find((d) => d.id === id);
  return typeof trilhaAlvo.sonda === 'function' ? trilhaAlvo.sonda(codigo, degrau) : trilhaAlvo.sonda;
};
const uv1 = 'nome = "Ana"\nidade = 20\n';
const uv2 = `${uv1}altura = 1.65\nprint(type(idade))\nprint(type(altura))\n`;
const uv3 = `${uv2}nota_texto = "7.5"\nnota = float(nota_texto)\n`;
const uv4 = `${uv3}media = (nota + 8.5) / 2\nprint(f"Media: {media}")\n`;
const R = degrausDaFaculdade.r1.inicial;
const k1 = `${R}if idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")\n`;
const k2 = `${k1}if idade < 12:\n    print("Criança")\nelif idade < 18:\n    print("Adolescente")\nelse:\n    print("Adulto")\n`;
const k3 = `${k2}if idade >= 12 and tem_ingresso:\n    print("Pode entrar")\nelse:\n    print("Não pode entrar")\n`;
const k4 = `${k3}if idade < 18 or idade >= 60:\n    print("Meia-entrada")\nelse:\n    print("Inteira")\n`;
const N = degrausDaFaculdade.r2.inicial;
const n1 = `${N}total = 0\nfor nota in notas:\n    total += nota\nprint(total)\n`;
const n2 = `${n1}for i in range(1, 6):\n    print(i)\n`;
const n3 = `${n2}contador = 3\nwhile contador > 0:\n    print(contador)\n    contador -= 1\nprint("Fim!")\n`;
const n4 = `${n3}valores = [8, 6, 3, 9, 2]\nfor v in valores:\n    if v < 5:\n        print("Achei", v)\n        break\n`;
const f1 = 'def saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("Ana"))\n';
const f2 = `${f1}def soma(a, b):\n    return a + b\n`;
const f3 = `${f2}def calcular_media(notas):\n    return sum(notas) / len(notas)\n`;
const f4 = `${f3}def aumento(salario, taxa=10):\n    return salario + salario * taxa / 100\n`;
const q1 = 'compras = ["arroz", "feijão", "café"]\nprint(compras[0])\nprint(compras[-1])\n';
const q2 = `${q1}compras[1] = "macarrão"\ncompras.append("leite")\n`;
const q3 = `${q2}dias = ("seg", "ter", "qua")\nprint(len(dias))\n`;
const q4 = `${q3}texto = "Explorando Python"\nprint(texto[:5])\nprint(texto.count("o"))\n`;
const q5 = `${q4}for posicao, dia in enumerate(dias):\n    print(posicao, dia)\n`;
const w1 = 'camadas = {\n    "front-end": ["HTML", "CSS", "JavaScript"],\n    "back-end": ["Python", "Flask", "Django"],\n}\n';
const w2 = `${w1}ferramenta = camadas["front-end"][0]\nprint(ferramenta)\n`;
const w3 = `${w2}camadas["back-end"].append("FastAPI")\n`;
const m1 = 'interface = {"framework": "KivyMD", "abas": ["Inicio", "Calculadora", "Historico"]}\n';
const m2 = `${m1}for numero, aba in enumerate(interface["abas"], start=1):\n    print(f"Aba {numero}: {aba}")\n`;
const m3 = `${m2}def ao_tocar(aba):\n    return f"Abrindo {aba}"\n`;
const t1 = 'def dobro(numero):\n    return numero * 2\n\nassert dobro(4) == 8\nassert dobro(0) == 0\nprint("Tudo certo")\n';
const triplo = (esperado) => `def triplo(numero):\n    """Devolve o triplo do número.\n\n    >>> triplo(2)\n    ${esperado}\n    """\n    return numero * 3\n\nimport doctest\ndoctest.run_docstring_examples(triplo, globals())\n`;
const t2 = `${t1}${triplo(6)}`;
const testes = (terceiro) => `import unittest\n\nclass TestDobro(unittest.TestCase):\n    def test_positivo(self):\n        self.assertEqual(dobro(4), 8)\n\n    def test_zero(self):\n        self.assertEqual(dobro(0), 0)\n${terceiro}`;
const AA = degrausDaFaculdade.u4a4.inicial;
const aa1 = `${AA}meses = np.array([1, 2, 3, 4])\nvendas = np.array([100, 120, 140, 160])\n`;
const aa2 = `${aa1}coeficientes = np.polyfit(meses, vendas, 1)\nprint(coeficientes)\n`;
const aa3 = `${aa2}previsao = np.polyval(coeficientes, 5)\nprint("Previsao:", round(float(previsao)))\n`;
const casosComportamento = [
  ['u1a1', 'variaveis', uv1, true],
  ['u1a1', 'variaveis', 'nome = "Ana"\nidade = "20"\n', false, 'ficou como texto'],
  ['u1a1', 'tipos', uv2, true],
  ['u1a1', 'tipos', `${uv1}altura = "1,65"\nprint(type(idade))\nprint(type(altura))\n`, false, 'altura ficou como texto'],
  ['u1a1', 'converter', uv3, true],
  ['u1a1', 'converter', `${uv2}nota_texto = "7.5"\nnota = nota_texto\n`, false, 'precisa ser o número 7.5'],
  ['u1a1', 'conta', uv4, true],
  ['u1a1', 'conta', `${uv3}media = nota + 8.5 / 2\nprint(f"Media: {media}")\n`, false, '11.75'],
  ['u1a1', 'divisoes', `${uv4}print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\n`, true],
  ['u1a1', 'divisoes', `${uv4}print(3.5)\nprint(3)\nprint(1)\n`, false, 'Use as operações de verdade'],
  ['r1', 'if-else', k1, true],
  ['r1', 'if-else', `${R}print("Menor de idade")\n`, false, 'Escreva a decisão com if e else'],
  ['r1', 'if-else', k1.replace('idade >= 18', 'idade > 18'), false, 'Testei com idade 18'],
  ['r1', 'if-else', k1.replace('idade = 15', 'idade=15'), false, 'Mantenha a linha'],
  ['r1', 'elif', k2, true],
  ['r1', 'elif', `${k1}if idade < 18:\n    print("Adolescente")\nelif idade < 12:\n    print("Criança")\nelse:\n    print("Adulto")\n`, false, 'Testei com idade 8'],
  ['r1', 'and', k3, true],
  ['r1', 'and', `${k2}if idade >= 12 and idade > 0:\n    print("Pode entrar")\nelse:\n    print("Não pode entrar")\n`, false, 'sem ingresso'],
  ['r1', 'or', k4, true],
  ['r1', 'or', k4.replace('idade >= 60', 'idade > 60'), false, 'Testei com idade 60'],
  ['r1', 'not', `${k4}if not tem_ingresso:\n    print("Compre o ingresso")\nelse:\n    print("Boa sessão")\n`, true],
  ['r2', 'for-soma', n1, true],
  ['r2', 'for-soma', n1.replace('total += nota', 'total =+ nota'), false, 'não apareceu 24'],
  ['r2', 'for-soma', `${N}for nota in notas:\n    pass\nprint(24)\n`, false, 'as notas 1, 2, 3 e 4'],
  ['r2', 'range', n2, true],
  ['r2', 'range', `${n1}for i in range(1, 5):\n    print(i)\n`, false, 'precisa ter 1, 2, 3, 4 e 5'],
  ['r2', 'range', `${n1}for i in range(1, 7):\n    print(i)\n`, false, 'Apareceu o 6'],
  ['r2', 'while', n3, true],
  ['r2', 'while', `${n2}contador = 3\nwhile False:\n    pass\nprint(3)\nprint(2)\nprint(1)\nprint("Fim!")\n`, false, 'Testei com contador 5'],
  ['r2', 'break', n4, true],
  ['r2', 'break', `${n3}valores = [8, 6, 3, 9, 2]\nfor v in valores:\n    if v < 5:\n        print("Achei", v)\n    break\n`, false, 'não apareceu Achei 3'],
  ['r2', 'continue', `${n4}for v in valores:\n    if v < 5:\n        continue\n    print(v)\n`, true],
  ['r2', 'continue', `${n4}for v in valores:\n    continue\nprint(8)\nprint(6)\nprint(9)\n`, false, 'os valores 70, 4 e 50'],
  ['r3', 'def-return', f1, true],
  ['r3', 'def-return', 'def saudacao(nome):\n    print(f"Olá, {nome}!")\n\nsaudacao("Ana")\n', false, 'devolveu None'],
  ['r3', 'def-return', 'def saudar(nome):\n    return f"Olá, {nome}!"\n', false, 'Não encontrei saudacao'],
  ['r3', 'def-return', 'def saudacao(nome):\n    return "Olá, Ana!"\n', false, 'devolveu "Olá, Ana!"'],
  ['r3', 'dois-parametros', f2, true],
  ['r3', 'dois-parametros', `${f1}def soma(a, b):\n    return a - b\n`, false, 'soma(2, 3) e ela devolveu -1'],
  ['r3', 'media', f3, true],
  ['r3', 'media', `${f2}def calcular_media(notas):\n    return sum(notas) / 3\n`, false, 'calcular_media([10, 5])'],
  ['r3', 'padrao', f4, true],
  ['r3', 'padrao', `${f3}def aumento(salario, taxa):\n    return salario + salario * taxa / 100\n`, false, 'deu erro'],
  ['r3', 'lambda', `${f4}quadrado = lambda x: x * x\n`, true],
  ['r3', 'lambda', `${f4}def quadrado(x):\n    return x * x\n`, false, 'Crie quadrado com lambda'],
  ['u2a1', 'posicoes', q1, true],
  ['u2a1', 'posicoes', 'compras = ["arroz", "feijão", "café"]\nprint(compras[0])\nprint(compras[2])\n', false, 'posição negativa'],
  ['u2a1', 'mudar-lista', q2, true],
  ['u2a1', 'mudar-lista', `${q1}compras[2] = "macarrão"\ncompras.append("leite")\n`, false, 'O feijão está na posição 1'],
  ['u2a1', 'tupla', q3, true],
  ['u2a1', 'tupla', `${q2}dias = ["seg", "ter", "qua"]\nprint(len(dias))\n`, false, 'ficou como lista'],
  ['u2a1', 'fatiar', q4, true],
  ['u2a1', 'fatiar', q4.replace('texto[:5]', 'texto[0:5]'), true],
  ['u2a1', 'fatiar', q4.replace('texto[:5]', 'texto[:4]'), false, 'Fatie com texto[:5]'],
  ['u2a1', 'enumerate', q5, true],
  ['u2a1', 'compreensao', `${q5}precos = [10, 20, 30]\ncom_desconto = [p * 0.9 for p in precos]\n`, true],
  ['u2a1', 'compreensao', `${q5}precos = [10, 20, 30]\ncom_desconto = [p - 0.9 for p in precos]\n`, false, 'multiplique por 0.9'],
  ['r4', 'dicionario-de-listas', w1, true],
  ['r4', 'dicionario-de-listas', 'camadas = {"front-end": ["HTML", "CSS", "JavaScript"], "back-end": ["Python", "Flask"]}\n', false, 'devolveu'],
  ['r4', 'dois-colchetes', w2, true],
  ['r4', 'dois-colchetes', `${w1}ferramenta = "HTML"\n`, false, 'Pegue o item pelo dicionário'],
  ['r4', 'append', w3, true],
  ['r4', 'append', `${w2}camadas["front-end"].append("FastAPI")\n`, false, 'devolveu'],
  ['r4', 'percorrer-camadas', `${w3}for camada, ferramentas in camadas.items():\n    print(camada, len(ferramentas))\n`, true],
  ['u4a2', 'dados-da-tela', m1, true],
  ['u4a2', 'enumerate', m2, true],
  ['u4a2', 'enumerate', `${m1}for numero, aba in enumerate(interface["abas"]):\n    print(f"Aba {numero}: {aba}")\n`, false, 'começou em 0'],
  ['u4a2', 'ao-tocar', m3, true],
  ['u4a2', 'ao-tocar', `${m2}def ao_tocar(aba):\n    print(f"Abrindo {aba}")\n`, false, 'devolveu None'],
  ['u4a2', 'classe-do-app', `${m3}class CalculadoraApp:\n    def build(self):\n        return interface["abas"][0]\n`, true],
  ['u4a2', 'classe-do-app', `${m3}class CalculadoraApp:\n    def build(self):\n        return "Calculadora"\n`, false, 'devolveu "Calculadora"'],
  ['u4a3', 'assert', t1, true],
  ['u4a3', 'assert', 'def dobro(numero):\n    return numero * 2\n\nassert dobro(4) == 8\n', false, 'pelo menos dois'],
  ['u4a3', 'assert', t1.replace('numero * 2', 'numero * 3'), false, 'erro ao executar'],
  ['u4a3', 'doctest', t2, true],
  ['u4a3', 'doctest', `${t1}${triplo(7)}`, false, 'não bate'],
  ['u4a3', 'doctest', `${t1}def triplo(numero):\n    return numero * 3\n`, false, 'ainda não tem um exemplo'],
  ['u4a3', 'unittest', `${t2}${testes('\n    def test_negativo(self):\n        self.assertEqual(dobro(-2), -4)\n')}`, true],
  ['u4a3', 'unittest', `${t2}${testes('')}`, false, 'tem 2 testes'],
  ['u4a3', 'unittest', `${t2}${testes('\n    def test_negativo(self):\n        self.assertEqual(dobro(-2), 4)\n')}`, false, '1 teste falhou'],
  ['u4a4', 'dados', aa1, true],
  ['u4a4', 'treinar', aa2, true],
  ['u4a4', 'treinar', `${aa1}coeficientes = np.polyfit(vendas, meses, 1)\n`, false, 'devolveu'],
  ['u4a4', 'prever', aa3, true],
  ['u4a4', 'prever', `${aa2}previsao = np.polyval(coeficientes, 4)\n`, false, 'devolveu 160'],
  ['u4a4', 'treino-teste', `${aa3}coef_treino = np.polyfit(meses[:3], vendas[:3], 1)\nerro = abs(np.polyval(coef_treino, 4) - vendas[3])\nprint("Erro no teste:", round(float(erro), 2))\n`, true],
  ['u4a4', 'treino-teste', `${aa3}coef_treino = np.polyfit(meses, vendas, 1)\nerro = abs(np.polyval(coef_treino, 4) - vendas[3])\n`, false, 'Treine só com os três'],
];
const resultadosComportamento = await rodarNoMesmoWorker(casosComportamento.map(([t, id, codigo]) => `${codigo}\n${sondaDe(t, id, codigo)}`));
casosComportamento.forEach(([t, id, codigo, devePassar, motivo], i) => {
  const r = resultadosComportamento[i];
  const { saida, sonda } = separarSonda(r.output);
  if (saida.includes('__PYCAMPUS') || saida.includes('_pc_')) falhas.push(`${t} ${id} #${i}: a sonda vazou para a saída`);
  const conferencia = r.ok ? degrausDaFaculdade[t].degraus.find((d) => d.id === id).conferir({ graficos: r.graficos, codigo, saida, banco: sonda, sonda }) : { ok: false, motivo: `erro ao executar: ${r.output.slice(-200)}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`${t} ${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · sonda ${JSON.stringify(sonda)?.slice(0, 500)}`);
});

// Reforço da biblioteca, incluindo o código real do estudante (função de cadastro dentro da classe).
const bibClasse = 'class Livro:\n    def __init__(self, titulo, autor, genero, quantidade_disponivel):\n        self.titulo = titulo\n        self.autor = autor\n        self.genero = genero\n        self.quantidade_disponivel = quantidade_disponivel\n';
const bb2 = `${bibClasse}\nmeu_livro = Livro("Dom Casmurro", "Machado de Assis", "Romance", 3)\nprint(meu_livro.titulo)\n`;
const bb3 = `${bb2}livros = []\nlivros.append(meu_livro)\nlivros.append(Livro("Sapiens", "Yuval Harari", "História", 5))\n`;
const cad = '\ndef cadastrar_livro(livros, titulo, autor, genero, quantidade_disponivel):\n    livros.append(Livro(titulo, autor, genero, quantidade_disponivel))\n\ncadastrar_livro(livros, "A Hora da Estrela", "Clarice Lispector", "Romance", 2)\ncadastrar_livro(livros, "Cosmos", "Carl Sagan", "Ciência", 1)\n';
const bb4 = `${bb3}${cad}`;
const bb5 = `${bb4}\ndef listar_livros(livros):\n    for livro in livros:\n        print(livro.titulo, "-", livro.autor, "-", livro.genero, "-", livro.quantidade_disponivel)\n\nlistar_livros(livros)\n`;
const busca = (dentro) => `\ndef buscar_livro(livros, titulo_buscado):\n    for livro in livros:\n        if livro.titulo.lower() == titulo_buscado.lower():\n            return livro\n${dentro ? '        return None\n' : '    return None\n'}`;
const bb6 = `${bb5}${busca(false)}`;
const bb7 = `${bb6}\ndef contar_por_genero(livros):\n    contagem = {}\n    for livro in livros:\n        contagem[livro.genero] = contagem.get(livro.genero, 0) + 1\n    return contagem\n\ncontagem = contar_por_genero(livros)\nprint(contagem)\n`;
const codigoDoBackup = 'class Livro:\n    def __init__(self, titulo, autor, genero, quantidade_disponivel):\n        self.titulo = titulo\n        self.autor = autor\n        self.genero = genero\n        self.quantidade_disponivel = quantidade_disponivel\n\n    def casdastro_livro(livros, titulo, autor, genero, quantidade_disponivel):\n        livros.append(Livro(titulo, autor, genero, quantidade_disponivel))\n        for livro in livros:\n           print(livro.titulo, "-", livro.autor, "-", livro.genero, "-", livro.quantidade_disponive)\nlivros = []\n';
const casosBiblioteca = [
  ['classe', bibClasse, true],
  ['classe', bibClasse.replace('self.quantidade_disponivel = quantidade_disponivel', 'self.quantidade_disponive = quantidade_disponivel'), false, 'Sobra quantidade_disponive'],
  ['objeto', bb2, true],
  ['catalogo', bb3, true],
  ['catalogo', `${bb2}livros = []\nlivros.append(meu_livro)\n`, false, 'O catálogo tem 1 livro'],
  ['cadastrar', bb4, true],
  ['cadastrar', `${bb3}\n`.replace('class Livro:\n', 'class Livro:\n    def cadastrar_livro(livros, titulo, autor, genero, quantidade_disponivel):\n        livros.append(Livro(titulo, autor, genero, quantidade_disponivel))\n\n'), false, 'está com recuo, dentro da classe'],
  // O código de verdade do backup do estudante: tem de receber a explicação do recuo, com o nome dele.
  ['cadastrar', `${codigoDoBackup}meu_livro = Livro("Dom Casmurro", "Machado de Assis", "Romance", 3)
`, false, 'casdastro_livro está com recuo'],
  ['listar', bb5, true],
  ['listar', `${bb4}\ndef listar_livros(livros):\n    for livro in livros:\n        print(livro.titulo, livro.quantidade_disponive)\n`, false, 'deu erro'],
  ['buscar', bb6, true],
  ['buscar', `${bb5}${busca(true)}`, false, 'não achou'],
  ['contar', bb7, true],
  ['grafico', `${bb7}\nimport matplotlib.pyplot as plt\n\nplt.bar(contagem.keys(), contagem.values())\nplt.title("Livros por gênero")\nplt.close()\n`, true],
  ['grafico', `${bb7}\nimport matplotlib.pyplot as plt\n\nplt.bar(contagem.keys(), contagem.values())\nplt.close()\n`, false, 'sem título'],
];
const bib = degrausDaFaculdade['entrega-u2'];
const resultadosBib = await rodarNoMesmoWorker(casosBiblioteca.map(([id, codigo]) => `${codigo}\n${bib.sonda(codigo, bib.degraus.find((d) => d.id === id))}`));
casosBiblioteca.forEach(([id, codigo, devePassar, motivo], i) => {
  const r = resultadosBib[i];
  const { saida, sonda } = separarSonda(r.output);
  if (saida.includes('__PYCAMPUS') || saida.includes('_pc_')) falhas.push(`biblioteca ${id} #${i}: a sonda vazou para a saída`);
  const conferencia = r.ok ? bib.degraus.find((d) => d.id === id).conferir({ graficos: r.graficos, codigo, saida, banco: sonda, sonda }) : { ok: false, motivo: `erro ao executar: ${r.output.slice(-200)}` };
  const certo = conferencia.ok === devePassar && (devePassar || conferencia.motivo.includes(motivo));
  if (!certo) falhas.push(`biblioteca ${id} #${i}: esperava ${devePassar ? 'aprovar' : `reprovar com "${motivo}"`}, veio ${JSON.stringify(conferencia)} · sonda ${JSON.stringify(sonda)?.slice(0, 500)}`);
});

// As conferências da entrega da biblioteca: a solução de referência passa em todas, e o código
// do backup do estudante é barrado no cadastro com a explicação do recuo.
const { programaComConferencias, lerConferencias } = await import('../src/faculdade-conferencias.js');
const { entregasDaFaculdade } = await import('../src/faculdade-entregas.js');
const { solucoesEntregasFaculdade } = await import('../tests/faculdade-entregas-reference.js');
const entregaU2 = entregasDaFaculdade.find(({ id }) => id === 'entrega-u2');
const [refU2, backupU2] = await rodarNoMesmoWorker([
  programaComConferencias(solucoesEntregasFaculdade['entrega-u2'], entregaU2.conferencias),
  programaComConferencias(codigoDoBackup, entregaU2.conferencias),
]);
const confRef = lerConferencias(refU2.output).resultados || [];
if (confRef.length !== entregaU2.conferencias.length || !confRef.every(({ ok }) => ok)) falhas.push(`entrega-u2: a solução de referência não passou nas conferências: ${JSON.stringify(confRef)}`);
const confBackup = lerConferencias(backupU2.output).resultados || [];
const foraDaClasse = confBackup.find(({ id }) => id === 'cadastro-fora-da-classe');
if (foraDaClasse?.ok !== false || !/casdastro_livro está com recuo dentro da classe/.test(foraDaClasse?.detalhe || '')) falhas.push(`entrega-u2: o código do backup deveria ser barrado explicando o recuo: ${JSON.stringify(foraDaClasse)}`);
if (confBackup.find(({ id }) => id === 'busca-acha')?.ok !== false) falhas.push('entrega-u2: sem buscar_livro, a busca não pode conferir');

// Cada execução devolve só o gráfico dela: o worker reaproveitado não pode somar figuras antigas.
for (const [i, r] of resultados.entries()) {
  if (r.ok && r.graficos.length > 1) falhas.push(`caso #${i}: ${r.graficos.length} figuras numa execução de uma figura só`);
  if (r.ok && r.graficos.length !== r.imagens) falhas.push(`caso #${i}: ${r.imagens} imagens e ${r.graficos.length} descrições`);
}

await browser.close();
if (falhas.length) {
  console.error('Degraus com conferência errada:');
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}
assert.ok(resultados.length === casos.length);
console.log(`Degraus aprovados: ${casos.length + casosSql.length + casosVariaveis.length + casosU2.length + casosComportamento.length + casosBiblioteca.length + 2} programas executados no Pyodide; certos aprovam, errados reprovam pelo motivo certo.`);
