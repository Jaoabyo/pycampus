import { useEffect, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { definirOllamaUrl, mentorAvailable, ollamaUrl, MENTOR_MODEL, OLLAMA_PADRAO } from './mentor.js';
import { estadoNotificacao, pedirNotificacao, podeNotificar, temLembretePeriodico, avisar } from './pwa.js';
import './preferencias.css';

const seguro = typeof location !== 'undefined' && location.protocol === 'https:';

// O Lumi conversa com uma IA que roda em algum lugar. No computador é 127.0.0.1; no celular
// precisa ser um endereço alcançável — e, se a página é https, esse endereço também precisa
// ser https, senão o navegador bloqueia sem nem tentar.
export function EnderecoDaIA() {
  const [valor, setValor] = useState(ollamaUrl());
  const [estado, setEstado] = useState(null);
  const [testando, setTestando] = useState(false);

  const testar = async endereco => {
    setTestando(true);
    definirOllamaUrl(endereco);
    setEstado(await mentorAvailable());
    setTestando(false);
  };
  useEffect(() => { testar(ollamaUrl()); }, []);

  const misto = seguro && valor.startsWith('http://');
  return <section className="card">
    <div className="section-heading"><h2><Icon name="PlugZap" /> Onde a IA do Lumi mora</h2></div>
    <p>O Lumi conversa com um modelo rodando no <strong>seu computador</strong>, pelo Ollama. As dicas escritas dele funcionam sempre; a conversa depende deste endereço.</p>
    <label className="form-label">Endereço do Ollama
      <input type="url" value={valor} onChange={event => setValor(event.target.value)} placeholder={OLLAMA_PADRAO} inputMode="url" autoComplete="off" />
    </label>
    <div className="button-row">
      <button className="button primary" disabled={testando} onClick={() => testar(valor)}>
        <Icon name="CheckCheck" size={16} /> {testando ? 'Testando…' : 'Testar conexão'}
      </button>
      <button className="text-button" disabled={testando} onClick={() => { setValor(OLLAMA_PADRAO); testar(OLLAMA_PADRAO); }}>Voltar ao padrão</button>
    </div>

    {estado && <p className={`ia-estado ${estado.ok ? 'is-ok' : 'is-off'}`} role="status">
      <LumiArt size={22} awake={estado.ok} />
      <span>{estado.ok
        ? <>Conectado. O Lumi vai conversar normalmente.</>
        : estado.reason === 'modelo'
          ? <>Respondeu, mas falta o modelo <code>{MENTOR_MODEL}</code>. No computador: <code>ollama pull {MENTOR_MODEL}</code>.</>
          : <>Sem resposta neste endereço. As dicas escritas continuam funcionando em qualquer aparelho.</>}</span>
    </p>}

    {misto && <p className="ia-aviso"><Icon name="TriangleAlert" size={15} /> <span>Esta página é <strong>https</strong> e este endereço é <strong>http</strong>. O navegador bloqueia essa mistura antes mesmo de tentar. Para usar o Lumi aqui, o endereço precisa ser https — veja abaixo.</span></p>}

    <details className="ia-ajuda">
      <summary>Como deixar o Lumi funcionando no celular</summary>
      <p>A IA roda no computador. Para o celular alcançá-la, o computador precisa expor o Ollama num endereço que o celular enxergue.</p>
      <ol className="guided-actions">
        <li><strong>Abrindo o campus pelo endereço da sua rede</strong> (por exemplo <code>http://192.168.0.10:5173</code>, iniciado com <code>npm run dev -- --host</code>): basta escrever aqui <code>http://SEU-IP:11434</code>. Página e IA são http, então não há mistura.</li>
        <li><strong>Usando o site publicado (https)</strong>: é preciso um túnel https para o Ollama, por exemplo <code>cloudflared tunnel --url http://127.0.0.1:11434</code>. Cole aqui o endereço https que ele imprimir.</li>
        <li>Em qualquer caso, o computador precisa estar ligado, com o Ollama aberto. Sem isso, o Lumi segue com as dicas escritas.</li>
      </ol>
      <p className="small">Também é preciso permitir a origem no Ollama, com a variável <code>OLLAMA_ORIGINS</code>, quando ele recusar a conexão.</p>
    </details>
  </section>;
}

// Lembrete de estudo. O que existe sem servidor é limitado, e a tela diz exatamente o que é.
export function LembreteDeEstudo({ horario, onHorario }) {
  const [permissao, setPermissao] = useState(estadoNotificacao());
  const [periodico, setPeriodico] = useState(false);
  useEffect(() => { temLembretePeriodico().then(setPeriodico); }, [permissao]);

  if (!podeNotificar()) return <section className="card">
    <div className="section-heading"><h2><Icon name="CalendarDays" /> Lembrete de estudo</h2></div>
    <p>Este navegador não oferece notificações. O calendário do campus continua guardando suas sessões.</p>
  </section>;

  return <section className="card">
    <div className="section-heading"><h2><Icon name="CalendarDays" /> Lembrete de estudo</h2></div>
    <p>Um toque no horário que você escolher, para a sequência não morrer por esquecimento.</p>
    <label className="form-label">Horário do lembrete
      <input type="time" value={horario || ''} onChange={event => onHorario(event.target.value)} />
    </label>
    {permissao !== 'granted'
      ? <div className="button-row">
          <button className="button primary" onClick={async () => setPermissao(await pedirNotificacao())}>
            <Icon name="CheckCheck" size={16} /> Permitir notificações
          </button>
          {permissao === 'denied' && <span className="small">Você negou antes. Para reativar, mude a permissão de notificação deste site nas configurações do navegador.</span>}
        </div>
      : <div className="button-row">
          <span className="pill teal"><Icon name="Check" size={12} /> notificações permitidas</span>
          <button className="text-button" onClick={() => avisar('Assim que o lembrete vai aparecer.')}>Ver como fica</button>
        </div>}
    <p className="small">
      {periodico
        ? 'Seu aparelho aceita lembretes em segundo plano: ele pode avisar mesmo com o campus fechado.'
        : 'Neste aparelho o lembrete só dispara com o campus aberto em alguma aba. Instalar o app na tela inicial aumenta a chance de o navegador permitir o aviso em segundo plano.'}
    </p>
  </section>;
}

// Instalar na tela inicial. O navegador só deixa pedir isso depois de decidir que a página é
// instalável, e o pedido precisa partir de um clique.
export function InstalarApp() {
  const [evento, setEvento] = useState(null);
  const [instalado, setInstalado] = useState(false);
  useEffect(() => {
    const guardar = event => { event.preventDefault(); setEvento(event); };
    const pronto = () => { setInstalado(true); setEvento(null); };
    window.addEventListener('beforeinstallprompt', guardar);
    window.addEventListener('appinstalled', pronto);
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalado(true);
    return () => { window.removeEventListener('beforeinstallprompt', guardar); window.removeEventListener('appinstalled', pronto); };
  }, []);

  return <section className="card">
    <div className="section-heading"><h2><Icon name="Rocket" /> PyCampus no seu celular</h2></div>
    {instalado
      ? <p>Instalado. O campus abre como aplicativo, em tela cheia.</p>
      : <>
          <p>Dá para instalar na tela inicial e abrir como aplicativo, sem barra de endereço.</p>
          {evento
            ? <div className="button-row"><button className="button primary" onClick={async () => { evento.prompt(); await evento.userChoice; setEvento(null); }}><Icon name="Download" size={16} /> Instalar agora</button></div>
            : <p className="small">No celular: abra o menu do navegador e escolha <strong>Adicionar à tela de início</strong>. No iPhone, o menu é o de compartilhar.</p>}
        </>}
    <p className="small">Depois de instalado, as aulas abrem mesmo sem internet. O Python é guardado no primeiro uso.</p>
  </section>;
}
