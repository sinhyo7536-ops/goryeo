// 상황 놀이 부품: 카드 대신 장면 속에서 직접 해 보는 미니게임. 근대·일제 강점기·현대편 장의 parts에 쓴다.
// 모두 (ctx, part, easy) → Promise<boolean>(성공이면 true). 실패하면 장 틀(tryPart)이 힌트를 보여 주고 다시 하게 한다.
//
//   drive  : 배·전차·트럭을 몰아(또는 걸어서) 지점을 차례로 지나간다. 암초·기뢰·적 배에 부딪히면 앞 지점으로.
//            { arena?, vehicle?: 'boat'|'truck'|'tram'|'car'|'train', from, route: [{ x, z, label?, say? }], hazards?: [{ x, z, r, kind, to?, speed? }],
//              seconds, counter?, speed?, followers?: { looks, per } }
//   stops  : 바닥에 이름표가 선 곳들을 일어난 차례대로 찾아가 대화 버튼을 누른다. 틀린 곳을 고르면 다시.
//            { arena?, from, spots: [{ x, z, label, say? }] (정답 차례), seconds? }
//   deliver: 머리 위에 든 것(글)을 알맞은 곳(바구니 자리)에 가져다 놓는다. 틀린 곳이면 다시.
//            { arena?, from, bins: [{ id, label, x, z }], cards: [{ text, bin }] }
//   find   : 곳곳에 선 팻말 가운데 맞는 것만 찾아 대화 버튼을 누른다. 틀린 것을 고르면 다시.
//            { arena?, from, items: [{ text, correct, x, z }] }
//   ambush : 위에서 내려다보는 골짜기(바다)에 적이 들어오면 그 위의 버튼을 눌러 물리친다(연기를 내며 물러난다).
//            { arena?, camera: { pos, target }, path: [[x, z], [x, z]], zone: { x, z, r }, enemies, need, interval, speed, unit: 'soldier'|'ship', label }
//   sneak  : 순찰하는 감시원의 불빛을 피해 숨을 곳을 차례로 지나 목적지까지 간다. 들키면 앞 숨을 곳으로.
//            { arena?, from, waypoints: [{ x, z, label? }], guards: [{ path: [[x, z], [x, z]], speed, range?, look? }], seconds }
// arena: 마을과 떨어진 곳(origin)에 미니게임 무대를 따로 세운다. { origin: [x, z], ground, groundColor, bounds, props, roads }
//        좌표는 모두 무대 기준. arena가 없으면 장 마을에서 한다.
import * as THREE from 'three';
import { BUILD, addFootprint } from './town.js';
import { mat, makePerson } from '../../core/people.js';
import { groundMaterial } from '../../core/textures.js';
import { createTapTargets } from '../../core/minigame.js';
import { MAP_OUTLINE } from '../../core/screens.js';
import { LOOKS } from '../../content/characters.js';

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const add = (g, geo, color, x, y, z) => { const m = new THREE.Mesh(geo, mat(color)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };

// 장면 속 이름표(글씨 판). 늘 카메라를 본다.
export function labelSprite(text, { color = '#231c14', bg = 'rgba(239,227,198,0.95)', border = '#6b4a32', size = 1 } = {}) {
  const cv = document.createElement('canvas'), c = cv.getContext('2d');
  const font = 'bold 44px "Nanum Myeongjo", Batang, serif';
  c.font = font;
  const w = Math.min(1024, Math.ceil(c.measureText(text).width) + 48), h = 72;
  cv.width = w; cv.height = h;
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.strokeStyle = border; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
  c.font = font; c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.renderOrder = 10;
  const k = 0.9 * size;
  s.scale.set((w / h) * k, k, 1);
  s.userData.setText = null;
  return s;
}

// 화면 위쪽에 잠깐 뜨는 알림(대화창을 열지 않아 흐름이 끊기지 않는다)
function toast(ctx, text, kind = '') {
  let t = ctx.ui.querySelector('.play-toast');
  if (!t) { t = document.createElement('div'); t.className = 'play-toast'; ctx.ui.append(t); }
  t.textContent = text; t.className = `play-toast ${kind}`; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2600);
}
function clearToast(ctx) { const t = ctx.ui.querySelector('.play-toast'); if (t) t.remove(); }

