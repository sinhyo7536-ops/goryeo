// 배경음악: 소리 파일 없이 Web Audio로 그 자리에서 연주한다(저작권 걱정 없고 오프라인에서도 된다).
// 국악 느낌의 5음 음계 위에 낮은 지속음, 북(5장은 목탁), 장구 채 소리, 대금 같은 가락을 얹는다.
// 탐험할 때는 잔잔한 긴장감(calm), 미니게임 전투에서는 북이 빨라지고 세진다(battle).

export const SCALE = [0, 3, 5, 7, 10]; // 계면조 느낌의 5음(라 도 레 미 솔)

// motif: [시작 칸, 음계 단계, 길이(칸)] — 두 마디(meter×2 칸)짜리 가락
export const THEMES = {
  ch1: { name: '담판의 긴장', tempo: 66, root: 110, meter: 16, perc: 'drum',
    motif: [[0, 5, 6], [8, 7, 4], [12, 6, 4], [16, 5, 8], [26, 4, 6]] },
  ch2: { name: '흥화진의 눈보라', tempo: 100, root: 73.42, meter: 16, perc: 'drum',
    motif: [[0, 5, 2], [2, 6, 2], [4, 7, 4], [8, 6, 2], [10, 5, 2], [12, 4, 4], [16, 5, 4], [20, 8, 4], [24, 7, 8]] },
  ch3: { name: '귀주의 폭풍', tempo: 112, root: 65.41, meter: 16, perc: 'drum',
    motif: [[0, 7, 3], [3, 8, 3], [6, 7, 2], [8, 5, 4], [12, 6, 4], [16, 7, 2], [18, 9, 2], [20, 8, 4], [24, 7, 4], [28, 5, 4]] },
  ch4: { name: '처인성의 활', tempo: 96, root: 82.41, meter: 16, perc: 'drum',
    motif: [[0, 5, 4], [4, 4, 2], [6, 5, 2], [8, 7, 6], [16, 6, 4], [20, 5, 2], [22, 4, 2], [24, 3, 8]] },
  ch5: { name: '대장경을 새기는 마음', tempo: 60, root: 98, meter: 16, perc: 'wood',
    motif: [[0, 5, 8], [8, 6, 4], [12, 7, 4], [16, 6, 8], [24, 5, 8]] },
  ch6: { name: '삼별초의 바닷길', tempo: 92, root: 55, meter: 12, perc: 'drum',
    motif: [[0, 5, 3], [3, 7, 3], [6, 8, 6], [12, 7, 3], [15, 6, 3], [18, 5, 6]] },
};

// 음계 단계 → 주파수 (5단계마다 한 옥타브 위)
export function noteFreq(root, deg) {
  const oct = Math.floor(deg / 5), i = ((deg % 5) + 5) % 5;
  return root * 2 ** ((12 * oct + SCALE[i]) / 12);
}

// 장단(타악기 자리와 세기). 12칸은 6/8 느낌의 바다 장면.
const PERC = {
  16: { calm: [[0, 0.8], [10, 0.45]], battle: [[0, 1], [3, 0.6], [6, 0.75], [8, 0.9], [11, 0.6], [12, 0.85], [14, 0.7]] },
  12: { calm: [[0, 0.8], [6, 0.5]], battle: [[0, 1], [2, 0.55], [3, 0.7], [6, 0.9], [8, 0.55], [9, 0.75], [11, 0.6]] },
};
const CLACK = { 16: [4, 12], 12: [3, 9] };

// 한 마디에 연주할 소리 목록 (순수 함수: 시험과 연주가 같이 쓴다)
export function barEvents(theme, level, bar) {
  const battle = level === 'battle', m = theme.meter, ev = [];
  const perc = theme.perc === 'wood' ? 'wood' : 'drum';
  for (const [step, vel] of PERC[m][battle ? 'battle' : 'calm']) ev.push({ kind: perc, step, vel });
  if (battle) {
    for (const step of CLACK[m]) ev.push({ kind: 'clack', step, vel: 0.5 });
    for (let step = 0; step < m; step += 2) ev.push({ kind: 'pulse', step, vel: 0.5 });
  }
  const phrase = Math.floor(bar / 2), half = (bar % 2) * m;
  if (battle || phrase % 2 === 0) {
    const lift = battle && phrase % 2 === 1 ? 2 : 0; // 전투 때는 가락을 한 번씩 높여 몰아친다
    for (const [s, deg, len] of theme.motif) {
      if (s >= half && s < half + m) ev.push({ kind: 'note', step: s - half, deg: deg + lift, len, vel: battle ? 0.7 : 0.5 });
    }
  }
  return ev;
}

