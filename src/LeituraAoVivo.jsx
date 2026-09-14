import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { mentorAvailable, MENTOR_MODEL, ollamaUrl } from './mentor.js';
import { lerCodigo, promptDaObservacao, filtrarObservacao } from './leitura-ao-vivo.js';
import './leitura.css';

// O Lumi lendo o código enquanto o estudante escreve, em duas camadas.
//
// A primeira é medida em JavaScript e aparece na hora: parêntese sem fechar, dois-pontos que
// falta, variável criada e nunca usada. Não precisa de IA, funciona offline e não tem como
// entregar a resposta, porque não sabe a resposta.
//
// A segunda é o Lumi, e só entra quando o estudante para de digitar por alguns segundos. Ela é
// opcional por natureza: sem Ollama, simplesmente não existe, e o resto continua igual.
//
// Duas regras que não se quebram aqui:
//   1. Nada aparece enquanto o código ainda é o início que a plataforma entregou. Reclamar de
//      uma variável "não usada" no instante em que a aula abre é ruído, não ajuda.
//   2. A observação do Lumi passa pela mesma trava do primeiro degrau: se citar função que o
//      estudante ainda não escreveu, é a resposta disfarçada de dica, e é descartada.

const ESPERA = 3000;

export default function LeituraAoVivo({ code, inicial = '', lessonId = '', challenge = '', ativo = true }) {
  const [doLumi, setDoLumi] = useState('');
  const abort = useRef(null);
  const jaDito = useRef('');

  const tocado = code.trim() !== String(inicial).trim() && code.trim().length > 0;
  const medida = tocado ? lerCodigo(code) : null;

  useEffect(() => {
    setDoLumi('');
    if (!ativo || !tocado || medida) return undefined;
    const relogio = setTimeout(async () => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      try {
        const disponivel = await mentorAvailable(controller.signal);
        if (!disponivel.ok) return;
        const observacao = await observar({ code, lessonId, challenge, signal: controller.signal });
        // Repetir a mesma frase a cada pausa cansa e não ensina nada de novo.
        if (observacao && observacao !== jaDito.current) { jaDito.current = observacao; setDoLumi(observacao); }
      } catch { /* sem IA a leitura medida continua valendo sozinha */ }
    }, ESPERA);
    return () => { clearTimeout(relogio); abort.current?.abort(); };
  }, [code, ativo, tocado, medida?.texto, lessonId, challenge]);

  useEffect(() => () => abort.current?.abort(), []);

  if (!tocado) return null;
  if (medida) return <p className="leitura-ao-vivo is-medida" role="status">
    <Icon name="Eye" size={15} /> <span>{medida.texto}</span>
  </p>;
  if (!doLumi) return null;
  return <p className="leitura-ao-vivo is-lumi" role="status">
    <LumiArt size={18} /> <span>{doLumi}</span>
  </p>;
}

async function observar({ code, lessonId, challenge, signal }) {
  const { system, user } = promptDaObservacao({ code, lessonId, challenge });
  const resposta = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, keep_alive: '30m',
      options: { temperature: 0.2, num_predict: 60 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!resposta.ok) return '';
  return filtrarObservacao((await resposta.json()).message?.content, code);
}
