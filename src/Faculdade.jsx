import { useEffect, useState } from 'react';
import { Icon, Progress, irAoTopo } from './ui.jsx';
import {
  unidades,
  aulasDaUnidade,
  tarefasDaUnidade,
  aulasDaFaculdade,
  tarefasDaFaculdade,
  diasAteProva,
  FIM_DO_ESTUDO,
  DATA_PROVA,
  PRAZO_TRABALHO,
  porExtenso,
  emNumeros,
  requisitosFaltandoDaFaculdade,
  proximaAcaoDaFaculdade,
  planoDeEstudosDaFaculdade,
} from './faculdade.js';
import { localDate } from './progress.js';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { appendLumiNote } from './lumi-notes.js';
import CodeEditor from './CodeEditor.jsx';
import { ErrorHelp, OutputCompare } from './RunFeedback.jsx';
import Mentor from './Mentor.jsx';
import FaculdadeGuia from './FaculdadeGuia.jsx';
import ExercicioDaFaculdade from './FaculdadeExercicio.jsx';
import FaculdadeRevisao from './FaculdadeRevisao.jsx';
import PrevisaoDaSaida, { previsaoLiberada } from './PrevisaoDaSaida.jsx';
import { resumoDaRevisao, registrarResposta } from './faculdade-revisao.js';
import { girarAlternativas } from './faculdade-questoes.js';
import { ensinoDaFaculdade } from './faculdade-ensino.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import { exercicioDaUnidade } from './faculdade-exercicios.js';
import { entregasDaFaculdade } from './faculdade-entregas.js';
import { progressoDaUnidade, recompensasDaFaculdade, XP_FACULDADE, bonusDaEntrega } from './faculdade-recompensas.js';
import './lesson.css';
import './practice.css';
import './project-studio.css';
import './faculdade.css';
import './experience.css';
import './faculdade-mapa.css';
import './faculdade-revisao.css';

// A trilha da disciplina da faculdade, fora das oito etapas e sem trava: o semestre não espera
// o estudante terminar 48 aulas. A faculdade soma XP e conta o dia de estudo;
// o avanço nas oito etapas continua dependendo das atividades de cada etapa.
const itemDaFaculdade = (id) =>
  [...aulasDaFaculdade, ...projetosDaFaculdade].find(
    (item) => item.id === id,
  ) || null;

