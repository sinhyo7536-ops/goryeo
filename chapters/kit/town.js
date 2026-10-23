// 장면 부품 상자: 근대·일제 강점기·현대편 장들이 '배치표(layout)'만 써서 장면을 만든다.
// layout = { ground, area, bounds, start, props: [{ type, x, z, ry, ... }], npcs: [{ id, look, x, z, ry }], signs: [{ id, title, x, z }], scatter: [...] }
import * as THREE from 'three';
import { groundMaterial } from '../../core/textures.js';
import { mat, makePerson } from '../../core/people.js';
import { scatter } from '../../core/props.js';
import { makeSign } from '../../core/signs.js';
import { LOOKS } from '../../content/characters.js';
import { createWeather } from '../../core/weather.js';
import { hipRoof, gableRoof } from '../joseon/landmarks.js';

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function add(g, geo, color, x, y, z, kind = null, cast = true) {
  const m = new THREE.Mesh(geo, mat(color, kind));
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
}

// 태극기 그림(흰 바탕, 가운데 태극, 네 귀퉁이의 괘)
let flagTex = null;
export function taegukgiTexture() {
  if (flagTex) return flagTex;
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 128;
  const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, 192, 128);
  const cx = 96, cy = 64, r = 32;
  c.save(); c.translate(cx, cy); c.rotate(Math.atan2(2, 3));
  c.fillStyle = '#cd2e3a'; c.beginPath(); c.arc(0, 0, r, Math.PI, 0); c.fill();
  c.fillStyle = '#0047a0'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI); c.fill();
  c.fillStyle = '#cd2e3a'; c.beginPath(); c.arc(-r / 2, 0, r / 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0047a0'; c.beginPath(); c.arc(r / 2, 0, r / 2, 0, Math.PI * 2); c.fill();
  c.restore();
  // 괘: 건(좌상) 곤(우하) 감(우상) 리(좌하)
  const bars = (x, y, ang, pattern) => {
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = '#000';
    pattern.forEach((broken, k) => {
      const yy = -12 + k * 10;
      if (broken) { c.fillRect(-16, yy, 14, 6); c.fillRect(2, yy, 14, 6); } else c.fillRect(-16, yy, 32, 6);
    });
    c.restore();
  };
  const a = Math.atan2(2, 3);
  bars(40, 26, a - Math.PI / 2, [0, 0, 0]); bars(152, 102, a - Math.PI / 2, [1, 1, 1]);
  bars(152, 26, -a + Math.PI / 2, [1, 0, 1]); bars(40, 102, -a + Math.PI / 2, [0, 1, 0]);
  flagTex = new THREE.CanvasTexture(cv); flagTex.colorSpace = THREE.SRGBColorSpace;
  return flagTex;
}
function flagMesh(w = 1.2, h = 0.8, color = null) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(w / 2, 0, 0),
    color == null ? new THREE.MeshLambertMaterial({ map: taegukgiTexture(), side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
  m.castShadow = true; return m;
}

// 부품마다 만드는 법. 모두 (0,0,0) 기준, 앞은 +z.
const BUILD = {
  // 초가집 / 기와집
  hanok(g, p) {
    add(g, box(4, 2.2, 3.2), 0xe6dcc3, 0, 1.1, 0);
    add(g, box(0.9, 1.6, 0.08), 0x5d4330, 0.7, 0.8, 1.62, 'wood');
    if (p.tile) hipRoof(g, 5.6, 4.6, 1.5, 0x3d4846, 0, 2.2, 0);
    else { const r = add(g, new THREE.SphereGeometry(2.7, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xc8a476, 0, 2.1, 0); r.scale.set(1, 0.5, 0.82); }
    return { rect: [4.4, 3.6] };
  },
  // 벽돌로 지은 서양식 건물 (근대 건물·학교·관청). tower: 뾰족탑, dome: 둥근 지붕
  western(g, p) {
    const w = p.w || 8, d = p.d || 5, h = p.h || 5, color = p.color || 0x9a4a32;
    add(g, box(w, h, d), color, 0, h / 2, 0, 'stone');
    for (let i = 0; i < Math.floor(w / 1.6); i++) for (let f = 0; f < Math.max(1, Math.floor(h / 2.4)); f++) {
      add(g, box(0.7, 1.1, 0.06), 0x2f4a5e, -w / 2 + 1 + i * 1.6, 1.4 + f * 2.2, d / 2 + 0.03, null, false);
    }
    add(g, box(1.3, 2, 0.08), 0x3a2c20, 0, 1, d / 2 + 0.05, 'wood');
    add(g, box(w + 0.3, 0.3, d + 0.3), 0xd8d0bc, 0, h, 0, 'stone');
    if (p.tower) { add(g, box(1.8, 3, 1.8), color, 0, h + 1.5, 0, 'stone'); add(g, new THREE.ConeGeometry(1.3, 3.4, 4), 0x3d4846, 0, h + 4.7, 0).rotation.y = Math.PI / 4; }
    if (p.dome) { add(g, new THREE.CylinderGeometry(1.8, 1.8, 1.4, 14), 0xd8d0bc, 0, h + 0.7, 0, 'stone'); add(g, new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x6f8a86, 0, h + 1.4, 0); }
    return { rect: [w, d] };
  },
  // 돌로 쌓은 무지개 문 (독립문 등). label: 앞에 새긴 글
  arch(g, p) {
    add(g, box(5, 6, 3), 0xd6d0c4, 0, 3, 0, 'stone');
    add(g, box(2, 3.6, 3.1), 0x2b241c, 0, 1.8, 0);
    const a = add(g, new THREE.CylinderGeometry(1, 1, 3.12, 16, 1, false, 0, Math.PI), 0x2b241c, 0, 3.6, 0); a.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    add(g, box(5.6, 0.5, 3.4), 0xc8c2b6, 0, 6.2, 0, 'stone');
    if (p.label) {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
      const c = cv.getContext('2d'); c.fillStyle = '#e9e4da'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#2b241c';
      c.font = 'bold 40px "Nanum Myeongjo", Batang, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.label, 128, 34, 240);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshLambertMaterial({ map: t })); m.position.set(0, 5.4, 1.56); g.add(m);
    }
    return { rect: [5.2, 3.2] };
  },
  // 깃대와 깃발 (color 없으면 태극기)
  flagpole(g, p) {
    add(g, new THREE.CylinderGeometry(0.06, 0.06, 4.4, 6), 0x5a3f2a, 0, 2.2, 0, 'wood');
    const f = flagMesh(1.4, 0.95, p.color ?? null); f.position.set(0, 3.8, 0); g.add(f); g.userData.flag = f;
    return 0.4;
  },
  // 사람들 무리. looks: 생김새 목록, n: 사람 수, flags: 태극기를 든 사람 비율(0~1), ry: 바라보는 방향
  crowd(g, p) {
    const looks = p.looks || ['commoner'], n = p.n || 10, cols = p.cols || 5;
    for (let i = 0; i < n; i++) {
      const lk = LOOKS[looks[i % looks.length]] || LOOKS.commoner;
      const person = makePerson(lk);
      person.position.set((i % cols - (cols - 1) / 2) * 1.3 + ((i * 37) % 5) * 0.08, 0, Math.floor(i / cols) * 1.4);
      person.rotation.y = (p.face || 0) + ((i * 13) % 7 - 3) * 0.05;
      if (p.flags && (i * 7) % 10 < p.flags * 10) { const f = flagMesh(0.6, 0.4); f.position.set(0.5, 2.6, 0); person.add(f); add(person, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), 0x5a3f2a, 0.5, 2.3, 0); }
      g.add(person);
    }
    return 0;
  },
  // 전차와 선로
  tram(g, p) {
    const len = p.track || 30;
    for (const dx of [-0.6, 0.6]) add(g, box(0.1, 0.06, len), 0x6b6862, dx, 0.03, 0, null, false);
    const car = new THREE.Group(); car.name = 'tramCar'; g.add(car);
    add(car, box(2.2, 2.4, 6), 0xb5532f, 0, 1.6, 0);
    add(car, box(2.3, 0.2, 6.3), 0xe0c56a, 0, 2.9, 0);
    for (let i = 0; i < 4; i++) for (const sx of [-1.11, 1.11]) add(car, box(0.04, 0.8, 0.9), 0xd9e4ea, sx, 2, -2.1 + i * 1.4, null, false);
    add(car, new THREE.CylinderGeometry(0.03, 0.03, 2, 4), 0x2b241c, 0, 4, -1).rotation.x = 0.5;
    for (const dz of [-2, 2]) for (const sx of [-0.6, 0.6]) { const w = add(car, new THREE.CylinderGeometry(0.35, 0.35, 0.15, 10), 0x2b241c, sx, 0.35, dz); w.rotation.z = Math.PI / 2; }
    g.userData.car = car;
    return 0;
  },
  // 전봇대 줄 (전신·전화·전기)
  poles(g, p) {
    const n = p.n || 4, gap = p.gap || 6;
    for (let i = 0; i < n; i++) {
      add(g, new THREE.CylinderGeometry(0.1, 0.13, 6, 6), 0x5a3f2a, i * gap, 3, 0, 'wood');
      add(g, box(1.4, 0.12, 0.12), 0x5a3f2a, i * gap, 5.6, 0, 'wood');
    }
    for (const dz of [-0.6, 0.6]) { const w = add(g, new THREE.CylinderGeometry(0.015, 0.015, (n - 1) * gap, 4), 0x1e1c1a, (n - 1) * gap / 2, 5.7, 0, null, false); w.rotation.z = Math.PI / 2; w.position.z = dz * 0.9; }
    return 0;
  },
  // 연단(만민 공동회·독립 선언)과 탁자
  stage(g) {
    add(g, box(5, 0.8, 3), 0x7a5a3c, 0, 0.4, 0, 'wood');
    add(g, box(1.2, 1, 0.6), 0x5e432c, 0, 1.3, 0.6, 'wood');
    return { rect: [5.2, 3.2] };
  },
  // 천막
  tent(g, p) {
    const t = add(g, new THREE.ConeGeometry(2, 2.4, 4), p.color || 0xd8d0bc, 0, 1.2, 0); t.rotation.y = Math.PI / 4;
    return 1.6;
  },
  // 돌담·벽 (w 길이)
  wall(g, p) { add(g, box(p.w || 10, p.h || 2, 0.8), p.color || 0x8c8577, 0, (p.h || 2) / 2, 0, 'stone'); return 0; },
  // 쌀가마 더미
  rice(g, p) {
    for (let i = 0; i < (p.n || 9); i++) { const s = add(g, new THREE.CylinderGeometry(0.4, 0.4, 0.9, 10), 0xd8c08a, (i % 3) * 0.85 - 0.85, 0.4 + Math.floor(i / 9) * 0.8, Math.floor((i % 9) / 3) * 0.85 - 0.85); s.rotation.z = Math.PI / 2; }
    return 1.6;
  },
  // 증기선 (항구)
  steamship(g) {
    add(g, box(5, 2, 16), 0x2b2f36, 0, 0.6, 0);
    add(g, box(4, 2, 7), 0xe6dcc3, 0, 2.6, 1);
    for (const dz of [-1, 2]) add(g, new THREE.CylinderGeometry(0.5, 0.5, 3, 12), 0x8a2f24, 0, 4.6, dz);
    return 0;
  },
  // 바다·강 (넓은 물판)
  water(g, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(p.w || 200, p.d || 60).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: p.color || 0x3f7d9a, shininess: 60, transparent: true, opacity: 0.93 })); m.position.y = -0.3; g.add(m); return 0; },
  // 큰 나무
  tree(g, p) {
    add(g, new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), 0x6b4a32, 0, 1.1, 0, 'wood');
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), mat(p.color || 0x4f7344, 'grain')); c.position.y = 3; c.castShadow = true; g.add(c);
    return 0.6;
  },
  // 책상과 책 (학교·연구실)
  desk(g) {
    add(g, box(1.6, 0.75, 0.9), 0x7a5a3c, 0, 0.38, 0, 'wood');
    for (let k = 0; k < 3; k++) add(g, box(0.5, 0.08, 0.36), [0xd8c9a0, 0x2f6b5e, 0xa8392b][k], -0.4 + k * 0.4, 0.8, 0);
    return 0.9;
  },
  // 판잣집 (전쟁 뒤 피란민)
  shack(g) {
    add(g, box(3.2, 2, 2.6), 0x8a7a62, 0, 1, 0, 'wood');
    const r = add(g, box(3.6, 0.1, 3), 0x6b6862, 0, 2.15, 0); r.rotation.z = 0.12;
    add(g, box(0.8, 1.4, 0.06), 0x3a2c20, 0.6, 0.7, 1.32);
    return { rect: [3.4, 2.8] };
  },
  // 군용 트럭
  truck(g, p) {
    add(g, box(2.2, 1.2, 5), p.color || 0x55603f, 0, 1.1, 0);
    add(g, box(2.1, 1.3, 1.6), p.color || 0x55603f, 0, 2.2, -1.6);
    for (const dz of [-1.6, 1.6]) for (const sx of [-1.05, 1.05]) { const w = add(g, new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12), 0x1e1c1a, sx, 0.45, dz); w.rotation.z = Math.PI / 2; }
    return { rect: [2.4, 5.2] };
  },
  // 증기 기관차와 화물칸(쌀가마를 싣고), 선로
  train(g, p) {
    const len = p.track || 50;
    for (const dx of [-0.7, 0.7]) add(g, box(0.1, 0.08, len), 0x6b6862, dx, 0.04, 0, null, false);
    for (let z = -len / 2; z < len / 2; z += 1.4) add(g, box(2, 0.08, 0.3), 0x5a3f2a, 0, 0.02, z, 'wood', false);
    add(g, box(2.2, 2.2, 5), 0x2b2b2b, 0, 1.5, -6);
    add(g, new THREE.CylinderGeometry(1, 1, 3.4, 14), 0x2b2b2b, 0, 1.8, -7.6).rotation.x = Math.PI / 2;
    add(g, new THREE.CylinderGeometry(0.35, 0.45, 1.4, 10), 0x1e1c1a, 0, 3.3, -8.6);
    for (let k = 0; k < (p.cars || 3); k++) {
      add(g, box(2.2, 1.6, 4.6), 0x6b4a32, 0, 1.2, -1 + k * 5, 'wood');
      for (let i = 0; i < 6; i++) { const s = add(g, new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8), 0xd8c08a, (i % 2) * 0.8 - 0.4, 2.3, -2.6 + k * 5 + Math.floor(i / 2) * 1.2); s.rotation.z = Math.PI / 2; }
    }
    for (let k = -1; k < (p.cars || 3); k++) for (const dz of [-1.5, 1.5]) for (const sx of [-0.8, 0.8]) { const w = add(g, new THREE.CylinderGeometry(0.4, 0.4, 0.15, 10), 0x1e1c1a, sx, 0.4, (k < 0 ? -6 : -1 + k * 5) + dz); w.rotation.z = Math.PI / 2; }
    return { rect: [2.6, 6 + (p.cars || 3) * 5] };
  },
  // 팔각정(탑골 공원): 돌 기단, 기둥 여덟, 팔각 지붕
  pavilion(g) {
    add(g, new THREE.CylinderGeometry(3.4, 3.6, 0.6, 8), 0xb3ab99, 0, 0.3, 0, 'stone');
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(g, new THREE.CylinderGeometry(0.16, 0.16, 3, 8), 0xa8392b, Math.cos(a) * 2.8, 2.1, Math.sin(a) * 2.8); }
    add(g, new THREE.CylinderGeometry(3.1, 3.1, 0.3, 8), 0x2f6b5e, 0, 3.6, 0);
    add(g, new THREE.ConeGeometry(4.2, 2.2, 8), 0x3d4846, 0, 4.8, 0, 'tile');
    add(g, new THREE.ConeGeometry(1.2, 1.4, 8), 0x3d4846, 0, 6.2, 0, 'tile');
    return 3.6;
  },
  // 철조망 울타리 (휴전선)
  fence(g, p) {
    const w = p.w || 20;
    for (let x = -w / 2; x <= w / 2; x += 2.5) add(g, new THREE.CylinderGeometry(0.06, 0.06, 2, 5), 0x6b6862, x, 1, 0);
    for (const y of [0.6, 1.2, 1.8]) { const l = add(g, new THREE.CylinderGeometry(0.02, 0.02, w, 4), 0x8a8a88, 0, y, 0, null, false); l.rotation.z = Math.PI / 2; }
    return 0;
  },
};

