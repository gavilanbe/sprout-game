/* SPROUT — service worker: código siempre fresco (network-first), recursos cache-first */
const CACHE = 'sprout-v12';
const CODE = [
  './', './index.html', './assets/title-bg.png',
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
  './js/12-bosses.js',
  './js/12a-dungeon.js',
  './js/12b-molino.js',
  './js/12b-gear.js',
  './js/12c-secrets.js',
  './js/13-update.js',
  './js/14-render.js',
  './js/15-ui.js',
  './js/15a-intro.js',
  './js/15c-marchitar.js',
  './js/16-input.js',
  './js/17-boot.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CODE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sprout-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  const isCode = req.mode === 'navigate' || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/') || url.pathname.includes('/js/') || url.pathname.endsWith('.css');
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
