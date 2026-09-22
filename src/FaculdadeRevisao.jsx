import { useEffect, useRef, useState } from 'react';
import { Icon, Progress } from './ui.jsx';
import { localDate } from './progress.js';
import { girarAlternativas } from './faculdade-questoes.js';
import {
  filaDeRevisao,
  montarSimulado,
  corrigirSimulado,
  registrarResposta,
  registrarSimulado,
  registrarSessaoDeRevisao,
  SEGUNDOS_SUGERIDOS_POR_QUESTAO,
} from './faculdade-revisao.js';
import './lesson.css';
import './practice.css';
import './faculdade.css';
import './faculdade-revisao.css';

const NOMES_DAS_UNIDADES = { u1: 'Unidade 1', u2: 'Unidade 2', u3: 'Unidade 3', u4: 'Unidade 4' };
const relogio = (segundos) => `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

function Alternativas({ questao, escolhida, revelar, onEscolher, nome }) {
  return questao.opcoes.map((opcao, i) => {
    const marcada = escolhida === i;
    const certa = revelar && i === questao.resposta;
    return (
      <label
        key={opcao}
        className={`answer ${marcada ? 'selected' : ''} ${certa ? 'is-correct' : ''} ${revelar && marcada && !certa ? 'is-wrong' : ''}`}
      >
        <input type="radio" name={nome} checked={marcada} disabled={revelar} onChange={() => onEscolher(i)} />
        <span>{String.fromCharCode(65 + i)}</span>
        {opcao}
      </label>
    );
  });
}

function Enunciado({ questao }) {
  return (
    <>
      <div className="eyebrow questao-origem">{NOMES_DAS_UNIDADES[questao.unidade]} · {questao.origem}</div>
      <h3 className="review-question">{questao.enunciado}</h3>
      {questao.codigo && <pre className="example-code">{questao.codigo}</pre>}
    </>
  );
}

// Revisão espaçada: só o que está vencido hoje, primeiro o que mais se errou. Errar aqui
// devolve a questão para o fim desta mesma sessão — ela precisa ser acertada antes de sair.
function Revisao({ state, update, voltar, trocarModo, abrirAula }) {
  const hoje = localDate();
  // A fila é fixada ao abrir: responder uma questão muda a caixa dela, e recalcular a cada
  // render faria a pergunta atual sumir da tela no meio da resposta.
  const [fila, setFila] = useState(() => filaDeRevisao(state, hoje).map((q) => girarAlternativas(q, hoje)));
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [primeiras, setPrimeiras] = useState({});
  const [encerrada, setEncerrada] = useState(false);
  const questao = fila[indice];

  if (!fila.length) {
    return (
      <section className="card revisao-vazia">
        <Icon name="CheckCircle2" size={26} aria-hidden="true" />
        <h2>Nada para revisar hoje</h2>
        <p>
          A revisão traz de volta o que você errou, no dia certo de rever. Ela começa a se encher
          conforme você responde: nos exercícios de unidade, nas revisões das aulas e nos simulados.
          O jeito mais rápido de alimentá-la é fazer um simulado.
        </p>
        <div className="button-row">
          <button className="button primary" onClick={() => trocarModo('simulado')}>Fazer um simulado <Icon name="ArrowRight" size={16} /></button>
          <button className="button outline" onClick={voltar}>Voltar</button>
        </div>
      </section>
    );
  }

  if (encerrada) {
    const ids = Object.keys(primeiras);
    const acertos = ids.filter((id) => primeiras[id]).length;
    return (
      <section className="card revisao-resultado">
        <div className="eyebrow">REVISÃO DE HOJE CONCLUÍDA</div>
        <h2>{acertos} de {ids.length} certas na primeira tentativa</h2>
        <p>
          As que você acertou de primeira voltam daqui a alguns dias. As que errou continuam na
          revisão e aparecem de novo sempre que você voltar, até acertá-las de primeira. Repetir
          no intervalo certo é o que faz o conteúdo ficar.
        </p>
        <div className="button-row">
          <button className="button primary" onClick={() => trocarModo('simulado')}>Fazer um simulado <Icon name="ArrowRight" size={16} /></button>
          <button className="button outline" onClick={voltar}>Voltar para a faculdade</button>
        </div>
      </section>
    );
  }

  const respondida = escolha !== null;
  const acertou = escolha === questao.resposta;

  const escolher = (opcao) => {
    if (respondida) return;
    setEscolha(opcao);
    const certo = opcao === questao.resposta;
    // Só a primeira resposta desta sessão conta: a segunda vem depois de ler a explicação.
    if (!(questao.id in primeiras)) {
      setPrimeiras((atual) => ({ ...atual, [questao.id]: certo }));
      update((s) => registrarResposta(s, questao.id, certo, hoje));
    }
    if (!certo && !fila.slice(indice + 1).some((q) => q.id === questao.id)) {
      setFila((atual) => [...atual, questao]);
    }
  };

  const avancar = () => {
    if (indice + 1 >= fila.length) {
      update((s) => registrarSessaoDeRevisao(s, hoje));
      setEncerrada(true);
      return;
    }
    setIndice((n) => n + 1);
    setEscolha(null);
  };

  return (
    <section className="card exercicio-card">
      <div className="exercicio-topo">
        <div className="eyebrow">REVISÃO · {indice + 1} DE {fila.length}</div>
        <Progress value={(indice / fila.length) * 100} label={`Revisão: ${indice} de ${fila.length}`} />
      </div>
      <Enunciado questao={questao} />
      <Alternativas questao={questao} escolhida={escolha} revelar={respondida} onEscolher={escolher} nome={`rev-${questao.id}-${indice}`} />
      {respondida && (
        <div className={`exercicio-porque ${acertou ? 'acertou' : 'errou'}`} role="status">
          <strong>
            <Icon name={acertou ? 'CheckCircle2' : 'TriangleAlert'} size={17} /> {acertou ? 'Isso mesmo.' : 'Ainda não.'}
          </strong>
          <p>{questao.porque}</p>
          {!acertou && <p className="small">Esta questão volta no fim desta revisão, para você acertar antes de sair.</p>}
          {!acertou && questao.voltarPara && (
            <button className="text-button" onClick={() => abrirAula(questao.voltarPara)}>
              <Icon name="BookOpen" size={15} /> Rever a aula: {questao.origem}
            </button>
          )}
        </div>
      )}
      <div className="exercicio-navegacao">
        <button className="button outline" onClick={voltar}><Icon name="ArrowLeft" size={16} /> Sair</button>
        <button className="button primary" disabled={!respondida} onClick={avancar}>
          {indice + 1 >= fila.length ? 'Concluir revisão' : 'Próxima'} <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </section>
  );
}

// Simulado no formato da prova: múltipla escolha, cronômetro e nenhuma resposta até entregar.
// Dar a explicação durante tiraria o que ele mede — o que você já sabe sem ajuda.
function Simulado({ state, update, voltar, trocarModo, abrirAula }) {
  const hoje = localDate();
  const [fase, setFase] = useState('config');
  const [quantidade, setQuantidade] = useState(10);
  const [escopo, setEscopo] = useState('tudo');
  const [questoes, setQuestoes] = useState([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [aviso, setAviso] = useState('');
  const relogioRef = useRef(null);

  useEffect(() => () => clearInterval(relogioRef.current), []);

  const comecar = () => {
    setQuestoes(montarSimulado(state, { quantidade, escopo }));
    setRespostas({});
    setIndice(0);
    setSegundos(0);
    setAviso('');
    setFase('prova');
    clearInterval(relogioRef.current);
    relogioRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
  };

  const entregar = (confirmado = false) => {
    const emBranco = questoes.filter((q) => respostas[q.id] === undefined).length;
    if (emBranco && !confirmado) {
      setAviso(`${emBranco} ${emBranco === 1 ? 'questão está' : 'questões estão'} em branco e contam como erro. Clique em Entregar mesmo assim para confirmar.`);
      return;
    }
    clearInterval(relogioRef.current);
    const corrigido = corrigirSimulado(questoes, respostas, segundos);
    update((s) => registrarSimulado(s, questoes, corrigido, hoje));
    setResultado(corrigido);
    setFase('resultado');
  };

  if (fase === 'config') {
    const anteriores = state.simuladosFaculdade || [];
    const ultimo = anteriores[anteriores.length - 1];
    return (
      <section className="card simulado-config">
        <div className="eyebrow">SIMULADO DA PROVA · MÚLTIPLA ESCOLHA</div>
        <h2>Treine no formato da prova</h2>
        <p>
          Questões de múltipla escolha, com cronômetro e sem resposta até você entregar — como na
          prova presencial. No fim você vê o resultado por unidade e o motivo de cada erro, e as
          questões que errar entram na sua revisão.
        </p>
        <fieldset className="simulado-opcoes">
          <legend>Quantas questões</legend>
          {[10, 20].map((n) => (
            <label key={n} className={`answer ${quantidade === n ? 'selected' : ''}`}>
              <input type="radio" name="quantidade" checked={quantidade === n} onChange={() => setQuantidade(n)} />
              <span>{n}</span> {n} questões · cerca de {Math.round((n * SEGUNDOS_SUGERIDOS_POR_QUESTAO) / 60)} min
            </label>
          ))}
        </fieldset>
        <fieldset className="simulado-opcoes">
          <legend>O que cobrar</legend>
          <label className={`answer ${escopo === 'tudo' ? 'selected' : ''}`}>
            <input type="radio" name="escopo" checked={escopo === 'tudo'} onChange={() => setEscopo('tudo')} />
            <span>4</span> As quatro unidades, como na prova
          </label>
          <label className={`answer ${escopo === 'estudado' ? 'selected' : ''}`}>
            <input type="radio" name="escopo" checked={escopo === 'estudado'} onChange={() => setEscopo('estudado')} />
            <span>✓</span> Só as unidades que já estudei
          </label>
        </fieldset>
        {ultimo && <p className="small">Último simulado: {ultimo.acertos} de {ultimo.total} em {relogio(ultimo.segundos)}.</p>}
        <div className="button-row">
          <button className="button primary" onClick={comecar}>Começar simulado <Icon name="Play" size={16} /></button>
          <button className="button outline" onClick={voltar}>Voltar</button>
        </div>
      </section>
    );
  }

  if (fase === 'resultado') {
    const sugerido = questoes.length * SEGUNDOS_SUGERIDOS_POR_QUESTAO;
    const erradas = questoes.filter((q) => resultado.erradas.includes(q.id));
    return (
      <>
        <section className="card simulado-resultado">
          <div className="eyebrow">RESULTADO DO SIMULADO</div>
          <h2>{resultado.acertos} de {resultado.total} certas</h2>
          <p>
            Tempo: {relogio(resultado.segundos)} · sugerido {relogio(sugerido)}
            {resultado.segundos > sugerido ? ' — passou do tempo sugerido; na prova, pule a difícil e volte nela.' : '.'}
          </p>
          <div className="simulado-unidades">
            {Object.entries(resultado.porUnidade).map(([unidade, parcial]) => (
              <div key={unidade}>
                <span>{NOMES_DAS_UNIDADES[unidade]}</span>
                <Progress value={(parcial.acertos / parcial.total) * 100} label={`${NOMES_DAS_UNIDADES[unidade]}: ${parcial.acertos} de ${parcial.total}`} />
                <strong>{parcial.acertos}/{parcial.total}</strong>
              </div>
            ))}
          </div>
          <div className="button-row">
            {erradas.length > 0 && <button className="button primary" onClick={() => trocarModo('revisao')}>Revisar os erros agora <Icon name="ArrowRight" size={16} /></button>}
            <button className="button outline" onClick={() => setFase('config')}>Novo simulado</button>
            <button className="button outline" onClick={voltar}>Voltar</button>
          </div>
        </section>
        {erradas.map((questao) => (
          <section className="card exercicio-card simulado-erro" key={questao.id}>
            <Enunciado questao={questao} />
            <p className="small">
              Sua resposta: {respostas[questao.id] === undefined ? 'em branco' : `${String.fromCharCode(65 + respostas[questao.id])}) ${questao.opcoes[respostas[questao.id]]}`}
            </p>
            <p className="small"><strong>Certa: {String.fromCharCode(65 + questao.resposta)}) {questao.opcoes[questao.resposta]}</strong></p>
            <div className="exercicio-porque errou"><p>{questao.porque}</p></div>
            {questao.voltarPara && (
              <button className="text-button" onClick={() => abrirAula(questao.voltarPara)}>
                <Icon name="BookOpen" size={15} /> Rever a aula: {questao.origem}
              </button>
            )}
          </section>
        ))}
      </>
    );
  }

  const questao = questoes[indice];
  return (
    <section className="card exercicio-card">
      <div className="exercicio-topo">
        <div className="eyebrow">SIMULADO · QUESTÃO {indice + 1} DE {questoes.length}</div>
        <span className="simulado-relogio" aria-label={`Tempo decorrido: ${relogio(segundos)}`}>
          <Icon name="Clock3" size={15} /> {relogio(segundos)}
        </span>
      </div>
      <div className="exercicio-mapa" role="list" aria-label={`${Object.keys(respostas).length} de ${questoes.length} respondidas`}>
        {questoes.map((q, i) => (
          <button
            key={q.id}
            role="listitem"
            className={`exercicio-bolha ${i === indice ? 'atual' : ''} ${respostas[q.id] !== undefined ? 'respondida' : ''}`}
            aria-current={i === indice ? 'true' : undefined}
            aria-label={`Questão ${i + 1}${respostas[q.id] !== undefined ? ', respondida' : ', em branco'}`}
            onClick={() => setIndice(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <Enunciado questao={questao} />
      <Alternativas
        questao={questao}
        escolhida={respostas[questao.id] ?? null}
        revelar={false}
        onEscolher={(i) => { setAviso(''); setRespostas((atual) => ({ ...atual, [questao.id]: i })); }}
        nome={`sim-${questao.id}`}
      />
      <div className="exercicio-navegacao">
        <button className="button outline" disabled={indice === 0} onClick={() => setIndice((n) => n - 1)}>
          <Icon name="ArrowLeft" size={16} /> Anterior
        </button>
        {indice + 1 < questoes.length ? (
          <button className="button primary" onClick={() => setIndice((n) => n + 1)}>Próxima <Icon name="ArrowRight" size={16} /></button>
        ) : (
          <button className="button primary" onClick={() => entregar(Boolean(aviso))}>Entregar <Icon name="Check" size={16} /></button>
        )}
      </div>
      {aviso && <p className="practice-feedback" role="status">{aviso}</p>}
    </section>
  );
}

export default function FaculdadeRevisao({ modo, state, update, voltar, trocarModo, abrirAula }) {
  return (
    <>
      <button className="text-button back" onClick={voltar}>
        <Icon name="ArrowLeft" size={16} /> Voltar para a minha faculdade
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREPARAÇÃO PARA A PROVA</div>
          <h1>{modo === 'simulado' ? 'Simulado da prova' : 'Revisão dos seus erros'}</h1>
        </div>
      </div>
      {modo === 'simulado'
        ? <Simulado key="simulado" state={state} update={update} voltar={voltar} trocarModo={trocarModo} abrirAula={abrirAula} />
        : <Revisao key="revisao" state={state} update={update} voltar={voltar} trocarModo={trocarModo} abrirAula={abrirAula} />}
    </>
  );
}
