// 눈과 비: 카메라 주변 40×40 상자 안에서 떨어지고, 바닥에 닿으면 다시 위에서 내린다.
import * as THREE from 'three';

const KINDS = {
  snow: { speed: 1.5, size: 0.18, color: 0xffffff, opacity: 0.9, sway: 0.6 },
  rain: { speed: 18, size: 0.08, color: 0xb8c6d4, opacity: 0.6, sway: 0 },
};
const HALF = 20, TOP = 25;

export function createWeather(world, kind, { count = 600 } = {}) {
  const k = KINDS[kind];
  const n = Math.max(1, Math.round(count * world.quality.particles));
  const pos = new Float32Array(n * 3);
  let seed = 3;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const c = world.camera.position;
  for (let i = 0; i < n; i++) {
    pos[i * 3] = c.x + (rand() * 2 - 1) * HALF;
    pos[i * 3 + 1] = rand() * TOP;
    pos[i * 3 + 2] = c.z + (rand() * 2 - 1) * HALF;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: k.color, size: k.size, transparent: true, opacity: k.opacity, depthWrite: false }));
  points.frustumCulled = false;
  world.level.add(points);
  let wind = 0;
  const wrap = (v, center) => (v - center > HALF ? v - 2 * HALF : v - center < -HALF ? v + 2 * HALF : v);
  world.onUpdate((dt, t) => {
    const cam = world.camera.position;
    for (let i = 0; i < n; i++) {
      let y = pos[i * 3 + 1] - k.speed * dt;
      if (y < 0) y += TOP;
      pos[i * 3 + 1] = y;
      pos[i * 3] = wrap(pos[i * 3] + (wind + Math.sin(t + i) * k.sway) * dt, cam.x);
      pos[i * 3 + 2] = wrap(pos[i * 3 + 2], cam.z);
    }
    geo.attributes.position.needsUpdate = true;
  });
  return { points, setWind(x) { wind = x; } };
}
