import { useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { mentorAvailable } from './mentor.js';
import { reviewExplanation } from './explanation-review.js';
import './explain.css';

// Leitura da explicação escrita. Comenta e pergunta; nunca marca etapa como concluída nem
// concede XP — o que libera progresso continua sendo prova respondida e código executado.
export default function ExplainReview({ subject, reference, explanation, enunciado = '' }) {
  // A leitura ficava na tela depois de o estudante mudar ou apagar o texto: a captura dele
  // mostrava "Sua explicação está completa" com o campo vazio. Guardo o texto que foi lido.
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abort = useRef(null);
  const written = String(explanation || '').trim();

  const ask = async () => {
    setError(''); setReview(null); setBusy(true);
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const availability = await mentorAvailable(controller.signal);
      if (!availability.ok) throw new Error('A IA local está desligada. Abra o aplicativo Ollama para eu ler sua explicação.');
      setReview({ ...await reviewExplanation({ subject, reference, explanation: written, enunciado, signal: controller.signal }), lidoDe: written });
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return <div className="explain-review">
    <button className="text-button" disabled={busy || !written} onClick={ask}>
      <Icon name="Sparkles" size={15} /> {busy ? 'O Lumi está lendo…' : review?.lidoDe === written ? 'Pedir outra leitura' : 'Pedir ao Lumi para ler minha explicação'}
    </button>
    {!written && <span className="explain-hint">Escreva sua explicação para o Lumi poder lê-la.</span>}
    {error && <p className="explain-error" role="alert"><Icon name="TriangleAlert" size={14} /> <span>{error}</span></p>}
    {review?.lidoDe === written && <div className="explain-card">
      <div className="explain-head"><LumiArt size={26} /><span>{review.suficiente ? 'Sua explicação está completa' : 'O que eu vi na sua explicação'}</span></div>
      {review.acertou.length > 0 && <div className="explain-block is-good">
        <h5><Icon name="CheckCircle2" size={14} /> Você acertou</h5>
        <ul>{review.acertou.map(line => <li key={line}>{line}</li>)}</ul>
      </div>}
      {review.faltou.length > 0 && <div className="explain-block">
        <h5><Icon name="Target" size={14} /> Ficou faltando dizer</h5>
        <ul>{review.faltou.map(line => <li key={line}>{line}</li>)}</ul>
      </div>}
      {review.pergunta && <p className="explain-question"><Icon name="Lightbulb" size={15} /> <span>{review.pergunta}</span></p>}
      {review.suficiente && <p className="explain-suficiente"><Icon name="CheckCircle2" size={15} /> <span>Não ficou faltando nada. Você explicou o essencial deste assunto.</span></p>
      }
      <p className="small">Isto é uma leitura para você melhorar o texto. Não vale XP e não marca nenhuma etapa como concluída.</p>
    </div>}
  </div>;
}
