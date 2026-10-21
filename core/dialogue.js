// 화면 아래 한지 대화창: 한 글자씩 나타나는 대사, 선택지, 다시 고르기, 퀴즈.
const NARR = { name: '해설', mark: '史', color: '#5a5248' };
const CLICK_GUARD_MS = 250; // 선택지가 열린 직후의 탭은 앞 대사를 넘기려던 탭이므로 무시

export function createDialogue(root, speakers, { typeMs = 26, reduceMotion = false } = {}) {
  const all = { narr: NARR, ...speakers };
  const el = document.createElement('div');
  el.className = 'dlg';
  el.hidden = true;
  el.innerHTML = '<div class="dlg-portrait"></div><div class="dlg-name"></div><div class="dlg-text"></div><div class="dlg-next">눌러서 계속 ▸</div><div class="dlg-choices" hidden></div>';
  root.appendChild(el);
  const $ = s => el.querySelector(s);
  const textEl = $('.dlg-text'), nextEl = $('.dlg-next'), choicesEl = $('.dlg-choices');

  let advanceFn = null, pickFn = null, timer = null, openedAt = 0;

  function show(who) {
    const s = all[who] || NARR;
    $('.dlg-name').textContent = s.name;
    $('.dlg-portrait').textContent = s.mark;
    $('.dlg-portrait').style.background = s.color;
    el.hidden = false;
  }

  function say(line) {
    return new Promise(resolve => {
      show(line.who);
      choicesEl.hidden = true; nextEl.hidden = false;
      const chars = [...line.text];
      clearInterval(timer); timer = null;
      if (reduceMotion || typeMs <= 0) textEl.textContent = line.text;
      else {
        let i = 0; textEl.textContent = '';
        timer = setInterval(() => {
          i += 1; textEl.textContent = chars.slice(0, i).join('');
          if (i >= chars.length) { clearInterval(timer); timer = null; }
        }, typeMs);
      }
      advanceFn = () => {
        if (timer) { clearInterval(timer); timer = null; textEl.textContent = line.text; return; }
        advanceFn = null; resolve();
      };
    });
  }

  function choose(prompt, options) {
    return new Promise(resolve => {
      clearInterval(timer); timer = null; advanceFn = null;
      show(prompt.who);
      textEl.textContent = prompt.text;
      nextEl.hidden = true; choicesEl.hidden = false; choicesEl.innerHTML = '';
      openedAt = performance.now();
      options.forEach((text, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = '<span class="num"></span><span class="txt"></span>';
        b.querySelector('.num').textContent = String(i + 1);
        b.querySelector('.txt').textContent = text;
        let downAt = -1;
        b.addEventListener('pointerdown', () => { downAt = performance.now(); });
        b.addEventListener('click', e => {
          e.stopPropagation();
          // 손가락(마우스)으로 누른 클릭은 선택지가 뜬 뒤에 눌리기 시작한 것만 받는다.
          // 키보드 엔터처럼 포인터 없는 클릭(detail 0)은 열린 직후만 막는다.
          const pointerTap = e.detail > 0;
          if (pointerTap ? downAt < openedAt : performance.now() - openedAt < CLICK_GUARD_MS) return;
          dialogue.pick(i);
        });
        choicesEl.appendChild(b);
      });
      pickFn = i => { pickFn = null; choicesEl.hidden = true; resolve(i); };
    });
  }

  async function ask(choice) {
    let firstTry = true;
    for (;;) {
      const i = await choose(choice.prompt, choice.options.map(o => o.text));
      const opt = choice.options[i];
      if (opt.correct) {
        if (opt.reply) await say(opt.reply);
        return { firstTry };
      }
      firstTry = false;
      await say({ who: 'narr', text: opt.hint || '다시 골라 보세요.' });
    }
  }

  async function quiz(q) {
    const i = await choose({ who: 'narr', text: q.question }, q.options);
    const correct = i === q.answer;
    const head = correct ? '○ 맞았어요!' : `× 아쉬워요. 정답은 "${q.options[q.answer]}"이에요.`;
    await say({ who: 'narr', text: `${head} ${q.explain}` });
    return { correct };
  }

  const onKey = e => {
    if (!pickFn || !/^Digit[1-9]$/.test(e.code)) return;
    const i = Number(e.code.slice(5)) - 1;
    if (i < choicesEl.children.length) dialogue.pick(i);
  };
  window.addEventListener('keydown', onKey);
  el.addEventListener('click', () => { if (advanceFn) advanceFn(); });

  const dialogue = {
    say, choose, ask, quiz,
    advance() { if (advanceFn) advanceFn(); },
    pick(i) { if (pickFn) pickFn(i); },
    isOpen() { return !el.hidden; },
    isChoosing() { return !!pickFn; },
    close() { clearInterval(timer); timer = null; advanceFn = pickFn = null; el.hidden = true; },
    dispose() { dialogue.close(); window.removeEventListener('keydown', onKey); el.remove(); },
  };
  return dialogue;
}
