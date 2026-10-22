import { test, eq, ok } from './harness.js';
import { showTitle } from '../core/screens.js';
import { orderCards, traceGlyph } from '../core/minigame.js';
import { sleep } from './bot.js';

const GAME_URL = 'https://sinhyo7536-ops.github.io/goryeo/';
const btn = (el, text) => [...el.querySelectorAll('button')].find(b => b.textContent.includes(text));

test('teacher: guide page has the student address, a QR code and the lesson plan', async () => {
  const frame = document.createElement('iframe');
  frame.src = '../teacher.html'; frame.style.cssText = 'width:900px;height:700px;position:fixed;left:-2000px';
  document.body.appendChild(frame);
  try {
    await new Promise(r => frame.addEventListener('load', r));
    await sleep(300);
    const d = frame.contentDocument, t = d.body.textContent;
    ok(t.includes(GAME_URL), 'student address');
    ok(d.querySelector('#qr canvas, #qr img'), 'QR code drawn');
    for (const w of ['1장', '6장', '결과 카드', '가로', '새로 고침', '이어하기']) ok(t.includes(w), w);
    ok(!t.includes('차시'), 'one lesson, no 1차시/2차시 split');
  } finally { frame.remove(); }
});

// 글자 새기기 판은 화면 높이를 거의 다 쓴다 (갤럭시 탭 S6 Lite 가로 약 1000×530, 크롬북 1366×650, 휴대폰 740×360)
for (const [w, h, min] of [[1000, 530, 440], [1366, 650, 560], [740, 360, 290]]) {
  test(`trace board is big and fits on ${w}×${h}`, async () => {
    const frame = document.createElement('iframe');
    frame.src = './fit.html?kind=trace'; frame.style.cssText = `width:${w}px;height:${h}px;position:fixed;left:-3000px;top:0;border:0`;
    document.body.appendChild(frame);
    try {
      await new Promise(r => frame.addEventListener('load', r));
      for (let i = 0; i < 50 && !frame.contentDocument.querySelector('.screen'); i++) await sleep(20);
      const r = frame.contentDocument.querySelector('.trace-board').getBoundingClientRect();
      ok(r.width >= min, `board ${Math.round(r.width)}px wide, want ≥ ${min}`);
      ok(r.top >= 0 && r.bottom <= h + 1 && r.right <= w + 1, `board inside ${Math.round(r.left)},${Math.round(r.top)}..${Math.round(r.right)},${Math.round(r.bottom)}`);
    } finally { frame.remove(); }
  }, { timeout: 15000 });
}

for (const kind of ['trace', 'order']) {
  test(`phone: ${kind} screen fits a 740×360 phone held sideways`, async () => {
    const frame = document.createElement('iframe');
    frame.src = `./fit.html?kind=${kind}`; frame.style.cssText = 'width:740px;height:360px;position:fixed;left:-3000px;top:0;border:0';
    document.body.appendChild(frame);
    try {
      await new Promise(r => frame.addEventListener('load', r));
      for (let i = 0; i < 50 && !frame.contentDocument.querySelector('.screen'); i++) await sleep(20);
      const d = frame.contentDocument;
      const target = kind === 'trace' ? d.querySelector('.trace-board') : d.querySelector('.order-pile');
      const r = target.getBoundingClientRect();
      ok(r.bottom <= 360 + 1 && r.top >= 0, `${kind} spans ${Math.round(r.top)}..${Math.round(r.bottom)} in a 360px-tall screen`);
    } finally { frame.remove(); }
  }, { timeout: 15000 });
}

test('marks: placed cards get ○ and a wrong card gets ×', async () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const p = orderCards({ ui }, { title: '순서', cards: ['가', '나', '다'] });
  [...ui.querySelectorAll('.order-card')].find(b => b.textContent === '가').click();
  ok(ui.querySelector('.order-slots li').textContent.startsWith('○'), 'placed card marked ○');
  const wrong = [...ui.querySelectorAll('.order-card')].find(b => b.textContent === '다');
  wrong.click();
  ok(wrong.textContent.startsWith('×'), 'wrong card marked ×');
  await p; ui.remove();
});

test('marks: passed dots show a ✓', () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  traceGlyph({ ui }, { glyph: '一', strokes: [[[0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]] });
  const board = ui.querySelector('.trace-board'), r = board.getBoundingClientRect();
  const at = (type, fx, fy) => board.dispatchEvent(new PointerEvent(type, { pointerId: 6, bubbles: true, clientX: r.left + fx * r.width, clientY: r.top + fy * r.height }));
  at('pointerdown', 0.2, 0.5); at('pointermove', 0.5, 0.5);
  eq(board.querySelectorAll('.dot-check').length, 2, 'first two dots checked');
  ui.remove();
});

test('title: links to the teacher guide', () => {
  const el = document.createElement('div'); document.body.appendChild(el);
  showTitle(el, { savedName: '', hasProgress: false, storageOk: true });
  const a = [...el.querySelectorAll('a')].find(x => x.textContent.includes('선생님 안내'));
  ok(a && a.getAttribute('href') === 'teacher.html', 'link to teacher.html');
  el.remove();
});
