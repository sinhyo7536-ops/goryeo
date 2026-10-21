// 6개 장의 목록. load가 null인 장은 지도에 "준비 중"으로 보인다.
export const CHAPTERS = [
  { id: 'ch1', no: 1, session: 1, title: '서희의 외교 담판', years: '993', event: '거란 1차 침입', place: '고려 서북쪽 국경', mapXY: [33, 27], load: () => import('./ch1/chapter.js') },
  { id: 'ch2', no: 2, session: 1, title: '양규와 흥화진', years: '1010', event: '거란 2차 침입', place: '흥화진', mapXY: [20, 17], load: () => import('./ch2/chapter.js') },
  { id: 'ch3', no: 3, session: 1, title: '강감찬과 귀주 대첩', years: '1018~1019', event: '거란 3차 침입', place: '귀주', mapXY: [28, 21], load: () => import('./ch3/chapter.js') },
  { id: 'ch4', no: 4, session: 2, title: '강화도 천도와 처인성·충주성', years: '1231~1253', event: '몽골 침입', place: '강화도', mapXY: [33, 55], load: null },
  { id: 'ch5', no: 5, session: 2, title: '팔만대장경', years: '1236~1251', event: '몽골 침입', place: '합천 해인사', mapXY: [62, 78], load: null },
  { id: 'ch6', no: 6, session: 2, title: '삼별초의 항쟁', years: '1270~1273', event: '몽골에 맞선 항쟁', place: '진도·제주', mapXY: [32, 85], load: null },
];

// 차시 결과 카드의 핵심 정리 3줄 (설계 문서 4장)
export const SESSIONS = {
  1: {
    title: '1차시 · 거란의 침입',
    points: [
      '서희는 담판으로 강동 6주를 얻었다',
      '양규는 흥화진을 지키고 백성을 구했다',
      '강감찬은 귀주 대첩에서 거란군을 크게 물리쳤다',
    ],
  },
  2: {
    title: '2차시 · 몽골의 침입과 삼별초',
    points: [
      '고려는 강화도로 도읍을 옮겨 몽골에 맞섰다',
      '김윤후와 백성들은 처인성과 충주성을 지켰다',
      '팔만대장경을 만들고, 삼별초는 진도와 제주에서 끝까지 싸웠다',
    ],
  },
};

// 장을 열 수 있는지: 1장과 4장(2차시 시작)은 언제나, 나머지는 앞 장을 마쳐야 한다.
export function isUnlocked(chapter, save) {
  if (!chapter.load) return false;
  if (chapter.no === 1 || chapter.no === 4) return true;
  return !!save.chapterResult(`ch${chapter.no - 1}`);
}
