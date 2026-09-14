import { Fragment } from 'react';
import { readError, readingSteps } from './error-guide.js';
import { styleTips } from './style-tips.js';
import './feedback.css';

// Quando o programa roda mas a saída não bate, mostrar onde exatamente ela diverge ensina mais que avisar que está diferente.
export function OutputCompare({ actual, expected }) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return null;
  const mine = actual.replace(/\s+$/, '').split('\n'), target = expected.replace(/\s+$/, '').split('\n');
  const rows = Array.from({ length: Math.max(mine.length, target.length) }, (_, i) => ({ mine: mine[i], target: target[i], same: mine[i] === target[i] }));
  return <section className="run-help run-help-compare" role="note">
    <h4>Sua saída e a esperada, linha por linha</h4>
    <div className="compare-grid">
      <span className="compare-head">Você obteve</span><span className="compare-head">Esperado</span>
      {rows.map((row, i) => <Fragment key={i}>
        <code className={row.same ? '' : 'differs'}>{row.mine ?? '(nada nesta linha)'}</code>
        <code className={row.same ? '' : 'differs'}>{row.target ?? '(nada nesta linha)'}</code>
      </Fragment>)}
    </div>
    <p className="run-help-note">Olhe as linhas destacadas. Espaços, acentos e maiúsculas contam: Ana e ana são saídas diferentes.</p>
  </section>;
}

export function ErrorHelp({ output, code }) {
  const error = readError(output, code);
  if (!error) return null;
  return <section className="run-help run-help-error" role="note">
    <h4>Como ler este erro</h4>
    <p className="run-help-type"><strong>{error.type}</strong>{error.line ? ` · linha ${error.line}` : ''} — {error.title}</p>
    <p>{error.meaning}</p>
    <ul>{error.steps.map(step => <li key={step}>{step}</li>)}</ul>
    <details><summary>O método que serve para qualquer erro</summary><ol>{readingSteps.map(step => <li key={step}>{step}</li>)}</ol></details>
  </section>;
}

export function StyleTips({ code, show }) {
  const tips = show ? styleTips(code).slice(0, 2) : [];
  if (!tips.length) return null;
  return <section className="run-help run-help-style" role="note">
    <h4>Funcionou. {tips.length === 1 ? 'Uma ideia' : 'Duas ideias'} para deixar o código mais legível</h4>
    <ul>{tips.map(tip => <li key={tip.id}>{tip.message}</li>)}</ul>
    <p className="run-help-note">Estilo não muda o resultado nem atrapalha a conclusão do exercício. É o hábito que faz outra pessoa — ou você mesmo em outro dia — entender o código rápido.</p>
  </section>;
}
