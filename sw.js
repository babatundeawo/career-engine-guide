/* Career Engine service worker.
   VERSION and PRECACHE are filled in by .github/scripts/build.py on every deploy,
   so each release gets its own cache and old caches are removed on activate. */
'use strict';

const VERSION = 'dev';
const PRECACHE = /*PRECACHE*/[]/*END*/;
const CACHE = 'ce-' + VERSION;
const OFFLINE = 'offline.html';
const NAV_TIMEOUT_MS = 4000;

const scope = self.registration.scope;
const abs = (path) => new URL(path, scope).href;

self.addEventListener('install', (event) => {
  /* No automatic skipWaiting: the page shows an "Update available" prompt and
     asks this worker to take over, so a reader is never switched mid-sentence. */
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(PRECACHE.map((path) => cache.add(new Request(abs(path), { cache: 'reload' }))))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ce-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') { self.skipWaiting(); }
});

function networkFirst(request) {
  return new Promise((resolve) => {
    let settled = false;
    const fromCache = () => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match(abs(OFFLINE)));
    const timer = setTimeout(() => {
      fromCache().then((hit) => { if (!settled && hit) { settled = true; resolve(hit); } });
    }, NAV_TIMEOUT_MS);
    fetch(request).then((response) => {
      clearTimeout(timer);
      if (settled) { return; }
      settled = true;
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      resolve(response);
    }).catch(() => {
      clearTimeout(timer);
      if (settled) { return; }
      settled = true;
      fromCache().then(resolve);
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((hit) => {
      const update = fetch(request).then((response) => {
        if (response.ok) { cache.put(request, response.clone()); }
        return response;
      }).catch(() => hit);
      return hit || update;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') { return; }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(scope)) { return; }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
