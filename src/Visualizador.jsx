import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { tracePython } from './trace.js';
import './visualizador.css';

// Ler o código não mostra o que acontece na memória. Aqui o estudante vê o programa andando
// linha a linha, com as variáveis mudando de valor e a saída aparecendo aos poucos — que é
// justamente onde laço e condição deixam de ser um mistério.
export default function Visualizador({ code, stdin = '', titulo = 'Veja o programa pensando' }) {
  const [rastro, setRastro] = useState(null);
  const [passo, setPasso] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [tocando, setTocando] = useState(false);
  const relogio = useRef(null);
  const linhas = code.split('\n');

  useEffect(() => () => clearInterval(relogio.current), []);
  // Ao chegar no fim, a reprodução automática para sozinha.
  useEffect(() => {
    if (!tocando || !rastro) return;
    relogio.current = setInterval(() => {
      setPasso(atual => {
        if (atual >= rastro.passos.length - 1) { setTocando(false); return atual; }
        return atual + 1;
      });
    }, 700);
    return () => clearInterval(relogio.current);
  }, [tocando, rastro]);

  const visualizar = async () => {
    setCarregando(true); setErro(''); setRastro(null); setPasso(0); setTocando(false);
    try {
      const resultado = await tracePython(code, stdin);
      if (!resultado.passos.length) throw new Error('Este programa não executou nenhuma linha.');
      setRastro(resultado);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  if (!rastro) return <div className="ver-executar">
    <button className="button outline" disabled={carregando} onClick={visualizar}>
      <Icon name="Play" size={15} /> {carregando ? 'Preparando a visualização…' : 'Ver executando passo a passo'}
    </button>
    {erro && <p className="visual-erro" role="alert"><Icon name="TriangleAlert" size={15} /> <span>{erro}</span></p>}
  </div>;

  const atual = rastro.passos[passo];
  const fim = passo === rastro.passos.length - 1;
  const variaveis = Object.entries(atual.variaveis);
  const anterior = passo > 0 ? rastro.passos[passo - 1].variaveis : {};

  return <section className="visualizador">
    <div className="visual-head">
      <span className="icon-tile blue"><Icon name="Eye" size={21} /></span>
      <div><div className="eyebrow">PASSO {passo + 1} DE {rastro.passos.length}</div><h3>{titulo}</h3></div>
      <button className="icon-button" aria-label="Fechar a visualização" onClick={() => setRastro(null)}><Icon name="X" size={17} /></button>
    </div>

    <div className="visual-corpo">
      <pre className="visual-codigo">{linhas.map((linha, indice) => {
        const numero = indice + 1;
        const agora = numero === atual.linha;
        return <span key={indice} className={`visual-linha ${agora ? 'agora' : ''}`}>
          <i>{agora ? '▸' : numero}</i>{linha || ' '}
        </span>;
      })}</pre>

      <div className="visual-lado">
        <div className="visual-bloco">
          <span className="visual-rotulo">VARIÁVEIS AGORA</span>
          {variaveis.length ? <ul className="visual-vars">{variaveis.map(([nome, valor]) => (
            <li key={nome} className={anterior[nome] !== valor ? 'mudou' : ''}>
              <code>{nome}</code><span>{valor}</span>
            </li>
          ))}</ul> : <p className="visual-vazio">Nenhuma variável criada ainda.</p>}
        </div>
        <div className="visual-bloco">
          <span className="visual-rotulo">JÁ APARECEU NA TELA</span>
          <pre className="visual-saida">{atual.saida || '(nada ainda)'}</pre>
        </div>
      </div>
    </div>

    {fim && <p className="visual-fim"><Icon name="CheckCircle2" size={15} /> <span>{rastro.erro ? `O programa parou aqui: ${rastro.erro}` : 'Fim do programa.'}</span></p>}
    {rastro.cortado && <p className="visual-erro"><Icon name="Info" size={15} /> <span>Este programa tem passos demais; a visualização mostra só o começo.</span></p>}

    <div className="visual-controles">
      <button className="icon-button" aria-label="Voltar ao início da execução" disabled={passo === 0} onClick={() => { setTocando(false); setPasso(0); }}><Icon name="RotateCcw" size={17} /></button>
      <button className="icon-button" aria-label="Passo anterior da execução" disabled={passo === 0} onClick={() => { setTocando(false); setPasso(passo - 1); }}><Icon name="ChevronLeft" size={19} /></button>
      <button className="button primary" onClick={() => { if (fim) { setPasso(0); setTocando(true); } else setTocando(!tocando); }}>
        <Icon name={tocando ? 'Square' : 'Play'} size={15} /> {tocando ? 'Pausar' : fim ? 'Ver de novo' : 'Executar sozinho'}
      </button>
      <button className="icon-button" aria-label="Próximo passo da execução" disabled={fim} onClick={() => { setTocando(false); setPasso(passo + 1); }}><Icon name="ChevronRight" size={19} /></button>
      <input type="range" min="0" max={rastro.passos.length - 1} value={passo} aria-label="Linha do tempo da execução"
        onChange={event => { setTocando(false); setPasso(Number(event.target.value)); }} />
    </div>
    <p className="small">As variáveis que mudaram neste passo aparecem destacadas. Nada aqui altera seu progresso.</p>
  </section>;
}
