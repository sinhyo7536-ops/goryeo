// 근대편 1장 「흥선 대원군과 강화도 조약」. 사실은 비상 5-2 교과서 98~99쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    elder: { name: '마을 어르신', mark: '老', color: '#6b4a32', look: 'commoner' },
    scholar: { name: '젊은 선비', mark: '士', color: '#3a4a5a', look: 'scholar' },
    official: { name: '조선 관리', mark: '官', color: '#55608a', look: 'joseonOfficial' },
  },
  intro: [
    { who: 'narr', text: '19세기 후반, 어린 나이로 왕이 된 고종을 대신해 아버지 흥선 대원군이 나라를 다스렸어요.', src: ['S51'] },
    { who: 'narr', text: '흥선 대원군은 서양 나라들이 교류하자고 하는 것을 거절했어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '여기는 강화도 바닷가 마을이야. 바다 건너 낯선 배가 보이네.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['마을 어르신에게 말을 걸어 보자', '젊은 선비의 이야기를 들어 보자', '관아 앞의 조선 관리를 찾아가자', '강화도 조약을 살펴보자', '배운 내용을 확인해 보자'],
  minigameTitle: '강화도 조약',
  npc: {
    elder: {
      first: [
        { who: 'elder', text: '흥선 대원군께서는 경복궁을 고쳐 지으셨지.', src: ['S51'] },
        { who: 'elder', text: '양반에게도 세금을 내게 하셨다네.', src: ['S51'] },
        { who: 'elder', text: '서양 나라들이 교류하자고 했지만 모두 거절하셨어.', src: ['S51'] },
      ],
      later: [{ who: 'elder', text: '바다 건너 배들이 자꾸 찾아온다네.' }],
    },
    scholar: {
      tooEarly: [{ who: 'scholar', text: '마을 어르신의 이야기부터 들어 보시오.' }],
      first: [
        { who: 'scholar', text: '흥선 대원군이 물러난 뒤, 나라 안에서 문을 열고 다른 나라와 교류하자는 목소리가 커졌소.', src: ['S51'] },
        { who: 'scholar', text: '다른 나라와 교류할 수 있게 항구를 여는 것을 개항이라고 하오.', src: ['S51'] },
      ],
      later: [{ who: 'scholar', text: '관아 앞에 가 보시오.' }],
    },
    official: {
      tooEarly: [{ who: 'official', text: '먼저 마을 사람들의 이야기를 들어 보아라.' }],
      first: [
        { who: 'official', text: '일본이 무력을 앞세워 개항을 요구하였다.', src: ['S51'] },
        { who: 'official', text: '결국 1876년, 조선은 일본과 강화도 조약을 맺었다.', src: ['S51'] },
        { who: 'official', text: '조약에 어떤 내용이 들어 있는지 살펴보아라.' },
      ],
    },
    signTreaty: { always: [
      { who: 'narr', text: '강화도 조약은 조선이 맺은 최초의 근대적 조약이에요.', src: ['S51'] },
      { who: 'narr', text: '하지만 조선에 불리한 내용이 담겨 있었어요.', src: ['S51'] },
    ] },
    signWest: { always: [
      { who: 'narr', text: '조선은 그 뒤 서양 여러 나라와도 조약을 맺고 교류했어요.', src: ['S51'] },
    ] },
  },
  parts: {
    regent: {
      type: 'deliver', src: ['S51'], title: '흥선 대원군이 한 일일까요? 알맞은 쪽으로 가져가요', counter: '가져다 놓은 것',
      howto: '머리 위의 글을 「흥선 대원군이 한 일」이나 「다른 때의 일」로 가져가 대화 버튼을 눌러요.',
      bins: [{ id: 'yes', label: '흥선 대원군이 한 일' }, { id: 'no', label: '다른 때의 일' }],
      cards: [
        { text: '경복궁을 고쳐 지었다', bin: 'yes' },
        { text: '강화도 조약을 맺었다', bin: 'no' },
        { text: '양반에게도 세금을 내게 했다', bin: 'yes' },
        { text: '대한 제국을 세웠다', bin: 'no' },
        { text: '서양 나라의 교류 요구를 거절했다', bin: 'yes' },
      ],
      fail: '마을 어르신이 한 이야기를 떠올려 보세요. 궁궐, 세금, 서양 나라에 대한 이야기였어요.',
    },
    treaty: {
      type: 'find', src: ['S51'], title: '조약을 맺는 곳에서 조선에 불리한 내용을 찾아요', counter: '찾은 내용',
      howto: '팻말 가운데 강화도 조약에서 조선에 불리한 내용을 찾아 대화 버튼을 눌러요. 틀린 것을 고르면 다시 해요.',
      items: [
        { text: '죄를 지은 일본인은 일본 관리가 재판한다', correct: true },
        { text: '두 나라가 서로의 해안을 똑같이 측량한다', correct: false },
        { text: '일본인이 조선의 해안을 자유롭게 측량한다', correct: true },
        { text: '죄를 지은 일본인은 조선 관리가 재판한다', correct: false },
      ],
      fail: '조선은 할 수 없고 일본만 할 수 있는 내용, 일본인을 조선이 벌줄 수 없는 내용을 찾아요.',
      done: [{ who: 'narr', text: '강화도 조약에는 일본인이 조선 해안을 측량하고, 죄를 지어도 일본 관리가 재판하는 불리한 내용이 있었어요.', src: ['S51'] }],
    },
  },
  result: [{ who: 'narr', text: '조선은 이렇게 문을 열고 새로운 시대를 맞이했어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '1876년 조선이 일본과 맺은 조약은?', options: ['을사늑약', '강화도 조약', '정전 협정'], answer: 1, explain: '강화도 조약은 조선이 맺은 최초의 근대적 조약이에요.', src: ['S51'] },
    { kind: 'quiz', question: '흥선 대원군은 서양 나라들의 교류 요구에 어떻게 했나요?', options: ['거절했다', '모두 받아들였다', '조약을 맺었다'], answer: 0, explain: '흥선 대원군은 서양 나라의 교류 요구를 거절했어요.', src: ['S51'] },
  ],
};
