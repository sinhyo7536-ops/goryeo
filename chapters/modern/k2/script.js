// 근대편 2장 「갑신정변」. 사실은 비상 5-2 교과서 98~99쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    merchant: { name: '한성 상인', mark: '商', color: '#6b4a32', look: 'commoner' },
    clerk: { name: '우정총국 관리', mark: '郵', color: '#55608a', look: 'joseonOfficial' },
    kimokgyun: { name: '김옥균', mark: '金', color: '#3a4a5a', look: 'kimokgyun' },
  },
  intro: [
    { who: 'narr', text: '조선은 서양 문물을 받아들이고 개화 정책을 펼쳤지만 뚜렷한 성과를 거두지 못했어요.', src: ['S51'] },
    { who: 'narr', text: '이 무렵 조선은 청의 간섭을 받고 있었어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '1884년 한성이야. 오늘 밤 새로 생긴 관청에서 축하 잔치가 열린대.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['한성 상인에게 말을 걸어 보자', '우정총국 관리를 찾아가자', '김옥균의 이야기를 들어 보자', '갑신정변을 살펴보자', '배운 내용을 확인해 보자'],
  minigameTitle: '갑신정변',
  npc: {
    merchant: {
      first: [
        { who: 'merchant', text: '나라에서 개화 정책을 편다지만 크게 달라진 게 없어요.', src: ['S51'] },
        { who: 'merchant', text: '게다가 청나라가 우리 일에 이래라저래라 간섭을 한다니까요.', src: ['S51'] },
      ],
      later: [{ who: 'merchant', text: '오늘 밤 우정총국에서 잔치가 열린대요.' }],
    },
    clerk: {
      tooEarly: [{ who: 'clerk', text: '시장 쪽 상인에게 먼저 가 보게.' }],
      first: [
        { who: 'clerk', text: '이곳 우정총국은 우리나라 최초로 우편 업무를 맡은 관청이라네.', src: ['S51'] },
        { who: 'clerk', text: '오늘 밤 우정총국이 생긴 것을 축하하는 잔치가 열리지.', src: ['S51'] },
      ],
      later: [{ who: 'clerk', text: '잔치 준비로 바쁘다네.' }],
    },
    kimokgyun: {
      tooEarly: [{ who: 'kimokgyun', text: '우정총국에 먼저 들러 보게.' }],
      first: [
        { who: 'kimokgyun', text: '청에 의지하는 세력을 몰아내고 새로운 조선을 만들어야 하오.', src: ['S51'] },
        { who: 'kimokgyun', text: '우리 개화 세력은 오늘 잔치를 틈타 정변을 일으킬 것이오.', src: ['S51'] },
        { who: 'kimokgyun', text: '우리가 발표할 개혁안을 함께 살펴보시오.' },
      ],
    },
    signPost: { always: [
      { who: 'narr', text: '우정총국은 우리나라 최초로 우편 업무를 맡은 관청이에요. 지금도 서울 종로에 남아 있어요.', src: ['S51'] },
    ] },
    signCoup: { always: [
      { who: 'narr', text: '정변은 법에 맞지 않는 방법으로 생긴 큰 정치적 변화를 말해요.', src: ['S51'] },
    ] },
  },
  parts: {
    reform: {
      type: 'choose', src: ['S51'],
      title: '갑신정변 때 발표한 개혁안의 내용을 모두 골라요',
      cards: [
        { text: '청에 정기적으로 바치던 예물을 없앤다', correct: true },
        { text: '신분에 따라 관리를 뽑는다', correct: false },
        { text: '문벌을 없애 백성이 평등한 권리를 갖게 한다', correct: true },
        { text: '청의 간섭을 더 받아들인다', correct: false },
        { text: '세금 제도를 고쳐 관리의 부정을 막는다', correct: true },
      ],
      fail: '개화 세력은 청에서 벗어나고, 백성이 평등하고, 나라 살림이 넉넉해지기를 바랐어요.',
    },
    flow: {
      type: 'order', src: ['S51'],
      title: '갑신정변이 일어난 차례대로 놓아요',
      cards: ['우정총국 축하 잔치가 열렸다', '개화 세력이 정변을 일으켰다', '개혁안을 발표했다', '청이 군대를 보냈다', '정변이 3일 만에 끝났다'],
      fail: '잔치를 틈타 정변을 일으키고, 개혁안을 발표했지만 청의 군대 때문에 끝났어요.',
      done: [{ who: 'narr', text: '갑신정변은 청이 군사를 동원하면서 3일 만에 끝났어요(1884년).', src: ['S51'] }],
    },
  },
  result: [{ who: 'narr', text: '김옥균 등은 일본으로 몸을 피했고, 그 뒤 청의 간섭은 더욱 심해졌어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '갑신정변을 일으킨 개화 세력의 인물은?', options: ['전봉준', '김옥균', '서재필'], answer: 1, explain: '김옥균 등 개화 세력이 1884년 갑신정변을 일으켰어요.', src: ['S51'] },
    { kind: 'quiz', question: '갑신정변은 며칠 만에 끝났나요?', options: ['3일', '30일', '3년'], answer: 0, explain: '청이 군사를 동원하면서 3일 만에 끝났어요.', src: ['S51'] },
  ],
};
