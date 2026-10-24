// 오프라인 캐시: 받은 게임 파일을 기기에 저장해 두고, 인터넷이 끊기거나 아주 느릴 때만 저장된 파일로 연다.
// 인터넷이 되면 언제나 새 파일을 받아 쓴다(고친 내용이 바로 보이게).
import { CACHE, precacheRequests, cacheKeyFor, networkFirst } from './core/precache.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(precacheRequests())).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const key = cacheKeyFor(req.url, req.mode, self.location.href);
  e.respondWith(networkFirst({
    fetch: () => fetch(req, { cache: 'no-cache' }), // 브라우저 캐시도 서버에 바뀌었는지 묻게
    match: () => caches.match(key || req, { ignoreSearch: true }),
    put: res => caches.open(CACHE).then(c => c.put(key || req, res)),
  }));
});
