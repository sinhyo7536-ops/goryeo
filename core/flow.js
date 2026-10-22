// 한 장을 단계(해설 → 탐험 → 미니게임 → 퀴즈) 순서로 실행하고, 단계마다 체크포인트를 남긴다.
import { computeStars } from './save.js';

export const STAGES = ['intro', 'explore', 'minigame', 'quiz'];

export async function runChapter(meta, chapter, ctx, save, { resumeStage = 'intro' } = {}) {
  const t0 = performance.now();
  const from = Math.max(0, STAGES.indexOf(resumeStage));
  const result = { firstTryCorrect: 0, firstTryTotal: 0, easyModeUsed: false, quizCorrect: 0, quizTotal: 0, wrongQuizzes: [] };
  const cur = save.data.current;
  if (from === 3 && cur && cur.id === meta.id && cur.carry) Object.assign(result, cur.carry); // 미니게임 결과를 되살린다
  // 걸린 시간: 이어하기 전에 쓴 시간(elapsed)에 이어서 센다. 체크포인트와 화면을 떠날 때마다 저장한다.
  const base = from > 0 && cur && cur.id === meta.id && Number.isFinite(cur.elapsed) ? cur.elapsed : 0;
  const spent = () => base + (performance.now() - t0) / 1000;
  const stamp = () => { const c = save.data.current; if (c && c.id === meta.id) { c.elapsed = Math.round(spent()); save.persist(); } };
  const checkpoint = (stage, carry) => { save.checkpoint(meta.id, stage, carry); stamp(); };
  const onHide = () => { if (document.visibilityState === 'hidden') stamp(); };
  const tick = setInterval(stamp, 15000);
  addEventListener('pagehide', stamp); document.addEventListener('visibilitychange', onHide);
  try {
    if (from === 0) {
      checkpoint('intro');
      await ctx.screens.showIntroCard(meta, chapter.script.intro);
    }
    chapter.buildScene(ctx.world, ctx);
    if (from > 0) chapter.enterStage?.(ctx, STAGES[from]);

    if (from <= 1) {
      checkpoint('explore');
      await chapter.explore(ctx);
    }
    if (from <= 2) {
      checkpoint('minigame');
      const mg = await chapter.minigame(ctx);
      Object.assign(result, { firstTryCorrect: mg.firstTryCorrect, firstTryTotal: mg.firstTryTotal, easyModeUsed: mg.easyModeUsed });
    }

    checkpoint('quiz', { firstTryCorrect: result.firstTryCorrect, firstTryTotal: result.firstTryTotal, easyModeUsed: result.easyModeUsed });
    for (const q of chapter.quizzes) {
      const { correct } = await ctx.dialogue.quiz(q);
      result.quizTotal += 1;
      if (correct) result.quizCorrect += 1;
      else result.wrongQuizzes.push({ question: q.question, answer: q.options[q.answer], explain: q.explain });
    }
    ctx.dialogue.close();
  } finally { clearInterval(tick); removeEventListener('pagehide', stamp); document.removeEventListener('visibilitychange', onHide); }

  result.seconds = Math.round(spent());
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
    world.setTalkCamera(npc.mesh); // 대화하는 동안 인물 얼굴 가까이
    try { await onTalk(npc.id); } finally {
      if (world.camMode === 'talk') world.camMode = 'follow';
      dialogue.close();
      busy = false; input.enabled = !stopped;
    }
  });
  return () => { stopped = true; off(); unbind(); hud.setPrompt(null); hud.setTalkEnabled(false); };
}
