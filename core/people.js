// 코드로 만드는 로우폴리 인물과 걷기 동작, 머리 위 표시.
import * as THREE from 'three';
import { faceTexture } from './faces.js';

const mats = new Map();
export function mat(color) {
  if (!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({ color, flatShading: true }));
  return mats.get(color);
}

function part(geo, color, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat(color));
  m.position.set(x, y, z); m.castShadow = true;
  parent.add(m);
  return m;
}

const HEAD_Y = 2.02, HEAD_SCALE = 1.3;
let skinMat = null;
const headMat = () => skinMat || (skinMat = new THREE.MeshLambertMaterial({ color: 0xf0c9a2 }));
const faceMats = new Map();
function faceMat(face) {
  const key = JSON.stringify(face);
  // 이목구비는 조명을 받지 않게(MeshBasic) 해서 역광에서도 또렷하게 보인다
  if (!faceMats.has(key)) faceMats.set(key, new THREE.MeshBasicMaterial({ map: faceTexture(face), transparent: true, alphaTest: 0.1, depthWrite: false }));
  return faceMats.get(key);
}

export function makePerson({ robe, hat, trim = 0x2b241c, face = {} }) {
  const g = new THREE.Group();
  const legs = [], arms = [];
  for (const sx of [-0.16, 0.16]) {
    const piv = new THREE.Group(); piv.position.set(sx, 0.55, 0); g.add(piv);
    part(new THREE.BoxGeometry(0.2, 0.55, 0.22), 0x2b241c, 0, -0.28, 0, piv);
    legs.push(piv);
  }
  part(new THREE.CylinderGeometry(0.38, 0.58, 1.25, 7), robe, 0, 1.12, 0, g);
  part(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 7), trim, 0, 1.25, 0, g);
  for (const sx of [-0.5, 0.5]) {
    const piv = new THREE.Group(); piv.position.set(sx, 1.65, 0); g.add(piv);
    part(new THREE.BoxGeometry(0.18, 0.72, 0.2), robe, 0, -0.34, 0, piv);
    arms.push(piv);
  }
  // 머리 묶음: 둥근 머리 + 만화풍 얼굴 무늬 + 모자. 만화처럼 머리를 크게(1.3배) 그린다.
  const hg = new THREE.Group(); hg.name = 'headGroup';
  hg.position.set(0, HEAD_Y + 0.08, 0); hg.scale.setScalar(HEAD_SCALE); g.add(hg);
  const hp = (geo, color, x, y, z) => part(geo, color, x, y - HEAD_Y, z, hg); // y는 몸 기준 높이로 적는다
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), headMat());
  head.name = 'head'; head.castShadow = true; hg.add(head);
  const faceGeo = new THREE.SphereGeometry(0.326, 16, 12, Math.PI / 2 - 1.15, 2.3, 0.62, 1.45);
  const faceMesh = new THREE.Mesh(faceGeo, faceMat(face));
  faceMesh.name = 'face'; hg.add(faceMesh);
  if (hat === 'official') {
    hp(new THREE.BoxGeometry(0.5, 0.32, 0.46), 0x1e1c1a, 0, 2.38, -0.02);
    hp(new THREE.BoxGeometry(1.2, 0.05, 0.07), 0x1e1c1a, 0, 2.38, -0.26);
  } else if (hat === 'helmet') {
    hp(new THREE.ConeGeometry(0.38, 0.5, 7), 0x5d5a55, 0, 2.38, 0);
    hp(new THREE.SphereGeometry(0.09, 5, 4), 0xb8452f, 0, 2.66, 0);
  } else if (hat === 'general') {
    hp(new THREE.ConeGeometry(0.4, 0.55, 8), 0x8a8478, 0, 2.4, 0);
    hp(new THREE.SphereGeometry(0.11, 6, 5), 0xb8452f, 0, 2.72, 0);
    for (const sx of [-0.48, 0.48]) part(new THREE.BoxGeometry(0.34, 0.14, 0.46), 0x8a8478, sx, 1.72, 0, g);
    part(new THREE.BoxGeometry(0.62, 0.5, 0.5), 0x8a8478, 0, 1.45, 0, g);
  } else if (hat === 'fur') {
    hp(new THREE.CylinderGeometry(0.4, 0.36, 0.34, 8), 0x5a4130, 0, 2.3, 0);
  } else if (hat === 'topknot') {   // 맨머리에 상투
    hp(new THREE.SphereGeometry(0.33, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), 0x1e1c1a, 0, 2.04, -0.01);
    hp(new THREE.SphereGeometry(0.1, 8, 6), 0x1e1c1a, 0, 2.4, -0.02);
  }
  g.userData = { legs, arms, walk: 0 };
  return g;
}

export function animateWalk(person, moving, dt) {
  const u = person.userData;
  if (moving) u.walk += dt * 11;
  const k = moving ? Math.sin(u.walk) * 0.65 : 0;
  const ease = (o, v) => { o.rotation.x += (v - o.rotation.x) * 0.3; };
  ease(u.legs[0], k); ease(u.legs[1], -k);
  ease(u.arms[0], -k * 0.7); ease(u.arms[1], k * 0.7);
}

export function markerSprite(text = '!') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d');
  x.fillStyle = '#d9a441'; x.beginPath(); x.arc(32, 32, 28, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#1b1f1d'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#1b1f1d'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 32, 34);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv) }));
  s.scale.set(0.8, 0.8, 0.8);
  return s;
}

export function labelSprite(text) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 72;
  const x = cv.getContext('2d');
  x.fillStyle = 'rgba(27,31,29,.85)'; x.fillRect(0, 0, 256, 72);
  x.strokeStyle = '#d9a441'; x.lineWidth = 4; x.strokeRect(2, 2, 252, 68);
  x.fillStyle = '#f2ead9'; x.font = 'bold 34px "Nanum Myeongjo", Batang, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 128, 38);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false }));
  s.scale.set(4.4, 1.25, 1);
  return s;
}
