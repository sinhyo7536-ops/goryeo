import { test, eq, ok } from './harness.js';
import { THEMES, SCALE, barEvents, createMusic } from '../core/music.js';
import { runChapter } from '../core/flow.js';
import { memSave } from './bot.js';

// 소리 장치 대신 쓰는 가짜: 만든 소리 마디 수만 센다
function fakeAudioContext() {
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = extra => ({ connect(n) { return n; }, disconnect() {}, start() {}, stop() {}, ...extra });
  const c = {
    made: 0, currentTime: 0, state: 'running', destination: node(), sampleRate: 8000,
    resume() { c.state = 'running'; return Promise.resolve(); },
    createOscillator() { c.made += 1; return node({ type: 'sine', frequency: param(), detune: param() }); },
    createGain() { return node({ gain: param() }); },
    createBiquadFilter() { return node({ type: 'lowpass', frequency: param(), Q: param() }); },
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; },
    createBufferSource() { c.made += 1; return node({ buffer: null, playbackRate: param() }); },
  };
  return c;
}

test('music: every chapter has its own theme on a five-note scale', () => {
  eq(Object.keys(THEMES), ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6']);
  eq(SCALE.length, 5);
  const tempos = new Set(Object.values(THEMES).map(t => t.tempo));
  ok(tempos.size >= 4, 'chapters do not all sound alike');
  for (const [id, t] of Object.entries(THEMES)) {
    ok(t.root > 40 && t.root < 200, `${id} root`);
    ok(t.motif.length >= 4 && t.motif.every(([s, deg]) => Number.isInteger(s) && Number.isInteger(deg)), `${id} motif`);
  }
});

test('music: battle bars are busier and louder than calm bars in every chapter', () => {
  for (const id of Object.keys(THEMES)) {
    const calm = barEvents(THEMES[id], 'calm', 0), battle = barEvents(THEMES[id], 'battle', 0);
    const hits = evs => evs.filter(e => e.kind === 'drum' || e.kind === 'wood' || e.kind === 'clack').length;
    ok(hits(battle) > hits(calm), `${id}: ${hits(battle)} vs ${hits(calm)} hits`);
    const peak = evs => Math.max(...evs.map(e => e.vel || 0));
    ok(peak(battle) >= peak(calm), `${id} louder`);
  }
});

test('music: plays a chapter theme, changes intensity, stops, and stays silent when off', () => {
  const ac = fakeAudioContext();
  const m = createMusic({ makeContext: () => ac });
  m.play('ch3');
  eq(m.state.theme, 'ch3'); eq(m.state.level, 'calm'); ok(m.state.playing);
  m.tick(); // 다음 몇 박자를 미리 예약한다
  ok(ac.made > 0, 'notes scheduled');
  m.setLevel('battle'); eq(m.state.level, 'battle');
  m.stop(); eq(m.state.playing, false);
  const before = ac.made;
  m.setEnabled(false);
  m.play('ch2'); m.tick();
  eq(ac.made, before, 'silent when turned off');
  eq(m.state.theme, 'ch2', 'remembers the theme for when it is turned back on');
  m.setEnabled(true); ok(m.state.playing, 'resumes when turned on');
  m.stop();
});

test('music: calm while exploring, battle during the minigame, calm for the quiz', async () => {
  const levels = [];
  const ch = {
    script: { intro: [] }, quizzes: [{ question: 'Q', options: ['a', 'b'], answer: 0, explain: '' }],
    buildScene() {}, async explore() { levels.push(`explore:${music.state.level}`); },
    async minigame() { levels.push(`minigame:${music.state.level}`); return { firstTryCorrect: 0, firstTryTotal: 0, easyModeUsed: false }; },
  };
  const music = { state: { level: null }, setLevel(l) { this.state.level = l; } };
  const ctx = { music, screens: { showIntroCard: async () => {} }, dialogue: { quiz: async () => { levels.push(`quiz:${music.state.level}`); return { correct: true }; }, close() {} } };
  await runChapter({ id: 'fake', no: 1, title: 'x' }, ch, ctx, memSave());
  eq(levels, ['explore:calm', 'minigame:battle', 'quiz:calm']);
});

test('menu: separate music switch', async () => {
  const { showMenu } = await import('../core/screens.js');
  const el = document.createElement('div'); document.body.appendChild(el);
  const changes = [];
  const p = showMenu(el, { muted: false, music: true, quality: 'medium' }, c => changes.push(c));
  const b = [...el.querySelectorAll('button')].find(x => x.textContent === '음악 끄기');
  ok(b, 'music off button');
  b.click();
  eq(changes, [{ music: false }]);
  await p; el.remove();
});
