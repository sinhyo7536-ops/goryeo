// 일제 강점기편 1장 「일제의 식민 통치」. 사실은 비상 5-2 교과서 117~119쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    farmer: { name: '농민', mark: '農', color: '#7a4e32', look: 'peasant' },
    teacher: { name: '학교 선생님', mark: '師', color: '#4a4f5a', look: 'scholarModern' },
    porter: { name: '항구의 짐꾼', mark: '人', color: '#6b4a32', look: 'commoner' },
  },
  intro: [
    { who: 'narr', text: '대한 제국은 1910년 일제에 국권을 강제로 빼앗겼어요.', src: ['S51'] },
    { who: 'narr', text: '일제는 우리 민족을 식민 통치하려고 조선 총독부라는 기구를 세웠어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '나라를 빼앗긴 뒤 사람들의 삶은 어떻게 달라졌을까? 항구 마을을 둘러보자.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['농민에게 말을 걸어 보자', '학교 선생님을 만나자', '항구의 짐꾼에게 가 보자', '식민 통치를 정리해 보자', '배운 내용을 확인해 보자'],
  minigameTitle: '일제의 식민 통치',
  npc: {
    farmer: {
      first: [
        { who: 'farmer', text: '일제가 토지 조사 사업을 벌여서 많은 땅을 빼앗겼어요.', src: ['S51'] },
        { who: 'farmer', text: '살 길이 막막해진 사람들은 고향을 떠나 만주나 연해주로 옮겨 가기도 했지요.', src: ['S51'] },
      ],
      later: [{ who: 'farmer', text: '농사를 지어도 남는 것이 없어요.' }],
    },
    teacher: {
      tooEarly: [{ who: 'teacher', text: '마을 농민의 이야기부터 들어 보렴.' }],
      first: [
        { who: 'teacher', text: '1910년대에는 헌병이 경찰 일을 맡아 한국인에게 태형을 내리기도 했단다.', src: ['S51'] },
        { who: 'teacher', text: '선생님들도 제복을 입고 칼을 차게 해서 무서운 분위기를 만들었지.', src: ['S51'] },
        { who: 'teacher', text: '1920년대에는 경찰을 늘리고, 일제에 협력하는 친일파를 키웠단다.', src: ['S51'] },
      ],
      later: [{ who: 'teacher', text: '우리말과 우리 역사를 잊으면 안 된다.' }],
    },
    porter: {
      tooEarly: [{ who: 'porter', text: '학교 선생님을 먼저 만나 보게.' }],
      first: [
        { who: 'porter', text: '일제가 쌀 생산을 늘리는 산미 증식 계획을 세웠지만, 늘어난 것보다 더 많은 쌀이 일본으로 빠져나가.', src: ['S51'] },
        { who: 'porter', text: '그래서 한국인의 생활은 더욱 어려워졌다네.', src: ['S51'] },
      ],
    },
    signGov: { always: [
      { who: 'narr', text: '식민 통치는 주권을 잃고 정치적·경제적으로 다른 나라에 속해 지배를 받는 것이에요.', src: ['S51'] },
    ] },
    signRail: { always: [
      { who: 'narr', text: '일제는 철도를 놓아 주요 도시와 항구를 이었어요. 한반도에서 나는 물자를 일본으로 가져가고 일본 상품을 팔기 쉬워졌어요.', src: ['S51'] },
    ] },
    signForce: { always: [
      { who: 'narr', text: '1930년대 후반 전쟁을 넓힌 일제는 한국인을 탄광, 공장, 전쟁터로 강제로 끌고 갔어요.', src: ['S51'] },
      { who: 'narr', text: '젊은 여성 가운데 일부는 일본군 \'위안부\'로 끌려가 큰 고통을 겪었어요.', src: ['S51'] },
    ] },
  },
  parts: {
    eras: {
      type: 'sort', src: ['S51'],
      title: '언제 일어난 일일까요?',
      bins: [{ id: 'a', label: '1910년대' }, { id: 'b', label: '1920년대' }, { id: 'c', label: '1930년대 후반' }],
      cards: [
        { text: '헌병이 경찰 일을 맡고 태형을 내렸다', bin: 'a' },
        { text: '경찰을 늘리고 친일파를 키웠다', bin: 'b' },
        { text: '일본식으로 성과 이름을 바꾸게 했다', bin: 'c' },
        { text: '교사도 제복을 입고 칼을 찼다', bin: 'a' },
        { text: '산미 증식 계획으로 쌀을 일본으로 가져갔다', bin: 'b' },
        { text: '우리말과 우리 역사 교육을 금지했다', bin: 'c' },
      ],
      fail: '헌병과 칼은 1910년대, 경찰을 늘리고 쌀을 가져간 것은 1920년대, 이름과 우리말을 빼앗은 것은 1930년대 후반이에요.',
    },
    rail: {
      type: 'choose', src: ['S51'],
      title: '일제가 철도를 놓은 까닭을 모두 골라요',
      cards: [
        { text: '한반도의 물자를 일본으로 가져가려고', correct: true },
        { text: '한국 사람들이 편하게 여행하라고', correct: false },
        { text: '일본 상품을 한국에 팔기 쉽게 하려고', correct: true },
        { text: '우리나라 농민을 도우려고', correct: false },
      ],
      fail: '안내판을 다시 읽어 보세요. 철도는 일제의 수탈에 쓰였어요.',
      done: [{ who: 'narr', text: '1930년대 후반, 일제는 우리 민족의 전통과 문화를 뿌리 뽑으려 했어요. 신사 참배를 강요하고 학교에서는 일본어로 수업했어요.', src: ['S51'] }],
    },
  },
  result: [{ who: 'narr', text: '일제의 억압과 수탈 속에서도 우리 민족은 나라를 되찾으려는 노력을 멈추지 않았어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '일제가 우리 민족을 다스리려고 세운 기구는?', options: ['조선 총독부', '대한민국 임시 정부', '독립 협회'], answer: 0, explain: '일제는 조선 총독부를 세워 식민 통치를 했어요.', src: ['S51'] },
    { kind: 'quiz', question: '1920년대 일제가 쌀을 더 많이 가져가려고 세운 계획은?', options: ['토지 조사 사업', '산미 증식 계획', '서울 진공 작전'], answer: 1, explain: '산미 증식 계획으로 늘어난 것보다 더 많은 쌀이 일본으로 빠져나갔어요.', src: ['S51'] },
  ],
};
