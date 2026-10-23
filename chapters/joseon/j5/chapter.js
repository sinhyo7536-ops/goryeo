// 조선편 5장 「병자호란과 남한산성」: 산성 탐험(병사·창고지기·김상헌·최명길) → 척화·주화 나누기 → 화톳불 다시 켜기 → 항복 해설 → 퀴즈.
import { buildJ5Scene } from './scene.js';
import { showHowTo } from '../../../core/minigame.js';
import { PLAY } from '../../kit/play.js';
import { sayAll, placePlayer, talkInOrder, setTalkStep, tryPart, sumParts } from '../common.js';
import script from './script.js';

// 행궁 마당(마을에서 떨어진 x 400): 왼쪽에 김상헌(척화), 오른쪽에 최명길(주화). 말을 그 생각을 한 사람에게 가져간다.
const HALL = {
  origin: [400, 0], ground: 'stone', groundColor: 0xd8dade, bounds: { x0: -18, x1: 18, z0: -12, z1: 14 },
  props: [
    { type: 'hanok', x: 0, z: -14, tile: true, scale: 1.6 },
    { type: 'crowd', x: -10, z: -8.5, n: 1, looks: ['kimsangheon'] }, { type: 'crowd', x: 10, z: -8.5, n: 1, looks: ['choemyeonggil'] },
  ],
};
const SORT_BINS = [{ x: -10, z: -5 }, { x: 10, z: -5 }];

const ORDER = ['soldier', 'keeper', 'kimsangheon', 'choemyeonggil'];
const SPOT = [0, -3];
let scene = null;

export const PLAYER = { robe: 0x4a556a, hat: 'jeollip', gear: 'spear', trim: 0xd8d0bc, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } };

// 화톳불 켜기 한 번: 시간 안에 여섯 개 모두 켜면 성공. 다가가면(1.8 안) 켜진다. 화살표는 가장 가까운 꺼진 불을 가리킨다.
function lightFires(ctx, easy) {
  const { world, hud, audio } = ctx;
  const duration = easy ? 110 : 75;
  scene.resetFires();
  placePlayer(world, SPOT);
  ctx.input.enabled = true;
  let t = 0, done = false;
  return new Promise(resolve => {
    const finish = ok => {
      if (done) return; done = true;
      off(); hud.setTimer(null); hud.setCounter(null); world.setGoal(null); ctx.input.enabled = false;
      resolve(ok);
    };
    const off = world.onUpdate(dt => {
      if (done) return;
      t += dt;
      const p = world.player.position;
      let nearest = null, nd = Infinity;
      for (const f of scene.fires) {
        if (f.lit) continue;
        const d = Math.hypot(p.x - f.x, p.z - f.z);
        if (d < 1.8) { scene.light(f); audio.play('correct'); continue; }
        if (d < nd) { nd = d; nearest = f; }
      }
      const lit = scene.fires.filter(f => f.lit).length;
      hud.setTimer(duration - t);
      hud.setCounter(`켠 화톳불 ${lit}/${scene.fires.length}`);
      world.setGoal(nearest ? { x: nearest.x, z: nearest.z } : null);
      if (lit === scene.fires.length) return finish(true);
      if (t >= duration) finish(false);
    });
  });
}

export default {
  id: 'j5',
  mood: 'snow',
  player: PLAYER,
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildJ5Scene(world); return scene; },

  enterStage(ctx, stage) {
    if (stage === 'minigame' || stage === 'quiz') placePlayer(ctx.world, SPOT);
    if (stage === 'quiz') { scene.allLit(); ctx.setGoal(script.goals[5]); }
  },

  explore(ctx) { return talkInOrder(ctx, script, ORDER, scene.start); },

  async minigame(ctx) {
    const { world, dialogue, input } = ctx;
    input.enabled = false;
    setTalkStep(ctx, script, ORDER, 4);
    world.setGoal(null);
    await showHowTo(ctx.ui, {
      title: '남한산성의 겨울',
      steps: ['머리 위의 말을 김상헌(싸우자, 척화)이나 최명길(화의하자, 주화)에게 가져가 대화 버튼을 눌러요.','눈보라에 꺼진 화톳불 여섯 개에 시간 안에 다가가 다시 켜요.'],
      keyboard: '걷기는 W A S D 또는 방향키, 놓기는 E', touch: '화면 왼쪽을 끌어 걷고, 대화 버튼으로 놓아요',
    });
    const parts = [];
    parts.push(await tryPart(ctx, easy => PLAY.deliver(ctx, { arena: HALL, from: [0, 11], counter: '전한 말', bins: script.sort.bins.map((b, i) => ({ ...b, ...SORT_BINS[i] })), cards: script.sort.cards }, easy), script.sort.fail));
    await sayAll(dialogue, script.fires.howto); dialogue.close();
    parts.push(await tryPart(ctx, easy => lightFires(ctx, easy), script.fires.fail));
    await sayAll(dialogue, script.fires.done);
    await sayAll(dialogue, script.result);
    dialogue.close();
    placePlayer(world, SPOT);
    ctx.setGoal(script.goals[5]);
    return sumParts(parts);
  },
};
