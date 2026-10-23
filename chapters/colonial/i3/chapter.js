// 일제 강점기편 3장 「대한민국 임시 정부」: 중국 상하이의 벽돌 건물 거리와 임시 정부 청사.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i3', mood: 'overcast', script,
  player: { robe: 0x3a3a44, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['messenger', 'ahnchangho', 'kimgu'],
  spot: [0, 3],
  layout: {
    ground: 'stone', groundColor: 0x9a948a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 40, d: 6, color: 0x7a746a }],
    props: [
      { type: 'western', x: 0, z: -9, w: 10, d: 5, h: 7, color: 0x8a5a4a },
      { type: 'flagpole', x: 6, z: -5 },
      { type: 'western', x: -12, z: -9, w: 7, d: 5, h: 6, color: 0x7a6a5a },
      { type: 'western', x: 12, z: -9, w: 7, d: 5, h: 6, color: 0x9a6a4a },
      { type: 'western', x: -12, z: 11, w: 7, d: 4, h: 5, color: 0x8a7a6a },
      { type: 'western', x: 12, z: 11, w: 7, d: 4, h: 5, color: 0x7a5a4a },
      { type: 'desk', x: -4, z: -5 }, { type: 'tree', x: 4, z: 11 },
    ],
    npcs: [
      { id: 'messenger', look: 'student', x: -6, z: 6, ry: Math.PI * 0.8 },
      { id: 'ahnchangho', look: 'ahnchangho', x: 7, z: 5, ry: -Math.PI * 0.6 },
      { id: 'kimgu', look: 'kimgu', x: 1, z: -4.5, ry: 0 },
    ],
    signs: [{ id: 'signOffice', title: '임시 정부 청사', x: -5, z: -1 }, { id: 'signBond', title: '독립 공채', x: 13, z: 3 }],
  },
  parts: [
    script.parts.charter,
    { ...script.parts.letters, from: [0, 3], spots: [{ x: -13, z: 5.5 }, { x: 13, z: 6 }, { x: -9, z: -4 }, { x: 10, z: -4 }, { x: 0, z: 8 }] },
    script.parts.roles,
  ],
});
