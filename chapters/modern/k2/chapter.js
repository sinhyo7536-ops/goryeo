// 근대편 2장 「갑신정변」: 해 질 녘 한성 거리와 우정총국.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'k2', mood: 'sunset', script,
  player: { robe: 0xc9d4d8, hat: 'topknot', trim: 0x3a4a5a, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['merchant', 'clerk', 'kimokgyun'],
  spot: [0, 1],
  layout: {
    ground: 'earth', groundColor: 0x8f7a5c, bounds: { x0: -15, x1: 15, z0: -7, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 34, d: 5, kind: 'stone', color: 0xa59c8a }, { x: 0, z: 6, w: 4, d: 12 }],
    props: [
      { type: 'hanok', x: 0, z: -6, tile: true, scale: 1.6, name: 'post' },
      { type: 'flagpole', x: 4, z: -4.5, color: 0xd9a441 },
      { type: 'hanok', x: -11, z: -5, tile: true }, { type: 'hanok', x: 11, z: -5, tile: true },
      { type: 'hanok', x: -12, z: 8 }, { type: 'hanok', x: 12, z: 8 },
      { type: 'rice', x: -9, z: 6, n: 6 }, { type: 'tree', x: 8, z: 10 },
    ],
    npcs: [
      { id: 'merchant', look: 'commoner', x: -7, z: 4.5, ry: Math.PI * 0.8 },
      { id: 'clerk', look: 'joseonOfficial', x: 3.5, z: -1.5, ry: 0 },
      { id: 'kimokgyun', look: 'kimokgyun', x: 9, z: 3, ry: -Math.PI / 2 },
    ],
    signs: [{ id: 'signPost', title: '우정총국', x: -4, z: -2 }, { id: 'signCoup', title: '갑신정변', x: 5, z: 7.5 }],
    scatter: [{ kind: 'pine', count: 30, area: { x0: -60, x1: 60, z0: -40, z1: -14 }, seed: 211 }],
  },
  parts: [script.parts.reform, script.parts.flow],
});
