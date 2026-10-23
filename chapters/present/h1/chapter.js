// 현대편 1장 「8·15 광복」: 태극기를 든 사람들로 가득한 1945년 여름의 서울 거리.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'h1', mood: 'morning', script,
  player: { robe: 0xe9e4da, hat: 'short', trim: 0x2b241c, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['citizen', 'grandma', 'kimgu'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0x9a8a6a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 1, w: 40, d: 6, color: 0x8a8070 }],
    props: [
      { type: 'crowd', x: -9, z: -4, n: 15, cols: 5, flags: 0.7, looks: ['citizen', 'woman', 'student', 'gentleman', 'schoolgirl', 'grandma'], face: 0.2 },
      { type: 'crowd', x: 9, z: -4, n: 15, cols: 5, flags: 0.7, looks: ['commoner', 'student', 'woman', 'citizen', 'peasant'], face: -0.2 },
      { type: 'western', x: 0, z: -11, w: 10, d: 5, h: 6, color: 0x9a7a5a },
      { type: 'western', x: -13, z: 9, w: 6, d: 4, h: 4, color: 0x8a4a3a }, { type: 'hanok', x: 13, z: 9, tile: true }, { type: 'hanok', x: -5, z: 10.5 },
      { type: 'flagpole', x: 4, z: 6 }, { type: 'flagpole', x: -4, z: -6 },
    ],
    npcs: [
      { id: 'citizen', look: 'citizen', x: -3, z: 6, ry: Math.PI * 0.8 },
      { id: 'grandma', look: 'grandma', x: 8, z: 5.5, ry: -Math.PI * 0.6 },
      { id: 'kimgu', look: 'kimgu', x: 1, z: -4, ry: 0 },
    ],
    signs: [{ id: 'signChildren', title: '어린이날 선서', x: -10, z: 3.5 }, { id: 'signPaper', title: '다시 나온 신문', x: 13, z: 3.5 }],
  },
  parts: [
    { ...script.parts.news, from: [0, 3], spots: [{ x: -13, z: 5.5 }, { x: 13, z: 5.5 }, { x: -5, z: 7.5 }, { x: 5, z: -1 }, { x: -5, z: -1 }] },
    script.parts.change,
  ],
});
