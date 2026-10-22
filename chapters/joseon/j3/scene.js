// 조선편 3장 장면: 여름날 한양. 남쪽 길가의 앙부일구(해시계), 동쪽 보루각의 자격루(물시계), 북서쪽 서운관 마당의 측우기와 관천대.
import * as THREE from 'three';
import { groundMaterial } from '../../../core/textures.js';
import { mat } from '../../../core/people.js';
import { scatter } from '../../../core/props.js';
import { LOOKS } from '../../../content/characters.js';
import { createWeather } from '../../../core/weather.js';

export function buildJ3Scene(world) {
  const L = world.level;
  const mk = (geo, color, x, y, z, parent = L, cast = true) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const hipRoof = (w, d, h, color, x, y, z, parent = L) => {
    const g = new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4); g.rotateY(Math.PI / 4);
    const r = mk(g, color, x, y + h / 2, z, parent); r.scale.set(w, h, d); return r;
  };
  world.bounds = { x0: -15, x1: 15, z0: -12, z1: 11 };

  // 땅: 흙길(남쪽)과 박석 마당(북쪽)
  {
    const g = new THREE.PlaneGeometry(160, 160, 40, 40); g.rotateX(-Math.PI / 2);
    const cols = [], c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) { c.setRGB(0.36, 0.48, 0.3); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const t = new THREE.Mesh(g, groundMaterial('grass')); t.receiveShadow = true; L.add(t);
    mk(new THREE.BoxGeometry(34, 0.06, 16), 0xa59c8a, 0, 0.03, -8, L, false);
    mk(new THREE.BoxGeometry(40, 0.05, 5), 0x8f7556, 0, 0.025, 5, L, false); // 동서로 난 흙길(앙부일구가 선 길가)
    mk(new THREE.BoxGeometry(5, 0.05, 12), 0x8f7556, 0, 0.025, 6, L, false);
  }

  // 1) 길가의 앙부일구: 돌 받침 위 가마솥 모양 청동 해시계와 그림자 바늘
  const dial = new THREE.Group(); dial.position.set(-8, 0, 5); L.add(dial);
  mk(new THREE.BoxGeometry(1.8, 0.3, 1.8), 0xb3ab99, 0, 0.15, 0, dial);
  mk(new THREE.CylinderGeometry(0.5, 0.7, 0.9, 10), 0xb3ab99, 0, 0.75, 0, dial);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.75, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(0x8a6a3a, 'grain'));
  bowl.material = bowl.material.clone(); bowl.material.side = THREE.DoubleSide;
  bowl.position.set(0, 1.95, 0); bowl.castShadow = true; dial.add(bowl);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) mk(new THREE.BoxGeometry(0.12, 0.5, 0.12), 0x6b4a32, Math.cos(a) * 0.6, 1.4, Math.sin(a) * 0.6, dial);
  const gnomon = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 5), 0x3a3028, 0, 1.75, -0.2, dial); gnomon.rotation.x = 0.66;
  world.addCollider({ x: -8, z: 5, r: 1.2 });

  // 2) 보루각과 자격루: 물항아리 계단, 나무 인형 상자, 종과 북
  const hallG = new THREE.Group(); hallG.position.set(9, 0, -4); L.add(hallG);
  mk(new THREE.BoxGeometry(10, 0.6, 7), 0xb3ada2, 0, 0.3, 0, hallG);
  for (const dx of [-4.5, -1.5, 1.5, 4.5]) for (const dz of [-3, 3]) mk(new THREE.CylinderGeometry(0.2, 0.2, 3.4, 8), 0xa8392b, dx, 2.3, dz, hallG);
  mk(new THREE.BoxGeometry(9.8, 0.35, 6.8), 0x2f6b5e, 0, 4.1, 0, hallG);
  hipRoof(12.5, 9, 2.2, 0x3d4846, 0, 4.25, 0, hallG);
  const clock = new THREE.Group(); clock.position.set(-1.5, 0.6, 0); hallG.add(clock);
  for (const [i, r] of [[0, 0.55], [1, 0.45], [2, 0.4]]) {
    mk(new THREE.BoxGeometry(1.4, 0.6 + (2 - i) * 0.7, 1.2), 0x7a5a3c, -2.2 + i * 1.3, (0.6 + (2 - i) * 0.7) / 2, 0, clock);
    mk(new THREE.CylinderGeometry(r, r * 0.9, 0.9, 12), 0x5e432c, -2.2 + i * 1.3, 0.6 + (2 - i) * 0.7 + 0.45, 0, clock);
  }
  mk(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 12), 0x5e432c, 1.6, 1.1, 0, clock);
  mk(new THREE.BoxGeometry(1.8, 2.2, 1.2), 0x8a5a3a, 3.2, 1.1, 0, clock);
  const puppet = mk(new THREE.BoxGeometry(0.3, 0.6, 0.3), 0xe6dcc3, 3.2, 2.5, 0.2, clock);
  mk(new THREE.SphereGeometry(0.18, 8, 6), 0xf0c9a2, 3.2, 2.95, 0.2, clock);
  const bell = mk(new THREE.CylinderGeometry(0.22, 0.32, 0.5, 10), 0x8a6a3a, 4.2, 2.7, 0, clock);
  mk(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 14), 0xa8392b, 4.3, 1.9, 0.5, clock).rotation.x = Math.PI / 2;
  world.addCollider({ x: 9, z: -4, r: 5.2 });

  // 3) 서운관 마당: 돌 측우대 위의 측우기, 하늘을 살피는 관천대
  const gauge = new THREE.Group(); gauge.position.set(-7, 0, -8); L.add(gauge);
  mk(new THREE.BoxGeometry(0.9, 0.9, 0.9), 0xb3ab99, 0, 0.45, 0, gauge);
  mk(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 14), 0x4a4a48, 0, 1.25, 0, gauge);
  world.addCollider({ x: -7, z: -8, r: 0.9 });
  mk(new THREE.BoxGeometry(3, 2.4, 3), 0x8c8577, -12, 1.2, -10);
  for (let i = 0; i < 4; i++) { const h = 0.6 * (i + 1); mk(new THREE.BoxGeometry(0.9, h, 0.6), 0xa59c8a, -10.1, h / 2, -7.3 - i * 0.6); } // 오르는 돌계단
  world.addCollider({ x: -12, z: -10, r: 2 });

  // 길가 초가와 담, 나무
  for (const [x, z] of [[-16, 9], [-16, 2], [16, 9], [16, 3]]) {
    mk(new THREE.BoxGeometry(4, 2.2, 3.4), 0xe6dcc3, x, 1.1, z);
    const roof = mk(new THREE.SphereGeometry(2.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xc8a476, x, 2.1, z); roof.scale.set(1, 0.55, 0.85);
  }
  for (const [x, z] of [[-12, 9], [9, 10], [12, -14]]) {
    mk(new THREE.CylinderGeometry(0.2, 0.3, 2, 6), 0x6b4a32, x, 1, z);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), mat(0x4f7344, 'grain')); crown.position.set(x, 2.8, z); crown.castShadow = true; L.add(crown);
    world.addCollider({ x, z, r: 0.5 });
  }
  scatter(world, { kind: 'pine', count: 40, area: { x0: -60, x1: 60, z0: -50, z1: -18 }, seed: 71, scale: [1.1, 1.7] });
  scatter(world, { kind: 'grass', count: 80, area: { x0: -15, x1: 15, z0: 0, z1: 12 }, avoid: [{ x: -8, z: 5, r: 2 }, { x: 0, z: 6, r: 3 }, { x: 0, z: 5, r: 2.6 }, { x: -12, z: 9, r: 1.2 }, { x: 9, z: 10, r: 1.2 }], seed: 72, color: 0x7a9450 });

  world.addNpc('commoner', LOOKS.commoner, -5.6, 6.2, Math.PI * 0.8);
  world.addNpc('jangyeongsil', LOOKS.jangyeongsil, 3, -2, -Math.PI / 2);
  world.addNpc('crownPrince', LOOKS.crownPrince, -5, -6, -Math.PI * 0.4);

  const rain = createWeather(world, 'rain', { count: 700 });
  rain.points.visible = false;
  let ring = 0;
  world.onUpdate((dt, t) => {
    if (ring > 0) {
      ring -= dt;
      puppet.position.y = ring > 0 ? 2.5 + Math.abs(Math.sin(t * 8)) * 0.15 : 2.5;
      bell.rotation.z = ring > 0 ? Math.sin(t * 14) * 0.2 : 0;
    }
  });

  return {
    start: [0, 9], dial, gauge, clock,
    setRain(on) { rain.points.visible = on; },
    ringClock() { ring = 3; },
  };
}
