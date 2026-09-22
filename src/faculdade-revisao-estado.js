// A forma guardada da revisão espaçada e dos simulados — só isso, sem o banco de questões.
//
// Este arquivo existe separado porque normalizeState e mergeProgress estão no carregamento
// inicial do site, e o banco de questões (enunciados, alternativas e explicações das 40
// questões) não pode ir junto: o bundle inicial está a menos de 1 kB do limite. Aqui a
// validação reconhece um id pelo formato; quem casa o id com a questão é faculdade-revisao.js.

// u1q1…u4q5 (exercícios de unidade), aula:<id> e projeto:projeto-u1…u4.
const ID_DE_QUESTAO = /^(u[1-4]q[1-5]|aula:[a-z0-9]{2,12}|projeto:projeto-u[1-4])$/;
export const CAIXA_MAXIMA = 4;
const LIMITE_DE_REGISTROS = 300;
export const LIMITE_DE_SIMULADOS = 20;
const UNIDADES = ['u1', 'u2', 'u3', 'u4'];

const dataValida = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.valueOf())) return false;
  const local = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
  return local === valor;
};
const inteiro = (valor, minimo, maximo) => Number.isInteger(valor) && valor >= minimo && valor <= maximo;

// Um registro por questão: em que caixa ela está, quando volta e o histórico de acertos.
// Nada aqui vale XP — a revisão é treino, e treino não se premia por quantidade.
export function normalizarRevisao(entrada) {
  const saida = {};
  if (!entrada || typeof entrada !== 'object') return saida;
  for (const [id, registro] of Object.entries(entrada).slice(0, LIMITE_DE_REGISTROS)) {
    if (!ID_DE_QUESTAO.test(id) || !registro || typeof registro !== 'object') continue;
    if (!dataValida(registro.proxima) || !dataValida(registro.ultima)) continue;
    saida[id] = {
      caixa: inteiro(registro.caixa, 0, CAIXA_MAXIMA) ? registro.caixa : 0,
      proxima: registro.proxima,
      ultima: registro.ultima,
      acertos: inteiro(registro.acertos, 0, 9999) ? registro.acertos : 0,
      erros: inteiro(registro.erros, 0, 9999) ? registro.erros : 0,
    };
  }
  return saida;
}

export function normalizarSimulados(entrada) {
  if (!Array.isArray(entrada)) return [];
  return entrada
    .filter((item) => item && dataValida(item.data)
      && inteiro(item.total, 1, 60) && inteiro(item.acertos, 0, item.total)
      && inteiro(item.segundos, 0, 36000))
    .map((item) => {
      const porUnidade = {};
      for (const unidade of UNIDADES) {
        const parcial = item.porUnidade?.[unidade];
        if (parcial && inteiro(parcial.total, 1, 60) && inteiro(parcial.acertos, 0, parcial.total)) {
          porUnidade[unidade] = { acertos: parcial.acertos, total: parcial.total };
        }
      }
      return { data: item.data, total: item.total, acertos: item.acertos, segundos: item.segundos, porUnidade };
    })
    .slice(-LIMITE_DE_SIMULADOS);
}

// Dois aparelhos: vale o registro respondido por último, porque a caixa reflete a resposta
// mais recente. No empate de data, o que tem mais respostas guardadas carrega mais história.
export function juntarRevisao(a = {}, b = {}) {
  const saida = {};
  for (const id of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = a?.[id];
    const y = b?.[id];
    if (!x || !y) { saida[id] = x || y; continue; }
    const totalX = (x.acertos || 0) + (x.erros || 0);
    const totalY = (y.acertos || 0) + (y.erros || 0);
    saida[id] = y.ultima > x.ultima || (y.ultima === x.ultima && totalY > totalX) ? y : x;
  }
  return normalizarRevisao(saida);
}

export function juntarSimulados(a = [], b = []) {
  const vistos = new Set();
  const todos = [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]
    .filter((item) => {
      const chave = `${item?.data}|${item?.acertos}|${item?.total}|${item?.segundos}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    })
    .sort((x, y) => String(x?.data).localeCompare(String(y?.data)));
  return normalizarSimulados(todos);
}
