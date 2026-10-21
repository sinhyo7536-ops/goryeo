// localStorage를 감싸 예외를 모두 삼키는 저장소. 시크릿 창처럼 저장이 막혀도 게임은 계속된다.
// backend는 저장소 객체이거나 저장소를 돌려주는 함수다. 사이트 데이터가 막힌 브라우저는 localStorage를 꺼내는 순간 예외를 던진다.
export function createStorage(backend = () => globalThis.localStorage) {
  if (typeof backend === 'function') {
    try { backend = backend(); } catch { backend = null; }
  }
  if (!backend) backend = { getItem() { throw new Error('no storage'); }, setItem() { throw new Error('no storage'); }, removeItem() {} };
  const store = {
    available: false,
    get(key) {
      try {
        const raw = backend.getItem(key);
        return raw == null ? null : JSON.parse(raw);
      } catch { return null; }
    },
    set(key, value) {
      try { backend.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key) {
      try { backend.removeItem(key); } catch { /* 저장소를 쓸 수 없음 */ }
    },
  };
  store.available = store.set('__probe', 1);
  store.remove('__probe');
  return store;
}
