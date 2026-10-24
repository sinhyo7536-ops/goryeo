import { test, eq, ok } from './harness.js';
import { orderCards, traceGlyph } from '../core/minigame.js';
import { LOOKS } from '../content/characters.js';
import { MOODS } from '../core/world.js';
import { sleep } from './bot.js';

function ctx() {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  return { ui, done() { ui.remove(); } };
}
const cardBtn = (ui, text) => [...ui.querySelectorAll('.order-card')].find(b => b.textContent === text);

test('order: correct taps resolve true and place cards', async () => {
  const c = ctx();
  const p = orderCards(c, { title: '순서', cards: ['가', '나', '다'] });
  for (const t of ['가', '나', '다']) cardBtn(c.ui, t).click();
  eq(await p, true);
  c.done();
});

test('order: a wrong tap shows the explanation and the next card glows; easy mode glows from the start', async () => {
  const c = ctx();
  let p = orderCards(c, { title: '순서', cards: ['가', '나', '다'] });
  cardBtn(c.ui, '가').click();
  ok(c.ui.querySelector('.order-slots').textContent.includes('가'), 'placed');
  cardBtn(c.ui, '다').click();
  ok(!c.ui.querySelector('.card-why').hidden, 'explanation shown');
  ok(cardBtn(c.ui, '나').classList.contains('hint'), 'the right next card glows');
  cardBtn(c.ui, '나').click();
  await sleep(950);
  cardBtn(c.ui, '다').click();
  eq(await p, 'missed');
  eq(c.ui.querySelectorAll('.order-card').length, 0, 'screen closed');
  p = orderCards(c, { title: '순서', cards: ['가', '나', '다'], easy: true });
  ok(cardBtn(c.ui, '가').classList.contains('hint'), 'next card glows');
  cardBtn(c.ui, '가').click();
  ok(cardBtn(c.ui, '나').classList.contains('hint'), 'then the following card');
  cardBtn(c.ui, '나').click(); cardBtn(c.ui, '다').click();
  eq(await p, true);
  c.done();
});

function pointerAt(board, type, fx, fy) {
  const r = board.getBoundingClientRect();
  board.dispatchEvent(new PointerEvent(type, { pointerId: 5, bubbles: true, clientX: r.left + fx * r.width, clientY: r.top + fy * r.height }));
}

test('trace: dots must be passed in order', async () => {
  const c = ctx();
  let done = false;
  traceGlyph(c, { glyph: '一', strokes: [[[0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]] }).then(v => { done = v; });
  const board = c.ui.querySelector('.trace-board');
  pointerAt(board, 'pointerdown', 0.2, 0.5);
  pointerAt(board, 'pointermove', 0.5, 0.2); // 가운데 점을 피해 위로 돌아서
  pointerAt(board, 'pointermove', 0.8, 0.2);
  pointerAt(board, 'pointermove', 0.8, 0.5); // 마지막 점에 먼저 닿음
  await sleep(10);
  eq(done, false);
  pointerAt(board, 'pointermove', 0.5, 0.5);
  pointerAt(board, 'pointermove', 0.8, 0.5);
  pointerAt(board, 'pointerup', 0.8, 0.5);
  await sleep(500);
  eq(done, true);
  c.done();
});

test('trace: lifting the finger restarts only that stroke', async () => {
  const c = ctx();
  let done = false;
  traceGlyph(c, { glyph: '十', strokes: [[[0.2, 0.5], [0.8, 0.5]], [[0.5, 0.2], [0.5, 0.5], [0.5, 0.8]]] }).then(v => { done = v; });
  const board = c.ui.querySelector('.trace-board');
  pointerAt(board, 'pointerdown', 0.2, 0.5); pointerAt(board, 'pointermove', 0.8, 0.5); pointerAt(board, 'pointerup', 0.8, 0.5);
  eq(board.querySelectorAll('.stroke-done').length, 1);
  pointerAt(board, 'pointerdown', 0.5, 0.2); pointerAt(board, 'pointermove', 0.5, 0.5); pointerAt(board, 'pointerup', 0.5, 0.5);
  eq(board.querySelectorAll('.stroke-done').length, 1, 'second stroke not done');
  pointerAt(board, 'pointerdown', 0.5, 0.2); pointerAt(board, 'pointermove', 0.5, 0.5); pointerAt(board, 'pointermove', 0.5, 0.8); pointerAt(board, 'pointerup', 0.5, 0.8);
  await sleep(500);
  eq(done, true);
  c.done();
});

test('faces: new session-2 looks exist', () => {
  for (const id of ['kimyunhu', 'minister', 'monk', 'artisan', 'baejungson', 'kimtongjeong', 'sambyeolcho', 'mongol']) ok(LOOKS[id] && LOOKS[id].face, id);
});

test('world: overcast morning sea moods exist', () => {
  for (const m of ['overcast', 'morning', 'sea']) ok(MOODS[m] && MOODS[m].fog.length === 3, m);
});

test('trace: a fast swipe that crosses the dots between two samples still counts', async () => {
  const c = ctx();
  let done = false;
  traceGlyph(c, { glyph: '一', strokes: [[[0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]] }).then(v => { done = v; });
  const board = c.ui.querySelector('.trace-board');
  pointerAt(board, 'pointerdown', 0.2, 0.5);
  pointerAt(board, 'pointermove', 0.85, 0.5); // 한 번에 휙 지나감
  pointerAt(board, 'pointerup', 0.85, 0.5);
  await sleep(500);
  eq(done, true);
  c.done();
});

import { shuffledOrder } from '../core/minigame.js';
test('order: shuffled cards are neither in order nor simply reversed', () => {
  for (let n = 3; n <= 8; n++) {
    const cards = Array.from({ length: n }, (_, i) => `c${i}`);
    const s = shuffledOrder(cards);
    eq([...s].sort(), [...cards].sort(), `same cards for ${n}`);
    ok(s.join() !== cards.join(), `not in order for ${n}`);
    ok(s.join() !== [...cards].reverse().join(), `not reversed for ${n}`);
  }
});

test('trace: after three misses the dots get easier to hit', async () => {
  const c = ctx();
  traceGlyph(c, { glyph: '一', strokes: [[[0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]] });
  const board = c.ui.querySelector('.trace-board');
  for (let i = 0; i < 3; i++) { pointerAt(board, 'pointerdown', 0.2, 0.59); pointerAt(board, 'pointerup', 0.2, 0.59); }
  eq(board.dataset.easy, '1', 'easy after three misses');
  pointerAt(board, 'pointerdown', 0.2, 0.59); // 예전보다 넓은 판정
  ok(board.querySelector('.trace-dot.passed'), 'start accepted');
  c.done();
});