// 미니게임 무대: 마을에서 멀리 떨어진 곳에 땅·물·건물을 세우고, 끝나면 모두 치운다.
export function buildArena(world, arena) {
  const [ox, oz] = arena ? arena.origin : [0, 0];
  const g = new THREE.Group(); g.position.set(ox, 0, oz);
  const at = (x, z) => ({ x: x + ox, z: z + oz });
  const colStart = world.colliders.length, oldBounds = world.bounds;
  world.level.add(g); // 무대가 없으면 마을 자리(0,0)에 표시물만 둔다
  if (arena) {
    const gg = new THREE.PlaneGeometry(160, 160, 8, 8).rotateX(-Math.PI / 2); // 땅 재질은 꼭짓점 색을 쓴다(마을 땅과 같게)
    const gc = new THREE.Color(arena.groundColor ?? 0x8a7a62), cols = [];
    for (let i = 0; i < gg.attributes.position.count; i++) cols.push(gc.r, gc.g, gc.b);
    gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const ground = new THREE.Mesh(gg, groundMaterial(arena.ground || 'earth'));
    ground.position.y = 0.01; ground.receiveShadow = true; g.add(ground);
    if (arena.sea) { ground.material = new THREE.MeshPhongMaterial({ color: arena.sea === true ? 0x3f7d9a : arena.sea, shininess: 70 }); }
    if (arena.map) g.add(mapFloor(arena.map));
    for (const r of arena.roads || []) { const m = new THREE.Mesh(box(r.w, 0.05, r.d), mat(r.color || 0x8f7556, r.kind || 'earth')); m.position.set(r.x, r.y ?? 0.04, r.z); m.rotation.y = r.ry || 0; m.receiveShadow = true; g.add(m); }
    for (const p of arena.props || []) {
      const pg = new THREE.Group(); pg.position.set(p.x, 0, p.z); pg.rotation.y = p.ry || 0; if (p.scale) pg.scale.setScalar(p.scale); g.add(pg);
      const r = BUILD[p.type](pg, p);
      if (p.type === 'water') pg.position.y = 0.32; // 무대 땅 위로 물이 보이게
      if (r && p.solid !== false) addFootprint(world, { ...p, ...at(p.x, p.z) }, r); // 긴 건물·기차는 작은 원을 줄지어
    }
    for (const c of arena.colliders || []) world.addCollider({ ...at(c.x, c.z), r: c.r });
    const b = arena.bounds; world.bounds = { x0: b.x0 + ox, x1: b.x1 + ox, z0: b.z0 + oz, z1: b.z1 + oz };
  }
  return {
    group: g, at,
    dispose() {
      world.level.remove(g);
      if (arena) { world.colliders.splice(colStart); world.bounds = oldBounds; }
    },
  };
}

// 바닥에 크게 그린 우리나라 지도(장 고르기 화면의 지도와 같은 모양, 300×400 비율). 38도선을 점선으로.
// mapSpot(map)(가로%, 세로%) → 그 자리의 { x, z } (무대 기준)
export function mapSpot(map) { return (px, py) => ({ x: map.x + (px / 100 - 0.5) * map.w, z: map.z + (py / 100 - 0.5) * map.w * 4 / 3 }); }
function mapFloor(map) {
  const cv = document.createElement('canvas'); cv.width = 600; cv.height = 800;
  const c = cv.getContext('2d');
  c.fillStyle = '#7fa8bf'; c.fillRect(0, 0, 600, 800);
  const pts = MAP_OUTLINE.split(' ').map(p => p.split(',').map(Number));
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * 2, y * 2) : c.moveTo(x * 2, y * 2))); c.closePath();
  c.fillStyle = '#d9cfa8'; c.fill(); c.strokeStyle = '#6b5a3a'; c.lineWidth = 6; c.stroke();
  c.beginPath(); c.ellipse(240, 776, 32, 16, 0, 0, Math.PI * 2); c.fill(); c.stroke(); // 제주도
  if (map.line38 !== false) { c.setLineDash([18, 12]); c.strokeStyle = '#8a2f24'; c.lineWidth = 5; c.beginPath(); c.moveTo(60, 360); c.lineTo(560, 360); c.stroke(); c.setLineDash([]); c.fillStyle = '#8a2f24'; c.font = 'bold 30px sans-serif'; c.fillText('38도선', 470, 345); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(map.w, map.w * 4 / 3).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tex }));
  m.position.set(map.x, 0.03, map.z); m.receiveShadow = true;
  return m;
}

