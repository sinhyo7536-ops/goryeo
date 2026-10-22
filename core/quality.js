// 화질 3단계와 자동 하향. 처음 3초 평균이 40fps 아래면 한 단계 낮추고 다시 잰다.
export const QUALITY = {
  low: { pixelRatio: 0.75, shadows: 'off', particles: 0.3, water: 'flat' },
  // 2026-10-23: 학생 태블릿에서 넉넉히 돌아가서 보통·높음을 한 단계씩 올렸다(더 선명하게, 부드러운 그림자, 풀·나무 더 많이)
  medium: { pixelRatio: 1.25, shadows: 'soft', particles: 0.9, water: 'waves' },
  high: { pixelRatio: 1.75, shadows: 'soft', particles: 1.3, water: 'waves' },
};
const ORDER = ['low', 'medium', 'high'];
const WINDOW_SECONDS = 3;
const MIN_FPS = 40;
const MAX_FRAME = 0.5; // 탭 전환처럼 멈췄던 프레임은 무시

export function guessInitialQuality({ dpr = 1, cores = 4, memory } = {}) {
  if ((memory !== undefined && memory <= 4) || cores <= 4) return 'medium';
  if (dpr >= 2 && memory >= 8) return 'high';
  return 'medium';
}

export function createQualityController({ initial = 'medium', onChange = () => {} } = {}) {
  let elapsed = 0, frames = 0, auto = true, manual = false;
  const q = {
    level: initial,
    sample(dt) {
      if (!auto || q.level === 'low' || dt > MAX_FRAME) return;
      elapsed += dt; frames += 1;
      if (elapsed < WINDOW_SECONDS) return;
      const fps = frames / elapsed;
      elapsed = 0; frames = 0;
      if (fps < MIN_FPS) {
        q.level = ORDER[ORDER.indexOf(q.level) - 1];
        onChange(q.level);
      } else auto = false; // 한 번 충분히 빠르면 측정을 끝냄
    },
    set(level) { auto = false; manual = true; q.level = level; onChange(level); },
    // 장이 시작될 때 다시 잰다 (첫 화면은 장면이 가벼워서 측정에 쓰지 않는다). 직접 고른 화질은 그대로 둔다.
    restart() { if (!manual) { auto = true; elapsed = 0; frames = 0; } },
  };
  return q;
}
