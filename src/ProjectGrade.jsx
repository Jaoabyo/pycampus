import { useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { mentorAvailable } from './mentor.js';
import { fetchRepoFiles, gradeProject, PASSING } from './project-grading.js';
import { localDate } from './progress.js';
import './grade.css';

// A avaliação lê o código que o estudante realmente publicou no GitHub. Ela substitui a
// autoavaliação como porta de conclusão, porque conferir o código entregue diz mais do que
// marcar caixas sobre si mesmo.
export default function ProjectGrade({ project, state, update }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const abort = useRef(null);
  const link = state.projectLinks?.[project.id] || '';
  const grade = state.projectGrades?.[project.id];

  const evaluate = async () => {
    setError('');
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      setBusy('Conferindo se a IA local está ligada…');
      const availability = await mentorAvailable(controller.signal);
      if (!availability.ok) throw new Error(availability.reason === 'modelo'
        ? 'O modelo da avaliação ainda não foi baixado. No terminal: ollama pull qwen2.5-coder:14b.'
        : 'A IA local está desligada. Abra o aplicativo Ollama e peça a avaliação de novo.');

      setBusy('Lendo os arquivos do seu repositório…');
      const { files } = await fetchRepoFiles(link, controller.signal);

      setBusy(`Avaliando ${files.length} ${files.length === 1 ? 'arquivo' : 'arquivos'} com calma. Isso leva alguns segundos…`);
      const result = await gradeProject({ project, files, signal: controller.signal });

      update(s => {
        const today = localDate();
        const activities = { ...s.activities };
        // Um projeto aprovado conta como atividade do dia: é trabalho de estudo como outro qualquer.
        if (result.aprovado) activities[today] = [...new Set([...(activities[today] || []), `project:${project.id}`])];
        return { ...s, activities, projectGrades: { ...s.projectGrades, [project.id]: { ...result, avaliadoEm: today } } };
      });
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setBusy('');
    }
  };

  return <section className="card project-grade">
    <div className="grade-head">
      <LumiArt size={38} awake={Boolean(busy)} />
      <div><div className="eyebrow">AVALIAÇÃO DO CÓDIGO PUBLICADO</div><h3>O Lumi lê seu repositório e dá a nota</h3></div>
    </div>

    {!link && <p className="grade-need"><Icon name="Info" size={15} /> Salve o link do seu repositório acima. É ele que eu vou ler.</p>}

    {grade && <div className={`grade-card ${grade.aprovado ? 'passed' : 'retry'}`}>
      <div className="grade-score">
        <strong>{grade.nota.toFixed(1)}</strong><span>de 10</span>
      </div>
      <div className="grade-verdict">
        <span className={`pill ${grade.aprovado ? 'teal' : 'orange'}`}>
          <Icon name={grade.aprovado ? 'CheckCircle2' : 'RotateCcw'} size={13} /> {grade.aprovado ? 'Aprovado' : `Ainda não — precisa de ${PASSING}`}
        </span>
        <p>{grade.resumo}</p>
        {grade.aprovado && <p className="grade-reward"><Icon name="Zap" size={14} /> +250 XP · emblema Aprovado na revisão · atividade registrada no seu calendário</p>}
      </div>
    </div>}

    {grade && <ul className="grade-requirements">
      {grade.requisitos.map(item => <li key={item.item} className={item.atendido ? 'met' : ''}>
        <Icon name={item.atendido ? 'CheckCircle2' : 'Circle'} size={16} />
        <span><strong>{item.item}</strong>{item.porque && <small>{item.porque}</small>}</span>
      </li>)}
    </ul>}

    {grade && (grade.fortes.length > 0 || grade.melhorar.length > 0) && <div className="grade-notes">
      {grade.fortes.length > 0 && <div><h4><Icon name="Sparkles" size={15} /> O que ficou bom</h4><ul>{grade.fortes.map(text => <li key={text}>{text}</li>)}</ul></div>}
      {grade.melhorar.length > 0 && <div><h4><Icon name="Hammer" size={15} /> O que melhorar</h4><ul>{grade.melhorar.map(text => <li key={text}>{text}</li>)}</ul></div>}
    </div>}

    {busy && <p className="grade-busy" role="status"><span className="grade-spin" /> {busy}</p>}
    {error && <p className="grade-error" role="alert"><Icon name="TriangleAlert" size={15} /> {error}</p>}

    <div className="button-row">
      <button className="button primary" disabled={!link || Boolean(busy)} onClick={evaluate}>
        <Icon name="ShieldCheck" size={16} /> {grade ? 'Avaliar de novo' : 'Pedir avaliação do Lumi'}
      </button>
      {busy && <button className="text-button" onClick={() => { abort.current?.abort(); setBusy(''); }}>Cancelar</button>}
    </div>
    <p className="small">A avaliação roda no seu computador e lê apenas os arquivos .py e .md do repositório que você enviou. Se discordar da nota, peça de novo depois de melhorar o código — ou use a autoavaliação, que continua valendo.</p>
  </section>;
}