// 탈것 모양(앞이 +z)
function vehicleMesh(kind) {
  const g = new THREE.Group();
  if (kind === 'boat') { // 상륙정: 납작한 배와 앞판
    add(g, box(2.4, 0.9, 5.2), 0x55603f, 0, 0.35, 0);
    add(g, box(2.4, 1.2, 0.2), 0x4a5436, 0, 0.9, 2.6);
    add(g, box(1.2, 1, 1.2), 0x3f4a30, 0, 1.2, -1.8);
    const flag = add(g, box(0.6, 0.4, 0.04), 0xe8e8e8, 0, 2.3, -1.8); flag.material = flag.material.clone();
  } else if (kind === 'tram') { BUILD.tram(g, { track: 0.01 }); }
  else if (kind === 'truck') { BUILD.truck(g, { color: 0x55603f }); }
  else if (kind === 'car') { BUILD.truck(g, { color: 0x3f6a8a }); }
  else if (kind === 'train') {
    add(g, box(2.2, 2.2, 5), 0x2b2b2b, 0, 1.5, 0);
    add(g, new THREE.CylinderGeometry(0.35, 0.45, 1.4, 10), 0x1e1c1a, 0, 3.1, 1.6);
  }
  return g;
}
// 학생을 탈것으로 바꾼다. 되돌리는 함수를 돌려준다.
function rideVehicle(world, kind, speed) {
  const p = world.player, hidden = [...p.children];
  hidden.forEach(c => { c.visible = false; });
  const v = vehicleMesh(kind); p.add(v);
  world.speedScale = speed;
  return () => { p.remove(v); hidden.forEach(c => { c.visible = true; }); world.speedScale = 1; };
}

function ring(color = 0xd9a441, r0 = 0.9, r1 = 1.25) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.09;
  return m;
}
const near = (p, t, r) => Math.hypot(p.x - t.x, p.z - t.z) < r;
const place = (world, [x, z], ry = Math.PI) => { const p = world.player; p.visible = true; p.position.set(x, 0, z); p.rotation.y = ry; world.camMode = 'follow'; world.snapCamera(); };

// 여러 부품이 같이 쓰는 뼈대: 무대 세우기, 시간·숫자 표시, 끝낼 때 정리
function session(ctx, part, easy) {
  const { world, hud } = ctx;
  const arena = buildArena(world, part.arena);
  const back = part.arena && { p: world.player.position.clone(), ry: world.player.rotation.y, cam: world.camMode }; // 무대를 치우면 원래 자리로
  const cleanups = [() => { arena.dispose(); if (back) { world.player.position.copy(back.p); world.player.rotation.y = back.ry; world.camMode = back.cam === 'fixed' ? 'follow' : back.cam; world.snapCamera(); } }, () => clearToast(ctx), () => { hud.setTimer(null); hud.setCounter(null); world.setGoal(null); ctx.input.enabled = false; ctx.testHooks.walkTo = null; hud.setPrompt?.(null); hud.setTalkEnabled?.(false); }];
  const duration = part.seconds ? part.seconds * (easy ? 1.5 : 1) : null;
  let t = 0, done = false, resolveFn;
  const promise = new Promise(r => { resolveFn = r; });
  const s = {
    arena, at: arena.at, t: () => t,
    finish(ok) {
      if (done) return; done = true;
      for (const f of cleanups.reverse()) f();
      resolveFn(ok);
    },
    get done() { return done; },
    cleanup(f) { cleanups.push(f); },
    update(fn) {
      const off = world.onUpdate((dt, el) => {
        if (done) return;
        t += dt;
        if (duration) { hud.setTimer(duration - t); if (t >= duration) { s.finish(false); return; } }
        fn(dt, el);
      });
      cleanups.push(off);
    },
    promise,
  };
  if (part.from) place(world, [arena.at(...part.from).x, arena.at(...part.from).z], part.face ?? Math.PI);
  ctx.input.enabled = true;
  return s;
}

