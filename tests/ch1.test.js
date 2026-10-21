import { test, eq, ok } from './harness.js';
import { createWorld } from '../core/world.js';
import { buildCh1Scene } from '../chapters/ch1/scene.js';

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

test('ch1: scene builds with 4 npcs and hidden pillars', () => {
  const w = testWorld();
  const s = buildCh1Scene(w);
  eq([...w.npcs.keys()].sort(), ['archer', 'officer', 'seohui', 'soldier']);
  eq(s.gangdongPillars.visible, false);
  eq(s.gangdongPillars.children.filter(c => c.isSprite).length, 6);
  ok(s.khitanGroup.children.length > 0);
  eq(w.bounds, { x0: -30.8, x1: 30.8, z0: -14.4, z1: 22 });
  w.dispose();
});

test('ch1: player can reach the ferry from the start', () => {
  const w = testWorld();
  const s = buildCh1Scene(w);
  w.player.position.set(0, 0, 19);
  for (let i = 0; i < 600; i++) {
    const dx = s.ferry.x - w.player.position.x, dz = s.ferry.z - w.player.position.z, d = Math.hypot(dx, dz);
    if (d < s.ferry.r) break;
    w.step(1 / 30, { x: dx / d, z: dz / d });
  }
  ok(Math.hypot(s.ferry.x - w.player.position.x, s.ferry.z - w.player.position.z) < s.ferry.r, 'ferry reached');
  w.dispose();
});

test('ch1: low quality scene builds with flat water and fewer embers', () => {
  const lo = testWorld('low'); const a = buildCh1Scene(lo);
  const hi = testWorld('high'); const b = buildCh1Scene(hi);
  ok(a.emberCount < b.emberCount, `${a.emberCount} < ${b.emberCount}`);
  lo.dispose(); hi.dispose();
});

// ---- 1장 대사와 진행 ----
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import ch1Script from '../chapters/ch1/script.js';
import ch1 from '../chapters/ch1/chapter.js';
import { createHud } from '../core/screens.js';
import { createInput } from '../core/input.js';
import { createDialogue } from '../core/dialogue.js';
import { runChapter } from '../core/flow.js';
import { createStorage } from '../core/storage.js';
import { createSave } from '../core/save.js';
import { CHAPTERS } from '../chapters/index.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

test('ch1: script passes validation', () => eq(validateScript(ch1Script, SOURCES), []));

test('ch1: correct answers use the exact sentences', () => {
  eq(ch1Script.negotiation.q1.options.find(o => o.correct).text, '고려는 고구려를 이은 나라이다.');
  eq(ch1Script.negotiation.q2.options.find(o => o.correct).text, '여진이 길을 막고 있어서 거란과 교류를 할 수 없다.');
  eq(ch1Script.negotiation.q2.prompt.text, '고려는 왜 가까운 거란과 친하게 지내지 않느냐?');
  eq(ch1Script.quizzes.length, 2);
});

