// 5장 「팔만대장경」: 장인 네 명의 이야기 → 경판 만드는 순서 맞추기 → 글자 새기기 → 퀴즈.
import { buildCh5Scene } from './scene.js';
import { roam } from '../../core/flow.js';
import { runWithRetries, traceGlyph, showHowTo } from '../../core/minigame.js';
import { PLAY } from '../kit/play.js';
import script from './script.js';

// 경판 만들기 작업장(마을에서 떨어진 x 400): 바닷가, 가마솥, 그늘, 작업대, 대장간, 옻칠 천막이 흩어져 있다.
// 작업 자리는 순서와 다르게 놓여 있어서, 학생이 차례를 떠올려 찾아가야 한다.
const WORKSHOP = {
  origin: [400, 0], ground: 'earth', groundColor: 0x8a7a5a, bounds: { x0: -20, x1: 20, z0: -18, z1: 16 },
  props: [
    { type: 'water', x: 0, z: -34, w: 120, d: 24 }, { type: 'rice', x: 13, z: -11, n: 3 },
    { type: 'tent', x: -14, z: -4, color: 0x8a7a62 }, { type: 'tree', x: 14, z: 6 }, { type: 'desk', x: -12, z: 9 },
    { type: 'tent', x: 8, z: 12, color: 0x6b4a32 }, { type: 'desk', x: 2, z: -3 },
  ],
};
const MAKING_SPOTS = [{ x: -4, z: -14 }, { x: -10, z: -2 }, { x: 11, z: 4 }, { x: -9, z: 11 }, { x: 4, z: 0 }, { x: 5, z: 12 }];

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
    await showHowTo(ctx.ui, {
      title: '경판 만들기',
      steps: ['작업장의 이름표를 경판 만드는 차례대로 찾아가요.', '가까이 가서 대화 버튼을 누르면 그 일을 해요.', '차례가 틀리면 처음부터 다시 해요.'],
      keyboard: 'W A S D 또는 방향키로 걷고, E로 일해요', touch: '화면 왼쪽을 끌어 걷고, 대화 버튼으로 일해요',
    });
    const making = { arena: WORKSHOP, from: [0, 14], counter: '마친 일', spots: script.making.cards.map((label, i) => ({ label, ...MAKING_SPOTS[i] })) };
    const a = await runWithRetries(ctx, easy => PLAY.stops(ctx, making, easy), { failHint: script.making.failHint });
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
