// 게임 화면들: 첫 화면, 이름, 장 선택 지도, 해설 카드, 장 결과, 차시 결과 카드, 메뉴, HUD.
import { SESSIONS, isUnlocked } from '../chapters/index.js';

const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
};
export const starText = n => '★'.repeat(n) + '☆'.repeat(3 - n);
export const timeText = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function screen(root, cls, ...kids) {
  const el = h('section', { class: `screen ${cls}` }, ...kids);
  root.appendChild(el);
  return el;
}

export function showTitle(root, { savedName, hasProgress, storageOk }) {
  return new Promise(resolve => {
    const done = v => { el.remove(); resolve(v); };
    const confirm = h('div', { class: 'confirm', hidden: true },
      h('p', {}, `${savedName || '앞 친구'}의 기록이 지워져요. 지울까요?`),
      h('div', { class: 'row' },
        h('button', { class: 'btn danger', type: 'button', onclick: () => done('new') }, '지우기'),
        h('button', { class: 'btn', type: 'button', onclick: () => { confirm.hidden = true; } }, '취소')));
    const el = screen(root, 'title',
      h('div', { class: 'title-inner' },
        h('div', { class: 'eyebrow' }, '초등 5학년 사회 · 외세의 침입과 고려의 노력'),
        h('h1', {}, '고려를 ', h('span', {}, '지켜라')),
        h('p', { class: 'lead' }, '거란과 몽골이 쳐들어왔을 때, 고려 사람들은 외교와 전투와 끈질긴 항쟁으로 나라를 지켰어요. 젊은 고려 병사가 되어 그 현장을 걸어 보세요.'),
        h('div', { class: 'row' },
          hasProgress && h('button', { class: 'btn primary', type: 'button', onclick: () => done('continue') }, `이어하기 (${savedName || "저장된 기록"})`),
          h('button', { class: `btn ${hasProgress ? '' : 'primary'}`, type: 'button', onclick: () => (hasProgress ? (confirm.hidden = false) : done('new')) }, '처음부터')),
        confirm,
        !storageOk && h('p', { class: 'warn' }, '이 기기에서는 저장되지 않아요. 끝까지 한 번에 해 주세요.'),
        h('p', { class: 'controls' }, '키보드: W A S D 또는 방향키로 이동, E 또는 스페이스로 대화 · 터치: 화면 왼쪽을 끌어 이동, 오른쪽 아래 대화 버튼')));
  });
}

export function askName(root, prev) {
  return new Promise(resolve => {
    const input = h('input', { id: 'student-name', type: 'text', placeholder: '예: 5학년 3반 12번 김고려', autocomplete: 'off', maxlength: '30' });
    input.value = prev || '';
    const submit = () => { el.remove(); resolve(input.value.trim()); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    const el = screen(root, 'name',
      h('div', { class: 'card' },
        h('h2', {}, '이름을 알려 주세요'),
        h('label', { for: 'student-name' }, '이름 또는 번호 (결과 카드에만 쓰여요. 비워도 돼요)'),
        input,
        h('button', { class: 'btn primary', type: 'button', onclick: submit }, '시작')));
    setTimeout(() => input.focus(), 50);
  });
}

const MAP_OUTLINE = '40,70 80,40 130,30 180,20 230,10 270,30 250,80 215,120 205,150 215,190 230,230 240,280 235,320 210,340 180,345 150,350 120,345 100,340 95,310 85,280 100,250 90,220 105,200 90,175 80,150 70,120 55,100';

export function showMap(root, chapters, save, { onSessionCard } = {}) {
  return new Promise(resolve => {
    const svg = `<svg viewBox="0 0 300 400" aria-hidden="true"><polygon points="${MAP_OUTLINE}" class="land"/><ellipse cx="120" cy="388" rx="16" ry="8" class="land"/></svg>`;
    const map = h('div', { class: 'map' });
    map.innerHTML = svg;
    const list = h('ol', { class: 'chapter-pick' });
    for (const c of chapters) {
      const r = save.chapterResult(c.id);
      const open = isUnlocked(c, save);
      map.appendChild(h('span', { class: `dot ${open ? 'open' : ''} ${r ? 'done' : ''}`, style: `left:${c.mapXY[0]}%;top:${c.mapXY[1]}%` }, String(c.no)));
      list.appendChild(h('li', {}, h('button', {
        class: `pick ${r ? 'done' : ''}`, type: 'button', 'data-chapter': c.id, disabled: !open,
        onclick: () => { el.remove(); resolve(c.id); },
      }, h('b', {}, `${c.no}장`), h('span', { class: 'pick-title' }, c.title),
      h('small', {}, r ? starText(r.stars) : c.load ? `${c.years} · ${c.place}` : '준비 중'))));
    }
    const sessionButtons = [1, 2].filter(s => chapters.some(c => c.session === s && save.chapterResult(c.id)))
      .map(s => h('button', { class: 'btn', type: 'button', onclick: () => onSessionCard && onSessionCard(s) }, `${s}차시 결과 카드`));
    const el = screen(root, 'mapscreen',
      h('div', { class: 'map-wrap' },
        map,
        h('div', { class: 'map-side' }, h('h2', {}, '어디로 갈까요?'), list, h('div', { class: 'row' }, sessionButtons))));
  });
}

export function showIntroCard(root, meta, lines) {
  return new Promise(resolve => {
    const el = screen(root, 'intro',
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `${meta.no}장 · ${meta.years} · ${meta.event}`),
        h('h2', {}, meta.title),
        ...lines.map(l => h('p', {}, l.text)),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { el.remove(); resolve(); } }, '시작하기')));
  });
}