// 대화 버튼(E)으로 '여기!'를 고르는 부품들이 함께 쓰는 것: 가까운 후보를 찾아 버튼을 켜고, 누르면 pick(후보)
function pickWithButton(ctx, s, candidates, pick, reach = 1.9) {
  const { world, hud } = ctx;
  let cur = null;
  s.update(() => {
    const p = world.player.position;
    let best = null, bd = reach;
    for (const c of candidates()) { const d = Math.hypot(p.x - c.pos.x, p.z - c.pos.z); if (d < bd) { bd = d; best = c; } }
    cur = best;
    hud.setTalkEnabled?.(!!cur);
    hud.setPrompt?.(cur ? new THREE.Vector3(cur.pos.x, 0, cur.pos.z) : null);
  });
  const off = ctx.onAction(() => { if (cur && !s.done) { const c = cur; cur = null; pick(c); } });
  s.cleanup(off);
}

// ── drive ─────────────────────────────────────────────
export function drive(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, part, easy);
  const g = s.arena.group;
  const unride = part.vehicle ? rideVehicle(world, part.vehicle, part.speed || 1.7) : (part.speed ? (world.speedScale = part.speed, () => { world.speedScale = 1; }) : () => {});
  s.cleanup(unride);
  const route = part.route.map((r, i) => {
    const m = ring(0xd9a441, 1.4, 1.9); m.position.set(r.x, 0.12, r.z); m.visible = i === 0; g.add(m);
    let lab = null;
    if (r.label) { lab = labelSprite(r.label); lab.position.set(r.x, 3.2, r.z); lab.visible = i === 0; g.add(lab); }
    return { ...r, m, lab, pos: s.at(r.x, r.z) };
  });
  const hazards = (part.hazards || []).map(hz => {
    const hg = new THREE.Group(); hg.position.set(hz.x, 0, hz.z); g.add(hg);
    if (hz.kind === 'log') { const l = add(hg, new THREE.CylinderGeometry(0.5, 0.5, 4, 10), 0x6b4a32, 0, 0.5, 0); l.rotation.z = Math.PI / 2; } // 굴러오는 통나무(가는 쪽과 직각으로 눕힘)
    else if (hz.kind === 'ship') { add(hg, box(2.6, 1.4, 6), 0x3a3f46, 0, 0.5, 0); add(hg, box(1.6, 1.4, 2), 0x2b2f36, 0, 1.8, -0.5); }
    else if (hz.kind === 'mine') { add(hg, new THREE.SphereGeometry(0.6, 10, 8), 0x2b2b2b, 0, 0.3, 0); }
    else if (hz.kind === 'crowd') { for (let i = 0; i < 3; i++) { const p = makePerson(LOOKS.gendarme); p.position.set(i - 1, 0, 0); hg.add(p); } }
    else if (hz.kind === 'car') { BUILD.truck(hg, { color: 0x8a2f24 }); }
    else { const r = add(hg, new THREE.DodecahedronGeometry(hz.r || 1.4, 0), 0x6b6862, 0, 0.4, 0); r.scale.y = 0.6; }
    return { ...hz, hg, ph: Math.random() * 6 };
  });
  const followers = [];
  let next = 0, last = part.from, safe = 0;
  const total = route.length;
  const show = () => { ctx.hud.setCounter(`${part.counter || '지난 곳'} ${next}/${total}`); const r = route[next]; world.setGoal(r ? r.pos : null); };
  show();
  s.update((dt, el) => {
    const p = world.player.position;
    safe = Math.max(0, safe - dt);
    for (const h of hazards) {
      if (h.to) { // 두 점 사이를 오간다
        const k = (Math.sin((el + h.ph) * (h.speed || 0.6) * (easy ? 0.5 : 1)) + 1) / 2;
        h.hg.position.set(h.x + (h.to[0] - h.x) * k, 0, h.z + (h.to[1] - h.z) * k);
        h.hg.rotation.y = Math.atan2(h.to[0] - h.x, h.to[1] - h.z);
      }
      const hp = s.at(h.hg.position.x, h.hg.position.z);
      if (!safe && Math.hypot(p.x - hp.x, p.z - hp.z) < (h.r || 1.4) + 0.9) {
        audio.play('wrong'); safe = 1.5;
        toast(ctx, part.bump || '부딪혔어요! 앞 지점에서 다시 가요.', 'bad');
        const back = s.at(...last); p.set(back.x, 0, back.z); world.snapCamera();
      }
    }
    const r = route[next];
    if (r && near(p, r.pos, 2)) {
      audio.play('correct');
      r.m.visible = false; if (r.lab) r.lab.visible = false;
      if (r.say) toast(ctx, r.say, 'good');
      last = [r.x, r.z]; next += 1;
      if (part.followers) for (let i = 0; i < part.followers.per; i++) {
        const looks = part.followers.looks, f = new THREE.Group(); // 따라오는 사람(flags면 태극기를 든다)
        BUILD.crowd(f, { n: 1, looks: [looks[followers.length % looks.length]], flags: part.followers.flags ? 1 : 0 });
        f.position.copy(p); g.parent.add(f); followers.push(f);
      }
      if (route[next]) { route[next].m.visible = true; if (route[next].lab) route[next].lab.visible = true; }
      show();
      if (next === total) { setTimeout(() => s.finish(true), 400); }
    }
    // 따라오는 사람들: 앞사람을 줄지어 따라 걷는다
    let lead = world.player.position;
    for (const f of followers) {
      const dx = lead.x - f.position.x, dz = lead.z - f.position.z, d = Math.hypot(dx, dz);
      if (d > 1.3) { f.position.x += (dx / d) * Math.min(d - 1.3, dt * 9); f.position.z += (dz / d) * Math.min(d - 1.3, dt * 9); f.rotation.y = Math.atan2(dx, dz); }
      lead = f.position;
    }
  });
  s.cleanup(() => followers.forEach(f => f.parent && f.parent.remove(f)));
  return s.promise;
}

