import { useState } from 'react';
import { Icon } from './ui.jsx';
import { functionBridges } from './function-bridges.js';
import { lessons } from './curriculum.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import CodeEditor from './CodeEditor.jsx';
import { ErrorHelp, OutputCompare } from './RunFeedback.jsx';
import CodeReview from './CodeReview.jsx';
import ExplainReview from './ExplainReview.jsx';
import { predictionMatches } from './practice-content.js';
import { requisitosFaltando } from './requisitos.js';
import ParsonsPuzzle from './ParsonsPuzzle.jsx';
import Mentor from './Mentor.jsx';
import './bridges.css';

// A ponte entre "função sem parâmetro" e "função que recebe, compara e devolve": oito passos
// pequenos, cada um com uma novidade só. Concluir exige rodar o código e acertar a pergunta,
// porque saída certa sozinha não mostra que a ideia foi entendida.
export const bridgeDone = (state, id) => Boolean(state?.functionBridges?.[id]?.passed && state?.functionBridges?.[id]?.quizCorrect);
export const bridgesDone = state => functionBridges.filter(bridge => bridgeDone(state, bridge.id)).length;

function Bridge({ bridge, state, update, back, proxima, irPara }) {
  const record = state.functionBridges?.[bridge.id] || {};
  const [code, setCode] = useState(record.code ?? bridge.starter);
  const [feedback, setFeedback] = useState(''), [mismatch, setMismatch] = useState(null), [hints, setHints] = useState(0), [fails, setFails] = useState(0), [puzzle, setPuzzle] = useState(false), [celebrate, setCelebrate] = useState(0);
  const [saidaOk, setSaidaOk] = useState(false), [faltando, setFaltando] = useState([]), [aprovacao, setAprovacao] = useState(null);
  const python = usePython({ source: 'playground', title: `Ponte de função: ${bridge.title}`, expected: bridge.expected, onRecord: attempt => update(s => appendAttempt(s, attempt)) });
  const save = patch => update(s => ({ ...s, functionBridges: { ...s.functionBridges, [bridge.id]: { ...s.functionBridges?.[bridge.id], ...patch } } }));
  // Saída certa é pré-condição, não aprovação: a resposta escrita à mão produz a mesma saída
  // sem usar a função que a ponte existe para ensinar.
  const run = () => python.run(code, bridge.stdin, result => {
    const bate = result.ok && result.output.trim() === bridge.expected.trim();
    const pendentes = bate ? requisitosFaltando(bridge, code) : [];
    const cumpriu = bate && (!pendentes.length || (aprovacao?.cumpre === true && aprovacao.codigo === code));
    setSaidaOk(bate); setFaltando(pendentes);
    setMismatch(result.ok && !bate ? result.output : null);
    setFeedback(!result.ok ? 'Leia a última linha do erro e mude uma coisa por vez.'
      : cumpriu ? 'Saída correta e objetivo cumprido. Agora responda a pergunta para fechar a ponte.'
      : bate ? 'A saída está certa, mas o objetivo da ponte ainda não foi cumprido — veja abaixo.'
      : 'Executou, mas a saída ficou diferente.');
    setFails(n => cumpriu ? 0 : n + 1);
    if (cumpriu) { save({ passed: true, code }); setCelebrate(n => n + 1); }
  });
  const [previsto, setPrevisto] = useState('');
  const preverExemplo = () => python.run(bridge.example, bridge.exampleStdin || '', resultado => {
    if (!resultado.ok) return setPrevisto('');
    setPrevisto(predictionMatches(record.previsao, resultado.output) ? 'certa' : 'diferente');
  });
  const answered = Number.isInteger(record.answered) ? record.answered : null;
  return <>
    <button className="text-button back" disabled={python.busy} onClick={back}><Icon name="ArrowLeft" size={16} /> Voltar para as pontes</button>
    <div className="page-heading">
      <div className="lesson-title">
        <span className="icon-tile blue"><Icon name="Footprints" size={25} /></span>
        <div><div className="eyebrow">PONTE DE FUNÇÃO {String(functionBridges.indexOf(bridge) + 1).padStart(2, '0')} DE {functionBridges.length}</div><h1>{bridge.title}</h1></div>
      </div>
    </div>
    <section className="card bridge-work">
      <div className="step-head"><span className="icon-tile purple"><Icon name="Lightbulb" size={21} /></span><div><div className="eyebrow">A IDEIA, EM UMA VEZ SÓ</div><h3>Entenda antes de escrever</h3></div></div>
      <p className="bridge-concept">{bridge.concept}</p>
      <p className="small">Exemplo pronto, para ler antes de tentar:</p>
      <pre className="example-code">{bridge.example}</pre>
      <label className="practice-field">O que este exemplo vai mostrar? Escreva antes de executar.
        <textarea aria-label="Minha previsão da saída do exemplo" maxLength={400} value={record.previsao || ''}
          onChange={event => { save({ previsao: event.target.value }); setPrevisto(''); }} placeholder="Eu acho que vai aparecer…" />
      </label>
      <div className="button-row">
        <button className="button outline" disabled={python.busy || !String(record.previsao || '').trim()} onClick={preverExemplo}>
          <Icon name="Play" size={15} /> Executar o exemplo e comparar
        </button>
      </div>
      {previsto && <p role="status" className={previsto === 'certa' ? 'success-text' : 'muted'}>{previsto === 'certa'
        ? 'Você previu certo. Isso é sinal de que já entendeu o mecanismo — agora escreva o seu.'
        : 'Sua previsão ficou diferente da saída. Compare as duas acima e procure a linha que explica a diferença: é aí que o aprendizado gruda.'}</p>}
      <p className="small">Errar a previsão não trava nada e não tira ponto. Ela existe para você descobrir o que ainda não sabia.</p>
      <div className="step-head"><span className={`icon-tile ${record.passed ? 'teal' : 'orange'}`}><Icon name={record.passed ? 'CheckCircle2' : 'SquareTerminal'} size={21} /></span><div><div className="eyebrow">SUA VEZ</div><h3>Escreva você</h3></div></div>
      <p className="bridge-challenge">{bridge.challenge}</p>
      <div className="expected"><span>SAÍDA ESPERADA</span><pre>{bridge.expected}</pre></div>
      {bridge.stdin && <p className="small">Neste teste, responda <strong>{bridge.stdin.split('\n').join(', ')}</strong> quando o programa perguntar.</p>}
      <CodeEditor code={code} onChange={value => { setCode(value); setFeedback(''); setMismatch(null); setSaidaOk(false); setFaltando([]); }} busy={python.busy} onRun={run} onStop={python.stop} output={python.output} success={python.success} celebrate={celebrate} filename="ponte.py" runLabel="Testar minha ponte" emptyOutput="Escreva e teste. Esta ponte é curta de propósito." />
      {feedback && <p className="practice-feedback" role="status">{feedback}</p>}
      {python.success === false && <ErrorHelp output={python.output} code={code} />}
      {saidaOk && <CodeReview lesson={{ ...bridge, objective: bridge.concept }} codigo={code} saida={python.output} faltando={faltando} aprovacao={aprovacao} onAprovacao={setAprovacao} />}
      {mismatch !== null && <OutputCompare actual={mismatch} expected={bridge.expected} />}
      {fails > 0 && <Mentor attempts={fails} title={`Ponte de função: ${bridge.title}`} challenge={bridge.challenge} expected={bridge.expected} code={code} output={python.output} lessonId="funcoes" />}
      <button className="text-button" disabled={hints >= bridge.hints.length} onClick={() => setHints(n => n + 1)}><Icon name="Lightbulb" size={15} /> {hints ? 'Preciso de mais uma pista' : 'Me dê uma pista'}</button>
      <button className="text-button" onClick={() => setPuzzle(!puzzle)}><Icon name="Boxes" size={15} /> {puzzle ? 'Fechar o quebra-cabeça' : 'Travou? Monte o código embaralhado'}</button>
      {bridge.hints.slice(0, hints).map((hint, index) => <p className="hint" key={index}><strong>Pista {index + 1}:</strong> {hint}</p>)}
      {puzzle && <ParsonsPuzzle item={bridge} />}
    </section>
    <section className="card bridge-quiz">
      <div className="step-head"><span className={`icon-tile ${record.quizCorrect ? 'teal' : 'yellow'}`}><Icon name={record.quizCorrect ? 'CheckCircle2' : 'Target'} size={21} /></span><div><div className="eyebrow">FECHAR A PONTE</div><h3>{bridge.question}</h3></div></div>
      {bridge.options.map((option, index) => <label className={`answer ${answered === index ? 'selected' : ''}`} key={option}>
        <input type="radio" name={`bridge-${bridge.id}`} checked={answered === index} onChange={() => save({ answered: index, quizCorrect: index === bridge.answer })} />
        <span>{String.fromCharCode(65 + index)}</span>{option}
      </label>)}
      {answered !== null && <p className={answered === bridge.answer ? 'success-text' : 'error-text'} role="status">{answered === bridge.answer ? 'Isso mesmo.' : 'Ainda não. Releia a ideia no topo e o exemplo, e escolha outra alternativa.'}</p>}
      {/* Explicar com as próprias palavras é o que separa reconhecer de saber. O Lumi lê e
          comenta; a etapa continua sendo liberada por código e prova, nunca por este texto. */}
      <label className="practice-field">Explique, sem consultar, por que sua solução funciona.
        <textarea aria-label="Minha explicação da ponte" maxLength={1200} value={record.explicacao || ''}
          onChange={event => save({ explicacao: event.target.value })} placeholder="Eu pensei assim…" />
      </label>
      <ExplainReview subject={`Ponte de função: ${bridge.title} — ${bridge.concept}`} reference={code} explanation={record.explicacao || ''} />
      <ul className="practice-checklist">
        <li className={record.passed ? 'done' : ''}><Icon name={record.passed ? 'CheckCircle2' : 'Circle'} size={16} /> Código com a saída esperada</li>
        <li className={record.quizCorrect ? 'done' : ''}><Icon name={record.quizCorrect ? 'CheckCircle2' : 'Circle'} size={16} /> Pergunta respondida corretamente</li>
      </ul>
      {bridgeDone(state, bridge.id) && <p className="success-text" role="status">Ponte concluída. Ela conta para liberar a próxima etapa.</p>}
      {bridgeDone(state, bridge.id) && <div className="practice-onde-agora">
        <h3>Para onde agora</h3>
        <div className="button-row">
          {proxima
            ? <button className="button primary" onClick={() => irPara(proxima)}>Próxima ponte: {proxima.title} <Icon name="ArrowRight" size={16} /></button>
            : <button className="button primary" onClick={back}>Ver todas as pontes <Icon name="ArrowRight" size={16} /></button>}
          <button className="text-button" onClick={back}><Icon name="ArrowLeft" size={15} /> Voltar para as pontes</button>
        </div>
      </div>}
    </section></>;
}

