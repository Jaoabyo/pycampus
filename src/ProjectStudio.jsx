import { useState } from 'react';
import { Icon, irAoTopo } from './ui.jsx';
import { lessons } from './curriculum.js';
import { stepsFor, fileNameFor } from './project-steps.js';
import { pendingStageWork, explicaTrabalho } from './progression.js';
import { localDate } from './progress.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { appendLumiNote } from './lumi-notes.js';
import CodeEditor, { interativo } from './CodeEditor.jsx';
import { ErrorHelp, OutputCompare } from './RunFeedback.jsx';
import CodeReview from './CodeReview.jsx';
import { ProjectPreparation } from './LessonGuidance.jsx';
import ProjectDelivery from './ProjectDelivery.jsx';
import Mentor from './Mentor.jsx';
import ExplainReview from './ExplainReview.jsx';
import './project-studio.css';
import './lesson.css';
import './practice.css';

// Um projeto não pertence a uma aula, e sim a uma etapa inteira: o Lumi pode se apoiar em
// tudo que foi ensinado até o fim do módulo dele.
// O passo já sabe o que responder; 'pergunta' e 'conversao' da calculadora usam 1200, como diz a dica.
const respostasDoPasso = passo => passo.stdin || '';

const lastLessonOfModule = index => lessons.filter(lesson => Number(lesson.moduleNumber) <= index + 1).at(-1)?.id || '';

