// 터치만 쓰는 학생처럼 게임을 진행하는 테스트용 봇과 준비 도구. 모든 장 테스트가 같이 쓴다.
import { createWorld } from '../core/world.js';
import { createHud } from '../core/screens.js';
import { createInput } from '../core/input.js';
import { createDialogue } from '../core/dialogue.js';
import { createStorage } from '../core/storage.js';
import { createSave } from '../core/save.js';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function fakeRenderer() {
  let ratio = 1;
  return {
    domElement: document.createElement('canvas'), shadowMap: { enabled: false, type: null },
    setPixelRatio(r) { ratio = r; }, getPixelRatio() { return ratio; }, setSize() {}, render() {}, dispose() {}, forceContextLoss() {},
  };
}
export function testWorld(quality = 'medium') {
  return createWorld(document.getElementById('sandbox'), { quality, renderer: fakeRenderer() });
}
export function memSave() {
  const m = new Map();
  return createSave(createStorage({ getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }));
}

export function touchSetup(speakers) {
  const w = testWorld();
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const hud = createHud(ui, { touch: true });
  hud.attachCamera(w.camera);
  const input = createInput({ target: window, joyZone: hud.joyZone, actionButton: hud.talkBtn });
  const dialogue = createDialogue(ui, speakers, { typeMs: 1 });
  const actions = new Set();
  input.onAction(() => { if (dialogue.isOpen()) { if (!dialogue.isChoosing()) dialogue.advance(); return; } actions.forEach(f => f()); });
  const ctx = {
    world: w, input, hud, dialogue, ui, testHooks: {}, audio: { play() {} },
    setGoal: t => hud.setGoal(t), wait: ms => sleep(Math.min(ms, 30)), fade: async () => {},
    onAction(fn) { actions.add(fn); return () => actions.delete(fn); },
    screens: { showIntroCard: async () => {} },
  };
  hud.joyZone.hidden = false; hud.talkBtn.hidden = false;
  Object.assign(hud.joyZone.style, { width: '300px', height: '300px', left: '0', top: '0', bottom: 'auto' });
  return { w, ui, hud, input, dialogue, ctx, done() { input.dispose(); dialogue.dispose(); ui.remove(); w.dispose(); } };
}

