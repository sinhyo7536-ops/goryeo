// 근대편 3장 「동학 농민 운동과 갑오개혁」: 전라도 고부의 들판, 관아와 초가 마을들.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'k3', mood: 'morning', script,
  player: { robe: 0xddd2bb, hat: 'topknot', trim: 0x8a2f24, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['peasant', 'jeonbongjun', 'farmer'],
  spot: [0, 3],
  layout: {
    ground: 'grass', groundColor: 0x8a9a52, bounds: { x0: -17, x1: 17, z0: -10, z1: 12 }, start: [0, 10],
    roads: [{ x: 0, z: 1, w: 4, d: 24 }, { x: 0, z: -2, w: 36, d: 3.5 }],
    props: [
      { type: 'hanok', x: 0, z: -9, tile: true, scale: 1.5 },
      { type: 'wall', x: -7, z: -6, w: 8 }, { type: 'wall', x: 7, z: -6, w: 8 },
      { type: 'hanok', x: -13, z: 7 }, { type: 'hanok', x: 13, z: 7 }, { type: 'hanok', x: -14, z: -6 }, { type: 'hanok', x: 14, z: -6 }, { type: 'hanok', x: -5, z: 11.5 },
      { type: 'flagpole', x: -3, z: 6, color: 0xf2efe6 }, { type: 'flagpole', x: 4, z: 6, color: 0xb8452f },
      { type: 'crowd', x: 9, z: 2, n: 6, cols: 3, looks: ['peasant', 'uibyeong', 'peasant'], face: -Math.PI / 2 },
      { type: 'rice', x: -10, z: 2, n: 6 }, { type: 'tree', x: 10, z: 11 },
    ],
    npcs: [
      { id: 'peasant', look: 'peasant', x: -6, z: 7, ry: Math.PI * 0.8 },
      { id: 'jeonbongjun', look: 'jeonbongjun', x: 4, z: 1, ry: -Math.PI / 2 },
      { id: 'farmer', look: 'uibyeong', x: -8, z: -2.5, ry: Math.PI / 2 },
    ],
    signs: [{ id: 'signDonghak', title: '동학', x: 1, z: 7.5 }, { id: 'signGabo', title: '갑오개혁', x: -3, z: -4.5 }],
    scatter: [{ kind: 'grass', count: 90, area: { x0: -17, x1: 17, z0: -10, z1: 12 }, avoid: [{ x: 0, z: 1, r: 3 }, { x: 9, z: 4, r: 4 }], seed: 221, color: 0x9aaa5a }],
  },
  parts: [
    { ...script.parts.gather, from: [0, 3], spots: [{ x: -13, z: 3.5 }, { x: 13, z: 3.5 }, { x: -12, z: -2 }, { x: 12, z: -2 }, { x: -1, z: 10 }] },
    script.parts.demands, script.parts.flow,
  ],
});
