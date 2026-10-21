// 오프라인 캐시: 한 번 받은 게임 파일을 기기에 두고, 다음 접속부터는 저장된 파일로 바로 연다.
// 같은 출처의 GET 요청은 저장된 것을 먼저 쓰고, 뒤에서 네트워크로 새 파일을 받아 갱신한다.
import { CACHE, PRECACHE, cacheKeyFor } from './core/precache.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
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
  e.respondWith(caches.match(key || req, { ignoreSearch: true }).then(hit => {
    const fresh = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
