import { useState } from 'react';
import { Icon } from './ui.jsx';
import { diagnose, patterns, levelDate, levelsDone, levelOpen, completeLevel, saveExplanation, saveReview, masteryState, masteredCount, readyForReview, RETENTION_DAYS } from './diagnosis.js';
import CustomLesson from './CustomLesson.jsx';
import ExplainReview from './ExplainReview.jsx';
import { lessons } from './curriculum.js';
import { localDate } from './progress.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import CodeEditor from './CodeEditor.jsx';
import { ErrorHelp, OutputCompare } from './RunFeedback.jsx';
import './targeted.css';

const dayLabel = value => { const date = new Date(value?.length === 10 ? `${value}T12:00:00` : value); return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }); };

function PredictLevel({ level, done, onDone }) {
  const [choice, setChoice] = useState(null);
  const right = choice === level.answer;
  return <>
    <pre className="example-code">{level.code}</pre>
    {level.options.map((option, index) => <label className={`answer ${choice === index ? 'selected' : ''}`} key={option}><input type="radio" name={`predict-${level.pattern || level.id}`} checked={choice === index} onChange={() => { setChoice(index); if (index === level.answer && !done) onDone(); }} /><span>{String.fromCharCode(65 + index)}</span>{option}</label>)}
    {choice !== null && <p className={right ? 'success-text' : 'error-text'} role="status">{right ? `Isso mesmo. ${level.why}` : 'Ainda não. Leia o código linha por linha e escolha outra alternativa.'}</p>}
  </>;
}

function CodeLevel({ patternId, level, done, onDone, update }) {
  const [code, setCode] = useState(level.kind === 'fix' ? level.broken : `# ${level.instruction}\n`);
  const [feedback, setFeedback] = useState(''), [mismatch, setMismatch] = useState(null);
  const python = usePython({ source: 'playground', title: `Treino dirigido · ${patternId} · nível ${level.level}`, expected: level.expected, onRecord: attempt => update(s => appendAttempt(s, attempt)) });
  const run = () => python.run(code, level.stdin, result => {
    const match = result.ok && result.output.trim() === level.expected.trim();
    setMismatch(result.ok && !match ? result.output : null);
    setFeedback(!result.ok ? 'Leia a última linha do erro e mude uma coisa por vez.' : match ? 'Nível resolvido.' : 'Executou, mas a saída ficou diferente.');
    if (match && !done) onDone();
  });
  return <>
    <div className="expected"><span>SAÍDA ESPERADA</span><pre>{level.expected}</pre></div>
    {level.stdin && <p className="small">Neste treino, as respostas <strong>{level.stdin.split('\n').join(', ')}</strong> são enviadas automaticamente aos input(). Você não precisa digitá-las.</p>}
    <CodeEditor code={code} onChange={value => { setCode(value); setFeedback(''); setMismatch(null); }} busy={python.busy} onRun={run} onStop={python.stop} output={python.output} success={python.success} filename="treino.py" runLabel="Testar meu treino" emptyOutput="Escreva e teste. Este treino é curto de propósito." />
    {feedback && <p className="practice-feedback" role="status">{feedback}</p>}
    {python.success === false && <ErrorHelp output={python.output} />}
    {mismatch !== null && <OutputCompare actual={mismatch} expected={level.expected} />}
  </>;
}

