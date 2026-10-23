// 현대편 4장 「1·4 후퇴와 정전 협정」. 사실은 비상 5-2 교과서 142쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    soldier: { name: '국군 병사', mark: '軍', color: '#5a6448', look: 'rokSoldier' },
    mother: { name: '피란민 어머니', mark: '母', color: '#b8768a', look: 'woman' },
    unSoldier: { name: '유엔군 병사', mark: 'UN', color: '#5b92e5', look: 'unSoldier' },
  },
  intro: [
    { who: 'narr', text: '국군과 유엔군이 북쪽 국경으로 나아가자, 중국군이 북한을 도우려고 군대를 보냈어요.', src: ['S51'] },
    { who: 'narr', text: '중국군의 공격을 막아 내지 못한 국군과 유엔군은 남쪽으로 물러났고, 1951년 1월 4일 서울을 다시 빼앗겼어요(1·4 후퇴).', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '눈 내리는 겨울, 피란길이야. 많은 사람이 짐을 지고 남쪽으로 가고 있어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['국군 병사에게 말을 걸어 보자', '피란민 어머니를 돕자', '유엔군 병사의 이야기를 들어 보자', '전쟁이 멈추기까지를 따라가자', '배운 내용을 확인해 보자'],
  minigameTitle: '1·4 후퇴와 정전 협정',
  npc: {
    soldier: {
      first: [
        { who: 'soldier', text: '압록강 가까이까지 갔는데, 중국군이 내려와서 다시 물러나야 했어.', src: ['S51'] },
        { who: 'soldier', text: '피란민들을 안전하게 도와줘!' },
      ],
      later: [{ who: 'soldier', text: '힘을 내자.' }],
    },
    mother: {
      tooEarly: [{ who: 'mother', text: '병사님 말씀부터 들어 보렴.' }],
      first: [
        { who: 'mother', text: '추운 겨울에 아이들을 데리고 집을 떠나왔단다.', src: ['S51'] },
        { who: 'mother', text: '짐이 무거워서 걷기가 힘들구나. 다른 가족들도 좀 도와주렴.' },
      ],
      later: [{ who: 'mother', text: '고맙다, 정말 고마워.' }],
    },
    unSoldier: {
      tooEarly: [{ who: 'unSoldier', text: '피란민을 먼저 도와줘.' }],
      first: [
        { who: 'unSoldier', text: '우리는 다시 서울을 되찾았지만, 38도선 근처에서 싸움이 오래 이어지고 있어.', src: ['S51'] },
        { who: 'unSoldier', text: '한편에서는 전쟁을 멈추려고 회담을 하고 있어.', src: ['S51'] },
      ],
    },
    signPanmun: { always: [
      { who: 'narr', text: '1953년 7월 판문점에서 정전 협정이 맺어지면서 휴전선이 그어졌어요.', src: ['S51'] },
    ] },
    signTruce: { always: [
      { who: 'narr', text: '정전은 전쟁 중인 나라들이 전투를 잠시 멈추는 일이에요. 전쟁이 완전히 끝난 것은 아니에요.', src: ['S51'] },
    ] },
  },
  parts: {
    help: {
      type: 'collect', title: '피란민 가족의 짐을 들어 줘요', counter: '도운 가족', seconds: 80,
      fail: '빛나는 곳의 가족을 찾아가요. 화살표가 길을 알려 줘요.',
    },
    flow: {
      type: 'order', src: ['S51'],
      title: '전쟁의 흐름대로 놓아요',
      cards: ['국군과 유엔군이 북쪽 국경까지 나아감', '중국군이 북한을 도우려고 내려옴', '서울을 다시 빼앗김 (1·4 후퇴)', '서울을 다시 되찾음', '정전 협정 (1953년 7월)'],
      fail: '북쪽까지 갔다가 중국군 때문에 물러났고, 다시 서울을 되찾은 뒤 정전 협정을 맺었어요.',
    },
    truce: {
      type: 'choose', src: ['S51'],
      title: '정전 협정을 맺은 뒤의 모습을 골라요',
      cards: [
        { text: '남북을 가르는 휴전선이 그어졌다', correct: true },
        { text: '남북이 하나로 통일되었다', correct: false },
        { text: '전쟁이 완전히 끝나 평화 조약을 맺었다', correct: false },
      ],
      fail: '정전은 전투를 잠시 멈춘 것이에요. 안내판을 다시 읽어 보세요.',
    },
  },
  result: [{ who: 'narr', text: '정전 협정으로 전투는 멈추었지만, 남과 북은 휴전선을 사이에 두고 나뉘게 되었어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '1951년 1월 4일 서울을 다시 빼앗긴 일은?', options: ['1·4 후퇴', '인천 상륙 작전', '을미사변'], answer: 0, explain: '중국군의 공격에 밀려 1951년 1월 4일 서울을 다시 빼앗겼어요.', src: ['S51'] },
    { kind: 'quiz', question: '1953년 7월 맺어져 휴전선이 그어진 협정은?', options: ['강화도 조약', '을사늑약', '정전 협정'], answer: 2, explain: '정전 협정으로 휴전선이 그어졌어요.', src: ['S51'] },
  ],
};
