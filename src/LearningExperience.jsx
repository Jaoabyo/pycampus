import { useEffect, useState } from 'react';
import { Icon, Progress } from './ui.jsx';
import { modules } from './curriculum.js';
import { firstIncompleteModule, lessonAllowed, projectIsOpen } from './progression.js';
import { missionItemDone, missionProgress } from './daily-mission.js';
import { learningMapStage } from './learning-map.js';
import './experience.css';

const kindMeta = {
  lesson: ['BookOpen', 'Aula', '15 min'], practice: ['Hammer', 'Prática', '20 min'],
  project: ['FolderCode', 'Projeto', '30 min'], targeted: ['Target', 'Revisão', '12 min'], done: ['Trophy', 'Concluído', '']
};

export function DailyMission({ mission, state, today, onOpen }) {
  const progress = missionProgress(mission, state, today);
  return <section className={`card daily-mission ${progress.total > 0 && progress.done === progress.total ? 'is-complete' : ''}`}>
    <div className="mission-heading">
      <div><span className="eyebrow">SEU PLANO PARA HOJE</span><h2><Icon name="Sparkles" size={20} /> Missão do dia</h2><p>Faça uma coisa de cada vez. O próximo passo aparece quando você termina o atual.</p></div>
      <div className="mission-score" aria-label={`${progress.done} de ${progress.total} atividades concluídas`}><strong>{progress.done}</strong><span>/ {progress.total}</span></div>
    </div>
    <Progress value={progress.percent} label={`Progresso da etapa: ${progress.percent}%`} />
    <ol className="mission-list">
      {(mission?.items || []).map((item, index) => {
        const done = missionItemDone(item, state, today);
        const available = index === 0 || missionItemDone(mission.items[index - 1], state, today);
        const [icon, type, time] = kindMeta[item.kind] || kindMeta.lesson;
        return <li className={`${done ? 'done' : ''} ${available ? 'available' : 'waiting'}`} key={item.key}>
          <span className="mission-number">{done ? <Icon name="Check" size={17} /> : index + 1}</span>
          <span className={`icon-tile ${done ? 'teal' : 'purple'}`}><Icon name={icon} size={20} /></span>
          <span className="mission-copy"><small>{type}{time ? ` · ${time}` : ''}</small><strong>{item.label}</strong><em>{done ? 'Concluído hoje' : available ? 'Pronto para começar' : 'Libera depois do passo anterior'}</em></span>
          <button className={available && !done ? 'button primary' : 'button outline'} disabled={!available} onClick={() => onOpen(item)}>{done ? 'Rever' : 'Abrir'} <Icon name="ArrowRight" size={15} /></button>
        </li>;
      })}
    </ol>
    {progress.total > 0 && progress.done === progress.total && <div className="mission-finish"><Icon name="Sparkles" size={20} /> Missão concluída. Você avançou de verdade hoje!</div>}
  </section>;
}

export function LearningMap({ state, openLesson, openProject, navigate }) {
  const currentIndex = Math.min(firstIncompleteModule(state), modules.length - 1);
  const [selected, setSelected] = useState(modules[currentIndex]?.id || modules[0].id);
  useEffect(() => { if (!modules.some(item => item.id === selected)) setSelected(modules[currentIndex]?.id || modules[0].id); }, [currentIndex, selected]);

  return <div className="learning-map" aria-label="Mapa da formação">
    <div className="map-path" aria-hidden="true" />
    {modules.map((module, index) => {
      const stage = learningMapStage(state, index);
      const { open, pending, complete } = stage;
      const totals = stage;
      const active = selected === module.id;
      return <article className={`map-stage ${complete ? 'is-complete' : index === currentIndex ? 'is-current' : open ? 'is-open' : 'is-locked'} ${active ? 'is-selected' : ''}`} key={module.id}>
        <button className="map-node" aria-expanded={active} onClick={() => setSelected(active ? '' : module.id)}>
          <span className="map-index">{complete ? <Icon name="Check" size={20} /> : open ? module.number : <Icon name="LockKeyhole" size={17} />}</span>
          <span className="map-node-copy"><small>ETAPA {module.number} · {module.category}</small><strong>{module.title}</strong><em>{complete ? 'Etapa concluída' : open ? `${totals.done} de ${totals.total} atividades` : 'Etapa bloqueada'}</em></span>
          <span className={`icon-tile ${module.color}`}><Icon name={module.icon} size={22} /></span>
        </button>
        {active && <div className="map-details">
          {!open && <p className="map-blocked"><Icon name="LockKeyhole" size={15} /> {stage.blocker}</p>}
          {open && <>
            <div className="map-progress"><span>{totals.done} de {totals.total} atividades</span><Progress value={totals.total ? totals.done / totals.total * 100 : 0} label={`Atividades concluídas: ${totals.done} de ${totals.total}`} /></div>
            <div className="map-lessons">{module.lessons.map((lesson, lessonIndex) => {
              const allowed = lessonAllowed(state, lesson.id), done = state.completed.includes(lesson.id);
              return <button disabled={!allowed} key={lesson.id} onClick={() => openLesson(lesson.id)}><span>{done ? <Icon name="CheckCircle2" size={18} /> : allowed ? lessonIndex + 1 : <Icon name="LockKeyhole" size={15} />}</span><strong>{lesson.title}</strong><em>{lesson.minutes} min</em></button>;
            })}</div>
            {pending.missingBridges.length > 0 && <button className="map-required" onClick={() => navigate('practice')}><Icon name="Workflow" size={18} /><span><strong>Pontes de função</strong><small>{pending.missingBridges.length} pendente(s)</small></span><Icon name="ArrowRight" size={16} /></button>}
            {pending.missingPractices.length > 0 && <button className="map-required" onClick={() => navigate('practice')}><Icon name="Hammer" size={18} /><span><strong>Oficina de prática</strong><small>{pending.missingPractices.length} miniprojeto(s) pendente(s)</small></span><Icon name="ArrowRight" size={16} /></button>}
            {totals.project && <button className="map-project" disabled={!projectIsOpen(state, totals.project.id)} onClick={() => openProject(totals.project.id)}><Icon name="FolderCode" size={19} /><span><small>PROJETO DA ETAPA</small><strong>{totals.project.title}</strong></span><Icon name={projectIsOpen(state, totals.project.id) ? 'ArrowRight' : 'LockKeyhole'} size={17} /></button>}
          </>}
        </div>}
      </article>;
    })}
  </div>;
}