// ── stops ─────────────────────────────────────────────
export function stops(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, part, easy);
  const g = s.arena.group;
  const spots = part.spots.map((sp, i) => {
    const m = ring(0xd9a441); m.position.set(sp.x, 0.1, sp.z); g.add(m);
    const lab = labelSprite(sp.label); lab.position.set(sp.x, 2.6, sp.z); g.add(lab);
    return { ...sp, i, m, lab, pos: s.at(sp.x, sp.z), done: false };
  });
  let next = 0;
  const show = () => {
    ctx.hud.setCounter(`${part.counter || '찾아간 곳'} ${next}/${spots.length}`);
    const n = spots[next];
    ctx.testHooks.walkTo = n ? n.pos : null;
    world.setGoal(easy && n ? n.pos : null);
  };
  show();
  pickWithButton(ctx, s, () => spots.filter(x => !x.done), sp => {
    if (sp.i === next) {
      audio.play('correct'); sp.done = true; sp.m.material.color.set(0x2f6b5e);
      sp.lab.material.opacity = 0.55;
      if (sp.say) toast(ctx, sp.say, 'good');
      next += 1; show();
      if (next === spots.length) setTimeout(() => s.finish(true), 500);
    } else {
      audio.play('wrong'); toast(ctx, `× ${sp.label}: 아직 이 차례가 아니에요.`, 'bad');
      setTimeout(() => s.finish(false), 700);
    }
  });
  return s.promise;
}

