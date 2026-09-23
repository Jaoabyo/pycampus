// O que o código do professor usa e nenhum guia explicou antes.
//
// O guia de cada aula é pequeno e explicado trecho a trecho; o exemplo do material, logo
// depois, costuma reunir muito mais: funções que o guia não mostrou, parâmetros nomeados,
// comandos SQL inteiros. Para quem está aprendendo, isso chega como "uma porrada de código
// que eu nunca vi". Este módulo mede esse salto em vez de supor: extrai os termos do exemplo
// e desconta o que já apareceu em algum guia desta aula ou das anteriores.
import { aulasDaFaculdade } from './faculdade.js';
import { ensinoDaFaculdade } from './faculdade-ensino.js';
import { pontesDasAulas, pontesDasEntregas } from './faculdade-pontes.js';
import { exemploDaEntrega } from './faculdade-exemplos.js';

// Palavras da própria linguagem. Só entram como novidade quando nenhum guia anterior as usou.
const PALAVRAS_PYTHON = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if',
  'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with',
  'yield']);

const semComentario = linha => {
  let dentro = null;
  for (let i = 0; i < linha.length; i += 1) {
    const c = linha[i];
    if (dentro) {
      if (c === '\\') i += 1;
      else if (c === dentro) dentro = null;
    } else if (c === '"' || c === "'") dentro = c;
    else if (c === '#') return linha.slice(0, i);
  }
  return linha;
};

