// 근대편 5장 「근대 문물과 달라진 생활」. 사실은 비상 5-2 교과서 102~104쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    gentleman: { name: '양복 입은 신사', mark: '紳', color: '#3a3530', look: 'gentleman' },
    woman: { name: '전차 탄 아주머니', mark: '女', color: '#b8768a', look: 'woman' },
    student: { name: '학생', mark: '學', color: '#22262e', look: 'student' },
  },
  intro: [
    { who: 'narr', text: '개항을 한 뒤 정부는 개화 정책을 추진하여 여러 근대 시설을 마련했어요.', src: ['S51'] },
    { who: 'narr', text: '한성 거리의 모습과 사람들의 생활도 크게 달라졌어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '1900년 무렵 한성 거리야. 땡땡 소리를 내며 무언가 달려와!' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['양복 입은 신사에게 말을 걸어 보자', '전차 탄 아주머니의 이야기를 들어 보자', '학교 앞 학생을 만나자', '근대 문물을 알아보자', '배운 내용을 확인해 보자'],
  minigameTitle: '근대 문물',
  npc: {
    gentleman: {
      first: [
        { who: 'gentleman', text: '한성과 인천 사이에 전신을 놓은 뒤, 일본과 중국까지 이어지는 통신망이 생겼소.', src: ['S51'] },
        { who: 'gentleman', text: '전화기도 들여와서 소식을 빠르게 주고받을 수 있지요.', src: ['S51'] },
      ],
      later: [{ who: 'gentleman', text: '나는 양복과 구두를 즐겨 입는다오.' }],
    },
    woman: {
      tooEarly: [{ who: 'woman', text: '저기 양복 입은 신사분부터 만나 보렴.' }],
      first: [
        { who: 'woman', text: '1899년부터 서대문에서 청량리까지 전차가 다니기 시작했단다.', src: ['S51'] },
        { who: 'woman', text: '전차를 다니게 하려고 길을 넓히고 전봇대도 세웠지.', src: ['S51'] },
        { who: 'woman', text: '전등과 가로등이 생겨서 밤에도 다닐 수 있게 되었어.', src: ['S51'] },
      ],
      later: [{ who: 'woman', text: '전차는 요금이 비싼 특별석도 있단다.' }],
    },
    student: {
      tooEarly: [{ who: 'student', text: '거리 구경부터 하고 오세요.' }],
      first: [
        { who: 'student', text: '여러 학교가 세워져서 저는 근대식 교육을 받아요.', src: ['S51'] },
        { who: 'student', text: '신문이 나와서 나라 안팎의 소식도 알 수 있어요.', src: ['S51'] },
      ],
    },
    signTram: { always: [
      { who: 'narr', text: '전차는 1899년 서대문에서 청량리까지 처음 다녔어요. 가운데에는 요금이 비싼 특별석이 있었어요.', src: ['S51'] },
    ] },
    signChurch: { always: [
      { who: 'narr', text: '한성 거리에는 전깃불과 유리 창문이 있는 근대식 건물이 세워지고, 교회·성당·학교 등을 서양식으로 지었어요.', src: ['S51'] },
    ] },
    signLife: { always: [
      { who: 'narr', text: '양복, 구두 같은 서양식 옷이 들어오고 외국 음식과 식료품도 들어왔어요. 왕실과 관리를 중심으로 퍼져 나갔어요.', src: ['S51'] },
    ] },
  },
  parts: {
    match: {
      type: 'place', src: ['S51'],
      title: '근대 문물과 하는 일을 짝지어요',
      items: [{ id: 'tram', label: '전차' }, { id: 'phone', label: '전화' }, { id: 'lamp', label: '전등' }, { id: 'tele', label: '전신' }],
      slots: [
        { id: 'sLamp', label: '밤에도 거리를 밝혀요', xy: [25, 30], answer: 'lamp' },
        { id: 'sTram', label: '선로 위로 사람을 싣고 달려요', xy: [75, 30], answer: 'tram' },
        { id: 'sTele', label: '글자를 전기 신호로 바꾸어 보내요', xy: [25, 72], answer: 'tele' },
        { id: 'sPhone', label: '멀리 있는 사람과 목소리로 이야기해요', xy: [75, 72], answer: 'phone' },
      ],
      fail: '전신은 글자나 숫자를 전기 신호로 바꾸어 보내는 통신이에요.',
    },
    tram: {
      type: 'gauge', title: '전차를 정류장에 맞춰 세워요', label: '멈춰!', zone: [0.62, 0.78], seconds: 4,
      prompt: '움직이는 전차(붉은 표시)가 정류장(빛나는 칸)에 들어왔을 때 눌러요.',
      fail: '표시가 빛나는 칸 안에 들어온 다음에 눌러요.',
    },
    then: {
      type: 'sort', src: ['S51'],
      title: '개항 뒤 새로 들어온 것일까요, 그 전부터 있던 것일까요?',
      bins: [{ id: 'new', label: '새로 들어온 근대 문물' }, { id: 'old', label: '그 전부터 있던 것' }],
      cards: [
        { text: '전차', bin: 'new' }, { text: '갓', bin: 'old' }, { text: '전화기', bin: 'new' },
        { text: '초가집', bin: 'old' }, { text: '앙부일구', bin: 'old' }, { text: '양복과 구두', bin: 'new' },
      ],
      fail: '전기를 쓰거나 서양에서 들어온 것은 근대 문물이에요.',
    },
  },
  result: [{ who: 'narr', text: '근대 문물이 들어오면서 사람들의 생활 모습이 크게 달라졌어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '1899년 서대문에서 청량리까지 다닌 것은?', options: ['기차', '전차', '자동차'], answer: 1, explain: '1899년 서대문에서 청량리까지 전차가 다니기 시작했어요.', src: ['S51'] },
    { kind: 'quiz', question: '전신은 무엇일까요?', options: ['글자나 숫자를 전기 신호로 바꾸어 보내는 통신', '밤을 밝히는 등', '선로 위를 달리는 차'], answer: 0, explain: '전신은 문자나 숫자를 전기 신호로 바꾸어 보내는 통신이에요.', src: ['S51'] },
  ],
};
