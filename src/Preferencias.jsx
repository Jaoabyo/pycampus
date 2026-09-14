import { useEffect, useState } from 'react';
import { Icon } from './ui.jsx';
import { LumiArt } from './Mentor.jsx';
import { definirOllamaUrl, enderecoVeioDeLink, mentorAvailable, ollamaUrl, MENTOR_MODEL, OLLAMA_PADRAO } from './mentor.js';
import { estadoNotificacao, pedirNotificacao, podeNotificar, temLembretePeriodico, avisar } from './pwa.js';
import { baixarDaNuvem, conectado, conferirToken, definirGist, definirToken, salvarNaNuvem } from './nuvem.js';
import { montarRelatorio, relatorioVencido, DIAS_ENTRE_RELATORIOS } from './relatorio.js';
import './preferencias.css';

const seguro = typeof location !== 'undefined' && location.protocol === 'https:';

// O Lumi conversa com uma IA que roda em algum lugar. No computador é 127.0.0.1; no celular
// precisa ser um endereço alcançável — e, se a página é https, esse endereço também precisa
// ser https, senão o navegador bloqueia sem nem tentar.
export function EnderecoDaIA() {
  const [valor, setValor] = useState(ollamaUrl());
  const [estado, setEstado] = useState(null);
  const [testando, setTestando] = useState(false);
  const veioDeLink = enderecoVeioDeLink();

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
          : estado.reason === 'mistura'
            ? <>Nem cheguei a tentar: esta página é https e este endereço é http, e o navegador bloqueia essa mistura. Veja abaixo como resolver.</>
            : <>Sem resposta neste endereço. As dicas escritas continuam funcionando em qualquer aparelho.</>}</span>
    </p>}

    {misto && <p className="ia-aviso"><Icon name="TriangleAlert" size={15} /> <span>Esta página é <strong>https</strong> e este endereço é <strong>http</strong>. O navegador bloqueia essa mistura antes mesmo de tentar. Para usar o Lumi aqui, o endereço precisa ser https — veja abaixo.</span></p>}

    {/* Endereço trocado por link é comodidade real no celular, mas é para onde o seu código vai
        ser enviado. Nunca em silêncio: a tela diz de onde veio e dá um clique para desfazer. */}
    {veioDeLink && veioDeLink === valor && <p className="ia-aviso"><Icon name="Link" size={15} /> <span>Este endereço veio do link que você abriu: <code>{veioDeLink}</code>. É para onde seu código será enviado quando pedir ajuda ao Lumi. Se não foi você que gerou esse link, <button className="text-button inline" onClick={() => { setValor(OLLAMA_PADRAO); testar(OLLAMA_PADRAO); }}>volte ao padrão</button>.</span></p>}

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

// Progresso guardado num Gist privado do próprio estudante: some do aparelho, não some da
// conta. O token fica só neste navegador — nunca no repositório.
export function ProgressoNaNuvem({ state, aoBaixar }) {
  const [campo, setCampo] = useState('');
  const [dono, setDono] = useState('');
  const [estado, setEstado] = useState(conectado() ? 'conectado' : 'desligado');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState('');

  useEffect(() => { if (conectado()) conferirToken().then(setDono).catch(() => setEstado('desligado')); }, []);

  const conectar = async () => {
    setOcupado('Conferindo o token…'); setAviso('');
    try {
      definirToken(campo);
      setDono(await conferirToken());
      setEstado('conectado');
      setCampo('');
      setAviso('Conectado. A partir de agora seu progresso sobe sozinho.');
    } catch (falha) { definirToken(''); setEstado('desligado'); setAviso(falha.message); }
    finally { setOcupado(''); }
  };

  const salvar = async () => {
    setOcupado('Salvando…'); setAviso('');
    try { const r = await salvarNaNuvem(state); setAviso(r.criado ? 'Criei o seu Gist privado e salvei tudo lá.' : 'Salvo.'); }
    catch (falha) { setAviso(falha.message); } finally { setOcupado(''); }
  };

  const baixar = async () => {
    setOcupado('Buscando…'); setAviso('');
    try { const r = await baixarDaNuvem(); aoBaixar(r.estado); setAviso('Progresso da nuvem trazido. Escolha juntar ou substituir.'); }
    catch (falha) { setAviso(falha.message); } finally { setOcupado(''); }
  };

  return <section className="card">
    <div className="section-heading"><h2><Icon name="HardDriveDownload" /> Seu progresso na nuvem</h2>
      {estado === 'conectado' && <span className="pill teal"><Icon name="Check" size={12} /> ligado</span>}</div>

    {estado === 'conectado'
      ? <>
          <p>Conectado como <strong>{dono || '…'}</strong>. Cada coisa que você conclui sobe para um <strong>Gist privado</strong> da sua conta, e pode ser trazida em qualquer aparelho.</p>
          <div className="button-row">
            <button className="button primary" disabled={Boolean(ocupado)} onClick={salvar}><Icon name="Upload" size={16} /> Salvar agora</button>
            <button className="button outline" disabled={Boolean(ocupado)} onClick={baixar}><Icon name="Download" size={16} /> Trazer de outro aparelho</button>
            <button className="text-button" onClick={() => { definirToken(''); definirGist(''); setEstado('desligado'); setDono(''); setAviso('Desconectado deste aparelho. O Gist continua na sua conta.'); }}>Desconectar</button>
          </div>
        </>
      : <>
          <p>Hoje seu progresso vive só neste navegador. Ligue a nuvem para ele ficar guardado na <strong>sua conta do GitHub</strong>, num Gist privado, e acompanhar você entre o computador e o celular.</p>
          <ol className="guided-actions">
            <li>Abra <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer">github.com/settings/tokens</a> e gere um token.</li>
            <li>Dê permissão apenas de <strong>Gists</strong>. Nada além disso é necessário.</li>
            <li>Cole o token aqui embaixo.</li>
          </ol>
          <label className="form-label">Token do GitHub
            <input type="password" value={campo} onChange={event => setCampo(event.target.value)} placeholder="ghp_… ou github_pat_…" autoComplete="off" />
          </label>
          <div className="button-row"><button className="button primary" disabled={!campo.trim() || Boolean(ocupado)} onClick={conectar}><Icon name="PlugZap" size={16} /> Conectar</button></div>
        </>}

    {ocupado && <p className="custom-status" role="status"><span className="custom-spin" /> {ocupado}</p>}
    {aviso && <p className="small" role="status">{aviso}</p>}
    <p className="small">O token fica guardado só neste navegador e nunca entra no repositório. O Gist é privado: só você enxerga.</p>
  </section>;
}

