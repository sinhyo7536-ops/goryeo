// 만화풍 얼굴 그리기: 3D 인물 얼굴 무늬와 대화창 초상화가 같은 규칙으로 그린다.
import * as THREE from 'three';
import { LOOKS } from '../content/characters.js';

const SKIN = '#f0c9a2', SKIN_SHADE = '#d9a57f', INK = '#2b241c';

// (cx, cy)를 얼굴 가운데로, R을 얼굴 반지름으로 이목구비를 그린다.
export function drawFeatures(g, face = {}, cx, cy, R) {
  const { eyes = 'round', brows = 'normal', mouth = 'smile', beard = null, beardColor = INK } = face;
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  // 볼 홍조 (blush: true일 때만. 근엄한 표정에는 그리지 않는다)
  if (face.blush) {
    g.fillStyle = 'rgba(232, 120, 110, 0.35)';
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * 0.52 * R, cy + 0.22 * R, 0.17 * R, 0.1 * R, 0, 0, Math.PI * 2); g.fill(); }
  }
  // 수염 (입 아래)
  g.fillStyle = beardColor;
  if (beard === 'full') {
    g.beginPath();
    g.moveTo(cx - 0.62 * R, cy + 0.12 * R);
    g.quadraticCurveTo(cx - 0.6 * R, cy + 1.05 * R, cx, cy + 1.12 * R);
    g.quadraticCurveTo(cx + 0.6 * R, cy + 1.05 * R, cx + 0.62 * R, cy + 0.12 * R);
    g.quadraticCurveTo(cx, cy + 0.5 * R, cx - 0.62 * R, cy + 0.12 * R);
    g.fill();
  } else if (beard === 'goatee') {
    g.beginPath();
    g.moveTo(cx - 0.16 * R, cy + 0.55 * R); g.lineTo(cx + 0.16 * R, cy + 0.55 * R); g.lineTo(cx, cy + 1.0 * R);
    g.closePath(); g.fill();
  }
  if (beard === 'mustache' || beard === 'goatee' || beard === 'full') {
    g.beginPath();
    for (const sx of [-1, 1]) g.ellipse(cx + sx * 0.17 * R, cy + 0.3 * R, 0.18 * R, 0.06 * R, sx * 0.35, 0, Math.PI * 2);
    g.fill();
  }
  // 눈
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = Math.max(2, 0.07 * R);
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 0.33 * R, ey = cy - 0.05 * R;
    if (eyes === 'kind') {
      g.beginPath(); g.arc(ex, ey + 0.05 * R, 0.13 * R, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    } else {
      const ry = eyes === 'stern' ? 0.1 * R : 0.17 * R;
      g.beginPath(); g.ellipse(ex, ey, 0.12 * R, ry, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(ex + 0.04 * R, ey - 0.05 * R, 0.045 * R, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK;
    }
  }
  // 눈썹
  g.lineWidth = Math.max(2, 0.08 * R);
  for (const sx of [-1, 1]) {
    const bx = cx + sx * 0.33 * R, by = cy - 0.33 * R;
    g.beginPath();
    // 안쪽 끝(코 쪽)이 내려가면 근엄하고, 올라가면 걱정스러워 보인다
    if (brows === 'stern') { g.moveTo(bx - sx * 0.17 * R, by + 0.08 * R); g.lineTo(bx + sx * 0.15 * R, by - 0.07 * R); }
    else if (brows === 'worried') { g.moveTo(bx - sx * 0.17 * R, by - 0.08 * R); g.lineTo(bx + sx * 0.15 * R, by + 0.06 * R); }
    else { g.moveTo(bx - 0.16 * R, by); g.quadraticCurveTo(bx, by - 0.1 * R, bx + 0.16 * R, by); }
    g.stroke();
  }
  // 입
  g.lineWidth = Math.max(2, 0.06 * R);
  const my = cy + 0.42 * R;
  g.beginPath();
  if (mouth === 'smile') { g.arc(cx, my - 0.12 * R, 0.17 * R, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
  else if (mouth === 'open') { g.fillStyle = '#7a2a22'; g.ellipse(cx, my, 0.1 * R, 0.08 * R, 0, 0, Math.PI * 2); g.fill(); }
  else { g.moveTo(cx - 0.13 * R, my); g.lineTo(cx + 0.13 * R, my); g.stroke(); }
  g.restore();
}

// 3D 머리 앞쪽에 입힐 얼굴 무늬 (배경 투명). 같은 얼굴은 한 번만 만든다.
const faceCache = new Map();
export function faceTexture(face = {}) {
  const key = JSON.stringify(face);
  if (faceCache.has(key)) return faceCache.get(key);
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  drawFeatures(cv.getContext('2d'), face, 128, 118, 108);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  faceCache.set(key, tex);
  return tex;
}

const hex = n => `#${n.toString(16).padStart(6, '0')}`;

function drawHat(g, hat, cx, cy, R) {
  g.save();
  if (hat === 'official') {             // 복두: 검은 관과 양옆으로 뻗은 날개
    g.fillStyle = '#1e1c1a';
    g.fillRect(cx - 1.55 * R, cy - 0.95 * R, 3.1 * R, 0.12 * R);
    g.beginPath(); g.roundRect(cx - 0.72 * R, cy - 1.42 * R, 1.44 * R, 0.62 * R, 0.18 * R); g.fill();
  } else if (hat === 'helmet' || hat === 'general') {   // 투구
    g.fillStyle = hat === 'general' ? '#8a8478' : '#6b6862';
    g.beginPath(); g.ellipse(cx, cy - 0.62 * R, 0.98 * R, 0.62 * R, 0, Math.PI, 0); g.fill();
    g.fillRect(cx - 1.02 * R, cy - 0.66 * R, 2.04 * R, 0.14 * R);
    g.fillStyle = '#b8452f';
    g.beginPath(); g.arc(cx, cy - 1.28 * R, (hat === 'general' ? 0.2 : 0.13) * R, 0, Math.PI * 2); g.fill();
  } else if (hat === 'fur') {           // 털모자
    g.fillStyle = '#5a4130';
    g.beginPath(); g.roundRect(cx - 0.95 * R, cy - 1.18 * R, 1.9 * R, 0.62 * R, 0.25 * R); g.fill();
  } else if (hat === 'bald') {          // 스님: 깎은 머리
  } else if (hat === 'gat') {           // 갓: 머리카락 위에 넓은 챙과 높은 모자(말총이라 조금 비친다)
    g.fillStyle = '#1e1c1a';
    g.beginPath(); g.ellipse(cx, cy - 0.45 * R, 0.98 * R, 0.62 * R, 0, Math.PI, 0); g.fill();
    g.globalAlpha = 0.88;
    g.beginPath(); g.ellipse(cx, cy - 0.78 * R, 1.62 * R, 0.16 * R, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.roundRect(cx - 0.42 * R, cy - 1.5 * R, 0.84 * R, 0.76 * R, 0.08 * R); g.fill();
  } else if (hat === 'ikseon') {        // 익선관: 둥근 관과 위로 선 날개
    g.fillStyle = '#1e1c1a';
    g.beginPath(); g.ellipse(cx, cy - 0.5 * R, 1.0 * R, 0.72 * R, 0, Math.PI, 0); g.fill();
    g.beginPath(); g.roundRect(cx - 0.6 * R, cy - 1.32 * R, 1.2 * R, 0.5 * R, 0.2 * R); g.fill();
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * 0.42 * R, cy - 1.42 * R, 0.18 * R, 0.3 * R, sx * 0.4, 0, Math.PI * 2); g.fill(); }
  } else if (hat === 'jeollip') {       // 전립: 챙과 둥근 모자, 붉은 술
    g.fillStyle = '#2a2622';
    g.beginPath(); g.ellipse(cx, cy - 0.62 * R, 1.4 * R, 0.15 * R, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx, cy - 0.66 * R, 0.86 * R, 0.62 * R, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#b8452f'; g.beginPath(); g.arc(cx, cy - 1.36 * R, 0.17 * R, 0, Math.PI * 2); g.fill();
  } else if (hat === 'qing') {          // 청나라 모자: 낮은 원뿔과 붉은 술
    g.fillStyle = '#3a3028';
    g.beginPath(); g.moveTo(cx - 1.12 * R, cy - 0.55 * R); g.lineTo(cx + 1.12 * R, cy - 0.55 * R); g.lineTo(cx, cy - 1.3 * R); g.closePath(); g.fill();
    g.fillStyle = '#b8452f'; g.beginPath(); g.arc(cx, cy - 1.32 * R, 0.16 * R, 0, Math.PI * 2); g.fill();
  } else {                              // 맨머리와 상투
    g.fillStyle = '#1e1c1a';
    g.beginPath(); g.ellipse(cx, cy - 0.45 * R, 0.98 * R, 0.62 * R, 0, Math.PI, 0); g.fill();
    if (hat === 'topknot') { g.beginPath(); g.arc(cx, cy - 1.12 * R, 0.2 * R, 0, Math.PI * 2); g.fill(); }
  }
  g.restore();
}

// 대화창 초상화: 둥근 배경 위에 어깨, 머리, 모자, 얼굴. 같은 인물은 한 번만 그린다.
const portraitCache = new Map();
export function portraitURL(lookId) {
  if (portraitCache.has(lookId)) return portraitCache.get(lookId);
  const L = LOOKS[lookId];
  const cv = document.createElement('canvas'); cv.width = cv.height = 160;
  const g = cv.getContext('2d');
  g.fillStyle = '#e9dcc3'; g.beginPath(); g.arc(80, 80, 80, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(80, 80, 80, 0, Math.PI * 2); g.clip();
  g.fillStyle = hex(L.robe); g.beginPath(); g.ellipse(80, 168, 66, 46, 0, 0, Math.PI * 2); g.fill();
  if (L.trim) { g.fillStyle = hex(L.trim); g.fillRect(14, 150, 132, 6); }
  const cx = 80, cy = 92, R = 42;
  g.fillStyle = SKIN_SHADE; for (const sx of [-1, 1]) { g.beginPath(); g.arc(cx + sx * R * 0.98, cy + 4, 8, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = SKIN; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  drawHat(g, L.hat, cx, cy, R);
  drawFeatures(g, L.face, cx, cy + 4, R * 0.95);
  g.restore();
  const url = cv.toDataURL('image/png');
  portraitCache.set(lookId, url);
  return url;
}
