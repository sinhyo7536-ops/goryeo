// 조선편 2장 장면: 봄날의 궁궐. 박석 마당, 북쪽의 큰 전각(돌 기단·붉은 기둥·기와지붕), 동쪽의 집현전, 남쪽 궁궐 문과 담장.
import * as THREE from 'three';
import { groundMaterial } from '../../../core/textures.js';
import { mat } from '../../../core/people.js';
import { scatter } from '../../../core/props.js';
import { LOOKS } from '../../../content/characters.js';

export function buildJ2Scene(world) {
  const L = world.level;
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const hipRoof = (w, d, h, color, x, y, z, parent = L) => {
    const g = new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4); g.rotateY(Math.PI / 4);
    const r = mk(g, color, x, y + h / 2, z, parent); r.scale.set(w, h, d); return r;
  };
  // 전각 하나: 돌 기단, 붉은 기둥, 초록 창방, 기와지붕. 앞(+z)에 돌계단.
  const hall = (w, d, x, z, ry = 0, tall = 3.4) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; L.add(g);
    mk(new THREE.BoxGeometry(w + 2, 0.9, d + 2), 0xb3ada2, 0, 0.45, 0, g);
    for (let i = 0; i < 3; i++) mk(new THREE.BoxGeometry(3.2, 0.3, 0.8), 0xb3ab99, 0, 0.15 + i * 0.3, d / 2 + 2.2 - i * 0.6, g);
    mk(new THREE.BoxGeometry(w - 0.6, tall - 0.4, d - 0.6), 0xe6dcc3, 0, 0.9 + (tall - 0.4) / 2, 0, g);
    for (let dx = -w / 2; dx <= w / 2 + 0.01; dx += w / 4) for (const dz of [-d / 2, d / 2]) mk(new THREE.CylinderGeometry(0.22, 0.22, tall, 8), 0xa8392b, dx, 0.9 + tall / 2, dz, g);
    mk(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), 0x2f6b5e, 0, 0.9 + tall + 0.1, 0, g);
    hipRoof(w + 4, d + 3.4, 2.6, 0x3d4846, 0, 1.1 + tall, 0, g);
    return g;
  };
  world.bounds = { x0: -15, x1: 15, z0: -7.5, z1: 10 };

  // 땅: 궁궐 밖 풀밭과 박석을 깐 마당
  {
    const g = new THREE.PlaneGeometry(160, 160, 40, 40); g.rotateX(-Math.PI / 2);
    const cols = [], c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) { c.setRGB(0.36, 0.5, 0.3); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const t = new THREE.Mesh(g, groundMaterial('grass')); t.receiveShadow = true; L.add(t);
    mk(new THREE.BoxGeometry(34, 0.06, 36), 0xa59c8a, 0, 0.03, 2, L, false);
    mk(new THREE.BoxGeometry(3, 0.08, 20), 0xb3ab99, 0, 0.05, 4, L, false); // 가운데 어도(높은 길)
  }
  // 북쪽 큰 전각과 동쪽 집현전
  hall(14, 7, 0, -12, 0, 3.6);
  for (const dx of [-5, 0, 5]) world.addCollider({ x: dx, z: -12, r: 5 });
  hall(8, 5, 14, 1, -Math.PI / 2, 3);
  world.addCollider({ x: 14, z: -1, r: 3.5 }); world.addCollider({ x: 14, z: 3, r: 3.5 });
  // 집현전 앞 책상과 책
  for (const z of [-2.2, 4.2]) {
    mk(new THREE.BoxGeometry(0.8, 0.7, 1.4), 0x7a5a3c, 9.4, 0.35, z);
    for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.5, 0.08, 0.36), [0xd8c9a0, 0x2f6b5e, 0xa8392b][k], 9.4, 0.74 + k * 0.08, z - 0.3 + k * 0.3);
    world.addCollider({ x: 9.4, z, r: 0.8 });
  }
  // 서쪽 행각(긴 건물)
  mk(new THREE.BoxGeometry(4, 2.6, 22), 0xe6dcc3, -16, 1.3, 2);
  hipRoof(6, 24, 1.6, 0x3d4846, -16, 2.6, 2);
  // 남쪽 담장과 궁궐 문
  for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(14, 2.4, 1), 0x8c8577, sx * 10, 1.2, 19);
  mk(new THREE.BoxGeometry(6, 3.4, 1.6), 0xa8392b, 0, 1.7, 19);
  mk(new THREE.BoxGeometry(2.6, 2.8, 1.8), 0x3a2c20, 0, 1.4, 19);
  hipRoof(9, 4, 1.8, 0x3d4846, 0, 3.4, 19);
  // 마당 가운데 길 양쪽의 품계석
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) {
    mk(new THREE.BoxGeometry(0.4, 0.7, 0.3), 0xb3ab99, sx * 2.4, 0.35, -5 + i * 2.2);
    world.addCollider({ x: sx * 2.4, z: -5 + i * 2.2, r: 0.35 });
  }
  // 봄꽃 나무와 담장 밖 소나무, 마당 가장자리 풀꽃
  for (const [x, z] of [[-11, 13], [11, 13], [-12, -4], [8, -7]]) {
    mk(new THREE.CylinderGeometry(0.18, 0.26, 1.8, 6), 0x6b4a32, x, 0.9, z);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), mat(0xf0c8d4, 'grain'));
    crown.position.set(x, 2.5, z); crown.castShadow = true; L.add(crown);
    world.addCollider({ x, z, r: 0.5 });
  }
  scatter(world, { kind: 'pine', count: 40, area: { x0: -60, x1: 60, z0: -50, z1: -18 }, seed: 61, scale: [1.1, 1.7] });
  scatter(world, { kind: 'pine', count: 20, area: { x0: -60, x1: 60, z0: 20, z1: 50 }, seed: 62, scale: [1, 1.5] });
  scatter(world, { kind: 'flower', count: 40, area: { x0: -14, x1: 14, z0: 15, z1: 18 }, avoid: [{ x: 0, z: 17, r: 3 }], seed: 63 });

  world.addNpc('commoner', LOOKS.commoner, -5, 8.5, Math.PI);
  world.addNpc('scholar', LOOKS.scholar, 8.2, 1, -Math.PI / 2);
  world.addNpc('sejong', LOOKS.sejong, 0, -5, 0);

  return { start: [0, 7] };
}
