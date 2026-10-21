// 3D 무대: 렌더러, 분위기(하늘·안개·빛), 따라가는 카메라, 플레이어, 인물, 충돌, 목표 화살표.
import * as THREE from 'three';
import { QUALITY } from './quality.js';
import { makePerson, animateWalk, markerSprite } from './people.js';

// 장면 분위기. 2~6장 값은 다음 계획에서 채운다.
export const MOODS = {
  sunset: {
    skyTop: 0x4a5a86, skyHorizon: 0xf2b072, skyBottom: 0x8a7a62,
    fog: [0xe7b48c, 45, 150],
    sun: { color: 0xffcf9a, intensity: 1.7, dir: [-34, 22, -20] },
    hemi: [0xffd9b8, 0x3e4a3a, 0.5],
    particles: 'embers',
  },
  snow: {
    skyTop: 0x8e9aa8, skyHorizon: 0xd9dee3, skyBottom: 0x9aa3a8,
    fog: [0xd5dbe0, 30, 120],
    sun: { color: 0xe8eef5, intensity: 0.8, dir: [20, 30, 10] },
    hemi: [0xeef3f8, 0x8a9096, 0.9],
    particles: 'snow',
  },
  storm: {
    skyTop: 0x3b4652, skyHorizon: 0x76828c, skyBottom: 0x4a5258,
    fog: [0x5f6b74, 20, 90],
    sun: { color: 0xc8d2dc, intensity: 0.5, dir: [10, 30, 20] },
    hemi: [0xb4c0cc, 0x3a4038, 0.75],
    particles: 'rain',
  },
};

