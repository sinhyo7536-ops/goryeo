// 대사·퀴즈 데이터 검사기. 출처 없는 해설, 없는 출처 번호, 금지 표현을 잡아낸다.
const FORBIDDEN = [
  [/서희\s*장군/, "서희는 '장군'이 아니에요"],
  [/사귀|사귄|사귈/, "'사귀다' 대신 '친하게 지내다'를 써요"],
];

export function validateScript(script, sources) {
  const errors = [];
  const checkText = (text, where) => {
    if (typeof text !== 'string') return;
    for (const [re, why] of FORBIDDEN) if (re.test(text)) errors.push(`${where}: forbidden wording (${why}): ${text}`);
  };
  const checkSrc = (src, where, required) => {
    if (!src || !src.length) { if (required) errors.push(`${where}: src is required`); return; }
    for (const id of src) if (!sources[id]) errors.push(`${where}: unknown source ${id}`);
  };
  const checkLine = (line, where) => {
    checkText(line.text, where);
    checkSrc(line.src, where, line.who === 'narr');
  };
  const visit = (node, where) => {
    if (Array.isArray(node)) { node.forEach((n, i) => visit(n, `${where}[${i}]`)); return; }
    if (!node || typeof node !== 'object') return;
    if (node.kind === 'choice') {
      if (node.prompt) checkLine(node.prompt, `${where}.prompt`);
      checkSrc(node.src, where, false);
      const correct = node.options.filter(o => o.correct).length;
      if (correct !== 1) errors.push(`${where}: choice needs exactly one correct option (has ${correct})`);
      node.options.forEach((o, i) => {
        checkText(o.text, `${where}.options[${i}]`);
        checkText(o.hint, `${where}.options[${i}].hint`);
        if (o.reply) checkLine(o.reply, `${where}.options[${i}].reply`);
      });
      return;
    }
    if (node.kind === 'quiz') {
      checkText(node.question, where); checkText(node.explain, where);
      node.options.forEach((o, i) => checkText(o, `${where}.options[${i}]`));
      if (!(Number.isInteger(node.answer) && node.answer >= 0 && node.answer < node.options.length)) errors.push(`${where}: answer out of range`);
      checkSrc(node.src, where, true);
      return;
    }
    if (typeof node.text === 'string' && typeof node.who === 'string') { checkLine(node, where); return; }
    for (const [k, v] of Object.entries(node)) visit(v, `${where}.${k}`);
  };
  for (const [k, v] of Object.entries(script)) if (k !== 'speakers') visit(v, k);
  return errors;
}
