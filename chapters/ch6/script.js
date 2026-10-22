// 6장 대사와 퀴즈. 문장과 출처 번호는 설계 문서 4장 6장 절을 따른다.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    baejungson: { name: '배중손', mark: '裵', color: '#2a3a5a', look: 'baejungson' },
    kimtongjeong: { name: '김통정', mark: '金', color: '#4a3a2a', look: 'kimtongjeong' },
    sambyeolcho: { name: '삼별초 병사', mark: '兵', color: '#3a2f2a', look: 'sambyeolcho' },
  },

  intro: [
    { who: 'narr', text: '1270년, 고려 조정은 몽골과 싸움을 멈추고 강화도에서 개경으로 돌아가기로 했어요.', src: ['S21'] },
    { who: 'narr', text: '삼별초는 이에 반대하며 끝까지 싸우기로 했어요.', src: ['S21'] },
  ],

  start: [{ who: 'guide', text: '여기는 강화도 포구야. 앞쪽 부두에 있는 배중손에게 가 보자.' }],

  goals: ['부두의 배중손에게 말을 걸어 보자', '배를 몰아 진도로 가자', '배를 몰아 제주로 가자', '고려를 지킨 사람들을 순서대로 놓아 보자', '배운 내용을 확인해 보자'],

  npc: {
    baejungson: [{ who: 'baejungson', text: '배에 군사와 백성을 태워 남쪽 진도로 가자.', src: ['S21'] }],
    sambyeolcho: [{ who: 'sambyeolcho', text: '배가 준비됐어요! 배중손 님께 먼저 말씀드려요.' }],
  },

  sail: {
    howto: {
      title: '바닷길 항해',
      steps: ['배를 몰아 앞쪽의 빛나는 원(도착 지점)까지 가요.', '바위에 막히면 옆으로 돌아가요.', '뒤쫓아 오는 배에 잡히면 그 바닷길을 처음부터 다시 가요.'],
      keyboard: 'W A S D 또는 방향키로 배 몰기',
      touch: '화면 왼쪽을 끌어 배 몰기',
    },
    failHint: '추격선에 잡혔어요. 이번 바닷길을 처음부터 다시 가 봐요.',
  },

  jindo: [
    { who: 'narr', text: '삼별초는 진도 용장성을 근거지로 9개월 동안 맞섰어요.', src: ['S12'] },
    { who: 'narr', text: '1271년 5월 용장성이 무너지자, 김통정이 남은 군사를 이끌고 제주로 건너갔어요.', src: ['S12'] },
    { who: 'kimtongjeong', text: '남은 군사는 나를 따라 제주로 가자!' },
  ],

  jeju: [
    { who: 'narr', text: '김통정은 항파두리에 흙으로 성을 쌓고 맞섰어요.', src: ['S13'] },
    { who: 'narr', text: '삼별초는 1273년 고려와 몽골의 연합군에게 진압되었어요.', src: ['S12', 'S13'] },
  ],

  timeline: {
    intro: [{ who: 'guide', text: '거란과 몽골의 침입에 맞선 고려 사람들을 돌아보자. 일어난 순서대로 카드를 눌러 봐.' }],
    title: '고려를 지킨 사람들: 일어난 순서대로 눌러요',
    cards: ['서희의 담판 (993)', '양규의 흥화진 방어 (1010)', '강감찬의 귀주 대첩 (1019)', '강화도 천도 (1232년 7월)', '김윤후의 처인성 싸움 (1232년 12월)', '팔만대장경 만들기 (1236~1251)', '삼별초의 항쟁 (1270~1273)'],
    failHint: '순서가 달라요. 카드에 적힌 해를 보고 다시 해 봐요.',
  },

  quizzes: [
    { kind: 'quiz', question: '삼별초가 근거지를 옮긴 순서는?', options: ['강화도 → 진도 → 제주도', '제주도 → 진도 → 강화도', '진도 → 강화도 → 제주도'], answer: 0, explain: '강화도에서 진도로, 진도에서 제주로 옮겨 가며 싸웠어요.', src: ['S12', 'S21'] },
    { kind: 'quiz', question: '삼별초가 끝까지 싸운 까닭은?', options: ['고려 조정이 몽골과 싸움을 멈추고 개경으로 돌아가는 데 반대해서', '거란을 물리치려고', '대장경을 지키려고'], answer: 0, explain: '삼별초는 조정이 몽골과 싸움을 멈추고 개경으로 돌아가는 것에 반대했어요.', src: ['S21'] },
  ],
};
