import { useState } from 'react';
import { Icon } from './ui.jsx';
import { usePython } from './useTrackedPython.js';
import CodeEditor from './CodeEditor.jsx';
import { ErrorHelp } from './RunFeedback.jsx';
import { degrausDaFaculdade, separarSonda } from './faculdade-degraus.js';
import './project-studio.css';
import './faculdade.css';

// Um editor só, que atravessa todos os degraus: o código de um degrau é o ponto de partida do
// seguinte, como quando se constrói algo de verdade. Um degrau só abre depois que o anterior
// passou na conferência do gráfico desenhado.
export default function FaculdadeDegraus({ aulaId, state, update }) {
  const trilha = degrausDaFaculdade[aulaId];
  const salvo = state.faculdade?.degraus?.[aulaId];
  const feitos = salvo?.feitos || 0;
  const codigo = salvo?.codigo ?? trilha?.inicial ?? '';
  const [resultado, setResultado] = useState(null);
  const [celebrar, setCelebrar] = useState(0);
  const python = usePython({ source: 'playground', title: `Faculdade · degraus · ${aulaId}` });
  if (!trilha) return null;

  const atualIndice = Math.min(feitos, trilha.degraus.length - 1);
  const atual = trilha.degraus[atualIndice];
  const terminou = feitos >= trilha.degraus.length;
  const guardar = (mudanca) => update((s) => ({
    ...s,
    faculdade: {
      ...s.faculdade,
      degraus: {
        ...s.faculdade?.degraus,
        [aulaId]: { feitos, codigo, ...s.faculdade?.degraus?.[aulaId], ...mudanca },
      },
    },
  }));
  const executar = () => {
    setResultado(null);
    // A sonda vai depois do código, para o número de linha de um erro continuar sendo o do estudante.
    const programa = trilha.sonda ? `${codigo}
${trilha.sonda}` : codigo;
    python.run(programa, '', (resultado) => {
      if (!resultado.ok) { setResultado({ ok: false, erro: true }); return; }
      const { saida, sonda } = separarSonda(resultado.output);
      const conferencia = atual.conferir({ graficos: resultado.graficos || [], codigo, saida, banco: sonda, sonda });
      setResultado(conferencia);
      if (conferencia.ok && !terminou) {
        guardar({ feitos: atualIndice + 1 });
        setCelebrar((n) => n + 1);
      }
    });
  };

  return (
    <section className="card faculdade-passo faculdade-degraus" aria-labelledby={`degraus-${aulaId}`}>
      <div className="eyebrow">CONSTRUA DE VERDADE</div>
      <h2 id={`degraus-${aulaId}`}>{trilha.titulo}</h2>
      <p>{trilha.introducao}</p>
      <ol className="faculdade-degraus-trilha" aria-label="Degraus">
        {trilha.degraus.map((degrau, i) => (
          <li key={degrau.id} className={i < feitos ? 'feito' : i === atualIndice && !terminou ? 'atual' : ''}>
            <Icon name={i < feitos ? 'Check' : 'Circle'} size={14} aria-hidden="true" />
            {degrau.titulo}
          </li>
        ))}
      </ol>
      {terminou ? (
        <div className="faculdade-degrau-fim" role="status">
          <Icon name="Trophy" size={18} aria-hidden="true" />
          <p>{trilha.conclusao} Pode continuar mexendo no código abaixo: a conferência do último degrau continua valendo.</p>
        </div>
      ) : (
        <div className="faculdade-degrau">
          <h3>Degrau {atualIndice + 1} de {trilha.degraus.length}: {atual.titulo}</h3>
          <p>{atual.ensina}</p>
          <pre className="example-code">{atual.exemplo}</pre>
          <p className="coach-task"><strong>Faça agora:</strong> {atual.pedido}</p>
        </div>
      )}
      <CodeEditor
        code={codigo}
        onChange={(valor) => { setResultado(null); guardar({ codigo: valor }); }}
        busy={python.busy}
        onRun={executar}
        onStop={python.stop}
        output={separarSonda(python.output).saida}
        imagens={python.imagens}
        success={python.success}
        celebrate={celebrar}
        filename={`${aulaId}-grafico.py`}
        runLabel="Executar e conferir"
        emptyOutput="Escreva o degrau no editor e execute. O gráfico aparece aqui, e a conferência logo abaixo."
      />
      {resultado?.erro && <ErrorHelp output={separarSonda(python.output).saida} code={codigo} />}
      {resultado && !resultado.erro && (
        <p role="status" className={resultado.ok ? 'practice-feedback faculdade-degrau-ok' : 'practice-feedback'}>
          {resultado.ok
            ? (feitos >= trilha.degraus.length ? 'Conferido: o gráfico cumpre o último degrau.' : `Conferido. Degrau vencido: ${trilha.degraus[Math.max(0, feitos - 1)].titulo}.`)
            : resultado.motivo}
        </p>
      )}
    </section>
  );
}
