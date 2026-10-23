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
      type: 'drive', src: ['S51'], title: '피란길: 아이들을 데리고 남쪽으로 가요', counter: '지난 곳', pickupCounter: '찾은 아이', seconds: 150,
      howto: '눈 내리는 피란길을 따라 남쪽으로 가요. 길에서 헤어진 아이들을 모두 찾아 데려가고, 군용 트럭을 피해요.',
      intro: [
        { who: 'mother', text: '중국군이 내려온대요. 서울을 떠나야 해요!' },
        { who: 'mother', text: '사람들 틈에서 아이들 손을 놓쳤어요. 제발 같이 찾아 주세요!' },
      ],
      route: [
        { label: '마을 어귀', talk: [{ who: 'soldier', text: '서둘러요! 남쪽으로 가는 길은 이쪽입니다.' }] },
        { label: '얼어붙은 강', hold: 4, holdLabel: '얼음 길을 건너는 중', holdSay: '얼음이 깨지지 않게 천천히 건너요. 빛나는 곳에서 잠깐 기다려요.',
          talk: [{ who: 'mother', text: '휴, 무사히 강을 건넜어요. 아이들은 어디 있을까요?' }] },
        { label: '고갯길', say: '수많은 사람이 짐을 지고 남쪽으로 걸어가요.' },
        { label: '피란민 쉼터', needPickups: true, needSay: '아직 찾지 못한 아이가 있어요! 화살표를 따라가 봐요.',
          talk: [{ who: 'mother', text: '아이들을 모두 찾았어요. 정말 고마워요!' }, { who: 'unSoldier', text: '이 추운 겨울에 많은 사람이 고향을 떠나 피란을 왔어.' }] },
      ],
      pickups: [{ label: '아이', follow: 'kid', small: true, say: '울고 있던 아이를 찾았어요!' }, { label: '아이', follow: 'schoolgirl', small: true, say: '아이를 찾았어요!' }, { label: '아이', follow: 'kid', small: true, say: '마지막 아이까지 찾았어요!' }],
      bump: '트럭이 지나가요! 앞 지점에서 다시 가요.',
      fail: '화살표를 따라 아이들을 찾고, 트럭이 지나간 뒤에 길을 건너요.',
      done: [{ who: 'narr', text: '1951년 1월 4일, 국군과 유엔군은 서울을 다시 빼앗기고 남쪽으로 물러났어요(1·4 후퇴).', src: ['S51'] }],
    },
    flow: {
      type: 'stops', src: ['S51'], title: '땅 위 지도에서 전쟁의 흐름대로 찾아가요', counter: '찾아간 곳',
      howto: '바닥에 그린 지도 위의 이름표를 일어난 차례대로 찾아가 대화 버튼을 눌러요.',
      intro: [{ who: 'unSoldier', text: '전쟁이 어떻게 흘러갔는지 지도 위에서 차례대로 짚어 보자.' }],
      spots: [
        { label: '북쪽 국경까지 나아감', look: 'rokSoldier', talk: [{ who: 'soldier', text: '우리는 북쪽 국경 가까이까지 나아갔어.' }] },
        { label: '중국군이 내려옴', look: 'unSoldier', talk: [{ who: 'unSoldier', text: '그런데 중국군이 북한을 도우려고 군대를 보냈지.' }] },
        { label: '1·4 후퇴', look: 'woman', talk: [{ who: 'mother', text: '1951년 1월 4일, 서울을 다시 빼앗기고 피란길에 올랐어요.' }] },
        { label: '서울을 다시 되찾음', look: 'rokSoldier', talk: [{ who: 'soldier', text: '우리는 다시 서울을 되찾았어!' }] },
        { label: '판문점 정전 협정', look: 'unSoldier', talk: [{ who: 'unSoldier', text: '1953년 7월, 판문점에서 정전 협정을 맺었어.' }] },
      ],
      fail: '북쪽까지 갔다가 중국군 때문에 물러났고, 다시 서울을 되찾은 뒤 정전 협정을 맺었어요.',
    },
    truce: {
      type: 'find', src: ['S51'], title: '판문점에서 정전 협정을 맺은 뒤의 모습을 찾아요', counter: '찾은 것',
      howto: '팻말 가운데 정전 협정 뒤의 모습을 찾아 대화 버튼을 눌러요. 틀린 것을 고르면 다시 해요.',
      intro: [{ who: 'unSoldier', text: '여기가 판문점이야. 2년 넘게 이어진 회담 끝에 여기서 정전 협정을 맺었지.' }],
      items: [
        { text: '남북을 가르는 휴전선이 그어졌다', correct: true, talk: [{ who: 'soldier', text: '휴전선을 사이에 두고 남과 북이 나뉘었어.' }] },
        { text: '남북이 하나로 통일되었다', correct: false },
        { text: '전쟁이 완전히 끝나 평화 조약을 맺었다', correct: false },
        { text: '전투를 멈추었지만 전쟁이 끝난 것은 아니다', correct: true, talk: [{ who: 'unSoldier', text: '정전은 싸움을 잠시 멈춘 거야. 전쟁이 완전히 끝난 건 아니지.' }] },
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
