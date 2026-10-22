// 조선편 4장 장면: 남해안 포구(부두, 판옥선과 거북선, 지휘소)와 북쪽 바다. 바다 북쪽 끝의 두 섬 사이가 좁은 견내량,
// 서쪽 섬이 한산도. 미니게임은 높은 데서 내려다보는 고정 카메라로 바다 위에서 한다.
import * as THREE from 'three';
import { groundMaterial } from '../../../core/textures.js';
import { mat } from '../../../core/people.js';
import { scatter } from '../../../core/props.js';
import { LOOKS } from '../../../content/characters.js';
import { addSigns } from '../common.js';

export const STRAIT_Z = -78;       // 견내량 입구
// 적 배가 기다리는 곳: 견내량 안쪽 깊이(미끼 배가 돌아설 때 넉넉히 떨어져 있게)
export const ENEMY_WAIT = STRAIT_Z - 32;
export const WING = { x: 0, z: -44, r: 15 }; // 학익진 가운데와 반지름

function seeded(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// 판옥선: 넓은 배 위에 2층 갑판과 난간, 깃발
function panokseon(mk) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(3, 1.2, 7), 0x5e432c, 0, 0.3, 0, g);
  mk(new THREE.BoxGeometry(2.4, 0.9, 1.6), 0x5e432c, 0, 0.5, -3.6, g).rotation.x = 0.3;
  mk(new THREE.BoxGeometry(3.2, 0.9, 5.4), 0x7a5a3c, 0, 1.35, 0.2, g);
  mk(new THREE.BoxGeometry(3.4, 0.15, 5.8), 0x3a2c20, 0, 1.85, 0.2, g);
  mk(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 5), 0x5a3f2a, 0, 3.9, 0.3, g);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4).translate(0.55, 0, 0), new THREE.MeshLambertMaterial({ color: 0xb8452f, side: THREE.DoubleSide }));
  flag.position.set(0, 5.2, 0.3); g.add(flag);
  return g;
}
// 거북선: 판옥선 위를 덮은 등딱지 덮개와 송곳, 앞의 용머리
function geobukseon(mk) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(3, 1.2, 7), 0x5e432c, 0, 0.3, 0, g);
  const shell = mk(new THREE.SphereGeometry(1.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x4a5a48, 0, 0.9, 0.2, g); shell.scale.set(1, 0.7, 2);
  for (let i = 0; i < 18; i++) {
    const a = (i % 6) / 6 * Math.PI * 2, row = Math.floor(i / 6);
    const s = mk(new THREE.ConeGeometry(0.06, 0.32, 4), 0xc9ccd0, Math.cos(a) * (0.5 + row * 0.4), 2.0 - row * 0.3, Math.sin(a) * (1.2 + row * 0.8) + 0.2, g);
    s.castShadow = false;
  }
  const neck = mk(new THREE.BoxGeometry(0.7, 0.7, 1.2), 0x6b5a3a, 0, 1.3, -3.9, g); neck.rotation.x = -0.4;
  mk(new THREE.BoxGeometry(0.9, 0.8, 0.9), 0x8a6a3a, 0, 1.75, -4.5, g);
  mk(new THREE.SphereGeometry(0.12, 6, 4), 0xb8452f, 0, 1.85, -4.98, g);
  return g;
}
// 일본 배: 높은 뱃전, 네모 돛 (무늬 없이)
function japaneseShip(mk) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(2.6, 1.4, 6.4), 0x3a2c20, 0, 0.4, 0, g);
  mk(new THREE.BoxGeometry(2.2, 1.2, 2.4), 0x5d4330, 0, 1.6, 1.4, g);
  mk(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 5), 0x2b241c, 0, 3.0, -0.6, g);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.4), new THREE.MeshLambertMaterial({ color: 0xe6dcc3, side: THREE.DoubleSide }));
  sail.position.set(0, 3.3, -0.6); g.add(sail);
  // 공격을 받으면 피어오르는 연기 (불길 없이)
  const smoke = new THREE.Group(); smoke.visible = false; g.add(smoke);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.6 + i * 0.15, 8, 6), new THREE.MeshLambertMaterial({ color: 0x8a8a88, transparent: true, opacity: 0.55 }));
    p.position.set((i % 2) * 0.4 - 0.2, 2.4 + i * 0.8, 0.5 - i * 0.2); smoke.add(p);
  }
  g.userData.smoke = smoke;
  return g;
}