// ── deliver ───────────────────────────────────────────
export function deliver(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, part, easy);
  const g = s.arena.group;
  const bins = part.bins.map(b => {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.35 }));
    disc.position.set(b.x, 0.07, b.z); g.add(disc);
    const r = ring(0xd9a441, 2.0, 2.3); r.position.set(b.x, 0.08, b.z); g.add(r);
    const lab = labelSprite(b.label, { size: 1.25 }); lab.position.set(b.x, 3.4, b.z); g.add(lab);
    return { ...b, pos: s.at(b.x, b.z) };
  });
  let i = 0, held = null;
  const hold = () => {
    if (held) world.player.remove(held);
    const c = part.cards[i];
    held = c ? labelSprite(c.text, { bg: 'rgba(255,250,240,0.97)', border: '#d9a441' }) : null;
    if (held) { held.position.set(0, 3.1, 0); world.player.add(held); }
    ctx.hud.setCounter(`${part.counter || '가져다 놓은 것'} ${i}/${part.cards.length}`);
    const target = c && bins.find(b => b.id === c.bin);
    ctx.testHooks.walkTo = target ? target.pos : null;
    world.setGoal(easy && target ? target.pos : null);
  };
  hold();
  s.cleanup(() => { if (held) world.player.remove(held); });
  pickWithButton(ctx, s, () => bins, b => {
    const c = part.cards[i];
    if (!c) return;
    if (b.id === c.bin) {
      audio.play('correct'); toast(ctx, `○ ${c.text} → ${b.label}`, 'good');
      i += 1; hold();
      if (i === part.cards.length) setTimeout(() => s.finish(true), 500);
    } else {
      audio.play('wrong'); toast(ctx, `× ${c.text}: ${b.label}이(가) 아니에요.`, 'bad');
      setTimeout(() => s.finish(false), 700);
    }
  }, 2.4);
  return s.promise;
}

// ── find ──────────────────────────────────────────────
export function find(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, part, easy);
  const g = s.arena.group;
  const items = part.items.map(it => {
    const post = new THREE.Group(); post.position.set(it.x, 0, it.z); g.add(post);
    add(post, new THREE.CylinderGeometry(0.07, 0.08, 1.6, 6), 0x5a3f2a, 0, 0.8, 0);
    const lab = labelSprite(it.text, { size: 0.85 }); lab.position.set(0, 2.2, 0); post.add(lab);
    const m = ring(0xd9a441, 0.8, 1.05); m.position.set(0, 0.09, 0); post.add(m);
    return { ...it, post, lab, m, pos: s.at(it.x, it.z), got: false };
  });
  const need = items.filter(x => x.correct).length;
  let got = 0;
  const show = () => {
    ctx.hud.setCounter(`${part.counter || '찾은 것'} ${got}/${need}`);
    const p = world.player.position;
    const left = items.filter(x => x.correct && !x.got).sort((a, b) => Math.hypot(a.pos.x - p.x, a.pos.z - p.z) - Math.hypot(b.pos.x - p.x, b.pos.z - p.z));
    ctx.testHooks.walkTo = left[0] ? left[0].pos : null;
    world.setGoal(easy && left[0] ? left[0].pos : null);
  };
  show();
  pickWithButton(ctx, s, () => items.filter(x => !x.got), it => {
    if (it.correct) {
      audio.play('correct'); it.got = true; it.m.material.color.set(0x2f6b5e); it.lab.material.opacity = 0.55;
      toast(ctx, `○ ${it.text}`, 'good'); got += 1; show();
      if (got === need) setTimeout(() => s.finish(true), 500);
    } else {
      audio.play('wrong'); toast(ctx, `× ${it.text}`, 'bad');
      setTimeout(() => s.finish(false), 700);
    }
  });
  return s.promise;
}

