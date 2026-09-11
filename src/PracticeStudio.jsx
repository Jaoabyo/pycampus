import { useEffect, useRef, useState } from 'react';
import { Icon, Progress } from './ui.jsx';
import { practiceProjects, nextReview, reviewInterval, soloIntervals, practiceSteps, practiceDone, practiceXp, predictionMatches } from './practice-content.js';
import { lessons, modules } from './curriculum.js';
import { practiceIsOpen, blockingSummary, moduleIndexForLesson } from './progression.js';
import { localDate, recordPractice } from './progress.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import CodeEditor from './CodeEditor.jsx';
import ParsonsPuzzle from './ParsonsPuzzle.jsx';
import Mentor from './Mentor.jsx';
import ExplainReview from './ExplainReview.jsx';
import FunctionBridges from './FunctionBridges.jsx';
import { ErrorHelp, StyleTips, OutputCompare } from './RunFeedback.jsx';
import './practice.css';

const stages = [['read', '1 · Preveja', 'Eye'], ['investigate', '2 · Investigue', 'Search'], ['modify', '3 · Mude', 'Pencil'], ['create', '4 · Crie', 'Sparkles'], ['review', '5 · Confira', 'CheckCircle2']];
const brDate = value => value.split('-').reverse().join('/');
const stageOf = project => modules.find(m => m.id === lessons.find(l => l.id === project.prerequisite)?.moduleId);
const stageColor = project => stageOf(project)?.color || 'purple';
const stageCategory = project => stageOf(project)?.category || 'Prática';

// Ilustração da oficina, na mesma família da arte do painel: órbitas, peça de vidro e sinais flutuantes.
function PracticeArt() {
  return <div className="orbit-art practice-art" aria-hidden="true">
    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
    <div className="star s1">✦</div><div className="star s2">✧</div><div className="orbit-dot" />
    <div className="float-code">&lt;/&gt;</div><div className="float-braces">{'{ }'}</div>
    <div className="python-tile practice-tile">
      <div className="art-code"><i /><i /><i /><i /></div>
      <span className="art-lens"><Icon name="Search" size={21} /></span>
    </div>
    <div className="art-caption"><span /> Leia, entenda, mude e então crie</div>
  </div>;
}

