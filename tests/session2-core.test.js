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

test('order: wrong taps fail and easy mode highlights the next card', async () => {
  const c = ctx();
  let p = orderCards(c, { title: '순서', cards: ['가', '나', '다'] });
  cardBtn(c.ui, '가').click();
  ok(c.ui.querySelector('.order-slots').textContent.includes('가'), 'placed');
  cardBtn(c.ui, '다').click();
  eq(await p, false);
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
  pointerAt(board, 'pointermove', 0.8, 0.5); // 가운데 점을 건너뜀
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
