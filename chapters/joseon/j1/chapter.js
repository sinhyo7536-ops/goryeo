// 조선편 1장 「위화도 회군과 조선 건국」: 위화도 진영 탐험 → 4불가론 카드 고르기 → 회군 장면 → 한양 배치 → 퀴즈.
import { buildJ1Scene } from './scene.js';
import { roam } from '../../../core/flow.js';
import { showHowTo, runWithRetries, chooseCards, placeOnBoard } from '../../../core/minigame.js';
import script from './script.js';

const NPC_ORDER = ['archer', 'soldier', 'yiseonggye'];
let scene = null;

async function sayAll(dialogue, lines) { for (const l of lines) await dialogue.say(l); }

function setStep(ctx, n) {
  const { world } = ctx;
  ctx.setGoal(script.goals[n]);
  NPC_ORDER.forEach((id, i) => { world.npcs.get(id).mark.visible = n === i; });
  const t = NPC_ORDER[n] && world.npcs.get(NPC_ORDER[n]).mesh.position;
  world.setGoal(t ? { x: t.x, z: t.z } : null);
}

function placePlayer(world, [x, z], ry = Math.PI) {
  world.player.position.set(x, 0, z); world.player.rotation.y = ry;
  world.camMode = 'follow'; world.snapCamera();
}

// 한양 판: 북쪽 산 아래 가운데, 동쪽(오른쪽), 서쪽(왼쪽), 그리고 헷갈리게 남쪽 빈자리
const HANYANG = {
  items: [{ id: 'palace', label: '경복궁(궁궐)' }, { id: 'jongmyo', label: '종묘' }, { id: 'sajik', label: '사직단' }],
  slots: [
    { id: 'north', xy: [50, 30], answer: 'palace' },
    { id: 'east', xy: [80, 56], answer: 'jongmyo' },
    { id: 'west', xy: [20, 56], answer: 'sajik' },
    { id: 'south', xy: [50, 80], answer: null },
  ],
  decor: [
    { label: '▲ 백악(북쪽 산)', xy: [50, 9] },
    { label: '서쪽 ←', xy: [9, 92] }, { label: '→ 동쪽', xy: [91, 92] }, { label: '↓ 남쪽', xy: [50, 95] },
  ],
};

export default {
  id: 'j1',
  mood: 'monsoon',
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildJ1Scene(world); return scene; },

  enterStage(ctx, stage) {
    if (stage === 'minigame') placePlayer(ctx.world, [0, 1.5]);
    if (stage === 'quiz') { scene.setTurn(1); placePlayer(ctx.world, [0, 1.5]); ctx.setGoal(script.goals[5]); }
  },

  async explore(ctx) {
    const { world, dialogue } = ctx;
    placePlayer(world, scene.start);
    let step = 0;
    setStep(ctx, 0);
    await sayAll(dialogue, script.start);
    dialogue.close();
    ctx.input.enabled = true;
    await new Promise(resolve => {
      const stop = roam(ctx, {
        async onTalk(id) {
          const n = script.npc[id], idx = NPC_ORDER.indexOf(id);
          if (idx === step) {
            await sayAll(dialogue, n.first);
            step += 1;
            if (step === NPC_ORDER.length) { stop(); resolve(); return; }
            setStep(ctx, step);
          } else if (idx > step) await sayAll(dialogue, n.tooEarly);
          else await sayAll(dialogue, n.later || n.first.slice(-1));
        },
      });
    });
  },

  async minigame(ctx) {
    const { world, dialogue, input } = ctx;
    input.enabled = false;
    setStep(ctx, 3);
    world.setGoal(null);
    // 1) 네 가지 까닭 고르기
    let tries = 0, firstTryCorrect = 0;
    await showHowTo(ctx.ui, {
      title: '이성계가 반대한 까닭',
      steps: ['카드 여섯 장 중에서 이성계와 군사들이 말한 까닭을 골라요.', '맞는 카드 네 장을 모두 고르면 성공이에요.', '틀린 카드를 누르면 처음부터 다시 해요.'],
      keyboard: '마우스로 카드를 눌러요', touch: '카드를 손가락으로 눌러요',
    });
    const a = await runWithRetries(ctx, async easy => {
      tries += 1;
      const ok = await chooseCards(ctx, { title: script.reasons.title, cards: script.reasons.cards, easy });
      if (ok && tries === 1) firstTryCorrect += 1;
      return ok;
    }, { failHint: script.reasons.fail });
    await sayAll(dialogue, script.reasons.done);
    dialogue.close();

    // 2) 회군: 군사들이 돌아서서 남쪽 물길을 건넌다
    await ctx.fade(true);
    placePlayer(world, [-3, 1.5]); // 군사들이 지나갈 동쪽 길에서 비켜 선다
    world.setFixedCamera(scene.turnCam.pos, scene.turnCam.target);
    scene.setTurn(0.05);
    await ctx.fade(false);
    ctx.audio.play('whoosh');
    await new Promise(resolve => {
      let t = 0.05;
      const off = world.onUpdate(dt => {
        t = Math.min(1, t + dt * 0.12);
        scene.setTurn(t);
        if (t >= 1) { off(); resolve(); }
      });
    });
    await sayAll(dialogue, script.turnback);
    dialogue.close();

    // 3) 새 도읍 한양 꾸미기
    setStep(ctx, 4);
    world.setGoal(null);
    await sayAll(dialogue, script.hanyang.howto);
    dialogue.close();
    tries = 0;
    const b = await runWithRetries(ctx, async easy => {
      tries += 1;
      const ok = await placeOnBoard(ctx, { title: script.hanyang.title, ...HANYANG, boardClass: 'map', easy });
      if (ok && tries === 1) firstTryCorrect += 1;
      return ok;
    }, { failHint: script.hanyang.fail });
    await sayAll(dialogue, script.hanyang.done);
    dialogue.close();

    await ctx.fade(true);
    placePlayer(world, [0, 1.5]);
    await ctx.fade(false);
    ctx.setGoal(script.goals[5]);
    return { firstTryCorrect, firstTryTotal: 2, easyModeUsed: a.easyModeUsed || b.easyModeUsed };
  },
};
