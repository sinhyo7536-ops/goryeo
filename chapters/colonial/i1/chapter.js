// 일제 강점기편 1장 「일제의 식민 통치」: 흐린 날의 항구 마을, 쌀가마를 실은 기차와 배, 큰 관청 건물.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i1', mood: 'overcast', script,
  player: { robe: 0xddd2bb, hat: 'short', trim: 0x7a4e32, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['farmer', 'teacher', 'porter'],
  spot: [0, 4],
  layout: {
    ground: 'earth', groundColor: 0x8a7d66, bounds: { x0: -16, x1: 16, z0: -7, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 36, d: 4, color: 0x8a8070 }],
    props: [
      { type: 'water', x: 0, z: -40, w: 260, d: 50 },
      { type: 'steamship', x: -6, z: -20, ry: Math.PI / 2, solid: false },
      { type: 'rice', x: -9, z: -6, n: 9 }, { type: 'rice', x: -4, z: -6, n: 9 },
      { type: 'train', x: 10, z: -4, ry: Math.PI / 2, cars: 2, track: 50, solid: false },
      { type: 'western', x: 13, z: 9, w: 8, d: 5, h: 6, dome: true, color: 0xb8b0a0 },
      { type: 'western', x: -2, z: 10.5, w: 6, d: 4, h: 4, color: 0x8a4a3a },
      { type: 'hanok', x: -13, z: 9 }, { type: 'hanok', x: -13, z: 3 },
    ],
    npcs: [
      { id: 'farmer', look: 'peasant', x: -8, z: 6, ry: Math.PI * 0.8 },
      { id: 'teacher', look: 'scholarModern', x: 3, z: 6.5, ry: Math.PI },
      { id: 'porter', look: 'commoner', x: -6, z: -2.5, ry: 0 },
    ],
    signs: [{ id: 'signGov', title: '조선 총독부', x: 8, z: 5 }, { id: 'signRail', title: '철도', x: 4, z: -1 }, { id: 'signForce', title: '강제 동원', x: -12, z: -1 }],
  },
  parts: [script.parts.eras, script.parts.rail],
});
