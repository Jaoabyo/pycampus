import { Icon } from './ui.jsx';
import './previsao.css';

// Prever antes de executar. Os exemplos já diziam "preveja a saída", mas nada pedia o palpite:
// o estudante lia, clicava e via a resposta — o que treina reconhecer, não ler código. Escrever
// o palpite antes obriga a percorrer o programa linha a linha, e a diferença entre o palpite e a
// saída real aponta exatamente o trecho que ainda não foi entendido. É isso que a prova cobra
// quando mostra um código e pergunta o que ele imprime.
//
// "Não sei prever" é uma resposta honesta e libera a execução: travar quem não sabe só o faria
// digitar qualquer coisa para passar, e aí o palpite deixaria de dizer algo.

const normalizar = (texto) => String(texto || '')
  .split('\n').map((linha) => linha.trim().replace(/\s+/g, ' ')).filter(Boolean).join('\n');

export function previsaoLiberada(estado) {
  return estado.naoSei || estado.palpite.trim().length > 0;
}

export default function PrevisaoDaSaida({ estado, onChange, saida, executado, desativado = false }) {
  const { palpite, naoSei } = estado;
  const comparou = executado && !naoSei && palpite.trim();
  const acertou = comparou && normalizar(palpite) === normalizar(saida);

  return (
    <div className="previsao-saida">
      <label className="previsao-campo">
        <span><Icon name="Lightbulb" size={16} aria-hidden="true" /> Antes de executar: o que este código vai mostrar?</span>
        <textarea
          rows={2}
          value={palpite}
          disabled={desativado || naoSei}
          placeholder="Escreva a saída que você espera, linha por linha"
          onChange={(evento) => onChange({ palpite: evento.target.value, naoSei: false })}
        />
      </label>
      {!palpite.trim() && (
        <button type="button" className="text-button" disabled={desativado} onClick={() => onChange({ palpite: '', naoSei: !naoSei })}>
          {naoSei ? 'Quero tentar prever' : 'Não sei prever — mostrar a saída'}
        </button>
      )}
      {comparou && (
        <p className={`previsao-veredito ${acertou ? 'acertou' : 'errou'}`} role="status">
          <Icon name={acertou ? 'CheckCircle2' : 'TriangleAlert'} size={16} aria-hidden="true" />
          {acertou
            ? 'Você previu a saída exata. Leu o código do jeito que o Python lê.'
            : 'A saída foi diferente do seu palpite. Compare linha por linha: onde eles se separam é o trecho que vale reler.'}
        </p>
      )}
      {executado && naoSei && (
        <p className="previsao-veredito" role="status">
          Sem palpite desta vez. Leia a saída e volte ao código para achar a linha que produziu cada parte dela.
        </p>
      )}
    </div>
  );
}