// answers: 정답 문장 집합. wrongFirst: 처음 한 번은 일부러 틀릴 정답 문장.
// noTaps(): true인 동안 화면 위 누르기 목표를 누르지 않는다. pressEarlyOnce: 큰 버튼을 준비 전에 한 번 누른다.
export function touchBot(s, { answers, wrongFirst = new Set(), noTaps = () => false, pressEarlyOnce = false, mapPicks = [], orders = [], holdStill = () => false, cardPicks = new Set(), places = {} } = {}) {
  const picks = [...mapPicks];
  let tracing = false;
  const { w, hud, dialogue, input, ui, ctx } = s;
  const wrongUsed = new Set(), seenAt = new Map();
  const zone = hud.joyZone;
  const pe = (type, x, y) => zone.dispatchEvent(new PointerEvent(type, { pointerId: 3, clientX: x, clientY: y, bubbles: true }));
  let dragging = false, stopped = false, taps = 0, earlyPressed = !pressEarlyOnce;
  const release = () => { if (dragging) { pe('pointerup', 100, 100); dragging = false; } };
  const tick = () => {
    if (stopped) return;
    const start = [...ui.querySelectorAll('.screen button')].find(b => b.textContent === '시작');
    if (start) { start.click(); return; }
    // 지도에서 고르기: mapPicks 순서대로 누르고, 마지막 것은 계속 누른다
    const place = picks.length && ui.querySelector(`.map-place[data-place="${picks[0]}"]`);
    if (place) { if (picks.length > 1) picks.shift(); place.click(); return; }
    // 카드 고르기: cardPicks에 든 카드만 누른다
    if (ui.querySelector('.screen.choose')) {
      const pick = [...ui.querySelectorAll('.screen.choose .order-card:not([disabled])')].find(b => cardPicks.has(b.textContent));
      if (pick) pick.click();
      return;
    }
    // 자리 놓기: 지금 놓을 물건 이름으로 places에서 자리를 찾아 누른다
    const now = ui.querySelector('.place-now');
    if (now) {
      const label = Object.keys(places).find(k => now.textContent.includes(k));
      const slot = label && ui.querySelector(`.place-slot[data-slot="${places[label]}"]:not([disabled])`);
      if (slot) slot.click();
      return;
    }
    // 카드 순서 맞추기: 이미 놓은 카드 수로 다음 카드를 찾아 누른다
    const cards = [...ui.querySelectorAll('.order-card:not([disabled])')];
    if (cards.length) {
      const placed = ui.querySelectorAll('.order-slots li').length;
      const texts = cards.map(b => b.textContent);
      const order = orders.find(o => texts.every(t => o.includes(t)));
      const next = order && cards.find(b => b.textContent === order[placed]);
      if (next) next.click();
      return;
    }
    // 획 따라 그리기: 지금 획의 점을 차례로 지나가도록 손가락을 끈다
    const board = ui.querySelector('.trace-board');
    if (board) {
      if (tracing) return;
      const dots = [...board.querySelectorAll('.trace-dot')];
      if (!dots.length) return;
      tracing = true;
      const r = board.querySelector('svg').getBoundingClientRect();
      const at = (type, d) => board.dispatchEvent(new PointerEvent(type, { pointerId: 4, bubbles: true, clientX: r.left + d.getAttribute('cx') / 100 * r.width, clientY: r.top + d.getAttribute('cy') / 100 * r.height }));
      const pts = dots.map(d => d);
      at('pointerdown', pts[0]);
      for (const d of pts.slice(1)) at('pointermove', d);
      at('pointerup', pts[pts.length - 1]);
      tracing = false;
      return;
    }
    if (dialogue.isOpen()) {
      release();
      if (dialogue.isChoosing()) {
        const buttons = [...ui.querySelectorAll('.dlg-choices button')];
        const texts = buttons.map(b => b.querySelector('.txt').textContent);
        let i = texts.findIndex(t => answers.has(t));
        const key = texts.join('|');
        if (!seenAt.has(key)) seenAt.set(key, performance.now());
        if (performance.now() - seenAt.get(key) < 300) return; // 열린 직후의 탭은 대화창이 무시한다
        if (wrongFirst.has(texts[i]) && !wrongUsed.has(key)) { wrongUsed.add(key); i = (i + 1) % buttons.length; }
        buttons[i].click();
        seenAt.delete(key);
      } else ui.querySelector('.dlg').click();
    } else {
      const target = !noTaps() && [...ui.querySelectorAll('.tap-target')].find(b => !b.hidden);
      if (target) target.click();
      const big = ui.querySelector('.big-action');
      if (big && (ctx.testHooks.ready || !earlyPressed)) { earlyPressed = true; big.click(); }
      const g = w.getGoal();
      if (g && w.camMode === 'follow' && !holdStill()) {
        const p = w.player.position, dx = g.x - p.x, dz = g.z - p.z, d = Math.hypot(dx, dz);
        if (d > 1.2) {
          if (!dragging) { pe('pointerdown', 100, 100); dragging = true; }
          pe('pointermove', 100 + (dx / d) * 40, 100 + (dz / d) * 40);
        } else {
          release();
          if (!hud.talkBtn.disabled) { hud.talkBtn.click(); taps += 1; }
        }
      } else release();
    }
    w.step(1 / 20, dialogue.isOpen() ? { x: 0, z: 0 } : input.move());
  };
  const timer = setInterval(tick, 15);
  return { stop() { stopped = true; clearInterval(timer); release(); }, get taps() { return taps; } };
}
