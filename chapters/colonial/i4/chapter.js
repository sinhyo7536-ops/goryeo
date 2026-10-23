// 일제 강점기편 4장 「봉오동 전투와 청산리 대첩」: 만주 산골짜기의 독립군 진영.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'i4', mood: 'morning', script,
  player: { robe: 0x5a6448, hat: 'cap', gear: 'rifle', trim: 0x2b241c, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['soldier', 'hongbeomdo', 'kimjwajin'],
  spot: [0, 3],
  layout: {
    ground: 'grass', groundColor: 0x4f6b3e, bounds: { x0: -15, x1: 15, z0: -9, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 0, w: 4, d: 24, color: 0x7a6a50 }],
    props: [
      { type: 'tent', x: -10, z: 6, color: 0x8a8a6a }, { type: 'tent', x: -12, z: 0, color: 0x8a8a6a }, { type: 'tent', x: 11, z: 7, color: 0x8a8a6a },
      { type: 'flagpole', x: 4, z: 5 },
      { type: 'crowd', x: 8, z: -4, n: 6, cols: 3, looks: ['independenceArmy'], face: -Math.PI / 2 },
      { type: 'desk', x: -5, z: -6 },
    ],
    npcs: [
      { id: 'soldier', look: 'independenceArmy', x: -5, z: 6, ry: Math.PI * 0.8 },
      { id: 'hongbeomdo', look: 'hongbeomdo', x: 5, z: -1, ry: -Math.PI / 2 },
      { id: 'kimjwajin', look: 'kimjwajin', x: -6, z: -2.5, ry: Math.PI / 2 },
    ],
    signs: [{ id: 'signHeroes', title: '여성 독립운동가', x: 7, z: 8 }, { id: 'signUiyeol', title: '의열단', x: -12, z: -6 }],
    scatter: [
      { kind: 'pine', count: 70, area: { x0: -70, x1: 70, z0: -60, z1: 30 }, avoid: [{ x: 0, z: 1, r: 18 }], seed: 431, scale: [1.2, 1.9] },
      { kind: 'rock', count: 18, area: { x0: -15, x1: 15, z0: -9, z1: 11 }, avoid: [{ x: 0, z: 1, r: 4 }, { x: -10, z: 4, r: 4 }, { x: 10, z: 3, r: 5 }, { x: -5, z: 6, r: 2 }, { x: 5, z: -1, r: 2 }, { x: -6, z: -3, r: 2 }, { x: 7, z: 8, r: 2 }, { x: -12, z: -6, r: 2 }], seed: 432 },
    ],
  },
  parts: [
    { ...script.parts.gather, from: [0, 3], spots: [{ x: -13, z: 9 }, { x: 13, z: 1 }, { x: -13, z: -4 }, { x: 10, z: -8 }] },
    script.parts.ambush, script.parts.leaders,
  ],
});
