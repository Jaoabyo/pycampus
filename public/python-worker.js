/* Python runs in a disposable worker, never in a local shell. */
let runtime;
/* Mantém o traceback no formato real do Python, sem os quadros internos do Pyodide,
   que não pertencem ao código do estudante e atrapalham a leitura do erro. */
const cleanTraceback = value => {
  const lines = String(value).split('\n'), kept = [];
  let skipping = false;
  for (const line of lines) {
    const frame = line.match(/^\s*File "([^"]*)", line/);
    if (frame) {
      skipping = /_pyodide|pyodide\.asm|\/lib\/python\d|site-packages/.test(frame[1]);
      if (!skipping) kept.push(line.replace('File "<exec>"', 'File "seu_codigo.py"'));
      continue;
    }
    if (skipping && /^\s/.test(line)) continue;
    if (!/^\s/.test(line)) skipping = false;
    kept.push(line);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};
/* Gráficos: o worker só sabe devolver texto, então uma figura do Matplotlib morreria dentro
   dele. O preparo abaixo guarda a figura como PNG no momento em que ela seria descartada.
   Capturar em close() é o que importa: as aulas terminam com plt.close() justamente para que
   executar de novo não desenhe o gráfico novo por cima do antigo, e sem este gancho a figura
   já teria sido destruída quando o programa termina. show() não captura porque quase sempre
   vem antes de um close(), o que renderia a mesma figura duas vezes; quem chama show() e não
   fecha é atendido pela coleta final, que recolhe o que ficou aberto. */
const usaMatplotlib = codigo => /(^|\n)\s*(import|from)\s+matplotlib\b/.test(String(codigo || ''));

/* Bibliotecas que não vêm na distribuição do Pyodide mas instalam em tempo de execução pelo
   micropip. Estão aqui porque foram medidas por scripts/medir-bibliotecas.mjs, não porque a
   documentação promete: Seaborn é exigido pelo roteiro da Unidade 3 e não podia continuar
   sendo substituído por um aviso. A instalação baixa da rede na primeira vez de cada sessão,
   então o estudante recebe um aviso em vez de uma tela parada. */