export default function ProjectStudio({ project, state, update, back, openLesson, download, navigate, openProject }) {
  const steps = stepsFor(project.id);
  const [phase, setPhase] = useState('build');
  const [current, setCurrent] = useState(() => {
    const saved = steps.findIndex(s => s.id === state.projectPositions?.[project.id]);
    if (saved >= 0) return saved;
    const next = steps.findIndex(s => !state.projectStepsDone?.[project.id]?.includes(s.id));
    return next < 0 ? steps.length - 1 : next;
  });
  const [feedback, setFeedback] = useState(''), [mismatch, setMismatch] = useState(null), [hints, setHints] = useState(0), [fails, setFails] = useState(0), [saidaOk, setSaidaOk] = useState(false), [stdin, setStdin] = useState(() => interativo ? '' : respostasDoPasso(steps[current])), [checkedRun, setCheckedRun] = useState(false), [manualCheck, setManualCheck] = useState(false), [celebrate, setCelebrate] = useState(0);
  const [aprovacao, setAprovacao] = useState(null), [registro, setRegistro] = useState('');
  const step = steps[current], done = state.projectStepsDone?.[project.id] || [];
  const file = fileNameFor(project.id);
  const code = state.projectCodes?.[project.id] ?? `# ${project.title}\n# Escreva uma instrução de cada vez.\n`;
  const note = state.projectNotes?.[project.id]?.[step.id]?.answer || '';
  const exact = typeof step.expected === 'string';
  const inBrowser = step.mode === 'browser';
  const python = usePython({ source: 'playground', title: `Projeto: ${project.title} · ${step.title}`, expected: exact ? step.expected : undefined, onRecord: attempt => update(s => appendAttempt(s, attempt)) });
  const setCode = value => { update(s => ({ ...s, projectCodes: { ...s.projectCodes, [project.id]: value } })); setFeedback(''); setMismatch(null); setCheckedRun(false); setManualCheck(false); setRegistro(''); };
  const saveNote = answer => update(s => ({ ...s, projectNotes: { ...s.projectNotes, [project.id]: { ...s.projectNotes?.[project.id], [step.id]: { answer } } } }));
  const go = index => { irAoTopo(); setRegistro(''); setCurrent(index); setHints(0); setStdin(interativo ? '' : respostasDoPasso(steps[index])); setFeedback(''); setMismatch(null); setCheckedRun(false); setManualCheck(false); python.reset(); update(s => ({ ...s, projectPositions: { ...s.projectPositions, [project.id]: steps[index].id } })); };
  const run = () => { setFeedback(''); setCheckedRun(false); setMismatch(null); python.run(code, stdin, result => {
    const match = result.ok && (!exact || result.output.trim() === step.expected.trim());
    setCheckedRun(match);
    setFails(n => match ? 0 : n + 1);
    setMismatch(result.ok && exact && !match ? result.output : null);
    setFeedback(!result.ok ? 'Vamos olhar o erro. A ajuda abaixo indica por onde começar.' : match ? exact ? 'A saída corresponde a este caso. Agora me conte como você chegou nela.' : 'O código executou. Faça a conferência indicada abaixo antes de registrar o passo.' : 'A saída ficou diferente. Confira os valores e tente uma mudança por vez.');
    if (match) setCelebrate(n => n + 1);
    setSaidaOk(match && inBrowser);
  }); };
  // O botão ficava desabilitado por três motivos diferentes e nenhum aparecia na tela: o
  // estudante clicava e nada acontecia. A mesma lista que trava o registro agora é mostrada.
  const conferencia = [
    inBrowser && { id: 'run', feito: checkedRun, texto: exact ? 'Executar e conferir a saída deste caso' : 'Executar o que você escreveu' },
    { id: 'nota', feito: Boolean(note.trim()), texto: 'Escrever sua explicação no campo acima' },
    { id: 'check', feito: manualCheck, texto: 'Marcar que fez a conferência indicada' }
  ].filter(Boolean);
  const pendencias = conferencia.filter(item => !item.feito);
  const register = () => {
    if (pendencias.length || python.busy) return;
    // Registrar um passo é estudo do dia: sem isto, um dia inteiro de projeto não aparecia
    // na sequência, no calendário nem na meta diária.
    const hoje = localDate();
    update(s => ({ ...s,
      projectStepsDone: { ...s.projectStepsDone, [project.id]: [...new Set([...(s.projectStepsDone?.[project.id] || []), step.id])] },
      activities: { ...s.activities, [hoje]: [...new Set([...(s.activities?.[hoje] || []), `passo:${project.id}:${step.id}`])] } }));
    // A confirmação ficava lá em cima, junto do editor: a 725px do botão, fora da tela de quem
    // acabou de clicar. Ele clicava, nada mudava à vista dele, e parecia que o botão não pegava.
    setRegistro(current < steps.length - 1
      ? 'Passo registrado. Pode seguir para o próximo.'
      : 'Último passo registrado. A construção está completa.');
    // No celular a confirmação nasce abaixo da dobra, e some do mesmo jeito que sumia antes.
    // O tempo zero espera o React pintar; sem isso o elemento ainda não existe.
    setTimeout(() => document.querySelector('.registro-ok')?.scrollIntoView({ block: 'center', behavior: 'instant' }), 0);
  };
  return <><button className="text-button back" disabled={python.busy} onClick={back}><Icon name="ArrowLeft" size={16} /> Voltar para os projetos</button><div className="page-heading"><div><div className="eyebrow">CONSTRUA COM ORIENTAÇÃO</div><h1>{project.title}</h1><p>{done.length} de {steps.length} passos registrados · seu código e suas respostas ficam salvos</p></div></div>
    <section className="card studio-progress"><div><div className="eyebrow">SEU ROTEIRO DE CONSTRUÇÃO</div><strong>{done.length === steps.length ? 'Construção registrada. Agora entregue seu projeto.' : `Você está no passo ${current + 1}: ${step.title}`}</strong><span>{done.length === steps.length ? 'A entrega reúne README, GitHub e a conferência final.' : `${steps.length - done.length} ${steps.length - done.length === 1 ? 'passo falta' : 'passos faltam'} para terminar a construção.`}</span></div><div className="studio-progress-track" aria-label={`${done.length} de ${steps.length} passos registrados`}><i style={{ width: `${done.length / steps.length * 100}%` }} /></div><span className="studio-progress-count">{done.length}/{steps.length}</span></section>
    {/* Construir e entregar eram a mesma tela rolável, e isso confundia. Agora são duas. */}
    <div className="tab-row studio-phases" aria-label="Fases do projeto">
      <button aria-pressed={phase === 'build'} className={phase === 'build' ? 'active' : ''} onClick={() => setPhase('build')}><Icon name="Hammer" size={15} /> 1 · Construir<span className="phase-count">{done.length}/{steps.length}</span></button>
      <button aria-pressed={phase === 'deliver'} className={phase === 'deliver' ? 'active' : ''} onClick={() => setPhase('deliver')}><Icon name="Rocket" size={15} /> 2 · Entregar e receber a nota</button>
    </div>
    {phase === 'build' && <>
    {/* Sete botões com o título inteiro ficavam colados de ponta a ponta no computador e viravam
        quatro linhas no celular. O título completo já está logo abaixo, no cabeçalho do passo:
        aqui basta o número, o visto de registrado e o nome só do passo em que ele está. */}
    <div className="studio-steps" aria-label="Passos do projeto">{steps.map((s, i) => {
      const feito = done.includes(s.id), agora = i === current;
      return <button key={s.id} disabled={python.busy} aria-pressed={agora} title={s.title}
        aria-label={`Passo ${i + 1} de ${steps.length}: ${s.title}${feito ? ', registrado' : ''}`}
        className={`studio-step${agora ? ' is-agora' : ''}${feito ? ' is-feito' : ''}`} onClick={() => go(i)}>
        <span className="studio-step-num">{feito ? <Icon name="Check" size={13} /> : i + 1}</span>
        {agora && <span className="studio-step-nome">{s.title}</span>}
      </button>;
    })}</div>
    <details className="card studio-brief"><summary>O que vamos construir e quais aulas ajudam</summary><p>{project.brief}</p><ProjectPreparation project={project} lessons={lessons} openLesson={openLesson} /></details>
    <section className="card studio-work"><div className="eyebrow">PASSO {current + 1} DE {steps.length} · {inBrowser ? 'PRÁTICA NO NAVEGADOR' : step.mode === 'plan' ? 'PLANEJAMENTO' : 'SERVIDOR NO COMPUTADOR'}</div><h2>{step.title}</h2><p className="coach-task">{step.instruction}</p><p>Faça só esta parte agora. Se já começou o projeto, continue no seu código abaixo.</p>
      {step.mode === 'local' && <LocalServerGuide file={file} />}
      <button className="button outline" disabled={hints >= step.hints.length} onClick={() => setHints(n => n + 1)}>{hints ? 'Preciso de mais uma pista' : 'Me dê uma pista'}</button>
      {step.hints.slice(0, hints).map((hint, index) => <p className="hint" key={index}><strong>Pista {index + 1}:</strong> {hint}</p>)}
      {exact && <details className="coach-expected"><summary>Conferir a saída deste teste</summary><pre className="example-code">{step.expected}</pre></details>}
      {step.stdin ? <p className="hint">{interativo ? <>Neste teste, responda <strong>{step.stdin.split(String.fromCharCode(10)).join(', ')}</strong> quando o programa perguntar.</> : <>Já deixei <strong>{step.stdin.split(String.fromCharCode(10)).join(', ')}</strong> preenchido em “Entradas para input()”, abaixo do editor.</>} Use ponto para centavos.</p> : (!interativo && inBrowser && <p className="hint">Se o seu código usar <code>input()</code>, escreva as respostas do teste em “Entradas para input()”, abaixo do editor, uma por linha. Neste endereço o Python não consegue parar para perguntar.</p>)}
      <CodeEditor aoVivo={{ lessonId: lastLessonOfModule(project.module), challenge: step.instruction }} code={code} onChange={setCode} stdin={stdin} setStdin={setStdin} busy={python.busy} onRun={run} onStop={python.stop} output={python.output} success={python.success} celebrate={celebrate} inputRequest={python.inputRequest} onReply={python.reply} filename={file} runDisabled={!inBrowser} runLabel={inBrowser ? 'Testar o que escrevi' : 'Este passo é conferido fora do executor'} emptyOutput="Seu resultado aparece aqui depois de executar." />
      {feedback && <p role="status" className="practice-feedback">{feedback}</p>}{python.success === false && <ErrorHelp output={python.output} code={code} />}{saidaOk && <CodeReview lesson={{ id: step.id, title: step.title, objective: step.why || step.instruction, challenge: step.instruction }} codigo={code} saida={python.output} faltando={[]} aprovacao={aprovacao} onAprovacao={setAprovacao} />}{mismatch !== null && <OutputCompare actual={mismatch} expected={step.expected} />}
      {<Mentor activityId={`project:${project.id}:${step.id}`} lumiNotes={state.lumiNotes} onSaveNote={note => update(s => appendLumiNote(s, note))} attempts={fails} history={state.history} title={`${project.title} · ${step.title}`} challenge={step.instruction} expected={step.expected} code={code} output={python.output} lessonId={lastLessonOfModule(project.module)} screenContext={{
        etapa: `Passo ${current + 1} de ${steps.length} · ${step.title}`, entrada: stdin, feedback,
        perguntaRevisao: step.question, respostaEscrita: note,
        status: `${done.length} de ${steps.length} passos registrados.`,
        pistas: step.hints.slice(0, hints)
      }} />}
      <section className="coach-check"><h3>Vamos conferir juntos</h3><p>{step.check}</p><label className="practice-field">{step.question}<textarea aria-label="Minha explicação do passo" maxLength={2000} value={note} onChange={e => saveNote(e.target.value)} placeholder="Eu pensei assim…" /></label><ExplainReview subject={`${step.title} — ${step.question}`} reference={code} enunciado={step.question} explanation={note} /><label className="coach-confirm"><input type="checkbox" checked={manualCheck} onChange={e => setManualCheck(e.target.checked)} /> Fiz a conferência indicada e registrei o que entendi.</label><p className="small">Sua explicação fica guardada para avaliação posterior. A plataforma não julga automaticamente se o texto demonstra domínio.</p><RegisterGate id={`portao-${step.id}`} conferencia={conferencia} registrado={done.includes(step.id)} /><button className="button primary" aria-describedby={`portao-${step.id}`} disabled={python.busy || pendencias.length > 0} onClick={register}>{done.includes(step.id) ? 'Registrar de novo' : 'Registrar este passo'}</button>{registro && <p className="registro-ok" role="status"><Icon name="CheckCircle2" size={16} /> <span>{registro}</span>{current < steps.length - 1 && <button className="button primary" onClick={() => go(current + 1)}>Ir para o passo {current + 2} <Icon name="ArrowRight" size={15} /></button>}</p>}</section>
      <div className="button-row"><button className="button outline" disabled={current === 0 || python.busy} onClick={() => go(current - 1)}>← Passo anterior</button>{current < steps.length - 1 ? <button className="button primary" disabled={python.busy} onClick={() => go(current + 1)}>Próximo passo →</button> : <button className="button primary" disabled={python.busy} onClick={() => setPhase('deliver')}>Ir para a entrega →</button>}</div><p className="small">As marcações registram sua prática. Os requisitos finais continuam na autoavaliação; passar por uma tela não concede pontos por si só.</p>
    </section>
    </>}
    {phase === 'deliver' && <>
      <ProjectCompletion project={project} state={state} update={update} steps={steps} done={done} onBuild={() => setPhase('build')} />
      <ProjectDelivery project={project} state={state} update={update} download={download} code={code} />
      <NextStep project={project} state={state} steps={steps} done={done} navigate={navigate} openLesson={openLesson} openProject={openProject} />
    </>}
  </>;
}

