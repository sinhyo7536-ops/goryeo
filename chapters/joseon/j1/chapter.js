// 조선편 1장 「위화도 회군과 조선 건국」: 위화도 진영 탐험 → 4불가론 카드 고르기 → 회군 장면 → 한양 배치 → 퀴즈.
import { buildJ1Scene } from './scene.js';
import { roam } from '../../../core/flow.js';
import { showHowTo, runWithRetries } from '../../../core/minigame.js';
import { PLAY } from '../../kit/play.js';
import script from './script.js';

// 미니게임 무대(마을에서 떨어진 x 400)
// 1) 비 내리는 위화도 진영: 군사들이 하는 말(팻말) 가운데 이성계가 든 까닭을 찾는다
export const CAMP = {
  origin: [400, 0], ground: 'grass', groundColor: 0x55704a, bounds: { x0: -18, x1: 18, z0: -14, z1: 14 },
  props: [
    { type: 'water', x: 0, z: -36, w: 140, d: 30, color: 0x5a7a86 }, { type: 'water', x: 0, z: 34, w: 140, d: 30, color: 0x5a7a86 },
    { type: 'tent', x: -14, z: -9, color: 0xb8a888 }, { type: 'tent', x: 14, z: -9, color: 0xb8a888 }, { type: 'tent', x: 0, z: -12, color: 0x9a3a2a },
    { type: 'crowd', x: -3, z: -7, n: 4, cols: 4, looks: ['soldier'], face: Math.PI },
  ],
};
export const REASON_SPOTS = [{ x: -11, z: -2 }, { x: -6, z: 7 }, { x: 0, z: -1 }, { x: 11, z: -2 }, { x: 6, z: 7 }, { x: -12, z: 8 }];
// 맞는 까닭을 찾으면 그 말을 한 사람이 다시 말해 준다(카드 차례와 같은 자리)
const REASON_TALK = [
  [{ who: 'yiseonggye', text: '작은 나라가 큰 나라를 거스르는 것은 옳지 않소.' }], null,
  [{ who: 'soldier', text: '한창 농사철인 여름에 군사를 일으키면 백성이 힘들어요.' }],
  [{ who: 'archer', text: '우리가 북쪽으로 간 틈에 남쪽 바다로 왜구가 쳐들어올 거예요.' }], null,
  [{ who: 'archer', text: '장맛비에 활이 풀어지고, 병사들이 병에 걸리고 있어요.' }],
];
// 2) 새 도읍 한양 터: 북쪽에 백악(산), 동서남북 네 터에 궁궐·종묘·사직단을 가져다 놓는다
const HANYANG_SITE = {
  origin: [400, 0], ground: 'grass', groundColor: 0x6a8a4c, bounds: { x0: -20, x1: 20, z0: -18, z1: 16 },
  props: [{ type: 'island', x: 0, z: -30, r: 12, color: 0x4f6a3e, sand: 0x6a7a4c }, { type: 'wall', x: 0, z: 15, w: 40, h: 1.2 }],
};
const SITES = [{ id: 'north', label: '북쪽 터', x: 0, z: -11 }, { id: 'east', label: '동쪽 터', x: 12, z: -1 }, { id: 'west', label: '서쪽 터', x: -12, z: -1 }, { id: 'south', label: '남쪽 터', x: 0, z: 9 }];

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
export const HANYANG = {
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
      steps: ['비 내리는 진영의 팻말 여섯 개 중에서 이성계와 군사들이 말한 까닭을 찾아가요.', '맞는 팻말 네 개에 가서 대화 버튼을 누르면 성공이에요.', '틀린 팻말을 고르면 해설을 듣고 이어서 찾아요.'],
      keyboard: 'W A S D 또는 방향키로 걷고, E로 골라요', touch: '화면 왼쪽을 끌어 걷고, 대화 버튼으로 골라요',
    });
    const a = await runWithRetries(ctx, async easy => {
      tries += 1;
      const ok = await PLAY.find(ctx, { arena: CAMP, from: [0, 12], fail: script.reasons.fail, counter: '찾은 까닭', items: script.reasons.cards.map((c, i) => ({ ...c, look: i % 2 ? 'archer' : 'soldier', talk: REASON_TALK[i], ...REASON_SPOTS[i] })) }, easy);
      if (ok === true && tries === 1) firstTryCorrect += 1; // 틀렸다가 고쳐 끝낸 것('missed')은 첫 시도 성공이 아니다
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
      const ok = await PLAY.deliver(ctx, { arena: HANYANG_SITE, from: [0, 13], fail: script.hanyang.fail, counter: '놓은 곳', bins: SITES, cards: HANYANG.items.map(it => ({ text: it.label, bin: HANYANG.slots.find(s => s.answer === it.id).id })) }, easy);
      if (ok === true && tries === 1) firstTryCorrect += 1; // 틀렸다가 고쳐 끝낸 것('missed')은 첫 시도 성공이 아니다
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
