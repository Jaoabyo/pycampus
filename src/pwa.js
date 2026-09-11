// Instalação no celular e lembrete de estudo. Tudo aqui é opcional e falha em silêncio:
// nenhuma parte da formação pode depender de service worker ou de notificação.
const BASE = import.meta.env.BASE_URL;

export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  // Só depois do carregamento: registrar cedo compete com o Pyodide pela banda.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(() => {});
  });
}

export const podeNotificar = () => 'Notification' in window && 'serviceWorker' in navigator;
export const estadoNotificacao = () => (podeNotificar() ? Notification.permission : 'indisponivel');

export async function pedirNotificacao() {
  if (!podeNotificar()) return 'indisponivel';
  const permissao = await Notification.requestPermission();
  if (permissao === 'granted') await agendarLembretePeriodico();
  return permissao;
}

// O disparo periódico só existe em alguns navegadores e só depois de instalar o app.
// Quando não existe, o lembrete acontece com a página aberta — e a tela diz isso.
export async function agendarLembretePeriodico() {
  try {
    const registro = await navigator.serviceWorker.ready;
    if (!('periodicSync' in registro)) return false;
    const estado = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (estado.state !== 'granted') return false;
    await registro.periodicSync.register('lembrete-estudo', { minInterval: 20 * 60 * 60 * 1000 });
    return true;
  } catch { return false; }
}

export async function temLembretePeriodico() {
  try {
    const registro = await navigator.serviceWorker.ready;
    if (!('periodicSync' in registro)) return false;
    return (await registro.periodicSync.getTags()).includes('lembrete-estudo');
  } catch { return false; }
}

export async function avisar(texto) {
  if (estadoNotificacao() !== 'granted') return false;
  const registro = await navigator.serviceWorker.ready;
  registro.active?.postMessage({ tipo: 'lembrete-agora', texto });
  return true;
}

// Enquanto o campus estiver aberto, um relógio dispara o lembrete no horário escolhido.
// É o que funciona em qualquer aparelho; o periódico é o extra de quem instalou o app.
export function relogioDoLembrete(horario, jaEstudouHoje) {
  if (!horario || estadoNotificacao() !== 'granted') return () => {};
  const [hora, minuto] = horario.split(':').map(Number);
  const alvo = new Date();
  alvo.setHours(hora, minuto, 0, 0);
  if (alvo <= new Date()) alvo.setDate(alvo.getDate() + 1);
  const id = setTimeout(() => { if (!jaEstudouHoje()) avisar('Sua sequência está esperando. Uma aula já mantém a chama acesa.'); }, alvo - Date.now());
  return () => clearTimeout(id);
}
