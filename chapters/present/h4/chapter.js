// 현대편 4장 「1·4 후퇴와 정전 협정」: 눈 내리는 피란길, 짐을 진 사람들, 군용 트럭, 철조망.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

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
    script.parts.flow, script.parts.truce,
  ],
});
