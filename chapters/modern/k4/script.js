// 근대편 4장 「독립 협회와 대한 제국」. 사실은 비상 5-2 교과서 101쪽(S51)과 S52~S54.
export default {
  speakers: {
    guide: { name: '안내', mark: '◎', color: '#2f6b5e' },
    citizen: { name: '한성 시민', mark: '民', color: '#6b4a32', look: 'commoner' },
    seojaepil: { name: '서재필', mark: '徐', color: '#2b2f36', look: 'seojaepil' },
    gojong: { name: '고종', mark: '帝', color: '#c99a2e', look: 'gojong' },
  },
  intro: [
    { who: 'narr', text: '청일 전쟁에서 이긴 일본이 조선의 정치에 간섭하자, 고종과 명성 황후는 러시아의 힘을 빌려 이를 벗어나려 했어요.', src: ['S51'] },
    { who: 'narr', text: '그러자 일본은 경복궁에 침입해 명성 황후를 시해했어요(을미사변). 고종은 러시아 공사관으로 몸을 피했어요.', src: ['S51', 'S54'] },
  ],
  start: [
    { who: 'guide', text: '여기는 한성의 거리야. 사람들이 모여 나라 이야기를 하고 있어.' },
    { who: 'guide', text: '느낌표가 있는 사람에게 차례로 말을 걸어 봐.' },
  ],
  goals: ['한성 시민에게 말을 걸어 보자', '독립문 앞의 서재필을 찾아가자', '고종 황제를 만나자', '자주독립을 위한 일을 해 보자', '배운 내용을 확인해 보자'],
  minigameTitle: '자주독립을 외치다',
  npc: {
    citizen: {
      first: [
        { who: 'citizen', text: '임금께서 러시아 공사관에 머무신다니 나라 꼴이 말이 아니에요.', src: ['S51'] },
        { who: 'citizen', text: '그래도 요즘엔 신문으로 나라 안팎의 소식을 알 수 있어요.', src: ['S51'] },
      ],
      later: [{ who: 'citizen', text: '독립문 앞에 서재필 선생이 계세요.' }],
    },
    seojaepil: {
      tooEarly: [{ who: 'seojaepil', text: '거리의 시민들 이야기부터 들어 보세요.' }],
      first: [
        { who: 'seojaepil', text: '나는 정부의 지원을 받아 독립신문을 펴냈습니다. 나라 안팎의 소식을 알리고 자주독립을 강조하지요.', src: ['S51', 'S53'] },
        { who: 'seojaepil', text: '관리, 지식인과 함께 독립 협회를 만들고 이 독립문을 세웠습니다.', src: ['S51', 'S52'] },
      ],
      later: [{ who: 'seojaepil', text: '만민 공동회에서는 누구나 생각을 말할 수 있어요.' }],
    },
    gojong: {
      tooEarly: [{ who: 'gojong', text: '서재필에게 먼저 다녀오너라.' }],
      first: [
        { who: 'gojong', text: '나는 러시아 공사관에 머문 지 1년 만에 경운궁으로 돌아왔다.', src: ['S51', 'S54'] },
        { who: 'gojong', text: '환구단에서 황제로 즉위하고, 나라 이름을 대한 제국으로 바꾸었다.', src: ['S51', 'S54'] },
        { who: 'gojong', text: '여러 개혁을 펼쳐 근대 국가로 나아갈 것이다.', src: ['S51'] },
      ],
    },
    signGate: { always: [
      { who: 'narr', text: '독립 협회는 독립문을 세워 자주독립의 의지를 보여 주었어요.', src: ['S51'] },
    ] },
    signForum: { always: [
      { who: 'narr', text: '독립 협회는 만민 공동회를 열어 누구나 사회 문제에 대해 자기 생각을 말할 수 있게 했어요.', src: ['S51'] },
      { who: 'narr', text: '첫 만민 공동회는 1898년 종로에서 열렸어요.', src: ['S52'] },
    ] },
    signAltar: { always: [
      { who: 'narr', text: '환구단은 황제가 하늘에 제사를 지내던 제단이에요. 지금은 황궁우만 남아 있어요.', src: ['S51'] },
    ] },
  },
  parts: {
    paper: {
      type: 'drive', src: ['S53'], title: '독립신문을 받아 한성 거리에 배달해요', counter: '배달한 곳', seconds: 150,
      howto: '신문사에서 신문 뭉치를 받고, 빛나는 곳을 차례로 지나며 신문을 건네요. 건네는 동안 잠깐 기다려요.',
      intro: [{ who: 'narr', text: '독립신문은 1896년에 창간한 우리나라 최초의 민간 신문이에요.', src: ['S53'] }, { who: 'seojaepil', text: '오늘 신문이 나왔습니다. 한성 사람들에게 나라 안팎의 소식을 전해 주세요!' }],
      route: [
        { label: '독립신문사', hold: 3, holdLabel: '신문 뭉치 받는 중', holdSay: '갓 찍은 신문 뭉치를 받아요.' },
        { label: '종로 가게', hold: 2, holdLabel: '신문 건네는 중', talk: [{ who: 'citizen', text: '한글로 쓰여 있어서 누구나 읽을 수 있네요!' }] },
        { label: '궁궐 앞 거리', hold: 2, holdLabel: '신문 건네는 중', talk: [{ who: 'citizen', text: '임금께서 러시아 공사관에 머무신다니 걱정이에요.' }] },
        { label: '시장', hold: 2, holdLabel: '신문 건네는 중', say: '시장 사람들도 신문을 돌려 읽어요.' },
        { label: '서재필 선생', talk: [{ who: 'seojaepil', text: '수고했어요. 신문으로 자주독립의 뜻을 널리 알릴 수 있습니다.' }] },
      ],
      fail: '화살표를 따라 빛나는 곳으로 가요. 시간 안에 모두 배달해요.',
    },
    flow: {
      type: 'stops', src: ['S52', 'S53', 'S54'], title: '한성 거리에서 일어난 차례대로 찾아가요', counter: '찾아간 곳',
      howto: '궁궐, 공사관, 신문사, 환구단, 종로의 이름표를 일어난 차례대로 찾아가 대화 버튼을 눌러요. 해가 적혀 있어요.',
      spots: [
        { label: '경복궁: 을미사변 (1895)', look: 'joseonOfficial', talk: [{ who: 'citizen', text: '일본이 경복궁에 침입해 명성 황후를 시해했대요. 온 나라가 슬픔에 잠겼어요.' }] },
        { label: '러시아 공사관 (1896)', look: 'gojong', talk: [{ who: 'gojong', text: '나는 몸을 피해 러시아 공사관으로 옮겼다.' }] },
        { label: '독립신문사 (1896)', look: 'seojaepil', talk: [{ who: 'seojaepil', text: '독립신문을 펴내 나라 안팎의 소식을 알렸습니다.' }] },
        { label: '환구단: 대한 제국 (1897)', look: 'gojong', talk: [{ who: 'gojong', text: '환구단에서 황제로 즉위하고, 나라 이름을 대한 제국으로 바꾸었다.' }] },
        { label: '종로: 만민 공동회 (1898)', look: 'citizen', talk: [{ who: 'citizen', text: '만민 공동회에서는 누구나 나라 일에 대한 생각을 말할 수 있어요!' }] },
      ],
      fail: '이름표에 적힌 해를 보세요. 같은 해라면 고종이 러시아 공사관으로 옮긴 일이 먼저예요.',
      done: [{ who: 'narr', text: '고종은 1897년 환구단에서 황제로 즉위하고 나라 이름을 대한 제국으로 바꾸었어요.', src: ['S51', 'S54'] }],
    },
  },
  result: [{ who: 'narr', text: '대한 제국은 여러 개혁을 추진해 근대 국가로 나아가고자 했어요.', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', year: 1896, question: '서재필이 펴낸 신문은?', options: ['황성신문', '독립신문', '대한매일신보'], answer: 1, explain: '서재필은 1896년 독립신문을 펴냈어요.', src: ['S51', 'S53'] },
    { kind: 'quiz', year: 1897, question: '1897년 고종이 바꾼 나라 이름은?', options: ['대한 제국', '조선', '고려'], answer: 0, explain: '고종은 환구단에서 황제로 즉위하고 대한 제국을 세웠어요.', src: ['S51'] },
  ],
};
