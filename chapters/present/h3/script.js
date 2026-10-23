// 현대편 3장 「6·25 전쟁」. 교과서 사진에 빠진 쪽(140~141쪽)은 우리역사넷(S57)으로 채운다.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    soldier: { name: '국군 병사', mark: '軍', color: '#5a6448', look: 'rokSoldier' },
    unSoldier: { name: '유엔군 병사', mark: 'UN', color: '#5b92e5', look: 'unSoldier' },
    officer: { name: '국군 지휘관', mark: '將', color: '#5a6448', look: 'rokSoldier' },
  },
  intro: [
    { who: 'narr', text: '1950년 6월 25일 새벽, 북한군이 38도선 전 지역에서 남쪽으로 쳐내려왔어요(6·25 전쟁).', src: ['S57'] },
    { who: 'narr', text: '국군은 3일 만에 서울을 빼앗기고 낙동강까지 물러났어요.', src: ['S57'] },
  ],
  start: [
    { who: 'guide', text: '여기는 1950년 여름, 낙동강 가의 국군 진영이야. 마지막 방어선을 지키고 있어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['국군 병사에게 말을 걸어 보자', '유엔군 병사를 만나자', '국군 지휘관을 찾아가자', '전쟁의 흐름을 따라가자', '배운 내용을 확인해 보자'],
  minigameTitle: '6·25 전쟁',
  npc: {
    soldier: {
      first: [
        { who: 'soldier', text: '병력과 장비가 모자라 여기 낙동강까지 밀려왔어.', src: ['S57'] },
        { who: 'soldier', text: '낙동강은 우리가 꼭 지켜야 할 마지막 방어선이야.', src: ['S57'] },
      ],
      later: [{ who: 'soldier', text: '유엔군도 함께 싸우고 있어.' }],
    },
    unSoldier: {
      tooEarly: [{ who: 'unSoldier', text: '국군 병사와 먼저 이야기해 봐.' }],
      first: [
        { who: 'unSoldier', text: '국제 연합은 북한의 남침을 침략으로 보았어. 미국을 비롯한 16개 나라가 유엔군을 보냈지.', src: ['S57'] },
      ],
      later: [{ who: 'unSoldier', text: '지휘관님이 큰 작전을 준비하고 계셔.' }],
    },
    officer: {
      tooEarly: [{ who: 'officer', text: '유엔군 병사의 이야기도 들어 보게.' }],
      first: [
        { who: 'officer', text: '바다로 돌아가 인천에 상륙하는 작전을 펼칠 것이다.', src: ['S57'] },
        { who: 'officer', text: '그러면 서울을 되찾을 수 있을 것이다.', src: ['S57'] },
      ],
    },
    signUN: { always: [
      { who: 'narr', text: '6·25 전쟁에는 미국, 영국, 튀르키예, 에티오피아, 콜롬비아 등 16개 나라가 유엔군으로 참전했어요.', src: ['S57'] },
    ] },
    signRiver: { always: [
      { who: 'narr', text: '국군과 유엔군은 낙동강을 마지막 방어선으로 삼아 끝까지 지켜 냈어요.', src: ['S57'] },
    ] },
  },
  parts: {
    places: {
      type: 'place', src: ['S57'],
      title: '곳과 일어난 일을 짝지어요',
      items: [{ id: 'river', label: '낙동강' }, { id: 'incheon', label: '인천' }, { id: 'seoul', label: '서울' }],
      slots: [
        { id: 'sSeoul', label: '전쟁 3일 만에 빼앗겼다가 9월 28일 되찾았어요', xy: [20, 50], answer: 'seoul' },
        { id: 'sRiver', label: '마지막 방어선으로 끝까지 지켰어요', xy: [50, 50], answer: 'river' },
        { id: 'sIncheon', label: '1950년 9월 15일 상륙 작전을 펼쳤어요', xy: [80, 50], answer: 'incheon' },
      ],
      fail: '국군 병사, 지휘관과 나눈 이야기를 떠올려 보세요.',
    },
    landing: {
      type: 'gauge', title: '인천 상륙 작전: 물때에 맞춰 상륙 신호!', label: '상륙!', zone: [0.6, 0.78], seconds: 4.5,
      prompt: '표시가 빛나는 칸에 들어오면 눌러요.',
      fail: '너무 이르거나 늦었어요. 표시가 빛나는 칸에 들어올 때를 기다려요.',
      done: [{ who: 'narr', text: '1950년 9월 15일 인천 상륙 작전이 성공했고, 9월 28일 서울을 되찾았어요.', src: ['S57'] }],
    },
    flow: {
      type: 'order', src: ['S57'],
      title: '6·25 전쟁 초기의 흐름대로 놓아요',
      cards: ['북한군의 남침 (1950년 6월 25일)', '서울을 빼앗김', '낙동강까지 물러남', '인천 상륙 작전 (9월 15일)', '서울을 되찾음 (9월 28일)'],
      fail: '처음엔 밀려 내려갔다가, 인천 상륙 작전으로 다시 서울을 되찾았어요.',
    },
  },
  result: [{ who: 'narr', text: '국군과 유엔군은 서울을 되찾은 뒤 북쪽으로 나아갔어요.', src: ['S51', 'S57'] }],
  quizzes: [
    { kind: 'quiz', question: '6·25 전쟁이 일어난 날은?', options: ['1945년 8월 15일', '1950년 6월 25일', '1953년 7월 27일'], answer: 1, explain: '1950년 6월 25일 새벽 북한군이 남침했어요.', src: ['S57'] },
    { kind: 'quiz', question: '1950년 9월 15일 국군과 유엔군이 펼친 작전은?', options: ['인천 상륙 작전', '서울 진공 작전', '학익진'], answer: 0, explain: '인천 상륙 작전으로 9월 28일 서울을 되찾았어요.', src: ['S57'] },
  ],
};