const INSTALAVEIS = { seaborn: 'seaborn', plotly: 'plotly', openpyxl: 'openpyxl' };
const pacotesParaInstalar = codigo => Object.keys(INSTALAVEIS).filter(
  nome => new RegExp(`(^|\\n)\\s*(import|from)\\s+${nome}\\b`).test(String(codigo || '')),
);
const instalarPacotes = async nomes => {
  // Sem os callbacks mudos, o Pyodide escreve "micropip already loaded from default channel" e
  // "No new packages to load" no meio da saída do estudante — e na segunda execução o texto
  // muda, o que faz um resultado idêntico parecer diferente.
  await runtime.loadPackage('micropip', { messageCallback: () => {}, errorCallback: () => {} });
  const micropip = runtime.pyimport('micropip');
  try {
    for (const nome of nomes) {
      self.postMessage({ type: 'status', message: `Baixando ${nome}… (só na primeira vez)` });
      await micropip.install(INSTALAVEIS[nome]);
    }
  } finally { micropip.destroy?.(); }
};
const PREPARO_DOS_GRAFICOS = `
import matplotlib
matplotlib.use("Agg")
import io as _io, base64 as _base64
import matplotlib.pyplot as _plt

_campus_figuras = []
_campus_fatos = []

# O que o gráfico mostra, em dados: é o que permite conferir um gráfico de verdade (quantas
# barras, com que alturas, qual título) em vez de só procurar plt.bar no texto do código.
# Lido depois do savefig, porque só o desenho preenche os rótulos dos eixos categóricos.
def _campus_descrever(figura):
    eixos = []
    for eixo in figura.get_axes():
        eixos.append({
            "barras": [float(p.get_height()) for p in eixo.patches if hasattr(p, "get_height")],
            "rotulos": [t.get_text() for t in eixo.get_xticklabels()],
            "titulo": eixo.get_title(),
            "eixo_x": eixo.get_xlabel(),
            "eixo_y": eixo.get_ylabel(),
            "linhas": len(eixo.lines),
        })
    return eixos

def _campus_guardar(figura):
    if figura is None or not figura.get_axes():
        return
    deposito = _io.BytesIO()
    try:
        figura.savefig(deposito, format="png", dpi=110, bbox_inches="tight")
    except Exception:
        return
    _campus_figuras.append(_base64.b64encode(deposito.getvalue()).decode("ascii"))
    try:
        _campus_fatos.append(_campus_descrever(figura))
    except Exception:
        _campus_fatos.append([])

# O worker é reaproveitado entre execuções, então este preparo roda de novo a cada vez. Sem a
# guarda abaixo, a segunda execução guardaria o close JÁ SUBSTITUÍDO como se fosse o original,
# e ele passaria a chamar a si mesmo até estourar a pilha.
if not getattr(_plt.close, "_campus_patched", False):
    _campus_close_original = _plt.close

def close(fig=None):
    if fig is None:
        _campus_guardar(_plt.gcf() if _plt.get_fignums() else None)
    elif fig == "all":
        for numero in _plt.get_fignums():
            _campus_guardar(_plt.figure(numero))
    else:
        _campus_guardar(fig if hasattr(fig, "savefig") else _plt.figure(fig))
    return _campus_close_original(fig) if fig is not None else _campus_close_original()

close._campus_patched = True
_plt.close = close

def _campus_colher():
    for numero in _plt.get_fignums():
        _campus_guardar(_plt.figure(numero))
    _campus_close_original("all")
    colhidas = list(_campus_figuras)
    _campus_figuras.clear()
    return colhidas

def _campus_colher_fatos():
    import json as _json
    fatos = _json.dumps(_campus_fatos)
    _campus_fatos.clear()
    return fatos
`;
const LIMITE_DE_IMAGENS = 4;
const colherGraficos = async () => {
  try {
    const colhidas = await runtime.runPythonAsync('_campus_colher()');
    const lista = colhidas?.toJs ? colhidas.toJs() : colhidas;
    colhidas?.destroy?.();
    return (lista || []).slice(0, LIMITE_DE_IMAGENS).map(dados => `data:image/png;base64,${dados}`);
  } catch {
    // Um gráfico que não pôde ser salvo não pode derrubar a execução do estudante.
    return [];
  }
};
// Chamado logo depois de colherGraficos, que é quem fecha as figuras e registra os fatos.
const colherFatos = async () => {
  try {
    return JSON.parse(await runtime.runPythonAsync('_campus_colher_fatos()')).slice(0, LIMITE_DE_IMAGENS);
  } catch {
    return [];
  }
};

/* Visualizador: roda o programa com sys.settrace e guarda, a cada linha, quais variáveis
   existem e o que já foi impresso. É o mesmo princípio do Python Tutor. O arquivo recebe o
   nome <visualizador> para o rastreador ignorar tudo que não é código do estudante. */
const PROGRAMA_DO_RASTRO = `
import sys, io, json

_passos = []
_saida = io.StringIO()
_LIMITE = 400

def _valor(v):
    if v is None or isinstance(v, (int, float, bool)):
        return repr(v)
    if isinstance(v, str):
        return repr(v) if len(v) <= 60 else repr(v[:60]) + ' …'
    if isinstance(v, (list, tuple, dict, set)):
        texto = repr(v)
        return texto if len(texto) <= 140 else texto[:140] + ' …'
    return None

def _instantaneo(frame):
    variaveis = {}
    for nome, valor in list(frame.f_locals.items()):
        if nome.startswith('_'):
            continue
        texto = _valor(valor)
        if texto is not None:
            variaveis[nome] = texto
    return variaveis

def _rastro(frame, evento, arg):
    if frame.f_code.co_filename != '<visualizador>':
        return None
    if evento == 'line' and len(_passos) < _LIMITE:
        _passos.append({'linha': frame.f_lineno, 'variaveis': _instantaneo(frame), 'saida': _saida.getvalue()})
    return _rastro

_erro = ''
_anterior = sys.stdout
sys.stdout = _saida
try:
    _compilado = compile(__fonte, '<visualizador>', 'exec')
    _ambiente = {'__name__': '__main__'}
    sys.settrace(_rastro)
    try:
        exec(_compilado, _ambiente)
    finally:
        sys.settrace(None)
except BaseException as falha:
    _erro = type(falha).__name__ + ': ' + str(falha)
finally:
    sys.stdout = _anterior

_passos.append({'linha': 0, 'variaveis': _passos[-1]['variaveis'] if _passos else {}, 'saida': _saida.getvalue()})
json.dumps({'passos': _passos, 'erro': _erro, 'cortado': len(_passos) > _LIMITE})
`;

