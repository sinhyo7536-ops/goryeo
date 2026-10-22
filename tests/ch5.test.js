import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import { LOOKS } from '../content/characters.js';
import { runChapter } from '../core/flow.js';
import { CHAPTERS } from '../chapters/index.js';
import ch5Script from '../chapters/ch5/script.js';
import ch5 from '../chapters/ch5/chapter.js';
import { buildCh5Scene } from '../chapters/ch5/scene.js';
import { testWorld, touchSetup, touchBot, memSave } from './bot.js';

const answers = new Set(ch5Script.quizzes.map(q => q.options[q.answer]));

test('ch5: script passes validation', () => {
  eq(validateScript(ch5Script, SOURCES), []);
  for (const [id, sp] of Object.entries(ch5Script.speakers)) if (id !== 'guide') ok(LOOKS[sp.look], id);
});

test('ch5: card order matches the spec', () => {
  eq(ch5Script.making.cards, ['나무를 바닷물에 담그기', '소금물에 삶기', '그늘에서 말리기', '글자 새기기', '마구리(모서리를 구리판으로 고정)', '옻칠하기']);
  eq(ch5Script.quizzes.map(q => q.options[q.answer]), ['부처의 힘으로 몽골의 침입을 물리치려고', '벌레가 먹지 않도록']);
  eq(ch5Script.carving.glyphs.map(g => g.glyph), ['一', '十', '大']);
});

test('ch5: scene builds with four artisans in front of the start', () => {
  const w = testWorld();
  const s = buildCh5Scene(w);
  const artisans = ['artisan1', 'artisan2', 'artisan3', 'artisan4'];
  for (const id of artisans) ok(w.npcs.has(id), id);
  ok(artisans.every(id => w.npcs.get(id).mesh.position.z < s.start[1]), 'all ahead of the player');
  w.dispose();
});

test('ch5: completes with touch-only actions', async () => {
  const s = touchSetup(ch5Script.speakers);
  const bot = touchBot(s, { answers, orders: [ch5Script.making.cards] });
  try {
    const r = await runChapter(CHAPTERS[4], ch5, s.ctx, memSave());
    eq(r.quizCorrect, 2); eq(r.easyModeUsed, false); eq(r.stars, 3);
  } finally { bot.stop(); s.done(); }
}, { timeout: 150000 });