export function showChapterResult(root, meta, r) {
  return new Promise(resolve => {
    const el = screen(root, 'result',
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `${meta.no}장 끝`),
        h('h2', {}, meta.title),
        h('div', { class: 'stats' },
          h('div', {}, h('b', { class: 'stars' }, starText(r.stars)), h('span', {}, '별점')),
          h('div', {}, h('b', {}, `${r.quizCorrect}/${r.quizTotal}`), h('span', {}, '퀴즈')),
          h('div', {}, h('b', {}, timeText(r.seconds)), h('span', {}, '걸린 시간'))),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { el.remove(); resolve(); } }, '다음')));
  });
}

export function showSessionCard(root, session, save, chapters) {
  return new Promise(resolve => {
    const list = chapters.filter(c => c.session === session);
    const results = list.map(c => save.chapterResult(c.id)).filter(Boolean);
    const qc = results.reduce((a, r) => a + r.quizCorrect, 0), qt = results.reduce((a, r) => a + r.quizTotal, 0);
    const secs = results.reduce((a, r) => a + r.seconds, 0);
    const wrong = results.flatMap(r => r.wrongQuizzes || []);
    const today = new Date();
    const el = screen(root, 'session',
      h('div', { class: 'card wide' },
        h('div', { class: 'eyebrow' }, `결과 카드 · ${SESSIONS[session].title}`),
        h('h2', {}, save.data.name || '이름 없음'),
        h('p', { class: 'date' }, `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`),
        h('ul', { class: 'chapter-list' }, list.map(c => {
          const r = save.chapterResult(c.id);
          return h('li', {}, h('span', {}, `${c.no}장 ${c.title}`), h('b', { class: 'stars' }, r ? starText(r.stars) : '아직'));
        })),
        h('div', { class: 'stats' },
          h('div', {}, h('b', {}, `${qc}/${qt}`), h('span', {}, '퀴즈 정답')),
          h('div', {}, h('b', {}, timeText(secs)), h('span', {}, '걸린 시간'))),
        h('div', { class: 'points' }, h('b', {}, '핵심 정리'), h('ol', {}, SESSIONS[session].points.map(p => h('li', {}, p)))),
        wrong.length > 0 && h('div', { class: 'review' }, h('b', {}, '다시 보기'),
          h('ul', {}, wrong.map(w => h('li', {}, `${w.question} → 정답: ${w.answer}. ${w.explain}`)))),
        h('p', { class: 'note' }, '이 화면을 선생님께 보여 주세요.'),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { el.remove(); resolve(); } }, '닫기')));
  });
}

