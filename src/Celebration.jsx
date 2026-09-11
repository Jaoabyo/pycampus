import { useEffect, useRef, useState } from 'react';
import * as Icons from './icons.js';
import './celebration.css';

export function ReadyToComplete({ onComplete, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal(); element.querySelector('.button.primary')?.focus();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="celebration-dialog ready-dialog" aria-labelledby="ready-title" aria-describedby="ready-description" onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="ready-mark" aria-hidden="true"><Icons.CheckCheck size={38} /></div>
    <div className="eyebrow">DESAFIO E REVISÃO RESOLVIDOS</div>
    <h2 id="ready-title">Você conseguiu!</h2>
    <p id="ready-description">Seu código produziu a saída esperada e você acertou a revisão. Agora confirme para registrar a aula e receber seu XP.</p>
    <button autoFocus className="button primary full" onClick={onComplete}>Concluir aula · +100 XP <Icons.Check size={18} /></button>
    <button className="text-button" onClick={onClose}>Voltar ao código</button>
  </dialog>;
}

export default function Celebration({ reward, onConfirm, storageError }) {
  const dialog = useRef(null), returnFocus = useRef(null);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    returnFocus.current = document.activeElement;
    element.showModal();
    element.querySelector('.celebration-confirm')?.focus();
    return () => { element.close(); if (returnFocus.current?.isConnected) returnFocus.current.focus(); };
  }, []);
  return <dialog ref={dialog} className={`celebration-dialog ${reward.firstLessonToday ? 'flame-celebration' : ''}`} aria-labelledby="celebration-title" aria-describedby="celebration-description" onCancel={e => { e.preventDefault(); onConfirm(); }}>
    <div className="celebration-confetti" key={burst} aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37) % 100}%`, '--delay': `${(i % 7) * 0.09}s`, '--turn': `${i * 43}deg`, '--color': ['#a688ed', '#f4bb57', '#79cbb0', '#ef9ebe'][i % 4] }} />)}</div>
    <div className="celebration-content">
      <button className="celebration-emblem" aria-label="Celebrar novamente" onClick={() => setBurst(n => n + 1)}>
        {reward.firstLessonToday ? <svg key={burst} className="animated-flame" viewBox="0 0 120 140" aria-hidden="true"><path className="flame-outer" d="M64 5C76 35 99 43 99 72c14-3 11-18 11-18 19 54-7 82-47 82C18 136-1 102 14 72c2 16 12 20 16 20C15 57 59 42 64 5Z" /><path className="flame-inner" d="M65 57c6 22 23 30 23 48 0 17-11 27-26 27-25 0-32-25-20-41 0 12 6 15 10 16-3-19 11-29 13-50Z" /></svg> : <Icons.Trophy size={65} strokeWidth={1.4} />}
      </button>
      <div className="eyebrow">UM PASSO A MAIS NA SUA JORNADA</div>
      <h2 id="celebration-title">{reward.title}</h2>
      <p id="celebration-description">{reward.subtitle}</p>
      {reward.xp > 0 && <div className="celebration-xp"><Icons.Zap size={21} fill="currentColor" /> +{reward.xp} XP</div>}
      {reward.firstLessonToday && <section className="flame-message"><strong>Sua chama está acesa! 🔥</strong><p>Primeira aula do dia concluída.</p><span>{reward.streak} {reward.streak === 1 ? 'dia de estudo' : 'dias seguidos de estudo'}</span></section>}
      {reward.level && <div className="level-reward"><Icons.Sparkles size={22} /><div><span>VOCÊ SUBIU DE NÍVEL</span><strong>Bem-vindo ao nível {reward.level}!</strong></div></div>}
      {reward.badges.length > 0 && <section className="celebration-badges"><h3>{reward.badges.length === 1 ? 'Emblema desbloqueado' : 'Emblemas desbloqueados'}</h3>{reward.badges.map(b => { const Badge = Icons[b.icon] || Icons.Award; return <div key={b.id} className="celebration-badge"><div className={`icon-tile ${b.color}`}><Badge size={27} /></div><div><strong>{b.title}</strong><p>{b.description}</p></div><Icons.CheckCircle2 size={18} /></div>; })}</section>}
      {storageError ? <p className="error-text">{storageError}</p> : <p className="celebration-saved"><Icons.CheckCircle2 size={14} /> Progresso salvo neste navegador</p>}
      {reward.project && <p className="small muted">{reward.projectGrade !== null && reward.projectGrade !== undefined
        ? `Projeto aprovado pelo Lumi com nota ${reward.projectGrade.toFixed(1)}, lendo o código que você publicou.`
        : 'Projeto concluído por sua autoavaliação dos requisitos.'}</p>}
      {reward.practice && <p className="small muted">Você acertou a prova rápida e as duas etapas de código produziram a saída esperada. Isso não verifica todas as possibilidades do programa.</p>}
      <button autoFocus className="button primary full celebration-confirm" onClick={onConfirm}>Confirmar e continuar <Icons.ArrowRight size={18} /></button>
      <span className="celebration-replay">Toque no {reward.firstLessonToday ? 'foguinho' : 'troféu'} para celebrar de novo.</span>
    </div>
  </dialog>;
}
