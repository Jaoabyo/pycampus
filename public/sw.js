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

// Perguntar durante a execução (o input() parando o programa e esperando você responder) exige
// que a página esteja "isolada entre origens", e isso depende de dois cabeçalhos que o GitHub
// Pages não envia. Um service worker pode acrescentá-los na resposta antes de ela chegar à
// página — é o que faz este trecho, e é o que devolve o formulário de pergunta no site publicado.
//
// É `credentialless`, e não `require-corp`, de propósito: o Pyodide vem do jsDelivr, que não
// envia Cross-Origin-Resource-Policy. Com require-corp o Python simplesmente não carregaria.
//
// Navegador que não entende esses valores ignora os cabeçalhos: a página abre sem isolamento e
// a plataforma volta sozinha ao campo de entradas preenchido antes. Nada quebra por causa disso.
const isolar = response => {
  if (!response || !response.body) return response;
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = request.url;
  const mesmaOrigem = url.startsWith(self.location.origin);
  const imutavel = /-[A-Za-z0-9_]{8,}\.(js|css)$/.test(url) || url.startsWith(PYODIDE);

  // Documento e worker precisam sair daqui já isolados, venham da rede ou do cache.
  const precisaIsolar = request.mode === 'navigate' || url.endsWith('/python-worker.js');

  if (imutavel) {
    // Cache primeiro: o nome do arquivo muda quando o conteúdo muda, então não há o que invalidar.
    event.respondWith(caches.match(request).then(pronto => pronto || fetch(request).then(r => guardar(request, r))));
    return;
  }
  if (mesmaOrigem) {
    // Rede primeiro, cache como rede de segurança: assim uma correção chega no próximo acesso,
    // e sem internet o campus continua abrindo.
    event.respondWith(fetch(request)
      .then(r => guardar(request, r))
      .catch(() => caches.match(request))
      .then(r => (precisaIsolar ? isolar(r) : r)));
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
