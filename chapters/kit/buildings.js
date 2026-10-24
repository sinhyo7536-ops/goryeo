// 건물·소품 모양(근대·일제 강점기·현대편 장 부품 상자에서 쓴다). 상자 하나로 끝내지 않고 기단·기둥·창살·처마를 갖춘다.
// 태블릿 성능을 위해 한 건물의 조각들을 재질별로 하나로 합쳐(merge) 그린다: 건물 하나에 그리기 서너 번.
// 모두 (0,0,0) 기준, 앞은 +z. 부딪힘 자리는 town.js가 정한다(예전 크기와 같게 두어 이동·미니게임이 그대로 되게).
import * as THREE from 'three';
import { mat } from '../../core/people.js';
import { worldMapped } from '../../core/textures.js';

const V = new THREE.Vector3(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4();

// 여러 도형을 한 덩어리로 합친다
export function merge(geos) {
  const pos = [], nor = [], uv = [], idx = [];
  let base = 0;
  for (const g of geos) {
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + base);
    else for (let i = 0; i < p.count; i++) idx.push(i + base);
    base += p.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  out.setIndex(idx);
  return out;
}

// 매끈한 면(지붕 곡선)용 재질: 무늬는 같고 면을 각지게 하지 않는다
const smoothMats = new Map();
function smoothMat(color, kind) {
  const key = `${color}:${kind}`;
  if (!smoothMats.has(key)) smoothMats.set(key, worldMapped(new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }), kind));
  return smoothMats.get(key);
}

// 창살 문·창(종이 바른 격자): 그림 파일 없이 캔버스로
let latticeMat = null, glassMat = null;
function lattice() {
  if (latticeMat) return latticeMat;
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 96;
  const c = cv.getContext('2d');
  c.fillStyle = '#efe6cf'; c.fillRect(0, 0, 64, 96);
  c.fillStyle = '#6b4a32';
  for (let x = 0; x <= 64; x += 10.6) c.fillRect(Math.round(x) - 1, 0, 2, 96);
  for (let y = 0; y <= 96; y += 12) c.fillRect(0, Math.round(y) - 1, 64, 2);
  c.lineWidth = 6; c.strokeStyle = '#5a3f2a'; c.strokeRect(0, 0, 64, 96);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  latticeMat = new THREE.MeshLambertMaterial({ map: t });
  return latticeMat;
}
// 서양식 유리창: 네 칸 창틀과 하늘이 비친 유리
function glass() {
  if (glassMat) return glassMat;
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 96;
  const c = cv.getContext('2d');
  const gr = c.createLinearGradient(0, 0, 64, 96); gr.addColorStop(0, '#9fb8c8'); gr.addColorStop(0.5, '#3f5a6e'); gr.addColorStop(1, '#2a3a48');
  c.fillStyle = gr; c.fillRect(0, 0, 64, 96);
  c.fillStyle = '#e9e2d2'; c.fillRect(30, 0, 4, 96); c.fillRect(0, 46, 64, 4);
  c.lineWidth = 6; c.strokeStyle = '#e9e2d2'; c.strokeRect(0, 0, 64, 96);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  glassMat = new THREE.MeshLambertMaterial({ map: t });
  return glassMat;
}

