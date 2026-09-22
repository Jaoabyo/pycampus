import { useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import LeituraAoVivo from './LeituraAoVivo.jsx';
import './project-studio.css';


// Editor único da plataforma: aula, laboratório e oficina compartilham a mesma aparência de IDE.
// celebrate é um contador, não um booleano: cada incremento troca a key e replay a animação,
// mesmo quando o estudante acerta duas vezes seguidas. Quem chama decide o que conta como acerto
// (bater com a saída esperada); este componente só celebra o que mandarem celebrar.
// Responder input() durante a execução depende de SharedArrayBuffer, que só existe com os
// cabeçalhos COOP/COEP. O GitHub Pages não os envia, então no site publicado as respostas
// precisam ser preenchidas antes — e a tela precisa dizer isso, em vez de deixar o programa
// falhar com EOFError sem explicação.
export const interativo = typeof globalThis !== 'undefined' && globalThis.crossOriginIsolated === true;

export default function CodeEditor({ code, onChange, busy, onRun, onStop, output, imagens = [], success, stdin, setStdin, inputRequest = null, onReply, celebrate = 0, filename = 'main.py', readOnly = false, runDisabled = false, runDisabledHint = 'Código editável para sua entrega', runLabel = 'Executar código', emptyOutput = 'A saída do seu programa aparecerá aqui.', aoVivo = null }) {
  const editor = useRef(null);
  const reward = useRef({ count: 0, code: '', output: '', valid: false });
  if (reward.current.count !== celebrate) reward.current = { count: celebrate, code, output, valid: celebrate > 0 && success === true && !busy };
  if (busy || success !== true || code !== reward.current.code || output !== reward.current.output) reward.current.valid = false;
  const showReward = reward.current.valid;
  const [response, setResponse] = useState('');
  const change = value => { if (!readOnly) onChange(value); };
  return <div className={`code-workspace ${readOnly ? 'is-readonly' : ''}`}>
    {showReward && <div key={celebrate} className="run-glow" aria-hidden="true" />}
    <div className="editor-bar"><span><span className="python-dot" /> {filename}</span><span>{readOnly ? 'somente leitura' : 'Python 3'} <span className="live-dot" /></span></div>
    <div className="editor-body">
      <div className="line-numbers" aria-hidden="true">{code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div>
      <textarea ref={editor} aria-label="Editor de código Python" spellCheck="false" value={code} disabled={busy} readOnly={readOnly} onChange={e => change(e.target.value)} onKeyDown={e => {
        if (e.key === 'Tab' && !readOnly) { e.preventDefault(); const start = e.target.selectionStart, end = e.target.selectionEnd; change(code.slice(0, start) + '    ' + code.slice(end)); requestAnimationFrame(() => { editor.current.selectionStart = editor.current.selectionEnd = start + 4; }); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (!busy && !runDisabled) onRun(); }
      }} />
    </div>
    {aoVivo && !readOnly && <LeituraAoVivo code={code} {...aoVivo} />}
    {setStdin && <details className="stdin" open={!interativo && code.includes('input(')}><summary>Entradas para input() <span>{interativo ? 'preencher antes é opcional' : 'preencha antes de executar'}</span></summary>{interativo ? <p>Deixe vazio para responder às perguntas durante a execução. Se preencher, o programa usa estas linhas automaticamente, uma resposta por input().</p> : <p><strong>Aqui você precisa preencher antes de executar.</strong> Responder durante a execução exige cabeçalhos que este endereço não envia — no PyCampus aberto no seu computador isso funciona. Escreva uma resposta por linha, na ordem em que o programa perguntar.</p>}<textarea disabled={busy} aria-label="Entradas do programa" placeholder="Uma resposta por linha" value={stdin} onChange={e => setStdin(e.target.value)} /></details>}
    <div className="run-bar"><span>{runDisabled ? runDisabledHint : 'Ctrl + Enter para executar'}</span>{busy ? <button className="button danger" onClick={() => onStop()}><Icon name="Square" size={15} /> Interromper</button> : <button className="button primary" disabled={runDisabled} onClick={onRun}><Icon name="Play" size={15} /> {runLabel}</button>}</div>
    <div className="console-heading"><Icon name="Terminal" size={15} /> Saída do programa <span className={success === false ? 'error-text' : 'success-text'}>{busy ? '● Executando' : success === true ? '✓ Executado' : success === false ? 'Verifique a mensagem' : ''}</span>{showReward && <span key={celebrate} className="run-check" role="status"><Icon name="Sparkles" size={13} /> Deu certo!</span>}</div>
    <pre className={`console ${success === false ? 'error-text' : ''}`} aria-live="polite">{output || emptyOutput}</pre>
    {imagens.length > 0 && <div className="graficos" role="group" aria-label={imagens.length === 1 ? 'Gráfico gerado pelo programa' : `${imagens.length} gráficos gerados pelo programa`}>{imagens.map((imagem, indice) => <figure key={indice}><img src={imagem} alt={imagens.length === 1 ? 'Gráfico gerado pelo seu programa' : `Gráfico ${indice + 1} gerado pelo seu programa`} /><figcaption>{imagens.length === 1 ? 'Gráfico do seu programa' : `Gráfico ${indice + 1} de ${imagens.length}`}</figcaption></figure>)}</div>}
    {inputRequest !== null && <form className="input-question" onSubmit={e => { e.preventDefault(); onReply(response); setResponse(''); }}><label>O programa perguntou: <strong>{inputRequest}</strong><input autoFocus aria-label="Resposta ao input" maxLength={2000} value={response} onChange={e => setResponse(e.target.value)} autoComplete="off" /></label><button type="submit" className="button primary">Enviar resposta</button><p>Digite só a resposta, sem aspas. O programa continua depois que você enviar.</p></form>}
  </div>;
}
