// 현대편 2장 「대한민국 정부 수립」: 둥근 지붕의 큰 청사 앞 광장, 투표소, 줄 선 사람들.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'h2', mood: 'morning', script,
  player: { robe: 0x5d7a9a, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['citizen', 'syngmanrhee', 'kimgu'],
  spot: [0, 3],
  layout: {
    ground: 'stone', groundColor: 0xb0a890, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    props: [
      { type: 'western', x: 0, z: -12, w: 14, d: 6, h: 7, dome: true, color: 0xc8c0b0 },
      { type: 'flagpole', x: -4, z: -6.5 }, { type: 'flagpole', x: 4, z: -6.5 },
      { type: 'desk', x: -11, z: -2 }, { type: 'desk', x: -8, z: -2 },
      { type: 'crowd', x: -10, z: 2, n: 8, cols: 2, looks: ['citizen', 'woman', 'grandma', 'gentleman'], face: Math.PI },
      { type: 'hanok', x: 13, z: 9, tile: true }, { type: 'western', x: -13, z: 10, w: 6, d: 3.5, h: 4, color: 0x8a4a3a },
      { type: 'tree', x: 13, z: 1 },
    ],
    npcs: [
      { id: 'citizen', look: 'citizen', x: -2, z: 6, ry: Math.PI * 0.8 },
      { id: 'syngmanrhee', look: 'syngmanrhee', x: 7, z: 4, ry: -Math.PI / 2 },
      { id: 'kimgu', look: 'kimgu', x: 3, z: -3, ry: 0 },
    ],
    signs: [{ id: 'signElection', title: '5·10 총선거', x: -5, z: -2 }, { id: 'signJeju', title: '제주 4·3 사건', x: 12, z: 6 }, { id: 'signConstitution', title: '제헌 헌법', x: 8, z: -3 }],
  },
  parts: [
    script.parts.flow, script.parts.views,
    { ...script.parts.vote, from: [0, 3], spots: [{ x: -6, z: 2 }, { x: -9.5, z: -0.5 }, { x: -13, z: -3 }] },
  ],
});
