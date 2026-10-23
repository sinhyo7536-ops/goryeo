// 현대편 6장 「민주주의와 경제 성장」. 교과서 밖 내용이라 4·19(S58), 5·18·6월 항쟁(S59), 경부고속도로(S60), 서울 올림픽(S61)을 따른다.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    student: { name: '대학생', mark: '學', color: '#22262e', look: 'student' },
    builder: { name: '고속도로 일꾼', mark: '工', color: '#8a7a5a', look: 'builder' },
    citizen: { name: '시민', mark: '民', color: '#5d7a9a', look: 'citizen' },
  },
  intro: [
    { who: 'narr', text: '정전 협정 뒤 대한민국은 전쟁의 상처를 딛고 다시 일어섰어요.', src: ['S58'] },
    { who: 'narr', text: '사람들은 나라의 주인으로서 민주주의를 지키려고 애썼고, 열심히 일해 경제를 키웠어요.', src: ['S59', 'S60'] },
  ],
  start: [
    { who: 'guide', text: '여기는 서울 거리야. 수십 년 동안 이 거리에서 많은 일이 있었어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['대학생에게 말을 걸어 보자', '고속도로 일꾼을 만나자', '시민의 이야기를 들어 보자', '민주주의와 경제 성장을 정리해 보자', '배운 내용을 확인해 보자'],
  minigameTitle: '민주주의와 경제 성장',
  npc: {
    student: {
      first: [
        { who: 'student', text: '1960년 3월 15일 선거에서 정부가 표를 속이는 부정 선거를 저질렀어요.', src: ['S58'] },
        { who: 'student', text: '학생과 시민이 거리로 나와 맞섰고, 4월 19일 시위가 크게 번졌어요. 결국 이승만 대통령이 물러났지요. 이것이 4·19 혁명이에요.', src: ['S58'] },
      ],
      later: [{ who: 'student', text: '나라의 주인은 국민이에요.' }],
    },
    builder: {
      tooEarly: [{ who: 'builder', text: '저기 대학생 이야기부터 들어 보게.' }],
      first: [
        { who: 'builder', text: '1968년에 공사를 시작해서 1970년 7월에 서울과 부산을 잇는 경부고속도로가 뚫렸다네.', src: ['S60'] },
        { who: 'builder', text: '이제 전국이 하루 만에 오갈 수 있는 거리가 되었지. 공장과 도시도 빠르게 늘어났다네.', src: ['S60'] },
      ],
      later: [{ who: 'builder', text: '길이 열리면 나라가 커진다네.' }],
    },
    citizen: {
      tooEarly: [{ who: 'citizen', text: '고속도로 일꾼 이야기를 먼저 들어 봐요.' }],
      first: [
        { who: 'citizen', text: '1980년 5월 광주에서 시민들이 민주주의를 요구했어요. 이것이 5·18 민주화 운동이에요.', src: ['S59'] },
        { who: 'citizen', text: '1987년 6월에는 학생과 시민이 전국에서 민주화를 요구했어요(6월 민주 항쟁). 그 결과 국민이 대통령을 직접 뽑는 직선제로 바뀌었어요.', src: ['S59'] },
      ],
    },
    signOlympic: { always: [
      { who: 'narr', text: '1988년 서울에서 제24회 올림픽이 열렸어요. 160개 나라가 참가해 대한민국을 세계에 알렸어요.', src: ['S61'] },
    ] },
    signRoad: { always: [
      { who: 'narr', text: '경부고속도로는 서울과 부산을 잇는 고속도로로 1970년 7월에 개통되었어요.', src: ['S60'] },
    ] },
  },
  parts: {
    flow: {
      type: 'order', src: ['S58', 'S59', 'S60', 'S61'],
      title: '일어난 차례대로 놓아요',
      cards: ['4·19 혁명 (1960년)', '경부고속도로 개통 (1970년)', '5·18 민주화 운동 (1980년)', '6월 민주 항쟁 (1987년)', '서울 올림픽 (1988년)'],
      fail: '카드에 적힌 해를 보고 빠른 해부터 놓아 보세요.',
    },
    split: {
      type: 'sort', src: ['S58', 'S59', 'S60', 'S61'],
      title: '민주주의일까요, 경제 성장일까요?',
      bins: [{ id: 'demo', label: '민주주의를 지킨 일' }, { id: 'econ', label: '경제가 성장한 일' }],
      cards: [
        { text: '4·19 혁명', bin: 'demo' },
        { text: '경부고속도로 개통', bin: 'econ' },
        { text: '6월 민주 항쟁', bin: 'demo' },
        { text: '공장과 도시가 늘어남', bin: 'econ' },
      ],
      fail: '국민이 주인이 되려고 한 일은 민주주의, 길과 공장이 생긴 일은 경제 성장이에요.',
    },
  },
  result: [{ who: 'narr', text: '국민들의 노력으로 대한민국은 민주주의와 경제 성장을 함께 이루어 냈어요.', src: ['S59', 'S61'] }],
  quizzes: [
    { kind: 'quiz', question: '1960년 부정 선거에 맞서 학생과 시민이 일어난 일은?', options: ['3·1 운동', '4·19 혁명', '동학 농민 운동'], answer: 1, explain: '3·15 부정 선거에 맞서 일어난 4·19 혁명으로 이승만 대통령이 물러났어요.', src: ['S58'] },
    { kind: 'quiz', question: '6월 민주 항쟁(1987년)의 결과로 바뀐 것은?', options: ['대통령 직선제', '신분제 폐지', '단발령'], answer: 0, explain: '국민이 대통령을 직접 뽑는 직선제로 바뀌었어요.', src: ['S59'] },
  ],
};
