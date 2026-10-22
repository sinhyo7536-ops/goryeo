import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import j4Script from '../chapters/joseon/j4/script.js';
import { buildJ4Scene, STRAIT_Z } from '../chapters/joseon/j4/scene.js';
import j4, { WING_BOARD } from '../chapters/joseon/j4/chapter.js';
import { runChapter } from '../core/flow.js';
import { JOSEON } from '../chapters/index.js';
import { testWorld, touchSetup, touchBot, memSave } from './bot.js';

const answers = new Set(j4Script.quizzes.map(q => q.options[q.answer]));
const places = { '판옥선': ['w1', 'w2', 'w3', 'w4', 'w5'] };

test('j4: script passes validation', () => eq(validateScript(j4Script, SOURCES), []));

test('j4: quiz answers match the spec and the turtle ship is not placed at 한산도', () => {
  eq(j4Script.quizzes.map(q => q.options[q.answer]), ['학익진', '의병']);
  const all = JSON.stringify(j4Script);
  ok(!/거북선[^"]*한산도|한산도[^"]*거북선/.test(all), 'no 거북선 at 한산도 claim');
  ok(j4Script.result[0].src.includes('S35'));
});

test('j4: wing board has five curved spots and three wrong back-row spots', () => {
  eq(WING_BOARD.slots.filter(s => s.answer === 'ship').length, 5);
  eq(WING_BOARD.slots.filter(s => s.answer === null).length, 3);
  const wing = WING_BOARD.slots.filter(s => s.answer === 'ship');
  ok(wing[2].xy[1] > wing[0].xy[1] && wing[2].xy[1] > wing[4].xy[1], 'middle is lower than the wing tips (a curve)');
});

test('j4: scene — harbor people, turtle ship, and the fleets move the right way', () => {
  const w = testWorld();
  try {
    const s = buildJ4Scene(w);
    eq([...w.npcs.keys()].sort(), ['commoner', 'navy', 'yisunsin']);
    ok(s.turtle, 'turtle ship at the dock');
    s.setStage('lure'); s.setLure(0); const a = s.lure.position.z; s.setLure(1);
    ok(s.lure.position.z < a && s.lure.position.z < STRAIT_Z, 'lure goes north into the strait');
    s.setChase(0); const e0 = s.enemy.position.z; s.setChase(1);
    ok(s.enemy.position.z > e0, 'enemy follows south into open sea');
    s.setStage('won');
    ok(s.enemy.children.every(e => e.userData.smoke.visible), 'smoke, no fire');
  } finally { w.dispose(); }
});

test('j4: completes with touch-only actions', async () => {
  const s = touchSetup(j4Script.speakers);
  const bot = touchBot(s, { answers, places });
  try {
    const r = await runChapter(JOSEON[3], j4, s.ctx, memSave());
    eq(r.quizCorrect, 2);
    eq(r.firstTryCorrect, 3);
    eq(r.stars, 3);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

test('j4: turning the lure ships too early gives the early hint', async () => {
  const s = touchSetup(j4Script.speakers);
  const said = [];
  const say = s.dialogue.say;
  s.dialogue.say = l => { said.push(l.text); return say(l); };
  const bot = touchBot(s, { answers, places, pressEarlyOnce: true });
  try {
    j4.buildScene(s.w, s.ctx);
    j4.enterStage(s.ctx, 'minigame');
    const r = await j4.minigame(s.ctx);
    ok(said.includes(j4Script.lure.early), 'early hint');
    eq(r.firstTryCorrect, 2);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });
