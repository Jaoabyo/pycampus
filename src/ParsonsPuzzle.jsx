import { useState } from 'react';
import { Icon } from './ui.jsx';
import { shuffledPieces, puzzleSolved } from './parsons.js';
import './parsons.css';

const MAX_INDENT = 3;

// Problema de Parsons: o código certo vem embaralhado e em blocos, e o estudante monta a ordem
// e a indentação. Praticar assim ensina tanto quanto escrever do zero, com muito menos atrito de sintaxe.
export default function ParsonsPuzzle({ item, onSolved }) {
  const [pool, setPool] = useState(() => shuffledPieces(item));
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(null);
  const blocks = item.puzzle.blocks;
  const solved = puzzleSolved(placed, item);

  const rearrange = (nextPool, nextPlaced) => { setPool(nextPool); setPlaced(nextPlaced); setChecked(null); };
  const take = piece => rearrange(pool.filter(other => other.id !== piece.id), [...placed, { ...piece, indent: 0 }]);
  const drop = index => rearrange([...pool, placed[index]], placed.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const next = [...placed], target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    rearrange(pool, next);
  };
  const indent = (index, delta) => rearrange(pool, placed.map((piece, i) => i === index ? { ...piece, indent: Math.min(MAX_INDENT, Math.max(0, piece.indent + delta)) } : piece));
  const check = () => {
    setChecked(placed.map((piece, index) => {
      const target = blocks[index];
      if (!target || piece.code !== target.code) return 'order';
      return piece.indent === target.indent ? 'ok' : 'indent';
    }));
    if (puzzleSolved(placed, item)) onSolved?.();
  };
  const restart = () => rearrange(shuffledPieces(item), []);
  const right = checked ? checked.filter(status => status === 'ok').length : 0;

  return <div className="parsons">
    <div className="parsons-head"><div className="icon-tile orange"><Icon name="Boxes" size={23} /></div><div><h3>Monte o código embaralhado</h3><p>Clique nas peças na ordem certa e ajuste os espaços do início com as setas. Nem toda peça entra: uma delas é um engano comum.</p></div></div>
    {item.puzzle.prefix && <div className="parsons-prefix"><span>JÁ PRONTO PARA VOCÊ</span><pre>{item.puzzle.prefix}</pre></div>}
    <div className="parsons-board">
      <div className="parsons-pool">
        <span className="parsons-label">Peças disponíveis ({pool.length})</span>
        {pool.length ? pool.map(piece => <button key={piece.id} className="parsons-piece" onClick={() => take(piece)}><Icon name="Plus" size={14} /><code>{piece.code}</code></button>) : <p className="parsons-empty">Todas as peças estão no seu programa.</p>}
      </div>
      <div className="parsons-program">
        <span className="parsons-label">Seu programa ({placed.length} de {blocks.length} linhas)</span>
        {placed.length ? <ol>{placed.map((piece, index) => <li key={`${piece.id}-${index}`} className={checked ? `is-${checked[index]}` : ''}>
          <code style={{ paddingLeft: `${piece.indent * 22}px` }}>{piece.code}</code>
          <span className="parsons-controls">
            <button aria-label="Menos espaços" title="Menos espaços" disabled={!piece.indent} onClick={() => indent(index, -1)}><Icon name="ChevronLeft" size={15} /></button>
            <button aria-label="Mais espaços" title="Mais espaços" disabled={piece.indent >= MAX_INDENT} onClick={() => indent(index, 1)}><Icon name="ChevronRight" size={15} /></button>
            <button aria-label="Subir linha" title="Subir" disabled={!index} onClick={() => move(index, -1)}><Icon name="ChevronUp" size={15} /></button>
            <button aria-label="Descer linha" title="Descer" disabled={index === placed.length - 1} onClick={() => move(index, 1)}><Icon name="ChevronDown" size={15} /></button>
            <button aria-label="Tirar do programa" title="Tirar" onClick={() => drop(index)}><Icon name="X" size={15} /></button>
          </span>
        </li>)}</ol> : <p className="parsons-empty">Comece clicando na primeira linha do programa.</p>}
      </div>
    </div>
    <div className="parsons-actions">
      <button className="button primary" disabled={!placed.length} onClick={check}><Icon name="CheckCheck" size={16} /> Conferir montagem</button>
      <button className="text-button" onClick={restart}><Icon name="RotateCcw" size={14} /> Recomeçar</button>
    </div>
    {solved && checked && <p className="parsons-result is-solved" role="status"><Icon name="Trophy" size={17} /> Montado. Agora escreva esse programa do zero no editor acima, sem olhar: montar mostra que você reconhece a ordem, escrever mostra que você lembra.</p>}
    {checked && !solved && <p className="parsons-result" role="status"><Icon name="Info" size={17} /> {right} de {blocks.length} linhas no lugar. Vermelho é linha fora de ordem ou peça que não entra; amarelo é ordem certa com espaços errados.</p>}
  </div>;
}
