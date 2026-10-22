// 5장 「팔만대장경」: 장인 네 명의 이야기 → 경판 만드는 순서 맞추기 → 글자 새기기 → 퀴즈.
import { buildCh5Scene } from './scene.js';
import { roam } from '../../core/flow.js';
import { runWithRetries, orderCards, traceGlyph } from '../../core/minigame.js';
import script from './script.js';

const ARTISANS = ['artisan1', 'artisan2', 'artisan3', 'artisan4'];
let scene = null;

async function sayAll(dialogue, lines) { for (const l of lines) await dialogue.say(l); }

function placePlayer(world, [x, z], ry = Math.PI) {
  world.player.visible = true;
  world.player.position.set(x, 0, z); world.player.rotation.y = ry;
  world.camMode = 'follow'; world.snapCamera();
}

// 아직 이야기를 듣지 않은 장인 중 가장 가까운 사람을 목표로 한다
function markNext(ctx, heard) {
  const { world } = ctx;
  const p = world.player.position;
  let best = null, bd = Infinity;
  for (const id of ARTISANS) {
    const n = world.npcs.get(id);
    n.mark.visible = !heard.has(id);
    if (heard.has(id)) continue;
    const d = n.mesh.position.distanceTo(p);
    if (d < bd) { bd = d; best = n; }
  }
  world.setGoal(best ? { x: best.mesh.position.x, z: best.mesh.position.z } : null);
  ctx.hud.setCounter(`들은 이야기 ${heard.size}/4`);
}

export default {
  id: 'ch5',
  mood: 'morning',
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildCh5Scene(world); return scene; },

  enterStage(ctx, stage) {
    if (stage === 'minigame') placePlayer(ctx.world, scene.start);
    if (stage === 'quiz') { scene.library.visible = true; placePlayer(ctx.world, scene.start); ctx.setGoal(script.goals[3]); }
  },

  async explore(ctx) {
    const { world, dialogue } = ctx;
    placePlayer(world, scene.start);
    ctx.setGoal(script.goals[0]);
    const heard = new Set();
    markNext(ctx, heard);
    await sayAll(dialogue, script.start);
    dialogue.close();
    ctx.input.enabled = true;
    await new Promise(resolve => {
      const stop = roam(ctx, {
        async onTalk(id) {
          await sayAll(dialogue, script.npc[id]);
          if (ARTISANS.includes(id)) heard.add(id);
          markNext(ctx, heard);
          if (heard.size === ARTISANS.length) { ctx.hud.setCounter(null); stop(); resolve(); }
        },
      });
    });
  },

  async minigame(ctx) {
    const { dialogue, input } = ctx;
    input.enabled = false;
    ctx.setGoal(script.goals[1]);
    const a = await runWithRetries(ctx, easy => orderCards(ctx, { title: script.making.title, cards: script.making.cards, easy }), { failHint: script.making.failHint });
    ctx.audio.play('correct');

    ctx.setGoal(script.goals[2]);
    await sayAll(dialogue, script.carving.intro);
    dialogue.close();
    for (const g of script.carving.glyphs) await traceGlyph(ctx, g);
    ctx.audio.play('correct');

    await ctx.fade(true);
    scene.library.visible = true;
    placePlayer(ctx.world, scene.start);
    await ctx.fade(false);
    await sayAll(dialogue, script.result);
    ctx.setGoal(script.goals[3]);
    return { firstTryCorrect: 0, firstTryTotal: 0, easyModeUsed: a.easyModeUsed };
  },
};