export function createMusic({ makeContext = () => new (window.AudioContext || window.webkitAudioContext)() } = {}) {
  let ac = null, master = null, droneGain = null, drones = [], noise = null, timer = null;
  let enabled = true, want = false, nextTime = 0, step = 0, bar = 0;
  const state = { theme: null, level: 'calm', playing: false };
  const VOLUME = 0.11; // 교실을 생각해 작게 (효과음보다 조금 작게)

  const theme = () => THEMES[state.theme];
  const stepDur = () => 60 / theme().tempo / (theme().meter === 12 ? 3 : 4);

  function ensure() {
    if (ac) return true;
    try {
      ac = makeContext();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const len = Math.floor(ac.sampleRate * 0.4); // 타악기용 짧은 잡음
      noise = ac.createBuffer(1, len, ac.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch { ac = null; return false; }
  }

  const env = (g, t, peak, attack, decay) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };
  const osc = (type, f) => { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, 0); return o; };
  const noiseHit = (t, vel, type, freq, decay) => {
    const s = ac.createBufferSource(); s.buffer = noise;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t);
    const g = ac.createGain(); env(g, t, vel, 0.002, decay);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + decay + 0.05);
  };

  function sound(e, t) {
    const T = theme(), sd = stepDur();
    if (e.kind === 'drum') { // 북: 낮게 울리며 떨어지는 소리 + 가죽 소리
      const o = osc('sine', 130); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.3);
      const g = ac.createGain(); env(g, t, 0.9 * e.vel, 0.005, 0.45);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.5);
      noiseHit(t, 0.25 * e.vel, 'lowpass', 400, 0.08);
    } else if (e.kind === 'wood') { // 목탁
      const o = osc('sine', 880); o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(640, t + 0.06);
      const g = ac.createGain(); env(g, t, 0.45 * e.vel, 0.002, 0.12);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.15);
    } else if (e.kind === 'clack') { // 장구 채편
      noiseHit(t, 0.3 * e.vel, 'bandpass', 2600, 0.06);
    } else if (e.kind === 'pulse') { // 전투 때 낮게 몰아치는 맥박
      const o = osc('sawtooth', T.root); o.frequency.setValueAtTime(T.root, t);
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(320, t);
      const g = ac.createGain(); env(g, t, 0.22 * e.vel, 0.01, sd * 1.6);
      o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + sd * 2);
    } else if (e.kind === 'note') { // 대금 같은 가락: 아래에서 밀어 올리는 시김새와 점점 깊어지는 떨림(농음)
      const f0 = noteFreq(T.root * 4, e.deg), dur = e.len * sd;
      const o = osc('triangle', f0);
      o.frequency.setValueAtTime(f0 * 0.94, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.09);
      const lfo = osc('sine', 5.2), depth = ac.createGain();
      depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(f0 * 0.012, t + dur);
      lfo.connect(depth).connect(o.frequency);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.32 * e.vel, t + 0.07);
      g.gain.setValueAtTime(0.32 * e.vel, t + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
      o.connect(g).connect(master);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.3); lfo.stop(t + dur + 0.3);
    }
  }

  function tick() {
    if (!state.playing) return;
    const m = theme().meter;
    while (nextTime < ac.currentTime + 0.25) {
      if (step === 0) music._bar = barEvents(theme(), state.level, bar);
      for (const e of music._bar) if (e.step === step) sound(e, nextTime);
      nextTime += stepDur();
      step += 1;
      if (step >= m) { step = 0; bar += 1; }
    }
  }

  function startSound() {
    if (state.playing || !want || !enabled || !state.theme || !ensure()) return;
    if (ac.state === 'suspended' && ac.resume) {
      ac.resume().catch(() => {});
      // 화면을 아직 누르지 않아 브라우저가 소리를 막았으면, 처음 누를 때 다시 켠다
      if (typeof addEventListener === 'function') addEventListener('pointerdown', () => ac.resume().catch(() => {}), { once: true });
    }
    const t = ac.currentTime, T = theme();
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(0.0001, t); master.gain.linearRampToValueAtTime(VOLUME, t + 1.5);
    droneGain = ac.createGain(); droneGain.gain.setValueAtTime(state.level === 'battle' ? 0.2 : 0.14, t);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t);
    drones = [osc('sine', T.root), osc('sine', T.root * 1.5), osc('triangle', T.root / 2)];
    drones.forEach((o, i) => { o.frequency.setValueAtTime([T.root, T.root * 1.5, T.root / 2][i], t); o.connect(lp); o.start(t); });
    lp.connect(droneGain).connect(master);
    state.playing = true; nextTime = t + 0.1; step = 0; bar = 0;
    tick();
    timer = setInterval(tick, 100);
  }

  function stopSound() {
    if (!state.playing) return;
    state.playing = false;
    clearInterval(timer); timer = null;
    const t = ac.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(0.0001, t, 0.3);
    for (const o of drones) o.stop(t + 1.5);
    drones = [];
  }

  const music = {
    state, _bar: [],
    get enabled() { return enabled; },
    play(id) {
      if (!THEMES[id]) return;
      if (state.theme !== id) stopSound();
      state.theme = id; state.level = 'calm'; want = true;
      startSound();
    },
    setLevel(level) {
      state.level = level;
      if (state.playing && droneGain) droneGain.gain.setTargetAtTime(level === 'battle' ? 0.2 : 0.14, ac.currentTime, 0.5);
    },
    stop() { want = false; stopSound(); },
    setEnabled(on) { enabled = !!on; if (enabled) startSound(); else stopSound(); },
    tick,
  };
  return music;
}
