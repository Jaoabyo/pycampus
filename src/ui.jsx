import * as Icons from './icons.js';

export const Icon = ({ name, size = 20, ...props }) => { const Component = Icons[name] || Icons.Code2; return <Component size={size} strokeWidth={1.8} {...props} />; };
export function Progress({ value, className = '', label = 'Progresso' }) {
  return <div className={`progress ${className}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

// Trocar de passo dentro de uma tela deixava o estudante no rodapé, olhando os botões de
// navegação em vez do enunciado novo. navigate() já sobe ao topo entre telas; aqui é a mesma
// subida para as trocas que acontecem sem mudar de tela.
export const irAoTopo = () => window.scrollTo({ top: 0, behavior: 'instant' });

// Entrar num miniprojeto ou num projeto sem saber o que é foi a queixa: o botão só dizia
// "avançar". Este cartão diz, antes do clique, o que vem e por que vem. As palavras saem de
// explicaTrabalho, em progression.js, para as três telas dizerem a mesma coisa.
export function ExplicaEtapa({ explica, onAbrir }) {
  return <div className="proximo-da-etapa">
    <div className="eyebrow">{explica.eyebrow}</div>
    <strong>{explica.titulo}</strong>
    <p>{explica.texto}</p>
    <button className="button primary full" onClick={onAbrir}>{explica.botao}<Icon name="ArrowRight" size={17} /></button>
  </div>;
}

