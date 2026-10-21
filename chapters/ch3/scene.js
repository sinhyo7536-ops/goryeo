// 3장 장면: 비바람 속 삼교천(고려 진영, 둑 자리, 냇물을 건너는 거란군)과 남쪽의 귀주 벌판.
import * as THREE from 'three';
import { mat, makePerson } from '../../core/people.js';
import { createWeather } from '../../core/weather.js';

const RIVER_Z = -8, RIVER_W = 6;
const DAM_X = -20;
const GUJU_Z = 62;

function seeded(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function buildCh3Scene(world) {
  const L = world.level, rand = seeded(19);
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  world.bounds = { x0: -28, x1: 28, z0: -3.5, z1: 14 };

  // 젖은 풀밭과 냇물 골짜기
  {
    const g = new THREE.PlaneGeometry(240, 240, 70, 70); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, cols = [], c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      let h = 0.1 * Math.sin(x * 0.4) * Math.cos(z * 0.3);
      const dr = Math.abs(z - RIVER_Z);
      if (dr < RIVER_W / 2 + 1.5) { const k = 1 - dr / (RIVER_W / 2 + 1.5); h -= k * k * (3 - 2 * k) * 1.4; }
      const far = Math.max(0, Math.abs(x) - 40, -z - 40, z - 90);
      h += Math.min(far * far * 0.03, 14);
      p.setY(i, h);
      const j = rand() * 0.04;
      if (dr < RIVER_W / 2 + 1.2 && h < 0.2) c.setRGB(0.45 + j, 0.42 + j, 0.36 + j);
      else c.setRGB(0.3 + j, 0.42 + j, 0.27 + j);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    t.receiveShadow = true; L.add(t);
  }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(200, RIVER_W).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x4d6a78, transparent: true, opacity: 0.88, shininess: 30 }));
  water.position.set(0, -0.45, RIVER_Z); L.add(water);

  // 고려 진영 (남쪽 강둑)
  for (const [x, z] of [[-14, 9], [-6, 12], [8, 11], [16, 8], [22, 12]]) {
    const t = mk(new THREE.ConeGeometry(2.3, 2.7, 4), 0xd8d0bc, x, 1.35, z); t.rotation.y = Math.PI / 4;
    world.addCollider({ x, z, r: 1.8 });
  }
  const flagPoles = [];
  for (const [x, z, c] of [[-10, 2, 0xb8452f], [0, 2, 0xd9a441], [10, 2, 0xb8452f]]) {
    mk(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 5), 0x5a3f2a, x, 2.2, z);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.9).translate(0.65, 0, 0), new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }));
    f.position.set(x, 3.4, z); L.add(f); flagPoles.push(f);
  }
  // 쇠가죽 묶음 6개
  const hides = [[-24, 6], [-12, 3], [-2, 7], [6, 3.5], [14, 4], [24, 5]].map(([x, z]) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); L.add(g);
    for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(1.1, 0.22, 0.8), [0x8a5a3a, 0x7a4e32, 0x94643f][k], 0, 0.12 + k * 0.22, 0, g).rotation.y = k * 0.4;
    return { x, z, mesh: g, taken: false };
  });
  // 둑 자리와 쇠가죽 둑 (처음엔 숨김)
  const damWall = new THREE.Group(); damWall.visible = false; L.add(damWall);
  for (let k = 0; k < 7; k++) mk(new THREE.BoxGeometry(1, 1.4, 0.5), 0x7a4e32, DAM_X, 0.2, RIVER_Z - RIVER_W / 2 + 0.5 + k * 0.85, damWall).rotation.y = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.25, 28), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(DAM_X, 0.08, -2.5); ring.visible = false; L.add(ring);
  // 터지는 물결
  const wave = mk(new THREE.BoxGeometry(4, 1.6, RIVER_W), 0xcfe3ec, DAM_X, 0.3, RIVER_Z, L, false);
  wave.material = new THREE.MeshLambertMaterial({ color: 0xcfe3ec, transparent: true, opacity: 0.8 });
  wave.visible = false;

  // 냇물을 건너는 거란군 (북쪽 강둑 → 남쪽)
  const zNorth = RIVER_Z - RIVER_W / 2, zSouth = RIVER_Z + RIVER_W / 2;
  const army = new THREE.Group(); L.add(army);
  for (let i = 0; i < 14; i++) {
    const k = makePerson({ robe: 0x6e5a44, hat: 'fur' });
    k.position.set(-6 + (i % 7) * 2.2, 0, -Math.floor(i / 7) * 2); k.rotation.y = 0; army.add(k);
  }
  const setCross = t => { army.position.set(4, 0, zNorth - 8 + t * (zSouth + 4 - (zNorth - 8))); };
  setCross(0);
  // 북쪽 거란 진영
  for (const [x, z] of [[-10, -30], [2, -34], [14, -31], [-20, -38], [8, -42]]) {
    mk(new THREE.CylinderGeometry(2.1, 2.1, 1.7, 9), 0x8f7556, x, 0.85, z);
    mk(new THREE.ConeGeometry(2.4, 1.5, 9), 0x5e432c, x, 2.45, z);
  }

  // 귀주 벌판: 남쪽 고려군, 북쪽 거란군, 동쪽에서 오는 지원군
  const guju = new THREE.Group(); L.add(guju);
  const gujuFlags = [], gujuKhitan = [];
  for (let i = 0; i < 12; i++) {
    const p = makePerson({ robe: 0x2f6b5e, hat: 'helmet' }); p.position.set(-11 + i * 2, 0, GUJU_Z + 6); p.rotation.y = Math.PI; guju.add(p);
    const q = makePerson({ robe: 0x6e5a44, hat: 'fur' }); q.position.set(-11 + i * 2, 0, GUJU_Z - 6); guju.add(q); gujuKhitan.push(q);
  }
  for (const [x, c] of [[-8, 0xb8452f], [0, 0xd9a441], [8, 0xb8452f]]) {
    mk(new THREE.CylinderGeometry(0.08, 0.08, 5, 5), 0x5a3f2a, x, 2.5, GUJU_Z + 8, guju);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2).translate(0.8, 0, 0), new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }));
    f.position.set(x, 3.8, GUJU_Z + 8); guju.add(f); gujuFlags.push(f);
  }
  const reinforcements = new THREE.Group(); reinforcements.visible = false; guju.add(reinforcements);
  for (let i = 0; i < 8; i++) {
    const p = makePerson({ robe: 0x3c5a7a, hat: 'helmet' }); p.position.set((i % 4) * 2, 0, Math.floor(i / 4) * 2); p.rotation.y = -Math.PI / 2; reinforcements.add(p);
  }
  reinforcements.position.set(30, 0, GUJU_Z + 4);

  const rain = createWeather(world, 'rain', { count: 900 });

  world.addNpc('gangamchan', { robe: 0x8a2f24, hat: 'general', trim: 0xd9a441 }, -4, 5, 0);
  world.addNpc('soldier', { robe: 0x7a3b2e, hat: 'helmet' }, 5, 7.5, Math.PI * 0.8);

  // 깃발 방향: 북쪽(-z)으로 휘날리면 rotation.y = +PI/2, 남쪽이면 -PI/2
  let flagDir = -Math.PI / 2;
  const scene = {
    hides, damWall, ring, wave, rain, flagPoles, gujuFlags, gujuKhitan, reinforcements, guju,
    dam: { x: DAM_X, z: -2.5, r: 1.6 },
    river: { army, setCross, zNorth, zSouth },
    damCam: { pos: [6, 12, 12], target: [-4, 0, -9] },
    gujuCam: { pos: [22, 10, GUJU_Z + 18], target: [0, 1, GUJU_Z] },
    gujuBounds: { x0: -12, x1: 12, z0: GUJU_Z + 7, z1: GUJU_Z + 12 },
    start: [0, 10],
    setFlags(northward) { flagDir = northward ? Math.PI / 2 : -Math.PI / 2; rain.setWind(northward ? -2 : 2); },
  };
  world.onUpdate((dt, t) => {
    for (const f of [...flagPoles, ...gujuFlags]) f.rotation.y += (flagDir + Math.sin(t * 3 + f.position.x) * 0.25 - f.rotation.y) * Math.min(1, dt * 3);
    if (ring.visible) ring.material.opacity = 0.55 + Math.sin(t * 4) * 0.3;
    hides.forEach((h, i) => { if (!h.taken) h.mesh.rotation.y = Math.sin(t + i) * 0.2; });
  });
  scene.setFlags(false);
  return scene;
}