// O que libera a próxima etapa ficava dentro de um details recolhido: o estudante entregava o
// link e continuava travado sem nenhuma pista do motivo. Agora o que falta fica sempre à vista.
// Depois de concluir, o estudante ficava sem saída: nenhuma tela dizia para onde ir.
function NextStep({ project, state, steps, done, navigate, openLesson, openProject }) {
  const complete = done.length === steps.length && (state.projectGrades?.[project.id]?.aprovado === true
    || state.projectChecks?.[project.id]?.length === project.requirements.length);
  if (!complete) return null;
  const work = pendingStageWork(state);
  const go = () => {
    if (work.kind === 'lesson') openLesson(work.id);
    else if (work.kind === 'practice') navigate('practice');
    else if (work.kind === 'project') openProject(work.id);
    else navigate('badges');
  };
  const explica = explicaTrabalho(work);
  return <section className="card studio-next">
    <div className="step-head">
      <span className="icon-tile purple"><Icon name="Rocket" size={21} /></span>
      <div><div className="eyebrow">PROJETO CONCLUÍDO · PARA ONDE AGORA</div><h3>{work.label}</h3></div>
    </div>
    {/* O rótulo sozinho não diz em que o estudante está entrando. O texto explica antes do clique. */}
    <p>{explica.texto}</p>
    <div className="button-row">
      <button className="button primary" onClick={go}>{explica.botao} <Icon name="ArrowRight" size={16} /></button>
      <button className="text-button" onClick={() => navigate('projects')}>Ver todos os projetos</button>
    </div>
  </section>;
}