const SPEED = 6.5;
const PLAYER_R = 0.4;
const CAM_OFFSET = new THREE.Vector3(0, 8.5, 12);
const LOOK_AHEAD = -4; // 카메라는 플레이어보다 조금 앞(북쪽)을 본다

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.55)) : mix(horizon, bottom, pow(-h, 0.4));
      gl_FragColor = vec4(c, 1.0); }`,
  });
}

export function createWorld(container, { quality = 'medium', renderer: injected = null } = {}) {
  let renderer;
  try { renderer = injected || new THREE.WebGLRenderer({ antialias: quality !== 'low' }); }
  catch (e) { const err = new Error('WEBGL_UNAVAILABLE'); err.cause = e; throw err; }
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 400);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), skyMaterial());
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
  scene.add(hemi, sun, sun.target);

  const level = new THREE.Group();
  scene.add(level);
  const player = makePerson({ robe: 0x2f6b5e, hat: 'helmet' });
  scene.add(player);

  const goalArrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1, 3).rotateX(Math.PI / 2).translate(0, 0, 1.6),
    new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.85 }),
  );
  goalArrow.visible = false;
  scene.add(goalArrow);

  const camTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const updaters = [];
  let goal = null, elapsed = 0;

  const world = {
    scene, camera, renderer, level, player, goalArrow,
    colliders: [], npcs: new Map(),
    bounds: { x0: -50, x1: 50, z0: -50, z1: 50 },
    camMode: 'follow',
    quality: QUALITY[quality],
    qualityLevel: quality,

    setMood(name) {
      const m = MOODS[name];
      sky.material.uniforms.top.value.set(m.skyTop);
      sky.material.uniforms.horizon.value.set(m.skyHorizon);
      sky.material.uniforms.bottom.value.set(m.skyBottom);
      scene.fog = new THREE.Fog(m.fog[0], m.fog[1], m.fog[2]);
      scene.background = new THREE.Color(m.fog[0]);
      sun.color.set(m.sun.color); sun.intensity = m.sun.intensity;
      sun.position.set(...m.sun.dir); sun.target.position.set(0, 0, -8);
      hemi.color.set(m.hemi[0]); hemi.groundColor.set(m.hemi[1]); hemi.intensity = m.hemi[2];
      world.mood = m;
    },
    setQuality(levelName) {
      const q = QUALITY[levelName];
      world.quality = q; world.qualityLevel = levelName;
      renderer.setPixelRatio(Math.min(q.pixelRatio, Math.max(1, window.devicePixelRatio || 1)));
      renderer.shadowMap.enabled = q.shadows !== 'off';
      renderer.shadowMap.type = q.shadows === 'soft' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      sun.castShadow = q.shadows !== 'off';
      scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(mm => { mm.needsUpdate = true; }); });
      world.resize();
    },
    resize() {
      const w = container.clientWidth || window.innerWidth, h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    },
    addCollider(c) { world.colliders.push(c); return c; },
    addNpc(id, opts, x, z, faceY = 0) {
      const mesh = makePerson(opts);
      mesh.position.set(x, 0, z); mesh.rotation.y = faceY;
      const mark = markerSprite('!'); mark.position.set(0, 3.1, 0); mark.visible = false; mesh.add(mark);
      level.add(mesh);
      const npc = { id, mesh, mark, collider: world.addCollider({ x, z, r: 0.5 }) };
      world.npcs.set(id, npc);
      return npc;
    },
    moveNpc(id, x, z, faceY) {
      const n = world.npcs.get(id);
      n.mesh.position.set(x, 0, z); n.mesh.rotation.y = faceY; n.collider.x = x; n.collider.z = z;
    },
    nearestNpc(maxDist) {
      let best = null, bestD = maxDist;
      for (const n of world.npcs.values()) {
        if (!n.mesh.visible) continue;
        const d = n.mesh.position.distanceTo(player.position);
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    },
    setGoal(target) { goal = target; },
    getGoal() { return goal; },
    setFixedCamera(pos, target) {
      world.camMode = 'fixed';
      camera.position.set(...pos); camTarget.set(...target); camera.lookAt(camTarget);
    },
    snapCamera() {
      camera.position.copy(player.position).add(world.camOffset());
      camTarget.copy(player.position).setY(1); camTarget.z += LOOK_AHEAD; camera.lookAt(camTarget);
    },
    camOffset() { return tmp.copy(CAM_OFFSET).multiplyScalar(camera.aspect < 1 ? 1.45 : 1); },
    onUpdate(fn) {
      updaters.push(fn);
      return () => { const i = updaters.indexOf(fn); if (i >= 0) updaters.splice(i, 1); };
    },
    paused: false, // 메뉴가 열려 있는 동안 true: 미니게임 시간과 움직임을 멈춘다
    step(dt, move) {
      if (world.paused) return;
      elapsed += dt;
      const len = Math.hypot(move.x, move.z), moving = len > 0.01;
      const p = player.position;
      if (moving) {
        p.x += move.x * SPEED * dt; p.z += move.z * SPEED * dt;
        for (const c of world.colliders) {
          const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), min = c.r + PLAYER_R;
          if (d < min && d > 1e-6) { p.x = c.x + (dx / d) * min; p.z = c.z + (dz / d) * min; }
        }
        const b = world.bounds;
        p.x = Math.min(b.x1, Math.max(b.x0, p.x)); p.z = Math.min(b.z1, Math.max(b.z0, p.z));
        let diff = Math.atan2(move.x, move.z) - player.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        player.rotation.y += diff * Math.min(1, dt * 12);
      }
      animateWalk(player, moving, dt);
      for (const n of world.npcs.values()) if (n.mark.visible) n.mark.position.y = 3.1 + Math.sin(elapsed * 3) * 0.12;
      if (goal) {
        const dx = goal.x - p.x, dz = goal.z - p.z;
        goalArrow.visible = Math.hypot(dx, dz) > 3;
        goalArrow.position.set(p.x, 0.15, p.z);
        goalArrow.rotation.y = Math.atan2(dx, dz);
      } else goalArrow.visible = false;
      for (const fn of [...updaters]) fn(dt, elapsed); // 도중에 해제해도 안전하도록 복사본을 돈다
      if (world.camMode === 'follow') {
        const a = 1 - Math.exp(-dt * 4);
        camera.position.lerp(tmp.copy(p).add(world.camOffset()), a);
        camTarget.lerp(tmp.copy(p).setY(1).setZ(p.z + LOOK_AHEAD), a);
        camera.lookAt(camTarget);
      }
    },
    clearLevel() {
      for (const o of [...level.children]) {
        level.remove(o);
        o.traverse(c => { if (c.geometry) c.geometry.dispose(); });
      }
      world.colliders.length = 0; world.npcs.clear(); updaters.length = 0; goal = null;
    },
    render() { renderer.render(scene, camera); },
    dispose() {
      world.clearLevel();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
  world.setQuality(quality);
  world.setMood('sunset');
  world.snapCamera();
  return world;
}
