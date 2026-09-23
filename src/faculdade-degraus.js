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

export const degrausDaFaculdade = {
  u2a4: {
    titulo: 'Agora monte um gráfico de barras, um degrau por vez',
    introducao: 'O exemplo do professor mostra o gráfico pronto. Aqui você constrói o seu, acrescentando uma coisa por degrau. Cada degrau confere o gráfico que você desenhou de verdade: quantas barras, com que altura e com que nomes.',
    inicial: 'import matplotlib.pyplot as plt\n\n',
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
