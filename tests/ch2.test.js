import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import { runChapter } from '../core/flow.js';
import { CHAPTERS } from '../chapters/index.js';
import ch2Script from '../chapters/ch2/script.js';
import ch2 from '../chapters/ch2/chapter.js';
import { buildCh2Scene } from '../chapters/ch2/scene.js';
import { testWorld, touchSetup, touchBot, memSave, sleep } from './bot.js';

const answers = new Set(ch2Script.quizzes.map(q => q.options[q.answer]));

test('ch2: script passes validation', () => eq(validateScript(ch2Script, SOURCES), []));

test('ch2: quiz answers match the spec', () => {
  eq(ch2Script.quizzes.map(q => q.options[q.answer]), ['양규', '끌려가던 백성을 구했다']);
});

test('ch2: scene builds with 3 npcs and 6 ladder slots', () => {
  const w = testWorld();
  const s = buildCh2Scene(w);
  eq([...w.npcs.keys()].sort(), ['soldier', 'villager', 'yanggyu']);
  eq(s.ladders.length, 6);
  ok(s.ladders.every(l => !l.group.visible), 'ladders start hidden');
  eq(s.captives.length, 6);
  w.dispose();
});

test('ch2: completes with touch-only actions', async () => {
  const s = touchSetup(ch2Script.speakers);
  const bot = touchBot(s, { answers });
  try {
    const r = await runChapter(CHAPTERS[1], ch2, s.ctx, memSave());
    eq(r.quizCorrect, 2);
    eq(r.easyModeUsed, false);
    eq(r.stars, 3);
    eq(r.firstTryTotal, 0);
  } finally { bot.stop(); s.done(); }
}, { timeout: 120000 });

test('ch2: resume at minigame starts the wall defense', async () => {
  const s = touchSetup(ch2Script.speakers);
  try {
    ch2.buildScene(s.w, s.ctx);
    ch2.enterStage(s.ctx, 'minigame');
    ch2.minigame(s.ctx); // 끝까지 기다리지 않는다
    await sleep(100);
    eq(s.w.camMode, 'fixed');
    ok(s.ui.textContent.includes('성벽 방어'), 'how-to card for the wall');
  } finally { s.done(); }
});

test('ch2: failing the wall three times turns on easy mode', async () => {
  const s = touchSetup(ch2Script.speakers);
  const bot = touchBot(s, { answers, noTaps: () => (s.ctx.testHooks.wallAttempts || 0) <= 3 });
  try {
    ch2.buildScene(s.w, s.ctx);
    const r = await ch2.minigame(s.ctx);
    eq(s.ctx.testHooks.wallAttempts, 4);
    eq(r.easyModeUsed, true);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

import { roam } from '../core/flow.js';
test('roam: a zone that becomes active while the player stands in it fires', async () => {
  const s = touchSetup(ch2Script.speakers);
  try {
    let active = false, fired = 0;
    s.w.player.position.set(0, 0, 0);
    const stop = roam(s.ctx, { onTalk: async () => {}, zones: [{ x: 0, z: 0, r: 2, active: () => active, onEnter: () => { fired += 1; } }] });
    s.w.step(0.016, { x: 0, z: 0 });
    eq(fired, 0);
    active = true;
    s.w.step(0.016, { x: 0, z: 0 });
    eq(fired, 1);
    stop();
  } finally { s.done(); }
});

test('ch2: a ladder is carried in and raised by a Khitan soldier before anyone climbs', async () => {
  const s = touchSetup(ch2Script.speakers);
  try {
    const sc = ch2.buildScene(s.w, s.ctx);
    ch2.minigame(s.ctx); // 끝까지 기다리지 않는다
    await sleep(50);
    s.ui.querySelector('.screen.howto button.primary').click(); // 방법 카드 '시작'
    await sleep(20);
    eq(sc.khitan.visible, false, 'Khitan camp cleared so ladders are visible');
    // 첫 사다리가 나오는 순간까지 시간을 보낸다
    let l = null;
    for (let i = 0; i < 40 && !l; i++) { s.w.step(0.05, { x: 0, z: 0 }); l = sc.ladders.find(x => x.group.visible); }
    ok(l, 'a ladder appeared');
    ok(l.carrier.visible, 'a soldier is raising it');
    const start = l.pivot.rotation.x;
    ok(start < l.tilt - 0.3, `ladder starts leaning back (${start} vs ${l.tilt})`);
    ok(l.climber.visible === false || l.climber.position.y < 0.01, 'nobody climbs while it is raised');
    for (let i = 0; i < 20; i++) s.w.step(0.05, { x: 0, z: 0 });
    ok(Math.abs(l.pivot.rotation.x - l.tilt) < 1e-6, 'ladder ends against the wall');
    for (let i = 0; i < 20; i++) s.w.step(0.05, { x: 0, z: 0 });
    ok(l.climber.visible && l.climber.position.y > 0.1, 'then a soldier climbs');
    const btn = [...s.ui.querySelectorAll('.tap-target')].find(b => !b.hidden);
    ok(btn && Number(btn.style.getPropertyValue('--p')) > 0, 'push button shows how high the climber is');
  } finally { s.done(); }
}, { timeout: 20000 });

import * as THREE from 'three';
test('ch2: all six ladders (base and top) are on screen at any screen shape', async () => {
  for (const aspect of [0.6, 0.75, 1, 1.33, 1.78, 2.2]) {
    const s = touchSetup(ch2Script.speakers);
    try {
      const sc = ch2.buildScene(s.w, s.ctx);
      s.w.camera.aspect = aspect; s.w.camera.updateProjectionMatrix();
      ch2.minigame(s.ctx); // 성벽 방어 카메라까지만 본다
      await sleep(30);
      s.w.step(0.016, { x: 0, z: 0 });
      s.w.camera.updateMatrixWorld();
      const v = new THREE.Vector3();
      for (const l of sc.ladders) {
        l.group.visible = true; l.group.updateMatrixWorld(true);
        for (const p of [l.group.getWorldPosition(new THREE.Vector3()), l.top.getWorldPosition(new THREE.Vector3())]) {
          v.copy(p).project(s.w.camera);
          ok(Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.92, `aspect ${aspect}, ladder ${l.x}: ${v.x.toFixed(2)}, ${v.y.toFixed(2)}`);
        }
      }
    } finally { s.done(); }
  }
}, { timeout: 30000 });
