// 일제 강점기편 2장 「3·1 운동」. 사실은 비상 5-2 교과서 122~123쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    student: { name: '학생', mark: '學', color: '#22262e', look: 'student' },
    leader: { name: '종교 지도자', mark: '代', color: '#3a3530', look: 'gentleman' },
    yugwansun: { name: '유관순', mark: '柳', color: '#6b6152', look: 'yugwansun' },
  },
  intro: [
    { who: 'narr', text: '제1차 세계 대전이 끝나고, 전쟁에서 진 나라들의 식민지가 독립하자 우리 민족도 독립의 희망을 갖게 되었어요.', src: ['S51'] },
    { who: 'narr', text: '종교 지도자들은 고종의 장례식에 맞춰 한 민족이 함께하는 만세 시위를 계획했어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '1919년 3월 1일, 서울 탑골 공원이야. 사람들이 품속에 무언가를 숨기고 모여들어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['학생에게 말을 걸어 보자', '종교 지도자를 만나자', '유관순의 이야기를 들어 보자', '만세 운동에 함께하자', '배운 내용을 확인해 보자'],
  minigameTitle: '대한 독립 만세',
  npc: {
    student: {
      first: [
        { who: 'student', text: '오늘 탑골 공원에서 독립 선언서를 읽고 만세 시위를 할 거예요.', src: ['S51'] },
        { who: 'student', text: '품속에 태극기를 숨겨 왔어요. 함께 나눠 주실래요?' },
      ],
      later: [{ who: 'student', text: '조금만 기다리면 시작이에요!' }],
    },
    leader: {
      tooEarly: [{ who: 'leader', text: '저기 학생들에게 먼저 가 보게.' }],
      first: [
        { who: 'leader', text: '우리 민족 대표들은 같은 시각 태화관에 모여 독립을 선언하오.', src: ['S51'] },
        { who: 'leader', text: '조선이 독립한 나라이며 조선인이 이 나라의 주인임을 세계에 알릴 것이오.', src: ['S51'] },
      ],
      later: [{ who: 'leader', text: '모두 한마음이오.' }],
    },
    yugwansun: {
      tooEarly: [{ who: 'yugwansun', text: '종교 지도자분의 말씀부터 들어 보세요.' }],
      first: [
        { who: 'yugwansun', text: '만세 시위가 전국으로 퍼지고 있어요. 학생, 노동자, 농민, 상인 모두가 함께해요.', src: ['S51'] },
        { who: 'yugwansun', text: '저는 고향 천안으로 내려가 만세 시위를 이끌 거예요.', src: ['S51'] },
      ],
    },
    signDeclare: { always: [
      { who: 'narr', text: '1919년 3월 1일, 학생과 시민들은 탑골 공원에서 독립 선언서를 읽고 만세 시위를 벌였어요(3·1 운동).', src: ['S51'] },
    ] },
    signYu: { always: [
      { who: 'narr', text: '유관순은 천안에서 만세 시위를 이끌다가 일제에 체포되었어요.', src: ['S51'] },
    ] },
    signJeam: { always: [
      { who: 'narr', text: '일제는 만세 시위를 잔인하게 진압하고, 경기도 화성 제암리를 비롯한 여러 마을을 습격했어요.', src: ['S51'] },
    ] },
  },
  parts: {
    flags: {
      type: 'collect', title: '모인 사람들에게 태극기를 나눠 줘요', counter: '나눠 준 태극기', seconds: 80,
      fail: '화살표가 가리키는 빛나는 곳으로 가면 태극기를 나눠 줄 수 있어요.',
    },
    cheer: {
      type: 'gauge', title: '독립 선언서 낭독이 끝나면 다 함께 외쳐요', label: '대한 독립 만세!', zone: [0.6, 0.8], seconds: 4.5,
      prompt: '표시가 빛나는 칸에 들어오면 큰 버튼을 눌러요.',
      fail: '모두 함께 외쳐야 해요. 표시가 빛나는 칸에 들어올 때를 기다려요.',
      done: [{ who: 'narr', text: '만세 시위는 전국으로 퍼졌고, 나라 밖에서도 일어났어요. 여러 계층이 참여한 전 민족적인 운동이었어요.', src: ['S51'] }],
    },
    flow: {
      type: 'order', src: ['S51'],
      title: '3·1 운동의 차례대로 놓아요',
      cards: ['제1차 세계 대전이 끝났다', '민족 대표와 학생·시민이 독립을 선언했다', '만세 시위가 전국으로 퍼졌다', '일제가 만세 시위를 잔인하게 진압했다'],
      fail: '전쟁이 끝난 뒤 희망을 갖고, 독립을 선언하고, 시위가 퍼지자 일제가 진압했어요.',
    },
  },
  result: [{ who: 'narr', text: '3·1 운동은 일제의 탄압으로 좌절되었지만, 독립을 향한 한국인의 열망과 의지를 전 세계에 알렸어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '3·1 운동이 일어난 해는?', options: ['1894년', '1919년', '1945년'], answer: 1, explain: '1919년 3월 1일 3·1 운동이 일어났어요.', src: ['S51'] },
    { kind: 'quiz', question: '학생과 시민이 독립 선언서를 읽고 만세 시위를 시작한 곳은?', options: ['탑골 공원', '남한산성', '위화도'], answer: 0, explain: '학생과 시민은 탑골 공원에서 독립 선언서를 읽었어요.', src: ['S51'] },
  ],
};
