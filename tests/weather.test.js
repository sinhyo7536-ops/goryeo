import { test, eq, ok } from './harness.js';
import { createWeather } from '../core/weather.js';
import { MOODS } from '../core/world.js';
import { makePerson } from '../core/people.js';
import { testWorld } from './bot.js';

test('weather: snow count follows quality', () => {
  const w = testWorld('low');
  const s = createWeather(w, 'snow', { count: 600 });
  eq(s.points.geometry.attributes.position.count, 180);
  w.dispose();
});

test('weather: particles stay inside the box after many steps', () => {
  const w = testWorld('medium');
  const r = createWeather(w, 'rain', { count: 200 });
  r.setWind(3);
  for (let i = 0; i < 300; i++) w.step(1 / 30, { x: 0, z: 0 });
  const p = r.points.geometry.attributes.position, c = w.camera.position;
  for (let i = 0; i < p.count; i++) {
    ok(Math.abs(p.getX(i) - c.x) <= 21 && Math.abs(p.getZ(i) - c.z) <= 21, `x/z of ${i}`);
    ok(p.getY(i) >= -1 && p.getY(i) <= 26, `y of ${i}: ${p.getY(i)}`);
  }
  w.dispose();
});

test('world: snow and storm moods exist with fog and particles', () => {
  eq(MOODS.snow.particles, 'snow');
  eq(MOODS.storm.particles, 'rain');
  eq(MOODS.snow.fog.length, 3);
  const w = testWorld(); w.setMood('snow'); w.setMood('storm'); w.dispose();
});

test('people: general hat builds', () => {
  const p = makePerson({ robe: 0x7a2a1e, hat: 'general' });
  let n = 0; p.traverse(o => { if (o.isMesh) n += 1; });
  ok(n > 12, `meshes ${n}`); // 투구·술·어깨·가슴 갑옷이 붙는다
});
