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
    highway: {
      type: 'drive', src: ['S60'], title: '경부고속도로를 달려 부산에서 서울까지 물건을 날라요', vehicle: 'car', counter: '지난 도시', pickupCounter: '실은 짐', seconds: 150,
      howto: '바닥 지도 위의 고속도로를 따라 차를 몰아요. 길가 공장의 짐을 모두 싣고 서울까지 가요. 느린 짐차는 피해요.',
      intro: [
        { who: 'builder', text: '1970년 7월, 서울과 부산을 잇는 경부고속도로가 뚫렸다네!' },
        { who: 'builder', text: '공장에서 만든 물건을 싣고 서울까지 달려 보게. 하루면 충분할 걸세.' },
      ],
      route: [
        { label: '부산', talk: [{ who: 'builder', text: '부산 항구에서 출발! 길가 공장에서 짐을 꼭 실어 가게.' }] },
        { label: '대구', say: '고속도로 덕분에 먼 곳도 빨리 갈 수 있게 되었어요.' },
        { label: '대전', say: '공장에서 만든 물건을 실은 차들이 바쁘게 오가요.' },
        { label: '서울', needPickups: true, needSay: '아직 싣지 못한 짐이 있어요! 화살표를 따라가 봐요.',
          talk: [{ who: 'builder', text: '서울 도착! 전국이 하루 만에 오갈 수 있게 되었다네.' }, { who: 'citizen', text: '길과 공장이 늘면서 경제가 빠르게 성장했어요.' }] },
      ],
      pickups: [{ label: '공장 짐' }, { label: '공장 짐' }, { label: '공장 짐' }],
      bump: '짐차와 부딪혔어요! 앞 도시에서 다시 가요.',
      fail: '시간 안에 서울에 닿지 못했어요. 짐을 싣고 느린 짐차를 피해 다시 달려 봐요.',
    },
    flow: {
      type: 'stops', src: ['S58', 'S59', 'S60', 'S61'], title: '시간의 거리에서 일어난 차례대로 찾아가요', counter: '찾아간 곳',
      howto: '거리의 이름표를 일어난 차례대로 찾아가 대화 버튼을 눌러요. 해가 적혀 있어요.',
      intro: [{ who: 'citizen', text: '이 거리에서 많은 일이 있었어요. 일어난 차례대로 걸어 보세요.' }],
      spots: [
        { label: '4·19 혁명 (1960년)', look: 'student', talk: [{ who: 'student', text: '부정 선거에 맞서 학생과 시민이 일어났어요. 나라의 주인은 국민이니까요!' }] },
        { label: '경부고속도로 개통 (1970년)', look: 'builder', talk: [{ who: 'builder', text: '서울과 부산이 고속도로로 이어졌다네.' }] },
        { label: '5·18 민주화 운동 (1980년)', look: 'citizen', talk: [{ who: 'citizen', text: '광주 시민들이 민주주의를 요구했어요.' }] },
        { label: '6월 민주 항쟁 (1987년)', look: 'student', talk: [{ who: 'citizen', text: '전국에서 민주화를 외쳐, 대통령을 국민이 직접 뽑게 되었어요.' }] },
        { label: '서울 올림픽 (1988년)', look: 'schoolgirl', talk: [{ who: 'student', text: '160개 나라가 서울에 모였어요!' }] },
      ],
      fail: '이름표에 적힌 해를 보고 빠른 해부터 찾아가 보세요.',
    },
    split: {
      type: 'deliver', src: ['S58', 'S59', 'S60', 'S61'], title: '민주주의 광장일까요, 공장 거리일까요?', counter: '가져다 놓은 것',
      howto: '머리 위의 글을 「민주주의를 지킨 일」 광장이나 「경제가 성장한 일」 공장으로 가져가 대화 버튼을 눌러요.',
      intro: [{ who: 'student', text: '우리가 이룬 일들을 정리해 봐요. 민주주의를 지킨 일과 경제가 성장한 일로 나눠요.' }],
      bins: [{ id: 'demo', label: '민주주의를 지킨 일' }, { id: 'econ', label: '경제가 성장한 일' }],
      cards: [
        { text: '4·19 혁명', bin: 'demo' },
        { text: '경부고속도로 개통', bin: 'econ' },
        { text: '6월 민주 항쟁', bin: 'demo' },
        { text: '공장과 도시가 늘어남', bin: 'econ' },
        { text: '5·18 민주화 운동', bin: 'demo', talk: [{ who: 'citizen', text: '국민의 노력으로 민주주의와 경제 성장을 함께 이루었어요.' }] },
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
