// 근대편 4장 「독립 협회와 대한 제국」: 한성의 독립문, 만민 공동회 연단, 경운궁.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'k4', mood: 'morning', script,
  player: { robe: 0x5d7a9a, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['citizen', 'seojaepil', 'gojong'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0x9a8a6a, bounds: { x0: -16, x1: 16, z0: -9, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 36, d: 5, color: 0x9a8a72 }, { x: 0, z: 5, w: 4, d: 12 }],
    props: [
      { type: 'arch', x: 0, z: -7, label: '독립문' },
      { type: 'stage', x: -10, z: -4 },
      { type: 'crowd', x: -10, z: -0.5, n: 10, cols: 5, looks: ['commoner', 'gentleman', 'student', 'woman', 'scholar'], face: Math.PI },
      { type: 'hanok', x: 11, z: -6, tile: true, scale: 1.5 },
      { type: 'flagpole', x: 7, z: -4 }, { type: 'flagpole', x: -14, z: -6 },
      { type: 'western', x: 13, z: 9, w: 6, d: 4, h: 5 },
      { type: 'hanok', x: -13, z: 9 }, { type: 'hanok', x: -6, z: 10.5 },
    ],
    npcs: [
      { id: 'citizen', look: 'commoner', x: 5, z: 7, ry: Math.PI * 0.8 },
      { id: 'seojaepil', look: 'seojaepil', x: -3.5, z: -3, ry: 0 },
      { id: 'gojong', look: 'gojong', x: 11, z: -1.5, ry: -Math.PI / 4 },
    ],
    signs: [{ id: 'signGate', title: '독립문', x: 3.5, z: -3 }, { id: 'signForum', title: '만민 공동회', x: -6.5, z: 6.5 }, { id: 'signAltar', title: '환구단', x: 14, z: 3 }],
    scatter: [{ kind: 'pine', count: 30, area: { x0: -60, x1: 60, z0: -40, z1: -14 }, seed: 241 }],
  },
  parts: [
    { ...script.parts.paper, from: [0, 3], spots: [{ x: -13, z: 5.5 }, { x: -6, z: 7 }, { x: 9, z: 6 }, { x: 13, z: 5.5 }, { x: 14.5, z: -2 }] },
    script.parts.flow,
  ],
});
