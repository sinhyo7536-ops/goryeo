// 상황 놀이 부품(chapters/kit/play.js): 터치만으로 끝까지 할 수 있고, 틀리게 고르면 그 시도는 실패한다.
import { test, eq, ok } from './harness.js';
import { makeKitChapter } from '../chapters/kit/chapter.js';
import { PLAY, buildArena } from '../chapters/kit/play.js';
import { runChapter } from '../core/flow.js';
import { testWorld, touchSetup, touchBot, memSave, sleep } from './bot.js';

const script = {
  speakers: { guide: { name: '안내', mark: '◎', color: '#2f6b5e' }, a: { name: '가', mark: '가', color: '#555', look: 'citizen' } },
  intro: [{ who: 'narr', text: '시험', src: ['S51'] }],
  start: [{ who: 'guide', text: '시작' }],
  goals: ['가에게 말 걸기', '놀이', '퀴즈'],
  minigameTitle: '시험 놀이',
  npc: { a: { first: [{ who: 'a', text: '안녕' }] } },
  parts: {},
  result: [{ who: 'narr', text: '끝', src: ['S51'] }],
  quizzes: [
    { kind: 'quiz', question: 'Q1', options: ['맞음', '틀림'], answer: 0, explain: '', src: ['S51'] },
    { kind: 'quiz', question: 'Q2', options: ['맞음2', '틀림2'], answer: 0, explain: '', src: ['S51'] },
  ],
};
const arena = { origin: [300, 0], ground: 'earth', bounds: { x0: -20, x1: 20, z0: -20, z1: 20 } };
const PARTS = {
  drive: { type: 'drive', title: '배 몰기', arena, vehicle: 'boat', from: [0, 15], seconds: 60,
    route: [{ x: 0, z: 5, label: '첫째' }, { x: 8, z: -5, say: '둘째에 왔어요' }, { x: 0, z: -14, label: '인천' }],
    hazards: [{ x: -10, z: 0, r: 1.4, kind: 'mine' }, { x: 12, z: 8, to: [12, 14], kind: 'ship', r: 1.6 }], followers: null },
  stops: { type: 'stops', title: '차례대로', arena, from: [0, 15], seconds: 60,
    spots: [{ x: -8, z: 0, label: '가 (1)' }, { x: 8, z: 0, label: '나 (2)' }, { x: 0, z: -10, label: '다 (3)' }] },
  deliver: { type: 'deliver', title: '나누기', arena, from: [0, 10],
    bins: [{ id: 'a', label: '민주주의', x: -9, z: -6 }, { id: 'b', label: '경제 성장', x: 9, z: -6 }],
    cards: [{ text: '4·19 혁명', bin: 'a' }, { text: '고속도로', bin: 'b' }, { text: '6월 항쟁', bin: 'a' }] },
  find: { type: 'find', title: '찾기', arena, from: [0, 12],
    items: [{ text: '맞음1', correct: true, x: -8, z: 2 }, { text: '틀림', correct: false, x: 0, z: -4 }, { text: '맞음2', correct: true, x: 8, z: 2 }] },
  ambush: { type: 'ambush', title: '매복', arena, camera: { pos: [0, 18, 16], target: [0, 0, 0] },
    path: [[0, -20], [0, 18]], zone: { x: 0, z: 0, r: 6 }, enemies: 4, need: 3, interval: 1.6, speed: 3 },
  sneak: { type: 'sneak', title: '몰래', arena, from: [0, 16], seconds: 90,
    waypoints: [{ x: -8, z: 6 }, { x: -8, z: -6 }, { x: 0, z: -14, label: '임시 정부' }],
    guards: [{ path: [[6, 2], [6, -10]], speed: 0.7, range: 4 }] },
};

const chapterWith = parts => makeKitChapter({
  id: 'zz', mood: 'morning', script: { ...script, parts }, order: ['a'], spot: [0, 3],
  layout: { ground: 'grass', bounds: { x0: -10, x1: 10, z0: -10, z1: 10 }, start: [0, 6], npcs: [{ id: 'a', look: 'citizen', x: 0, z: 0 }], signs: [] },
  parts: Object.values(parts),
});

for (const [kind, part] of Object.entries(PARTS)) {
  test(`play: ${kind} 놀이를 터치만으로 끝까지 한다`, async () => {
    const ch = chapterWith({ [kind]: part });
    const s = touchSetup(script.speakers);
    const answers = { answers: new Set(['맞음', '맞음2']) };
    const bot = touchBot(s, answers);
    try {
      const r = await runChapter({ id: 'zz', no: 1, title: '시험' }, ch, s.ctx, memSave());
      eq(r.firstTryCorrect, r.firstTryTotal, `${kind}: 첫 시도에 성공`);
      eq(r.easyModeUsed, false);
      eq(s.w.speedScale || 1, 1, '탈것 속도는 되돌린다');
      ok(s.w.bounds.x1 < 100, '무대를 치우면 마을 경계로 돌아온다');
    } finally { bot.stop(); s.done(); }
  }, { timeout: 120000 });
}

test('play: 틀린 곳을 고르면 그 시도는 실패한다 (차례·나누기·찾기)', async () => {
  for (const kind of ['stops', 'deliver', 'find']) {
    const s = touchSetup(script.speakers);
    try {
      const p = PLAY[kind](s.ctx, PARTS[kind], false);
      const wrong = kind === 'stops' ? PARTS.stops.spots[1] : kind === 'deliver' ? PARTS.deliver.bins[1] : PARTS.find.items[1];
      s.w.player.position.set(300 + wrong.x, 0, wrong.z); s.w.step(1 / 30, { x: 0, z: 0 });
      ok(!s.hud.talkBtn.disabled, `${kind}: 가까이 가면 버튼이 켜진다`);
      s.hud.talkBtn.click();
      eq(await p, false, `${kind}: 틀리면 실패`);
    } finally { s.done(); }
  }
});

test('play: 무대는 끝나면 부딪힘과 경계까지 모두 치운다', () => {
  const w = testWorld();
  try {
    const before = w.colliders.length, b = w.bounds;
    const a = buildArena(w, { ...arena, props: [{ type: 'rice', x: 2, z: 2 }] });
    ok(w.colliders.length > before);
    a.dispose();
    eq(w.colliders.length, before); eq(w.bounds, b);
  } finally { w.dispose(); }
});
