// 4장 장면: 흐린 하늘 아래 네 구역 — 개경 궁궐 앞, 강화도 해협, 처인성, 충주성. 안개가 서로를 가린다.
import * as THREE from 'three';
import { groundMaterial } from '../../core/textures.js';
import { mat, makePerson } from '../../core/people.js';
import { scatter } from '../../core/props.js';
import { LOOKS } from '../../content/characters.js';

const PALACE_X = 0, GANGHWA_X = 160, CHEOIN_X = 320, CHUNGJU_X = 480;
const CHEOIN_R = 12;     // 처인성 토성 반지름
const SPAWN_R = 34;      // 몽골군이 나타나는 거리

function seeded(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function buildCh4Scene(world) {
  const L = world.level, rand = seeded(23);
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const hipRoof = (w, d, h, color, x, y, z, parent = L) => {
    const g = new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4); g.rotateY(Math.PI / 4);
    const r = mk(g, color, x, y + h / 2, z, parent); r.scale.set(w, h, d); return r;
  };

  // 넓은 풀밭 (강화도 구역은 바다)
  {
    const g = new THREE.PlaneGeometry(720, 220, 140, 44); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, cols = [], c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + 240, z = p.getZ(i);
      let h = 0.12 * Math.sin(x * 0.3) * Math.cos(z * 0.25);
      const far = Math.max(0, Math.abs(z) - 45);
      h += Math.min(far * far * 0.02, 12);
      if (Math.abs(x - GANGHWA_X) < 60 && z < 4) h = -1.2; // 해협
      if (Math.abs(x - PALACE_X) < 16 && z > -12 && z < 18) h = Math.min(h, -0.05); // 궁궐 마당은 평평하게(박석 아래)
      p.setX(i, x); p.setY(i, h);
      const j = rand() * 0.04;
      c.setRGB(0.36 + j, 0.47 + j, 0.3 + j);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(g, groundMaterial('grass'));
    t.receiveShadow = true; L.add(t);
  }

  // 1) 개경 궁궐 앞: 돌기단, 단청 기둥, 큰 기와지붕
  {
    const x0 = PALACE_X;
    mk(new THREE.BoxGeometry(22, 1.2, 10), 0xa59c8a, x0, 0.6, -12);
    for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(8, 0.3, 1), 0xb3ab99, x0, 0.15 + i * 0.3, -6.5 - i * 0.5);
    for (let dx = -9; dx <= 9; dx += 3) mk(new THREE.CylinderGeometry(0.3, 0.3, 4, 8), 0xa8392b, x0 + dx, 3.2, -9);
    mk(new THREE.BoxGeometry(21, 0.45, 8), 0x2f6b5e, x0, 5.3, -12);
    hipRoof(26, 12, 4, 0x3d4846, x0, 5.5, -12);
    world.addCollider({ x: x0 - 6, z: -12, r: 6 }); world.addCollider({ x: x0 + 6, z: -12, r: 6 }); world.addCollider({ x: x0, z: -12, r: 6 });
    for (const sx of [-1, 1]) {
      mk(new THREE.BoxGeometry(1.2, 3, 30), 0x8c8577, x0 + sx * 15, 1.5, 2);
    }
    // 박석을 깐 마당과 석등 두 개
    mk(new THREE.BoxGeometry(28.6, 0.06, 22), 0xa59c8a, x0, 0.03, 3, L, false);
    for (const sx of [-1, 1]) {
      const lx = x0 + sx * 7, lz = -1;
      mk(new THREE.CylinderGeometry(0.45, 0.55, 0.3, 8), 0xb3ab99, lx, 0.15, lz);
      mk(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 8), 0xb3ab99, lx, 0.85, lz);
      mk(new THREE.BoxGeometry(0.7, 0.6, 0.7), 0xb3ab99, lx, 1.7, lz);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.72), new THREE.MeshBasicMaterial({ color: 0xffd38a })); glow.position.set(lx, 1.7, lz); L.add(glow);
      const cap = mk(new THREE.ConeGeometry(0.62, 0.45, 4), 0xb3ab99, lx, 2.25, lz); cap.rotation.y = Math.PI / 4;
      world.addCollider({ x: lx, z: lz, r: 0.6 });
    }
    // 담장 뒤 소나무
    for (const [a, b, s] of [[-45, -17, 51], [17, 45, 52]]) scatter(world, { kind: 'pine', count: 22, area: { x0: x0 + a, x1: x0 + b, z0: -32, z1: 24 }, seed: s, scale: [1, 1.5] });
  }

  // 2) 강화도 해협: 바다와 건너편 섬 (장면 구경용)
  {
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(130, 60).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x46708a, shininess: 30, transparent: true, opacity: 0.92 }));
    sea.position.set(GANGHWA_X, -0.5, -26); L.add(sea);
    const island = mk(new THREE.ConeGeometry(26, 9, 9), 0x4f6b4a, GANGHWA_X, 1.5, -40); island.scale.set(1.4, 1, 0.7);
    for (let i = 0; i < 6; i++) mk(new THREE.BoxGeometry(2.4, 1.6, 2), 0xd8d0bc, GANGHWA_X - 10 + i * 4, 4.2, -34 + (i % 2) * 2);
    for (let i = 0; i < 3; i++) mk(new THREE.BoxGeometry(1.6, 0.5, 4), 0x6b4a32, GANGHWA_X - 8 + i * 8, -0.25, -14 - i * 3);
  }
  // 강화도 섬의 소나무 (섬 원뿔 높이에 맞춰 심는다)
  {
    const islandH = (x, z) => 6 - 9 * Math.hypot((x - GANGHWA_X) / 1.4, (z + 40) / 0.7) / 26;
    scatter(world, { kind: 'pine', count: 30, area: { x0: GANGHWA_X - 34, x1: GANGHWA_X + 34, z0: -52, z1: -38 }, avoid: [{ x: GANGHWA_X, z: -34, r: 13 }], seed: 53, ground: islandH, scale: [0.9, 1.4] });
  }
  const ganghwaCam = { pos: [GANGHWA_X + 6, 7, 12], target: [GANGHWA_X, 2, -30] };

  // 3) 처인성: 낮은 흙성(둥글게), 남쪽 성문, 성 안 백성과 승병, 북쪽 들판
  const cheoin = new THREE.Group(); L.add(cheoin);
  {
    const segs = 40;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      if (Math.abs(a - Math.PI / 2) < 0.18) continue; // 남쪽(+z) 성문 자리
      const seg = mk(new THREE.BoxGeometry(2.1, 2.4, 1.4), 0x8a7356, CHEOIN_X + Math.cos(a) * CHEOIN_R, 1.2, Math.sin(a) * CHEOIN_R, cheoin);
      seg.rotation.y = -a + Math.PI / 2;
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.PI + 0.3 + i * 0.35;
      const who = i % 2 ? LOOKS.monk : LOOKS.villager;
      const p = makePerson(who); p.position.set(CHEOIN_X + Math.cos(a) * (CHEOIN_R - 3.4), 0, Math.sin(a) * (CHEOIN_R - 3.4)); // 성벽 가까이는 궁수 자리
      p.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); cheoin.add(p);
    }
  }
  // 다가오는 몽골군 8명 (처음엔 숨김). 들판 북쪽 반원에서 나타나 성으로 걸어온다.
  const mongols = [];
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); g.visible = false; g.scale.setScalar(1.6); L.add(g); // 멀리서도 보이게 크게
    g.rotation.order = 'YXZ'; // 화살을 맞으면 rotation.x로 뒤로 쓰러진다
    const p = makePerson(LOOKS.mongol); g.add(p);
    mk(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 4), 0x3a2c20, 0.6, 1.7, 0, g);
    const f = mk(new THREE.PlaneGeometry(0.9, 0.7), 0x2a3550, 1.05, 3.1, 0, g); f.material = new THREE.MeshLambertMaterial({ color: 0x2a3550, side: THREE.DoubleSide });
    const top = new THREE.Object3D(); top.position.set(0, 3.6, 0); g.add(top);
    const a = Math.PI + 0.55 + (i / 7) * (Math.PI - 1.1); // 성 앞쪽(북쪽, -z) 부채꼴
    mongols.push({ group: g, top, angle: a });
  }
  // 고려 궁수 5명: 북쪽 성벽 안쪽 발판 위. 싸움이 시작되면 성벽 위로 올라와 활을 쏜다(처음엔 숨김).
  const ARCHER_Y = 1.3;
  const archers = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.PI + 0.7 + i * (Math.PI - 1.4) / 4;
    const x = CHEOIN_X + Math.cos(a) * (CHEOIN_R - 1.1), z = Math.sin(a) * (CHEOIN_R - 1.1);
    mk(new THREE.BoxGeometry(1.3, ARCHER_Y, 1.3), 0x7a6449, x, ARCHER_Y / 2, z, cheoin); // 발판
    const g = new THREE.Group(); g.visible = false; g.position.set(x, 0, z); g.scale.setScalar(1.3); L.add(g);
    const p = makePerson(i % 2 ? LOOKS.monk : LOOKS.villager); g.add(p);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 4, 14, Math.PI), mat(0x5a3f2a));
    bow.rotation.set(0, Math.PI / 2, Math.PI / 2); bow.position.set(0.42, 1.35, 0.25); g.add(bow);
    const out = Math.atan2(Math.cos(a), Math.sin(a)); // 성 밖(북쪽 들판)을 바라본다
    g.rotation.y = out;
    archers.push({ group: g, angle: a, baseY: ARCHER_Y, rest: out });
  }
  // 날아가는 화살 (돌려 쓴다)
  const arrows = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); g.visible = false; g.scale.setScalar(2.6); L.add(g);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 4).rotateX(Math.PI / 2), mat(0xf0e2bc)); g.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5).rotateX(Math.PI / 2), mat(0x3a3a3a)); tip.position.z = 0.8; g.add(tip);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.3), mat(0xb8452f)); fl.position.z = -0.6; g.add(fl);
    arrows.push(g);
  }

  // 처인성 둘레 풀밭(몽골군이 다가오는 들판은 낮은 풀만)과 남쪽 숲
  scatter(world, { kind: 'grass', count: 150, area: { x0: CHEOIN_X - 40, x1: CHEOIN_X + 40, z0: -40, z1: 30 }, avoid: [{ x: CHEOIN_X, z: 0, r: CHEOIN_R + 1 }], seed: 54, scale: [0.7, 1.2] });
  scatter(world, { kind: 'flower', count: 50, area: { x0: CHEOIN_X - 30, x1: CHEOIN_X + 30, z0: 14, z1: 32 }, seed: 55 });
  scatter(world, { kind: 'pine', count: 26, area: { x0: CHEOIN_X - 50, x1: CHEOIN_X + 50, z0: 22, z1: 50 }, seed: 56, scale: [1, 1.5] });
  scatter(world, { kind: 'rock', count: 12, area: { x0: CHEOIN_X - 40, x1: CHEOIN_X + 40, z0: -40, z1: 30 }, avoid: [{ x: CHEOIN_X, z: 0, r: CHEOIN_R + 2 }], seed: 57, scale: [0.5, 1.2] });
  const cheoinFit = {
    target: [CHEOIN_X, 1, -12], dir: [0, 16, 15],
    points: [[CHEOIN_X - CHEOIN_R, 0, CHEOIN_R], [CHEOIN_X + CHEOIN_R, 0, CHEOIN_R],
      ...mongols.map(m => [CHEOIN_X + Math.cos(m.angle) * SPAWN_R, 3.6 * 1.6, Math.sin(m.angle) * SPAWN_R])],
  };

  // 4) 충주성 마당: 성벽, 관노 문서 더미, 불
  {
    for (const [dx, dz, w, d] of [[0, -14, 30, 1.4], [-15, 0, 1.4, 28], [15, 0, 1.4, 28]]) mk(new THREE.BoxGeometry(w, 4, d), 0x8c8577, CHUNGJU_X + dx, 2, dz);
    for (let i = 0; i < 6; i++) { const r = makePerson(i % 2 ? LOOKS.villager : LOOKS.monk); r.position.set(CHUNGJU_X - 6 + i * 2.4, 0, 4 + (i % 2)); r.rotation.y = Math.PI; L.add(r); }
  }
  const documents = new THREE.Group(); documents.position.set(CHUNGJU_X, 0, -3); L.add(documents);
  for (let i = 0; i < 9; i++) mk(new THREE.BoxGeometry(0.8, 0.12, 0.6), 0xf1ead8, (i % 3 - 1) * 0.5, 0.06 + Math.floor(i / 3) * 0.13, (i % 2) * 0.3, documents).rotation.y = i * 0.4;
  const flames = [];
  for (const c of [0xe2742c, 0xf2b33d]) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 6), new THREE.MeshBasicMaterial({ color: c }));
    f.position.set(CHUNGJU_X, 0.8, -3); f.visible = false; L.add(f); flames.push(f);
  }
  scatter(world, { kind: 'grass', count: 60, area: { x0: CHUNGJU_X - 14, x1: CHUNGJU_X + 14, z0: -12, z1: 12 }, avoid: [{ x: CHUNGJU_X, z: -3, r: 3 }, { x: CHUNGJU_X + 4, z: 9, r: 3 }], seed: 58, scale: [0.6, 1] });
  scatter(world, { kind: 'pine', count: 20, area: { x0: CHUNGJU_X - 40, x1: CHUNGJU_X + 40, z0: -50, z1: -18 }, seed: 59, scale: [1, 1.5] });
  const chungjuCam = { pos: [CHUNGJU_X + 4, 4.5, 9], target: [CHUNGJU_X, 1.4, -3] };

  world.addNpc('minister', LOOKS.minister, PALACE_X, -3.5, 0);
  world.addNpc('kimyunhu', LOOKS.kimyunhu, CHEOIN_X, -2, Math.PI);

  world.onUpdate((dt, t) => {
    flames.forEach((f, i) => { if (f.visible) { const s = 0.8 + Math.sin(t * 12 + i * 2) * 0.18; f.scale.set(s, s + 0.2, s); } });
  });

  return {
    areas: {
      palace: { start: [PALACE_X, 8], bounds: { x0: PALACE_X - 13, x1: PALACE_X + 13, z0: -6, z1: 14 } },
      ganghwa: { cam: ganghwaCam },
      cheoin: { center: [CHEOIN_X, 0], radius: CHEOIN_R, spawnR: SPAWN_R, fit: cheoinFit },
      chungju: { cam: chungjuCam, kimyunhu: [CHUNGJU_X + 1.8, -2.2, Math.PI * 0.85] },
    },
    mongols, archers, arrows, documents, flames,
    start: [PALACE_X, 8],
  };
}
