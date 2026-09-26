/* ============================================================
   SPROUT — service worker
   · Arranca SIEMPRE de la caché: el juego abre al instante y sin red.
   · Cada versión (la calcula scripts/version.cjs con un hash del contenido)
     precarga todo lo que el juego necesita, de golpe y saltándose la caché
     HTTP de GitHub Pages; así nunca se mezclan ficheros de dos versiones.
   · Cuando hay una versión nueva se instala en segundo plano y se activa
     enseguida (el juego ya abierto no pide nada más); la página se entera
     por `controllerchange` y recarga cuando no se pierde nada: en el
     título, al tocar el aviso o al volver al título (js/16b-pwa.js).
   · Lo que no está en la precarga (la demo, las capturas): red primero y,
     sin red, lo último que se vio.
   ============================================================ */
const VERSION = '2026.09.26-41ac4afd';
const CACHE = 'sprout-' + VERSION, RUNTIME = 'sprout-runtime';
const PRECACHE = [
  // PRECACHE:BEGIN
  './index.html',
  './manifest.webmanifest',
  './assets/title-bg.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  './js/00-version.js',
  './js/01-core.js',
  './js/01a-font.js',
  './js/02-sprites.js',
  './js/03-tiles.js',
  './js/04-maps.js',
  './js/05-texts.js',
  './js/06-audio.js',
  './js/07-state.js',
  './js/08-world.js',
  './js/08a-fx.js',
  './js/09-player.js',
  './js/10-progress.js',
  './js/11-enemies.js',
  './js/11a-ardilla.js',
  './js/11b-bichos-valle.js',
  './js/11c-bichos-campo.js',
  './js/11d-bichos-mazmorra.js',
  './js/11e-bichos-molino.js',
  './js/12-bosses.js',
  './js/12a-dungeon.js',
  './js/12b-molino.js',
  './js/12b-gear.js',
  './js/12c-secrets.js',
  './js/12d-olvido.js',
  './js/13-update.js',
  './js/14-render.js',
  './js/15-ui.js',
  './js/15a-intro.js',
  './js/15b-zurron.js',
  './js/15c-marchitar.js',
  './js/15d-momento.js',
  './js/15e-cinearma.js',
  './js/15f-roble.js',
  './js/15g-puertas.js',
  './js/15h-titulo.js',
  './js/15i-presenta.js',
  './js/15j-cueva.js',
  './js/15k-tronco.js',
  './js/15l-templo.js',
  './js/15m-molino.js',
  './js/16-input.js',
  './js/16a-shell.js',
  './js/16b-pwa.js',
  './js/17-boot.js',
  // PRECACHE:END
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('sprout-') && k !== CACHE && k !== RUNTIME) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'version' && e.source) e.source.postMessage({ type: 'version', version: VERSION });
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  // los vídeos (piden trozos, 206) y la documentación (docs/: el tráiler, las capturas) van directos a la red
  if (req.headers.has('range') || rel.startsWith('docs/') || /\.(mp4|webm|mov)$/i.test(rel)) return;
  if (req.mode === 'navigate' && (rel === '' || rel === 'index.html')) { e.respondWith(shell(req)); return; }
  e.respondWith((async () => (await caches.match(req, { ignoreSearch: true, cacheName: CACHE })) || network(req))());
});

async function shell(req) { // el juego: de la precarga; si faltara (primera visita a medias), de la red
  const hit = await caches.match('./index.html', { cacheName: CACHE });
  return hit || network(req);
}
async function network(req) { // red primero, guardando una copia; sin red, la copia
  try {
    const res = await fetch(req);
    if (res && res.status === 200 && res.type === 'basic') { const copy = res.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)).catch(() => {}); } // la copia, sin esperar; si no se puede guardar, la respuesta sigue valiendo
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const home = await caches.match('./index.html'); if (home) return home; }
    throw err;
  }
}