export default function FunctionBridges({ state, update, openLesson }) {
  const [selected, setSelected] = useState(null);
  const lesson = lessons.find(l => l.id === 'funcoes');
  const unlocked = state.completed.includes('funcoes');
  const done = bridgesDone(state);
  if (selected) return <Bridge key={selected.id} bridge={selected} state={state} update={update} back={() => setSelected(null)}
    proxima={functionBridges[functionBridges.findIndex(item => item.id === selected.id) + 1] || null} irPara={setSelected} />;
  return <section className="card bridges-panel">
    <div className="step-head">
      <span className="icon-tile blue"><Icon name="Footprints" size={22} /></span>
      <div><div className="eyebrow">ANTES DO PROJETO QUIZ</div><h2>Pontes de função</h2></div>
      <span className={`pill ${done === functionBridges.length ? 'teal' : 'blue'}`}>{done}/{functionBridges.length} feitas</span>
    </div>
    <p>Oito passos curtos entre “criar uma função” e “uma função que pergunta, compara e devolve um ponto”. Cada ponte acrescenta <strong>uma</strong> novidade: chamar, devolver, receber um valor, receber dois, comparar, escolher o que devolver, perguntar e somar retornos. São elas que preparam o projeto do quiz, e contam para liberar a etapa 03.</p>
    {!unlocked && <p className="bridges-locked"><Icon name="LockKeyhole" size={14} /> <span>As pontes abrem depois da aula <strong>{lesson.title}</strong>.</span> <button className="text-button" onClick={() => openLesson('funcoes')}>Abrir a aula</button></p>}
    <ol className="bridges-list">{functionBridges.map((bridge, index) => {
      const ready = bridgeDone(state, bridge.id);
      return <li key={bridge.id}>
        <button disabled={!unlocked} onClick={() => setSelected(bridge)}>
          <span className={`bridge-number ${ready ? 'done' : ''}`}>{ready ? <Icon name="Check" size={15} /> : unlocked ? String(index + 1).padStart(2, '0') : <Icon name="LockKeyhole" size={13} />}</span>
          <span className="bridge-name">{bridge.title}<small>{bridge.concept.split('. ')[0]}.</small></span>
          <Icon name="ArrowRight" size={15} />
        </button>
      </li>;
    })}</ol>
  </section>;
}
