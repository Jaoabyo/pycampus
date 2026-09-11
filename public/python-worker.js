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
