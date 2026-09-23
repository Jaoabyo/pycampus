import { Icon } from './ui.jsx';
import './faculdade.css';

// A aula mostrava guia, degraus, código do professor, desafio e revisão de uma vez, com dois
// editores na mesma tela. O estudante disse: "tem muita coisa na tela em vez de só a atividade
// passo a passo". Agora a aula é uma etapa por vez, e esta barra diz onde ele está.
export const ETAPAS_DA_AULA = [
  { titulo: 'Aprender', dica: 'Leia um trecho por vez.' },
  { titulo: 'Construir', dica: 'Monte, um degrau por vez.' },
  { titulo: 'Professor', dica: 'O código do material. Pode pular.' },
  { titulo: 'Desafio', dica: 'Agora faça sozinho.' },
  { titulo: 'Revisar', dica: 'Uma pergunta e pronto.' },
];

export function EtapasDaAula({ etapa, onIr }) {
  const atual = ETAPAS_DA_AULA[etapa];
  return (
    <nav className="aula-etapas" aria-label="Etapas da aula">
      <p className="aula-etapas-onde">
        Etapa {etapa + 1} de {ETAPAS_DA_AULA.length}: <strong>{atual.titulo}</strong> · {atual.dica}
      </p>
      <ol>
        {ETAPAS_DA_AULA.map((item, i) => (
          <li key={item.titulo}>
            <button
              type="button"
              className={i === etapa ? 'atual' : i < etapa ? 'feita' : ''}
              aria-current={i === etapa ? 'step' : undefined}
              onClick={() => onIr(i)}
            >
              <span>{i < etapa ? <Icon name="Check" size={13} aria-hidden="true" /> : i + 1}</span>
              {item.titulo}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function NavegacaoDasEtapas({ etapa, onIr, voltar }) {
  const proxima = ETAPAS_DA_AULA[etapa + 1];
  return (
    <div className="button-row aula-etapas-navegacao">
      {etapa > 0 ? (
        <button className="button outline" onClick={() => onIr(etapa - 1)}>
          <Icon name="ArrowLeft" size={16} /> Voltar
        </button>
      ) : (
        <button className="button outline" onClick={voltar}>
          <Icon name="ArrowLeft" size={16} /> Todas as aulas
        </button>
      )}
      {proxima ? (
        <button className="button primary" onClick={() => onIr(etapa + 1)}>
          Próxima: {proxima.titulo} <Icon name="ArrowRight" size={16} />
        </button>
      ) : (
        <button className="button outline" onClick={voltar}>
          Todas as aulas <Icon name="ArrowRight" size={16} />
        </button>
      )}
    </div>
  );
}