// ── ambush ────────────────────────────────────────────
export function ambush(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, { ...part, from: null }, easy);
  const g = s.arena.group;
  ctx.input.enabled = false;
  world.player.visible = false;
  s.cleanup(() => { world.player.visible = true; world.camMode = 'follow'; });
  const cam = part.camera;
  const cp = s.at(cam.pos[0], cam.pos[2]), ct = s.at(cam.target[0], cam.target[2]);
  world.setFixedCamera([cp.x, cam.pos[1], cp.z], [ct.x, cam.target[1], ct.z]);
  world.camMode = 'fixed';
  const taps = createTapTargets(ctx);
  s.cleanup(() => taps.dispose());
  const total = part.enemies, need = Math.max(1, part.need - (easy ? 1 : 0));
  const speed = (part.speed || 2.2) * (easy ? 0.7 : 1);
  const paths = part.paths || [part.path]; // 여러 길이면 번갈아 들어온다
  const zones = part.zones || [part.zone];
  for (const zn of zones) { const zm = new THREE.Mesh(new THREE.CircleGeometry(zn.r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.18 })); zm.position.set(zn.x, 0.08, zn.z); g.add(zm); }
  const units = [];
  let spawned = 0, hits = 0, gone = 0, clock = 0;
  const count = () => ctx.hud.setCounter(`${part.counter || '물리친 적'} ${hits}/${need}`);
  count();
  const spawn = () => {
    const u = new THREE.Group(); g.add(u);
    if (part.unit === 'ship') { add(u, box(2.6, 1.6, 7), 0x3a3f46, 0, 0.5, 0); add(u, box(1.6, 2, 2.4), 0x2b2f36, 0, 2, -0.6); add(u, new THREE.CylinderGeometry(0.08, 0.08, 4, 5), 0x2b241c, 0, 3.4, 0.8); }
    else for (let i = 0; i < 3; i++) { const p = makePerson(LOOKS[part.look || 'gendarme']); p.position.set((i - 1) * 0.9, 0, -i * 0.6); u.add(p); }
    const [[ax, az], [bx, bz]] = paths[spawned % paths.length];
    u.rotation.y = Math.atan2(bx - ax, bz - az);
    const unit = { u, k: 0, state: 'come', t: null, smoke: null, a: [ax, az], b: [bx, bz], len: Math.hypot(bx - ax, bz - az) };
    unit.t = taps.add(u, { label: part.label || '공격!', onTap: () => {
      if (unit.state !== 'come') return;
      unit.state = 'back'; hits += 1; audio.play('correct'); count();
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), new THREE.MeshBasicMaterial({ color: 0xdedad2, transparent: true, opacity: 0.7 }));
      puff.position.set(0, 1.5, 0); u.add(puff); unit.smoke = puff;
      if (hits >= need) setTimeout(() => s.finish(true), 900);
    } });
    unit.t.btn.hidden = true;
    units.push(unit); spawned += 1;
  };
  s.update(dt => {
    clock += dt;
    if (spawned < total && clock >= spawned * (part.interval || 2.4) * (easy ? 1.3 : 1)) spawn();
    for (const unit of units) {
      const [ax, az] = unit.a, [bx, bz] = unit.b, len = unit.len;
      if (unit.state === 'come') unit.k += (speed * dt) / len;
      else if (unit.state === 'back') { unit.k -= (speed * 1.6 * dt) / len; unit.u.rotation.y = Math.atan2(ax - bx, az - bz); }
      const x = ax + (bx - ax) * unit.k, z = az + (bz - az) * unit.k;
      unit.u.position.set(x, 0, z);
      if (unit.smoke) { unit.smoke.scale.multiplyScalar(1 + dt * 0.6); unit.smoke.material.opacity = Math.max(0, unit.smoke.material.opacity - dt * 0.4); }
      const inZone = zones.some(zn => Math.hypot(x - zn.x, z - zn.z) < zn.r);
      unit.t.used = !(unit.state === 'come' && inZone); // 골짜기 안에 있을 때만 누를 수 있다
      if (unit.state === 'come' && unit.k >= 1) { unit.state = 'gone'; gone += 1; audio.play('wrong'); toast(ctx, part.miss || '놓쳤어요! 다음을 기다려요.', 'bad'); }
      if (unit.state === 'back' && unit.k <= -0.2) { unit.state = 'away'; unit.u.visible = false; }
      if (unit.state === 'gone') unit.u.visible = false;
    }
    if (hits < need && spawned === total && units.every(u => u.state !== 'come')) s.finish(false);
  });
  return s.promise;
}