// Relatório para avaliação externa: montado do que a plataforma registrou, não de opinião.
//
// O texto é derivado do estado a cada render, e não guardado aqui. As páginas do campus são
// funções declaradas dentro de App, então qualquer mudança de estado remonta a tela e apaga
// qualquer useState local — guardar o relatório aqui o fazia sumir no mesmo clique que o criou.
export function RelatorioDeEstudo({ state, aoGerar }) {
  const [copiado, setCopiado] = useState(false);
  const vencido = relatorioVencido(state);
  const texto = montarRelatorio(state);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); } catch { setCopiado(false); }
    aoGerar();
  };

  return <section className={`card ${vencido ? 'relatorio-vencido' : ''}`}>
    <div className="section-heading"><h2><Icon name="BookOpenCheck" /> Relatório para avaliação</h2>
      {vencido && <span className="pill orange">faz {DIAS_ENTRE_RELATORIOS} dias ou mais</span>}</div>
    <p>Um resumo do que você concluiu, onde mais travou, o que o diagnóstico encontrou e as explicações que você escreveu. Copie e mande para quem for te avaliar.</p>
    <div className="button-row">
      <button className="button primary" onClick={copiar}><Icon name="Copy" size={16} /> {copiado ? 'Copiado' : 'Copiar relatório'}</button>
    </div>
    <pre className="relatorio-texto">{texto}</pre>
    {state.ultimoRelatorio && <p className="small">Último relatório copiado em {state.ultimoRelatorio.split('-').reverse().join('/')}.</p>}
  </section>;
}

// Recomeçar do zero. Antes de apagar, exporta — perder progresso por um clique seria o pior
// jeito de começar de novo.
export function RecomecarDoZero({ onExportar, onZerar }) {
  const [confirmando, setConfirmando] = useState(false);
  return <section className="card">
    <div className="section-heading"><h2><Icon name="RotateCcw" /> Recomeçar do zero</h2></div>
    <p>Apaga aulas concluídas, XP, código salvo, diário e conquistas <strong>deste aparelho</strong>, deixando o campus como no primeiro dia.</p>
    {!confirmando
      ? <div className="button-row"><button className="button outline" onClick={() => setConfirmando(true)}>Quero recomeçar</button></div>
      : <>
          <p className="ia-aviso"><Icon name="TriangleAlert" size={15} /> <span>Isto não tem volta. Exporte antes, se houver qualquer chance de você querer o progresso atual de novo.</span></p>
          <div className="button-row">
            <button className="button primary" onClick={onExportar}><Icon name="Download" size={16} /> Exportar antes</button>
            <button className="button outline" onClick={onZerar}>Apagar e recomeçar</button>
            <button className="text-button" onClick={() => setConfirmando(false)}>Cancelar</button>
          </div>
        </>}
  </section>;
}
