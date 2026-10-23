// 현대편 5장 「전쟁 뒤의 삶」. 사실은 비상 5-2 교과서 145쪽(S51)과 이산가족 찾기(S62).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    mother: { name: '행상 아주머니', mark: '母', color: '#b8768a', look: 'woman' },
    grandma: { name: '밀면집 할머니', mark: '老', color: '#6b4a32', look: 'grandma' },
    student: { name: '학생', mark: '學', color: '#22262e', look: 'student' },
  },
  intro: [
    { who: 'narr', text: '6·25 전쟁을 거치면서 우리 사회는 많은 변화를 겪었어요.', src: ['S51'] },
    { who: 'narr', text: '도시를 중심으로 복구가 이루어지면서 서울을 비롯한 대도시에 사람들이 몰렸어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '여기는 부산의 피란민 마을이야. 다닥다닥 판잣집이 모여 있어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['행상 아주머니에게 말을 걸어 보자', '밀면집 할머니를 만나자', '학생의 이야기를 들어 보자', '이웃을 도와 함께 일어서자', '배운 내용을 확인해 보자'],
  minigameTitle: '다시 일어서다',
  npc: {
    mother: {
      first: [
        { who: 'mother', text: '도시로 몰려든 사람들은 판잣집 같은 어려운 환경에서 살았지요.', src: ['S51'] },
        { who: 'mother', text: '전쟁으로 많은 남성이 죽거나 다쳐서, 여성들이 공장에 다니거나 행상을 하며 가족의 생계를 책임지는 경우가 많아졌어요.', src: ['S51'] },
      ],
      later: [{ who: 'mother', text: '오늘도 열심히 팔아야지요.' }],
    },
    grandma: {
      tooEarly: [{ who: 'grandma', text: '저기 아주머니부터 만나 보렴.' }],
      first: [
        { who: 'grandma', text: '38도선 북쪽에서 피란 온 사람들은 고향 음식 냉면을 그리워했단다.', src: ['S51'] },
        { who: 'grandma', text: '메밀을 구하기 어려워서 구호물품으로 받은 밀가루로 냉면을 만들었지. 이것이 부산 밀면의 시작이란다.', src: ['S51'] },
      ],
      later: [{ who: 'grandma', text: '밀면 한 그릇 먹고 가렴.' }],
    },
    student: {
      tooEarly: [{ who: 'student', text: '마을 어른들 이야기를 먼저 들어 봐.' }],
      first: [
        { who: 'student', text: '교실이 부서져서 운동장에서 수업을 받아요.', src: ['S51'] },
        { who: 'student', text: '그래도 사람들은 서로를 적으로 여기는 교육을 강화하기도 했어요. 남과 북은 오랫동안 긴장했지요.', src: ['S51'] },
      ],
    },
    signFamily: { always: [
      { who: 'narr', text: '전쟁으로 헤어진 가족을 찾으려고 1983년 텔레비전 생방송이 138일 동안 이어졌고, 1만여 명이 다시 만났어요.', src: ['S62'] },
    ] },
    signTask: { always: [
      { who: 'narr', text: '분단이 이어지면서 오늘날까지 전쟁의 상처는 아물지 않았어요. 평화 통일을 이루는 일은 우리의 과제로 남아 있어요.', src: ['S51'] },
    ] },
  },
  parts: {
    help: {
      type: 'collect', title: '이웃집에 물을 날라 줘요', counter: '도운 이웃', seconds: 80,
      fail: '화살표가 가리키는 빛나는 곳으로 가요.',
    },
    life: {
      type: 'choose', src: ['S51'],
      title: '6·25 전쟁 뒤의 생활 모습을 모두 골라요',
      cards: [
        { text: '판잣집 같은 어려운 환경에서 살았다', correct: true },
        { text: '전쟁 뒤 곧바로 남북이 통일되었다', correct: false },
        { text: '많은 여성이 공장에 다니거나 행상을 하며 가족을 돌보았다', correct: true },
        { text: '도시로 오는 사람이 줄어들었다', correct: false },
        { text: '교실이 부서져 운동장에서 수업을 받았다', correct: true },
      ],
      fail: '마을 사람들이 들려준 이야기를 떠올려 보세요.',
    },
  },
  result: [{ who: 'narr', text: '사람들은 어려움 속에서도 서로 도우며 다시 일어섰어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '피란민이 밀가루로 냉면을 만들면서 생긴 음식은?', options: ['밀면', '떡볶이', '짜장면'], answer: 0, explain: '구호물품 밀가루로 만든 냉면이 부산 밀면의 시작이에요.', src: ['S51'] },
    { kind: 'quiz', question: '6·25 전쟁 뒤 우리에게 남은 과제는?', options: ['평화 통일', '개항', '신분제 없애기'], answer: 0, explain: '분단이 이어져 평화 통일은 우리의 과제로 남아 있어요.', src: ['S51'] },
  ],
};