// ── sneak ─────────────────────────────────────────────
export function sneak(ctx, part, easy) {
  const { world, audio } = ctx;
  const s = session(ctx, part, easy);
  const g = s.arena.group;
  const wps = part.waypoints.map((w, i) => {
    const m = ring(0x7fb3c8, 1.1, 1.5); m.position.set(w.x, 0.1, w.z); m.visible = i === 0; g.add(m);
    let lab = null; if (w.label) { lab = labelSprite(w.label, { size: 0.8 }); lab.position.set(w.x, 2.6, w.z); lab.visible = i === 0; g.add(lab); }
    return { ...w, m, lab, pos: s.at(w.x, w.z) };
  });
  const guards = part.guards.map(gd => {
    const body = makePerson(LOOKS[gd.look || 'gendarme']); g.add(body);
    const range = (gd.range || 5) * (easy ? 0.75 : 1);
    const cone = new THREE.Mesh(new THREE.CircleGeometry(range, 24, -0.55, 1.1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.32, depthWrite: false }));
    cone.rotation.y = Math.PI / 2; // 원 조각의 가운데가 앞(+z)을 보게
    cone.position.y = 0.06; body.add(cone);
    return { ...gd, body, range, ph: Math.random() * 6, cone };
  });
  let next = 0, last = part.from, caught = 0;
  const show = () => { ctx.hud.setCounter(`${part.counter || '지난 숨을 곳'} ${next}/${wps.length}`); world.setGoal(wps[next] ? wps[next].pos : null); };
  show();
  s.update((dt, el) => {
    const p = world.player.position;
    caught = Math.max(0, caught - dt);
    for (const gd of guards) {
      const [[ax, az], [bx, bz]] = gd.path;
      const k = (Math.sin((el + gd.ph) * (gd.speed || 0.5)) + 1) / 2, dk = Math.cos((el + gd.ph) * (gd.speed || 0.5));
      gd.body.position.set(ax + (bx - ax) * k, 0, az + (bz - az) * k);
      gd.body.rotation.y = dk >= 0 ? Math.atan2(bx - ax, bz - az) : Math.atan2(ax - bx, az - bz);
      if (caught) continue;
      const gp = s.at(gd.body.position.x, gd.body.position.z), dx = p.x - gp.x, dz = p.z - gp.z, d = Math.hypot(dx, dz);
      let diff = Math.atan2(dx, dz) - gd.body.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (d < gd.range && Math.abs(diff) < 0.55) {
        audio.play('wrong'); caught = 1.5;
        toast(ctx, part.caught || '들켰어요! 앞의 숨을 곳에서 다시 가요.', 'bad');
        const back = s.at(...last); p.set(back.x, 0, back.z); world.snapCamera();
      }
    }
    const w = wps[next];
    if (w && near(p, w.pos, 1.6)) {
      audio.play('correct'); w.m.visible = false; if (w.lab) w.lab.visible = false;
      if (w.say) toast(ctx, w.say, 'good');
      last = [w.x, w.z]; next += 1;
      if (wps[next]) { wps[next].m.visible = true; if (wps[next].lab) wps[next].lab.visible = true; }
      show();
      if (next === wps.length) setTimeout(() => s.finish(true), 400);
    }
  });
  return s.promise;
}

export const PLAY = { drive, stops, deliver, find, ambush, sneak };
