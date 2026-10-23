// 근대편 5장 「근대 문물과 달라진 생활」: 전차가 다니는 한성 거리, 전봇대, 성당과 학교.
import { makeKitChapter } from '../../kit/chapter.js';
import script from './script.js';

export default makeKitChapter({
  id: 'k5', mood: 'morning', script,
  player: { robe: 0x22262e, hat: 'cap', trim: 0xd9a441, face: { eyes: 'stern', brows: 'stern', mouth: 'flat' } },
  order: ['gentleman', 'woman', 'student'],
  spot: [0, 5],
  layout: {
    ground: 'earth', groundColor: 0x9a8a6a, bounds: { x0: -16, x1: 16, z0: -6, z1: 11 }, start: [0, 9],
    roads: [{ x: 0, z: 0, w: 60, d: 6, color: 0x9a8a72 }, { x: 0, z: 6, w: 4, d: 10 }],
    props: [
      { type: 'tram', x: 0, z: 0, ry: Math.PI / 2, track: 60, solid: false, name: 'tram' },
      { type: 'poles', x: -15, z: -3.6, n: 6, gap: 6 },
      { type: 'western', x: -9, z: -9, w: 8, d: 6, h: 6, tower: true, color: 0x8a4a3a },
      { type: 'western', x: 10, z: -9, w: 9, d: 5, h: 5, color: 0x9a6a4a },
      { type: 'hanok', x: -13, z: 8, tile: true }, { type: 'hanok', x: 13, z: 8, tile: true }, { type: 'hanok', x: -6, z: 10.5 },
      { type: 'desk', x: 6, z: -5 }, { type: 'tree', x: 6, z: 10.5 },
    ],
    npcs: [
      { id: 'gentleman', look: 'gentleman', x: -5, z: 5, ry: Math.PI * 0.8 },
      { id: 'woman', look: 'woman', x: 6, z: 4, ry: -Math.PI * 0.7 },
      { id: 'student', look: 'student', x: 8, z: -2.5, ry: 0 },
    ],
    signs: [{ id: 'signTram', title: '전차', x: -1.5, z: 4 }, { id: 'signChurch', title: '서양식 건물', x: -9, z: -4.5 }, { id: 'signLife', title: '달라진 생활', x: 12.5, z: 4 }],
  },
  parts: [script.parts.match, script.parts.tram, script.parts.then],
  // 전차가 선로 위를 천천히 오간다
  decorate(world, built) {
    const car = built.named.tram && built.named.tram.userData.car;
    if (car) world.onUpdate((dt, t) => { car.position.z = Math.sin(t * 0.15) * 22; });
    return {};
  },
});
