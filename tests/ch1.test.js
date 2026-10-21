import { test, eq, ok } from './harness.js';
import { createWorld } from '../core/world.js';
import { buildCh1Scene } from '../chapters/ch1/scene.js';

export function fakeRenderer() {
  let ratio = 1;
  return {
    domElement: document.createElement('canvas'), shadowMap: { enabled: false, type: null },
    setPixelRatio(r) { ratio = r; }, getPixelRatio() { return ratio; }, setSize() {}, render() {}, dispose() {}, forceContextLoss() {},
  };
}
export function testWorld(quality = 'medium') {
  return createWorld(document.getElementById('sandbox'), { quality, renderer: fakeRenderer() });
}

test('ch1: scene builds with 4 npcs and hidden pillars', () => {
  const w = testWorld();
  const s = buildCh1Scene(w);
  eq([...w.npcs.keys()].sort(), ['archer', 'officer', 'seohui', 'soldier']);
  eq(s.gangdongPillars.visible, false);
  eq(s.gangdongPillars.children.filter(c => c.isSprite).length, 6);
  ok(s.khitanGroup.children.length > 0);
  eq(w.bounds, { x0: -30.8, x1: 30.8, z0: -14.4, z1: 22 });
  w.dispose();
});

test('ch1: player can reach the ferry from the start', () => {
  const w = testWorld();
  const s = buildCh1Scene(w);
  w.player.position.set(0, 0, 19);
  for (let i = 0; i < 600; i++) {
    const dx = s.ferry.x - w.player.position.x, dz = s.ferry.z - w.player.position.z, d = Math.hypot(dx, dz);
    if (d < s.ferry.r) break;
    w.step(1 / 30, { x: dx / d, z: dz / d });
  }
  ok(Math.hypot(s.ferry.x - w.player.position.x, s.ferry.z - w.player.position.z) < s.ferry.r, 'ferry reached');
  w.dispose();
});

test('ch1: low quality scene builds with flat water and fewer embers', () => {
  const lo = testWorld('low'); const a = buildCh1Scene(lo);
  const hi = testWorld('high'); const b = buildCh1Scene(hi);
  ok(a.emberCount < b.emberCount, `${a.emberCount} < ${b.emberCount}`);
  lo.dispose(); hi.dispose();
});
