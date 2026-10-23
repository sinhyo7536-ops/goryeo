// 일제 강점기편 4장 「봉오동 전투와 청산리 대첩」. 사실은 비상 5-2 교과서 128쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    soldier: { name: '독립군', mark: '軍', color: '#5a6448', look: 'independenceArmy' },
    hongbeomdo: { name: '홍범도', mark: '洪', color: '#4e5840', look: 'hongbeomdo' },
    kimjwajin: { name: '김좌진', mark: '金', color: '#4e5840', look: 'kimjwajin' },
  },
  intro: [
    { who: 'narr', text: '나라 밖에서도 독립운동과 저항이 이어졌어요. 만주에서는 독립군 부대들이 일본군과 맞서 싸웠어요.', src: ['S51'] },
    { who: 'narr', text: '1920년, 홍범도가 이끄는 독립군 부대는 만주 봉오동 일대에서 일본군을 크게 무찔렀어요(봉오동 전투).', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '여기는 만주의 깊은 산골짜기, 독립군의 진영이야.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['독립군에게 말을 걸어 보자', '홍범도를 만나자', '김좌진을 찾아가자', '청산리에서 싸우자', '배운 내용을 확인해 보자'],
  minigameTitle: '청산리 대첩',
  npc: {
    soldier: {
      first: [
        { who: 'soldier', text: '봉오동에서 진 일본군이 더 많은 군대를 이끌고 다시 쳐들어온대.', src: ['S51'] },
        { who: 'soldier', text: '홍범도 장군님이 진영 위쪽에 계셔.' },
      ],
      later: [{ who: 'soldier', text: '골짜기 지형을 잘 알아 두자.' }],
    },
    hongbeomdo: {
      tooEarly: [{ who: 'hongbeomdo', text: '먼저 진영의 독립군들과 이야기해 보게.' }],
      first: [
        { who: 'hongbeomdo', text: '봉오동에서 우리는 일본군을 공격해 크게 무찔렀네.', src: ['S51'] },
        { who: 'hongbeomdo', text: '이번에는 김좌진 장군의 부대와 힘을 합칠 것이네.', src: ['S51'] },
      ],
      later: [{ who: 'hongbeomdo', text: '김좌진 장군을 만나 보게.' }],
    },
    kimjwajin: {
      tooEarly: [{ who: 'kimjwajin', text: '홍범도 장군께 먼저 인사드리게.' }],
      first: [
        { who: 'kimjwajin', text: '청산리 골짜기의 지형을 이용해 일본군과 맞설 것이다.', src: ['S51'] },
        { who: 'kimjwajin', text: '흩어진 부대를 모으고, 적이 골짜기 깊이 들어오면 공격한다!' },
      ],
    },
    signHeroes: { always: [
      { who: 'narr', text: '남자현은 3·1 운동 뒤 만주로 가 독립운동을 했고, 권기옥은 우리나라 최초의 여성 비행사가 되어 독립운동을 도왔어요.', src: ['S51'] },
    ] },
    signUiyeol: { always: [
      { who: 'narr', text: '만주에서 만든 의열단의 단원들은 나라 안팎에서 일제의 고위 관리를 처단하고 식민 통치 기구를 파괴하려 했어요.', src: ['S51'] },
    ] },
  },
  parts: {
    gather: {
      type: 'collect', title: '흩어진 독립군 부대를 모아요', counter: '모은 부대', seconds: 70,
      fail: '화살표가 가리키는 빛나는 곳으로 가요.',
    },
    ambush: {
      type: 'gauge', title: '일본군이 골짜기 깊이 들어오면 공격 신호!', label: '공격!', zone: [0.58, 0.78], seconds: 4.5,
      prompt: '표시가 빛나는 칸(골짜기 한가운데)에 들어왔을 때 눌러요.',
      fail: '너무 이르거나 늦었어요. 적이 골짜기 한가운데 왔을 때 신호를 보내요.',
      done: [{ who: 'narr', text: '김좌진과 홍범도가 이끄는 독립군 부대는 청산리의 지형을 이용한 전술로 일본군에 큰 승리를 거두었어요(청산리 대첩, 1920년).', src: ['S51'] }],
    },
    leaders: {
      type: 'choose', src: ['S51'],
      title: '청산리 대첩을 이끈 독립군 지도자 두 사람을 골라요',
      cards: [
        { text: '김좌진', correct: true }, { text: '김옥균', correct: false }, { text: '홍범도', correct: true }, { text: '전봉준', correct: false },
      ],
      fail: '오늘 만난 두 장군을 떠올려 보세요.',
    },
  },
  result: [{ who: 'narr', text: '독립군의 승리는 나라를 빼앗긴 우리 민족에게 큰 용기를 주었어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '봉오동 전투에서 독립군을 이끈 사람은?', options: ['홍범도', '김구', '안창호'], answer: 0, explain: '홍범도가 이끄는 독립군 부대가 봉오동에서 일본군을 무찔렀어요.', src: ['S51'] },
    { kind: 'quiz', question: '1920년 독립군이 지형을 이용해 크게 이긴 싸움은?', options: ['한산도 대첩', '귀주 대첩', '청산리 대첩'], answer: 2, explain: '김좌진과 홍범도의 독립군이 청산리에서 크게 이겼어요.', src: ['S51'] },
  ],
};
