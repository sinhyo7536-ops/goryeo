// 근대·일제 강점기·현대편 장 공통 검사: 대본 출처, 장면(사람·안내판 자리), 터치만으로 끝까지 하기, 이어하기.
import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { validateScript } from '../core/content.js';
import { MODERN, COLONIAL, PRESENT, isUnlocked } from '../chapters/index.js';
import { runChapter } from '../core/flow.js';
import { testWorld, touchSetup, touchBot, memSave } from './bot.js';

const KIT = [...MODERN, ...COLONIAL, ...PRESENT];

// 대본의 미니게임 부분에서 봇이 누를 정답을 모은다
function botAnswers(script) {
  const cardPicks = new Set(), sortPicks = {}, places = {}, orders = [];
  for (const p of Object.values(script.parts || {})) {
    if (p.type === 'choose') p.cards.filter(c => c.correct).forEach(c => cardPicks.add(c.text));
    if (p.type === 'sort') p.cards.forEach(c => { sortPicks[c.text] = c.bin; });
    if (p.type === 'order') orders.push(p.cards);
    if (p.type === 'place') for (const it of p.items) places[it.label] = [...(places[it.label] || []), ...p.slots.filter(s => s.answer === it.id).map(s => s.id)];
  }
  return { answers: new Set(script.quizzes.map(q => q.options[q.answer])), cardPicks, sortPicks, places, orders };
}

for (const meta of KIT) {
  test(`kit: ${meta.id} script, scene and signs`, async () => {
    const mod = (await meta.load()).default;
    eq(mod.id, meta.id);
    eq(validateScript(mod.script, SOURCES), []);
    eq(mod.script.quizzes.length, 2);
    ok(mod.script.intro.every(l => l.src && l.src.length), 'intro is sourced');
    const w = testWorld();
    try {
      mod.buildScene(w);
      const people = [...w.npcs.values()].filter(n => !n.spot), signs = [...w.npcs.values()].filter(n => n.spot);
      ok(people.length >= 3, `${meta.id}: ${people.length} people`);
      ok(signs.length >= 2, `${meta.id}: ${signs.length} signs`);
      const b = w.bounds, inside = m => m.position.x >= b.x0 && m.position.x <= b.x1 && m.position.z >= b.z0 && m.position.z <= b.z1;
      for (const n of [...people, ...signs]) {
        ok(inside(n.mesh), `${meta.id}/${n.id} reachable`);
        for (const c of w.colliders) {
          if (c === n.collider) continue;
          const d = Math.hypot(c.x - n.mesh.position.x, c.z - n.mesh.position.z);
          ok(d >= c.r + 0.4, `${meta.id}/${n.id} stuck in something at (${c.x}, ${c.z})`);
        }
      }
      for (const s of signs) {
        ok(mod.script.npc[s.id] && mod.script.npc[s.id].always.length, `${meta.id}/${s.id} has lines`);
        for (const p of people) ok(Math.hypot(s.mesh.position.x - p.mesh.position.x, s.mesh.position.z - p.mesh.position.z) >= 3.5, `${meta.id}/${s.id} too close to ${p.id}`);
      }
      for (const id of Object.keys(mod.script.npc)) ok(w.npcs.has(id), `${meta.id}: script talks to ${id} who is in the scene`);
    } finally { w.dispose(); }
  });

  test(`kit: ${meta.id} completes with touch-only actions`, async () => {
    const mod = (await meta.load()).default;
    const s = touchSetup(mod.script.speakers);
    const bot = touchBot(s, botAnswers(mod.script));
    try {
      const r = await runChapter(meta, mod, s.ctx, memSave());
      eq(r.quizCorrect, 2);
      eq(r.easyModeUsed, false);
      eq(r.firstTryCorrect, r.firstTryTotal, 'every part right the first time');
      eq(r.stars, 3);
    } finally { bot.stop(); s.done(); }
  }, { timeout: 150000 });

  test(`kit: ${meta.id} resumes at the quiz`, async () => {
    const mod = (await meta.load()).default;
    const s = touchSetup(mod.script.speakers);
    try {
      mod.buildScene(s.w, s.ctx);
      mod.enterStage(s.ctx, 'quiz');
      ok(s.w.player.visible !== false);
    } finally { s.done(); }
  });
}

test('kit: every new course opens its first chapter', () => {
  for (const list of [MODERN, COLONIAL, PRESENT]) eq(isUnlocked(list[0], { chapterResult: () => null }), true);
});