export default function PracticeStudio({ state, update, openLesson }) {
  const [selected, setSelected] = useState(null), [filter, setFilter] = useState('ready');
  const due = practiceProjects.filter(p => practiceIsOpen(state, p.id) && nextReview(state.learning?.[p.id]) && nextReview(state.learning[p.id]) <= localDate());
  const trained = practiceProjects.filter(p => practiceDone(state.learning?.[p.id], p));
  const readyProjects = practiceProjects.filter(p => practiceIsOpen(state, p.id));
  const next = due[0] || readyProjects.find(p => !practiceDone(state.learning?.[p.id], p)) || readyProjects[0];
  const select = project => { if (project && practiceIsOpen(state, project.id)) setSelected(project); };
  if (selected && practiceIsOpen(state, selected.id)) return <Practice key={selected.id} project={selected} state={state} update={update} back={() => setSelected(null)} openLesson={openLesson} />;
  return <>
    <section className="hero practice-hero">
      <div className="hero-copy">
        <div className="hero-kicker"><span /> OFICINA DE PRÁTICA</div>
        <h2>Vamos praticar<br /><em>um passo por vez.</em></h2>
        <p>Comece por um exemplo que já funciona, descubra por que ele funciona,<br className="desktop-br" /> mude uma parte e termine escrevendo a sua própria versão.</p>
        {next ? <button className="button hero-button" onClick={() => select(next)}><Icon name="Play" size={16} fill="currentColor" /> {due.length ? 'Fazer a revisão de hoje' : trained.length ? 'Continuar praticando' : 'Começar o primeiro miniprojeto'}<Icon name="ArrowRight" size={17} /></button> : <button className="button hero-button" onClick={() => openLesson('variaveis')}>Estudar variáveis para começar <Icon name="ArrowRight" size={17} /></button>}
        <div className="hero-foot"><Icon name="Hammer" size={14} /> {practiceProjects.length} miniprojetos <span>·</span> +{practiceXp} XP cada <span>·</span> {trained.length} treinados</div>
      </div>
      <PracticeArt />
    </section>
    <div className="section-heading"><h3>Como funciona cada miniprojeto</h3><span className="pill purple">5 passos curtos</span></div>
    <ol className="practice-flow">{[['Eye', 'Preveja', 'Leia o exemplo, anote o que espera e execute para comparar.', 'purple'], ['Search', 'Investigue', 'Olhe o exemplo e explique uma linha com suas palavras.', 'blue'], ['Pencil', 'Mude', 'Troque uma parte pequena e confira o efeito na saída.', 'orange'], ['Sparkles', 'Crie', 'Escreva sua versão. Se travar, peça uma pista.', 'pink'], ['CheckCircle2', 'Confira', 'Depois de programar, responda à prova rápida e conte como pensou.', 'teal']].map(([icon, title, detail, color], i) => <li key={title}>
      <span className={`icon-tile ${color}`}><Icon name={icon} size={22} /></span>
      <span className="flow-number">{String(i + 1).padStart(2, '0')}</span>
      <strong>{title}</strong><span className="flow-detail">{detail}</span>
    </li>)}</ol>
    {/* O texto fica dentro de um span: solto, cada <strong> vira uma coluna do flex e a frase
        se parte em pedaços. */}
    <p className="practice-rule"><Icon name="Info" size={15} /> <span>Cada miniprojeto vale <strong>{practiceXp} XP</strong>, uma única vez, quando a investigação está correta e as etapas de mudar e criar produzem a saída esperada. Acertar só a saída não conta: o objetivo é saber explicar.</span></p>
    <div className="section-heading"><h3>{filter === 'due' ? 'Para revisar hoje' : 'Escolha um miniprojeto'}</h3><div className="tab-row"><button className={filter === 'ready' ? 'active' : ''} onClick={() => setFilter('ready')}>Com o que já estudei ({readyProjects.length})</button><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos ({practiceProjects.length})</button><button className={filter === 'due' ? 'active' : ''} onClick={() => setFilter('due')}>Revisar hoje ({due.length})</button></div></div>
    {filter === 'ready' && !readyProjects.length && <p>Conclua a aula de variáveis para abrir o primeiro miniprojeto. Em Todos, você pode ver as práticas e o que falta para abri-las.</p>}
    <div className="projects-grid">{(filter === 'due' ? due : filter === 'ready' ? readyProjects : practiceProjects).map(p => {
      const item = state.learning?.[p.id], lesson = lessons.find(l => l.id === p.prerequisite);
      const color = stageColor(p), complete = practiceDone(item, p), number = practiceProjects.indexOf(p) + 1;
      const pOpen = practiceIsOpen(state, p.id);
      const blocked = blockingSummary(state, moduleIndexForLesson(p.prerequisite));
      const steps = practiceSteps(item, p).filter(s => s.done).length;
      return <article className="card project-card practice-card" key={p.id}>
        <div className={`project-visual ${color}`}>
          <Icon name={p.icon} size={52} strokeWidth={1.2} />
          <span>MINIPROJETO {String(number).padStart(2, '0')}</span>
          <span className="visual-braces">{'{ }'}</span>
          {complete && <span className="visual-done"><Icon name="Check" size={12} /> treinado</span>}
        </div>
        <div className="project-content">
          <div className="project-tags"><span className={`pill ${color}`}>{stageCategory(p)}</span><span>{complete ? <><Icon name="Trophy" size={13} /> +{practiceXp} XP</> : <><Icon name="Zap" size={13} /> +{practiceXp} XP</>}</span></div>
          <h2>{p.title}</h2>
          <p>{p.story}</p>
          <p className="practice-support"><Icon name="BookOpen" size={13} /> Apoio: {lesson.title}{state.completed.includes(p.prerequisite) ? ' · aula feita' : ''}</p>
          <Progress value={steps / 3 * 100} />
          {!pOpen && <div className="practice-locked"><p><Icon name="LockKeyhole" size={14} /> {blocked || `Conclua a aula ${lesson.title} para começar.`}</p><button className="text-button" onClick={() => openLesson(p.prerequisite)}>Ver aula de apoio <Icon name="BookOpen" size={13} /></button></div>}
          <div className="project-card-footer"><span>{!pOpen ? 'Ainda não liberado' : item?.rating ? `Revisar em ${brDate(nextReview(item))}` : `${steps}/3 conferências`}</span><button className="text-button" disabled={!pOpen} onClick={() => select(p)}>{steps ? 'Continuar' : 'Abrir miniprojeto'} <Icon name="ArrowRight" size={15} /></button></div>
        </div>
      </article>;
    })}</div>
    {filter === 'due' && !due.length && <p>Nenhuma revisão prevista para hoje. Escolha um miniprojeto na aba Todos.</p>}
    {/* As pontes ficavam no topo, e quem chegava agora via oito cadeados antes de qualquer
        coisa que pudesse fazer. Elas vêm depois: só interessam perto do projeto do quiz. */}
    <FunctionBridges state={state} update={update} openLesson={openLesson} />
    <details className="card practice-method"><summary><Icon name="Lightbulb" size={16} /> Por que praticar desse jeito?</summary><p>A sequência prever → investigar → mudar → criar é o método PRIMM, testado em salas de aula: ler e explicar código antes de escrever do zero produz mais aprendizado do que começar na folha em branco.</p><p>As revisões seguem intervalos crescentes ({soloIntervals.join(', ')} dias) a cada vez que você resolve sem consultar, e voltam para o dia seguinte quando precisou de ajuda. Prática espaçada com evocação retém mais do que reler. As datas são sugestões desta plataforma, não uma medida de domínio.</p><a href="https://www.raspberrypi.org/app/uploads/2022/08/Teaching_Programming_with_PRIMM-1.pdf" target="_blank" rel="noreferrer">Ensinar programação com PRIMM · Raspberry Pi Foundation <Icon name="ArrowUpRight" size={13} /></a><br /><a href="https://ies.ed.gov/ncee/wwc/PracticeGuide/1" target="_blank" rel="noreferrer">Prática e revisão ao longo do tempo · IES <Icon name="ArrowUpRight" size={13} /></a></details>
  </>;
}