// Separa o código Python do conteúdo dos textos: um texto entre aspas não é sintaxe nova,
// exceto quando carrega SQL, que o estudante precisa ler como linguagem.
const separar = (codigo) => {
  const semComentarios = String(codigo || '').split('\n').map(semComentario).join('\n');
  const textos = [];
  const python = semComentarios.replace(/("""|'''|"|')([\s\S]*?)\1/g, (_, aspas, conteudo) => {
    textos.push(conteudo);
    return '""';
  });
  return { python, textos };
};

const PALAVRAS_SQL = /\b(CREATE|TABLE|IF|NOT|EXISTS|INSERT|INTO|VALUES|SELECT|FROM|WHERE|UPDATE|SET|DELETE|DROP|ALTER|PRIMARY|KEY|AUTOINCREMENT|INTEGER|TEXT|REAL|DATE|NULL|ORDER|BY|GROUP|COUNT|SUM|AVG|JOIN|AND|OR|LIMIT)\b/g;

// Nomes que o próprio exemplo cria: variáveis, parâmetros, funções e classes do estudante ou
// do professor. Eles são dados do exemplo, não ferramentas que precisam de explicação.
const nomesCriados = (python) => {
  const criados = new Set();
  for (const m of python.matchAll(/^\s*([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*(?:[+\-*/]?=)(?!=)/gm)) {
    m[1].split(',').forEach(n => criados.add(n.trim()));
  }
  for (const m of python.matchAll(/\bfor\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s+in\b/g)) {
    m[1].split(',').forEach(n => criados.add(n.trim()));
  }
  for (const m of python.matchAll(/\b(?:def|class)\s+([A-Za-z_]\w*)/g)) criados.add(m[1]);
  for (const m of python.matchAll(/\bdef\s+\w+\s*\(([^)]*)\)/g)) {
    m[1].split(',').map(p => p.split('=')[0].trim()).filter(Boolean).forEach(n => criados.add(n));
  }
  for (const m of python.matchAll(/\blambda\s+([^:]*):/g)) {
    m[1].split(',').map(p => p.trim()).filter(Boolean).forEach(n => criados.add(n));
  }
  for (const m of python.matchAll(/\bas\s+([A-Za-z_]\w*)/g)) criados.add(m[1]);
  for (const m of python.matchAll(/\bself\.([A-Za-z_]\w*)\s*=(?!=)/g)) criados.add(m[1]);
  return criados;
};

// Cada termo vira uma etiqueta legível: "math" (módulo), ".sqrt" (algo acessado com ponto),
// "len()" (função chamada), "color=" (parâmetro nomeado), "for" (palavra da linguagem) e
// "SQL CREATE" (palavra de um comando SQL).
export function termosDoCodigo(codigo, criadosAntes = new Set()) {
  // Um exemplo que é só um comando SQL, sem Python em volta, é lido inteiro como SQL.
  const soSql = /^\s*(?:CREATE|SELECT|INSERT|UPDATE|DELETE|DROP)\b/.test(String(codigo || ''));
  const { python, textos } = soSql ? { python: '', textos: [String(codigo)] } : separar(codigo);
  const criados = new Set([...criadosAntes, ...nomesCriados(python)]);
  const termos = new Set();
  for (const m of python.matchAll(/^\s*import\s+([\w.]+)/gm)) termos.add(m[1]);
  for (const m of python.matchAll(/^\s*from\s+([\w.]+)\s+import[ \t]+([\w \t,]+)/gm)) {
    termos.add(m[1]);
    m[2].split(',').map(n => n.trim()).filter(Boolean).forEach(n => termos.add(`${n}()`));
  }
  for (const m of python.matchAll(/\.([A-Za-z_]\w*)/g)) {
    if (!criados.has(m[1])) termos.add(`.${m[1]}`);
  }
  for (const m of python.matchAll(/(?<![.\w])([A-Za-z_]\w*)\s*\(/g)) {
    const nome = m[1];
    if (!PALAVRAS_PYTHON.has(nome) && !criados.has(nome)) termos.add(`${nome}()`);
  }
  // Parâmetro nomeado é o que está dentro de parênteses: "perda, acuracia = ..." é atribuição,
  // e o y= de df.plot(x=..., y=...) continua sendo parâmetro mesmo existindo uma variável y.
  for (const m of python.matchAll(/[(,]\s*([A-Za-z_]\w*)\s*=(?!=)/g)) {
    const antes = python.slice(0, m.index + 1);
    const profundidade = (antes.match(/\(/g) || []).length - (antes.match(/\)/g) || []).length;
    if (profundidade > 0) termos.add(`${m[1]}=`);
  }
  for (const m of python.matchAll(/\b([A-Za-z_]\w*)\b/g)) {
    if (PALAVRAS_PYTHON.has(m[1])) termos.add(m[1]);
  }
  if (/\bf["']/.test(codigo)) termos.add('f-string');
  for (const texto of textos) {
    for (const m of texto.matchAll(PALAVRAS_SQL)) termos.add(`SQL ${m[1]}`);
  }
  // "from x import y" já nomeia y; o parâmetro "as" de import não é novidade à parte.
  termos.delete('from');
  termos.delete('import');
  termos.delete('as');
  return termos;
}

// Um termo conta como ensinado quando aparece no código de um guia, ou é nomeado na
// explicação de um trecho. Nomear na explicação é o mínimo: o guia tem de ter falado dele.
const TERMO_NA_EXPLICACAO = (termo, texto) => {
  const nome = termo.replace(/^SQL /, '').replace(/^\./, '').replace(/[()=]$/g, '').replace(/\(\)$/, '');
  if (termo === 'f-string') return /\bf-string|\bf antes das aspas/i.test(texto);
  return new RegExp(`(?<![\\w])${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`).test(texto);
};

const ensinadoNoGuia = (ensino) => {
  if (!ensino) return { termos: new Set(), texto: '' };
  const termos = termosDoCodigo(`${ensino.codigo}\n${ensino.treino.depois}`);
  const texto = [ensino.objetivo, ...ensino.passos.map(p => p.explicacao), ensino.revisao.explicacao].join('\n');
  return { termos, texto };
};

// Um passo de medição: os termos novos do código, quais deles a ponte cobre e quais pontes
// sobram (explicam algo que o código já não usa). Depois de medir, tudo que foi explicado
// passa a contar como visto para o que vem a seguir.
const medir = ({ codigo, criados, termosVistos, texto, pontes = [] }) => {
  const termos = termosDoCodigo(codigo, criados);
  const novos = [...termos].filter(t => !termosVistos.has(t) && !TERMO_NA_EXPLICACAO(t, texto));
  const cobertos = new Set(pontes.flatMap(p => p.termos));
  const semPonte = novos.filter(t => !cobertos.has(t));
  const pontesSobrando = [...cobertos].filter(t => !novos.includes(t));
  termos.forEach(t => { if (!semPonte.includes(t)) termosVistos.add(t); });
  return { novos, semPonte, pontesSobrando };
};

// Para cada aula, na ordem da disciplina: os termos do exemplo do professor que nenhum guia
// anterior (nem o desta aula) mostrou ou explicou, e o que as pontes cobrem disso.
export function novidadesDoMaterial() {
  const termosVistos = new Set();
  const textos = [];
  return aulasDaFaculdade.map((aula) => {
    const guia = ensinadoNoGuia(ensinoDaFaculdade[aula.id]);
    guia.termos.forEach(t => termosVistos.add(t));
    textos.push(guia.texto);
    const medida = medir({ codigo: aula.exemplo, termosVistos, texto: textos.join('\n'), pontes: pontesDasAulas[aula.id] });
    return {
      id: aula.id,
      titulo: aula.titulo,
      linhasGuia: ensinoDaFaculdade[aula.id]?.codigo.split('\n').length || 0,
      linhasExemplo: aula.exemplo.split('\n').length,
      ...medida,
    };
  });
}

// O mesmo salto, medido nos passos das entregas, na ordem das unidades. Conta como visto o que
// os guias e as pontes das aulas até a unidade da entrega ensinaram, o que as entregas
// anteriores explicaram e o que os passos anteriores desta mostraram. Um termo do passo atual
// também vale quando a explicação do próprio passo o nomeia.
export function novidadesDasEntregas(entregas) {
  const ordem = { u1: 1, u2: 2, u3: 3, u4: 4 };
  const termosVistos = new Set();
  const textos = [];
  const aulasVistas = new Set();
  return [...entregas].sort((a, b) => ordem[a.unidade] - ordem[b.unidade]).map((entrega) => {
    for (const aula of aulasDaFaculdade) {
      if (ordem[aula.unidade] > ordem[entrega.unidade] || aulasVistas.has(aula.id)) continue;
      aulasVistas.add(aula.id);
      const guia = ensinadoNoGuia(ensinoDaFaculdade[aula.id]);
      guia.termos.forEach(t => termosVistos.add(t));
      textos.push(guia.texto);
      medir({ codigo: aula.exemplo, termosVistos, texto: textos.join('\n'), pontes: pontesDasAulas[aula.id] });
    }
    const criados = new Set();
    const passos = entrega.passos.map((passo) => {
      // Mede o que aparece na tela: quando o passo tem exemplo executável, é ele, com a
      // preparação e o texto "Como ler este exemplo" que a acompanha.
      const preparado = exemploDaEntrega(entrega, passo);
      const codigo = preparado?.ambiente === 'pycampus' ? preparado.codigo : passo.exemplo;
      const texto = `${textos.join('\n')}\n${passo.explicacao}\n${preparado?.preparacao || ''}`;
      const medida = medir({ codigo, criados, termosVistos, texto, pontes: pontesDasEntregas[passo.id] });
      nomesCriados(separar(passo.exemplo).python).forEach(n => criados.add(n));
      textos.push(passo.explicacao);
      return { id: passo.id, titulo: passo.titulo, ...medida };
    });
    return { id: entrega.id, passos };
  });
}
