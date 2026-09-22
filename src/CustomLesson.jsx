import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { mentorAvailable } from './mentor.js';
import { requestCustomLesson } from './custom-lesson.js';
import { usePython } from './useTrackedPython.js';
import { toBlocks } from './parsons.js';
import CodeEditor from './CodeEditor.jsx';
import ParsonsPuzzle from './ParsonsPuzzle.jsx';
import { localDate } from './progress.js';
import './custom-lesson.css';

const ATTEMPTS = 3;
const same = (a, b) => a.replace(/\s+$/gm, '').trim() === b.replace(/\s+$/gm, '').trim();

// A lição só aparece depois de o Python de verdade confirmar as duas saídas que ela promete.
export default function CustomLesson({ weakness, evidence, lessonId, state, update }) {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [passed, setPassed] = useState(false);
  const [puzzle, setPuzzle] = useState(false);
  const abort = useRef(null);
  useEffect(() => () => abort.current?.abort(), []);

  // Um executor separado, sem gravar no diário: conferir a lição não é tentativa do estudante.
  const checker = usePython({});
  const python = usePython({});
  const lesson = state.customLessons?.[weakness.id] || null;

  const runOnce = (code, entradas) => new Promise(resolve => checker.run(code, entradas.join('\n'), resolve));

  const generate = async () => {
    setError(''); setPassed(false); setCode('');
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      setStatus('Conferindo se a IA local está ligada…');
      const availability = await mentorAvailable(controller.signal);
      if (!availability.ok) throw new Error('A IA local está desligada. Abra o aplicativo Ollama e peça de novo.');

      const refused = [];
      for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        try {
          setStatus(`Escrevendo uma lição sobre "${weakness.title}"…${attempt > 1 ? ` (tentativa ${attempt})` : ''}`);
          const draft = await requestCustomLesson({ weakness, evidence, lessonId, signal: controller.signal });

          setStatus('Rodando o exemplo no Python de verdade para conferir…');
          const example = await runOnce(draft.exemplo, draft.entradasExemplo);
          if (!example.ok) { refused.push('o exemplo não roda'); continue; }
          if (!String(example.output).trim()) { refused.push('o exemplo não imprime nada'); continue; }

          setStatus('Conferindo se o desafio tem solução…');
          const solution = await runOnce(draft.solucao, draft.entradasDesafio);
          if (!solution.ok) { refused.push('a solução do desafio não roda'); continue; }
          if (!String(solution.output).trim()) { refused.push('a solução do desafio não imprime nada'); continue; }

          if (controller.signal.aborted) return;
          // A saída mostrada é a medida, não a prometida: é a que o estudante vai comparar.
          const conferida = { ...draft, saidaExemplo: String(example.output).trim(), saidaDesafio: String(solution.output).trim() };
          update(s => ({ ...s, customLessons: { ...s.customLessons, [weakness.id]: { ...conferida, criadaEm: localDate() } } }));
          setStatus('');
          return;
        } catch (failure) {
          if (controller.signal.aborted) return;
          refused.push(failure.message);
        }
      }
      throw new Error(`Tentei ${ATTEMPTS} vezes e a lição não passou na conferência (${refused.at(-1)}). Prefiro não te mostrar uma lição que eu não consegui verificar.`);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setStatus('');
    }
  };

  // A atividade do dia conta quando o estudante resolve, não quando a lição é gerada:
  // gerar é um clique, e um clique não é estudo.
  const run = () => python.run(code, (lesson.entradasDesafio || []).join('\n'), result => {
    const ok = result.ok && same(result.output, lesson.saidaDesafio);
    setPassed(ok);
    if (ok) update(s => ({ ...s, activities: { ...s.activities, [localDate()]: [...new Set([...(s.activities[localDate()] || []), `lumi:${weakness.id}`])] } }));
  });

  return <section className="card custom-lesson">
    <div className="custom-head">
      <LumiArt size={36} awake={Boolean(status)} />
      <div><div className="eyebrow">LIÇÃO FEITA PARA VOCÊ</div><h3>{lesson ? lesson.titulo : `Uma lição sobre ${weakness.title.toLowerCase()}`}</h3></div>
      {lesson && <span className="pill purple">criada em {lesson.criadaEm.split('-').reverse().join('/')}</span>}
    </div>

    {!lesson && !status && !error && <p className="small">O Lumi escreve uma lição curta sobre este engano, usando só o que você já estudou. Antes de te mostrar, ele roda o exemplo e a solução no Python de verdade — se as saídas não baterem, a lição é descartada.</p>}

    {status && <p className="custom-status" role="status"><span className="custom-spin" /> {status}</p>}
    {error && <p className="custom-error" role="alert"><Icon name="TriangleAlert" size={15} /> {error}</p>}

    {lesson && <>
      <div className="custom-explain">{lesson.explicacao.map(line => <p key={line}>{line}</p>)}</div>
      <div className="custom-example">
        <span className="custom-label">EXEMPLO · conferido no Python</span>
        <pre className="example-code">{lesson.exemplo}</pre>
        <span className="custom-label">O QUE ELE IMPRIME</span>
        <pre className="custom-output">{lesson.saidaExemplo}</pre>
      </div>
      <div className="custom-challenge">
        <span className="custom-label">AGORA VOCÊ</span>
        <p>{lesson.desafio}</p>
        <div className="expected"><span>SAÍDA ESPERADA</span><pre>{lesson.saidaDesafio}</pre></div>
        {lesson.entradasDesafio?.length > 0 && <p className="small">Este teste usa automaticamente as respostas <strong>{lesson.entradasDesafio.join(', ')}</strong>, na ordem dos input(). Você não precisa digitá-las durante a execução.</p>}
      </div>
      <CodeEditor code={code} onChange={value => { setCode(value); setPassed(false); }} busy={python.busy} onRun={run} onStop={python.stop} output={python.output} imagens={python.imagens} success={python.success} filename="licao_do_lumi.py" runLabel="Testar minha resposta" emptyOutput="Escreva sua resposta e execute." />
      {passed && <p className="success-text" role="status"><Icon name="CheckCircle2" size={16} /> Saída certa. Agora explique em voz alta por que funciona — é isso que fixa.</p>}
      <button className="text-button" onClick={() => setPuzzle(!puzzle)}><Icon name="Boxes" size={15} /> {puzzle ? 'Fechar o quebra-cabeça' : 'Travou? Monte o código embaralhado'}</button>
      {puzzle && <ParsonsPuzzle item={{ id: `lumi-${weakness.id}`, puzzle: { blocks: toBlocks(lesson.solucao), prefix: '', distractor: '' } }} />}
    </>}

    <div className="button-row">
      <button className="button outline" disabled={Boolean(status)} onClick={generate}>
        <Icon name="Sparkles" size={16} /> {lesson ? 'Criar outra lição sobre isto' : 'Criar uma lição para mim'}
      </button>
      {status && <button className="text-button" onClick={() => { abort.current?.abort(); checker.stop(); setStatus(''); }}>Cancelar</button>}
    </div>
    <p className="small">Lições do Lumi não valem XP: elas são treino extra, e valer pontos abriria a porta para gerar lição atrás de lição. Elas contam como atividade do dia.</p>
  </section>;
}