function ProjectCompletion({ project, state, update, steps, done, onBuild }) {
  const checks = state.projectChecks?.[project.id] || [];
  const grade = state.projectGrades?.[project.id];
  const stepsLeft = steps.length - done.length;
  const approved = grade?.aprovado === true;
  const selfDone = checks.length === project.requirements.length;
  const complete = stepsLeft === 0 && (approved || selfDone);

  return <section className={`card studio-requirements ${complete ? 'is-complete' : ''}`}>
    <div className="step-head">
      <span className={`icon-tile ${complete ? 'teal' : 'orange'}`}><Icon name={complete ? 'CheckCircle2' : 'Target'} size={21} /></span>
      <div><div className="eyebrow">PARA CONCLUIR ESTE PROJETO · +250 XP</div><h3>{complete ? 'Projeto concluído. A próxima etapa está liberada.' : 'O que ainda falta'}</h3></div>
    </div>
    <ul className="complete-checklist">
      <li className={stepsLeft === 0 ? 'done' : ''}>
        <Icon name={stepsLeft === 0 ? 'CheckCircle2' : 'Circle'} size={16} />
        {stepsLeft === 0 ? `Os ${steps.length} passos da construção estão registrados` : `Registrar ${stepsLeft} ${stepsLeft === 1 ? 'passo' : 'passos'} da construção — ${done.length} de ${steps.length} feitos`}
        {stepsLeft > 0 && <button className="text-button" onClick={onBuild}>voltar para a construção</button>}
      </li>
      <li className={approved || selfDone ? 'done' : ''}>
        <Icon name={approved || selfDone ? 'CheckCircle2' : 'Circle'} size={16} />
        {approved ? `Aprovado pelo Lumi com nota ${grade.nota.toFixed(1)}` : selfDone ? 'Autoavaliação completa' : `Ser aprovado pelo Lumi na entrega, ou marcar os ${project.requirements.length} itens abaixo`}
      </li>
    </ul>
    {!complete && stepsLeft === 0 && !approved && <p className="small">Publicou no GitHub e salvou o link? Peça a avaliação do Lumi na entrega, abaixo — ele lê seu código e dá a nota. Se preferir avaliar você mesmo, marque os itens aqui.</p>}
    <details className="studio-self">
      <summary>Autoavaliação · marque apenas o que você construiu e conferiu</summary>
      <div className="requirements">{project.requirements.map((requirement, index) => <label key={requirement}>
        <input type="checkbox" checked={checks.includes(index)} onChange={() => update(s => {
          const previous = s.projectChecks[project.id] || [];
          return { ...s, projectChecks: { ...s.projectChecks, [project.id]: previous.includes(index) ? previous.filter(i => i !== index) : [...previous, index] } };
        })} />{requirement}
      </label>)}</div>
    </details>
  </section>;
}

