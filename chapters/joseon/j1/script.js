// 조선편 1장 대사와 퀴즈. 문장과 출처 번호는 조선편 설계 문서 4장 1장 절을 따른다.
// 해설(narr)은 출처가 꼭 있어야 하고, 사실이 아닌 진행 안내는 '안내(guide)'가 말한다.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    archer: { name: '궁수', mark: '弓', color: '#5d6b3e', look: 'archer' },
    soldier: { name: '고려 병사', mark: '兵', color: '#7a3b2e', look: 'soldier' },
    yiseonggye: { name: '이성계', mark: '李', color: '#7a2a1e', look: 'yiseonggye' },
  },

  intro: [
    { who: 'narr', text: '1388년, 고려는 명나라의 요동을 치려고 5만여 명의 군사를 보냈어요.', src: ['S23'] },
    { who: 'narr', text: '장수 이성계는 이 싸움에 반대했지만, 우왕과 최영의 뜻대로 군대가 떠났어요.', src: ['S23'] },
  ],

  start: [
    { who: 'guide', text: '너는 요동으로 가는 고려군의 젊은 병사야. 압록강의 섬 위화도에 진을 쳤어.' },
    { who: 'guide', text: '비가 계속 내려. 군사들은 무슨 걱정을 하고 있을까? 느낌표가 있는 사람에게 말을 걸어 봐.' },
  ],

  goals: ['천막 옆의 궁수에게 말을 걸어 보자', '강가의 병사에게 말을 걸어 보자', '지휘 천막 앞의 이성계를 찾아가자', '이성계가 반대한 까닭을 골라 보자', '새 도읍 한양을 꾸며 보자', '배운 내용을 확인해 보자'],

  npc: {
    archer: {
      first: [
        { who: 'archer', text: '비가 그치지 않아. 활을 붙인 아교가 풀어질 지경이야.', src: ['S23'] },
        { who: 'archer', text: '덥고 비가 많으니 군사들 사이에 병이 돌까 걱정이야.', src: ['S23'] },
        { who: 'archer', text: '강가에 있는 병사에게도 가 봐.' },
      ],
      later: [{ who: 'archer', text: '활시위가 자꾸 늘어져. 비가 그쳐야 할 텐데.' }],
    },
    soldier: {
      tooEarly: [{ who: 'soldier', text: '천막 옆의 궁수가 너를 찾던데?' }],
      first: [
        { who: 'soldier', text: '우리가 북쪽으로 간 사이 남쪽 바닷가에 왜구가 쳐들어오면 어쩌지?', src: ['S23'] },
        { who: 'soldier', text: '이성계 장군께서 지휘 천막 앞에 계셔. 가 봐.' },
      ],
      later: [{ who: 'soldier', text: '지휘 천막은 진영 가운데에 있어.' }],
    },
    yiseonggye: {
      tooEarly: [{ who: 'yiseonggye', text: '먼저 군사들의 이야기를 들어 보아라.' }],
      first: [
        { who: 'yiseonggye', text: '작은 나라가 큰 나라를 거스르는 것은 옳지 않다.', src: ['S23'] },
        { who: 'yiseonggye', text: '여름에 군사를 일으키는 것도 옳지 않다.', src: ['S23'] },
        { who: 'yiseonggye', text: '내가 왜 이 싸움에 반대하는지, 네가 들은 이야기로 정리해 보아라.' },
      ],
    },
  },

  reasons: {
    src: ['S23'],
    title: '이성계가 요동 정벌에 반대한 까닭 네 가지를 골라요',
    cards: [
      { text: '작은 나라가 큰 나라를 거스르면 안 된다', correct: true },
      { text: '요동은 너무 멀어서 가는 길을 모른다', correct: false },
      { text: '여름에 군사를 일으키면 안 된다', correct: true },
      { text: '그 틈에 왜구가 쳐들어올 수 있다', correct: true },
      { text: '명나라 군사가 고려보다 적다', correct: false },
      { text: '덥고 비가 많아 활이 풀어지고 병이 돈다', correct: true },
    ],
    fail: '이성계와 군사들이 한 말을 떠올려 보세요. 나라의 크기, 계절, 왜구, 날씨에 대한 말이었어요.',
    done: [{ who: 'narr', text: '이성계가 든 네 가지 까닭을 4불가론이라고 해요.', src: ['S23'] }],
  },

  turnback: [
    { who: 'narr', text: '1388년, 이성계는 위화도에서 군사를 돌려 개경으로 돌아왔어요.', src: ['S23'] },
    { who: 'narr', text: '이성계는 우왕을 쫓아내고 나라의 권력을 잡았어요. 이 일을 위화도 회군이라고 해요.', src: ['S23'] },
    { who: 'narr', text: '1392년, 이성계는 왕위에 올라 새 나라를 세웠어요.', src: ['S23', 'S24'] },
    { who: 'narr', text: '이듬해부터 나라 이름을 \'조선\'이라고 했고, 1394년 한양으로 도읍을 옮겼어요.', src: ['S24'] },
  ],

  hanyang: {
    howto: [
      { who: 'guide', text: '새 도읍 한양에 궁궐과 종묘, 사직단을 놓아 보자.' },
      { who: 'narr', text: '궁궐인 경복궁은 북쪽 산(백악)을 뒤로 하고 지었어요.', src: ['S26'] },
      { who: 'narr', text: '궁궐에서 남쪽을 바라볼 때 왼쪽에 종묘, 오른쪽에 사직단을 두었어요.', src: ['S25'] },
    ],
    title: '한양에 궁궐·종묘·사직단 놓기',
    fail: '임금은 궁궐에서 남쪽을 바라봐요. 그때 왼손 쪽이 동쪽(지도의 오른쪽)이고, 오른손 쪽이 서쪽(지도의 왼쪽)이에요.',
    done: [{ who: 'narr', text: '경복궁의 동쪽에 종묘, 서쪽에 사직단이 자리 잡았어요.', src: ['S25', 'S26'] }],
  },

  quizzes: [
    { kind: 'quiz', question: '이성계가 군사를 돌린 곳은?', options: ['귀주', '위화도', '강화도'], answer: 1, explain: '압록강의 섬 위화도에서 군사를 돌렸어요. 이 일을 위화도 회군이라고 해요.', src: ['S23'] },
    { kind: 'quiz', question: '조선이 새 도읍으로 정한 곳은?', options: ['개경', '평양', '한양'], answer: 2, explain: '1394년 한양으로 도읍을 옮겼어요.', src: ['S24'] },
  ],
};
