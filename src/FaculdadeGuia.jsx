import { useState } from 'react';
import { Icon, irAoTopo } from './ui.jsx';
import { usePython } from './useTrackedPython.js';
import CodeEditor from './CodeEditor.jsx';
import './faculdade.css';

export default function FaculdadeGuia({ ensino }) {
  const [passo, setPasso] = useState(0);
  const [codigo, setCodigo] = useState(ensino.codigo);
  const [feedback, setFeedback] = useState('');
  const python = usePython({ title: 'Prática guiada da faculdade' });
  const atual = ensino.passos[passo];
  const mudarPasso = (indice) => {
    setPasso(indice);
    irAoTopo();
  };
  return (
    <section
      className="card faculdade-passo faculdade-guia"
      aria-labelledby="guia-objetivo"
    >
      <div className="eyebrow">APRENDA UM TRECHO POR VEZ</div>
      <h2 id="guia-objetivo">{ensino.objetivo}</h2>
      <p>
        Leia o trecho e sua explicação. Você pode voltar quantas vezes precisar.
        Depois vamos alterar um exemplo juntos, antes do desafio.
      </p>
      <nav className="faculdade-guia-nav" aria-label="Conceitos desta aula">
        {ensino.passos.map((_, i) => (
          <button
            key={i}
            aria-current={i === passo ? 'step' : undefined}
            onClick={() => mudarPasso(i)}
          >
            Trecho {i + 1}
          </button>
        ))}
      </nav>
      <div className="faculdade-trecho" aria-live="polite">
        <h3>
          Trecho {passo + 1} de {ensino.passos.length}
        </h3>
        <pre className="example-code">{atual.codigo}</pre>
        <p>{atual.explicacao}</p>
      </div>
      <div className="button-row">
        <button
          className="button outline"
          disabled={passo === 0}
          onClick={() => mudarPasso(passo - 1)}
        >
          Voltar um trecho
        </button>
        {passo < ensino.passos.length - 1 && (
          <button
            className="button primary"
            onClick={() => mudarPasso(passo + 1)}
          >
            Próximo trecho <Icon name="ArrowRight" size={16} />
          </button>
        )}
      </div>
      {passo === ensino.passos.length - 1 && (
        <div className="faculdade-treino">
          <h3>Vamos praticar com uma mudança pequena</h3>
          <p>
            O exemplo completo está abaixo. Execute como está para ver o
            resultado. Depois substitua <code>{ensino.treino.antes}</code> por{' '}
            <code>{ensino.treino.depois}</code>. Antes de executar de novo,
            pense: o que vai mudar na saída?
          </p>
          <CodeEditor
            code={codigo}
            onChange={(valor) => {
              setCodigo(valor);
              setFeedback('');
            }}
            busy={python.busy}
            onRun={() =>
              python.run(codigo, '', (resultado) =>
                setFeedback(
                  resultado.ok &&
                    resultado.output.trim() === ensino.treino.saida
                    ? 'A saída da alteração bateu. Explique qual valor mudou e por que ele produziu esse resultado. Depois siga para o desafio.'
                    : resultado.ok
                      ? 'Observe a saída. Faça a mudança indicada acima e execute novamente para comparar.'
                      : 'A execução encontrou um erro. Compare o trecho editado com o exemplo explicado acima.',
                ),
              )
            }
            onStop={python.stop}
            output={python.output}
            success={python.success}
            filename="treino-guiado.py"
            runLabel="Executar treino guiado"
          />
          {feedback && <p role="status">{feedback}</p>}
          <details>
            <summary>Conferir o resultado da mudança</summary>
            <pre className="example-code">{ensino.treino.saida}</pre>
            <p>
              Conferir a saída ajuda a verificar a alteração; conseguir explicar
              o motivo é a parte principal deste treino.
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
