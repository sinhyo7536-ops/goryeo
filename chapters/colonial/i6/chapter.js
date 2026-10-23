// 일제 강점기편 6장 「한인 애국단과 한국광복군」: 충칭의 광복군 훈련장, 태극기와 천막.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

// 미니게임 무대(마을에서 떨어진 x 400)
const xy = (list, pts) => list.map((it, i) => ({ ...it, ...pts[i] }));
const FIELD = { // 훈련장: 통나무가 굴러다니는 길과 깃발 언덕
  origin: [400, 0], ground: 'earth', groundColor: 0x8a7a5a, bounds: { x0: -20, x1: 20, z0: -26, z1: 26 },
  props: [
    { type: 'tent', x: -14, z: 20, color: 0x6b6a4a }, { type: 'tent', x: 14, z: 20, color: 0x6b6a4a },
    { type: 'flagpole', x: -3, z: -22 }, { type: 'flagpole', x: 3, z: -22 },
    { type: 'crowd', x: 13, z: 10, n: 6, cols: 3, looks: ['gwangbokgun'], face: -Math.PI / 2 },
  ],
};
const FLAGS = {
  origin: [400, 0], ground: 'stone', groundColor: 0xa09888, bounds: { x0: -18, x1: 18, z0: -12, z1: 14 },
  props: [
    { type: 'flagpole', x: -11, z: -9 }, { type: 'crowd', x: -14, z: -8, n: 2, cols: 2, looks: ['gentleman', 'kimgu'] },
    { type: 'flagpole', x: 11, z: -9 }, { type: 'tent', x: 14, z: -10, color: 0x6b6a4a }, { type: 'crowd', x: 8, z: -8, n: 3, cols: 3, looks: ['gwangbokgun'] },
  ],
};

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
    { ...script.parts.run, arena: FIELD, from: [0, 22],
      route: xy(script.parts.run.route, [{ x: 0, z: 15 }, { x: 0, z: -2 }, { x: 0, z: -18 }]),
      hazards: [{ x: -14, z: 8, to: [14, 8], kind: 'log', r: 1.2, speed: 0.8 }, { x: 14, z: 2, to: [-14, 2], kind: 'log', r: 1.2, speed: 0.7 }, { x: -14, z: -9, to: [14, -9], kind: 'log', r: 1.2, speed: 0.9 }] },
    { ...script.parts.sort, arena: FLAGS, from: [0, 11], bins: xy(script.parts.sort.bins, [{ x: -11, z: -5 }, { x: 11, z: -5 }]) },
  ],
});
