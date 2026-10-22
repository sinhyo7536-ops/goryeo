// 조선편 장들이 같이 쓰는 진행 도구: 차례대로 말 걸기 탐험, 미니게임 한 부분(다시 하기·첫 시도 기록), 플레이어 놓기.
import { roam } from '../../core/flow.js';
import { runWithRetries, actionButton } from '../../core/minigame.js';

export async function sayAll(dialogue, lines) { for (const l of lines) await dialogue.say(l); }

export function placePlayer(world, [x, z], ry = Math.PI) {
  world.player.visible = true;
  world.player.position.set(x, 0, z); world.player.rotation.y = ry;
  world.camMode = 'follow'; world.snapCamera();
}

// n번째 목표: 그 차례의 인물 머리 위에 느낌표, 바닥 화살표가 그 인물을 가리킨다.
export function setTalkStep(ctx, script, order, n) {
  const { world } = ctx;
  ctx.setGoal(script.goals[n]);
  order.forEach((id, i) => { world.npcs.get(id).mark.visible = n === i; });
  const t = order[n] && world.npcs.get(order[n]).mesh.position;
  world.setGoal(t ? { x: t.x, z: t.z } : null);
}

// 인물들에게 정해진 차례(order)대로 말을 걸면 끝난다. 차례보다 먼저 가면 tooEarly, 이미 들은 사람은 later.
// 다른 인물(order에 없는 사람)은 always를 말한다.
export async function talkInOrder(ctx, script, order, start) {
  const { world, dialogue } = ctx;
  placePlayer(world, start);
  let step = 0;
  setTalkStep(ctx, script, order, 0);
  await sayAll(dialogue, script.start);
  dialogue.close();
  ctx.input.enabled = true;
  await new Promise(resolve => {
    const stop = roam(ctx, {
      async onTalk(id) {
        const n = script.npc[id], idx = order.indexOf(id);
        if (idx < 0) await sayAll(dialogue, n.always);
        else if (idx === step) {
          await sayAll(dialogue, n.first);
          step += 1;
          if (step === order.length) { stop(); resolve(); return; }
          setTalkStep(ctx, script, order, step);
        } else if (idx > step) await sayAll(dialogue, n.tooEarly);
        else await sayAll(dialogue, n.later || n.first.slice(-1));
      },
    });
  });
}

// 미니게임 한 부분: attempt(easy)가 true가 될 때까지 다시 한다. 첫 시도에 성공했는지와 쉬운 모드를 썼는지 돌려준다.
export async function tryPart(ctx, attempt, failHint) {
  let tries = 0, first = false;
  const r = await runWithRetries(ctx, async easy => {
    tries += 1;
    const ok = await attempt(easy);
    if (ok && tries === 1) first = true;
    return ok;
  }, { failHint });
  return { first, easy: r.easyModeUsed };
}

// 여러 부분의 결과를 장 결과로 모은다
export function sumParts(parts) {
  return { firstTryCorrect: parts.filter(p => p.first).length, firstTryTotal: parts.length, easyModeUsed: parts.some(p => p.easy) };
}

// 때 맞춰 누르기: seconds 동안 진행도 k가 0→1로 가고(set(k)로 장면을 움직임), k가 window 안일 때 큰 버튼을 누르면 성공.
// 너무 일찍 누르면 fail.why = 'early', 끝까지 안 누르거나 늦으면 'late'. 테스트 봇은 ctx.testHooks.ready를 보고 누른다.
const GRACE = 0.4; // 버튼이 나온 뒤 처음 0.4초 동안의 누름은 무시한다
export function timingPress(ctx, { label, seconds, set, window: [lo, hi], fail }) {
  const { world } = ctx;
  const btn = actionButton(ctx, label);
  let t = 0, done = false;
  set(0);
  ctx.testHooks.armed = false;
  return new Promise(resolve => {
    const finish = ok => {
      if (done) return; done = true;
      off(); btn.remove(); ctx.testHooks.ready = false; ctx.testHooks.armed = undefined;
      resolve(ok);
    };
    const press = () => btn.wait().then(() => {
      if (done) return;
      if (t < GRACE) return press(); // 대화를 넘기다 잘못 누른 것은 세지 않는다
      const k = t / seconds;
      if (k < lo) { fail.why = 'early'; return finish(false); }
      if (k > hi) { fail.why = 'late'; return finish(false); }
      finish(true);
    });
    press();
    const off = world.onUpdate(dt => {
      if (done) return;
      t += dt;
      const k = Math.min(1, t / seconds);
      set(k);
      ctx.testHooks.ready = k >= lo + 0.02 && k <= hi - 0.02;
      ctx.testHooks.armed = t >= GRACE; // 테스트 봇: 이른 누름 시험은 이때부터
      if (k >= 1) { fail.why = 'late'; finish(false); }
    });
  });
}
