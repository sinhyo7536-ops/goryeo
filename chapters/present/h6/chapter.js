// 현대편 6장 「민주주의와 경제 성장」: 서울 거리의 큰 건물들, 태극기를 든 시민, 넓은 찻길과 화물 트럭.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';
import { mapSpot } from '../../kit/play.js';

// 미니게임 무대(마을에서 떨어진 x 400)
const xy = (list, pts) => list.map((it, i) => ({ ...it, ...pts[i] }));
const BIG = { x: 0, z: 0, w: 96 }, M = mapSpot(BIG);
const CITIES = [M(70, 82), M(65, 70), M(47, 64), M(42, 50)]; // 부산, 대구, 대전, 서울 (북쪽으로 달려 앞이 잘 보이게)
const road = (a, b) => ({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, w: 2.2, d: Math.hypot(b.x - a.x, b.z - a.z) + 2, ry: Math.atan2(b.x - a.x, b.z - a.z), y: 0.06, color: 0x55545a });
const HIGHWAY = {
  origin: [400, 0], ground: 'earth', groundColor: 0x7a8a6a, bounds: { x0: -50, x1: 50, z0: -66, z1: 66 }, map: BIG,
  roads: CITIES.slice(1).map((c, i) => road(CITIES[i], c)),
};
const STREET = {
  origin: [400, 0], ground: 'stone', groundColor: 0xa8a49a, bounds: { x0: -22, x1: 22, z0: -22, z1: 22 },
  roads: [{ x: 0, z: 0, w: 40, d: 6, color: 0x55545a }, { x: 0, z: 0, w: 6, d: 40, color: 0x55545a }],
  props: [
    { type: 'western', x: -15, z: -15, w: 8, d: 6, h: 9, color: 0xb8b0a0 }, { type: 'western', x: 15, z: -15, w: 8, d: 6, h: 12, color: 0x9a948a },
    { type: 'western', x: -15, z: 15, w: 8, d: 6, h: 7, color: 0xa86a52 }, { type: 'western', x: 15, z: 15, w: 8, d: 6, h: 10, color: 0x8a8a92 },
    { type: 'poles', x: -20, z: -4, n: 7, gap: 6.5 },
  ],
};
const SPLIT = {
  origin: [400, 0], ground: 'stone', groundColor: 0xa8a49a, bounds: { x0: -22, x1: 22, z0: -16, z1: 16 },
  props: [
    { type: 'crowd', x: -14, z: -12, n: 8, cols: 4, flags: 0.6, looks: ['student', 'citizen', 'woman', 'schoolgirl'], face: 0 },
    { type: 'flagpole', x: -10, z: -14 },
    { type: 'western', x: 12, z: -14, w: 9, d: 5, h: 6, color: 0x8a4a3a }, { type: 'truck', x: 17, z: -6, ry: 0.2, color: 0x3f6a8a },
    { type: 'poles', x: 6, z: -9, n: 3, gap: 5 },
  ],
};

export default makeKitChapter({
  id: 'h6', mood: 'morning', script,
  player: { robe: 0x5d7a9a, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['student', 'builder', 'citizen'],
  spot: [0, 3],
  layout: {
    ground: 'stone', groundColor: 0xa8a49a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 34, d: 5, color: 0x55545a }],
    props: [
      { type: 'western', x: -10, z: -12, w: 9, d: 5, h: 9, color: 0xb8b0a0 },
      { type: 'western', x: 1, z: -13, w: 10, d: 6, h: 12, color: 0x9a948a },
      { type: 'western', x: 12, z: -12, w: 8, d: 5, h: 7, color: 0xa86a52 },
      { type: 'poles', x: -14, z: -7.5, n: 6, gap: 6 },
      { type: 'crowd', x: -9, z: -3.5, n: 10, cols: 2, looks: ['student', 'schoolgirl', 'citizen', 'woman'], flags: 0.6, face: 0 },
      { type: 'flagpole', x: 6, z: -6 },
      { type: 'truck', x: -12, z: 7.5, ry: Math.PI / 2, color: 0x3f6a8a },
      { type: 'western', x: 13, z: 9.5, w: 6, d: 3.5, h: 4, color: 0x8a4a3a },
      { type: 'tree', x: -14.5, z: -3 }, { type: 'tree', x: 15, z: 3 },
    ],
    npcs: [
      { id: 'student', look: 'student', x: -3, z: 6, ry: Math.PI * 0.8 },
      { id: 'builder', look: 'builder', x: 7, z: 5.5, ry: -Math.PI * 0.6 },
      { id: 'citizen', look: 'citizen', x: 1, z: -3, ry: 0 },
    ],
    signs: [{ id: 'signOlympic', title: '88 서울 올림픽', x: 11, z: -3 }, { id: 'signRoad', title: '경부고속도로', x: -8, z: 5 }],
  },
  parts: [
    { ...script.parts.highway, arena: HIGHWAY, from: [CITIES[0].x, CITIES[0].z + 6], speed: 1.5,
      route: xy(script.parts.highway.route, CITIES),
      pickups: xy(script.parts.highway.pickups, [{ x: CITIES[0].x - 6, z: CITIES[0].z - 6 }, { x: CITIES[1].x + 7, z: CITIES[1].z - 3 }, { x: CITIES[2].x - 7, z: CITIES[2].z + 2 }]),
      hazards: [
        { x: -12, z: 9, to: [6, 9], kind: 'car', r: 1.6, speed: 0.55 },
        { x: 4, z: 30, to: [18, 15], kind: 'car', r: 1.6, speed: 0.5 },
      ] },
    { ...script.parts.flow, arena: STREET, from: [0, 19],
      spots: xy(script.parts.flow.spots, [{ x: 9, z: 8 }, { x: -9, z: -8 }, { x: -8, z: 9 }, { x: 0, z: -13 }, { x: 10, z: -6 }]) },
    { ...script.parts.split, arena: SPLIT, from: [0, 12],
      bins: xy(script.parts.split.bins, [{ x: -11, z: -5 }, { x: 11, z: -4 }]) },
  ],
});
