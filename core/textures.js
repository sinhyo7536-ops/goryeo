// 표면 무늬: 그림 파일 없이 캔버스에 그려 만든다(돌담, 나무결, 기와, 풀, 천, 잔결). 한 번 만들어 계속 쓴다.
// 무늬는 밝기만 담는다(흰색 근처). 재질 색과 곱해져 같은 색에 결이 생긴다.
import * as THREE from 'three';

export const KINDS = ['grain', 'stone', 'wood', 'tile', 'grass', 'cloth', 'earth', 'thatch'];
const SIZE = 128;
const cache = new Map();

function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

// 부드러운 얼룩(값 잡음)을 밝기 lo~hi 사이로 칠한다
function mottle(x, rand, lo, hi, cell = 16) {
  const n = SIZE / cell + 1, g = [];
  for (let i = 0; i < n * n; i++) g.push(rand());
  const img = x.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) for (let xx = 0; xx < SIZE; xx++) {
    const gx = xx / cell, gy = y / cell, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
    const at = (a, b) => g[((b % (n - 1)) * n) + (a % (n - 1))]; // 이음매 없이 반복
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v = (at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx) * (1 - sy) + (at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx) * sy;
    const fine = (rand() - 0.5) * 0.05;
    const c = Math.round(255 * Math.min(1, Math.max(0, lo + (hi - lo) * v + fine)));
    const p = (y * SIZE + xx) * 4; img.data[p] = img.data[p + 1] = img.data[p + 2] = c; img.data[p + 3] = 255;
  }
  x.putImageData(img, 0, 0);
}

