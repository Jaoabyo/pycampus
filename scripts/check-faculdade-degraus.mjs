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
console.log(`Degraus aprovados: ${casos.length + casosSql.length + casosVariaveis.length + casosU2.length} programas executados no Pyodide; certos aprovam, errados reprovam pelo motivo certo.`);
