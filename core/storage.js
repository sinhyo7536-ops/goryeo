// localStorage를 감싸 예외를 모두 삼키는 저장소. 시크릿 창처럼 저장이 막혀도 게임은 계속된다.
export function createStorage(backend = globalThis.localStorage) {
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
