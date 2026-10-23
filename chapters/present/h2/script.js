// 현대편 2장 「대한민국 정부 수립」. 사실은 비상 5-2 교과서 138~140쪽(S51).
// 이승만과 김구의 주장은 옳고 그름을 매기지 않고 서로 다른 생각으로만 나눈다.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    citizen: { name: '서울 시민', mark: '民', color: '#5d7a9a', look: 'citizen' },
    syngmanrhee: { name: '이승만', mark: '李', color: '#2b2f36', look: 'syngmanrhee' },
    kimgu: { name: '김구', mark: '金', color: '#3a3530', look: 'kimgu' },
  },
  intro: [
    { who: 'narr', text: '광복 뒤 미국과 소련은 일본군의 무장 해제를 이유로 한반도에 들어왔어요. 38도선을 기준으로 남쪽에는 미군이, 북쪽에는 소련군이 머물렀어요.', src: ['S51'] },
    { who: 'narr', text: '1945년 12월 모스크바 3국 외상 회의에서 한반도에 임시 정부를 세우고, 최대 5년 동안 신탁 통치를 하기로 정했어요. 이를 두고 사람들 사이에 갈등이 일어났어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '우리 손으로 새 나라를 세우려는 때야. 사람들의 생각을 들어 보자.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['서울 시민에게 말을 걸어 보자', '이승만의 생각을 들어 보자', '김구의 생각을 들어 보자', '정부가 세워지는 과정을 따라가자', '배운 내용을 확인해 보자'],
  minigameTitle: '대한민국 정부 수립',
  npc: {
    citizen: {
      first: [
        { who: 'citizen', text: '미국과 소련이 두 차례 회의를 열었지만 합의하지 못해서, 한반도 문제를 국제 연합(UN)에 넘겼대요.', src: ['S51'] },
        { who: 'citizen', text: '국제 연합은 남북한 총선거로 통일 정부를 세우기로 했지만, 소련이 막았대요.', src: ['S51'] },
      ],
      later: [{ who: 'citizen', text: '사람마다 생각이 달라요.' }],
    },
    syngmanrhee: {
      tooEarly: [{ who: 'syngmanrhee', text: '시민들의 이야기를 먼저 들어 보시오.' }],
      first: [
        { who: 'syngmanrhee', text: '통일 정부를 기다려도 잘되지 않으니, 남쪽만이라도 임시 정부 같은 것을 만들어야 하오.', src: ['S51'] },
        { who: 'syngmanrhee', text: '그리고 소련이 38도선 북쪽에서 물러나도록 세계에 알려야 하오.', src: ['S51'] },
      ],
      later: [{ who: 'syngmanrhee', text: '나라를 세우는 일이 급하오.' }],
    },
    kimgu: {
      tooEarly: [{ who: 'kimgu', text: '이승만 박사의 생각도 들어 보게.' }],
      first: [
        { who: 'kimgu', text: '다른 나라의 간섭을 받지 않고 독립된 통일 정부를 세워야 하오.', src: ['S51'] },
        { who: 'kimgu', text: '통일 정부가 가망 없다고 단독 정부를 세울 수는 없소.', src: ['S51'] },
      ],
    },
    signElection: { always: [
      { who: 'narr', text: '1948년 5월 10일 남한에서 국회 의원을 뽑는 선거가 열렸어요(5·10 총선거). 21세 이상 모든 국민이 투표한 우리나라 최초의 민주 선거예요.', src: ['S51'] },
    ] },
    signJeju: { always: [
      { who: 'narr', text: '1948년 4월 3일 제주도에서는 남한만의 단독 선거에 반대해 일부 주민이 들고일어났고, 이를 진압하는 과정에서 많은 주민이 희생되었어요(제주 4·3 사건).', src: ['S51'] },
    ] },
    signConstitution: { always: [
      { who: 'narr', text: '제헌 헌법: 대한민국은 민주 공화국이다. 대한민국의 주권은 국민에게 있고, 모든 권력은 국민으로부터 나온다.', src: ['S51'] },
    ] },
  },
  parts: {
    flow: {
      type: 'order', src: ['S51'],
      title: '대한민국 정부가 세워진 차례대로 놓아요',
      cards: ['8·15 광복', '모스크바 3국 외상 회의', '한반도 문제를 국제 연합에 넘김', '5·10 총선거', '대한민국 정부 수립'],
      fail: '회의에서 합의하지 못하자 국제 연합에 넘겼고, 선거를 치른 뒤 정부를 세웠어요.',
    },
    views: {
      type: 'sort', src: ['S51'],
      title: '누구의 생각일까요?',
      bins: [{ id: 'rhee', label: '이승만의 생각' }, { id: 'kim', label: '김구의 생각' }],
      cards: [
        { text: '남쪽만이라도 정부를 먼저 세우자', bin: 'rhee' },
        { text: '다른 나라의 간섭 없이 통일 정부를 세우자', bin: 'kim' },
        { text: '소련이 물러나도록 세계에 알리자', bin: 'rhee' },
        { text: '단독 정부는 세울 수 없다', bin: 'kim' },
      ],
      fail: '이승만은 남쪽만이라도 정부를 세우자고, 김구는 통일 정부를 세우자고 했어요.',
    },
    vote: {
      type: 'collect', title: '5·10 총선거: 투표하러 가요', counter: '투표 차례', seconds: 60,
      fail: '빛나는 곳을 차례로 지나가면 투표를 마칠 수 있어요.',
      done: [{ who: 'narr', text: '5·10 총선거로 뽑힌 국회 의원들은 제헌 국회를 열고, 나라 이름을 \'대한민국\'으로 정한 제헌 헌법을 만들었어요.', src: ['S51'] }],
    },
  },
  result: [
    { who: 'narr', text: '국회 의원들은 이승만을 대통령으로 뽑았고, 1948년 8월 15일 대한민국 정부 수립을 선포했어요. 대한민국은 임시 정부의 법통을 이었어요.', src: ['S51'] },
    { who: 'narr', text: '한편 북한에서는 1948년 9월 별도의 정권이 세워졌어요.', src: ['S51'] },
  ],
  quizzes: [
    { kind: 'quiz', question: '1948년 5월 10일 열린 우리나라 최초의 민주 선거는?', options: ['5·10 총선거', '3·15 선거', '만민 공동회'], answer: 0, explain: '21세 이상 모든 국민이 투표한 최초의 민주 선거예요.', src: ['S51'] },
    { kind: 'quiz', question: '대한민국 정부 수립을 선포한 날은?', options: ['1945년 8월 15일', '1948년 8월 15일', '1919년 9월'], answer: 1, explain: '1948년 8월 15일 대한민국 정부 수립을 선포했어요.', src: ['S51'] },
  ],
};
