// 조선편 6장 장면: 가을의 수원 화성 공사장. 북쪽에 쌓는 중인 성벽(빈자리 셋)과 서쪽 성문, 성벽 위를 가로지르는 거중기,
// 돌 더미와 수레, 정조가 머무는 차일.
import * as THREE from 'three';
import { groundMaterial } from '../../../core/textures.js';
import { mat, makePerson } from '../../../core/people.js';
import { scatter } from '../../../core/props.js';
import { LOOKS } from '../../../content/characters.js';

export const WALL_Z = -10, WALL_H = 3.6;
export const GAPS = [-6, 0, 6];          // 성벽 빈자리(가운데 x)
export const TRACK = [-13, 13];          // 거중기 돌이 지나가는 x 범위

export function buildJ6Scene(world) {
  const L = world.level;
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const hipRoof = (w, d, h, color, x, y, z, parent = L) => {
    const g = new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4); g.rotateY(Math.PI / 4);
    const r = mk(g, color, x, y + h / 2, z, parent); r.scale.set(w, h, d); return r;
  };
  world.bounds = { x0: -15, x1: 15, z0: -6.5, z1: 11 };

  // 땅: 풀밭과 다져진 공사장 흙
  {
    const g = new THREE.PlaneGeometry(200, 200, 40, 40); g.rotateX(-Math.PI / 2);
    const cols = [], c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) { c.setRGB(0.5, 0.52, 0.3); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const t = new THREE.Mesh(g, groundMaterial('grass')); t.receiveShadow = true; L.add(t);
    mk(new THREE.BoxGeometry(36, 0.05, 22), 0x8f7556, 0, 0.025, 1, L, false);
  }
  // 쌓는 중인 성벽: 빈자리 셋을 남기고 돌을 쌓았다. 빈자리를 채울 돌은 처음엔 숨김.
  const fillers = [];
  for (let x = -17; x <= 17; x += 2) {
    if (GAPS.some(g => Math.abs(x - g) < 1.1)) continue;
    mk(new THREE.BoxGeometry(2, WALL_H, 2.4), 0xb3ada2, x, WALL_H / 2, WALL_Z);
  }
  for (const g of GAPS) {
    mk(new THREE.BoxGeometry(2, WALL_H - 1.2, 2.4), 0xb3ada2, g, (WALL_H - 1.2) / 2, WALL_Z); // 빈자리 아래쪽은 이미 쌓임
    const f = mk(new THREE.BoxGeometry(1.9, 1.2, 2.3), 0xc9c2b4, g, WALL_H - 0.6, WALL_Z); f.visible = false; fillers.push(f);
  }
  for (let x = -17; x <= 17; x += 2) world.addCollider({ x, z: WALL_Z, r: 1.3 });
  // 빈자리 표시(빛나는 테두리)
  const gapGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.2, 2.5), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.7 }));
  gapGlow.visible = false; L.add(gapGlow);
  // 서쪽 성문(문루와 무지개 문)
  const gate = new THREE.Group(); gate.position.set(-21, 0, WALL_Z); L.add(gate);
  mk(new THREE.BoxGeometry(6, 4.6, 3.4), 0xb3ada2, 0, 2.3, 0, gate);
  mk(new THREE.BoxGeometry(2.4, 3, 3.5), 0x3a2c20, 0, 1.5, 0, gate);
  for (const dx of [-2.4, -0.8, 0.8, 2.4]) mk(new THREE.CylinderGeometry(0.18, 0.18, 2.2, 8), 0xa8392b, dx, 5.7, 0, gate);
  hipRoof(8, 5.4, 2, 0x3d4846, 0, 6.8, 0, gate);
  // 거중기: 성벽 뒤에 선 두 기둥과 그 위를 가로지르는 들보, 들보를 따라 움직이는 도르래 수레와 매단 돌
  const crane = new THREE.Group(); L.add(crane);
  for (const x of [TRACK[0] - 1, TRACK[1] + 1]) for (const dz of [-1.4, 1.4]) {
    const leg = mk(new THREE.CylinderGeometry(0.16, 0.2, 9, 6), 0x7a5a3c, x, 4.5, WALL_Z + dz, crane); leg.rotation.x = dz * 0.04;
  }
  mk(new THREE.BoxGeometry(TRACK[1] - TRACK[0] + 3, 0.4, 0.4), 0x6b4a32, 0, 9, WALL_Z - 1.4, crane);
  mk(new THREE.BoxGeometry(TRACK[1] - TRACK[0] + 3, 0.4, 0.4), 0x6b4a32, 0, 9, WALL_Z + 1.4, crane);
  const trolley = new THREE.Group(); trolley.position.set(TRACK[0], 0, WALL_Z); crane.add(trolley);
  mk(new THREE.BoxGeometry(1.2, 0.4, 3.2), 0x5e432c, 0, 9.3, 0, trolley);
  for (const dz of [-0.5, 0.5]) { const p = mk(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 12), 0x8a6a45, 0, 8.6, dz, trolley); p.rotation.x = Math.PI / 2; } // 위 도르래
  const rope = mk(new THREE.CylinderGeometry(0.03, 0.03, 1, 4), 0xd8c9a0, 0, 7, 0, trolley, false);
  const lower = new THREE.Group(); trolley.add(lower);
  for (const dz of [-0.4, 0.4]) { const p = mk(new THREE.CylinderGeometry(0.26, 0.26, 0.14, 12), 0x8a6a45, 0, 0, dz, lower); p.rotation.x = Math.PI / 2; } // 아래(움직) 도르래
  const stone = mk(new THREE.BoxGeometry(1.9, 1.2, 2.3), 0xc9c2b4, 0, -1.0, 0, lower);
  // 돌 높이: 0 = 땅, 1 = 성벽 위로 넉넉히
  const setLift = h => { lower.position.y = 1.0 + h * (WALL_H + 2.2); rope.scale.y = Math.max(0.1, 8.6 - lower.position.y); rope.position.y = (8.6 + lower.position.y) / 2; };
  setLift(1);
  // 돌 더미, 수레, 정조의 차일
  for (const [x, z] of [[8, 2], [10, 3.5], [9, 0.5], [-9, 3], [-10.5, 1.5]]) mk(new THREE.BoxGeometry(1.8, 1, 1.4), 0xc9c2b4, x, 0.5, z).rotation.y = x;
  world.addCollider({ x: 9, z: 2, r: 2 }); world.addCollider({ x: -10, z: 2.3, r: 1.6 });
  const cart = new THREE.Group(); cart.position.set(4, 0, 5); L.add(cart);
  mk(new THREE.BoxGeometry(1.6, 0.3, 2.6), 0x7a5a3c, 0, 0.8, 0, cart);
  for (const dx of [-0.95, 0.95]) { const w = mk(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 12), 0x5e432c, dx, 0.6, 0, cart); w.rotation.z = Math.PI / 2; }
  mk(new THREE.BoxGeometry(1.4, 0.8, 1.2), 0xc9c2b4, 0, 1.35, 0, cart);
  world.addCollider({ x: 4, z: 5, r: 1.4 });
  const tent = new THREE.Group(); tent.position.set(-10, 0, -3); L.add(tent);
  for (const [dx, dz] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) mk(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), 0x5a3f2a, dx, 1.5, dz, tent);
  const cloth = mk(new THREE.BoxGeometry(4.8, 0.08, 4), 0xe6dcc3, 0, 3, 0, tent); cloth.rotation.z = 0.04;
  mk(new THREE.BoxGeometry(2.2, 0.2, 1.6), 0xa8392b, 0, 0.1, 0, tent, false); // 깔개
  // 일하는 사람들(배경)
  for (const [x, z, ry] of [[7, -2, Math.PI], [11, 0, -Math.PI / 2], [-6, 6, 0.5], [13, 6, Math.PI * 0.8]]) { const p = makePerson(LOOKS.worker); p.position.set(x, 0, z); p.rotation.y = ry; L.add(p); }
  scatter(world, { kind: 'pine', count: 40, area: { x0: -80, x1: 80, z0: -60, z1: -16 }, seed: 101, scale: [1.1, 1.7], color: 0x4f6b3a });
  scatter(world, { kind: 'bush', count: 20, area: { x0: -30, x1: 30, z0: 13, z1: 30 }, seed: 102, color: 0xb0743a });
  scatter(world, { kind: 'grass', count: 60, area: { x0: -18, x1: 18, z0: 9, z1: 14 }, seed: 103, color: 0xa89a5a });

  world.addNpc('official', LOOKS.joseonOfficial, -6, 7, Math.PI);
  world.addNpc('worker', LOOKS.worker, 7, 4.5, -Math.PI / 2);
  world.addNpc('jeongyakyong', LOOKS.jeongyakyong, 2, -5, 0);
  world.addNpc('jeongjo', LOOKS.jeongjo, -10, -3, 0);

  world.onUpdate((dt, t) => { if (gapGlow.visible) gapGlow.material.opacity = 0.45 + Math.sin(t * 5) * 0.3; });

  return {
    start: [0, 9], fillers, gapGlow, trolley, stone, setLift,
    // 돌을 옆으로 옮김: 0 = 왼쪽 끝, 1 = 오른쪽 끝
    setSlide: k => { trolley.position.x = TRACK[0] + k * (TRACK[1] - TRACK[0]); },
    kOf: x => (x - TRACK[0]) / (TRACK[1] - TRACK[0]),
    showGap(i) { gapGlow.visible = i != null; if (i != null) gapGlow.position.set(GAPS[i], WALL_H - 1.15, WALL_Z); },
    fill(i, on = true) { fillers[i].visible = on; },
    wallCam: { pos: [0, 8, 6], target: [0, 4, WALL_Z] },
  };
}
