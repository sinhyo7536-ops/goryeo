// 일제 강점기편 5장 「민족 문화를 지킨 사람들」: 학교와 학회, 서점이 있는 도시 거리.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i5', mood: 'morning', script,
  player: { robe: 0xe9e4da, hat: 'braid', trim: 0x2c3a5a, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['student', 'linguist', 'historian'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0x9a8a6a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 36, d: 5, color: 0x8a8070 }],
    props: [
      { type: 'western', x: -9, z: -9, w: 10, d: 5, h: 6, tower: true, color: 0x8a4a3a },
      { type: 'western', x: 9, z: -9, w: 8, d: 5, h: 5, color: 0x9a7a5a },
      { type: 'desk', x: 5, z: -4.5 }, { type: 'desk', x: 9, z: -4.5 },
      { type: 'hanok', x: -13, z: 8, tile: true }, { type: 'hanok', x: 13, z: 8, tile: true }, { type: 'hanok', x: -5, z: 10.5 },
      { type: 'crowd', x: -10, z: -2, n: 6, cols: 3, looks: ['student', 'schoolgirl'], face: 0.4 },
      { type: 'tree', x: 5, z: 10.5 },
    ],
    npcs: [
      { id: 'student', look: 'student', x: -4, z: 6, ry: Math.PI * 0.8 },
      { id: 'linguist', look: 'scholarModern', x: 7, z: -1.5, ry: 0 },
      { id: 'historian', look: 'gentleman', x: 9, z: 6, ry: -Math.PI * 0.6 },
    ],
    signs: [{ id: 'signGoods', title: '물산 장려 운동', x: 2, z: 7.5 }, { id: 'signJune', title: '6·10 만세 운동', x: -2, z: -4 }],
  },
  parts: [
    { ...script.parts.pages, from: [0, 3], spots: [{ x: -13, z: 4.5 }, { x: 13, z: 4.5 }, { x: 2, z: -4 }, { x: -6, z: 8 }, { x: 12, z: -3 }] },
    script.parts.match, script.parts.kinds,
  ],
});
