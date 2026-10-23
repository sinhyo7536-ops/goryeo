// 현대편 4장 「1·4 후퇴와 정전 협정」: 눈 내리는 피란길, 짐을 진 사람들, 군용 트럭, 철조망.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';
import { mapSpot } from '../../kit/play.js';

// 미니게임 무대(마을에서 떨어진 x 400)
const xy = (list, pts) => list.map((it, i) => ({ ...it, ...pts[i] }));
const M = mapSpot({ x: 0, z: 0, w: 48 });
const MAP = { origin: [400, 0], ground: 'earth', groundColor: 0xd8dade, bounds: { x0: -28, x1: 28, z0: -36, z1: 36 }, map: { x: 0, z: 0, w: 48 } };
const PANMUN = { // 판문점: 가운데 휴전선(철조망)과 파란 회담 건물
  origin: [400, 0], ground: 'earth', groundColor: 0xe6e8ec, bounds: { x0: -20, x1: 20, z0: -6, z1: 18 },
  props: [
    { type: 'fence', x: 0, z: -9, w: 60, solid: false },
    { type: 'western', x: -5, z: -9, w: 4, d: 6, h: 3, color: 0x5b8fc8, solid: false }, { type: 'western', x: 5, z: -9, w: 4, d: 6, h: 3, color: 0x5b8fc8, solid: false },
    { type: 'flagpole', x: -12, z: -4 }, { type: 'flagpole', x: 12, z: -4, color: 0x5b92e5 },
    { type: 'tree', x: -17, z: 12, color: 0x6a7a6a }, { type: 'tree', x: 17, z: 10, color: 0x6a7a6a },
  ],
};

export default makeKitChapter({
  id: 'h4', mood: 'snow', script,
  player: { robe: 0x6a5a4a, hat: 'short', trim: 0x2b241c, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['soldier', 'mother', 'unSoldier'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0xe6e8ec, bounds: { x0: -16, x1: 16, z0: -8, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 1, w: 5, d: 30, color: 0xb8b4aa }],
    weather: 'snow',
    props: [
      { type: 'crowd', x: -9, z: -5, n: 10, cols: 2, looks: ['woman', 'grandma', 'commoner', 'peasant', 'citizen'], face: Math.PI * 0.95 },
      { type: 'crowd', x: 9, z: -5, n: 8, cols: 2, looks: ['commoner', 'woman', 'citizen', 'grandma'], face: Math.PI * 1.05 },
      { type: 'truck', x: -12, z: 6, ry: 0.4 },
      { type: 'fence', x: 0, z: -11, w: 30, solid: false },
      { type: 'shack', x: 13, z: 8 }, { type: 'tree', x: 13, z: 0, color: 0x6a7a6a },
    ],
    npcs: [
      { id: 'soldier', look: 'rokSoldier', x: -4, z: 6, ry: Math.PI * 0.8 },
      { id: 'mother', look: 'woman', x: 5, z: 4, ry: -Math.PI * 0.6 },
      { id: 'unSoldier', look: 'unSoldier', x: -3, z: -4, ry: 0 },
    ],
    signs: [{ id: 'signPanmun', title: '판문점', x: 4, z: -6 }, { id: 'signTruce', title: '정전', x: 9, z: 9 }],
    scatter: [{ kind: 'pine', count: 40, area: { x0: -70, x1: 70, z0: -50, z1: -14 }, seed: 541, color: 0x41604a }],
  },
  parts: [
    { ...script.parts.help, from: [0, 3], spots: [{ x: -12, z: 1 }, { x: 12, z: 3 }, { x: -7, z: -1.5 }, { x: 7, z: -1.5 }, { x: 0, z: 10 }] },
    { ...script.parts.flow, arena: MAP, from: [0, 30],
      spots: xy(script.parts.flow.spots, [M(42, 14), M(28, 24), M(41, 52), M(50, 47), M(36, 44)]) },
    { ...script.parts.truce, arena: PANMUN, from: [0, 15],
      items: xy(script.parts.truce.items, [{ x: -9, z: 2 }, { x: 0, z: 6 }, { x: 9, z: 2 }, { x: 0, z: -2 }]) },
  ],
});
