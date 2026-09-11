// Utilitários do quebra-cabeça de código (problema de Parsons), genéricos o bastante para
// qualquer conteúdo com solução de referência: aula, ponte de função ou miniprojeto.
// Basta um objeto com .id e .puzzle = { blocks, prefix, distractor }.
export const toBlocks = code => code.split('\n').filter(line => line.trim()).map(line => ({ code: line.trim(), indent: Math.round((line.length - line.trimStart().length) / 4) }));

// Ordem embaralhada estável por item: o mesmo quebra-cabeça reaparece igual, mas nunca já resolvido.
export function shuffledPieces(item) {
  const pieces = item.puzzle.blocks.map((block, index) => ({ ...block, id: index }));
  if (item.puzzle.distractor) pieces.push({ code: item.puzzle.distractor, indent: -1, id: pieces.length, extra: true });
  let seed = [...item.id].reduce((total, char) => total + char.charCodeAt(0), pieces.length * 31);
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  if (pieces.every((piece, index) => piece.id === index)) pieces.reverse();
  return pieces;
}
export const puzzleSolved = (placed, item) => placed.length === item.puzzle.blocks.length
  && placed.every((piece, index) => piece.code === item.puzzle.blocks[index].code && piece.indent === item.puzzle.blocks[index].indent);
