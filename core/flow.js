// 한 장을 단계(해설 → 탐험 → 미니게임 → 퀴즈) 순서로 실행하고, 단계마다 체크포인트를 남긴다.
import { computeStars } from './save.js';

export const STAGES = ['intro', 'explore', 'minigame', 'quiz'];

export async function runChapter(meta, chapter, ctx, save, { resumeStage = 'intro' } = {}) {
  const t0 = performance.now();
  const from = Math.max(0, STAGES.indexOf(resumeStage));
  const result = { firstTryCorrect: 0, firstTryTotal: 0, easyModeUsed: false, quizCorrect: 0, quizTotal: 0, wrongQuizzes: [] };
  const cur = save.data.current;
  if (from === 3 && cur && cur.id === meta.id && cur.carry) Object.assign(result, cur.carry); // 미니게임 결과를 되살린다

  if (from === 0) {
    save.checkpoint(meta.id, 'intro');
    await ctx.screens.showIntroCard(meta, chapter.script.intro);
  }
  chapter.buildScene(ctx.world, ctx);
  if (from > 0) chapter.enterStage?.(ctx, STAGES[from]);

  if (from <= 1) {
    save.checkpoint(meta.id, 'explore');
    await chapter.explore(ctx);
  }
  if (from <= 2) {
    save.checkpoint(meta.id, 'minigame');
    const mg = await chapter.minigame(ctx);
    Object.assign(result, { firstTryCorrect: mg.firstTryCorrect, firstTryTotal: mg.firstTryTotal, easyModeUsed: mg.easyModeUsed });
  }

  save.checkpoint(meta.id, 'quiz', { firstTryCorrect: result.firstTryCorrect, firstTryTotal: result.firstTryTotal, easyModeUsed: result.easyModeUsed });
  for (const q of chapter.quizzes) {
    const { correct } = await ctx.dialogue.quiz(q);
    result.quizTotal += 1;
    if (correct) result.quizCorrect += 1;
    else result.wrongQuizzes.push({ question: q.question, answer: q.options[q.answer], explain: q.explain });
  }
  ctx.dialogue.close();

  result.seconds = Math.round((performance.now() - t0) / 1000);
  result.stars = computeStars(result);
  save.finishChapter(meta.id, result);
  return result;
}

// 탐험 중 돌아다니기: 가까운 인물에게 말 걸기와 특정 지점 도착을 처리한다.
// 반환값은 멈추는 함수. 대화 중에는 움직임을 막는다.
export function roam(ctx, { onTalk, zones = [] }) {
  const { world, input, hud, dialogue } = ctx;
  let busy = false, stopped = false;
  const inside = new Set();
  const off = world.onUpdate(() => {
    if (stopped || busy) { hud.setPrompt(null); hud.setTalkEnabled(false); return; }
    const npc = world.nearestNpc(2.8);
    hud.setPrompt(npc ? npc.mesh.position : null);
    hud.setTalkEnabled(!!npc);
    const p = world.player.position;
    for (const z of zones) {
      const now = (!z.active || z.active()) && Math.hypot(p.x - z.x, p.z - z.z) < z.r; // 비활성 구역은 '안에 있음'으로 치지 않는다
      if (now && !inside.has(z)) { inside.add(z); z.onEnter(); }
      if (!now) inside.delete(z);
    }
  });
  const unbind = ctx.onAction(async () => {
    if (stopped || busy || dialogue.isOpen()) return;
    const npc = world.nearestNpc(2.8);
    if (!npc) return;
    busy = true; input.enabled = false;
    const p = npc.mesh.position;
    npc.mesh.rotation.y = Math.atan2(world.player.position.x - p.x, world.player.position.z - p.z);
    try { await onTalk(npc.id); } finally {
      dialogue.close();
      busy = false; input.enabled = !stopped;
    }
  });
  return () => { stopped = true; off(); unbind(); hud.setPrompt(null); hud.setTalkEnabled(false); };
}
