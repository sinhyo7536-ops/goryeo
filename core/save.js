// 진행 상황 저장. 기기 안(localStorage)에만 두고 밖으로 보내지 않는다.
const KEY = 'goryeo-game:v1';
const empty = () => ({ name: '', chapters: {}, current: null });

// ★★★ 퀴즈 2개 정답 + 쉬운 모드 안 씀, ★★☆ 퀴즈 1개 이상, ★☆☆ 완료
export function computeStars({ quizCorrect, easyModeUsed }) {
  if (quizCorrect >= 2 && !easyModeUsed) return 3;
  if (quizCorrect >= 1) return 2;
  return 1;
}

export function createSave(storage) {
  const save = {
    data: empty(),
    load() {
      const d = storage.get(KEY);
      const valid = d && typeof d === 'object' && typeof d.name === 'string' && d.chapters && typeof d.chapters === 'object';
      save.data = valid ? { name: d.name, chapters: d.chapters, current: d.current || null } : empty();
      return save.data;
    },
    persist() { return storage.set(KEY, save.data); },
    reset() { save.data = empty(); storage.remove(KEY); },
    setName(name) { save.data.name = name; save.persist(); },
    startChapter(id) { save.checkpoint(id, 'intro'); },
    checkpoint(id, stage) { save.data.current = { id, stage }; save.persist(); },
    finishChapter(id, result) {
      save.data.chapters[id] = result;
      save.data.current = null;
      save.persist();
    },
    chapterResult(id) { return save.data.chapters[id] || null; },
    // 메뉴에서 장 선택으로 나갈 때: 하던 장을 버려서 다음에는 지도부터 보이게 한다
    abandonCurrent() { save.data.current = null; save.persist(); },
  };
  return save;
}
