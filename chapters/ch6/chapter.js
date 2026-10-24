// 6장 「삼별초의 항쟁」: 강화도 포구 → 바닷길 항해(진도, 제주) → 마무리 인물 넣기 → 퀴즈.
import { buildCh6Scene } from './scene.js';
import { roam } from '../../core/flow.js';
import { showHowTo, runWithRetries, fitFigures } from '../../core/minigame.js';
import { portraitURL } from '../../core/faces.js';
import script from './script.js';

const CATCH_R = 2.4;
const CHASE_DELAY = 2.5;
let scene = null;

async function sayAll(dialogue, lines) { for (const l of lines) await dialogue.say(l); }

function placePlayer(world, [x, z], ry = Math.PI) {
  world.player.position.set(x, 0, z); world.player.rotation.y = ry;
  world.camMode = 'follow'; world.snapCamera();
}

// 바닷길 한 구간: 도착 원에 닿으면 성공, 추격선에 잡히면 실패.
function sailLeg(ctx, leg, easy) {
  const { world, hud, audio, input } = ctx;
  const speed = easy ? 2.2 : 3.6;
  let t = 0; // 출발 뒤 CHASE_DELAY초 동안은 추격선이 기다린다
  world.bounds = scene.seaBounds;
  scene.setSailing(true);
  placePlayer(world, leg.from);
  scene.ring.position.set(leg.to.x, 0.1, leg.to.z); scene.ring.visible = true;
  world.setGoal({ x: leg.to.x, z: leg.to.z });
  scene.pursuers.forEach((p, i) => { p.visible = true; p.position.set(leg.chasers[i][0], -0.3, leg.chasers[i][1]); });
  input.enabled = true;
  let done = false;
  return new Promise(resolve => {
    const finish = ok => {
      if (done) return; done = true;
      off(); input.enabled = false; input.releaseJoystick?.();
      scene.ring.visible = false; scene.pursuers.forEach(p => { p.visible = false; });
      world.setGoal(null); hud.setCounter(null);
      resolve(ok);
    };
    const off = world.onUpdate(dt => {
      if (done) return;
      const b = world.player.position;
      const left = Math.hypot(b.x - leg.to.x, b.z - leg.to.z);
      hud.setCounter(`${leg.name}까지 남은 뱃길: 노 젓기 ${Math.ceil(left / 2)}번`); // 바다에서는 걸음 대신 노 젓기로 센다
      if (left < leg.to.r) { audio.play('correct'); return finish(true); }
      t += dt;
      if (t < CHASE_DELAY) return;
      for (const p of scene.pursuers) {
        const dx = b.x - p.position.x, dz = b.z - p.position.z, d = Math.hypot(dx, dz);
        if (d < CATCH_R) { audio.play('wrong'); return finish(false); }
        p.position.x += (dx / d) * speed * dt; p.position.z += (dz / d) * speed * dt;
        p.rotation.y = Math.atan2(dx, dz);
      }
    });
  });
}

function showAftermath(ctx) {
  scene.setSailing(true);
  ctx.world.bounds = scene.seaBounds;
  placePlayer(ctx.world, [scene.legs[1].to.x, scene.legs[1].to.z + 4]);
  ctx.setGoal(script.goals[4]);
}

export default {
  id: 'ch6',
  mood: 'sea',
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildCh6Scene(world); return scene; },

  enterStage(ctx, stage) {
    if (stage === 'minigame') { ctx.world.bounds = scene.portBounds; scene.setSailing(false); placePlayer(ctx.world, scene.start); }
    if (stage === 'quiz') showAftermath(ctx);
  },

  async explore(ctx) {
    const { world, dialogue } = ctx;
    world.bounds = scene.portBounds;
    scene.setSailing(false);
    placePlayer(world, scene.start);
    ctx.setGoal(script.goals[0]);
    const bj = world.npcs.get('baejungson');
    bj.mark.visible = true;
    world.setGoal({ x: bj.mesh.position.x, z: bj.mesh.position.z });
    await sayAll(dialogue, script.start);
    dialogue.close();
    ctx.input.enabled = true;
    await new Promise(resolve => {
      const stop = roam(ctx, {
        async onTalk(id) {
          await sayAll(dialogue, script.npc[id] || []);
          if (id === 'baejungson') { bj.mark.visible = false; stop(); resolve(); }
        },
      });
    });
  },

  async minigame(ctx) {
    const { world, dialogue, input } = ctx;
    input.enabled = false;
    await showHowTo(ctx.ui, script.sail.howto);
    // 1. 강화도 → 진도
    ctx.setGoal(script.goals[1]);
    world.npcs.get('baejungson').mesh.visible = false; world.npcs.get('sambyeolcho').mesh.visible = false;
    const a = await runWithRetries(ctx, easy => sailLeg(ctx, scene.legs[0], easy), { failHint: script.sail.failHint });
    world.npcs.get('kimtongjeong').mesh.visible = true;
    await sayAll(dialogue, script.jindo);
    dialogue.close();
    world.npcs.get('kimtongjeong').mesh.visible = false;
    // 2. 진도 → 제주
    ctx.setGoal(script.goals[2]);
    const b = await runWithRetries(ctx, easy => sailLeg(ctx, scene.legs[1], easy), { failHint: script.sail.failHint });
    await sayAll(dialogue, script.jeju);
    dialogue.close();
    // 3. 마무리: 고려를 지킨 사람들을 그 사건의 원에 넣기
    ctx.setGoal(script.goals[3]);
    await sayAll(dialogue, script.fit.intro);
    dialogue.close();
    const F = script.fit, figures = F.figures.map(f => ({ ...f, face: portraitURL(f.look) }));
    const c = await runWithRetries(ctx, easy => fitFigures(ctx, { title: F.title, figures, circles: F.circles, easy, hint: F.failHint }), { failHint: F.failHint });
    await sayAll(dialogue, F.done); dialogue.close();
    showAftermath(ctx);
    return { firstTryCorrect: 0, firstTryTotal: 0, easyModeUsed: a.easyModeUsed || b.easyModeUsed || c.easyModeUsed };
  },
};
