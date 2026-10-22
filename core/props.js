// 주변 소품 흩뿌리기: 소나무·풀·바위·덤불·들꽃을 한 종류당 한두 번의 그리기(InstancedMesh)로 많이 놓는다.
// 화질이 낮으면 적게 놓는다. 길이나 건물 자리(avoid)는 비워 둔다. 같은 seed면 늘 같은 자리.
import * as THREE from 'three';
import { mat } from './people.js';

function rng(seed) { let s = seed * 9301 + 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// 층층이 가지가 진 소나무 실루엣(한 덩어리)
function pineCrown() {
  const pts = [[0, 0], [1.6, 0.2], [0.7, 1.1], [1.25, 1.2], [0.5, 2.1], [0.9, 2.2], [0, 3.3]].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 7).translate(0, 1.2, 0);
}

const KINDS = {
  pine: () => [
    { geo: new THREE.CylinderGeometry(0.16, 0.26, 1.6, 6).translate(0, 0.8, 0), color: 0x6b4a32, kind: 'wood', shadow: true, tint: [0.9, 1.05] },
    { geo: pineCrown(), color: 0x3f6b45, kind: 'grain', shadow: true, tint: [0.8, 1.1] },
  ],
  grass: () => [{ geo: new THREE.ConeGeometry(0.22, 0.7, 3).translate(0, 0.35, 0), color: 0x6f8f4a, kind: 'grain', shadow: false, tint: [0.75, 1.15] }],
  rock: () => [{ geo: new THREE.DodecahedronGeometry(0.7, 0).translate(0, 0.25, 0), color: 0x8a857a, kind: 'stone', shadow: true, tint: [0.8, 1.1] }],
  bush: () => [{ geo: new THREE.IcosahedronGeometry(0.75, 0).translate(0, 0.45, 0), color: 0x4f7344, kind: 'grain', shadow: true, tint: [0.8, 1.15] }],
  flower: () => [{ geo: new THREE.OctahedronGeometry(0.12, 0).translate(0, 0.32, 0), color: 0xffffff, kind: 'grain', shadow: false, palette: [0xe8c547, 0xd9604a, 0xf2efe6, 0xb07cc6] }],
};

// world: createWorld 결과. area: {x0,x1,z0,z1}. avoid: [{x,z,r}]. scale: [최소, 최대] 크기. ground(x,z): 땅 높이.
export function scatter(world, { kind, count, area, avoid = [], seed = 1, scale = [0.8, 1.3], ground = () => 0, parent = world.level, color = null }) {
  const rand = rng(seed);
  const density = Math.max(0.25, world.quality.particles ?? 1);
  const n = Math.max(1, Math.round(count * density));
  const positions = [];
  for (let tries = 0; positions.length < n && tries < n * 30; tries++) {
    const x = area.x0 + rand() * (area.x1 - area.x0), z = area.z0 + rand() * (area.z1 - area.z0);
    if (avoid.some(a => Math.hypot(x - a.x, z - a.z) < a.r)) continue;
    positions.push([+x.toFixed(2), +z.toFixed(2)]);
  }
  const parts = KINDS[kind]();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const meshes = parts.map(part => {
    const mesh = new THREE.InstancedMesh(part.geo, mat(0xffffff, part.kind), positions.length);
    mesh.castShadow = part.shadow; mesh.receiveShadow = true;
    mesh.name = `props:${kind}`;
    parent.add(mesh);
    return mesh;
  });
  const r2 = rng(seed + 7);
  positions.forEach(([x, z], i) => {
    const k = scale[0] + r2() * (scale[1] - scale[0]);
    const tilt = kind === 'rock' ? r2() * 0.6 : 0;
    q.setFromAxisAngle(yAxis, r2() * Math.PI * 2);
    if (tilt) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tilt));
    s.set(k, kind === 'rock' ? k * (0.6 + r2() * 0.5) : k, k);
    p.set(x, ground(x, z), z);
    m4.compose(p, q, s);
    const shade = r2();
    parts.forEach((part, j) => {
      meshes[j].setMatrixAt(i, m4);
      if (part.palette) c.set(part.palette[Math.floor(shade * part.palette.length)]);
      else c.set(j === parts.length - 1 && color ? color : part.color).multiplyScalar(part.tint[0] + shade * (part.tint[1] - part.tint[0]));
      meshes[j].setColorAt(i, c);
    });
  });
  for (const m of meshes) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); }
  return { meshes, count: positions.length, positions };
}
