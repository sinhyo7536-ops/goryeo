// 화질 3단계와 자동 하향. 처음 3초 평균이 40fps 아래면 한 단계 낮추고 다시 잰다.
export const QUALITY = {
  low: { pixelRatio: 0.75, shadows: 'off', particles: 0.3, water: 'flat' },
  medium: { pixelRatio: 1, shadows: 'on', particles: 0.6, water: 'waves' },
  high: { pixelRatio: 1.5, shadows: 'soft', particles: 1, water: 'waves' },
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
  let elapsed = 0, frames = 0, auto = true;
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
    set(level) { auto = false; q.level = level; onChange(level); },
  };
  return q;
}