function PatternCard({ item, state, update, openLesson, open, setOpen }) {
  const lesson = lessons.find(l => l.id === item.lesson);
  const done = levelsDone(state, item.id);
  const mastery = masteryState(state, item.id);
  const [level, setLevel] = useState(() => item.levels.find(l => !levelDate(state, item.id, l.id)) || item.levels.at(-1));
  const [showLesson, setShowLesson] = useState(false);
  const isOpen = open === item.id;
  const finish = levelId => update(s => completeLevel(s, item.id, levelId, localDate()));
  return <section className={`card targeted-card ${item.count ? '' : 'is-quiet'} ${mastery.mastered ? 'is-mastered' : ''} ${isOpen || showLesson ? 'is-open' : ''}`}>
    <div className="targeted-head">
      <div className={`icon-tile ${mastery.mastered ? 'teal' : item.count ? 'orange' : 'purple'}`}><Icon name={mastery.mastered ? 'Trophy' : item.count ? 'Flame' : 'Sprout'} size={22} /></div>
      <div>
        <div className="targeted-tags">
          {item.count ? <span className="pill orange">{item.count} {item.count === 1 ? 'tentativa' : 'tentativas'}</span> : <span className="pill purple">sem registro seu</span>}
          <span className={`pill ${done === item.levels.length ? 'teal' : 'blue'}`}>nível {Math.min(done + (done === item.levels.length ? 0 : 1), item.levels.length)} de {item.levels.length}</span>
          {mastery.mastered && <span className="pill teal"><Icon name="Check" size={12} /> dominado</span>}
        </div>
        <h2>{item.title}</h2>
      </div>
    </div>
    <p>{item.summary}</p>
    {item.evidence && <div className="targeted-evidence"><span>SUA LINHA, EM {dayLabel(item.evidence.at).toUpperCase()} · {item.evidence.title}</span><pre>{item.evidence.line}</pre></div>}
    <div className="targeted-actions">
      <button className="button outline" onClick={() => setOpen(isOpen ? null : item.id)}><Icon name="Hammer" size={15} /> {isOpen ? 'Fechar os níveis' : 'Abrir os níveis'}</button>
      <button className="button outline" onClick={() => setShowLesson(!showLesson)}><Icon name="Sparkles" size={15} /> {showLesson ? 'Fechar a lição do Lumi' : 'Lição do Lumi para este engano'}</button>
      {lesson && <button className="text-button" onClick={() => openLesson(lesson.id)}><Icon name="BookOpen" size={15} /> Rever {lesson.title}</button>}
    </div>
    {showLesson && <CustomLesson weakness={item} evidence={item.evidence?.line || ''} lessonId={item.lesson} state={state} update={update} />}
    {isOpen && <>
      <div className="level-ladder tab-row" aria-label="Níveis deste padrão">{item.levels.map(step => {
        const stepDone = levelDate(state, item.id, step.id), unlocked = levelOpen(state, item.id, step);
        return <button key={step.id} disabled={!unlocked} aria-pressed={level.id === step.id} className={level.id === step.id ? 'active' : ''} onClick={() => setLevel(step)}>
          <Icon name={stepDone ? 'CheckCircle2' : unlocked ? 'Circle' : 'LockKeyhole'} size={14} className={stepDone ? 'step-check' : ''} />
          Nível {step.level} · {step.title}
        </button>;
      })}</div>
      <div className="level-body">
        <p className="level-instruction">{level.instruction}</p>
        {!levelOpen(state, item.id, level)
          ? <p className="small">Resolva o nível anterior para abrir este.</p>
          : level.kind === 'predict'
            // A key força um componente novo por nível: sem ela, o código do nível anterior
            // continuaria no editor e entregaria a resposta do nível seguinte.
            ? <PredictLevel key={`${item.id}:${level.id}`} level={{ ...level, pattern: item.id }} done={Boolean(levelDate(state, item.id, level.id))} onDone={() => finish(level.id)} />
            : <CodeLevel key={`${item.id}:${level.id}`} patternId={item.id} level={level} done={Boolean(levelDate(state, item.id, level.id))} onDone={() => finish(level.id)} update={update} />}
        {levelDate(state, item.id, level.id) && <p className="small"><Icon name="CheckCircle2" size={14} className="step-check" /> Resolvido em {dayLabel(levelDate(state, item.id, level.id))}.{level.id === 'criar' && !mastery.steps[1].done && ` Volte a este nível daqui a ${RETENTION_DAYS} dias e resolva de novo, sem consultar: é o que mostra que ficou.`}</p>}
      </div>
      <div className="mastery-panel">
        <h3><Icon name="Target" size={17} /> Para considerar dominado</h3>
        <ul className="practice-checklist">{mastery.steps.map(step => <li key={step.id} className={step.done ? 'done' : ''}><Icon name={step.done ? 'CheckCircle2' : 'Circle'} size={16} /> {step.label}</li>)}</ul>
        <label className="practice-field">Explique com suas palavras o engano e como evitá-lo<textarea maxLength={2000} value={mastery.note} onChange={e => update(s => saveExplanation(s, item.id, e.target.value))} placeholder="O engano era… agora eu faço assim porque…" /></label>
        <ExplainReview subject={`Explicar o engano: ${item.title}`} reference={item.summary} enunciado={item.summary} explanation={mastery.note} />
        <p className="small">Este texto é guardado para revisão externa e entra no relatório do diário. A plataforma não julga se ele demonstra domínio.</p>
        {mastery.review && <p className={mastery.review.verdict === 'dominado' ? 'success-text' : 'muted'} role="status">Revisão registrada em {dayLabel(mastery.review.at)}: {mastery.review.verdict === 'dominado' ? 'dominado' : 'praticar mais'}.</p>}
        <div className="tab-row">
          <button onClick={() => update(s => saveReview(s, item.id, 'dominado', localDate()))}>Registrar: a Astra avaliou como dominado</button>
          <button onClick={() => update(s => saveReview(s, item.id, 'praticar', localDate()))}>Registrar: preciso praticar mais</button>
          {mastery.review && <button onClick={() => update(s => saveReview(s, item.id, null, ''))}>Apagar registro</button>}
        </div>
      </div>
    </>}
  </section>;
}

export default function TargetedPractice({ state, update, openLesson }) {
  const found = diagnose(state.history);
  const [open, setOpen] = useState(found[0]?.id || null);
  const untouched = patterns.filter(p => !found.some(item => item.id === p.id));
  const cards = [...found, ...untouched.map(p => ({ ...p, count: 0, evidence: null }))];
  const pending = readyForReview(state);
  return <>
    <div className="page-heading">
      <div className="lesson-title">
        <span className="icon-tile orange"><Icon name="Target" size={25} /></span>
        <div><div className="eyebrow">A PARTIR DO SEU DIÁRIO</div><h1>Treino dirigido</h1><p><Icon name="BookOpenCheck" size={15} /> {state.history?.length || 0} tentativas registradas <span>·</span> {found.length} padrões encontrados <span>·</span> {masteredCount(state)} dominados</p></div>
      </div>
    </div>
    <p className="targeted-intro"><Icon name="Info" size={15} /> Esta aba lê as tentativas guardadas no seu Diário de aprendizagem e procura enganos que se repetiram. Cada padrão tem três níveis, do reconhecer ao criar do zero, e mostra a sua própria linha que o disparou. É uma leitura por regras, não um julgamento de domínio.</p>
    {pending.length > 0 && <p className="targeted-review-note"><Icon name="Sparkles" size={15} /> {pending.length === 1 ? 'Um padrão está' : `${pending.length} padrões estão`} com os três níveis, a retenção e a explicação em ordem, esperando revisão externa: baixe o relatório em Diário de aprendizagem e me mostre para eu avaliar as explicações.</p>}
    {!state.history?.length && <p className="targeted-empty">Seu diário ainda está vazio. Execute código nas aulas e no laboratório: os padrões aparecem aqui conforme você pratica.</p>}
    <div className="targeted-list">{cards.map(item => <PatternCard key={item.id} item={item} state={state} update={update} openLesson={openLesson} open={open} setOpen={setOpen} />)}</div>
  </>;
}