// 부딪힘 자리: 둥근 것은 원 하나, 네모난 건물은 긴 쪽을 따라 작은 원을 줄지어 놓는다(앞마당까지 막지 않게)
function addFootprint(world, p, r) {
  const s = p.scale || 1;
  if (typeof r === 'number') { world.addCollider({ x: p.x, z: p.z, r: r * s }); return; }
  let [w, d] = r.rect; w *= s; d *= s;
  const along = w >= d, len = along ? w : d, rad = (along ? d : w) / 2;
  const n = Math.max(1, Math.ceil(len / (rad * 1.4)));
  const c = Math.cos(p.ry || 0), sn = Math.sin(p.ry || 0);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : -len / 2 + rad + (len - 2 * rad) * i / (n - 1);
    const lx = along ? t : 0, lz = along ? 0 : t;
    world.addCollider({ x: p.x + lx * c + lz * sn, z: p.z - lx * sn + lz * c, r: rad });
  }
}

export function buildTown(world, layout) {
  const L = world.level;
  world.bounds = layout.bounds;
  // 땅
  {
    const g = new THREE.PlaneGeometry(220, 220, 30, 30); g.rotateX(-Math.PI / 2);
    const col = new THREE.Color(layout.groundColor ?? 0x5f7a4c), cols = [];
    for (let i = 0; i < g.attributes.position.count; i++) cols.push(col.r, col.g, col.b);
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const t = new THREE.Mesh(g, groundMaterial(layout.ground || 'grass')); t.receiveShadow = true; L.add(t);
  }
  for (const r of layout.roads || []) { const m = new THREE.Mesh(box(r.w, 0.05, r.d), mat(r.color || 0x8f7556, r.kind || 'earth')); m.position.set(r.x, 0.025, r.z); m.receiveShadow = true; L.add(m); }
  const named = {};
  for (const p of layout.props || []) {
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = p.ry || 0; if (p.scale) g.scale.setScalar(p.scale); L.add(g);
    const r = BUILD[p.type](g, p);
    if (r && p.solid !== false) addFootprint(world, p, r);
    if (p.name) named[p.name] = g;
  }
  for (const s of layout.scatter || []) scatter(world, s);
  for (const n of layout.npcs || []) world.addNpc(n.id, typeof n.look === 'string' ? LOOKS[n.look] : n.look, n.x, n.z, n.ry || 0);
  for (const s of layout.signs || []) world.addSpot(s.id, makeSign(s.title), s.x, s.z, 0);
  const weather = layout.weather ? createWeather(world, layout.weather, { count: 700 }) : null;
  // 깃발이 바람에 흔들린다
  const flags = Object.values(named).map(g => g.userData.flag).filter(Boolean);
  L.traverse(o => { if (o.isMesh && o.material && o.material.map === flagTex && !flags.includes(o)) flags.push(o); });
  world.onUpdate((dt, t) => { flags.forEach((f, i) => { f.rotation.y = Math.sin(t * 2.5 + i) * 0.25; }); });
  return { named, weather, start: layout.start };
}