self.onmessage = async ({ data }) => {
  let output = '';
  try {
    if (!runtime) {
      self.postMessage({ type: 'status', message: 'Preparando Python… o primeiro carregamento pode levar alguns segundos.' });
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
      runtime = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });
    }
    // "started" liga o cronômetro de 15 segundos do estudante, então ele só é enviado quando o
    // programa dele realmente começa. Baixar pandas ou instalar seaborn é espera de
    // infraestrutura: se contasse no limite, um primeiro uso de biblioteca seria interrompido
    // como se fosse laço infinito.
    const append = text => {
      if (output.length > 50000) throw new Error('Limite de saída atingido. Reduza a quantidade de prints.');
      output += text + '\n';
    };
    runtime.setStdout({ batched: append });
    runtime.setStderr({ batched: append });
    const inputs = (data.stdin || '').split('\n');
    runtime.setStdin({ stdin: () => inputs.length ? inputs.shift() : undefined });
    const globals = runtime.toPy({});
    try {
      if (data.trace) {
        globals.set('__fonte', data.code);
        await runtime.loadPackagesFromImports(data.code, { messageCallback: () => {} });
        self.postMessage({ type: 'started' });
        const bruto = await runtime.runPythonAsync(PROGRAMA_DO_RASTRO, { globals });
        self.postMessage({ type: 'trace', ...JSON.parse(bruto) });
        return;
      }
      if (data.inputBuffer) {
        const signal = new Int32Array(data.inputBuffer, 0, 2);
        const bytes = new Uint8Array(data.inputBuffer, 8);
        globals.set('__campus_input', prompt => {
          Atomics.store(signal, 0, 0);
          self.postMessage({ type: 'input', prompt: String(prompt), output });
          while (Atomics.load(signal, 0) === 0) Atomics.wait(signal, 0, 0);
          return new TextDecoder().decode(bytes.slice(0, Atomics.load(signal, 1)));
        });
        await runtime.runPythonAsync('def input(prompt=""):\n    return __campus_input(str(prompt))', { globals });
      }
      // Package download notices are infrastructure, not the student's output.
      await runtime.loadPackagesFromImports(data.code, { messageCallback: () => {} });
      const aInstalar = pacotesParaInstalar(data.code);
      if (aInstalar.length) await instalarPacotes(aInstalar);
      const querGrafico = usaMatplotlib(data.code) || aInstalar.includes('seaborn');
      if (querGrafico) await runtime.runPythonAsync(PREPARO_DOS_GRAFICOS);
      self.postMessage({ type: 'started' });
      await runtime.runPythonAsync(data.code, { globals });
      const imagens = querGrafico ? await colherGraficos() : [];
      const graficos = querGrafico ? await colherFatos() : [];
      self.postMessage({ type: 'result', output, ok: true, imagens, graficos });
    } finally { globals.destroy(); }
  } catch (error) {
    // Um gráfico desenhado antes do erro ainda ajuda a entender onde o programa parou.
    const desenhou = usaMatplotlib(data.code) || pacotesParaInstalar(data.code).includes('seaborn');
    const imagens = runtime && desenhou ? await colherGraficos() : [];
    const graficos = runtime && desenhou ? await colherFatos() : [];
    self.postMessage({ type: 'result', output: output + cleanTraceback(error.message || error), ok: false, kind: runtime ? 'error' : 'environment', imagens, graficos });
  }
};
