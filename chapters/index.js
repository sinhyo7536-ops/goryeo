// 고려편 6개 장. load가 null인 장은 지도에 "준비 중"으로 보인다.
export const CHAPTERS = [
  { id: 'ch1', no: 1, session: 1, title: '서희의 외교 담판', years: '993', event: '거란 1차 침입', place: '고려 서북쪽 국경', mapXY: [33, 27], load: () => import('./ch1/chapter.js') },
  { id: 'ch2', no: 2, session: 1, title: '양규와 흥화진', years: '1010', event: '거란 2차 침입', place: '흥화진', mapXY: [20, 17], load: () => import('./ch2/chapter.js') },
  { id: 'ch3', no: 3, session: 1, title: '강감찬과 귀주 대첩', years: '1018~1019', event: '거란 3차 침입', place: '귀주', mapXY: [28, 21], load: () => import('./ch3/chapter.js') },
  { id: 'ch4', no: 4, session: 1, title: '강화도 천도와 처인성·충주성', years: '1231~1253', event: '몽골 침입', place: '강화도', mapXY: [33, 55], load: () => import('./ch4/chapter.js') },
  { id: 'ch5', no: 5, session: 1, title: '팔만대장경', years: '1236~1251', event: '몽골 침입', place: '합천 해인사', mapXY: [62, 78], load: () => import('./ch5/chapter.js') },
  { id: 'ch6', no: 6, session: 1, title: '삼별초의 항쟁', years: '1270~1273', event: '몽골에 맞선 항쟁', place: '진도·제주', mapXY: [32, 85], load: () => import('./ch6/chapter.js') },
];

// 조선편 6개 장 (조선편 설계 문서). 장을 완성하면 load를 채운다.
export const JOSEON = [
  { id: 'j1', no: 1, session: 2, title: '위화도 회군과 조선 건국', years: '1388~1394', event: '새 나라 조선', place: '위화도·한양', mapXY: [20, 20], load: () => import('./joseon/j1/chapter.js') },
  { id: 'j2', no: 2, session: 2, title: '세종과 훈민정음', years: '1443~1446', event: '우리 글자', place: '한양 경복궁', mapXY: [35, 51], load: () => import('./joseon/j2/chapter.js') },
  { id: 'j3', no: 3, session: 2, title: '세종 때의 과학 기술', years: '1434~1442', event: '시간과 비를 재다', place: '한양', mapXY: [45, 49], load: () => import('./joseon/j3/chapter.js') },
  { id: 'j4', no: 4, session: 2, title: '임진왜란과 한산도 대첩', years: '1592', event: '일본의 침입', place: '한산도 앞바다', mapXY: [60, 88], load: null },
  { id: 'j5', no: 5, session: 2, title: '병자호란과 남한산성', years: '1636~1637', event: '청의 침입', place: '남한산성', mapXY: [50, 58], load: null },
  { id: 'j6', no: 6, session: 2, title: '영조·정조와 수원 화성', years: '1742~1796', event: '탕평과 화성', place: '수원', mapXY: [39, 62], load: null },
];

export const ALL_CHAPTERS = [...CHAPTERS, ...JOSEON];

// 결과 카드의 핵심 정리 (편마다 장마다 한 줄). 한 편의 1~6장을 한 번에 이어서 한다.
export const SESSIONS = {
  1: {
    title: '외세의 침입과 고려의 노력',
    points: [
      '서희는 담판으로 강동 6주를 얻었다',
      '양규는 흥화진을 지키고 백성을 구했다',
      '강감찬은 귀주 대첩에서 거란군을 크게 물리쳤다',
      '고려는 강화도로 도읍을 옮겨 몽골에 맞섰고, 김윤후와 백성들은 처인성과 충주성을 지켰다',
      '고려 사람들은 부처의 힘으로 나라를 지키려고 팔만대장경을 만들었다',
      '삼별초는 진도와 제주에서 끝까지 싸웠다',
    ],
  },
  2: {
    title: '조선의 건국과 발전',
    points: [
      '이성계는 위화도에서 군사를 돌리고 조선을 세워 한양으로 도읍을 옮겼다',
      '세종은 백성을 위해 훈민정음을 만들었다',
      '세종 때 앙부일구·자격루·측우기 같은 과학 기구를 만들었다',
      '이순신은 한산도 대첩에서 학익진으로 일본 수군을 물리쳤고, 각지에서 의병이 일어났다',
      '병자호란 때 인조는 남한산성에서 버티다 삼전도에서 항복했다',
      '영조와 정조는 탕평책을 펼쳤고, 정조는 거중기를 써서 수원 화성을 쌓았다',
    ],
  },
};

// 시대별 편. 첫 화면 뒤 편 고르기에서 고른다. 두 편 모두 처음부터 열려 있다.
export const COURSES = [
  { id: 'goryeo', session: 1, title: '고려를 지켜라', era: '고려', eyebrow: '외세의 침입과 고려의 노력', chapters: CHAPTERS,
    lead: '거란과 몽골이 쳐들어왔을 때, 고려 사람들은 외교와 전투와 끈질긴 항쟁으로 나라를 지켰어요.' },
  { id: 'joseon', session: 2, title: '조선을 걷다', era: '조선', eyebrow: '조선의 건국과 발전', chapters: JOSEON,
    lead: '조선을 세운 사람들, 우리 글자와 과학 기구를 만든 사람들, 전쟁을 이겨 낸 사람들을 만나 보세요.' },
];

export const courseById = id => COURSES.find(c => c.id === id) || COURSES[0];
export const courseOfChapter = chapterId => COURSES.find(c => c.chapters.some(ch => ch.id === chapterId)) || COURSES[0];

// 장을 열 수 있는지: 각 편의 1장은 언제나, 나머지는 같은 편의 앞 장을 마쳐야 한다.
export function isUnlocked(chapter, save) {
  if (!chapter.load) return false;
  if (chapter.no === 1) return true;
  const prev = ALL_CHAPTERS.find(c => c.session === chapter.session && c.no === chapter.no - 1);
  return !!(prev && save.chapterResult(prev.id));
}

// 결과 카드를 띄울 때: 그 편의 모든 장을 마쳤는지
export function isSessionDone(session, save) {
  return ALL_CHAPTERS.filter(c => c.session === session).every(c => save.chapterResult(c.id));
}
