// 역사 수첩: 장을 하는 동안 들은 '사실'(출처가 달린 해설·대사)을 모아 둔다. 진행 안내(출처 없음)는 적지 않는다.
// 묶음: 살펴본 곳(안내판), 만난 사람(인물의 말), 사건 해설(해설), 확인 문제(퀴즈와 해설). 같은 문장은 한 번만.
export function createNotebook() {
  let entries = [], speakers = {}, context = null, seen = new Set();
  const group = (kind, title) => {
    let e = entries.find(x => x.kind === kind && x.title === title);
    if (!e) { e = { kind, title, lines: [] }; entries.push(e); }
    return e;
  };
  return {
    // 장을 시작할 때: 저장해 둔 것(이어하기)과 그 장의 말하는 사람 목록
    start(saved = [], sp = {}) {
      entries = saved.map(e => ({ ...e, lines: [...e.lines] }));
      speakers = sp; context = null;
      seen = new Set(entries.flatMap(e => e.lines.map(l => l.text)));
    },
    // 지금 읽는 안내판 { kind: 'place', title } (없으면 null)
    setContext(c) { context = c; },
    // 대사 한 줄: 사실이면 적고 true
    record(line) {
      if (!line || !line.src || !line.src.length || seen.has(line.text)) return false;
      seen.add(line.text);
      const e = line.who === 'narr'
        ? (context && context.kind === 'place' ? group('place', context.title) : group('event', '사건 해설'))
        : group('person', speakers[line.who]?.name || line.who);
      e.lines.push({ text: line.text, src: line.src, ...(line.quote ? { quote: true } : {}) });
      return true;
    },
    // 퀴즈: 문제·정답·해설과 처음에 맞혔는지
    recordQuiz(q, correct) {
      if (seen.has(q.question)) return false;
      seen.add(q.question);
      group('quiz', '확인 문제').lines.push({ text: q.question, answer: q.options[q.answer], explain: q.explain, correct: !!correct, src: q.src || [] });
      return true;
    },
    entries: () => entries,
  };
}
