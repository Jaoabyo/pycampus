import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { mentorAvailable } from './mentor.js';
import { reviewCode } from './code-review.js';
import './explain.css';

// A conferência do código, depois de a saída bater. Duas camadas, nesta ordem:
//
// 1. Requisitos medidos em JavaScript (ver requisitos.js). São cegos ao formato: não olham nome
//    de variável nem estrutura, só se a resposta foi calculada em vez de digitada.
// 2. A leitura do Lumi. Ela comenta sempre, e quando um requisito medido não reconheceu um
//    caminho legítimo, é ela que libera — porque quem escreveu diferente e certo não pode
//    ficar preso numa regra automática.
//
// O Lumi nunca é consultado com a saída errada: isso é medido antes e não se discute.
export default function CodeReview({ lesson, codigo, saida, faltando, aprovacao, onAprovacao }) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const abort = useRef(null);
  const pendente = faltando.length > 0;
  const valida = aprovacao && aprovacao.codigo === codigo ? aprovacao : null;

  // Trocar o código invalida a leitura anterior: ela era sobre outro programa.
  useEffect(() => () => abort.current?.abort(), []);

  const conferir = async () => {
    setErro(''); setBusy(true);
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const disponivel = await mentorAvailable(controller.signal);
      if (!disponivel.ok) throw new Error('A IA local está desligada. Abra o aplicativo Ollama para eu ler seu código.');
      const leitura = await reviewCode({ lesson, codigo, saida, signal: controller.signal });
      onAprovacao({ ...leitura, codigo });
    } catch (falha) {
      if (!controller.signal.aborted) setErro(falha.message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return <section className={`code-review${pendente && !valida?.cumpre ? ' is-pending' : ''}`} role="note">
    {pendente && !valida?.cumpre && <div className="code-review-block">
      <h5><Icon name="Target" size={15} /> A saída está certa, mas o objetivo da aula ainda não</h5>
      <p>{lesson.objective}</p>
      <ul>{faltando.map(item => <li key={item.id}>{item.descricao}</li>)}</ul>
      <p className="small">Se você resolveu de outro jeito e acha que cumpriu, peça a conferência abaixo: o Lumi lê seu código e decide.</p>
    </div>}

    <button className="text-button" disabled={busy} onClick={conferir}>
      <Icon name="Sparkles" size={15} /> {busy ? 'O Lumi está lendo seu código…' : valida ? 'Pedir outra conferência' : pendente ? 'Pedir ao Lumi para conferir meu código' : 'Pedir ao Lumi um comentário sobre meu código'}
    </button>
    {erro && <p className="explain-error" role="alert"><Icon name="TriangleAlert" size={14} /> <span>{erro}</span></p>}
    {erro && pendente && <p className="small">Com o Lumi desligado, vale só a conferência automática acima. Ajuste o código e execute de novo.</p>}

    {valida && <div className="explain-card">
      <div className="explain-head"><LumiArt size={26} /><span>{valida.cumpre ? 'Confere: seu código cumpre a aula' : 'Ainda não cumpre o objetivo'}</span></div>
      <div className={`explain-block${valida.cumpre ? ' is-good' : ''}`}>
        <h5><Icon name={valida.cumpre ? 'CheckCircle2' : 'Target'} size={14} /> {valida.cumpre ? 'Por quê' : 'O que faltou'}</h5>
        <p>{valida.porque}</p>
      </div>
      {valida.melhorias.length > 0 && <div className="explain-block">
        <h5><Icon name="Lightbulb" size={14} /> Sobre a sua abordagem</h5>
        <ul>{valida.melhorias.map(linha => <li key={linha}>{linha}</li>)}</ul>
      </div>}
      <p className="small">Leitura feita pela IA local no seu computador. Ela olha se o código cumpre o objetivo da aula, não se você escreveu do jeito esperado.</p>
    </div>}
  </section>;
}
