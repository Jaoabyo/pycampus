import { useState } from 'react';
import { Icon, irAoTopo } from './ui.jsx';
import { unidades, aulasDaUnidade, tarefasDaUnidade, aulasDaFaculdade, tarefasDaFaculdade, diasAteProva, requisitosFaltandoDaFaculdade, proximaAcaoDaFaculdade, planoDeEstudosDaFaculdade } from './faculdade.js';
import { localDate } from './progress.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { appendLumiNote } from './lumi-notes.js';
import CodeEditor from './CodeEditor.jsx';
import { ErrorHelp, OutputCompare } from './RunFeedback.jsx';
import Mentor from './Mentor.jsx';
import './lesson.css';
import './practice.css';
import './project-studio.css';
import './faculdade.css';

// A trilha da disciplina da faculdade, fora das oito etapas e sem trava: o semestre não espera
// o estudante terminar 48 aulas. O progresso daqui não concede XP das etapas nem destrava
// nada — ele conta o dia de estudo, como qualquer outra atividade.

export default function Faculdade({ state, update, navigate }) {
  const [aberta, setAberta] = useState(null);
  const feitas = state.faculdade?.feitas || [];
  if (aberta) return <AulaDaFaculdade key={aberta.id} aula={aberta} state={state} update={update}
    voltar={() => { irAoTopo(); setAberta(null); }} feita={feitas.includes(aberta.id)} />;

  const abrir = aula => { irAoTopo(); setAberta(aula); };
  const total = aulasDaFaculdade.length;
  const pendentes = aulasDaFaculdade.filter(aula => !feitas.includes(aula.id));
  const proximaAcao = proximaAcaoDaFaculdade(state);
  const plano = planoDeEstudosDaFaculdade(state);
  const proxima = proximaAcao.aula;
  const estudadas = proximaAcao.feitas;
  const dias = diasAteProva();
  const ritmo = dias > 0 ? Math.max(1, Math.ceil(pendentes.length / dias)) : pendentes.length;
  return <>
    <section className="hero faculdade-hero">
      <div className="hero-copy">
        <div className="hero-kicker"><span /> LINGUAGEM DE PROGRAMAÇÃO · ANHANGUERA</div>
        <h2>O conteúdo da sua<br />disciplina, <em>rodando.</em></h2>
        <p>As quatro unidades da disciplina em aulas curtas, exemplos executáveis e prática guiada —
          dos primeiros tipos de dados a bancos, testes e machine learning.</p>
        <div className="hero-foot"><Icon name="GraduationCap" size={14} /> {total} aulas <span>·</span> {estudadas} estudadas <span>·</span> {tarefasDaFaculdade.length} tarefas do professor</div>
      </div>
    </section>

    <section className="card prova-plano" aria-labelledby="titulo-plano-prova">
      <div className="prova-plano-topo">
        <div>
          <div className="eyebrow">PLANO ATÉ 27 DE SETEMBRO</div>
          <h3 id="titulo-plano-prova">Preparação para a prova presencial</h3>
          <p>{pendentes.length === 0 ? 'Conteúdo estudado. Agora revise os desafios sem olhar a resposta.'
            : dias > 0 ? `${dias} ${dias === 1 ? 'dia restante' : 'dias restantes'} · faça ${ritmo} ${ritmo === 1 ? 'aula' : 'aulas'} por dia e deixe o último dia para revisão.`
              : 'A data da prova chegou. Priorize os exercícios marcados pelo professor.'}</p>
        </div>
        <div className="prova-medidor" aria-label={`${estudadas} de ${total} aulas estudadas`}>
          <strong>{estudadas}</strong><span>/{total}</span><small>estudadas</small>
        </div>
      </div>
      <div className="prova-progresso" role="progressbar" aria-label="Progresso das aulas da faculdade" aria-valuenow={Math.round(estudadas / total * 100)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${Math.round(estudadas / total * 100)}%` }} /></div>
      {proxima && <div className="prova-proxima">
        <div className="prova-proxima-context">
          <div className="eyebrow">PRÓXIMA AÇÃO</div>
          <strong>{proximaAcao.titulo}</strong>
          <p>{proximaAcao.explicacao}</p>
        </div>
        <button className="button primary prova-acao" aria-label={`${proximaAcao.concluida ? 'Revisar' : 'Estudar'} ${proxima.titulo}`} onClick={() => abrir(proxima)}>
        <span><small>{proximaAcao.concluida ? 'REVISAR' : 'COMECE AGORA'}</small>{proxima.titulo}</span>
        <Icon name="ArrowRight" size={18} />
        </button>
      </div>}
      <p className="small prova-fonte"><Icon name="BookOpen" size={15} /> Conferido nos 8 PDFs: quatro apostilas completas e quatro apresentações que aprofundam a primeira aula de cada unidade.</p>
    </section>

    <section className="card plano-hoje" aria-labelledby="titulo-plano-hoje">
      <div className="step-head"><span className="icon-tile yellow"><Icon name="CalendarDays" size={20} /></span>
        <div><div className="eyebrow">SEU PLANO DE HOJE</div><h3 id="titulo-plano-hoje">Duas aulas curtas, um passo de cada vez</h3></div></div>
      {plano.hoje.tipo === 'revisao' ? <p>Hoje é dia de revisão: refaça um desafio sem olhar a resposta e explique o que o código faz.</p>
        : <><p>Para chegar preparado à prova, estude estas aulas hoje:</p><div className="plano-hoje-lista">{plano.hoje.aulas.map(aula => <button className="plano-hoje-item" key={aula.id} onClick={() => abrir(aula)}><span>{aula.titulo}</span><Icon name="ArrowRight" size={16} /></button>)}</div></>}
      <p className="small muted">O último dia fica reservado para revisar. O plano se ajusta sozinho quando você registra uma aula.</p>
    </section>

    <details className="card como-estudar">
      <summary><Icon name="Sparkles" size={17} /><span><strong>Como estudar aqui sem se perder</strong><small>Um roteiro simples para cada aula</small></span><Icon name="ChevronDown" size={16} /></summary>
      <div className="como-estudar-passos"><p><b>1</b><span><strong>Leia as ideias</strong><small>Entenda o conceito em poucas linhas.</small></span></p><p><b>2</b><span><strong>Execute o exemplo</strong><small>Observe a saída antes de escrever.</small></span></p><p><b>3</b><span><strong>Resolva e explique</strong><small>O desafio só conta quando sua lógica funciona e você acerta a revisão.</small></span></p></div>
    </details>

    {unidades.map(unidade => {
      const aulas = aulasDaUnidade(unidade.id);
      const prontas = aulas.filter(a => feitas.includes(a.id)).length;
      return <section className="card unidade-card" key={unidade.id}>
        <div className="step-head">
          <span className={`icon-tile ${unidade.cor}`}><Icon name={unidade.icone} size={21} /></span>
          <div><div className="eyebrow">UNIDADE {unidade.numero} · {prontas} DE {aulas.length} ESTUDADAS</div><h3>{unidade.titulo}</h3></div>
        </div>
        <p>{unidade.resumo}</p>
        <p className="small"><strong>Competência da unidade:</strong> {unidade.competencia}</p>
        <div className="faculdade-aulas">
          {aulas.map((aula, indice) => <button key={aula.id} className={`faculdade-aula ${feitas.includes(aula.id) ? 'is-feita' : ''}`} onClick={() => abrir(aula)}>
            <span className="faculdade-aula-num">{feitas.includes(aula.id) ? <Icon name="Check" size={14} /> : indice + 1}</span>
            <span><strong>{aula.titulo}</strong><small>{aula.minutos} min · {aula.origem || `aula ${indice + 1} da Unidade ${unidade.numero}`}</small></span>
            <Icon name="ArrowRight" size={17} />
          </button>)}
        </div>
        <details className="faculdade-tarefas">
          <summary>Tarefas que o professor propõe nesta unidade</summary>
          {tarefasDaUnidade(unidade.id).map(tarefa => <div className="faculdade-tarefa" key={tarefa.id}>
            <div className="eyebrow">{tarefa.origem}</div>
            <strong>{tarefa.titulo}</strong>
            <p>{tarefa.enunciado}</p>
            <p className="small">Pratica: {tarefa.pratica.join(', ')}</p>
          </div>)}
          <p className="small muted">Estas são as aplicações propostas na apostila e nos slides. Resolva cada uma no
            Laboratório Python e guarde o arquivo: é o que mais se parece com o que vai ser avaliado.</p>
        </details>
      </section>;
    })}

    <div className="info-note">
      <Icon name="Info" size={18} />
      <p>Esta trilha segue a ementa da sua disciplina e não substitui as videoaulas do AVA. Ela não
        concede XP das oito etapas nem destrava nada nelas — mas estudar aqui conta o seu dia.
        As bibliotecas são baixadas na primeira execução, então a primeira vez demora alguns segundos.</p>
    </div>
    <div className="button-row">
      <button className="text-button" onClick={() => navigate('playground')}><Icon name="FlaskConical" size={15} /> Abrir o Laboratório Python para resolver as tarefas</button>
    </div>
  </>;
}

function AulaDaFaculdade({ aula, state, update, voltar, feita }) {
  const guardado = state.faculdade?.codigos?.[aula.id];
  const [saidaOk, setSaidaOk] = useState(false);
  const [resposta, setResposta] = useState(null);
  const [aviso, setAviso] = useState('');
  const [diferenca, setDiferenca] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [celebrar, setCelebrar] = useState(0);
  const [requisitosPendentes, setRequisitosPendentes] = useState([]);
  const unidade = unidades.find(item => item.id === aula.unidade);
  const codigo = guardado ?? aula.starter;
  const python = usePython({
    source: 'playground', title: `Faculdade · ${aula.titulo}`, expected: aula.esperado,
    onRecord: tentativa => update(s => appendAttempt(s, tentativa))
  });
  const exemploPython = usePython({ title: `Exemplo da faculdade · ${aula.titulo}` });
  const setCodigo = valor => {
    setSaidaOk(false); setAviso(''); setDiferenca(null); setRequisitosPendentes([]);
    update(s => ({ ...s, faculdade: { ...s.faculdade, codigos: { ...s.faculdade?.codigos, [aula.id]: valor } } }));
  };
  const executar = () => {
    setAviso(''); setDiferenca(null);
    python.run(codigo, '', resultado => {
      const bateSaida = resultado.ok && resultado.output.trim() === aula.esperado.trim();
      const faltando = bateSaida ? requisitosFaltandoDaFaculdade(aula, codigo) : [];
      const bate = bateSaida && faltando.length === 0;
      setRequisitosPendentes(faltando);
      setSaidaOk(bate);
      setTentativas(n => bate ? 0 : n + 1);
      setDiferenca(resultado.ok && !bateSaida ? resultado.output : null);
      setAviso(!resultado.ok ? 'Vamos ler o erro. A ajuda abaixo indica por onde começar.'
        : bate ? 'Saída correta. Agora responda à revisão para registrar a aula.'
          : bateSaida ? 'A saída bateu, mas o código ainda não demonstra a lógica pedida. Veja o item abaixo.'
          : 'A saída ficou diferente da esperada. Compare linha a linha.');
      if (bate) setCelebrar(n => n + 1);
    });
  };
  const pronta = saidaOk && resposta === aula.resposta;
  const registrar = () => {
    if (!pronta) return;
    const hoje = localDate();
    update(s => ({
      ...s,
      faculdade: { ...s.faculdade, feitas: [...new Set([...(s.faculdade?.feitas || []), aula.id])] },
      activities: { ...s.activities, [hoje]: [...new Set([...(s.activities?.[hoje] || []), `faculdade:${aula.id}`])] }
    }));
    setAviso('Aula registrada. Ela conta no seu dia de estudo.');
  };

  return <>
    <button className="text-button back" disabled={python.busy} onClick={voltar}><Icon name="ArrowLeft" size={16} /> Voltar para a minha faculdade</button>
    <div className="page-heading"><div>
      <div className="eyebrow">UNIDADE {unidade?.numero || ''} · LINGUAGEM DE PROGRAMAÇÃO</div>
      <h1>{aula.titulo}</h1>
      <p>{aula.minutos} min {feita ? '· já estudada' : ''}</p>
    </div></div>

    <section className="card faculdade-passo">
      <div className="step-head"><span className="icon-tile purple"><Icon name="BookOpen" size={21} /></span>
        <div><div className="eyebrow">PASSO 1 DE 3</div><h3>Entenda em poucas ideias</h3></div></div>
      <div className="faculdade-ideias">{aula.teoria.map((paragrafo, indice) => <div key={paragrafo}>
        <span>{indice + 1}</span><p>{paragrafo}</p>
      </div>)}</div>
      {aula.naFormacao?.length > 0 && <div className="faculdade-conexao">
        <Icon name="Footprints" size={17} /><p><strong>Também está na formação geral:</strong> {aula.naFormacao.join(' · ')}
          {aula.focoFaculdade && <><br /><span>{aula.focoFaculdade}</span></>}</p>
      </div>}
    </section>

    <section className="card faculdade-passo">
      <div className="step-head"><span className="icon-tile blue"><Icon name="Code2" size={21} /></span>
        <div><div className="eyebrow">PASSO 2 DE 3</div><h3>O exemplo do professor, rodando</h3></div></div>
      <p className="small">Este exemplo segue o material da faculdade. Execute, observe a saída e só depois faça o desafio com seu próprio código.</p>
      {aula.notaAmbiente && <div className="faculdade-limite"><Icon name="Info" size={16} /><p>{aula.notaAmbiente}</p></div>}
      <CodeEditor code={aula.exemplo} readOnly busy={exemploPython.busy}
        onRun={() => exemploPython.run(aula.exemplo)} onStop={exemploPython.stop}
        output={exemploPython.output} success={exemploPython.success}
        filename={`${aula.id}-exemplo.py`} runLabel="Executar exemplo"
        emptyOutput="Execute o exemplo para conferir o que o código do professor produz." />
    </section>

    <section className="card faculdade-passo">
      <div className="step-head"><span className="icon-tile orange"><Icon name="Target" size={21} /></span>
        <div><div className="eyebrow">PASSO 3 DE 3</div><h3>Agora você</h3></div></div>
      <p className="coach-task">{aula.desafio}</p>
      <details className="coach-expected"><summary>Conferir a saída esperada</summary><pre className="example-code">{aula.esperado}</pre></details>
      <CodeEditor aoVivo={{ inicial: aula.starter, lessonId: '', challenge: aula.desafio }}
        code={codigo} onChange={setCodigo} busy={python.busy} onRun={executar} onStop={python.stop}
        output={python.output} success={python.success} celebrate={celebrar}
        inputRequest={python.inputRequest} onReply={python.reply}
        filename={`${aula.id}.py`} emptyOutput="Sua saída aparece aqui depois de executar." />
      {aviso && <p role="status" className="practice-feedback">{aviso}</p>}
      {requisitosPendentes.length > 0 && <div className="faculdade-requisitos" role="status">
        <strong>Ainda falta mostrar no código:</strong>
        <ul>{requisitosPendentes.map(item => <li key={item.id}>{item.descricao}</li>)}</ul>
      </div>}
      {python.success === false && <ErrorHelp output={python.output} code={codigo} />}
      {diferenca !== null && <OutputCompare actual={diferenca} expected={aula.esperado} />}
      <Mentor activityId={`faculdade:${aula.id}`} lumiNotes={state.lumiNotes}
        onSaveNote={nota => update(s => appendLumiNote(s, nota))} attempts={tentativas}
        history={state.history} title={`Faculdade · ${aula.titulo}`} challenge={aula.desafio}
        expected={aula.esperado} code={codigo} output={python.output} lessonId="" />
    </section>

    <section className="card review faculdade-passo">
      <div className="step-head"><span className="icon-tile teal"><Icon name="BookOpenCheck" size={21} /></span>
        <div><div className="eyebrow">REVISÃO</div><h3>Uma pergunta, do jeito que a prova pergunta</h3></div></div>
      <h4 className="review-question">{aula.pergunta}</h4>
      {aula.opcoes.map((opcao, i) => <label className={`answer ${resposta === i ? 'selected' : ''}`} key={opcao}>
        <input type="radio" name={`rev-${aula.id}`} checked={resposta === i} onChange={() => setResposta(i)} />
        <span>{String.fromCharCode(65 + i)}</span>{opcao}
      </label>)}
      {resposta !== null && <p className={resposta === aula.resposta ? 'success-text' : 'error-text'}>
        {resposta === aula.resposta ? 'Isso mesmo.' : 'Ainda não. Releia a ideia lá em cima.'}</p>}
    </section>

    <div className={`complete-box ${feita ? 'is-complete' : pronta ? 'is-ready' : ''}`} aria-live="polite">
      <div className="step-head"><span className={`icon-tile ${feita ? 'teal' : 'yellow'}`}><Icon name={feita ? 'Trophy' : 'Target'} size={21} /></span>
        <div><div className="eyebrow">{feita ? 'AULA REGISTRADA' : 'PARA REGISTRAR'}</div>
          <h3>{feita ? 'Esta aula já conta no seu estudo' : pronta ? 'Tudo pronto' : 'Faltam dois itens'}</h3></div></div>
      {!feita && <ul className="complete-checklist">
        {[["Desafio com a lógica pedida e a saída esperada", saidaOk], ['Revisão correta', resposta === aula.resposta]].map(([rotulo, ok]) =>
          <li key={rotulo} className={ok ? 'done' : ''}><Icon name={ok ? 'CheckCircle2' : 'Circle'} size={16} /> {rotulo}</li>)}
      </ul>}
      {!feita && <button className="button primary full" disabled={!pronta || python.busy} aria-describedby={`portao-${aula.id}`} onClick={registrar}>
        Registrar esta aula <Icon name="Check" size={17} /></button>}
      <p id={`portao-${aula.id}`} className="small">{feita ? 'Revisar é sempre bem-vindo: nada é perdido ao executar de novo.'
        : pronta ? 'Clique para registrar. Isso conta o dia de estudo, sem mexer nas oito etapas.'
          : 'Execute o desafio com a saída certa e acerte a revisão para liberar o registro.'}</p>
    </div>

    <div className="button-row">
      <button className="button outline" onClick={voltar}><Icon name="ArrowLeft" size={16} /> Todas as aulas da faculdade</button>
    </div>
  </>;
}
