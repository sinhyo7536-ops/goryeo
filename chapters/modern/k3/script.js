// 근대편 3장 「동학 농민 운동과 갑오개혁」. 사실은 비상 5-2 교과서 100쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    peasant: { name: '고부 농민', mark: '農', color: '#7a4e32', look: 'peasant' },
    jeonbongjun: { name: '전봉준', mark: '全', color: '#8a2f24', look: 'jeonbongjun' },
    farmer: { name: '농민군', mark: '軍', color: '#6b4a32', look: 'uibyeong' },
  },
  intro: [
    { who: 'narr', text: '개항 뒤 늘어난 세금과 탐관오리의 수탈로 백성의 생활은 어려워졌어요.', src: ['S51'] },
    { who: 'narr', text: '특히 전라도 고부에서는 군수의 횡포에 농민의 불만이 커졌어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '여기는 1894년 전라도 고부의 들판이야. 농민들의 표정이 어두워.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['고부 농민에게 말을 걸어 보자', '전봉준을 찾아가자', '농민군의 이야기를 들어 보자', '농민군과 함께하자', '배운 내용을 확인해 보자'],
  minigameTitle: '동학 농민 운동',
  npc: {
    peasant: {
      first: [
        { who: 'peasant', text: '세금이 자꾸 늘어서 먹고살기가 너무 힘들어요.', src: ['S51'] },
        { who: 'peasant', text: '고부 군수는 백성을 괴롭히기만 해요.', src: ['S51'] },
      ],
      later: [{ who: 'peasant', text: '전봉준 장군님이 우리를 이끌어 주신대요.' }],
    },
    jeonbongjun: {
      tooEarly: [{ who: 'jeonbongjun', text: '마을 사람들의 이야기를 먼저 들어 보게.' }],
      first: [
        { who: 'jeonbongjun', text: '나는 동학의 지도자 전봉준이오. 군수의 횡포를 더는 참을 수 없소.', src: ['S51'] },
        { who: 'jeonbongjun', text: '농민들과 함께 고부 관아를 습격할 것이오.', src: ['S51'] },
      ],
      later: [{ who: 'jeonbongjun', text: '마을을 돌며 농민들을 모아 주게.' }],
    },
    farmer: {
      tooEarly: [{ who: 'farmer', text: '전봉준 장군님께 먼저 인사드리게.' }],
      first: [
        { who: 'farmer', text: '고부에서 시작한 우리 운동이 큰 농민 운동이 되었어.', src: ['S51'] },
        { who: 'farmer', text: '마을마다 다니며 함께할 농민들을 모으자!' },
      ],
    },
    signDonghak: { always: [
      { who: 'narr', text: '동학은 조선 후기에 최제우가 만든 종교로, 모든 사람이 평등하다고 주장해 백성 사이에 널리 퍼졌어요.', src: ['S51'] },
    ] },
    signGabo: { always: [
      { who: 'narr', text: '정부는 갑신정변의 개혁안과 동학 농민군의 요구를 일부 받아들여 갑오개혁을 했어요(1894년).', src: ['S51'] },
      { who: 'narr', text: '갑오개혁으로 신분제와 과거제가 없어졌어요.', src: ['S51'] },
    ] },
  },
  parts: {
    gather: {
      type: 'collect', title: '마을을 돌며 농민군을 모아요', counter: '모은 마을', seconds: 90,
      fail: '화살표가 가리키는 빛나는 곳으로 걸어가요. 가장 가까운 곳부터 가면 빨라요.',
      done: [{ who: 'narr', text: '전봉준이 이끈 농민들의 봉기는 큰 농민 운동이 되었어요. 이것을 동학 농민 운동이라고 해요.', src: ['S51'] }],
    },
    demands: {
      type: 'choose', src: ['S51'],
      title: '동학 농민군이 요구한 개혁안을 모두 골라요',
      cards: [
        { text: '탐관오리를 모두 쫓아낼 것', correct: true },
        { text: '세금을 더 많이 걷을 것', correct: false },
        { text: '관직을 파는 사람들을 모두 쫓아낼 것', correct: true },
        { text: '집마다 매기는 여러 가지 세금을 줄일 것', correct: true },
        { text: '외국 군대를 불러들일 것', correct: false },
      ],
      fail: '농민들을 괴롭히던 것을 없애 달라는 요구였어요.',
    },
    flow: {
      type: 'order', src: ['S51'],
      title: '동학 농민 운동이 일어난 차례대로 놓아요',
      cards: ['고부 관아를 습격했다', '정부와 화약을 맺고 해산했다', '일본군이 경복궁을 점령했다', '농민군이 다시 일어났다', '전봉준이 체포되었다'],
      fail: '처음엔 정부와 화약을 맺었지만, 일본이 경복궁을 점령하자 농민군이 다시 일어났어요.',
      done: [{ who: 'narr', text: '다시 일어난 농민군은 일본군과 관군에 패했고, 전봉준 등 지도자들은 체포되었어요.', src: ['S51'] }],
    },
  },
  result: [{ who: 'narr', text: '정부는 농민군의 요구를 일부 받아들여 갑오개혁을 했고, 신분제와 과거제가 없어졌어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '동학 농민 운동을 이끈 사람은?', options: ['전봉준', '김옥균', '안중근'], answer: 0, explain: '동학 지도자 전봉준이 농민들을 이끌었어요.', src: ['S51'] },
    { kind: 'quiz', question: '갑오개혁으로 없어진 제도는?', options: ['학교', '신분제', '우편'], answer: 1, explain: '갑오개혁으로 신분제와 과거제가 없어졌어요.', src: ['S51'] },
  ],
};
