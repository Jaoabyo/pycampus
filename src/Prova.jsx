import { useEffect, useRef, useState } from 'react';
import { Icon, Progress } from './ui.jsx';
import { acertou, montarProva, podeFazerProva, resultadoDaProva, MINIMO_DE_AULAS, QUESTOES_PADRAO, SEGUNDOS_POR_QUESTAO } from './exam.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { localDate } from './progress.js';
import CodeEditor from './CodeEditor.jsx';
import './prova.css';

const relogio = segundos => `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

export default function Prova({ state, update, openLesson }) {
  const [questoes, setQuestoes] = useState(null);
  const [indice, setIndice] = useState(0);
  const [codigos, setCodigos] = useState({});
  const [respostas, setRespostas] = useState({});
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [aviso, setAviso] = useState('');
  const contador = useRef(null);
  // As tentativas da prova entram no diário: é o registro mais honesto de onde ele trava.
  const python = usePython({ source: 'playground', title: 'Modo prova', onRecord: attempt => update(s => appendAttempt(s, attempt)) });

  useEffect(() => () => clearInterval(contador.current), []);
  useEffect(() => {
    if (!questoes || resultado) { clearInterval(contador.current); return; }
    contador.current = setInterval(() => setSegundos(atual => atual + 1), 1000);
    return () => clearInterval(contador.current);
  }, [questoes, resultado]);

  const começar = () => {
    setQuestoes(montarProva(state, QUESTOES_PADRAO));
    setIndice(0); setCodigos({}); setRespostas({}); setSegundos(0); setResultado(null); setAviso('');
    python.reset();
  };

  const questao = questoes?.[indice];
  const codigo = codigos[questao?.id] ?? '';

  const testar = () => {
    setAviso('');
    python.run(codigo, questao.stdin, resposta => {
      const certo = resposta.ok && acertou(resposta.output, questao.esperado);
      setRespostas(atual => ({ ...atual, [questao.id]: certo }));
      setAviso(certo ? 'Resposta aceita.' : resposta.ok ? 'A saída ficou diferente da esperada.' : 'O programa parou com erro.');
    });
  };

  const encerrar = () => {
    const final = resultadoDaProva(questoes, respostas, segundos);
    setResultado(final);
    update(s => ({
      ...s,
      provas: [...(s.provas || []), { data: localDate(), ...final }].slice(-20),
      activities: { ...s.activities, [localDate()]: [...new Set([...(s.activities[localDate()] || []), 'prova'])] }
    }));
  };

  if (!podeFazerProva(state)) return <>
    <Cabecalho state={state} />
    <section className="card prova-vazia">
      <p>O modo prova sorteia questões entre as aulas que você já concluiu. Conclua pelo menos {MINIMO_DE_AULAS} aulas para liberá-lo.</p>
    </section>
  </>;

  if (resultado) return <>
    <Cabecalho state={state} />
    <section className={`card prova-resultado ${resultado.acertos === resultado.total ? 'is-cheia' : ''}`}>
      <div className="prova-nota">
        <strong>{resultado.acertos}</strong><span>de {resultado.total}</span>
      </div>
      <div>
        <h2>{resultado.acertos === resultado.total ? 'Sem consultar nada.' : 'Agora você sabe onde voltar.'}</h2>
        <p>Tempo: {relogio(resultado.segundos)}{resultado.dentroDoTempo ? '' : ' — acima dos três minutos por questão, o que também é informação'}.</p>
      </div>
    </section>
    {resultado.falhas.length > 0 && <section className="card">
      <h3>Para revisar</h3>
      <ul className="prova-falhas">{resultado.falhas.map(id => {
        const item = questoes.find(questao => questao.id === id);
        return <li key={id}><span>{item.titulo}</span><button className="text-button" onClick={() => openLesson(id)}>Abrir a aula <Icon name="ArrowRight" size={14} /></button></li>;
      })}</ul>
    </section>}
    <div className="button-row"><button className="button primary" onClick={começar}><Icon name="RotateCcw" size={16} /> Fazer outra prova</button></div>
    <p className="small">A prova não concede XP: ela mede o que já foi aprendido, não ensina de novo. Conta como atividade do dia e as tentativas entram no seu diário.</p>
  </>;

  if (!questoes) return <>
    <Cabecalho state={state} />
    <section className="card prova-abertura">
      <div className="prova-abertura-copy"><div className="eyebrow">SEU TREINO DE MEMÓRIA</div><h2>Você consegue escrever sem consultar?</h2>
        <p>{QUESTOES_PADRAO} questões sorteadas entre as {state.completed.length} aulas que você concluiu. O relógio registra seu ritmo, sem reprovar.</p>
        <button className="button primary" onClick={começar}><Icon name="Play" size={16} fill="currentColor" /> Começar a prova</button>
      </div>
      <div className="prova-regras" aria-label="Como funciona"><span><Icon name="SquareTerminal" size={17} /> Editor vazio</span><span><Icon name="ShieldCheck" size={17} /> Sem consulta</span><span><Icon name="Clock3" size={17} /> No seu ritmo</span><span><Icon name="BookOpenCheck" size={17} /> Resultado no diário</span></div>
    </section>
    {state.provas?.length > 0 && <section className="card">
      <h3>Suas provas anteriores</h3>
      <ul className="prova-historico">{[...state.provas].reverse().slice(0, 8).map((prova, posicao) => (
        <li key={posicao}><span>{prova.data.split('-').reverse().join('/')}</span><strong>{prova.acertos}/{prova.total}</strong><span>{relogio(prova.segundos)}</span></li>
      ))}</ul>
    </section>}
  </>;

  const feitas = questoes.filter(item => respostas[item.id] === true).length;
  return <>
    <Cabecalho state={state} />
    <div className="prova-barra">
      <span className="pill purple">Questão {indice + 1} de {questoes.length}</span>
      <span className="pill blue"><Icon name="Clock3" size={12} /> {relogio(segundos)}</span>
      <span className="pill teal">{feitas} aceitas</span>
      <Progress value={feitas / questoes.length * 100} />
    </div>
    <section className="card prova-questao">
      <div className="eyebrow">SEM CONSULTAR · {questao.titulo}</div>
      <h2>{questao.desafio}</h2>
      <div className="expected"><span>SAÍDA ESPERADA</span><pre>{questao.esperado}</pre></div>
      {questao.stdin && <p className="small">Responda {questao.stdin.split('\n').join(', ')} quando o programa perguntar.</p>}
      <CodeEditor code={codigo} onChange={valor => { setCodigos(atual => ({ ...atual, [questao.id]: valor })); setAviso(''); }}
        busy={python.busy} onRun={testar} onStop={python.stop} output={python.output} success={python.success}
        filename="prova.py" runLabel="Testar minha resposta" emptyOutput="Escreva do zero e teste." />
      {aviso && <p className={respostas[questao.id] ? 'success-text' : 'muted'} role="status">{aviso}</p>}
      <div className="button-row">
        <button className="button outline" disabled={indice === 0 || python.busy} onClick={() => { setIndice(indice - 1); setAviso(''); python.reset(); }}>← Anterior</button>
        {indice < questoes.length - 1
          ? <button className="button primary" disabled={python.busy} onClick={() => { setIndice(indice + 1); setAviso(''); python.reset(); }}>Próxima →</button>
          : <button className="button primary" disabled={python.busy} onClick={encerrar}>Encerrar e ver o resultado</button>}
        {indice < questoes.length - 1 && <button className="text-button" disabled={python.busy} onClick={encerrar}>Encerrar agora</button>}
      </div>
    </section>
  </>;
}

function Cabecalho({ state }) {
  return <div className="page-heading prova-heading">
    <div className="lesson-title">
      <span className="icon-tile pink"><Icon name="Target" size={25} /></span>
      <div><div className="eyebrow">RECALL SEM CONSULTA</div><h1>Modo prova</h1>
        <p><Icon name="BookOpenCheck" size={15} /> {state.completed.length} aulas concluídas <span>·</span> {state.provas?.length || 0} provas feitas</p></div>
    </div>
  </div>;
}
