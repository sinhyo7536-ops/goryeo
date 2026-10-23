// 현대편 5장 「전쟁 뒤의 삶」: 부산 피란민 마을의 판잣집, 시장, 항구.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'h5', mood: 'morning', script,
  player: { robe: 0x5d7a9a, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['mother', 'grandma', 'student'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0x8a7a62, bounds: { x0: -16, x1: 16, z0: -7, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 34, d: 4, color: 0x7a6a56 }],
    props: [
      { type: 'water', x: 0, z: -40, w: 260, d: 50 },
      { type: 'steamship', x: 10, z: -22, ry: Math.PI / 2, solid: false },
      { type: 'shack', x: -13, z: 8 }, { type: 'shack', x: -9, z: 9 }, { type: 'shack', x: -5, z: 10 }, { type: 'shack', x: 9, z: 9 }, { type: 'shack', x: 13, z: 8 },
      { type: 'shack', x: -13, z: -4 }, { type: 'shack', x: -9, z: -6 }, { type: 'shack', x: 12, z: -5 },
      { type: 'rice', x: 4, z: -5, n: 6 }, { type: 'desk', x: 8, z: -2 },
      { type: 'crowd', x: -3, z: -5, n: 6, cols: 3, looks: ['student', 'schoolgirl'], face: Math.PI },
    ],
    npcs: [
      { id: 'mother', look: 'woman', x: -4, z: 5.5, ry: Math.PI * 0.8 },
      { id: 'grandma', look: 'grandma', x: 7, z: 5, ry: -Math.PI * 0.6 },
      { id: 'student', look: 'student', x: 1, z: -2, ry: 0 },
    ],
    signs: [{ id: 'signFamily', title: '이산가족 찾기', x: 12.5, z: 2.5 }, { id: 'signTask', title: '평화 통일', x: -11, z: 2.5 }],
  },
  parts: [
    { ...script.parts.help, from: [0, 3], spots: [{ x: -13, z: 5 }, { x: -5, z: 7 }, { x: 9, z: 6 }, { x: -9, z: -3 }, { x: 12, z: -2 }] },
    script.parts.life,
  ],
});