// 조각 모음: add(도형, 색, 무늬, [x,y,z], [rx,ry,rz])로 모으고 into(g)로 재질별 한 덩어리씩 넣는다
function parts() {
  const groups = new Map();
  const api = {
    add(geo, color, kind, [x, y, z], [rx, ry, rz] = [0, 0, 0], opt = {}) {
      M.compose(V.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S);
      geo.applyMatrix4(M);
      const key = opt.material ? `m:${opt.material.uuid}` : `${color}:${kind}:${opt.smooth ? 1 : 0}`;
      if (!groups.has(key)) groups.set(key, { geos: [], color, kind, smooth: opt.smooth, material: opt.material, shadow: opt.shadow !== false });
      groups.get(key).geos.push(geo);
      return api;
    },
    box(w, h, d, color, kind, at, rot, opt) { return api.add(new THREE.BoxGeometry(w, h, d), color, kind, at, rot, opt); },
    cyl(r0, r1, h, seg, color, kind, at, rot, opt) { return api.add(new THREE.CylinderGeometry(r0, r1, h, seg), color, kind, at, rot, opt); },
    into(g) {
      for (const p of groups.values()) {
        const m = new THREE.Mesh(merge(p.geos), p.material || (p.smooth ? smoothMat(p.color, p.kind) : mat(p.color, p.kind)));
        m.castShadow = p.shadow; m.receiveShadow = true; g.add(m);
      }
      return g;
    },
  };
  return api;
}

// 처마가 들린 우진각 지붕 면. W×D 바닥, 높이 H. profile: 'tile'(오목, 처마 끝이 들림) 또는 'thatch'(둥글게 부푼 초가)
// 위면과 서까래가 보이는 아랫면(두께 thick)을 함께 돌려준다.
export function roofSurface({ W, D, H, lift = 0, profile = 'tile', thick = 0.14, nx = 18, nz = 14 }) {
  const half = D / 2;
  const height = (x, z) => {
    const t = Math.max(0, Math.min(1, Math.min((W / 2 - Math.abs(x)) / half, (D / 2 - Math.abs(z)) / half)));
    const prof = profile === 'thatch' ? Math.pow(t, 0.75) : Math.pow(t, 1.35);
    const cx = Math.abs(x) / (W / 2), cz = Math.abs(z) / (D / 2);
    const corner = Math.pow(cx, 3) * Math.pow(cz, 3); // 네 귀퉁이 처마가 하늘로 들린다(추녀)
    const edge = Math.pow(Math.max(cx, cz), 6) * 0.25;  // 처마 선 전체도 살짝 휜다(앙곡)
    return H * prof + lift * (corner + edge) * Math.pow(1 - t, 2);
  };
  const mk = (dy, flip) => {
    const g = new THREE.PlaneGeometry(W, D, nx, nz); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)) + dy);
    if (flip) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const a = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = a; } }
    g.computeVertexNormals();
    return g;
  };
  return { top: mk(0, false), under: mk(-thick, true), ridgeY: H, ridgeLen: Math.max(0.4, W - D) };
}

const WOOD = 0x6b4a32, DARKWOOD = 0x4e3826, PLASTER = 0xe9e2cf, STONE = 0xb3ab99, TILE = 0x3d4846, RIDGE = 0x2c3331;

