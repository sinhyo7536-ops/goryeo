// 일제 강점기편 1장 「일제의 식민 통치」: 흐린 날의 항구 마을, 쌀가마를 실은 기차와 배, 큰 관청 건물.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

// 미니게임 무대(마을에서 떨어진 x 400)
const xy = (list, pts) => list.map((it, i) => ({ ...it, ...pts[i] }));
const GATES = { // 시대의 문 세 개가 선 경성 거리
  origin: [400, 0], ground: 'stone', groundColor: 0x9a948a, bounds: { x0: -22, x1: 22, z0: -16, z1: 16 },
  props: [
    { type: 'arch', x: -13, z: -12 }, { type: 'arch', x: 0, z: -13 }, { type: 'arch', x: 13, z: -12 },
    { type: 'poles', x: -20, z: 8, n: 7, gap: 6.5 },
  ],
};
const STATION = { // 기차역: 쌀가마를 실은 기차와 항구로 가는 선로
  origin: [400, 0], ground: 'earth', groundColor: 0x8a7a62, bounds: { x0: -20, x1: 20, z0: -14, z1: 16 },
  props: [
    { type: 'train', x: 0, z: -9, ry: Math.PI / 2, track: 70, cars: 3 },
    { type: 'western', x: -14, z: 10, w: 7, d: 4, h: 4, color: 0x8a4a3a }, { type: 'rice', x: 12, z: -3, n: 9 },
    { type: 'water', x: 0, z: -40, w: 200, d: 30 }, { type: 'steamship', x: 14, z: -26, ry: Math.PI / 2, solid: false },
  ],
};

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
  parts: [
    { ...script.parts.eras, arena: GATES, from: [0, 12], bins: xy(script.parts.eras.bins, [{ x: -13, z: -6 }, { x: 0, z: -7 }, { x: 13, z: -6 }]) },
    { ...script.parts.rail, arena: STATION, from: [0, 13], items: xy(script.parts.rail.items, [{ x: 8, z: -2 }, { x: -9, z: 6 }, { x: -6, z: -2 }, { x: 7, z: 8 }]) },
  ],
});
