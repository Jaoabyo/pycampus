import { Icon, Progress } from './ui.jsx';
import { panoramaDaFaculdade } from './faculdade-integrada.js';
import './faculdade.css';

export default function FaculdadeIntegrada({
  state,
  navigate,
  variant = 'dashboard',
}) {
  const dados = panoramaDaFaculdade(state);
  const percentual = dados.total ? (dados.estudadas / dados.total) * 100 : 0;

  if (variant === 'dashboard')
    return (
      <section className="card faculdade-integrada faculdade-integrada-dashboard">
        <div className="step-head">
          <span className="icon-tile purple">
            <Icon name="GraduationCap" size={21} />
          </span>
          <div>
            <div className="eyebrow">
              SUA FACULDADE TAMBÉM FAZ PARTE DO CAMPUS
            </div>
            <h2>Próximo conteúdo da disciplina</h2>
          </div>
        </div>
        <h3>{dados.proxima.titulo}</h3>
        <p>
          Aprenda um conceito por vez, pratique com uma mudança pequena e só
          depois resolva o desafio.
        </p>
        <Progress
          value={percentual}
          label={`Aulas da faculdade estudadas: ${dados.estudadas} de ${dados.total}`}
        />
        <div className="faculdade-integrada-footer">
          <span>
            {dados.estudadas}/{dados.total} aulas · {dados.projetosConcluidos}/4
            projetos
          </span>
          <button
            className="button primary"
            onClick={() =>
              navigate('faculdade', { facultyItem: dados.proxima.id })
            }
          >
            Continuar na faculdade <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>
    );

  if (variant === 'projetos')
    return (
      <section className="faculdade-integrada faculdade-integrada-projetos">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PROJETOS DA DISCIPLINA</div>
            <h2>Use o conteúdo da faculdade em sistemas pequenos</h2>
          </div>
          <button className="text-button" onClick={() => navigate('faculdade')}>
            Abrir trilha acadêmica <Icon name="ArrowRight" size={15} />
          </button>
        </div>
        <div className="faculdade-projetos-grid">
          {dados.unidades.map((unidade) => (
            <button
              className="card faculdade-projeto-resumo"
              key={unidade.id}
              onClick={() =>
                navigate('faculdade', { facultyItem: unidade.projeto.id })
              }
            >
              <span className={`icon-tile ${unidade.cor}`}>
                <Icon name={unidade.icone} size={20} />
              </span>
              <small>UNIDADE {unidade.numero}</small>
              <h3>{unidade.projeto.titulo}</h3>
              <p>{unidade.projeto.teoria[0]}</p>
              <span>
                {state.faculdade?.feitas?.includes(unidade.projeto.id)
                  ? 'Projeto registrado'
                  : `${unidade.estudadas}/${unidade.aulas.length} aulas estudadas`}
              </span>
              <Icon
                className="faculdade-projeto-seta"
                name="ArrowRight"
                size={17}
              />
            </button>
          ))}
        </div>
      </section>
    );

  return (
    <section className="card faculdade-integrada faculdade-integrada-formacao">
      <div className="section-heading">
        <div>
          <div className="eyebrow">TRILHA ACADÊMICA INTEGRADA</div>
          <h2>Linguagem de Programação · Anhanguera</h2>
          <p>
            As aulas da disciplina aparecem aqui junto à sua formação, com
            prática e projetos próprios.
          </p>
        </div>
        <button
          className="button outline"
          onClick={() => navigate('faculdade')}
        >
          Abrir modo de estudo
        </button>
      </div>
      <div className="faculdade-unidades-resumo">
        {dados.unidades.map((unidade) => (
          <details key={unidade.id}>
            <summary>
              <span>Unidade {unidade.numero}</span>
              <strong>{unidade.titulo}</strong>
              <small>
                {unidade.estudadas}/{unidade.aulas.length} aulas
              </small>
            </summary>
            <ul>
              {unidade.aulas.map((aula) => (
                <li key={aula.id}>
                  <button
                    onClick={() =>
                      navigate('faculdade', { facultyItem: aula.id })
                    }
                  >
                    {aula.titulo}
                    <Icon name="ArrowRight" size={14} />
                  </button>
                </li>
              ))}
              <li className="is-project">
                <button
                  onClick={() =>
                    navigate('faculdade', { facultyItem: unidade.projeto.id })
                  }
                >
                  <Icon name="FolderCode" size={14} /> {unidade.projeto.titulo}
                  <Icon name="ArrowRight" size={14} />
                </button>
              </li>
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
