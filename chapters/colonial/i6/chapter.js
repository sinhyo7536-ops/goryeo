// 일제 강점기편 6장 「한인 애국단과 한국광복군」: 충칭의 광복군 훈련장, 태극기와 천막.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i6', mood: 'morning', script,
  player: { robe: 0x6b6a4a, hat: 'cap', gear: 'rifle', trim: 0xa8392b, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['soldier', 'kimgu', 'officer'],
  spot: [0, 3],
  layout: {
    ground: 'earth', groundColor: 0x9a8a6a, bounds: { x0: -16, x1: 16, z0: -8, z1: 11 }, start: [0, 9],
    props: [
      { type: 'flagpole', x: 0, z: -7 }, { type: 'flagpole', x: -5, z: -7 }, { type: 'flagpole', x: 5, z: -7 },
      { type: 'crowd', x: -8, z: -3, n: 10, cols: 5, looks: ['gwangbokgun'], face: 0 },
      { type: 'crowd', x: 8, z: -3, n: 10, cols: 5, looks: ['gwangbokgun'], face: 0 },
      { type: 'tent', x: -13, z: 8, color: 0x8a8a6a }, { type: 'tent', x: 13, z: 8, color: 0x8a8a6a }, { type: 'tent', x: -13, z: 2, color: 0x8a8a6a },
      { type: 'western', x: 12, z: -10, w: 7, d: 4, h: 4, color: 0x8a7a6a },
    ],
    npcs: [
      { id: 'soldier', look: 'gwangbokgun', x: -5, z: 6, ry: Math.PI * 0.8 },
      { id: 'kimgu', look: 'kimgu', x: 0, z: -3, ry: 0 },
      { id: 'officer', look: 'gwangbokgun', x: 7, z: 5, ry: -Math.PI * 0.6 },
    ],
    signs: [{ id: 'signFlag', title: '광복군 태극기', x: 3.5, z: 8.5 }, { id: 'signPacific', title: '태평양 전쟁', x: -10, z: 9 }],
  },
  parts: [
    { ...script.parts.run, from: [0, 3], spots: [{ x: -14, z: -2 }, { x: 14, z: -1 }, { x: 0, z: 10 }, { x: -9, z: 5 }, { x: 12, z: 3 }] },
    script.parts.sort,
  ],
});