const DRAW = {
  grain(x, r) { mottle(x, r, 0.86, 1, 32); },
  earth(x, r) { mottle(x, r, 0.8, 1, 16); },
  cloth(x, r) {
    mottle(x, r, 0.88, 1, 32);
    x.globalAlpha = 0.06; x.fillStyle = '#000';
    for (let i = 0; i < SIZE; i += 4) { x.fillRect(0, i, SIZE, 1); x.fillRect(i, 0, 1, SIZE); }
    x.globalAlpha = 1;
  },
  stone(x, r) { // 엇갈려 쌓은 돌: 돌마다 밝기가 조금씩 다르고 사이에 줄눈
    mottle(x, r, 0.8, 0.98, 16);
    const rows = 4, h = SIZE / rows;
    for (let row = 0; row < rows; row++) {
      const w = SIZE / 2, off = row % 2 ? w / 2 : 0;
      for (let k = -1; k < 3; k++) {
        const x0 = k * w + off;
        x.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.1})`; x.fillRect(x0 + 2, row * h + 2, w - 4, h - 4);
      }
      x.fillStyle = 'rgba(40,30,20,.45)'; x.fillRect(0, row * h, SIZE, 2);
      for (let k = -1; k < 3; k++) x.fillRect(k * w + off, row * h, 2, h);
    }
  },
  wood(x, r) { // 세로 나뭇결과 판자 이음
    mottle(x, r, 0.86, 1, 32);
    for (let i = 0; i < 40; i++) {
      const px = r() * SIZE;
      x.strokeStyle = `rgba(60,35,15,${0.05 + r() * 0.12})`; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, 0);
      for (let y = 0; y <= SIZE; y += 16) x.lineTo(px + Math.sin(y * 0.08 + i) * 2, y);
      x.stroke();
    }
    x.fillStyle = 'rgba(40,25,10,.35)';
    for (let k = 0; k < 4; k++) x.fillRect(k * SIZE / 4, 0, 2, SIZE);
  },
  tile(x, r) { // 기와: 가로 줄마다 둥근 기와 끝이 늘어선 모양
    mottle(x, r, 0.82, 0.98, 32);
    const rows = 6, h = SIZE / rows, n = 8, w = SIZE / n;
    for (let row = 0; row < rows; row++) {
      for (let k = 0; k < n; k++) {
        const gx = k * w + w / 2, gy = row * h + h;
        const grad = x.createLinearGradient(k * w, 0, (k + 1) * w, 0);
        grad.addColorStop(0, 'rgba(0,0,0,.28)'); grad.addColorStop(0.5, 'rgba(255,255,255,.08)'); grad.addColorStop(1, 'rgba(0,0,0,.28)');
        x.fillStyle = grad; x.fillRect(k * w, row * h, w, h);
        x.fillStyle = 'rgba(20,20,20,.35)'; x.beginPath(); x.arc(gx, gy - 2, w * 0.36, Math.PI, 0); x.fill();
      }
      x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(0, row * h + h - 2, SIZE, 2);
    }
  },
  thatch(x, r) { // 초가지붕: 볏짚 결과 지붕을 묶은 새끼줄 그물
    mottle(x, r, 0.78, 1, 16);
    for (let i = 0; i < 420; i++) {
      const px = r() * SIZE, py = r() * SIZE, l = 4 + r() * 8;
      x.strokeStyle = r() < 0.6 ? `rgba(60,40,10,${0.1 + r() * 0.15})` : `rgba(255,240,200,${0.1 + r() * 0.12})`;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py + l); x.stroke();
    }
    x.fillStyle = 'rgba(50,32,12,.35)';
    for (let k = 0; k < 4; k++) { x.fillRect(k * SIZE / 4, 0, 3, SIZE); x.fillRect(0, k * SIZE / 4, SIZE, 3); }
  },
  grass(x, r) { // 풀밭: 얼룩 + 잔풀 획
    mottle(x, r, 0.8, 1, 16);
    for (let i = 0; i < 260; i++) {
      const px = r() * SIZE, py = r() * SIZE, l = 2 + r() * 4;
      x.strokeStyle = r() < 0.5 ? `rgba(0,0,0,${0.08 + r() * 0.1})` : `rgba(255,255,255,${0.06 + r() * 0.08})`;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 2, py - l); x.stroke();
    }
  },
};

export function getTexture(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
  const x = cv.getContext('2d');
  (DRAW[kind] || DRAW.grain)(x, rng(17 + KINDS.indexOf(kind) * 31));
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cache.set(kind, t);
  return t;
}

// 무늬 한 장이 덮는 실제 크기(미터)의 역수. 벽이 크든 작든 같은 촘촘함으로 보인다.
export const TRI_SCALE = { grain: 0.35, earth: 0.12, cloth: 1.6, stone: 0.28, wood: 0.5, tile: 0.45, grass: 0.18, thatch: 0.45 };

// 위치로 무늬 좌표를 정하는 재질 수정(삼면 투영의 간단한 형태): 면이 향한 축에 따라 xz·zy·xy 평면에 무늬를 편다.
// space: 'world'(건물·땅: 크기와 상관없이 같은 촘촘함) 또는 'object'(사람처럼 움직이는 것: 무늬가 몸에 붙어 다닌다)
export function worldMapped(material, kind, space = 'world') {
  material.map = getTexture(kind);
  material.userData.triScale = TRI_SCALE[kind] || TRI_SCALE.grain;
  material.onBeforeCompile = shader => {
    shader.uniforms.triScale = { value: material.userData.triScale };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriN;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 triW = vec4(transformed, 1.0);
        vec3 triN = objectNormal;
        #ifdef USE_INSTANCING
          triW = instanceMatrix * triW; triN = mat3(instanceMatrix) * triN;
        #endif
        ${space === 'world' ? 'vTriPos = (modelMatrix * triW).xyz; vTriN = normalize(mat3(modelMatrix) * triN);' : 'vTriPos = triW.xyz; vTriN = normalize(triN);'}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriN;\nuniform float triScale;')
      .replace('#include <map_fragment>', `
        vec3 triA = abs(vTriN);
        vec2 triUv = triA.y > max(triA.x, triA.z) ? vTriPos.xz : (triA.x > triA.z ? vTriPos.zy : vTriPos.xy);
        diffuseColor *= texture2D(map, triUv * triScale);`);
  };
  material.customProgramCacheKey = () => `tri-${space}`;
  return material;
}

// 땅: 꼭짓점 색(풀밭·모래·바위 높이별 색)에 풀·흙 무늬를 곱한다
export function groundMaterial(kind = 'grass') {
  return worldMapped(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), kind);
}