// 한옥: 돌 기단과 계단, 둥근 기둥, 툇마루, 창살 문과 창, 흰 회벽과 나무 틀, 처마가 들린 기와지붕(또는 둥근 초가지붕)
export function hanok(g, p = {}) {
  const P = parts(), tile = !!p.tile;
  const base = tile ? 0.45 : 0.3, wallTop = base + 1.95;
  // 기단(기와집은 다듬은 돌, 초가는 흙과 막돌)과 앞 계단
  P.box(4.7, base, 3.9, tile ? STONE : 0x9a8a6e, 'stone', [0, base / 2, 0]);
  P.box(1.5, base * 0.5, 0.45, tile ? 0xc2baa8 : 0x9a8a6e, 'stone', [0.7, base * 0.25, 2.17]);
  if (tile) P.box(1.5, base * 0.5, 0.4, 0xc2baa8, 'stone', [0.7, base * 0.75, 1.92]);
  // 몸채: 앞은 툇마루만큼 들어가 있다
  const wallColor = tile ? PLASTER : 0xcdb58e;
  P.box(3.9, 1.95, 2.5, wallColor, tile ? 'grain' : 'earth', [0, base + 0.975, -0.3]);
  // 툇마루
  P.box(4.0, 0.12, 0.7, 0x8a6a48, 'wood', [0, base + 0.42, 1.25]);
  P.box(4.0, 0.36, 0.08, DARKWOOD, 'wood', [0, base + 0.18, 1.58]);
  // 기둥: 앞줄 넷, 뒷줄 넷, 옆 가운데
  const colR = tile ? 0.11 : 0.1;
  for (const x of [-1.95, -0.65, 0.65, 1.95]) for (const z of [1.55, -1.55]) P.cyl(colR, colR * 1.1, 1.95, 8, WOOD, 'wood', [x, base + 0.975, z]);
  for (const x of [-1.95, 1.95]) P.cyl(colR, colR * 1.1, 1.95, 8, WOOD, 'wood', [x, base + 0.975, 0]);
  // 나무 틀: 벽 아래·위 가로대(인방)와 처마 밑 도리
  for (const z of [0.96, -1.56]) for (const y of [base + 0.12, wallTop - 0.1]) P.box(3.96, 0.13, 0.1, WOOD, 'wood', [0, y, z]);
  for (const x of [-1.96, 1.96]) for (const y of [base + 0.12, wallTop - 0.1]) P.box(0.1, 0.13, 2.55, WOOD, 'wood', [x, y, -0.3]);
  for (const z of [1.55, -1.55]) P.box(4.3, 0.16, 0.16, DARKWOOD, 'wood', [0, wallTop + 0.06, z]);
  for (const x of [-1.95, 1.95]) P.box(0.16, 0.16, 3.4, DARKWOOD, 'wood', [x, wallTop + 0.06, 0]);
  // 창살 문 두 짝(앞)과 옆·뒤 창
  for (const x of [-0.65, 0.65]) P.box(0.95, 1.45, 0.05, 0, null, [x, base + 0.95, 0.98], [0, 0, 0], { material: lattice() });
  for (const x of [-1.5, 1.5]) P.box(0.6, 0.7, 0.05, 0, null, [x, base + 1.15, 0.98], [0, 0, 0], { material: lattice() });
  for (const s of [-1, 1]) P.box(0.05, 0.6, 0.8, 0, null, [s * 1.98, base + 1.2, -0.3], [0, 0, 0], { material: lattice() });
  P.box(0.7, 0.55, 0.05, 0, null, [0.9, base + 1.25, -1.58], [0, 0, 0], { material: lattice() });
  // 지붕
  if (tile) {
    const r = roofSurface({ W: 6.0, D: 4.9, H: 1.55, lift: 0.55, profile: 'tile' });
    P.add(r.top, TILE, 'tile', [0, wallTop + 0.12, 0], [0, 0, 0], { smooth: true });
    P.add(r.under, 0x7a5a3c, 'wood', [0, wallTop + 0.12, 0], [0, 0, 0], { smooth: true, shadow: false });
    // 용마루와 양 끝의 망와
    const ry = wallTop + 0.12 + r.ridgeY;
    P.box(r.ridgeLen + 0.5, 0.3, 0.34, RIDGE, 'tile', [0, ry + 0.08, 0]);
    P.box(r.ridgeLen + 0.7, 0.1, 0.42, 0xd8d0bc, 'stone', [0, ry - 0.06, 0]);
    for (const s of [-1, 1]) P.box(0.22, 0.42, 0.42, RIDGE, 'tile', [s * (r.ridgeLen / 2 + 0.3), ry + 0.18, 0], [0, 0, s * 0.25]);
  } else {
    const r = roofSurface({ W: 5.4, D: 4.3, H: 1.9, profile: 'thatch', thick: 0.3 });
    P.add(r.top, 0xd2b07a, 'thatch', [0, wallTop + 0.05, 0], [0, 0, 0], { smooth: true });
    P.add(r.under, 0x8a6a48, 'grain', [0, wallTop + 0.05, 0], [0, 0, 0], { smooth: true, shadow: false });
    // 지붕을 묶은 새끼줄(용마름)
    P.cyl(0.14, 0.14, r.ridgeLen + 0.6, 8, 0xa8885a, 'grain', [0, wallTop + 0.05 + r.ridgeY, 0], [0, 0, Math.PI / 2]);
  }
  return P.into(g);
}