export function buildJ4Scene(world) {
  const L = world.level, rand = seeded(41);
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const harbor = { x0: -16, x1: 16, z0: 4.5, z1: 14 };
  world.bounds = harbor;

  // 바다와 포구 땅
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x3f7d9a, shininess: 60, specular: 0x9ac4d6, transparent: true, opacity: 0.94 }));
  sea.position.y = -0.4; L.add(sea);
  {
    const g = new THREE.PlaneGeometry(120, 40, 40, 14); g.rotateX(-Math.PI / 2); g.translate(0, 0, 22);
    const p = g.attributes.position, cols = [], c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      const h = z < 6 ? -0.8 + (z - 2) * 0.25 : 0.1 + Math.max(0, z - 20) * 0.25;
      p.setY(i, Math.min(h, 4));
      const j = rand() * 0.04;
      if (z < 7.5) c.setRGB(0.66 + j, 0.6 + j, 0.46 + j); else c.setRGB(0.34 + j, 0.47 + j, 0.29 + j);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(g, groundMaterial('grass')); t.receiveShadow = true; L.add(t);
  }
  // 부두(나무 다리)와 배들
  mk(new THREE.BoxGeometry(3, 0.3, 9), 0x8a6a45, 6, 0.05, 1.5);
  for (let i = 0; i < 4; i++) mk(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 6), 0x5a3f2a, 6 + (i % 2 ? 1.3 : -1.3), -0.4, -1.5 + Math.floor(i / 2) * 4);
  const turtle = geobukseon(mk); turtle.position.set(10.5, -0.2, 0); L.add(turtle);
  for (const [x, z] of [[-4, -1], [-12, 0], [1, -3]]) { const s = panokseon(mk); s.position.set(x, -0.2, z); s.rotation.y = x * 0.02; L.add(s); }
  // 포구 마을: 지휘소, 초가, 그물 말리기
  const cmd = new THREE.Group(); cmd.position.set(-10, 0, 11); L.add(cmd);
  mk(new THREE.BoxGeometry(5, 2.4, 3.6), 0xe6dcc3, 0, 1.2, 0, cmd);
  const r = mk(new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4), 0x3d4846, 0, 3.2, 0, cmd); r.geometry.rotateY(Math.PI / 4); r.scale.set(7, 1.6, 5.4);
  world.addCollider({ x: -10, z: 11, r: 2.8 });
  for (const [x, z] of [[16, 12.5], [-19, 6]]) {
    mk(new THREE.BoxGeometry(4, 2.2, 3.4), 0xe6dcc3, x, 1.1, z);
    const roof = mk(new THREE.SphereGeometry(2.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xc8a476, x, 2.1, z); roof.scale.set(1, 0.55, 0.85);
    world.addCollider({ x, z, r: 2.3 });
  }
  for (const x of [-3, -1]) mk(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 5), 0x5a3f2a, x, 0.9, 8);
  const net = mk(new THREE.PlaneGeometry(2, 1.2), 0x6b6152, -2, 1.2, 8); net.material = net.material.clone(); net.material.side = THREE.DoubleSide;
  scatter(world, { kind: 'grass', count: 70, area: { x0: -30, x1: 30, z0: 8.5, z1: 20 }, avoid: [{ x: -10, z: 11, r: 4 }, { x: 16, z: 12.5, r: 3 }, { x: -19, z: 6, r: 3 }, { x: -2, z: 8, r: 2 }], seed: 81, color: 0x7a9450 });
  scatter(world, { kind: 'pine', count: 30, area: { x0: -60, x1: 60, z0: 22, z1: 40 }, seed: 82, scale: [1.1, 1.6], ground: () => 1.5 });

  // 바다 북쪽: 견내량(두 섬 사이 좁은 물길)과 서쪽의 한산도
  const island = (x, z, sx, sz, h) => { const m = mk(new THREE.ConeGeometry(1, 1, 9), 0x4f6b4a, x, h / 2 - 0.6, z, L, false); m.scale.set(sx, h, sz); return m; };
  island(-24, STRAIT_Z - 6, 20, 12, 10); island(24, STRAIT_Z - 6, 20, 12, 11);
  island(-46, -46, 14, 12, 8);
  for (const [x, z] of [[-3, STRAIT_Z + 2], [4, STRAIT_Z - 3]]) mk(new THREE.DodecahedronGeometry(0.9, 0), 0x6b6862, x, -0.2, z); // 암초

  // 미니게임에 쓰는 배들
  const lure = new THREE.Group(); L.add(lure);
  for (let i = 0; i < 3; i++) { const s = panokseon(mk); s.position.set((i - 1) * 4.5, -0.2, i % 2 * 3); lure.add(s); }
  const enemy = new THREE.Group(); L.add(enemy);
  for (let i = 0; i < 8; i++) { const s = japaneseShip(mk); s.position.set(((i % 4) - 1.5) * 4.5, -0.2, Math.floor(i / 4) * 7); enemy.add(s); }
  const fleet = new THREE.Group(); L.add(fleet); // 학익진으로 펼치는 우리 배 6척(가운데는 거북선)
  const wingSpots = [-1.1, -0.75, -0.4, 0.4, 0.75, 1.1].map(a => [WING.x + Math.sin(a) * WING.r, WING.z + Math.cos(a) * WING.r * 0.6 + 6, a]);
  for (const [x, z, a] of wingSpots) { const s = panokseon(mk); s.position.set(x, -0.2, z); s.rotation.y = a * 0.6; fleet.add(s); } // 뱃머리가 북쪽(적)을 보며 안쪽으로 조금 돈다
  // 학익진 앞에 선 거북선 (S43): 날개 가운데, 우리 배보다 조금 앞(북쪽)
  const leadTurtle = geobukseon(mk); leadTurtle.position.set(WING.x, -0.2, WING.z + WING.r * 0.6 + 5); L.add(leadTurtle);
  const goalRing = new THREE.Mesh(new THREE.RingGeometry(4, 5, 32), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  goalRing.rotation.x = -Math.PI / 2; goalRing.visible = false; L.add(goalRing);

  // 상태: 'harbor'(탐험), 'lure'(미끼 배 출발), 'wing'(학익진), 'won'(끝)
  const setStage = s => {
    lure.visible = s === 'lure';
    enemy.visible = s !== 'harbor';
    fleet.visible = s === 'wing' || s === 'won';
    leadTurtle.visible = fleet.visible;
    goalRing.visible = false;
    enemy.children.forEach(e => { e.userData.smoke.visible = s === 'won'; });
    if (s === 'lure') { lure.position.set(0, 0, -30); enemy.position.set(0, 0, ENEMY_WAIT); enemy.rotation.y = 0; }
    if (s === 'wing') { enemy.position.set(0, 0, -78); }
    if (s === 'won') { enemy.position.set(0, 0, -50); }
  };
  // 미끼 배 진행: 0 = 출발(-30), 1 = 견내량 깊숙이(STRAIT_Z - 6)
  const setLure = k => { lure.position.z = -30 + k * (STRAIT_Z - 6 + 30); lure.rotation.y = 0; };
  // 적이 쫓아 나옴: 0 = 견내량 안쪽 깊이, 1 = 넓은 바다(-68). 미끼 배와 늘 25 이상 떨어져 있다.
  const setChase = k => { enemy.position.z = ENEMY_WAIT + k * (-68 - ENEMY_WAIT); enemy.rotation.y = Math.PI; lure.position.z = STRAIT_Z + 4 + k * 40; lure.rotation.y = Math.PI; };
  // 적이 날개 안으로 들어옴: 0 = -70, 1 = -36(날개 안쪽 끝, 우리 배와 겹치지 않음)
  const setAdvance = k => { enemy.position.z = -70 + k * 34; enemy.rotation.y = Math.PI; };
  setStage('harbor');

  addSigns(world, [
    { id: 'signPanok', title: '판옥선', x: -6.5, z: 5.2 },
    { id: 'signTurtle', title: '거북선', x: 12, z: 5.4 },
    { id: 'signWar', title: '임진왜란', x: 2.5, z: 12.5 },
  ]);

  world.addNpc('navy', LOOKS.navy, 7, 6.5, Math.PI);
  world.addNpc('commoner', LOOKS.commoner, -3, 9.6, Math.PI);
  world.addNpc('yisunsin', LOOKS.yisunsin, -10, 7.6, 0);

  world.onUpdate((dt, t) => {
    if (goalRing.visible) goalRing.material.opacity = 0.5 + Math.sin(t * 4) * 0.3;
    for (const g of [lure, enemy, fleet, { children: [leadTurtle] }]) g.children.forEach((s, i) => { s.position.y = -0.2 + Math.sin(t * 1.4 + i) * 0.08; });
    enemy.children.forEach(e => { if (e.userData.smoke.visible) e.userData.smoke.children.forEach((p, i) => { p.position.y = 2.4 + i * 0.8 + Math.sin(t * 2 + i) * 0.2; }); });
  });

  return {
    start: [0, 6.5], turtle, leadTurtle, lure, enemy, fleet, goalRing, setStage, setLure, setChase, setAdvance,
    // 바다 장면 카메라: 미끼 배 출발점부터 견내량 안쪽 적까지, 학익진 양 끝이 모두 보이게 맞춘다
    seaFit: { target: [0, 0, -54], dir: [0, 1, 0.6], margin: 0.78,
      points: [[0, 0, -30], [0, 0, STRAIT_Z + 2], [-8, 0, ENEMY_WAIT], [8, 0, ENEMY_WAIT + 7], [WING.x - WING.r, 0, WING.z + 6], [WING.x + WING.r, 0, WING.z + 6], [0, 0, -40]] },
  };
}
