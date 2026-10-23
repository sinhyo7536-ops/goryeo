import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import j2Script from '../chapters/joseon/j2/script.js';
import { buildJ2Scene } from '../chapters/joseon/j2/scene.js';
import j2, { CONSONANTS, VOWELS, YARD, C_BINS } from '../chapters/joseon/j2/chapter.js';
import { runChapter } from '../core/flow.js';
import { JOSEON } from '../chapters/index.js';
import { testWorld, touchSetup, touchBot, memSave } from './bot.js';

const answers = new Set(j2Script.quizzes.map(q => q.options[q.answer]));
const places = { 'ㄱ': 'root', 'ㄴ': 'tongue', 'ㅁ': 'mouth', 'ㅅ': 'teeth', 'ㅇ': 'throat', 'ㆍ': 'sky', 'ㅡ': 'earth', 'ㅣ': 'person' };
const orders = [j2Script.strokes.cards, ...j2Script.words.map(w => w.cards)];

test('j2: script passes validation', () => eq(validateScript(j2Script, SOURCES), []));

test('j2: quiz answers and letter shapes match the spec (S27, S28)', () => {
  eq(j2Script.quizzes.map(q => q.options[q.answer]), ['세종', '혀가 윗잇몸에 붙는 모양']);
  const shape = id => CONSONANTS.slots.find(s => s.answer === id).label;
  eq([shape('g'), shape('n'), shape('m'), shape('s'), shape('o')], ['혀뿌리가 목구멍을 막는 모양', '혀가 윗잇몸에 붙는 모양', '입 모양', '이 모양', '목구멍 모양']);
  eq(VOWELS.slots.find(s => s.answer === 'dot').label.startsWith('하늘'), true);
  eq(j2Script.strokes.cards, ['ㄴ', 'ㄷ', 'ㅌ']);
  ok(j2Script.result[0].text.includes('1443') && j2Script.result[0].text.includes('1446'));
});

test('j2: scene builds a palace with three people, player is a palace kid', () => {
  const w = testWorld();
  try {
    buildJ2Scene(w);
    eq([...w.npcs.values()].filter(n => !n.spot).map(n => n.id).sort(), ['commoner', 'scholar', 'sejong']);
    ok(j2.player && j2.player.hat === 'topknot');
  } finally { w.dispose(); }
});

test('j2: completes with touch-only actions', async () => {
  const s = touchSetup(j2Script.speakers);
  const bot = touchBot(s, { answers, places, orders });
  try {
    const r = await runChapter(JOSEON[1], j2, s.ctx, memSave());
    eq(r.quizCorrect, 2);
    eq(r.firstTryCorrect, 5);
    eq(r.firstTryTotal, 5);
    eq(r.stars, 3);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });

test('j2: a wrong letter place fails with a hint and retries', async () => {
  const s = touchSetup(j2Script.speakers);
  const said = [];
  const say = s.dialogue.say;
  s.dialogue.say = l => { said.push(l.text); return say(l); };
  const bot = touchBot(s, { answers, places, orders });
  // 처음 한 번은 ㄱ을 '입 모양' 팻말로 가져가게 한다
  const mouth = C_BINS[CONSONANTS.slots.findIndex(sl => sl.id === 'mouth')];
  let wrongOnce = true;
  const off = s.w.onUpdate(() => {
    if (!wrongOnce) return;
    if (said.includes(j2Script.consonants.fail)) { wrongOnce = false; return; }
    if (s.ctx.testHooks.walkTo) s.ctx.testHooks.walkTo = { x: YARD.origin[0] + mouth.x, z: YARD.origin[1] + mouth.z };
  });
  try {
    j2.buildScene(s.w, s.ctx);
    j2.enterStage(s.ctx, 'minigame');
    const r = await j2.minigame(s.ctx);
    ok(said.includes(j2Script.consonants.fail), 'hint shown');
    eq(r.firstTryCorrect, 4);
  } finally { off(); bot.stop(); s.done(); }
}, { timeout: 150000 });

test('j2: intro says people found 한자 hard, not that no writing existed', () => {
  ok(!j2Script.intro[0].text.includes('방법이 없'), j2Script.intro[0].text);
  ok(j2Script.intro[0].text.includes('한자'));
});
