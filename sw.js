/* SPROUT — service worker: código siempre fresco (network-first), recursos cache-first */
const CACHE = 'sprout-v4';
const CODE = [
  './', './index.html',
  './js/01-core.js', './js/02-sprites.js', './js/03-tiles.js', './js/04-maps.js',
  './js/05-texts.js', './js/06-audio.js', './js/07-state.js', './js/08-world.js',
  './js/09-player.js', './js/10-progress.js', './js/11-enemies.js', './js/12-update.js',
  './js/13-render.js', './js/14-input.js', './js/15-boot.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CODE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  const isCode = req.mode === 'navigate' || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/') || url.pathname.includes('/js/');
  if (isCode) {
    // network-first: las actualizaciones del juego llegan; sin red, cae a la caché
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => { try { c.put(req, clone); } catch (_) {} });
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // cache-first para fuente y demás recursos
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => { try { c.put(req, clone); } catch (_) {} });
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
