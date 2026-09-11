import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { askMentor, localHelp, mentorAvailable, mentorSteps, taughtUpTo, warmMentor, MAX_LEVEL, MENTOR_MODEL } from './mentor.js';
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
  return <div className="lumi-flight" aria-hidden="true">
    <div className="lumi-bob"><LumiArt size={26} /></div>
  </div>;
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
export default function Mentor({ title, challenge, expected, code, output, lessonId = '', attempts = 0 }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState(1);
  const [replies, setReplies] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [question, setQuestion] = useState('');
  const abort = useRef(null);
  const context = { title, challenge, expected, code, output, taught: taughtUpTo(lessonId) };

  // Cada execução nova é um problema novo: a escada recomeça do primeiro degrau.
  useEffect(() => { setLevel(1); setReplies({}); }, [output]);
  // Na terceira tentativa seguida sem sair do lugar, o Lumi aparece sozinho — quem está
  // travado de verdade costuma insistir no mesmo erro em vez de pedir ajuda.
  useEffect(() => { if (attempts >= 3) setOpen(true); }, [attempts]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    mentorAvailable(controller.signal).then(result => {
      setStatus(result);
      if (result.ok) warmMentor(controller.signal);
    });
    return () => controller.abort();
  }, [open]);
  // A primeira pergunta só pode sair depois de saber que a IA está no ar; antes disso o
  // estudante já está lendo a ajuda garantida, que não depende de nada.
  useEffect(() => {
    if (open && status?.ok && !busy && replies[level] === undefined) ask(level);
  }, [open, status, level, busy, replies]);

  const ask = async (nextLevel, freeQuestion = '') => {
    setLevel(nextLevel);
    if (!status?.ok) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setReplies(current => ({ ...current, [nextLevel]: '' }));
    try {
      await askMentor({
        context, level: nextLevel, question: freeQuestion, signal: controller.signal,
        onToken: partial => setReplies(current => ({ ...current, [nextLevel]: partial }))
      });
    } catch (error) {
      if (!controller.signal.aborted) setReplies(current => ({ ...current, [nextLevel]: `__falhou__${error.message}` }));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const step = mentorSteps[level - 1];
  const reply = replies[level];
  const failed = typeof reply === 'string' && reply.startsWith('__falhou__');

  if (!open) return <button className="lumi-call" onClick={() => setOpen(true)}>
    <LumiArt size={30} />
    <span><strong>Travou? Chama o Lumi</strong><small>Ele te ajuda a achar sozinho</small></span>
  </button>;

  return <section className="mentor" aria-label="Ajuda do Lumi">
    <header className="mentor-head">
      <LumiArt size={40} awake={!busy} />
      <div>
        <h4>Lumi</h4>
        <p>{busy ? 'Pensando…' : status?.ok ? 'Eu ilumino o caminho, você dá os passos.' : 'Usando as dicas que já vêm comigo.'}</p>
      </div>
      <button className="icon-button" aria-label="Fechar a ajuda do Lumi" onClick={() => { abort.current?.abort(); setOpen(false); }}><Icon name="X" size={17} /></button>
    </header>

    <div className="mentor-ladder" aria-label="Degraus de ajuda">
      {mentorSteps.map(item => <span key={item.level} className={`mentor-rung ${item.level < level ? 'past' : item.level === level ? 'now' : ''}`} title={item.reveals} />)}
      <small>Degrau {level} de {MAX_LEVEL} · {step.reveals}</small>
    </div>

    <div className="mentor-body">
      {/* No degrau 1 a ajuda escrita termina numa pergunta. Se o Lumi já fez a dele, sobra
          a mesma pergunta duas vezes — então guardamos só a parte factual do erro. */}
      {(reply && !failed && level === 1 ? localHelp(context, level).slice(0, 1) : localHelp(context, level))
        .map(line => <p key={line} className="mentor-sure">{line}</p>)}
      {/* O texto vai dentro de um span: sem ele, cada <strong> e <code> vira uma coluna do
          flex e a frase se parte em pedaços desalinhados. */}
      {status && !status.ok && <p className="mentor-offline">
        <Icon name="PlugZap" size={15} />
        <span>{status.reason === 'modelo'
          ? <>O Ollama está ligado, mas falta o modelo <code>{MENTOR_MODEL}</code>. No terminal: <code>ollama pull {MENTOR_MODEL}</code>.</>
          : remoto
            ? <>Aqui eu não converso: a conversa usa uma IA que roda no computador de quem estuda, e esta página não alcança nenhuma. <strong>Tudo acima é escrito e funciona em qualquer aparelho</strong> — é o que costuma bastar para destravar um erro. Quem tiver a IA própria pode ligá-la em Configurações.</>
            : <>A IA local está desligada. Abra o aplicativo <strong>Ollama</strong> para conversar comigo; sem ele, as dicas acima continuam valendo.</>}</span>
      </p>}
      {failed && <p className="mentor-offline"><Icon name="TriangleAlert" size={15} /> <span>Não consegui responder agora ({reply.replace('__falhou__', '')}). As dicas acima continuam valendo.</span></p>}
      {reply && !failed && <div className="mentor-reply"><Rich text={reply} /></div>}
      {busy && !reply && <p className="mentor-typing"><span /><span /><span /></p>}
    </div>

    <footer className="mentor-actions">
      {level < MAX_LEVEL
        ? <button className="button outline" disabled={busy} onClick={() => ask(level + 1)}>
            <Icon name="ArrowUp" size={15} /> {mentorSteps[level].label}
          </button>
        : <p className="mentor-final"><Icon name="Sprout" size={15} /> Agora escreva com suas palavras por que aquilo resolveu. Explicar é o que fixa.</p>}
      {status?.ok && <form className="mentor-ask" onSubmit={event => { event.preventDefault(); if (!question.trim() || busy) return; ask(level, question.trim()); setQuestion(''); }}>
        <input value={question} onChange={event => setQuestion(event.target.value)} placeholder="Pergunte com suas palavras…" aria-label="Pergunte ao Lumi" />
        <button className="icon-button" aria-label="Enviar pergunta" disabled={busy || !question.trim()}><Icon name="SendHorizontal" size={17} /></button>
      </form>}
    </footer>
  </section>;
}
