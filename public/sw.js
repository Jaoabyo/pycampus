// Service worker conservador de propósito: um erro aqui deixa o site quebrado no aparelho
// mesmo depois de corrigido. Navegação sempre tenta a rede primeiro; só o que é imutável
// (arquivos com hash no nome e o Pyodide do CDN) é servido do cache sem perguntar.
const CACHE = 'pycampus-v1';
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const nome of await caches.keys()) if (nome !== CACHE) await caches.delete(nome);
    await self.clients.claim();
  })());
});

const guardar = async (request, response) => {
  if (response && response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
};

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = request.url;
  const mesmaOrigem = url.startsWith(self.location.origin);
  const imutavel = /-[A-Za-z0-9_]{8,}\.(js|css)$/.test(url) || url.startsWith(PYODIDE);

  if (imutavel) {
    // Cache primeiro: o nome do arquivo muda quando o conteúdo muda, então não há o que invalidar.
    event.respondWith(caches.match(request).then(pronto => pronto || fetch(request).then(r => guardar(request, r))));
    return;
  }
  if (mesmaOrigem) {
    // Rede primeiro, cache como rede de segurança: assim uma correção chega no próximo acesso,
    // e sem internet o campus continua abrindo.
    event.respondWith(fetch(request).then(r => guardar(request, r)).catch(() => caches.match(request)));
  }
});

// Lembrete de estudo. Sem servidor não há push: o que existe é o disparo periódico do próprio
// navegador, quando o aparelho permite, e o agendamento feito com a página aberta.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'lembrete-estudo') event.waitUntil(lembrar());
});
self.addEventListener('message', event => {
  if (event.data?.tipo === 'lembrete-agora') event.waitUntil(lembrar(event.data.texto));
});

async function lembrar(texto) {
  const clientes = await self.clients.matchAll({ type: 'window' });
  // Se o campus já está aberto na frente da pessoa, o lembrete só atrapalha.
  if (clientes.some(cliente => cliente.visibilityState === 'visible')) return;
  await self.registration.showNotification('PyCampus', {
    body: texto || 'Um pouquinho hoje já conta. Que tal uma aula?',
    icon: 'icone-192.png',
    badge: 'icone-192.png',
    tag: 'lembrete-estudo',
    data: { url: self.registration.scope }
  });
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const aberto = clientes.find(cliente => cliente.url.startsWith(self.registration.scope));
    if (aberto) return aberto.focus();
    return self.clients.openWindow(event.notification.data?.url || './');
  })());
});