// 터치만 쓰는 학생처럼: 조이스틱을 끌고, 대화 버튼과 대화창과 선택지 버튼만 누른다.
function touchBot(w, hud, dialogue, { wrongFirst = new Set() } = {}) {
  const correct = new Set([
    ...[ch1Script.negotiation.q1, ch1Script.negotiation.q2].map(c => c.options.find(o => o.correct).text),
    ...ch1Script.quizzes.map(q => q.options[q.answer]),
  ]);
  const wrongUsed = new Set(), seenAt = new Map();
  const zone = hud.joyZone;
  const pe = (type, x, y) => zone.dispatchEvent(new PointerEvent(type, { pointerId: 3, clientX: x, clientY: y, bubbles: true }));
  let dragging = false, stopped = false, taps = 0;
  const tick = () => {
    if (stopped) return;
    if (dialogue.isOpen()) {
      if (dragging) { pe('pointerup', 100, 100); dragging = false; }
      if (dialogue.isChoosing()) {
        const buttons = [...document.querySelectorAll('.dlg-choices button')];
        const texts = buttons.map(b => b.querySelector('.txt').textContent);
        let i = texts.findIndex(t => correct.has(t));
        const key = texts.join('|');
        if (!seenAt.has(key)) seenAt.set(key, performance.now());
        if (performance.now() - seenAt.get(key) < 300) return; // 열린 직후의 탭은 대화창이 무시한다
        if (wrongFirst.has(texts[i]) && !wrongUsed.has(key)) { wrongUsed.add(key); i = (i + 1) % buttons.length; }
        buttons[i].click();
        seenAt.delete(key);
      } else document.querySelector('.dlg').click();
    } else {
      const g = w.getGoal();
      if (g) {
        const p = w.player.position, dx = g.x - p.x, dz = g.z - p.z, d = Math.hypot(dx, dz);
        if (d > 1.2) {
          if (!dragging) { pe('pointerdown', 100, 100); dragging = true; }
          pe('pointermove', 100 + (dx / d) * 40, 100 + (dz / d) * 40);
        } else {
          if (dragging) { pe('pointerup', 100, 100); dragging = false; }
          if (!hud.talkBtn.disabled) { hud.talkBtn.click(); taps += 1; }
        }
      }
    }
    w.step(1 / 20, dialogue.isOpen() ? { x: 0, z: 0 } : ctxInput.move());
  };
  let ctxInput;
  const timer = setInterval(tick, 15);
  return { setInput(i) { ctxInput = i; }, stop() { stopped = true; clearInterval(timer); }, get taps() { return taps; } };
}

function touchSetup() {
  const w = testWorld();
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const hud = createHud(ui, { touch: true });
  hud.attachCamera(w.camera);
  const input = createInput({ target: window, joyZone: hud.joyZone, actionButton: hud.talkBtn });
  const dialogue = createDialogue(ui, ch1Script.speakers, { typeMs: 1 });
  const actions = new Set();
  input.onAction(() => { if (dialogue.isOpen()) { if (!dialogue.isChoosing()) dialogue.advance(); return; } actions.forEach(f => f()); });
  const ctx = {
    world: w, input, hud, dialogue, audio: { play() {} },
    setGoal: t => hud.setGoal(t), wait: ms => sleep(Math.min(ms, 30)), fade: async () => {},
    onAction(fn) { actions.add(fn); return () => actions.delete(fn); },
    screens: { showIntroCard: async () => {} },
  };
  hud.joyZone.hidden = false; hud.talkBtn.hidden = false;
  Object.assign(hud.joyZone.style, { width: '300px', height: '300px', left: '0', top: '0', bottom: 'auto' });
  return { w, ui, hud, input, dialogue, ctx, done() { input.dispose(); dialogue.dispose(); ui.remove(); w.dispose(); } };
}
function memSave() {
  const m = new Map();
  return createSave(createStorage({ getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }));
}

test('ch1: completes with touch-only actions', async () => {
  const s = touchSetup();
  const bot = touchBot(s.w, s.hud, s.dialogue); bot.setInput(s.input);
  try {
    const r = await runChapter(CHAPTERS[0], ch1, s.ctx, memSave());
    eq(r.firstTryTotal, 2);
    eq(r.firstTryCorrect, 2);
    eq(r.quizCorrect, 2);
    eq(r.stars, 3);
    ok(bot.taps >= 2, 'talked through the touch button');
  } finally { bot.stop(); s.done(); }
}, { timeout: 90000 });

test('ch1: wrong first answer gives hint and lowers firstTryCorrect', async () => {
  const s = touchSetup();
  const bot = touchBot(s.w, s.hud, s.dialogue, { wrongFirst: new Set(['고려는 고구려를 이은 나라이다.']) }); bot.setInput(s.input);
  try {
    ch1.buildScene(s.w, s.ctx);
    const r = await ch1.minigame(s.ctx);
    eq(r, { firstTryCorrect: 1, firstTryTotal: 2, easyModeUsed: false });
  } finally { bot.stop(); s.done(); }
}, { timeout: 60000 });
