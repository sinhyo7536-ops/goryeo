import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import { LOOKS } from '../content/characters.js';
import ch4Script from '../chapters/ch4/script.js';
import { buildCh4Scene } from '../chapters/ch4/scene.js';
import { testWorld } from './bot.js';

test('ch4: script passes validation', () => eq(validateScript(ch4Script, SOURCES), []));

test('ch4: quiz answers and capital reason match the spec', () => {
  eq(ch4Script.quizzes.map(q => q.options[q.answer]), ['몽골군이 바다와 물에서 싸우는 데 약해서', '김윤후']);
  eq(ch4Script.capital.reason.options.find(o => o.correct).text, '몽골군은 바다와 물에서 싸우는 데 약했다');
  for (const [id, sp] of Object.entries(ch4Script.speakers)) if (id !== 'guide') ok(LOOKS[sp.look], id);
});

test('ch4: scene builds with npcs and areas', () => {
  const w = testWorld();
  const s = buildCh4Scene(w);
  ok(w.npcs.has('minister') && w.npcs.has('kimyunhu'), 'npcs');
  ok(s.areas.palace && s.areas.ganghwa && s.areas.cheoin && s.areas.chungju, 'four areas');
  eq(s.mongols.length, 8);
  ok(s.mongols.every(m => !m.group.visible), 'attackers start hidden');
  eq(s.documents.visible, true);
  w.dispose();
});

import * as THREE from 'three';
import ch4 from '../chapters/ch4/chapter.js';
import { runChapter } from '../core/flow.js';
import { CHAPTERS } from '../chapters/index.js';
import { touchSetup, touchBot, memSave, sleep } from './bot.js';
const answers = new Set([...ch4Script.quizzes.map(q => q.options[q.answer]), ch4Script.capital.reason.options.find(o => o.correct).text]);

test('ch4: completes with touch-only actions', async () => {
  const s = touchSetup(ch4Script.speakers);
  const bot = touchBot(s, { answers, mapPicks: ['ganghwa'] });
  try {
    const r = await runChapter(CHAPTERS[3], ch4, s.ctx, memSave());
    eq(r.quizCorrect, 2); eq(r.easyModeUsed, false); eq(r.stars, 3);
    eq(r.firstTryTotal, 1); eq(r.firstTryCorrect, 1);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

test('ch4: picking 개경 first gives a hint and retries', async () => {
  const s = touchSetup(ch4Script.speakers);
  const said = [];
  const say = s.dialogue.say; s.dialogue.say = l => { said.push(l.text); return say(l); };
  const bot = touchBot(s, { answers, mapPicks: ['gaegyeong', 'ganghwa'] });
  try {
    ch4.buildScene(s.w, s.ctx);
    await ch4.minigame(s.ctx);
    ok(said.includes(ch4Script.capital.places[0].hint), 'hint for 개경');
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

test('ch4: approaching Mongols are on screen at any screen shape', () => {
  for (const aspect of [0.6, 0.75, 1, 1.33, 1.78, 2.2]) {
    const s = touchSetup(ch4Script.speakers);
    try {
      const sc = ch4.buildScene(s.w, s.ctx);
      s.w.camera.aspect = aspect;
      const f = sc.areas.cheoin.fit;
      s.w.fitFixedCamera(f.target, f.dir, f.points);
      s.w.camera.updateMatrixWorld();
      const v = new THREE.Vector3();
      for (const p of f.points) { v.set(...p).project(s.w.camera); ok(Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.92, `aspect ${aspect}: ${v.x.toFixed(2)},${v.y.toFixed(2)}`); }
    } finally { s.done(); }
  }
});

test('ch4: map and reason hints make no unsourced claims', () => {
  const hints = [...ch4Script.capital.places.map(p => p.hint), ...ch4Script.capital.reason.options.map(o => o.hint)].filter(Boolean);
  ok(!hints.some(h => h.includes('넓은 땅')), 'no claim about the size of Ganghwa');
});