function LocalServerGuide({ file }) {
  return <details className="guided-example"><summary>Como passar do código para um servidor local</summary><p>As funções e o SQLite podem ser treinados aqui. O navegador não abre um servidor HTTP. Escreva e baixe o arquivo; siga estes passos no computador.</p><ol className="guided-actions"><li>Crie uma pasta e salve {file} nela. Abra essa pasta no terminal.</li><li>Crie um ambiente separado: <code>python -m venv .venv</code>.</li><li>No Windows, instale os pacotes com <code>.\.venv\Scripts\python -m pip install fastapi uvicorn</code>.</li><li>O aplicativo começa com <code>from fastapi import FastAPI</code> e depois <code>app = FastAPI()</code>. Essas duas linhas importam a ferramenta e criam o aplicativo.</li><li><code>@app.get("/caminho")</code> antes de uma função liga um pedido GET à função. O return da função vira a resposta. Crie primeiro uma rota simples sua e só depois conecte as funções de hábitos.</li><li>Execute <code>.\.venv\Scripts\python -m uvicorn api:app --reload</code>. api é o arquivo api.py; app é o aplicativo que você criou.</li><li>Abra <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">http://127.0.0.1:8000/docs</a>. Use Try it out e Execute para testar cada rota.</li><li>Para receber dados, estude Request Body; para status de erro, Handling Errors, no tutorial abaixo. Compare o código recebido, como 200 ou 404, e o corpo da resposta.</li></ol><a href="https://fastapi.tiangolo.com/tutorial/" target="_blank" rel="noreferrer">Tutorial oficial com cada parte da sintaxe</a><p>Confira os pedidos manualmente e descreva o resultado. A plataforma não executa nem verifica o servidor do seu computador.</p></details>;
}

// Espelha o portão que já existe na oficina de prática (.practice-gate): a lista diz o que
// falta, em vez de deixar um botão cinza sem explicação.
function RegisterGate({ id, conferencia, registrado }) {
  const faltam = conferencia.filter(item => !item.feito).length;
  return <section id={id} className={`practice-gate ${registrado ? 'is-registrado' : faltam ? '' : 'is-ready'}`} aria-live="polite">
    <div className="practice-gate-head">
      <div><span className="eyebrow">{registrado ? 'PASSO REGISTRADO' : 'PARA REGISTRAR ESTE PASSO'}</span>
        <h4>{registrado ? 'Este passo já conta como feito' : faltam ? `Falta ${faltam === 1 ? '1 item' : `${faltam} itens`}` : 'Tudo pronto para registrar'}</h4></div>
      <Icon name={registrado || !faltam ? 'CheckCircle2' : 'CheckCheck'} size={22} />
    </div>
    <ul>{conferencia.map(item => <li key={item.id} className={item.feito ? 'done' : 'pending'}>
      <Icon name={item.feito ? 'CheckCircle2' : 'Circle'} size={18} />
      <span><strong>{item.texto}</strong></span>
    </li>)}</ul>
  </section>;
}