export default function Faculdade({
  state,
  update,
  navigate,
  initialItemId = null,
}) {
  const [aberta, setAberta] = useState(() => itemDaFaculdade(initialItemId));
  const [exercicio, setExercicio] = useState(null);
  // 'revisao' | 'simulado' | null — a preparação para a prova abre por cima da página.
  const [preparo, setPreparo] = useState(null);
  const recompensas = recompensasDaFaculdade(state);
  const progressoUnidades = unidades.map(u => progressoDaUnidade(state, u.id, recompensas));
  const concluidas = progressoUnidades.filter(u => u.concluida).map(u => u.id).join(',');
  const atual = progressoUnidades.find(u => !u.concluida)?.id || null;
  const [selecao, setSelecao] = useState(null);
  const unidadeAberta = selecao?.concluidas === concluidas ? selecao.id : atual;
  useEffect(() => {
    const item = itemDaFaculdade(initialItemId);
    if (item) setAberta(item);
  }, [initialItemId]);
  const feitas = state.faculdade?.feitas || [];
  if (preparo)
    return (
      <FaculdadeRevisao
        key={preparo}
        modo={preparo}
        state={state}
        update={update}
        voltar={() => {
          irAoTopo();
          setPreparo(null);
        }}
        trocarModo={(modo) => {
          irAoTopo();
          setPreparo(modo);
        }}
        abrirAula={(id) => {
          const item = itemDaFaculdade(id);
          if (!item) return;
          irAoTopo();
          setPreparo(null);
          setAberta(item);
        }}
      />
    );
  if (exercicio)
    return (
      <ExercicioDaFaculdade
        key={exercicio.id}
        exercicio={exercicio}
        state={state}
        update={update}
        voltar={() => {
          irAoTopo();
          setExercicio(null);
        }}
        feito={feitas.includes(exercicio.id)}
      />
    );
  if (aberta)
    return (
      <AulaDaFaculdade
        key={aberta.id}
        aula={aberta}
        state={state}
        update={update}
        voltar={() => {
          irAoTopo();
          setAberta(null);
        }}
        feita={feitas.includes(aberta.id)}
      />
    );

  const abrir = (aula) => {
    irAoTopo();
    setAberta(aula);
  };
  const total = aulasDaFaculdade.length;
  const pendentes = aulasDaFaculdade.filter(
    (aula) => !feitas.includes(aula.id),
  );
  const proximaAcao = proximaAcaoDaFaculdade(state);
  const revisaoDeHoje = resumoDaRevisao(state, localDate());
  const ultimoSimulado = (state.simuladosFaculdade || []).at(-1);
  const plano = planoDeEstudosDaFaculdade(state);
  const proxima = proximaAcao.aula;
  const estudadas = proximaAcao.feitas;
  const dias = diasAteProva();
  // O último dia é de revisão, então o ritmo se divide pelos dias de aula, não por todos os
  // dias restantes — contar o dia de revisão faria o plano parecer mais folgado do que é.
  const ritmo =
    dias > 0
      ? Math.max(1, plano.ritmoNecessario || Math.ceil(pendentes.length / Math.max(1, dias - 1)))
      : pendentes.length;
  return (
    <>
      <section className="hero faculdade-hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span /> LINGUAGEM DE PROGRAMAÇÃO · ANHANGUERA
          </div>
          <h2>
            O conteúdo da sua
            <br />
            disciplina, <em>rodando.</em>
          </h2>
          <p>
            As quatro unidades da disciplina em aulas curtas, exemplos
            executáveis e prática guiada — dos primeiros tipos de dados a
            bancos, testes e machine learning.
          </p>
          <div className="hero-foot">
            <Icon name="GraduationCap" size={14} /> {total} aulas <span>·</span>{' '}
            {estudadas} estudadas <span>·</span> {tarefasDaFaculdade.length}{' '}
            tarefas do professor
          </div>
        </div>
      </section>

      <section
        className="card prova-plano"
        aria-labelledby="titulo-plano-prova"
      >
        <div className="prova-plano-topo">
          <div>
            <div className="eyebrow">PLANO ATÉ {porExtenso(FIM_DO_ESTUDO).toUpperCase()} · PROVA {porExtenso(DATA_PROVA).toUpperCase()}</div>
            <h3 id="titulo-plano-prova">Preparação para a prova presencial</h3>
            <p>
              {pendentes.length === 0
                ? 'Conteúdo estudado. Agora revise os desafios sem olhar a resposta.'
                : dias > 0
                  ? `${dias} ${dias === 1 ? 'dia' : 'dias'} até a prova · faça ${ritmo} ${ritmo === 1 ? 'aula' : 'aulas'} por dia até ${porExtenso(FIM_DO_ESTUDO)} e use os dias seguintes para revisar.`
                  : 'A data da prova chegou. Priorize os exercícios marcados pelo professor.'}
            </p>
          </div>
          <div
            className="prova-medidor"
            aria-label={`${estudadas} de ${total} aulas estudadas`}
          >
            <strong>{estudadas}</strong>
            <span>/{total}</span>
            <small>estudadas</small>
          </div>
        </div>
        <div
          className="prova-progresso"
          role="progressbar"
          aria-label="Progresso das aulas da faculdade"
          aria-valuenow={Math.round((estudadas / total) * 100)}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span
            style={{ width: `${Math.round((estudadas / total) * 100)}%` }}
          />
        </div>
        {proxima && (
          <div className="prova-proxima">
            <div className="prova-proxima-context">
              <div className="eyebrow">PRÓXIMA AÇÃO</div>
              <strong>{proximaAcao.titulo}</strong>
              <p>{proximaAcao.explicacao}</p>
            </div>
            <button
              className="button primary prova-acao"
              aria-label={`${proximaAcao.concluida ? 'Revisar' : 'Estudar'} ${proxima.titulo}`}
              onClick={() => abrir(proxima)}
            >
              <span>
                <small>
                  {proximaAcao.concluida ? 'REVISAR' : 'COMECE AGORA'}
                </small>
                {proxima.titulo}
              </span>
              <Icon name="ArrowRight" size={18} />
            </button>
          </div>
        )}
        <p className="small prova-fonte">
          <Icon name="BookOpen" size={15} /> Conferido nos 8 PDFs: quatro
          apostilas completas e quatro apresentações que aprofundam a primeira
          aula de cada unidade.
        </p>
      </section>

      <section className="card plano-hoje" aria-labelledby="titulo-plano-hoje">
        <div className="step-head">
          <span className="icon-tile yellow">
            <Icon name="CalendarDays" size={20} />
          </span>
          <div>
            <div className="eyebrow">SEU PLANO DE HOJE</div>
            <h3 id="titulo-plano-hoje">
              Duas aulas curtas, um passo de cada vez
            </h3>
          </div>
        </div>
        {plano.hoje.tipo === 'revisao' ? (
          <>
            <p>
              Hoje é dia de revisão. Comece pelo que você errou e depois treine no formato da
              prova: múltipla escolha, com cronômetro.
            </p>
            <div className="button-row">
              <button className="button primary" onClick={() => { irAoTopo(); setPreparo('revisao'); }}>
                Revisar meus erros <Icon name="ArrowRight" size={16} />
              </button>
              <button className="button outline" onClick={() => { irAoTopo(); setPreparo('simulado'); }}>
                Fazer um simulado
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Para chegar preparado à prova, estude estas aulas hoje:</p>
            <div className="plano-hoje-lista">
              {plano.hoje.aulas.map((aula) => (
                <button
                  className="plano-hoje-item"
                  key={aula.id}
                  onClick={() => abrir(aula)}
                >
                  <span>{aula.titulo}</span>
                  <Icon name="ArrowRight" size={16} />
                </button>
              ))}
            </div>
          </>
        )}
        {plano.foraDoPlano?.length > 0 && (
          <div className="info-note" role="status">
            <Icon name="TriangleAlert" size={18} />
            <p>
              Duas aulas por dia é o limite do plano, e nesse ritmo{' '}
              <strong>
                {plano.foraDoPlano.length}{' '}
                {plano.foraDoPlano.length === 1 ? 'aula fica' : 'aulas ficam'} de
                fora
              </strong>{' '}
              até a prova: {plano.foraDoPlano.map((aula) => aula.titulo).join(', ')}.
              Para caber tudo seriam {plano.ritmoNecessario} por dia. Prefira usar
              o dia de revisão ou estudar uma a mais hoje, e não deixe essas para
              a véspera.
            </p>
          </div>
        )}
        <p className="small muted">
          O último dia fica reservado para revisar. O plano se ajusta sozinho
          quando você registra uma aula.
        </p>
      </section>

      <section className="card preparo-prova" aria-labelledby="titulo-preparo-prova">
        <div className="eyebrow">PROVA DE {porExtenso(DATA_PROVA).toUpperCase()} · MÚLTIPLA ESCOLHA</div>
        <h3 id="titulo-preparo-prova">Treine para a prova com o que você errou</h3>
        <p className="small">
          Cada resposta que você dá nos exercícios, nas revisões das aulas e nos simulados fica
          guardada. O que você erra volta no dia certo de rever, até ficar firme.
        </p>
        <div className="preparo-prova-acoes">
          <button onClick={() => { irAoTopo(); setPreparo('revisao'); }}>
            <Icon name="RotateCcw" size={20} />
            <span>
              <strong>Revisão de hoje</strong>
              <small>
                {revisaoDeHoje.pendentes
                  ? `${revisaoDeHoje.pendentes} ${revisaoDeHoje.pendentes === 1 ? 'questão para rever' : 'questões para rever'}`
                  : revisaoDeHoje.vistas ? 'Nada vencido hoje · ' + revisaoDeHoje.firmes + ' firmes' : 'Começa quando você responder'}
              </small>
            </span>
            <Icon name="ArrowRight" size={16} />
          </button>
          <button onClick={() => { irAoTopo(); setPreparo('simulado'); }}>
            <Icon name="Clock3" size={20} />
            <span>
              <strong>Simulado da prova</strong>
              <small>
                {ultimoSimulado
                  ? `Último: ${ultimoSimulado.acertos} de ${ultimoSimulado.total}`
                  : '10 ou 20 questões, com cronômetro'}
              </small>
            </span>
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>

      <details className="card como-estudar">
        <summary>
          <Icon name="Sparkles" size={17} />
          <span>
            <strong>Como estudar aqui sem se perder</strong>
            <small>Um roteiro simples para cada aula</small>
          </span>
          <Icon name="ChevronDown" size={16} />
        </summary>
        <div className="como-estudar-passos">
          <p>
            <b>1</b>
            <span>
              <strong>Leia as ideias</strong>
              <small>Entenda o conceito em poucas linhas.</small>
            </span>
          </p>
          <p>
            <b>2</b>
            <span>
              <strong>Execute o exemplo</strong>
              <small>Observe a saída antes de escrever.</small>
            </span>
          </p>
          <p>
            <b>3</b>
            <span>
              <strong>Resolva e explique</strong>
              <small>
                O desafio só conta quando sua lógica funciona e você acerta a
                revisão.
              </small>
            </span>
          </p>
        </div>
      </details>

      <section className="faculdade-recompensas card" aria-label="Recompensas da Faculdade">
        <div><span className="eyebrow">SEU ESFORÇO CONTA</span><h2>{recompensas.xp.toLocaleString('pt-BR')} XP na Faculdade</h2><p>As atividades que você já concluiu também contam. Refazer serve para revisar; a recompensa é recebida uma vez.</p></div>
        <div className="faculdade-recompensas-valores"><span>Aula <b>+100 XP</b></span><span>Miniprojeto <b>+250 XP</b></span><span>Exercício <b>+300 XP</b></span><span>Passo da entrega <b>+25 XP</b></span></div>
        <p className="small">Ao concluir a entrega prática, receba mais {bonusDaEntrega(entregasDaFaculdade[0])} a {bonusDaEntrega(entregasDaFaculdade[3])} XP de bônus, conforme a complexidade. Complete cada unidade para conquistar seu emblema.</p>
      </section>
      {/* O mapa é o mesmo de "Minha formação" — mesmas classes, mesmo zigue-zague em duas
          colunas —, para as duas trilhas se lerem do mesmo jeito. Por dentro, cada atividade é
          uma linha: antes a unidade aberta virava um bloco de mais de mil pixels, com a entrega,
          o miniprojeto e o exercício em cartões inteiros. O conteúdo das unidades fechadas fica
          no documento (hidden, não desmontado) para o atalho de teclado e a busca da página. */}
      <div className="learning-map faculdade-mapa" aria-label="Mapa das unidades da Faculdade">
        <div className="map-path" aria-hidden="true" />
        {unidades.map((unidade) => {
          const resumo = progressoUnidades.find((u) => u.id === unidade.id);
          const expandida = unidadeAberta === unidade.id;
          const aulas = aulasDaUnidade(unidade.id);
          const prontas = aulas.filter((a) => feitas.includes(a.id)).length;
          const entrega = entregasDaFaculdade.find((item) => item.unidade === unidade.id);
          const trabalho = state.faculdade?.entregas?.[entrega.id] || {};
          const passosConcluidos = new Set(trabalho.passosConcluidos || []);
          const proximoPasso = entrega.passos.find((passo) => !passosConcluidos.has(passo.id));
          const preRequisitosPendentes = entrega.preRequisitos.filter((id) => !feitas.includes(id));
          const projeto = projetosDaFaculdade.find((p) => p.unidade === unidade.id);
          const projetoFeito = projeto && feitas.includes(projeto.id);
          const exercicioUnidade = exercicioDaUnidade(unidade.id);
          const exercicioFeito = exercicioUnidade && feitas.includes(exercicioUnidade.id);
          const estado = resumo.concluida ? 'is-complete' : unidade.id === atual ? 'is-current' : 'is-open';
          return (
            <article
              className={`map-stage faculdade-mapa-unidade ${estado} ${expandida ? 'is-selected' : ''}`}
              key={unidade.id}
            >
              <button
                className="map-node faculdade-unidade-toggle"
                aria-expanded={expandida}
                aria-controls={`conteudo-${unidade.id}`}
                onClick={() => setSelecao({ id: expandida ? null : unidade.id, concluidas })}
              >
                <span className="map-index">
                  {resumo.concluida ? <Icon name="Check" size={20} /> : unidade.numero}
                </span>
                <span className="map-node-copy">
                  <small>
                    UNIDADE {unidade.numero} ·{' '}
                    {resumo.concluida ? 'CONQUISTADA' : unidade.id === atual ? 'SUA PRÓXIMA CONQUISTA' : 'CONTINUE APRENDENDO'}
                  </small>
                  <strong>{unidade.titulo}</strong>
                  <em>
                    {resumo.concluida
                      ? `Unidade completa · ${resumo.xp.toLocaleString('pt-BR')} XP · emblema conquistado`
                      : `${resumo.feitas} de ${resumo.total} atividades · ${resumo.xp.toLocaleString('pt-BR')} de ${resumo.xpMaximo.toLocaleString('pt-BR')} XP`}
                  </em>
                </span>
                <span className={`icon-tile ${unidade.cor}`}>
                  <Icon name={resumo.concluida ? 'Award' : unidade.icone} size={22} />
                </span>
              </button>

              <div
                id={`conteudo-${unidade.id}`}
                className="map-details faculdade-unidade-conteudo"
                hidden={!expandida}
              >
                <div className="map-progress">
                  <span>
                    {prontas} de {aulas.length} aulas · {resumo.atividadesFeitas} de {resumo.totalAtividades} atividades
                  </span>
                  <Progress
                    value={resumo.total ? (resumo.feitas / resumo.total) * 100 : 0}
                    label={`Progresso da Unidade ${unidade.numero}: ${resumo.feitas} de ${resumo.total}`}
                  />
                </div>
                <p className="faculdade-mapa-resumo">{unidade.resumo}</p>

                <div className="map-lessons">
                  {aulas.map((aula, indice) => {
                    const feita = feitas.includes(aula.id);
                    return (
                      <button
                        key={aula.id}
                        className={`faculdade-mapa-aula ${feita ? 'is-feita' : ''}`}
                        onClick={() => abrir(aula)}
                      >
                        <span>{feita ? <Icon name="CheckCircle2" size={18} /> : indice + 1}</span>
                        <strong>{aula.titulo}</strong>
                        <em>{aula.minutos} min · {XP_FACULDADE.aula} XP</em>
                      </button>
                    );
                  })}
                </div>

                {projeto && (
                  <button
                    className={`map-required faculdade-mapa-projeto ${projetoFeito ? 'is-feito' : ''}`}
                    onClick={() => abrir(projeto)}
                  >
                    <Icon name={projetoFeito ? 'CheckCircle2' : 'Hammer'} size={18} />
                    <span>
                      <strong>{projeto.titulo}</strong>
                      <small>
                        {projetoFeito
                          ? `Concluído · ${XP_FACULDADE.projeto} XP`
                          : `Miniprojeto que junta as ${aulas.length} aulas · +${XP_FACULDADE.projeto} XP`}
                      </small>
                    </span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                )}

                {exercicioUnidade && (
                  <button
                    className={`map-required faculdade-mapa-exercicio ${exercicioFeito ? 'is-feito' : ''}`}
                    onClick={() => {
                      irAoTopo();
                      setExercicio(exercicioUnidade);
                    }}
                  >
                    <Icon name={exercicioFeito ? 'CheckCircle2' : 'ListTodo'} size={18} />
                    <span>
                      <strong>{exercicioUnidade.titulo}</strong>
                      <small>
                        {exercicioFeito
                          ? `Acertou as ${exercicioUnidade.questoes.length} · ${XP_FACULDADE.exercicio} XP`
                          : `${exercicioUnidade.questoes.length} questões ${exercicioUnidade.recebido ? 'do AVA' : 'no formato do AVA'} · +${XP_FACULDADE.exercicio} XP`}
                      </small>
                    </span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                )}

                <button
                  className={`map-project faculdade-mapa-entrega ${resumo.entregaConcluida ? 'is-feito' : ''}`}
                  onClick={() => navigate('faculdade', { facultyItem: entrega.id })}
                >
                  <Icon name={resumo.entregaConcluida ? 'CheckCircle2' : 'FolderCode'} size={19} />
                  <span>
                    <small>
                      ENTREGA PRÁTICA · {passosConcluidos.size}/{entrega.passos.length} PASSOS · ATÉ {emNumeros(PRAZO_TRABALHO)}
                    </small>
                    <strong>{entrega.titulo}</strong>
                    <small>
                      {resumo.entregaConcluida
                        ? 'Pronta para o AVA · confira os arquivos antes de enviar'
                        : preRequisitosPendentes.length
                          ? `${preRequisitosPendentes.length} aulas-base pendentes · +${bonusDaEntrega(entrega)} XP ao concluir`
                          : proximoPasso
                            // "Próximo" para um passo que ficou para trás confundia quem estava em
                            // 7 de 9: o que falta não está adiante, está pulado.
                            ? `Falta concluir: ${proximoPasso.titulo} · +${bonusDaEntrega(entrega)} XP ao concluir`
                            : `Roteiro concluído · +${bonusDaEntrega(entrega)} XP ao concluir`}
                    </small>
                  </span>
                  <Icon name="ArrowRight" size={17} />
                </button>

                <details className="faculdade-tarefas">
                  <summary>Tarefas que o professor propõe nesta unidade</summary>
                  {tarefasDaUnidade(unidade.id).map((tarefa) => (
                    <div className="faculdade-tarefa" key={tarefa.id}>
                      <div className="eyebrow">{tarefa.origem}</div>
                      <strong>{tarefa.titulo}</strong>
                      <p>{tarefa.enunciado}</p>
                      <p className="small">Pratica: {tarefa.pratica.join(', ')}</p>
                    </div>
                  ))}
                  <p className="small muted">
                    Estas são as aplicações propostas na apostila e nos slides.
                    Resolva cada uma no Laboratório Python e guarde o arquivo: é o
                    que mais se parece com o que vai ser avaliado.
                  </p>
                </details>
              </div>
            </article>
          );
        })}
      </div>

      <div className="info-note">
        <Icon name="Info" size={18} />
        <p>
          Esta trilha segue a ementa da sua disciplina e não substitui as
          videoaulas do AVA. Aulas e atividades rendem XP, emblemas e contam o seu dia de estudo.
          As oito etapas da Formação mantêm seus próprios requisitos. As bibliotecas são
          baixadas na primeira execução, então a primeira vez demora alguns
          segundos.
        </p>
      </div>
      <div className="button-row">
        <button className="text-button" onClick={() => navigate('playground')}>
          <Icon name="FlaskConical" size={15} /> Abrir o Laboratório Python para
          resolver as tarefas
        </button>
      </div>
    </>
  );
}

