import { useEffect, useRef, useState } from 'react';

// No site publicado não existe COOP/COEP, então o Python não consegue parar e perguntar: as
// respostas de input() têm de vir do campo de entradas. Sem isso input() devolve texto vazio e
// o programa quebra num erro que não tem nada a ver com o que o estudante escreveu. Em vez de
// deixar isso acontecer, avisamos antes de executar e dizemos exatamente o que fazer.
export const podeResponderDurante = () => globalThis.crossOriginIsolated === true && typeof SharedArrayBuffer !== "undefined";

export function faltaEntrada(code, stdin) {
  if (String(stdin || "").trim() || podeResponderDurante()) return false;
  return String(code || "").split(String.fromCharCode(10))
    .some(linha => !linha.trim().startsWith("#") && new RegExp("input\\s*\\(").test(linha.split("#")[0]));
}

export const AVISO_ENTRADA = "Seu programa usa input(), e aqui as respostas são lidas do campo “Entradas para input()”, logo abaixo do editor. Escreva ali a resposta (uma por linha, na ordem em que o programa pergunta) e execute de novo. Não é erro no seu código: neste endereço o Python não consegue parar para perguntar.";
export function usePython(options = {}) {
  const worker = useRef(null), timer = useRef(null), active = useRef(null), observer = useRef(options);
  const callback = useRef(null);
  const settle = result => { const pending = callback.current; callback.current = null; pending?.(result); };
  const inputBuffer = useRef(null);
  const awaitingReply = useRef(false);
  const [inputRequest, setInputRequest] = useState(null);
  observer.current = options;
  const [busy, setBusy] = useState(false), [output, setOutput] = useState(''), [success, setSuccess] = useState(null);
  const finish = (status, text) => {
    const attempt = active.current;
    if (!attempt) return;
    active.current = null;
    observer.current.onRecord?.({ ...attempt, status, output: text, durationMs: Date.now() - Date.parse(attempt.startedAt), matched: typeof attempt.expected === 'string' && status === 'success' ? text.trim() === attempt.expected.trim() : null });
  };
  const stop = (message = 'Execução interrompida. Você pode editar e tentar novamente.', status = 'interrupted') => {
    clearTimeout(timer.current); worker.current?.terminate(); worker.current = null;
    finish(status, message); awaitingReply.current = false; setInputRequest(null); inputBuffer.current = null; setBusy(false); setSuccess(false); setOutput(message);
    settle({ ok: false, output: message, kind: status });
  };
  useEffect(() => () => {
    clearTimeout(timer.current); worker.current?.terminate(); worker.current = null;
    finish('interrupted', 'Execução interrompida ao sair desta página.');
    settle({ ok: false, output: 'Execução interrompida ao sair desta página.', kind: 'interrupted' });
  }, []);
  const run = (code, stdin = '', onResult) => {
    if (active.current) return;
    if (faltaEntrada(code, stdin)) { setOutput(AVISO_ENTRADA); setSuccess(false); setBusy(false); setInputRequest(null); onResult?.({ ok: false, output: AVISO_ENTRADA, kind: 'input' }); return; }
    callback.current = onResult;
    active.current = { id: crypto.randomUUID(), startedAt: new Date().toISOString(), code, stdin, source: observer.current.source || 'playground', lessonId: observer.current.lessonId || '', title: observer.current.title || 'Laboratório livre', expected: observer.current.expected };
    observer.current.onRecord?.({ ...active.current, status: 'running', output: 'Execução iniciada; resultado ainda não recebido.' });
    setBusy(true); setSuccess(null); setOutput('Carregando o ambiente Python…');
    setInputRequest(null);
    try {
      if (!worker.current) worker.current = new Worker(`${import.meta.env.BASE_URL}python-worker.js`);
      timer.current = setTimeout(() => stop('O carregamento demorou demais. Verifique sua internet e tente novamente.', 'environment'), 90000);
      worker.current.onmessage = ({ data }) => {
        if (data.type === 'status') setOutput(data.message);
        if (data.type === 'started') { clearTimeout(timer.current); setOutput('Executando…'); timer.current = setTimeout(() => stop('Tempo limite de 15 segundos atingido. Verifique se há um laço infinito.', 'timeout'), 15000); }
        if (data.type === 'input') { clearTimeout(timer.current); awaitingReply.current = true; setInputRequest(data.prompt || 'Digite uma resposta:'); setOutput(data.output || 'O programa está esperando sua resposta abaixo.'); }
        if (data.type === 'result') {
          clearTimeout(timer.current); finish(data.ok ? 'success' : data.kind === 'environment' ? 'environment' : 'error', data.output);
          setInputRequest(null); inputBuffer.current = null; setOutput(data.output || '(O programa terminou sem saída.)'); setSuccess(data.ok); setBusy(false); settle(data);
        }
      };
      worker.current.onerror = () => stop('Não foi possível carregar o Python. Verifique a conexão e o acesso ao CDN jsDelivr.', 'environment');
      inputBuffer.current = !stdin && globalThis.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined' ? new SharedArrayBuffer(8200) : null;
      worker.current.postMessage({ code, stdin, inputBuffer: inputBuffer.current });
    } catch { stop('Não foi possível iniciar o ambiente Python. Tente novamente.', 'environment'); }
  };
  const reply = value => {
    if (!inputBuffer.current || !active.current || !awaitingReply.current) return;
    const bytes = new TextEncoder().encode(value);
    if (bytes.length > 8192) return;
    awaitingReply.current = false;
    const signal = new Int32Array(inputBuffer.current, 0, 2);
    new Uint8Array(inputBuffer.current, 8).set(bytes);
    active.current.stdin += (active.current.inputCount ? '\n' : '') + value;
    active.current.inputCount = (active.current.inputCount || 0) + 1;
    setInputRequest(null);
    timer.current = setTimeout(() => stop('Tempo limite de 15 segundos atingido. Verifique se há um laço infinito.', 'timeout'), 15000);
    Atomics.store(signal, 1, bytes.length); Atomics.store(signal, 0, 1); Atomics.notify(signal, 0);
  };
  return { busy, output, success, run, stop, inputRequest, reply, reset: () => { setOutput(''); setSuccess(null); } };
}
