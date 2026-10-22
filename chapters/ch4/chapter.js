// 4장 「강화도 천도와 처인성·충주성」: 개경 → 도읍 고르기 → 강화도 → 처인성 방어 → 충주성 → 퀴즈.
import { buildCh4Scene } from './scene.js';
import { roam } from '../../core/flow.js';
import { showHowTo, runWithRetries, createTapTargets, pickOnMap } from '../../core/minigame.js';
import script from './script.js';

let scene = null;

async function sayAll(dialogue, lines) { for (const l of lines) await dialogue.say(l); }

function placePlayer(world, [x, z], ry = Math.PI) {
  world.player.visible = true;
  world.player.position.set(x, 0, z); world.player.rotation.y = ry;
  world.camMode = 'follow'; world.snapCamera();
}

// 처인성 방어 한 번: 40초 버티면 성공, 몽골군 3명이 성벽에 닿으면 실패.
function cheoinDefense(ctx, easy) {
  const { world, hud, audio } = ctx;
  const A = scene.areas.cheoin, [cx] = A.center;
  const spawnEvery = easy ? 2.6 : 1.6, speed = easy ? 1.4 : 2.4, duration = 40;
  const travel = A.spawnR - A.radius - 1;
  const taps = createTapTargets(ctx);
  for (const m of scene.mongols) m.group.visible = false;
  let t = 0, nextSpawn = 0.6, stopped = 0, breaches = 0, seed = 9, done = false;
  const active = new Map();
  return new Promise(resolve => {
    const finish = ok => {
      if (done) return; done = true;
      off(); taps.dispose(); for (const m of scene.mongols) m.group.visible = false;
      hud.setTimer(null); hud.setCounter(null); resolve(ok);
    };
    const off = world.onUpdate(dt => {
      if (done) return;
      t += dt;
      hud.setTimer(duration - t);
      hud.setCounter(`막은 몽골군 ${stopped} · 성벽에 닿은 적 ${breaches}/3`);
      if (t >= nextSpawn) {
        nextSpawn = t + spawnEvery;
        const free = scene.mongols.filter(m => !active.has(m));
        if (free.length) {
          seed = (seed * 16807) % 2147483647;
          const m = free[seed % free.length];
          const a = { d: 0 };
          m.group.visible = true;
          a.target = taps.add(m.top, {
            label: '활',
            onTap() { stopped += 1; audio.play('tap'); active.delete(m); taps.remove(a.target); m.group.visible = false; },
          });
          active.set(m, a);
        }
      }
      for (const [m, a] of active) {
        a.d += speed * dt;
        const r = A.spawnR - a.d;
        m.group.position.set(cx + Math.cos(m.angle) * r, 0, Math.sin(m.angle) * r);
        m.group.rotation.y = Math.atan2(-Math.cos(m.angle), -Math.sin(m.angle)); // 성 쪽을 바라본다
        a.target.btn.style.setProperty('--p', Math.min(1, a.d / travel).toFixed(3));
        if (a.d >= travel) {
          breaches += 1; audio.play('wrong');
          taps.remove(a.target); active.delete(m); m.group.visible = false;
          if (breaches >= 3) return finish(false);
        }
      }
      if (t >= duration) finish(true);
    });
  });
}

function showChungju(ctx) {
  const C = scene.areas.chungju;
  ctx.world.player.visible = false;
  ctx.world.setFixedCamera(C.cam.pos, C.cam.target);
  ctx.world.moveNpc('kimyunhu', C.kimyunhu[0], C.kimyunhu[1], C.kimyunhu[2]);
}

export default {
  id: 'ch4',
  mood: 'overcast',
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildCh4Scene(world); return scene; },

  enterStage(ctx, stage) {
    const P = scene.areas.palace;
    if (stage === 'minigame') { ctx.world.bounds = P.bounds; placePlayer(ctx.world, P.start); }
    if (stage === 'quiz') { showChungju(ctx); scene.documents.visible = false; scene.flames.forEach(f => { f.visible = true; }); ctx.setGoal(script.goals[4]); }
  },

  async explore(ctx) {
    const { world, dialogue } = ctx;
    const P = scene.areas.palace;
    world.bounds = P.bounds;
    placePlayer(world, P.start);
    ctx.setGoal(script.goals[0]);
    const minister = world.npcs.get('minister');
    minister.mark.visible = true;
    world.setGoal({ x: minister.mesh.position.x, z: minister.mesh.position.z });
    await sayAll(dialogue, script.start);
    dialogue.close();
    ctx.input.enabled = true;
    await new Promise(resolve => {
      const stop = roam(ctx, {
        async onTalk(id) {
          if (id !== 'minister') return;
          await sayAll(dialogue, script.npc.minister.first);
          minister.mark.visible = false; world.setGoal(null);
          stop(); resolve();
        },
      });
    });
  },

  async minigame(ctx) {
    const { world, dialogue, input } = ctx;
    input.enabled = false;
    // 1. 도읍을 어디로?
    ctx.setGoal(script.goals[1]);
    for (;;) {
      const id = await pickOnMap(ctx, script.capital);
      const place = script.capital.places.find(p => p.id === id);
      if (!place.hint) break;
      await dialogue.say({ who: 'guide', text: place.hint });
      dialogue.close();
    }
    const a = await dialogue.ask(script.capital.reason);
    await ctx.fade(true);
    world.player.visible = false;
    world.setFixedCamera(scene.areas.ganghwa.cam.pos, scene.areas.ganghwa.cam.target);
    await ctx.fade(false);
    await sayAll(dialogue, script.capital.done);
    dialogue.close();

    // 2. 처인성 방어
    ctx.setGoal(script.goals[2]);
    await ctx.fade(true);
    const f = scene.areas.cheoin.fit;
    world.fitFixedCamera(f.target, f.dir, f.points);
    world.scene.fog.near = 120; world.scene.fog.far = 400; // 멀리 있는 몽골군이 안개에 묻히지 않게
    await ctx.fade(false);
    await sayAll(dialogue, script.cheoin.intro);
    dialogue.close();
    await showHowTo(ctx.ui, script.cheoin.howto);
    const b = await runWithRetries(ctx, easy => cheoinDefense(ctx, easy), { failHint: script.cheoin.failHint });
    await sayAll(dialogue, script.cheoin.done);
    dialogue.close();

    // 3. 충주성
    world.setMood('overcast'); // 안개를 원래대로
    ctx.setGoal(script.goals[3]);
    await ctx.fade(true);
    showChungju(ctx);
    await ctx.fade(false);
    await dialogue.say(script.chungju[0]);
    scene.flames.forEach(fl => { fl.visible = true; }); scene.documents.visible = false; // 문서를 불태운다
    ctx.audio.play('whoosh');
    for (const l of script.chungju.slice(1)) await dialogue.say(l);
    ctx.setGoal(script.goals[4]);
    return { firstTryCorrect: a.firstTry ? 1 : 0, firstTryTotal: 1, easyModeUsed: b.easyModeUsed };
  },
};
