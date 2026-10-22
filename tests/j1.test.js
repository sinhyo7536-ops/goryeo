import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import j1Script from '../chapters/joseon/j1/script.js';
import { buildJ1Scene } from '../chapters/joseon/j1/scene.js';
import j1 from '../chapters/joseon/j1/chapter.js';
import { runChapter } from '../core/flow.js';
import { JOSEON, isUnlocked } from '../chapters/index.js';
import { testWorld, touchSetup, touchBot, memSave } from './bot.js';

const answers = new Set(j1Script.quizzes.map(q => q.options[q.answer]));
const cardPicks = new Set(j1Script.reasons.cards.filter(c => c.correct).map(c => c.text));
const places = { '경복궁': 'north', '종묘': 'east', '사직단': 'west' };

test('j1: script passes validation', () => eq(validateScript(j1Script, SOURCES), []));

test('j1: quiz answers and the four reasons match the spec', () => {
  eq(j1Script.quizzes.map(q => q.options[q.answer]), ['위화도', '한양']);
  eq(cardPicks.size, 4);
  eq(j1Script.reasons.cards.length, 6);
  ok(j1Script.intro.every(l => l.src.includes('S23')));
});

test('j1: chapter is open in 조선편 and loads', async () => {
  const meta = JOSEON[0];
  ok(meta.load, 'j1 has load');
  eq(isUnlocked(meta, { chapterResult: () => null }), true);
  eq((await meta.load()).default.id, 'j1');
});

test('j1: scene builds the camp with three people and a turning army', () => {
  const w = testWorld();
  try {
    const s = buildJ1Scene(w);
    eq([...w.npcs.keys()].sort(), ['archer', 'soldier', 'yiseonggye']);
    s.setTurn(0); const z0 = s.army.position.z; const r0 = s.army.children[0].rotation.y;
    s.setTurn(1); const z1 = s.army.position.z;
    ok(z1 > z0 + 20, `army crosses south ${z0} → ${z1}`);
    ok(Math.abs(r0 - Math.PI) < 1e-6 && s.army.children[0].rotation.y === 0, 'army turns around');
  } finally { w.dispose(); }
});

test('j1: completes with touch-only actions', async () => {
  const s = touchSetup(j1Script.speakers);
  const bot = touchBot(s, { answers, cardPicks, places });
  try {
    const r = await runChapter(JOSEON[0], j1, s.ctx, memSave());
    eq(r.quizCorrect, 2);
    eq(r.firstTryCorrect, 2);
    eq(r.stars, 3);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

test('j1: a wrong card fails with a hint, then retry succeeds', async () => {
  const s = touchSetup(j1Script.speakers);
  const said = [];
  const say = s.dialogue.say;
  s.dialogue.say = l => { said.push(l.text); return say(l); };
  const picks = new Set([...cardPicks, '명나라 군사가 고려보다 적다']);
  let wrongOnce = true;
  const bot = touchBot(s, { answers, cardPicks: picks, places });
  // 처음 한 번만 틀린 카드를 고르게 하고, 그다음에는 맞는 카드만
  const off = s.w.onUpdate(() => { if (wrongOnce && said.includes(j1Script.reasons.fail)) { wrongOnce = false; picks.delete('명나라 군사가 고려보다 적다'); } });
  try {
    j1.buildScene(s.w, s.ctx);
    j1.enterStage(s.ctx, 'minigame');
    const r = await j1.minigame(s.ctx);
    ok(said.includes(j1Script.reasons.fail), 'hint shown');
    eq(r.firstTryCorrect, 1, 'cards failed the first time, board right the first time');
    eq(r.easyModeUsed, false);
  } finally { off(); bot.stop(); s.done(); }
}, { timeout: 150000 });

test('j1: resume at quiz shows the army already gone south', () => {
  const s = touchSetup(j1Script.speakers);
  try {
    const sc = j1.buildScene(s.w, s.ctx);
    j1.enterStage(s.ctx, 'quiz');
    ok(sc.army.position.z > 20, 'army crossed');
  } finally { s.done(); }
});