export function showMenu(root, { muted, quality, storageOk = true }, onChange) {
  return new Promise(resolve => {
    const close = v => { el.remove(); resolve(v); };
    const leave = h('div', { class: 'confirm', hidden: true },
      h('p', {}, '이 기기에서는 저장되지 않아서, 장 선택으로 나가면 지금까지 한 것이 사라져요.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn danger', type: 'button', onclick: () => close('map') }, '그래도 나가기'),
        h('button', { class: 'btn', type: 'button', onclick: () => { leave.hidden = true; } }, '계속하기')));
    const qb = (lv, label) => h('button', { class: `btn ${quality === lv ? 'on' : ''}`, type: 'button', onclick: () => { onChange({ quality: lv }); close('close'); } }, label);
    const el = screen(root, 'menu',
      h('div', { class: 'card' },
        h('h2', {}, '메뉴'),
        h('p', {}, '소리'),
        h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { onChange({ muted: !muted }); close('close'); } }, muted ? '소리 켜기' : '소리 끄기')),
        h('p', {}, '화질'),
        h('div', { class: 'row' }, qb('low', '낮음'), qb('medium', '보통'), qb('high', '높음')),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: () => (storageOk ? close('map') : (leave.hidden = false)) }, '장 선택으로'),
          h('button', { class: 'btn primary', type: 'button', onclick: () => close('close') }, '닫기')),
        leave));
  });
}

export function showMessage(root, title, text) {
  screen(root, 'intro', h('div', { class: 'card' }, h('h2', {}, title), h('p', {}, text)));
}

// 탐험 중 화면 위 정보: 장 제목, 목표, 메뉴 버튼, 인물 위 "대화하기" 표시, 터치 조작.
export function createHud(root, { touch }) {
  const goal = h('span', { class: 'goal-text' });
  const chapter = h('div', { class: 'hud-chapter' });
  const timer = h('div', { class: 'hud-timer', hidden: true });
  const counter = h('div', { class: 'hud-counter', hidden: true });
  const box = h('div', { class: 'hud', hidden: true }, chapter, h('div', { class: 'hud-goal' }, h('span', { class: 'seal' }, '목표'), goal), h('div', { class: 'hud-row' }, timer, counter));
  const menuBtn = h('button', { class: 'menubtn', type: 'button', hidden: true, 'aria-label': '메뉴' }, '메뉴');
  const prompt = h('div', { class: 'prompt', hidden: true }, touch ? '대화 버튼을 눌러요' : 'E 대화하기');
  const joyZone = h('div', { class: 'joyzone', hidden: true });
  const talkBtn = h('button', { class: 'talkbtn', type: 'button', hidden: true, disabled: true }, '대화');
  const fade = h('div', { class: 'fade' });
  root.append(box, menuBtn, prompt, joyZone, talkBtn, fade);
  let camera = null;
  return {
    joyZone, talkBtn, menuBtn,
    attachCamera(c) { camera = c; },
    show(meta) { chapter.textContent = `${meta.no}장 · ${meta.years} ${meta.event}`; box.hidden = false; menuBtn.hidden = false; joyZone.hidden = talkBtn.hidden = !touch; },
    hide() { box.hidden = true; menuBtn.hidden = true; prompt.hidden = true; joyZone.hidden = talkBtn.hidden = true; },
    setGoal(text) { goal.textContent = text; },
    setTimer(sec) { timer.hidden = sec == null; if (sec != null) timer.textContent = `남은 시간 ${Math.max(0, Math.ceil(sec))}초`; },
    setCounter(text) { counter.hidden = text == null; if (text != null) counter.textContent = text; },
    setTalkEnabled(b) { talkBtn.disabled = !b; },
    setTouchVisible(b) { joyZone.hidden = talkBtn.hidden = !(touch && b); },
    setPrompt(pos) {
      if (!pos || !camera) { prompt.hidden = true; return; }
      const v = pos.clone().setY(2.9).project(camera);
      prompt.style.left = `${((v.x + 1) / 2) * 100}%`;
      prompt.style.top = `${((1 - v.y) / 2) * 100}%`;
      prompt.hidden = false;
    },
    fade(on) { fade.classList.toggle('on', on); return new Promise(r => setTimeout(r, 650)); },
  };
}
