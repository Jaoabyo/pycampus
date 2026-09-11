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
    self.postMessage({ type: 'started' });
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
      await runtime.runPythonAsync(data.code, { globals });
      self.postMessage({ type: 'result', output, ok: true });
    } finally { globals.destroy(); }
  } catch (error) {
    self.postMessage({ type: 'result', output: output + cleanTraceback(error.message || error), ok: false, kind: runtime ? 'error' : 'environment' });
  }
};
