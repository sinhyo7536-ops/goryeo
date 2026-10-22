// 조선편 미니게임 화면 배치 점검: 탭(가로)·크롬북·휴대폰 크기에서 버튼과 판이 화면 안에 다 들어오고 서로 겹치지 않는지
import { test, ok } from './harness.js';
import { sleep } from './bot.js';

const KINDS = ['j1cards', 'j1board', 'j2cons', 'j2vowel', 'j2word', 'j3dial', 'j3gauge', 'j3clock', 'j4wing', 'j5sort', 'j6pulley'];
const SIZES = [[1000, 530], [1000, 600], [1280, 720], [1366, 650], [740, 360]];
const overlap = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;

for (const kind of KINDS) {
  test(`layout: ${kind} fits and nothing overlaps on tablet, Chromebook and phone`, async () => {
    for (const [w, h] of SIZES) {
      const frame = document.createElement('iframe');
      frame.src = `./fit.html?kind=${kind}`; frame.style.cssText = `width:${w}px;height:${h}px;position:fixed;left:-3000px;top:0;border:0`;
      document.body.appendChild(frame);
      try {
        await new Promise(r => frame.addEventListener('load', r));
        const d = frame.contentDocument;
        for (let i = 0; i < 100 && !d.querySelector('.screen button'); i++) await sleep(20);
        await sleep(50);
        const buttons = [...d.querySelectorAll('.screen button')];
        ok(buttons.length > 0, `${kind} ${w}x${h}: has buttons`);
        for (const b of buttons) {
          const r = b.getBoundingClientRect();
          ok(r.top >= -1 && r.bottom <= h + 1 && r.left >= -1 && r.right <= w + 1, `${kind} ${w}x${h}: "${b.textContent}" outside the screen (${Math.round(r.left)},${Math.round(r.top)}..${Math.round(r.right)},${Math.round(r.bottom)})`);
          ok(r.height >= 40, `${kind} ${w}x${h}: "${b.textContent}" too small to tap (${Math.round(r.height)}px)`);
        }
        const fig = d.querySelector('.choose-figure svg');
        if (fig) { const r = fig.getBoundingClientRect(); ok(r.height >= 90 && r.bottom <= h, `${kind} ${w}x${h}: picture ${Math.round(r.height)}px tall`); }
        const marks = [...d.querySelectorAll('.place-slot, .place-decor')].map(e => [e, e.getBoundingClientRect()]);
        for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) ok(!overlap(marks[i][1], marks[j][1]), `${kind} ${w}x${h}: "${marks[i][0].textContent}" overlaps "${marks[j][0].textContent}"`);
        const board = d.querySelector('.place-board');
        if (board) { const br = board.getBoundingClientRect(); for (const [e, r] of marks) ok(r.left >= br.left - 1 && r.right <= br.right + 1 && r.top >= br.top - 1 && r.bottom <= br.bottom + 1, `${kind} ${w}x${h}: "${e.textContent}" sticks out of the board`); }
      } finally { frame.remove(); }
    }
  }, { timeout: 60000 });
}

// 3D 미니게임 카메라: 꼭 보여야 할 곳이 화면 안에 있고, 아래쪽 큰 버튼(화면 아래 약 20%)과 위쪽 목표 상자에 가리지 않아야 한다
import * as THREE from 'three';
import { testWorld } from './bot.js';
const ASPECTS = [1000 / 530, 1000 / 600, 1366 / 650, 1280 / 720, 740 / 360, 4 / 3];
function checkView(w, fit, points, label) {
  for (const a of ASPECTS) {
    w.camera.aspect = a; w.camera.updateProjectionMatrix();
    w.fitFixedCamera(fit.target, fit.dir, fit.points, fit.margin);
    w.camera.updateMatrixWorld();
    for (const p of points) {
      const v = new THREE.Vector3(...p).project(w.camera);
      ok(Math.abs(v.x) <= 0.95 && v.y >= -0.58 && v.y <= 0.8 && v.z < 1, `${label} aspect ${a.toFixed(2)}: point ${p} at (${v.x.toFixed(2)}, ${v.y.toFixed(2)})`);
    }
  }
}

test('layout: 거중기 장면 — 돌이 지나가는 길과 빈자리 셋이 모든 화면에서 보인다', async () => {
  const { buildJ6Scene, GAPS, TRACK, WALL_Z, WALL_H } = await import('../chapters/joseon/j6/scene.js');
  const w = testWorld();
  try {
    const s = buildJ6Scene(w);
    const pts = [[TRACK[0], WALL_H + 2.5, WALL_Z], [TRACK[1], WALL_H + 2.5, WALL_Z], ...GAPS.map(g => [g, WALL_H - 1.2, WALL_Z]), [0, 9.4, WALL_Z]];
    checkView(w, s.wallFit, pts, 'crane');
  } finally { w.dispose(); }
});

test('layout: 한산도 바다 — 미끼 배 출발점, 견내량 입구, 기다리는 적, 학익진이 모든 화면에서 보인다', async () => {
  const { buildJ4Scene, STRAIT_Z, ENEMY_WAIT, WING } = await import('../chapters/joseon/j4/scene.js');
  const w = testWorld();
  try {
    const s = buildJ4Scene(w);
    const pts = [[0, 0, -30], [0, 0, STRAIT_Z + 2], [-8, 0, ENEMY_WAIT], [8, 0, ENEMY_WAIT + 7], [WING.x - WING.r, 0, WING.z + 6], [WING.x + WING.r, 0, WING.z + 6], [0, 0, -40]];
    checkView(w, s.seaFit, pts, 'sea');
  } finally { w.dispose(); }
});
