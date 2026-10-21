import { test, eq, ok } from './harness.js';
import * as THREE from 'three';
import { showHowTo, runWithRetries, createTapTargets, actionButton } from '../core/minigame.js';
import { createHud } from '../core/screens.js';
import { testWorld } from './bot.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
function fakeCtx() {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const said = [];
  const actions = new Set();
  const w = testWorld();
  const hud = createHud(ui, { touch: true });
  hud.attachCamera(w.camera);
  return {
    ui, world: w, hud, said, testHooks: {},
    dialogue: { say: async l => { said.push(l.text); }, close() {}, isOpen: () => false },
    onAction(fn) { actions.add(fn); return () => actions.delete(fn); },
    fire() { actions.forEach(f => f()); },
    done() { ui.remove(); w.dispose(); },
  };
}

test('minigame: third failure switches to easy mode', async () => {
  const ctx = fakeCtx();
  const results = [false, false, false, true], seen = [];
  const r = await runWithRetries(ctx, async easy => { seen.push(easy); return results.shift(); }, { failHint: '다시 해 보자' });
  eq(seen, [false, false, false, true]);
  eq(r, { easyModeUsed: true });
  eq(ctx.said.filter(t => t.startsWith('다시 해 보자')).length, 3);
  ok(ctx.said[2].includes('쉽게'), 'third hint announces easy mode');
  ctx.done();
});

test('minigame: success first time is not easy', async () => {
  const ctx = fakeCtx();
  eq(await runWithRetries(ctx, async () => true, { failHint: 'x' }), { easyModeUsed: false });
  ctx.done();
});

test('taps: a target counts once', async () => {
  const ctx = fakeCtx();
  const taps = createTapTargets(ctx);
  const obj = new THREE.Object3D(); obj.position.set(0, 1, 0); ctx.world.level.add(obj);
  let n = 0;
  taps.add(obj, { label: '밀기', onTap: () => { n += 1; } });
  ctx.world.step(1 / 30, { x: 0, z: 0 });
  const b = ctx.ui.querySelector('.tap-target');
  ok(b, 'button exists');
  b.click(); b.click();
  eq(n, 1);
  taps.clear();
  eq(ctx.ui.querySelectorAll('.tap-target').length, 0);
  ctx.done();
});

test('action: E key and click both press the big button', async () => {
  const ctx = fakeCtx();
  let a = actionButton(ctx, '둑 터뜨리기');
  let p = a.wait();
  ctx.ui.querySelector('.big-action').click();
  await p;
  a.remove();
  a = actionButton(ctx, '공격 신호');
  p = a.wait();
  ctx.fire();
  await p;
  a.remove();
  eq(ctx.ui.querySelectorAll('.big-action').length, 0);
  ctx.done();
});

test('howto: shows keyboard and touch lines and resolves on 시작', async () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const p = showHowTo(ui, { title: '성벽 방어', steps: ['사다리를 눌러 밀어내요'], keyboard: '마우스로 클릭', touch: '손가락으로 눌러요' });
  const t = ui.textContent;
  ok(t.includes('성벽 방어') && t.includes('마우스로 클릭') && t.includes('손가락으로 눌러요'));
  [...ui.querySelectorAll('button')].find(b => b.textContent.includes('시작')).click();
  await p;
  ui.remove();
});

test('hud: timer and counter show and hide', () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const hud = createHud(ui, { touch: false });
  hud.setTimer(45); hud.setCounter('막은 사다리 3');
  ok(ui.textContent.includes('45') && ui.textContent.includes('막은 사다리 3'));
  hud.setTimer(null); hud.setCounter(null);
  ok(ui.querySelector('.hud-timer').hidden && ui.querySelector('.hud-counter').hidden);
  ui.remove();
});

test('minigame: fail hint can depend on how the attempt failed', async () => {
  const ctx = fakeCtx();
  let why = '';
  const outcomes = ['early', 'late', 'ok'];
  await runWithRetries(ctx, async () => { why = outcomes.shift(); return why === 'ok'; }, { failHint: () => (why === 'early' ? '너무 일찍' : '너무 늦게') });
  eq(ctx.said, ['너무 일찍', '너무 늦게']);
  ctx.done();
});
