import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import ch3Script from '../chapters/ch3/script.js';
import { buildCh3Scene } from '../chapters/ch3/scene.js';
import { testWorld } from './bot.js';

test('ch3: script passes validation', () => eq(validateScript(ch3Script, SOURCES), []));

test('ch3: quiz answers match the spec', () => {
  eq(ch3Script.quizzes.map(q => q.options[q.answer]), ['귀주 대첩', '쇠가죽으로 물을 막았다가 터뜨리기']);
});

test('ch3: scene builds with 6 hides and a dam', () => {
  const w = testWorld();
  const s = buildCh3Scene(w);
  eq([...w.npcs.keys()].sort(), ['gangamchan', 'soldier']);
  eq(s.hides.length, 6);
  ok(s.hides.every(h => h.mesh.visible), 'hides visible');
  eq(s.damWall.visible, false);
  ok(s.dam.r > 0);
  // 강을 건너는 거란군: 진행도 0이면 북쪽 강둑, 1이면 남쪽 강둑
  s.river.setCross(0); const z0 = s.river.army.position.z;
  s.river.setCross(1); const z1 = s.river.army.position.z;
  ok(z0 < s.river.zNorth && z1 > s.river.zSouth, `${z0} → ${z1}`);
  w.dispose();
});
