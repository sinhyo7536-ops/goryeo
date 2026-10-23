// 현대편 3장 「6·25 전쟁」: 낙동강 가의 국군·유엔군 진영(천막, 트럭, 모래주머니).
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'h3', mood: 'overcast', script,
  player: { robe: 0x5a6448, hat: 'steel', gear: 'rifle', trim: 0x3a3f2c, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['soldier', 'unSoldier', 'officer'],
  spot: [0, 3],
  layout: {
    ground: 'grass', groundColor: 0x6a7a4c, bounds: { x0: -16, x1: 16, z0: -8, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 4, d: 20, color: 0x7a6a50 }],
    props: [
      { type: 'water', x: 0, z: -24, w: 260, d: 14, color: 0x5a7a7a },
      { type: 'rice', x: -8, z: -9, n: 9, solid: false }, { type: 'rice', x: 8, z: -9, n: 9, solid: false },
      { type: 'tent', x: -12, z: 7, color: 0x6b6a4a }, { type: 'tent', x: 12, z: 7, color: 0x6b6a4a }, { type: 'tent', x: -12, z: 1, color: 0x6b6a4a },
      { type: 'truck', x: 11, z: -1, ry: 0.3 },
      { type: 'flagpole', x: -3, z: -5 }, { type: 'flagpole', x: 3, z: -5, color: 0x5b92e5 },
      { type: 'crowd', x: -6, z: -6, n: 4, cols: 4, looks: ['rokSoldier', 'unSoldier'], face: Math.PI },
    ],
    npcs: [
      { id: 'soldier', look: 'rokSoldier', x: -4, z: 6, ry: Math.PI * 0.8 },
      { id: 'unSoldier', look: 'unSoldier', x: 6, z: 5, ry: -Math.PI * 0.6 },
      { id: 'officer', look: 'rokSoldier', x: 0, z: -2.5, ry: 0 },
    ],
    signs: [{ id: 'signUN', title: '유엔군', x: 6.5, z: -4.5 }, { id: 'signRiver', title: '낙동강 방어선', x: -9, z: -3 }],
    scatter: [{ kind: 'pine', count: 40, area: { x0: -70, x1: 70, z0: 14, z1: 50 }, seed: 531 }],
  },
  parts: [script.parts.places, script.parts.landing, script.parts.flow],
});
