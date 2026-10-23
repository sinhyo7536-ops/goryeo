// 현대편 6장 「민주주의와 경제 성장」: 서울 거리의 큰 건물들, 태극기를 든 시민, 넓은 찻길과 화물 트럭.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'h6', mood: 'morning', script,
  player: { robe: 0x5d7a9a, hat: 'short', trim: 0xe6dcc3, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['student', 'builder', 'citizen'],
  spot: [0, 3],
  layout: {
    ground: 'stone', groundColor: 0xa8a49a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 2, w: 34, d: 5, color: 0x55545a }],
    props: [
      { type: 'western', x: -10, z: -12, w: 9, d: 5, h: 9, color: 0xb8b0a0 },
      { type: 'western', x: 1, z: -13, w: 10, d: 6, h: 12, color: 0x9a948a },
      { type: 'western', x: 12, z: -12, w: 8, d: 5, h: 7, color: 0xa86a52 },
      { type: 'poles', x: -14, z: -7.5, n: 6, gap: 6 },
      { type: 'crowd', x: -9, z: -3.5, n: 10, cols: 2, looks: ['student', 'schoolgirl', 'citizen', 'woman'], flags: 0.6, face: 0 },
      { type: 'flagpole', x: 6, z: -6 },
      { type: 'truck', x: -12, z: 7.5, ry: Math.PI / 2, color: 0x3f6a8a },
      { type: 'western', x: 13, z: 9.5, w: 6, d: 3.5, h: 4, color: 0x8a4a3a },
      { type: 'tree', x: -14.5, z: -3 }, { type: 'tree', x: 15, z: 3 },
    ],
    npcs: [
      { id: 'student', look: 'student', x: -3, z: 6, ry: Math.PI * 0.8 },
      { id: 'builder', look: 'builder', x: 7, z: 5.5, ry: -Math.PI * 0.6 },
      { id: 'citizen', look: 'citizen', x: 1, z: -3, ry: 0 },
    ],
    signs: [{ id: 'signOlympic', title: '88 서울 올림픽', x: 11, z: -3 }, { id: 'signRoad', title: '경부고속도로', x: -8, z: 5 }],
  },
  parts: [script.parts.flow, script.parts.split],
});
