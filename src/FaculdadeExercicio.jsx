import { useState } from 'react';
import { Icon } from './ui.jsx';
import { localDate } from './progress.js';
import { registrarResposta } from './faculdade-revisao.js';
import './lesson.css';
import './practice.css';
import './faculdade.css';

// O exercício de unidade, no formato do AVA — mas com o motivo aparecendo depois da escolha.
//
// Registrar exige acertar as cinco, e a resposta pode ser trocada depois de ler a explicação.
// A intenção não é a nota: é chegar à prova presencial — também de múltipla escolha — sabendo
// por que a alternativa certa é certa, e não só reconhecendo uma resposta já vista.

export default function ExercicioDaFaculdade({ exercicio, state, update, voltar, feito }) {
  const [respostas, setRespostas] = useState({});
  const [indice, setIndice] = useState(0);
  const [aviso, setAviso] = useState('');
  const questoes = exercicio.questoes;
  const questao = questoes[indice];
  const escolhida = respostas[questao.id];
  const respondida = escolhida !== undefined;
  const acertou = escolhida === questao.resposta;
  const respondidas = questoes.filter((q) => respostas[q.id] !== undefined).length;
  const acertos = questoes.filter((q) => respostas[q.id] === q.resposta).length;
  const completo = acertos === questoes.length;

  const escolher = (opcao) => {
    setAviso('');
    // A primeira escolha em cada questão vai para a revisão espaçada. Antes as respostas
    // erradas daqui sumiam — justamente as que mais valia rever antes da prova.
    if (respostas[questao.id] === undefined) {
      update((s) => registrarResposta(s, questao.id, opcao === questao.resposta, localDate()));
    }
    setRespostas((atual) => ({ ...atual, [questao.id]: opcao }));
  };

  const registrar = () => {
    if (!completo) return;
    const hoje = localDate();
    update((s) => ({
      ...s,
      faculdade: {
        ...s.faculdade,
        feitas: [...new Set([...(s.faculdade?.feitas || []), exercicio.id])],
      },
      activities: {
        ...s.activities,
        [hoje]: [
          ...new Set([...(s.activities?.[hoje] || []), `faculdade:${exercicio.id}`]),
        ],
      },
    }));
    setAviso(feito ? 'Revisão registrada. Você já recebeu os 300 XP deste exercício.' : 'Exercício registrado: +300 XP. Ele também conta no seu dia de estudo.');
  };

  return (
    <>
      <button className="text-button back" onClick={voltar}>
        <Icon name="ArrowLeft" size={16} /> Voltar para a minha faculdade
      </button>

      <div className="page-heading">
        <div>
          <div className="eyebrow">{exercicio.origem}</div>
          <h1>{exercicio.titulo}</h1>
          <p>
            {questoes.length} questões {feito ? '· já registrado' : ''}
          </p>
        </div>
      </div>

      {!exercicio.recebido && (
        <div className="info-note">
          <Icon name="Info" size={18} />
          <p>
            Este banco foi escrito a partir da apostila desta unidade, no formato do AVA. Ele
            não é o exercício oficial: serve para você treinar o mesmo tipo de pergunta antes
            de abrir o do AVA.
          </p>
        </div>
      )}

      <section className="card exercicio-card">
        <div className="exercicio-topo">
          <div className="eyebrow">
            QUESTÃO {indice + 1} DE {questoes.length}
          </div>
          <div
            className="exercicio-mapa"
            role="list"
            aria-label={`${respondidas} de ${questoes.length} questões respondidas`}
          >
            {questoes.map((q, i) => {
              const marcada = respostas[q.id] !== undefined;
              const certa = respostas[q.id] === q.resposta;
              return (
                <button
                  key={q.id}
                  role="listitem"
                  className={`exercicio-bolha ${i === indice ? 'atual' : ''} ${
                    marcada ? (certa ? 'certa' : 'errada') : ''
                  }`}
                  aria-current={i === indice ? 'true' : undefined}
                  aria-label={`Questão ${i + 1}${
                    marcada ? (certa ? ', correta' : ', incorreta') : ', sem resposta'
                  }`}
                  onClick={() => {
                    setAviso('');
                    setIndice(i);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <h3 className="review-question">{questao.enunciado}</h3>
        {questao.codigo && (
          <pre className="example-code">{questao.codigo}</pre>
        )}

        {questao.opcoes.map((opcao, i) => {
          const estaEscolhida = escolhida === i;
          const revelaCerta = respondida && i === questao.resposta;
          return (
            <label
              key={opcao}
              className={`answer ${estaEscolhida ? 'selected' : ''} ${
                revelaCerta ? 'is-correct' : ''
              } ${estaEscolhida && !acertou ? 'is-wrong' : ''}`}
            >
              <input
                type="radio"
                name={`ex-${questao.id}`}
                checked={estaEscolhida}
                onChange={() => escolher(i)}
              />
              <span>{String.fromCharCode(65 + i)}</span>
              {opcao}
            </label>
          );
        })}

        {respondida && (
          <div
            className={`exercicio-porque ${acertou ? 'acertou' : 'errou'}`}
            role="status"
          >
            <strong>
              <Icon name={acertou ? 'CheckCircle2' : 'TriangleAlert'} size={17} />{' '}
              {acertou ? 'Isso mesmo.' : 'Ainda não.'}
            </strong>
            <p>{questao.porque}</p>
            {!acertou && (
              <p className="small">
                Leia de novo e escolha outra alternativa: a resposta pode ser trocada.
              </p>
            )}
          </div>
        )}

        <div className="exercicio-navegacao">
          <button
            className="button outline"
            disabled={indice === 0}
            onClick={() => {
              setAviso('');
              setIndice((n) => n - 1);
            }}
          >
            <Icon name="ArrowLeft" size={16} /> Anterior
          </button>
          <button
            className="button primary"
            disabled={indice === questoes.length - 1}
            onClick={() => {
              setAviso('');
              setIndice((n) => n + 1);
            }}
          >
            Próxima <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>

      <div
        className={`complete-box ${feito ? 'is-complete' : completo ? 'is-ready' : ''}`}
        aria-live="polite"
      >
        <div className="step-head">
          <span className={`icon-tile ${feito ? 'teal' : 'yellow'}`}>
            <Icon name={feito ? 'Trophy' : 'Target'} size={21} />
          </span>
          <div>
            <div className="eyebrow">
              {feito ? 'EXERCÍCIO REGISTRADO' : 'PARA REGISTRAR'}
            </div>
            <h3>
              {acertos} de {questoes.length} corretas
            </h3>
          </div>
        </div>
        {!feito && (
          <button
            className="button primary full"
            disabled={!completo}
            onClick={registrar}
          >
            Registrar este exercício <Icon name="Check" size={17} />
          </button>
        )}
        <p className="small">
          {feito
            ? 'Refazer é bem-vindo: nada é perdido ao responder de novo.'
            : completo
              ? 'Você acertou todas. Clique para registrar o dia de estudo.'
              : 'Acerte as cinco para registrar. Depois de ler o motivo, você pode trocar a resposta.'}
        </p>
        {aviso && (
          <p role="status" className="practice-feedback">
            {aviso}
          </p>
        )}
      </div>

      <div className="button-row">
        <button className="button outline" onClick={voltar}>
          <Icon name="ArrowLeft" size={16} /> Todas as aulas da faculdade
        </button>
      </div>
    </>
  );
}
