import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { askMentor, localHelp, mentorAvailable, mentorSteps, taughtUpTo, warmMentor, MAX_LEVEL, MENTOR_MODEL } from './mentor.js';
import { contextoVisivel, orientacoesAnteriores } from './contexto-do-lumi.js';
import './mentor.css';

// O Lumi é um vaga-lume: ele ilumina o caminho, não caminha por você.
// A arte segue o mesmo desenho à mão do projeto (paleta roxo/amarelo, traço arredondado).
// No computador, "abra o Ollama" resolve. Num celular abrindo o site publicado, esse conselho
// é impossível de seguir: não há Ollama ali. O aviso precisa dizer a verdade de cada lugar.
const remoto = typeof location !== 'undefined' && !['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);

export function LumiArt({ size = 34, awake = true }) {
  return <svg className={`lumi-art ${awake ? 'is-awake' : ''}`} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
    <ellipse className="lumi-glow" cx="32" cy="42" rx="17" ry="15" fill="#f3d775" />
    <path d="M17 28c-6-5-13-6-15-2s4 10 11 11" fill="#cbb9f0" opacity=".75" />
    <path d="M47 28c6-5 13-6 15-2s-4 10-11 11" fill="#cbb9f0" opacity=".75" />
    <ellipse cx="32" cy="40" rx="13" ry="14" fill="#6c50bb" />
    <ellipse cx="32" cy="47" rx="9" ry="8" fill="#f3d775" />
    <circle cx="27" cy="36" r="2.6" fill="#fff" />
    <circle cx="37" cy="36" r="2.6" fill="#fff" />
    <circle cx="27.7" cy="36.6" r="1.3" fill="#2f2545" />
    <circle cx="37.7" cy="36.6" r="1.3" fill="#2f2545" />
    <path d="M25 24c-1-5-4-7-7-8M39 24c1-5 4-7 7-8" stroke="#6c50bb" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="17" cy="15" r="3" fill="#f3d775" />
    <circle cx="47" cy="15" r="3" fill="#f3d775" />
  </svg>;
}

// Um vaga-lume de verdade atravessa o cômodo devagar. Ele não clica em nada (pointer-events
// none), fica discreto e some por completo para quem pediu menos movimento no sistema.
export function FlyingLumi() {
  return <><div className="lumi-flight" aria-hidden="true">
    <div className="lumi-bob"><LumiArt size={26} /></div>
  </div><ConnectionStatus /></>;
}

function ConnectionStatus() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online ? null : <div className="connection-status" role="status"><Icon name="TriangleAlert" size={15} /><span>Sem internet: aulas e progresso local continuam disponíveis. O Lumi e a nuvem voltam quando a conexão retornar.</span></div>;
}

// O modelo responde em markdown simples. Em vez de carregar uma biblioteca, tratamos os
// três casos que ele realmente usa: bloco de código, código no meio da frase e negrito.
function Rich({ text }) {
  return text.split(/(```[\s\S]*?(?:```|$))/).filter(Boolean).map((piece, index) => {
    if (!piece.startsWith('```')) return <p key={index}>{inline(piece.trim())}</p>;
    const code = piece.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '');
    return <pre key={index} className="mentor-code">{code.trim()}</pre>;
  });
}
const inline = text => text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).filter(Boolean).map((piece, index) => {
  if (piece.startsWith('`')) return <code key={index}>{piece.slice(1, -1)}</code>;
  if (piece.startsWith('**')) return <strong key={index}>{piece.slice(2, -2)}</strong>;
  return <span key={index}>{piece}</span>;
});

