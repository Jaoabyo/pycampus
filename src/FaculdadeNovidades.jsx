import { Icon } from './ui.jsx';
import './faculdade.css';

// Mostrado logo antes do código do professor e nos passos das entregas: cada coisa que aquele
// código usa e o guia ainda não tinha mostrado, com o que ela faz no próprio exemplo. Sem isto,
// o código do material chegava inteiro de uma vez, cheio de nomes nunca vistos.
export default function NovidadesDoCodigo({ pontes }) {
  if (!pontes?.length) return null;
  return (
    <section className="faculdade-novidades" aria-label="O que este código traz de novo">
      <div className="faculdade-novidades-topo">
        <Icon name="Sparkles" size={17} aria-hidden="true" />
        <strong>
          {pontes.length === 1 ? '1 coisa nova' : `${pontes.length} coisas novas`} neste código
        </strong>
      </div>
      <p>O guia ainda não tinha mostrado isto. Leia antes de executar; o resto você já viu.</p>
      <dl>
        {pontes.map((ponte) => (
          <div key={ponte.mostra}>
            <dt><pre>{ponte.mostra}</pre></dt>
            <dd>{ponte.explicacao}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
