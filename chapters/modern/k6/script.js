// 근대편 6장 「을사늑약과 나라를 지키려는 노력」. 사실은 비상 5-2 교과서 114~116쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    student: { name: '학생', mark: '學', color: '#22262e', look: 'student' },
    uibyeong: { name: '의병', mark: '義', color: '#6b4a32', look: 'uibyeong' },
    ahnchangho: { name: '안창호', mark: '安', color: '#3a3a44', look: 'ahnchangho' },
  },
  intro: [
    { who: 'narr', text: '만주와 한반도를 둘러싸고 러시아와 벌인 전쟁에서 이긴 일제는 대한 제국을 노렸어요.', src: ['S51'] },
    { who: 'narr', text: '일제는 이토 히로부미를 보내 1905년 을사늑약을 맺고 대한 제국의 외교권을 빼앗았어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '을사늑약 소식에 한성이 술렁이고 있어. 나라를 지키려는 사람들을 만나 보자.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['학생에게 말을 걸어 보자', '의병을 만나자', '학교 앞의 안창호를 찾아가자', '나라를 지키려는 노력을 정리하자', '배운 내용을 확인해 보자'],
  minigameTitle: '나라를 지키려는 노력',
  npc: {
    student: {
      first: [
        { who: 'student', text: '고종 황제께서는 을사늑약이 부당하다는 것을 알리려고 헤이그 국제회의에 특사 세 명을 보내셨대요.', src: ['S51'] },
        { who: 'student', text: '하지만 일제의 방해로 회의장에 들어가지도 못했대요.', src: ['S51'] },
        { who: 'student', text: '일제는 이 일을 빌미로 고종 황제를 물러나게 하고 군대를 해산했어요.', src: ['S51'] },
      ],
      later: [{ who: 'student', text: '의병들이 곳곳에서 일어났대요.' }],
    },
    uibyeong: {
      tooEarly: [{ who: 'uibyeong', text: '먼저 저 학생의 이야기를 들어 보게.' }],
      first: [
        { who: 'uibyeong', text: '유학자, 농민, 여성, 어린이까지 여러 사람이 의병으로 나섰네.', src: ['S51'] },
        { who: 'uibyeong', text: '해산된 군인들도 함께해 의병 운동이 더 조직적이 되었지.', src: ['S51'] },
        { who: 'uibyeong', text: '연합 부대를 만들어 한성의 일본군을 치는 서울 진공 작전도 펼쳤다네(1908년).', src: ['S51'] },
      ],
      later: [{ who: 'uibyeong', text: '우리는 만주와 연해주로 가서도 계속 싸울 것이네.' }],
    },
    ahnchangho: {
      tooEarly: [{ who: 'ahnchangho', text: '의병의 이야기부터 들어 보게.' }],
      first: [
        { who: 'ahnchangho', text: '민족의 실력을 키워 나라를 지켜야 하오. 이것을 애국 계몽 운동이라 하오.', src: ['S51'] },
        { who: 'ahnchangho', text: '나와 이승훈 등은 학교를 세워 새로운 지식을 가르치고, 민족의 산업을 일으키려 하오.', src: ['S51'] },
      ],
    },
    signHague: { always: [
      { who: 'narr', text: '헤이그 특사 이준, 이상설, 이위종은 회의장 밖에서 연설을 하며 대한 제국의 상황을 알렸어요.', src: ['S51'] },
    ] },
    signPress: { always: [
      { who: 'narr', text: '황성신문, 대한매일신보 등은 일제의 침략 행위를 비판하는 기사를 실었어요.', src: ['S51'] },
    ] },
    signAhn: { always: [
      { who: 'narr', text: '안중근은 대한 제국을 침략하는 데 앞장선 이토 히로부미를 하얼빈에서 처단했어요.', src: ['S51'] },
    ] },
  },
  parts: {
    sort: {
      type: 'sort', src: ['S51'],
      title: '의병 운동일까요, 애국 계몽 운동일까요?',
      bins: [{ id: 'army', label: '의병 운동' }, { id: 'edu', label: '애국 계몽 운동' }],
      cards: [
        { text: '학교를 세워 새로운 지식을 가르쳤다', bin: 'edu' },
        { text: '연합 부대를 만들어 서울 진공 작전을 펼쳤다', bin: 'army' },
        { text: '해산된 군인들이 참여해 일본군과 싸웠다', bin: 'army' },
        { text: '신문에 일제의 침략을 비판하는 글을 실었다', bin: 'edu' },
        { text: '민족의 산업을 일으켜 나라를 부강하게 하려 했다', bin: 'edu' },
        { text: '만주와 연해주로 옮겨 가 계속 싸웠다', bin: 'army' },
      ],
      fail: '무기를 들고 싸운 것은 의병 운동, 배우고 알려서 힘을 기른 것은 애국 계몽 운동이에요.',
    },
    envoys: {
      type: 'choose', src: ['S51'],
      title: '헤이그에 간 특사 세 사람을 골라요',
      cards: [
        { text: '이준', correct: true }, { text: '김옥균', correct: false }, { text: '이상설', correct: true },
        { text: '전봉준', correct: false }, { text: '이위종', correct: true },
      ],
      fail: '학생이 말한 헤이그 특사를 떠올려 보세요. 안내판에도 적혀 있어요.',
    },
  },
  result: [
    { who: 'narr', text: '많은 사람이 나라를 지키려 애썼지만, 대한 제국은 1910년 일제에 국권을 강제로 빼앗겼어요.', src: ['S51'] },
  ],
  quizzes: [
    { kind: 'quiz', question: '1905년 일제가 대한 제국의 외교권을 빼앗은 조약은?', options: ['강화도 조약', '을사늑약', '정전 협정'], answer: 1, explain: '일제는 을사늑약으로 외교권을 빼앗았어요.', src: ['S51'] },
    { kind: 'quiz', question: '학교를 세워 새로운 지식을 가르친 운동은?', options: ['의병 운동', '애국 계몽 운동', '동학 농민 운동'], answer: 1, explain: '안창호, 이승훈 등은 학교를 세워 애국 계몽 운동을 펼쳤어요.', src: ['S51'] },
  ],
};
