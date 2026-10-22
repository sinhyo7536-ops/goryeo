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
