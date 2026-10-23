// 일제 강점기편 3장 「대한민국 임시 정부」. 사실은 비상 5-2 교과서 125쪽(S51).
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    messenger: { name: '연락원', mark: '信', color: '#4a4f5a', look: 'student' },
    ahnchangho: { name: '안창호', mark: '安', color: '#3a3a44', look: 'ahnchangho' },
    kimgu: { name: '김구', mark: '金', color: '#3a3530', look: 'kimgu' },
  },
  intro: [
    { who: 'narr', text: '3·1 운동을 전후하여 나라 안팎에 여러 임시 정부가 세워졌어요.', src: ['S51'] },
    { who: 'narr', text: '독립운동의 힘을 하나로 모으려고, 1919년 9월 중국 상하이에서 여러 임시 정부를 통합한 대한민국 임시 정부가 세워졌어요.', src: ['S51'] },
  ],
  start: [
    { who: 'guide', text: '여기는 중국 상하이야. 낯선 거리에 우리 독립운동가들이 모여 있어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['연락원에게 말을 걸어 보자', '안창호를 만나자', '청사 앞의 김구를 찾아가자', '임시 정부의 일을 도와 보자', '배운 내용을 확인해 보자'],
  minigameTitle: '대한민국 임시 정부',
  npc: {
    messenger: {
      first: [
        { who: 'messenger', text: '임시 정부는 비밀 조직을 두어 나라 안팎의 독립운동 단체와 연락해요.', src: ['S51'] },
        { who: 'messenger', text: '독립신문을 펴내 동포들에게 독립운동 소식을 전하고 있어요.', src: ['S51'] },
      ],
      later: [{ who: 'messenger', text: '오늘도 전할 소식이 많아요.' }],
    },
    ahnchangho: {
      tooEarly: [{ who: 'ahnchangho', text: '연락원부터 만나 보시오.' }],
      first: [
        { who: 'ahnchangho', text: '대한민국 임시 정부는 모든 국민이 평등하고 국민에게 주권이 있는 민주주의 정치 체계를 갖추었소.', src: ['S51'] },
        { who: 'ahnchangho', text: '임시 헌법의 첫 조항은 \'대한민국은 민주 공화제로 한다\'라오.', src: ['S51'] },
      ],
      later: [{ who: 'ahnchangho', text: '국민이 주인인 나라를 만들 것이오.' }],
    },
    kimgu: {
      tooEarly: [{ who: 'kimgu', text: '안창호 선생께 먼저 다녀오게.' }],
      first: [
        { who: 'kimgu', text: '임시 정부는 독립운동 자금을 모으고, 다른 나라에 외교 기관을 두어 독립을 도와 달라고 요청하오.', src: ['S51'] },
        { who: 'kimgu', text: '독립군 단체를 아래에 두고 만주 지역에서 투쟁을 벌이기도 하지.', src: ['S51'] },
      ],
    },
    signOffice: { always: [
      { who: 'narr', text: '대한민국 임시 정부는 1919년 9월 중국 상하이에서 세워졌어요.', src: ['S51'] },
    ] },
    signBond: { always: [
      { who: 'narr', text: '임시 정부는 독립 공채를 발행했어요. 우리나라가 독립하면 돈을 갚겠다고 약속하는 증서예요.', src: ['S51'] },
    ] },
  },
  parts: {
    charter: {
      type: 'choose', src: ['S51'],
      title: '대한민국 임시 헌법(1919년 9월)의 내용을 모두 골라요',
      cards: [
        { text: '대한민국은 민주 공화제로 한다', correct: true },
        { text: '왕이 모든 권력을 가진다', correct: false },
        { text: '대한민국의 주권은 대한 인민 전체에 있다', correct: true },
        { text: '신분에 따라 권리가 다르다', correct: false },
        { text: '대한민국의 인민은 일체 평등하다', correct: true },
      ],
      fail: '임시 정부는 국민이 주인이고 모두가 평등한 나라를 꿈꾸었어요.',
    },
    letters: {
      type: 'collect', title: '비밀 연락망으로 소식을 전해요', counter: '전한 소식', seconds: 80,
      fail: '빛나는 곳을 따라 가요. 화살표가 길을 알려 줘요.',
    },
    roles: {
      type: 'sort', src: ['S51'],
      title: '임시 정부의 활동을 나누어요',
      bins: [{ id: 'home', label: '나라 안과 연락' }, { id: 'diplo', label: '외교와 자금' }, { id: 'army', label: '무장 투쟁' }],
      cards: [
        { text: '비밀 조직으로 독립운동 자금을 모았다', bin: 'home' },
        { text: '다른 나라에 외교 기관을 두었다', bin: 'diplo' },
        { text: '독립군 단체를 아래에 두었다', bin: 'army' },
        { text: '독립신문으로 소식을 전했다', bin: 'home' },
        { text: '독립 공채를 발행했다', bin: 'diplo' },
        { text: '만주 지역에서 투쟁을 벌였다', bin: 'army' },
      ],
      fail: '나라 안 동포와 연락하는 일, 다른 나라와 돈에 관한 일, 군대와 싸움에 관한 일로 나눠요.',
    },
  },
  result: [{ who: 'narr', text: '대한민국 임시 정부는 독립운동을 이끌며 우리 민족의 희망이 되었어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: '1919년 대한민국 임시 정부가 세워진 도시는?', options: ['상하이', '충칭', '하얼빈'], answer: 0, explain: '1919년 9월 상하이에서 통합된 임시 정부가 세워졌어요.', src: ['S51'] },
    { kind: 'quiz', question: '임시 헌법에 쓴 대한민국의 정치 체제는?', options: ['왕이 다스리는 나라', '민주 공화제', '귀족 정치'], answer: 1, explain: '대한민국은 민주 공화제로 한다고 정했어요.', src: ['S51'] },
  ],
};
