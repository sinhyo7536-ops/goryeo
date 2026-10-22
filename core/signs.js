// 안내판: 나무 기둥 두 개와 제목을 쓴 판. 마을 곳곳에 세워 두고, 다가가 말을 걸 듯이 누르면 해설을 읽는다.
// 꼭 읽지 않아도 장을 마칠 수 있다(볼거리).
import * as THREE from 'three';
import { mat } from './people.js';

export function makeSign(title) {
  const g = new THREE.Group();
  for (const x of [-0.75, 0.75]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6), mat(0x5a3f2a, 'wood', 'object'));
    post.position.set(x, 1.1, 0); post.castShadow = true; g.add(post);
  }
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96;
  const c = cv.getContext('2d');
  c.fillStyle = '#e9dcc0'; c.fillRect(0, 0, 256, 96);
  c.strokeStyle = '#6b4a32'; c.lineWidth = 8; c.strokeRect(4, 4, 248, 88);
  c.fillStyle = '#2b241c'; c.font = 'bold 40px "Nanum Myeongjo", Batang, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(title, 128, 50, 230);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.MeshLambertMaterial({ map: tex });
  const edge = mat(0x6b4a32, 'wood', 'object');
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.72, 0.08), [edge, edge, edge, edge, face, face]);
  board.position.set(0, 1.75, 0); board.castShadow = true; g.add(board);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.35), mat(0x3d4846, 'tile', 'object'));
  roof.position.set(0, 2.2, 0); g.add(roof);
  g.name = `sign:${title}`;
  return g;
}