function Practice({ project: p, state, update, back, openLesson }) {
  const [stage, setStage] = useState('read'), [hint, setHint] = useState(false), [feedback, setFeedback] = useState(''), [ran, setRan] = useState(false), [mismatch, setMismatch] = useState(null), [fails, setFails] = useState(0), [predicted, setPredicted] = useState(''), [puzzle, setPuzzle] = useState(false), [celebrate, setCelebrate] = useState(0);
  const item = state.learning?.[p.id] || {};
  const save = patch => update(s => recordPractice({ ...s, learning: { ...s.learning, [p.id]: { ...s.learning?.[p.id], ...patch } } }, p.id));
  const reading = stage === 'read' || stage === 'investigate';
  const working = stage !== 'review';
  const done = Object.fromEntries(practiceSteps(item, p).map(step => [step.id, step.done]));
  const color = stageColor(p), complete = practiceDone(item, p);
  const code = reading ? p.example : item.codes?.[stage] ?? (stage === 'modify' ? p.example : '# Escreva sua versão aqui.\n');
  const expected = reading ? p.output : stage === 'modify' ? p.modified : p.expected;
  const python = usePython({ source: 'playground', title: `Oficina: ${p.title} · ${stage}`, expected, onRecord: attempt => update(s => appendAttempt(s, attempt)) });
  const changeStage = value => { setStage(value); setFeedback(''); setHint(false); setMismatch(null); setPredicted(''); setPuzzle(false); python.reset(); };
  const changeCode = value => { save({ codes: { ...item.codes, [stage]: value }, passed: (item.passed || []).filter(k => k !== stage) }); setFeedback(''); setMismatch(null); };
  const run = () => python.run(code, '', result => {
    if (stage === 'read') setRan(true);
    const match = result.ok && result.output.trim() === expected.trim();
    // Na etapa 1 quem é avaliado é a previsão escrita, não o exemplo: ele sempre bate consigo
    // mesmo, e comemorar isso era comemorar nada. Errar a previsão não trava nada.
    const guessed = stage === 'read' && result.ok && predictionMatches(item.prediction, result.output);
    setPredicted(stage === 'read' ? (result.ok ? (guessed ? 'certa' : 'diferente') : '') : '');
    setMismatch(result.ok && !match ? result.output : null);
    setFeedback(!result.ok ? 'A tentativa ficou no diário. Leia a última linha do erro; a explicação abaixo mostra o que esse tipo costuma significar.' : stage === 'read' ? (guessed ? 'Você previu certo! Agora vá para Investigue e explique qual linha produziu essa saída.' : item.prediction ? 'Sua previsão ficou diferente da saída — e isso é exatamente o que faz o aprendizado grudar. Compare as duas abaixo e procure a linha que explica a diferença.' : 'Escreva sua previsão antes de executar: prever e comparar ensina mais do que só ler o resultado.') : match ? 'A saída corresponde ao caso proposto. Agora explique como chegou nela; isso ainda não verifica todas as possibilidades do programa.' : 'Executou, mas a saída ficou diferente. A comparação abaixo mostra em qual linha.');
    setFails(n => match ? 0 : n + 1);
    if (stage === 'read' ? guessed : match) setCelebrate(n => n + 1);
    if (stage === 'modify' || stage === 'create') save({ passed: [...new Set([...(item.passed || []).filter(k => k !== stage), ...(match ? [stage] : [])])] });
  });
  return <>
    <button className="text-button back" disabled={python.busy} onClick={back}><Icon name="ArrowLeft" size={16} /> Voltar para a oficina</button>
    <div className="page-heading"><div className="practice-title"><div className={`icon-tile ${color}`}><Icon name={p.icon} size={25} /></div><div><div className="eyebrow">MINIPROJETO · +{practiceXp} XP</div><h1>{p.title}</h1><p>{p.story}</p></div></div><button className="button outline" disabled={python.busy} onClick={() => openLesson(p.prerequisite)}><Icon name="BookOpen" size={16} /> Aula de apoio</button></div>
    <div className="tab-row practice-stage-tabs">{stages.map(([id, label, icon]) => <button key={id} disabled={python.busy} aria-pressed={stage === id} className={stage === id ? 'active' : ''} onClick={() => changeStage(id)}><Icon name={done[id] ? 'CheckCircle2' : icon} size={14} className={done[id] ? 'step-check' : ''} />{label}</button>)}</div>
    {working ? <section className="card practice-work">
      <section className="challenge practice-task">
        <div className="eyebrow"><Icon name={stage === 'read' ? 'Eye' : stage === 'investigate' ? 'Search' : stage === 'modify' ? 'Pencil' : 'Sparkles'} size={16} /> {stage === 'read' ? 'ETAPA 1 · SEM EXECUTAR AINDA' : stage === 'investigate' ? 'ETAPA 2 · ENTENDA O MECANISMO' : stage === 'modify' ? 'ETAPA 3 · MUDE UMA PARTE' : 'ETAPA 4 · AGORA É SUA VEZ'}</div>
        <h3>{stage === 'read' ? 'O que vai aparecer na tela?' : stage === 'investigate' ? 'Por que essa saída aparece?' : stage === 'modify' ? p.modify : p.create}</h3>
        <p>{stage === 'read' ? 'Leia o código de cima para baixo e escreva sua previsão. Não precisa acertar de primeira: prever e comparar é o que faz o aprendizado grudar.' : stage === 'investigate' ? 'Percorra o código linha por linha, com os valores concretos, e explique uma linha com suas palavras. A prova rápida sobre esse mecanismo vem na etapa 5, depois de você programar.' : stage === 'modify' ? 'Uma mudança pequena por vez. Rode e veja o efeito.' : 'Tente escrever uma parte por vez. Peça uma pista se precisar e explique o efeito de cada mudança.'}</p>
        {!reading && <div className="expected"><span>SAÍDA ESPERADA</span><pre>{expected}</pre></div>}
      </section>
      {stage === 'read' && <label className="practice-field">Minha previsão<textarea maxLength={1000} value={item.prediction || ''} onChange={e => save({ prediction: e.target.value })} placeholder="Acho que vai mostrar…" /></label>}
      {stage === 'investigate' && <label className="practice-field">Explique esta linha com suas palavras, sem consultar: <code>{p.investigate.line}</code><textarea maxLength={1500} value={item.notes || ''} onChange={e => save({ notes: e.target.value })} placeholder="Essa linha…" /></label>}
      {stage === 'investigate' && <ExplainReview subject={`Explicar a linha ${p.investigate.line} do miniprojeto ${p.title}`} reference={p.example} explanation={item.notes} />}
      <CodeEditor code={code} onChange={changeCode} busy={python.busy} onRun={run} onStop={python.stop} output={python.output} success={python.success} celebrate={celebrate} inputRequest={python.inputRequest} onReply={python.reply} readOnly={reading} filename={reading ? `exemplo_${p.id}.py` : `meu_${p.id}.py`} runLabel={reading ? 'Executar o exemplo' : 'Executar meu código'} emptyOutput={reading ? 'Escreva sua previsão e execute para comparar.' : 'Execute para ver a saída do seu código.'} />
      {feedback && <p className="practice-feedback" role="status">{feedback}</p>}
      {predicted && item.prediction && <div className={`prediction-compare is-${predicted}`}>
        <div><span>SUA PREVISÃO</span><pre>{item.prediction}</pre></div>
        <div><span>O QUE O PYTHON MOSTROU</span><pre>{python.output}</pre></div>
      </div>}
      {python.success === false && <ErrorHelp output={python.output} />}
      {mismatch !== null && <OutputCompare actual={mismatch} expected={expected} />}
      {fails > 0 && <Mentor attempts={fails} title={p.title} challenge={stage === 'modify' ? p.modify : p.create} expected={expected} code={code} output={python.output} lessonId={p.prerequisite} />}
      <StyleTips code={code} show={python.success === true && !reading} />
      {stage === 'read' && ran && <p className="practice-next"><Icon name="ArrowRight" size={15} /> Agora vá para <strong>Investigue</strong> e explique por que essa saída apareceu.</p>}
      <div className="button-row">{stage !== 'read' && <button className="button outline" disabled={python.busy} onClick={() => changeStage(stages[stages.findIndex(([id]) => id === stage) - 1][0])}>← Etapa anterior</button>}<button className="button primary" disabled={python.busy} onClick={() => changeStage(stages[stages.findIndex(([id]) => id === stage) + 1][0])}>Próxima etapa →</button></div>
      <div className="practice-tools">
        <button className="text-button" onClick={() => setHint(!hint)}><Icon name="Lightbulb" size={15} /> {hint ? 'Esconder a pista' : 'Preciso de uma pista'}</button>
        {stage === 'create' && <button className="button outline" onClick={() => setPuzzle(!puzzle)}><Icon name="Boxes" size={16} /> {puzzle ? 'Fechar o quebra-cabeça' : 'Travou? Monte o código embaralhado'}</button>}
      </div>
      {hint && <p className="hint">{p.hint}</p>}
      {stage === 'create' && puzzle && <ParsonsPuzzle item={p} onSolved={() => save({ puzzled: true })} />}
    </section> : <>
    <section className="card practice-quiz">
      <div className="practice-score-head"><div className={`icon-tile ${done.investigate ? 'teal' : 'yellow'}`}><Icon name={done.investigate ? 'CheckCircle2' : 'Target'} size={24} /></div><div><h2>Prova rápida</h2><p className="small">Sobre o mecanismo do exemplo que você investigou na etapa 2. Responda de memória, sem voltar para o código.</p></div></div>
      <p className="practice-question">{p.investigate.question}</p>
      {p.investigate.options.map((option, i) => <label className={`answer ${item.answered === i ? 'selected' : ''}`} key={option}><input type="radio" name={`investigate-${p.id}`} checked={item.answered === i} onChange={() => save({ answered: i })} /><span>{String.fromCharCode(65 + i)}</span>{option}</label>)}
      {item.answered != null && <p className={item.answered === p.investigate.answer ? 'success-text' : 'error-text'} role="status">{item.answered === p.investigate.answer ? `Isso mesmo. ${p.investigate.why}` : 'Ainda não. Volte à etapa Investigue, percorra o código com os valores concretos e tente outra alternativa.'}</p>}
      <div className="step-head" style={{ marginTop: 22 }}><span className="icon-tile blue"><Icon name="Code2" size={21} /></span><div><div className="eyebrow">SEU CÓDIGO, LOGO ACIMA</div><h3>O que você escreveu na etapa Crie</h3></div></div>
      <pre className="example-code">{item.codes?.create || '# Você ainda não escreveu nada na etapa 4 · Crie.'}</pre>
      <label className="practice-field">Escolha uma linha do código acima e explique o que ela faz. O que mudaria na saída se você trocasse um valor?<textarea maxLength={1500} value={item.reflection || ''} onChange={e => save({ reflection: e.target.value })} placeholder="Nesta linha eu… Se eu mudar…" /></label>
      <ExplainReview subject={`Reflexão sobre o miniprojeto ${p.title}`} reference={item.codes?.create || p.example} explanation={item.reflection} />
    </section>
    <section className={`card practice-score ${complete ? 'is-complete' : ''}`} aria-live="polite">
      <div className="practice-score-head"><div className={`icon-tile ${complete ? 'teal' : color}`}><Icon name={complete ? 'Trophy' : 'Target'} size={24} /></div><div><h2>{complete ? `Miniprojeto treinado · +${practiceXp} XP` : `Como ganhar os ${practiceXp} XP`}</h2><p className="small">{complete ? 'Os XP já estão no seu nível e o dia conta na sua sequência. Rever depois não remove nem duplica pontos.' : 'Acertar só a saída não conta: a prova rápida existe para você saber explicar o porquê.'}</p></div></div>
      <ul className="practice-checklist">{practiceSteps(item, p).map(step => <li key={step.id} className={step.done ? 'done' : ''}><Icon name={step.done ? 'CheckCircle2' : 'Circle'} size={17} /> {step.label}</li>)}</ul>
      {item.puzzled && <p className="small"><Icon name="Boxes" size={14} /> Montar as linhas também é prática. Agora experimente escrever sua versão com esse apoio.</p>}
      <p>Como foi desta vez? Seu relato agenda a próxima revisão e não concede um certificado de domínio.</p>
      <div className="tab-row"><button onClick={() => save({ rating: 'help', reviewed: localDate(), streak: 0 })}><Icon name="Lightbulb" size={14} /> Precisei de ajuda · rever amanhã</button><button onClick={() => save({ rating: 'solo', reviewed: localDate(), streak: (item.streak || 0) + 1 })}><Icon name="Zap" size={14} /> Consegui sem consultar · rever em {reviewInterval(item, 'solo')} dias</button></div>
      {item.rating && <p role="status">Relato salvo. Próxima revisão sugerida: {brDate(nextReview(item))}.</p>}
      <p className="small">Cada acerto sem consultar afasta a próxima revisão ({soloIntervals.join(' → ')} dias); precisar de ajuda traz de volta para amanhã. Código, previsão e explicações ficam salvos neste navegador e no backup. As execuções aparecem no Diário de aprendizagem.</p>
    </section></>}
  </>;
}