// attempts conta as tentativas sem sucesso e vem de fora de propósito: durante cada execução o
// estado volta a "rodando", este componente é desmontado e qualquer contagem interna zeraria.
//
// O painel é uma conversa, não uma sequência de dicas prontas. Ele abria disparando a dica do
// primeiro degrau sozinho, e enquanto ela vinha o campo de pergunta ficava bloqueado: quem
// abria para perguntar alguma coisa esperava por uma resposta que não tinha pedido. Agora ele
// abre pronto para ouvir, e a escada continua ali para quem quiser mais profundidade.
export default function Mentor({ title, challenge, expected, code, output, lessonId = '', attempts = 0, history = [], activityId = '', lumiNotes = [], onSaveNote = null, screenContext = {} }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState(1);
  const [conversa, setConversa] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [question, setQuestion] = useState('');
  const abort = useRef(null);

  // As respostas já dadas viram turnos anteriores: o degrau 2 continua de onde o 1 parou.
  const replies = Object.fromEntries(conversa
    .filter(turno => turno.de === 'lumi' && turno.texto)
    .map(turno => [turno.nivel, turno.texto]));
  const previousGuidance = orientacoesAnteriores(lumiNotes, activityId, lessonId);
  const visibleContext = contextoVisivel(screenContext);
  const context = { title, challenge, expected, code, output, lessonId, history, taught: taughtUpTo(lessonId), replies, previousGuidance, visibleContext };

  // Cada execução nova é um problema novo: a escada recomeça e a conversa anterior sai da tela.
  useEffect(() => { setLevel(1); setConversa([]); }, [output]);
  // Na terceira tentativa seguida sem sair do lugar, o Lumi aparece sozinho — quem está travado
  // de verdade costuma insistir no mesmo erro em vez de pedir ajuda.
  useEffect(() => { if (attempts >= 3) setOpen(true); }, [attempts]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    mentorAvailable(controller.signal).then(resultado => {
      setStatus(resultado);
      if (resultado.ok) warmMentor(controller.signal);
    });
    return () => controller.abort();
  }, [open]);

  const perguntar = async (proximoNivel, texto = '') => {
    if (busy) return;
    setLevel(proximoNivel);
    const minha = texto.trim();
    setConversa(atual => [
      ...atual,
      ...(minha ? [{ de: 'voce', texto: minha }] : []),
      { de: 'lumi', nivel: proximoNivel, texto: '', pergunta: minha }
    ]);
    const escreverTurno = patch => setConversa(atual => atual.map((turno, indice) => (indice === atual.length - 1 ? { ...turno, ...patch } : turno)));
    const registrar = (tip, fonte) => onSaveNote?.({
      id: `${activityId}:${Date.now()}`,
      at: new Date().toISOString(),
      activityId, lessonId: lessonId || activityId,
      title, level: proximoNivel,
      question: minha || mentorSteps[proximoNivel - 1].label,
      tip, fonte
    });
    // Com a IA desligada a ajuda escrita continua valendo, e agora também chega ao diário: o
    // estudante pediu ajuda de verdade, e o registro disso é o que alimenta a próxima revisão.
    if (!status?.ok) {
      const escrita = localHelp(context, proximoNivel).join(' ');
      escreverTurno({ texto: escrita });
      registrar(escrita, 'escrita');
      return;
    }
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    const escrever = escreverTurno;
    try {
      const resposta = await askMentor({
        context, level: proximoNivel, question: minha, signal: controller.signal,
        onToken: parcial => { if (!controller.signal.aborted) escrever({ texto: parcial }); }
      });
      if (controller.signal.aborted) return;
      // A limpeza esvazia quando a resposta revelaria algo que o degrau ainda não permite.
      if (!resposta.trim()) {
        if (minha && proximoNivel < MAX_LEVEL) {
          // Ele perguntou: ignorar seria pior do que subir. O degrau sobe à vista dele, com
          // custo, em vez de a pergunta virar silêncio ou uma dica genérica.
          escrever({ texto: `Para responder isso eu preciso subir um degrau — vou para o ${proximoNivel + 1}.` });
          setBusy(false);
          return perguntar(proximoNivel + 1, minha);
        }
        escrever({ texto: localHelp(context, proximoNivel).join(" ") });
        return;
      }
      escrever({ texto: resposta });
      // Fica registrada a orientação, não a resposta pronta: serve para o diário e o relatório
      // mostrarem onde ele pediu ajuda, sem virar um caderno de respostas.
      // id, at e lessonId não são enfeite: sem eles normalizeLumiNotes descarta a nota em
      // silêncio, e a conversa não chega ao diário nem ao relatório.
      registrar(resposta, 'ia');
    } catch (erro) {
      if (!controller.signal.aborted) escrever({ falhou: erro.message });
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const degrau = mentorSteps[level - 1];
  const jaExecutou = String(output || '').trim().length > 0;

  if (!open) return <button className="lumi-call" onClick={() => setOpen(true)}>
    <LumiArt size={30} />
    <span><strong>Travou? Chama o Lumi</strong><small>Pergunte com suas palavras, quando quiser</small></span>
  </button>;

  return <section className="mentor" aria-label="Ajuda do Lumi">
    <header className="mentor-head">
      <LumiArt size={40} awake={!busy} />
      <div>
        <h4>Lumi</h4>
        {/* Estado dito com todas as letras: sem isso o painel parecia travado enquanto pensava. */}
        <p>{busy ? 'Pensando…'
          : status === null ? 'Vendo se a IA está no ar…'
          : status.ok ? 'Pronto. Pergunte o que quiser sobre este exercício.'
          : 'Sem IA agora: valem as dicas escritas.'}</p>
      </div>
      <button className="icon-button" aria-label="Fechar a ajuda do Lumi" onClick={() => { abort.current?.abort(); setOpen(false); }}><Icon name="X" size={17} /></button>
    </header>

    <div className="mentor-ladder" aria-label="Degraus de ajuda">
      {mentorSteps.map(item => <span key={item.level} className={`mentor-rung ${item.level < level ? 'past' : item.level === level ? 'now' : ''}`} title={item.reveals} />)}
      <small>Degrau {level} de {MAX_LEVEL} · {degrau.reveals}</small>
    </div>

    <div className="mentor-body">
      {/* A ajuda escrita abre a conversa e não depende de nada estar ligado. */}
      {localHelp(context, level).map(linha => <p key={linha} className="mentor-sure">{linha}</p>)}

      {/* O texto vai dentro de um span: sem ele, cada <strong> e <code> vira uma coluna do flex
          e a frase se parte em pedaços desalinhados. */}
      {status && !status.ok && <p className="mentor-offline">
        <Icon name="PlugZap" size={15} />
        <span>{status.reason === 'modelo'
          ? <>O Ollama está ligado, mas falta o modelo <code>{MENTOR_MODEL}</code>. No terminal: <code>ollama pull {MENTOR_MODEL}</code>.</>
          : remoto
            ? <>Aqui eu não converso: a conversa usa uma IA que roda no computador de quem estuda, e esta página não alcança nenhuma. <strong>Tudo acima é escrito e funciona em qualquer aparelho</strong>. Quem tiver a IA própria pode ligá-la em Configurações.</>
            : <>A IA local está desligada. Abra o aplicativo <strong>Ollama</strong> para conversar comigo; sem ele, as dicas acima continuam valendo.</>}</span>
      </p>}

      {conversa.map((turno, indice) => {
        if (turno.de === 'voce') return <p key={indice} className="mentor-bolha is-voce"><span>{turno.texto}</span></p>;
        if (turno.falhou) return <p key={indice} className="mentor-offline"><Icon name="TriangleAlert" size={15} /> <span>Não consegui responder agora ({turno.falhou}). As dicas acima continuam valendo.</span></p>;
        if (!turno.texto) return <p key={indice} className="mentor-typing"><span /><span /><span /></p>;
        return <div key={indice} className="mentor-bolha is-lumi"><LumiArt size={20} /><div><Rich text={turno.texto} /></div></div>;
      })}
    </div>

    <footer className="mentor-actions">
      {status?.ok && <form className="mentor-ask" onSubmit={evento => {
        evento.preventDefault();
        if (!question.trim() || busy) return;
        perguntar(level, question);
        setQuestion('');
      }}>
        <input value={question} onChange={evento => setQuestion(evento.target.value)} placeholder="Pergunte com suas palavras…" aria-label="Pergunte ao Lumi" />
        <button className="button primary" disabled={busy || !question.trim()}><Icon name="SendHorizontal" size={16} /> Enviar pergunta</button>
      </form>}

      <div className="mentor-atalhos">
        {level < MAX_LEVEL
          ? <button className="button outline" disabled={busy} onClick={() => perguntar(level + 1)}>
              <Icon name="ArrowUp" size={15} /> {mentorSteps[level].label}
            </button>
          : <p className="mentor-final"><Icon name="Sprout" size={15} /> Agora escreva com suas palavras por que aquilo resolveu. Explicar é o que fixa.</p>}
        {status?.ok && jaExecutou && <button className="button outline" disabled={busy} onClick={() => perguntar(level, 'Comente o meu código: o que está bom e o que dá para melhorar?')}>
          <Icon name="Eye" size={15} /> Comentar meu código
        </button>}
      </div>
    </footer>
  </section>;
}
