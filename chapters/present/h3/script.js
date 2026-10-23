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
    river: {
      type: 'ambush', title: '낙동강 방어선을 지켜요', label: '막아라!', counter: '막아 낸 공격',
      howto: '강을 건너오는 북한군이 빛나는 강가에 들어오면 그 위의 「막아라!」를 눌러요.',
      fail: '빛나는 강가에 들어왔을 때 눌러야 해요. 다시 지켜 봐요.',
      done: [{ who: 'narr', text: '국군과 유엔군은 낙동강을 마지막 방어선으로 삼아 끝까지 지켜 냈어요.', src: ['S57'] }],
    },
    landing: {
      type: 'drive', title: '인천 상륙 작전: 상륙정을 몰아 인천에 상륙해요', vehicle: 'boat', counter: '지난 곳', seconds: 80,
      howto: '화살표를 따라 상륙정을 몰아요. 암초와 적의 배를 피해 인천 항구까지 가요.',
      route: [
        { label: '출발', say: '군함에서 상륙정이 출발했어요.' },
        { label: '월미도 앞', say: '먼저 인천 앞바다의 월미도를 차지했어요.' },
        { label: '인천 상륙!', say: '인천에 상륙했어요!' },
      ],
      bump: '부딪혔어요! 앞 지점에서 다시 가요.',
      fail: '시간 안에 인천에 닿지 못했어요. 암초와 적의 배를 피해 다시 가 봐요.',
      done: [{ who: 'narr', text: '1950년 9월 15일 인천 상륙 작전이 성공했고, 9월 28일 서울을 되찾았어요.', src: ['S57'] }],
    },
    flow: {
      type: 'stops', title: '땅 위 지도에서 전쟁의 흐름대로 찾아가요', counter: '찾아간 곳',
      howto: '바닥에 그린 지도 위의 이름표를 일어난 차례대로 찾아가 대화 버튼을 눌러요.',
      spots: [
        { label: '북한군의 남침', say: '1950년 6월 25일 새벽, 북한군이 38도선을 넘어 쳐내려왔어요.' },
        { label: '서울을 빼앗김', say: '3일 만에 서울을 빼앗겼어요.' },
        { label: '낙동강 방어선', say: '낙동강을 마지막 방어선으로 지켜 냈어요.' },
        { label: '인천 상륙 작전', say: '1950년 9월 15일 인천에 상륙했어요.' },
        { label: '서울을 되찾음', say: '9월 28일 서울을 되찾았어요.' },
      ],
      fail: '처음엔 밀려 내려갔다가, 인천 상륙 작전으로 다시 서울을 되찾았어요.',
    },
  },
  result: [{ who: 'narr', text: '국군과 유엔군은 서울을 되찾은 뒤 북쪽으로 나아갔어요.', src: ['S51', 'S57'] }],
  quizzes: [
    { kind: 'quiz', question: '6·25 전쟁이 일어난 날은?', options: ['1945년 8월 15일', '1950년 6월 25일', '1953년 7월 27일'], answer: 1, explain: '1950년 6월 25일 새벽 북한군이 남침했어요.', src: ['S57'] },
    { kind: 'quiz', question: '1950년 9월 15일 국군과 유엔군이 펼친 작전은?', options: ['인천 상륙 작전', '서울 진공 작전', '학익진'], answer: 0, explain: '인천 상륙 작전으로 9월 28일 서울을 되찾았어요.', src: ['S57'] },
  ],
};
