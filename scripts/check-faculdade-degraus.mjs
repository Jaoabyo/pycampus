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
console.log(`Degraus aprovados: ${casos.length + casosSql.length} programas executados no Pyodide; certos aprovam, errados reprovam pelo motivo certo.`);