// 서양식 벽돌 건물: 받침돌, 모서리 기둥, 층마다 띠, 창틀·창턱·창 위 돌, 계단과 차양이 있는 문, 낮은 지붕(탑이나 둥근 지붕이 없으면)
export function western(g, p = {}) {
  const P = parts();
  const w = p.w || 8, d = p.d || 5, h = p.h || 5, color = p.color || 0x9a4a32, trim = 0xd8d0bc;
  P.box(w + 0.4, 0.5, d + 0.4, 0xa39b8c, 'stone', [0, 0.25, 0]);
  P.box(w, h - 0.5, d, color, 'stone', [0, 0.5 + (h - 0.5) / 2, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.box(0.45, h, 0.45, trim, 'stone', [sx * (w / 2 - 0.1), h / 2, sz * (d / 2 - 0.1)]);
  const floors = Math.max(1, Math.floor(h / 2.4));
  for (let f = 1; f < floors; f++) P.box(w + 0.12, 0.16, d + 0.12, trim, 'stone', [0, f * 2.2 + 0.2, 0]);
  P.box(w + 0.5, 0.35, d + 0.5, trim, 'stone', [0, h, 0]); // 처마 돌림띠
  // 창: 앞면·뒷면·옆면
  const win = (x, y, z, ry) => {
    const n = [Math.sin(ry), 0, Math.cos(ry)];
    const at = k => [x + n[0] * k, y, z + n[2] * k];
    P.box(0.92, 1.3, 0.05, trim, 'stone', at(0.02), [0, ry, 0]);
    P.box(0.7, 1.1, 0.05, 0, null, at(0.05), [0, ry, 0], { material: glass() });
    P.box(1.0, 0.1, 0.22, trim, 'stone', [x + n[0] * 0.1, y - 0.68, z + n[2] * 0.1], [0, ry, 0]);
    P.box(1.04, 0.2, 0.12, trim, 'stone', [x + n[0] * 0.06, y + 0.74, z + n[2] * 0.06], [0, ry, 0]);
  };
  const cols = Math.max(1, Math.floor((w - 1) / 1.6));
  for (let f = 0; f < floors; f++) {
    const y = 1.5 + f * 2.2;
    for (let i = 0; i < cols; i++) {
      const x = -((cols - 1) * 1.6) / 2 + i * 1.6;
      if (!(f === 0 && Math.abs(x) < 0.9)) win(x, y, d / 2, 0); // 문 자리는 비운다
      win(x, y, -d / 2, Math.PI);
    }
    const sc = Math.max(1, Math.floor((d - 1) / 1.6));
    for (let i = 0; i < sc; i++) { const z = -((sc - 1) * 1.6) / 2 + i * 1.6; win(w / 2, y, z, Math.PI / 2); win(-w / 2, y, z, -Math.PI / 2); }
  }
  // 문: 문틀, 두 짝 문, 계단, 세모 차양
  P.box(1.6, 2.3, 0.1, trim, 'stone', [0, 1.65, d / 2 + 0.03]);
  P.box(1.3, 2.0, 0.08, 0x3a2c20, 'wood', [0, 1.5, d / 2 + 0.07]);
  P.box(0.04, 2.0, 0.1, 0x22180f, 'wood', [0, 1.5, d / 2 + 0.1]);
  P.box(2.2, 0.25, 0.6, 0xa39b8c, 'stone', [0, 0.38, d / 2 + 0.5]);
  P.box(2.6, 0.25, 0.6, 0xa39b8c, 'stone', [0, 0.13, d / 2 + 0.9]);
  P.box(2.0, 0.12, 0.7, trim, 'stone', [0, 2.78, d / 2 + 0.36]); // 문 위 차양
  const tri = new THREE.Shape([new THREE.Vector2(-1.05, 0), new THREE.Vector2(1.05, 0), new THREE.Vector2(0, 0.55)]);
  P.add(new THREE.ExtrudeGeometry(tri, { depth: 0.16, bevelEnabled: false }), trim, 'stone', [0, 2.84, d / 2 + 0.55]); // 세모 박공
  // 지붕: 탑·둥근 지붕이 없는 건물은 낮은 슬레이트 지붕
  if (!p.tower && !p.dome && !p.flat) {
    const r = roofSurface({ W: w + 0.6, D: d + 0.6, H: Math.min(2.2, d * 0.35), profile: 'tile', thick: 0.1 });
    P.add(r.top, 0x4a4f55, 'tile', [0, h + 0.17, 0], [0, 0, 0], { smooth: true });
    P.add(r.under, 0x5a4a3a, 'wood', [0, h + 0.17, 0], [0, 0, 0], { smooth: true, shadow: false });
    for (const s of [-1, 1]) P.box(0.5, 1.4, 0.5, color, 'stone', [s * w * 0.28, h + 1.1, -d * 0.12]); // 굴뚝
  }
  if (p.tower) {
    P.box(1.9, 3, 1.9, color, 'stone', [0, h + 1.5, 0]);
    for (const s of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) P.box(0.5, 0.9, 0.05, 0, null, [Math.sin(s) * 0.98, h + 1.9, Math.cos(s) * 0.98], [0, s, 0], { material: glass() });
    P.box(2.2, 0.25, 2.2, trim, 'stone', [0, h + 3.1, 0]);
    P.add(new THREE.ConeGeometry(1.45, 3.4, 4), 0x3d4846, 'tile', [0, h + 4.9, 0], [0, Math.PI / 4, 0]);
  }
  if (p.dome) {
    P.cyl(1.9, 1.9, 1.4, 16, trim, 'stone', [0, h + 0.7, 0]);
    P.add(new THREE.SphereGeometry(1.9, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), 0x6f8a86, 'grain', [0, h + 1.4, 0], [0, 0, 0], { smooth: true });
    P.cyl(0.08, 0.08, 1.2, 6, 0x3a3a3a, 'grain', [0, h + 3.8, 0]);
  }
  return P.into(g);
}

// 활엽수: 굽은 줄기와 가지, 잎 덩어리 여럿(색이 조금씩 다르다). seed가 같으면 같은 모양.
export function tree(g, p = {}) {
  const P = parts();
  let s = Math.abs(Math.round((p.x || 0) * 13 + (p.z || 0) * 7)) + 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const base = new THREE.Color(p.color || 0x4f7344);
  P.cyl(0.2, 0.34, 2.4, 7, 0x5e4330, 'wood', [0, 1.2, 0], [0.05, 0, -0.06]);
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + r();
    P.cyl(0.07, 0.13, 1.4, 5, 0x5e4330, 'wood', [Math.sin(a) * 0.45, 2.55, Math.cos(a) * 0.45], [Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7]);
  }
  const blobs = [[0, 3.5, 0, 1.45], [0.9, 3.1, 0.3, 1.0], [-0.8, 3.2, -0.4, 1.05], [0.2, 4.2, -0.5, 0.95], [-0.3, 3.0, 0.9, 0.9]];
  blobs.forEach(([x, y, z, rad], i) => {
    const c = base.clone().multiplyScalar(0.85 + r() * 0.3).getHex();
    P.add(new THREE.IcosahedronGeometry(rad, 1), i % 2 ? c : base.getHex(), 'grain', [x, y, z]);
  });
  return P.into(g);
}

// 돌담: 막돌을 쌓은 담과 위에 얹은 기와(지붕처럼 양쪽으로 흘러내린다)
export function wall(g, p = {}) {
  const P = parts(), w = p.w || 10, h = p.h || 2;
  P.box(w, h, 0.8, p.color || 0x8c8577, 'stone', [0, h / 2, 0]);
  P.box(w + 0.1, 0.25, 0.95, 0x9a9384, 'stone', [0, 0.12, 0]);
  if (h <= 3) {
    for (const s of [-1, 1]) P.box(w + 0.3, 0.12, 0.62, TILE, 'tile', [0, h + 0.14, s * 0.24], [s * 0.45, 0, 0]);
    P.box(w + 0.35, 0.16, 0.2, RIDGE, 'tile', [0, h + 0.3, 0]);
  }
  return P.into(g);
}

// 판잣집: 덧댄 판자 벽, 기운 함석지붕(골이 진), 굴뚝, 기운 문
export function shack(g) {
  const P = parts();
  P.box(3.2, 2, 2.6, 0x8a7a62, 'wood', [0, 1, 0]);
  P.box(1.2, 0.9, 0.05, 0x6f6450, 'wood', [-0.8, 1.2, 1.31], [0, 0, 0.05]);
  P.box(0.8, 1.4, 0.06, 0x3a2c20, 'wood', [0.6, 0.7, 1.32]);
  for (let i = 0; i < 7; i++) P.box(0.12, 0.08, 3.1, i % 2 ? 0x7a7872 : 0x6b6862, 'grain', [-1.6 + i * 0.53, 2.2 - i * 0.06, 0], [0, 0, 0.11]);
  P.box(3.7, 0.06, 3.1, 0x6b6862, 'grain', [0, 2.12, 0], [0, 0, 0.11]);
  P.cyl(0.1, 0.1, 1.2, 6, 0x3a3a3a, 'grain', [1.1, 2.6, -0.6]);
  return P.into(g);
}

// ── 새 소품(배치표에서 type으로 쓰고, 마을 꾸미기에도 쓴다) ──
// 장독대: 낮은 돌 단 위의 크고 작은 항아리
export function jars(g, p = {}) {
  const P = parts(), n = p.n || 5;
  P.box(2.2, 0.3, 1.3, 0x9a9384, 'stone', [0, 0.15, 0]);
  const pot = rad => new THREE.LatheGeometry([[0, 0], [rad * 0.7, 0], [rad, rad * 0.9], [rad * 0.95, rad * 1.5], [rad * 0.55, rad * 1.85], [rad * 0.6, rad * 1.95], [0, 1.95 * rad]].map(([x, y]) => new THREE.Vector2(x, y)), 10);
  for (let i = 0; i < n; i++) {
    const rad = i % 2 ? 0.26 : 0.36, x = -0.75 + (i % 3) * 0.75, z = i < 3 ? -0.25 : 0.3;
    P.add(pot(rad), 0x5a3a26, 'grain', [x, 0.3, z], [0, 0, 0], { smooth: true });
    P.cyl(rad * 0.62, rad * 0.62, 0.05, 10, 0x4a2e1e, 'grain', [x, 0.3 + rad * 1.97, z]);
  }
  return P.into(g);
}
// 수레: 짐칸과 큰 바퀴 둘, 앞으로 뻗은 손잡이
export function cart(g, p = {}) {
  const P = parts();
  P.box(1.4, 0.12, 2.2, 0x8a6a48, 'wood', [0, 0.85, 0]);
  for (const s of [-1, 1]) P.box(0.08, 0.35, 2.2, 0x7a5a3c, 'wood', [s * 0.7, 1.05, 0]);
  for (const s of [-1, 1]) {
    P.add(new THREE.TorusGeometry(0.62, 0.06, 6, 16), 0x5e4330, 'wood', [s * 0.82, 0.62, -0.1], [0, Math.PI / 2, 0]);
    for (let k = 0; k < 4; k++) P.box(0.05, 1.2, 0.05, 0x5e4330, 'wood', [s * 0.82, 0.62, -0.1], [k * Math.PI / 4, 0, 0]);
  }
  for (const s of [-1, 1]) P.box(0.08, 0.08, 1.6, 0x6b4a32, 'wood', [s * 0.55, 0.75, 1.8], [0.25, 0, 0]);
  if (p.load) for (let i = 0; i < 4; i++) P.cyl(0.3, 0.3, 0.75, 8, 0xd8c08a, 'grain', [(i % 2) * 0.6 - 0.3, 1.2, -0.5 + Math.floor(i / 2) * 0.8], [0, 0, Math.PI / 2]);
  return P.into(g);
}
// 짚더미(볏가리)
export function straw(g) {
  const P = parts();
  P.add(new THREE.SphereGeometry(1, 12, 8), 0xc9a865, 'grain', [0, 0.75, 0], [0, 0, 0], { smooth: true });
  P.add(new THREE.ConeGeometry(0.7, 0.8, 10), 0xb8955a, 'grain', [0, 1.85, 0]);
  return P.into(g);
}
// 장작더미: 차곡차곡 쌓은 통나무
export function woodpile(g) {
  const P = parts();
  for (let row = 0; row < 3; row++) for (let i = 0; i < 5 - row; i++) P.cyl(0.14, 0.14, 1.3, 7, row % 2 ? 0x8a6a48 : 0x7a5a3c, 'wood', [-0.6 + i * 0.3 + row * 0.15, 0.14 + row * 0.26, 0], [Math.PI / 2, 0, 0]);
  return P.into(g);
}
// 가로등(근대 이후 거리): 쇠기둥과 등
export function lamp(g) {
  const P = parts();
  P.cyl(0.07, 0.1, 3.4, 8, 0x2b2b2b, 'grain', [0, 1.7, 0]);
  P.box(0.5, 0.08, 0.08, 0x2b2b2b, 'grain', [0.2, 3.35, 0]);
  P.add(new THREE.ConeGeometry(0.25, 0.3, 6), 0x2b2b2b, 'grain', [0.42, 3.25, 0]);
  P.add(new THREE.SphereGeometry(0.14, 8, 6), 0xfff1c8, 'grain', [0.42, 3.08, 0], [0, 0, 0], { shadow: false });
  return P.into(g);
}

// 고려·조선편 장면에서 쓰는 기와지붕: 예전 네모뿔(우진각) 자리에 그대로, 처마가 들리고 서까래가 보이는 곡선 지붕을 얹는다.
// (parent, 가로, 세로, 높이, 색, x, y(처마 높이), z). 세로가 더 길면 용마루가 앞뒤로 놓인다.
export function curvedHipRoof(parent, w, d, h, color, x, y, z) {
  const P = parts(), along = w >= d, W = along ? w : d, D = along ? d : w;
  const r = roofSurface({ W, D, H: h, lift: Math.min(1.0, 0.15 + 0.08 * D), profile: 'tile', thick: Math.min(0.3, 0.05 + 0.02 * D) });
  const rot = along ? [0, 0, 0] : [0, Math.PI / 2, 0];
  P.add(r.top, color, 'tile', [0, 0, 0], rot, { smooth: true });
  P.add(r.under, 0x7a5a3c, 'wood', [0, 0, 0], rot, { smooth: true, shadow: false });
  const k = Math.min(1.6, 0.4 + 0.06 * D);
  const ridge = new THREE.BoxGeometry(r.ridgeLen + k, 0.22 * k, 0.26 * k);
  P.add(ridge, RIDGE, 'tile', [0, h + 0.06 * k, 0], rot);
  for (const s of [-1, 1]) { // 용마루 양 끝이 살짝 솟는다
    const end = new THREE.BoxGeometry(0.16 * k, 0.34 * k, 0.3 * k);
    const ex = s * (r.ridgeLen / 2 + 0.45 * k);
    P.add(end, RIDGE, 'tile', along ? [ex, h + 0.14 * k, 0] : [0, h + 0.14 * k, ex], along ? [0, 0, s * 0.3] : [s * -0.3, Math.PI / 2, 0]);
  }
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  return P.into(g);
}
