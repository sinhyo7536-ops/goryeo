// 일제 강점기편 2장 「3·1 운동」: 탑골 공원 팔각정, 태극기를 든 사람들, 태화관.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i2', mood: 'morning', script,
  player: { robe: 0x22262e, hat: 'cap', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['student', 'leader', 'yugwansun'],
  spot: [0, 4],
  layout: {
    ground: 'stone', groundColor: 0xb0a890, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    props: [
      { type: 'pavilion', x: 0, z: -7 },
      { type: 'crowd', x: -10, z: -2, n: 12, cols: 4, flags: 0.6, looks: ['student', 'commoner', 'schoolgirl', 'woman', 'gentleman'], face: 0.3 },
      { type: 'crowd', x: 9, z: -2, n: 12, cols: 4, flags: 0.6, looks: ['commoner', 'student', 'peasant', 'schoolgirl'], face: -0.3 },
      { type: 'hanok', x: 13, z: 8, tile: true, scale: 1.3 },
      { type: 'wall', x: -9, z: 11.5, w: 14 }, { type: 'tree', x: -13, z: 7 }, { type: 'tree', x: 6, z: 10 },
      { type: 'flagpole', x: 4, z: -3 },
    ],
    npcs: [
      { id: 'student', look: 'student', x: -4, z: 6, ry: Math.PI * 0.8 },
      { id: 'leader', look: 'gentleman', x: 9.5, z: 4, ry: -Math.PI / 2 },
      { id: 'yugwansun', look: 'yugwansun', x: -3, z: -2, ry: 0 },
    ],
    signs: [{ id: 'signDeclare', title: '독립 선언', x: 4, z: 6.5 }, { id: 'signYu', title: '유관순', x: -13, z: 2.5 }, { id: 'signJeam', title: '제암리', x: 14, z: 1 }],
  },
  parts: [
    { ...script.parts.flags, from: [0, 4], spots: [{ x: -12, z: 4.5 }, { x: -6, z: 4.5 }, { x: 7, z: 4.5 }, { x: 13, z: 4.5 }, { x: 0, z: -2 }] },
    script.parts.cheer, script.parts.flow,
  ],
});
