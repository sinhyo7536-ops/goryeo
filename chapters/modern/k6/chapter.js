// 근대편 6장 「을사늑약과 나라를 지키려는 노력」: 한성 거리의 학교와 신문사, 산 쪽의 의병 진영.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

// 미니게임 무대(마을에서 떨어진 x 400)
const xy = (list, pts) => list.map((it, i) => ({ ...it, ...pts[i] }));
const TWO = { // 왼쪽 산속 의병 진지, 오른쪽 학교와 신문사
  origin: [400, 0], ground: 'grass', groundColor: 0x6a7a4c, bounds: { x0: -22, x1: 22, z0: -14, z1: 14 },
  props: [
    { type: 'tent', x: -16, z: -11, color: 0x6b6a4a }, { type: 'tree', x: -20, z: -4, color: 0x34503a }, { type: 'tree', x: -10, z: -13, color: 0x34503a },
    { type: 'crowd', x: -13, z: -6.5, n: 3, cols: 3, looks: ['uibyeong'], face: 0 },
    { type: 'western', x: 13, z: -12, w: 8, d: 4, h: 4, color: 0xb8a070 }, { type: 'crowd', x: 13, z: -7.5, n: 3, cols: 3, looks: ['student', 'schoolgirl'], face: 0 },
  ],
};
const HAGUE = { // 헤이그 회의장 앞
  origin: [400, 0], ground: 'stone', groundColor: 0xb0a890, bounds: { x0: -20, x1: 20, z0: -12, z1: 14 },
  props: [
    { type: 'western', x: 0, z: -14, w: 18, d: 5, h: 8, dome: true, color: 0xc8b8a0 },
    { type: 'crowd', x: -14, z: -6, n: 1, looks: ['scholarModern'] }, { type: 'crowd', x: -7, z: -6, n: 1, looks: ['kimokgyun'] },
    { type: 'crowd', x: 0, z: -6, n: 1, looks: ['ahnchangho'] }, { type: 'crowd', x: 7, z: -6, n: 1, looks: ['jeonbongjun'] },
    { type: 'crowd', x: 14, z: -6, n: 1, looks: ['gentleman'] },
  ],
};

export default makeKitChapter({
  id: 'k6', mood: 'overcast', script,
  player: { robe: 0x22262e, hat: 'cap', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['student', 'uibyeong', 'ahnchangho'],
  spot: [0, 4],
  layout: {
    ground: 'grass', groundColor: 0x6f8a56, bounds: { x0: -16, x1: 16, z0: -8, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 3, w: 36, d: 5, color: 0x9a8a72 }, { x: 0, z: 7, w: 4, d: 8 }],
    props: [
      { type: 'western', x: 9, z: -8, w: 9, d: 5, h: 5, color: 0x8a4a3a },
      { type: 'desk', x: 6, z: -3.5 }, { type: 'desk', x: 11, z: -3.5 },
      { type: 'western', x: -2, z: -9, w: 6, d: 4, h: 4, color: 0x9a7a5a },
      { type: 'tent', x: -13, z: -5, color: 0xc8c0a8 }, { type: 'tent', x: -9, z: -7, color: 0xc8c0a8 },
      { type: 'crowd', x: -13, z: 0, n: 6, cols: 3, looks: ['uibyeong', 'peasant', 'uibyeong'], face: Math.PI / 2 },
      { type: 'hanok', x: -12, z: 9 }, { type: 'hanok', x: 12, z: 9, tile: true },
      { type: 'tree', x: -5, z: 10.5 }, { type: 'tree', x: 6, z: 10.5 },
    ],
    npcs: [
      { id: 'student', look: 'student', x: 4, z: 7, ry: Math.PI * 0.8 },
      { id: 'uibyeong', look: 'uibyeong', x: -8, z: -1.5, ry: Math.PI / 2 },
      { id: 'ahnchangho', look: 'ahnchangho', x: 8.5, z: -1, ry: 0 },
    ],
    signs: [{ id: 'signHague', title: '헤이그 특사', x: -4, z: 7 }, { id: 'signPress', title: '신문', x: -2, z: -4 }, { id: 'signAhn', title: '안중근', x: 13.5, z: 3 }],
    scatter: [{ kind: 'pine', count: 40, area: { x0: -60, x1: -18, z0: -30, z1: 20 }, seed: 261 }],
  },
  parts: [
    { ...script.parts.sort, arena: TWO, from: [0, 11], bins: xy(script.parts.sort.bins, [{ x: -13, z: -3 }, { x: 13, z: -3 }]) },
    { ...script.parts.envoys, arena: HAGUE, from: [0, 11], items: xy(script.parts.envoys.items, [{ x: -14, z: -3.5 }, { x: -7, z: -3.5 }, { x: 0, z: -3.5 }, { x: 7, z: -3.5 }, { x: 14, z: -3.5 }]) },
  ],
});