function AulaDaFaculdade({ aula, state, update, voltar, feita }) {
  const ensino = ensinoDaFaculdade[aula.guia || aula.id];
  // A certa vinha sempre em A nas revisões das aulas e dos miniprojetos. Girar as alternativas
  // pelo id mantém a ordem estável entre visitas sem deixar a letra certa previsível.
  const idDaQuestao = aula.guia ? `projeto:${aula.id}` : `aula:${aula.id}`;
  const revisao = girarAlternativas({
    id: idDaQuestao,
    ...(aula.guia ? { ...aula, explicacao: aula.explicacao } : ensino.revisao),
  });
  const guardado = state.faculdade?.codigos?.[aula.id];
  const [saidaOk, setSaidaOk] = useState(false);
  const [resposta, setResposta] = useState(null);
  const [previsao, setPrevisao] = useState({ palpite: '', naoSei: false });
  const [aviso, setAviso] = useState('');
  const [diferenca, setDiferenca] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [celebrar, setCelebrar] = useState(0);
  const [requisitosPendentes, setRequisitosPendentes] = useState([]);
  const unidade = unidades.find((item) => item.id === aula.unidade);
  const codigo = guardado ?? aula.starter;
  const python = usePython({
    source: 'playground',
    title: `Faculdade · ${aula.titulo}`,
    expected: aula.esperado,
    onRecord: (tentativa) => update((s) => appendAttempt(s, tentativa)),
  });
  const exemploPython = usePython({
    title: `Exemplo da faculdade · ${aula.titulo}`,
  });
  const setCodigo = (valor) => {
    setSaidaOk(false);
    setAviso('');
    setDiferenca(null);
    setRequisitosPendentes([]);
    update((s) => ({
      ...s,
      faculdade: {
        ...s.faculdade,
        codigos: { ...s.faculdade?.codigos, [aula.id]: valor },
      },
    }));
  };
  const executar = () => {
    setAviso('');
    setDiferenca(null);
    python.run(codigo, '', (resultado) => {
      const bateSaida =
        resultado.ok && resultado.output.trim() === aula.esperado.trim();
      const faltando = bateSaida
        ? requisitosFaltandoDaFaculdade(aula, codigo)
        : [];
      const bate = bateSaida && faltando.length === 0;
      setRequisitosPendentes(faltando);
      setSaidaOk(bate);
      setTentativas((n) => (bate ? 0 : n + 1));
      setDiferenca(resultado.ok && !bateSaida ? resultado.output : null);
      setAviso(
        !resultado.ok
          ? 'Vamos ler o erro. A ajuda abaixo indica por onde começar.'
          : bate
            ? 'Saída correta. Agora responda à revisão para registrar a aula.'
            : bateSaida
              ? 'A saída bateu, mas o código ainda não demonstra a lógica pedida. Veja o item abaixo.'
              : 'A saída ficou diferente da esperada. Compare linha a linha.',
      );
      if (bate) setCelebrar((n) => n + 1);
    });
  };
  const pronta = saidaOk && resposta === revisao.resposta;
  const registrar = () => {
    if (!pronta) return;
    const hoje = localDate();
    update((s) => ({
      ...s,
      faculdade: {
        ...s.faculdade,
        feitas: [...new Set([...(s.faculdade?.feitas || []), aula.id])],
      },
      activities: {
        ...s.activities,
        [hoje]: [
          ...new Set([...(s.activities?.[hoje] || []), `faculdade:${aula.id}`]),
        ],
      },
    }));
    setAviso(feita ? 'Revisão registrada. Você já recebeu o XP desta atividade.' : `Atividade registrada: +${aula.id.startsWith('p') ? XP_FACULDADE.projeto : XP_FACULDADE.aula} XP. Ela também conta no seu dia de estudo.`);
  };

  return (
    <>
      <button
        className="text-button back"
        disabled={python.busy}
        onClick={voltar}
      >
        <Icon name="ArrowLeft" size={16} /> Voltar para a minha faculdade
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            UNIDADE {unidade?.numero || ''} · LINGUAGEM DE PROGRAMAÇÃO
          </div>
          <h1>{aula.titulo}</h1>
          <p>
            {aula.minutos} min {feita ? '· já estudada' : ''}
          </p>
        </div>
      </div>

      {aula.roteiro && (
        <section className="card faculdade-passo">
          <h2>Seu roteiro de construção</h2>
          <p>{aula.teoria[0]}</p>
          <ol className="faculdade-roteiro">
            {aula.roteiro.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p>
            Comece pelo primeiro passo. Execute a cada mudança e explique o
            resultado antes de seguir.
          </p>
        </section>
      )}
      {aula.guia ? (
        <details className="card faculdade-passo">
          <summary>Revisar a técnica antes de construir</summary>
          <FaculdadeGuia ensino={ensino} />
        </details>
      ) : (
        <FaculdadeGuia ensino={ensino} />
      )}

      {!aula.guia && (
        <details className="card faculdade-passo">
          <summary>Ampliar: conceitos e exemplo completo do material</summary>
          <div className="step-head">
            <span className="icon-tile purple">
              <Icon name="BookOpen" size={21} />
            </span>
            <div>
              <div className="eyebrow">PASSO 1 DE 3</div>
              <h3>Entenda em poucas ideias</h3>
            </div>
          </div>
          <div className="faculdade-ideias">
            {aula.teoria.map((paragrafo, indice) => (
              <div key={paragrafo}>
                <span>{indice + 1}</span>
                <p>{paragrafo}</p>
              </div>
            ))}
          </div>
          {aula.naFormacao?.length > 0 && (
            <div className="faculdade-conexao">
              <Icon name="Footprints" size={17} />
              <p>
                <strong>Também está na formação geral:</strong>{' '}
                {aula.naFormacao.join(' · ')}
                {aula.focoFaculdade && (
                  <>
                    <br />
                    <span>{aula.focoFaculdade}</span>
                  </>
                )}
              </p>
            </div>
          )}
          <section>
            <div className="step-head">
              <span className="icon-tile blue">
                <Icon name="Code2" size={21} />
              </span>
              <div>
                <div className="eyebrow">PASSO 2 DE 3</div>
                <h3>O exemplo do professor, rodando</h3>
              </div>
            </div>
            <p className="small">
              Este exemplo reúne mais assuntos do material. Use como
              aprofundamento; o treino guiado acima prepara o desafio desta
              aula.
            </p>
            {aula.notaAmbiente && (
              <div className="faculdade-limite">
                <Icon name="Info" size={16} />
                <p>{aula.notaAmbiente}</p>
              </div>
            )}
            <PrevisaoDaSaida
              estado={previsao}
              onChange={setPrevisao}
              saida={exemploPython.output}
              executado={exemploPython.success !== null && !exemploPython.busy}
              desativado={exemploPython.busy}
            />
            <CodeEditor
              code={aula.exemplo}
              readOnly
              busy={exemploPython.busy}
              onRun={() => exemploPython.run(aula.exemplo)}
              onStop={exemploPython.stop}
              output={exemploPython.output} imagens={exemploPython.imagens}
              success={exemploPython.success}
              filename={`${aula.id}-exemplo.py`}
              runLabel="Executar exemplo"
              runDisabled={!previsaoLiberada(previsao)}
              runDisabledHint="Escreva seu palpite para executar"
              emptyOutput="Escreva seu palpite acima e execute para conferir o que o código do professor produz."
            />
          </section>
        </details>
      )}

      <section className="card faculdade-passo">
        <div className="step-head">
          <span className="icon-tile orange">
            <Icon name="Target" size={21} />
          </span>
          <div>
            <div className="eyebrow">APLIQUE O QUE PRATICOU</div>
            <h3>Agora você</h3>
          </div>
        </div>
        <p className="coach-task">{aula.desafio}</p>
        <details className="coach-expected">
          <summary>Conferir a saída esperada</summary>
          <pre className="example-code">{aula.esperado}</pre>
        </details>
        <CodeEditor
          aoVivo={{
            inicial: aula.starter,
            lessonId: '',
            challenge: aula.desafio,
          }}
          code={codigo}
          onChange={setCodigo}
          busy={python.busy}
          onRun={executar}
          onStop={python.stop}
          output={python.output} imagens={python.imagens}
          success={python.success}
          celebrate={celebrar}
          inputRequest={python.inputRequest}
          onReply={python.reply}
          filename={`${aula.id}.py`}
          emptyOutput="Sua saída aparece aqui depois de executar."
        />
        {aviso && (
          <p role="status" className="practice-feedback">
            {aviso}
          </p>
        )}
        {requisitosPendentes.length > 0 && (
          <div className="faculdade-requisitos" role="status">
            <strong>Ainda falta mostrar no código:</strong>
            <ul>
              {requisitosPendentes.map((item) => (
                <li key={item.id}>{item.descricao}</li>
              ))}
            </ul>
          </div>
        )}
        {python.success === false && (
          <ErrorHelp output={python.output} code={codigo} />
        )}
        {diferenca !== null && (
          <OutputCompare actual={diferenca} expected={aula.esperado} />
        )}
        <Mentor
          activityId={`faculdade:${aula.id}`}
          lumiNotes={state.lumiNotes}
          onSaveNote={(nota) => update((s) => appendLumiNote(s, nota))}
          attempts={tentativas}
          history={state.history}
          title={`Faculdade · ${aula.titulo}`}
          challenge={aula.desafio}
          expected={aula.esperado}
          code={codigo}
          output={python.output} imagens={python.imagens}
          lessonId=""
          screenContext={{
            etapa: ensino.objetivo,
            feedback: aviso,
            perguntaRevisao: revisao.pergunta,
            pistas: ensino.passos.map((p) => `${p.codigo}\n${p.explicacao}`),
          }}
        />
      </section>

      <section className="card review faculdade-passo">
        <div className="step-head">
          <span className="icon-tile teal">
            <Icon name="BookOpenCheck" size={21} />
          </span>
          <div>
            <div className="eyebrow">REVISÃO DO QUE VOCÊ PRATICOU</div>
            <h3>Explique a ideia por trás do código</h3>
          </div>
        </div>
        <h4 className="review-question">{revisao.pergunta}</h4>
        {revisao.opcoes.map((opcao, i) => (
          <label
            className={`answer ${resposta === i ? 'selected' : ''}`}
            key={opcao}
          >
            <input
              type="radio"
              name={`rev-${aula.id}`}
              checked={resposta === i}
              onChange={() => {
                // Só a primeira escolha entra na revisão espaçada: é ela que mostra o que você
                // sabia. Trocar depois de ver o resultado não mede lembrança.
                if (resposta === null) {
                  update((s) => registrarResposta(s, idDaQuestao, i === revisao.resposta, localDate()));
                }
                setResposta(i);
              }}
            />
            <span>{String.fromCharCode(65 + i)}</span>
            {opcao}
          </label>
        ))}
        {resposta !== null && (
          <p
            role="status"
            className={
              resposta === revisao.resposta ? 'success-text' : 'error-text'
            }
          >
            {resposta === revisao.resposta
              ? 'Isso mesmo. '
              : 'Vamos rever a ideia. '}
            {revisao.explicacao}
          </p>
        )}
      </section>

      <div
        className={`complete-box ${feita ? 'is-complete' : pronta ? 'is-ready' : ''}`}
        aria-live="polite"
      >
        <div className="step-head">
          <span className={`icon-tile ${feita ? 'teal' : 'yellow'}`}>
            <Icon name={feita ? 'Trophy' : 'Target'} size={21} />
          </span>
          <div>
            <div className="eyebrow">
              {feita ? 'AULA REGISTRADA' : 'PARA REGISTRAR'}
            </div>
            <h3>
              {feita
                ? 'Esta aula já conta no seu estudo'
                : pronta
                  ? 'Tudo pronto'
                  : 'Faltam dois itens'}
            </h3>
          </div>
        </div>
        {!feita && (
          <ul className="complete-checklist">
            {[
              ['Desafio com a lógica pedida e a saída esperada', saidaOk],
              ['Revisão correta', resposta === revisao.resposta],
            ].map(([rotulo, ok]) => (
              <li key={rotulo} className={ok ? 'done' : ''}>
                <Icon name={ok ? 'CheckCircle2' : 'Circle'} size={16} />{' '}
                {rotulo}
              </li>
            ))}
          </ul>
        )}
        {!feita && (
          <button
            className="button primary full"
            disabled={!pronta || python.busy}
            aria-describedby={`portao-${aula.id}`}
            onClick={registrar}
          >
            Registrar esta aula <Icon name="Check" size={17} />
          </button>
        )}
        <p id={`portao-${aula.id}`} className="small">
          {feita
            ? 'Revisar é sempre bem-vindo: nada é perdido ao executar de novo.'
            : pronta
              ? 'Clique para registrar. Isso conta o dia de estudo, sem mexer nas oito etapas.'
              : 'Execute o desafio com a saída certa e acerte a revisão para liberar o registro.'}
        </p>
      </div>

      <div className="button-row">
        <button className="button outline" onClick={voltar}>
          <Icon name="ArrowLeft" size={16} /> Todas as aulas da faculdade
        </button>
      </div>
    </>
  );
}
