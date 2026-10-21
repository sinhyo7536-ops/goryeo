// 1장 「서희의 외교 담판」. 탐험·담판·퀴즈는 Task 9에서 채운다.
import { buildCh1Scene } from './scene.js';

let scene = null;
export default {
  id: 'ch1',
  mood: 'sunset',
  buildScene(world) { scene = buildCh1Scene(world); return scene; },
};
