import { useState } from 'react';
import './guidance.css';
import { simpleExplanations, beginnerNotes } from './simple-explanations.js';

export function SimpleConcept({ lesson }) {
  return <div className="simple-concept">{simpleExplanations[lesson.id].map(text => <p key={text}>{text}</p>)}{beginnerNotes[lesson.id] && <dl className="plain-glossary">{beginnerNotes[lesson.id].map(([term, meaning]) => <div key={term}><dt><code>{term}</code></dt><dd>{meaning}</dd></div>)}</dl>}<details className="concept-details"><summary>Ver a explicação completa</summary>{lesson.theory.map((text, i) => <p key={i}>{text}</p>)}</details><p className="lesson-next-step">Agora acompanhe o exemplo abaixo, uma parte por vez. Depois, use esse modelo no seu exercício.</p></div>;
}

export function LessonOrientation({ lesson, lessons, completed, openLesson }) {
  const required = lesson.prerequisites.map(id => lessons.find(l => l.id === id));
  return <section className="card lesson-orientation"><div className="eyebrow">UM PASSO DE CADA VEZ</div><h3>Nesta aula, você vai aprender a…</h3><p>{lesson.objective}</p>{required.length > 0 && <details><summary>O que já usamos antes — revisar se precisar</summary><div className="prerequisite-links">{required.map(item => <button className="text-button" key={item.id} onClick={() => openLesson(item.id)}>{completed.includes(item.id) ? '✓' : '↗'} {item.title}</button>)}</div><p className="small muted">Esses links ajudam a revisar; não bloqueiam seu acesso se você aprendeu fora da plataforma.</p></details>}</section>;
}
export function ExampleWalkthrough({ lesson }) {
  const [active, setActive] = useState(0);
  const selected = lesson.walkthrough[active];
  return <section className="example-walkthrough"><h3>Vamos ler esse código juntos</h3><p className="small muted">Veja o que cada parte faz antes de tentar o desafio.</p><div className="walkthrough-tabs" aria-label="Passos do exemplo">{lesson.walkthrough.map((_, index) => <button key={index} aria-pressed={active === index} onClick={() => setActive(index)}>Passo {index + 1}</button>)}</div><div className="walkthrough-step" aria-live="polite"><pre>{selected.code}</pre><p>{selected.explanation}</p></div>{active < lesson.walkthrough.length - 1 && <button className="text-button" onClick={() => setActive(n => n + 1)}>Próximo passo →</button>}</section>;
}
export function GuidedHints({ lesson }) {
  const [count, setCount] = useState(1);
  return <section className="hint guided-hints"><strong>Uma pista de cada vez</strong>{lesson.hints.slice(0, count).map((hint, index) => <p key={index}><b>{index + 1}.</b> {hint}</p>)}{count < lesson.hints.length && <button className="text-button" onClick={() => setCount(n => n + 1)}>Mostrar outra dica →</button>}</section>;
}
export function ProjectPreparation({ project, lessons, openLesson }) {
  return <section className="project-preparation"><h3>Antes de começar</h3><div className="prerequisite-links">{project.prerequisites.map(id => <button className="text-button" key={id} onClick={() => openLesson(id)}>↗ {lessons.find(l => l.id === id).title}</button>)}</div><p>{project.preparation}</p>{project.preparationLink && <a className="text-button" href={project.preparationLink} target="_blank" rel="noreferrer">Abrir tutorial preparatório oficial ↗</a>}<details><summary>Depois da primeira versão</summary><p>{project.extensions}</p></details></section>;
}
