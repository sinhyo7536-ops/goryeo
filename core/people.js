// 코드로 만드는 로우폴리 인물과 걷기 동작, 머리 위 표시.
import * as THREE from 'three';

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

export function makePerson({ robe, hat, trim = 0x2b241c }) {
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
  part(new THREE.IcosahedronGeometry(0.32, 1), 0xe8c39e, 0, 2.02, 0, g);
  part(new THREE.BoxGeometry(0.08, 0.06, 0.02), 0x2b241c, -0.1, 2.06, 0.3, g);
  part(new THREE.BoxGeometry(0.08, 0.06, 0.02), 0x2b241c, 0.1, 2.06, 0.3, g);
  if (hat === 'official') {
    part(new THREE.BoxGeometry(0.5, 0.32, 0.46), 0x1e1c1a, 0, 2.38, -0.02, g);
    part(new THREE.BoxGeometry(1.2, 0.05, 0.07), 0x1e1c1a, 0, 2.38, -0.26, g);
  } else if (hat === 'helmet') {
    part(new THREE.ConeGeometry(0.38, 0.5, 7), 0x5d5a55, 0, 2.38, 0, g);
    part(new THREE.SphereGeometry(0.09, 5, 4), 0xb8452f, 0, 2.66, 0, g);
  } else if (hat === 'fur') {
    part(new THREE.CylinderGeometry(0.4, 0.36, 0.34, 8), 0x5a4130, 0, 2.3, 0, g);
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
