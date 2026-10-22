// 미니게임 공통 부품: 방법 카드, 다시 하기·쉬운 모드, 화면 위 누르기 목표, 큰 행동 버튼.
import * as THREE from 'three';
import { MAP_OUTLINE } from './screens.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function showHowTo(ui, { title, steps, keyboard, touch }) {
  return new Promise(resolve => {
    const screen = el('section', 'screen howto');
    const card = el('div', 'card');
    card.append(el('div', 'eyebrow', '방법'), el('h2', null, title));
    const ol = el('ol', 'howto-steps');
    for (const s of steps) ol.append(el('li', null, s));
    const ctl = el('div', 'howto-controls');
    ctl.append(el('p', null, `키보드·마우스: ${keyboard}`), el('p', null, `터치: ${touch}`));
    const go = el('button', 'btn primary', '시작');
    go.type = 'button';
    go.addEventListener('click', () => { screen.remove(); resolve(); });
    card.append(ol, ctl, go);
    screen.append(card);
    ui.append(screen);
  });
}

// 실패하면 안내를 보여 주고 다시. 세 번째 실패 뒤부터는 쉬운 모드로 시도한다.
export async function runWithRetries(ctx, attempt, { failHint }) {
  let fails = 0, easyModeUsed = false;
  for (;;) {
    const easy = fails >= 3;
    if (easy) easyModeUsed = true;
    if (await attempt(easy)) return { easyModeUsed };
    fails += 1;
    const hint = typeof failHint === 'function' ? failHint() : failHint;
    await ctx.dialogue.say({ who: 'guide', text: fails === 3 ? `${hint} 이번에는 조금 쉽게 해 볼게요.` : hint });
    ctx.dialogue.close();
  }
}

// 3D 물체 위에 떠 있는 누르기 버튼. 한 번 누르면 바로 꺼져서 두 번 세지지 않는다.
export function createTapTargets(ctx) {
  const targets = new Set();
  const v = new THREE.Vector3();
  const off = ctx.world.onUpdate(() => {
    ctx.world.camera.updateMatrixWorld(); // 고정 카메라로 막 바뀐 경우에도 위치가 맞도록
    for (const t of targets) {
      t.obj.getWorldPosition(v).project(ctx.world.camera);
      const inside = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      t.btn.hidden = !inside || t.used;
      // 버튼 반지름(약 40px)만큼 화면 안쪽으로 붙잡아 가장자리에서 잘리지 않게 한다
      const W = innerWidth, H = innerHeight;
      t.btn.style.left = `${Math.min(W - 44, Math.max(44, ((v.x + 1) / 2) * W))}px`;
      t.btn.style.top = `${Math.min(H - 44, Math.max(44, ((1 - v.y) / 2) * H))}px`;
    }
  });
  const api = {
    add(obj, { label, onTap }) {
      const btn = el('button', 'tap-target', label);
      btn.type = 'button';
      const t = { obj, btn, used: false };
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (t.used) return;
        t.used = true; btn.hidden = true;
        onTap();
      });
      ctx.ui.append(btn);
      targets.add(t);
      return t;
    },
    remove(t) { t.btn.remove(); targets.delete(t); },
    clear() { for (const t of targets) t.btn.remove(); targets.clear(); },
    dispose() { api.clear(); off(); },
  };
  return api;
}

// 화면 아래 가운데 큰 버튼. 클릭이나 E·스페이스(행동 키)로 누른다.
export function actionButton(ctx, label) {
  const btn = el('button', 'big-action', label);
  btn.type = 'button';
  ctx.ui.append(btn);
  let resolveFn = null;
  const press = () => { if (resolveFn) { const r = resolveFn; resolveFn = null; r(); } };
  btn.addEventListener('click', press);
  const unbind = ctx.onAction(press);
  return {
    wait() { return new Promise(r => { resolveFn = r; }); },
    remove() { unbind(); btn.remove(); resolveFn = null; },
  };
}

// 카드 순서 맞추기: 섞인 카드를 정답 순서대로 누른다. 틀리면 그 시도는 실패(false).
// easy이면 다음에 눌러야 할 카드가 빛난다.
export function orderCards(ctx, { title, cards, easy = false }) {
  return new Promise(resolve => {
    const screen = el('section', 'screen order');
    const card = el('div', 'card wide');
    const slots = el('ol', 'order-slots');
    const pile = el('div', 'order-pile');
    card.append(el('div', 'eyebrow', '순서 맞추기'), el('h2', null, title), slots, pile);
    screen.append(card);
    ctx.ui.append(screen);
    // 정답 순서와 다르게 섞는다 (고정된 섞기라 테스트와 화면이 같다)
    const order = cards.map((c, i) => ({ c, k: (i * 7 + 3) % cards.length }));
    order.sort((a, b) => a.k - b.k);
    if (order.every((o, i) => o.c === cards[i])) order.reverse();
    let next = 0;
    const buttons = order.map(({ c }) => {
      const b = el('button', 'order-card', c); b.type = 'button';
      b.addEventListener('click', () => {
        if (c === cards[next]) {
          slots.append(el('li', null, c)); b.remove(); next += 1;
          if (next === cards.length) { setTimeout(() => { screen.remove(); resolve(true); }, 300); return; }
          hint();
        } else {
          b.classList.add('wrong');
          setTimeout(() => { screen.remove(); resolve(false); }, 600);
          buttons.forEach(x => { x.disabled = true; });
        }
      });
      pile.append(b);
      return b;
    });
    const hint = () => { if (easy) buttons.forEach(b => b.classList.toggle('hint', b.textContent === cards[next])); };
    hint();
  });
}

// 획 따라 그리기: 획마다 점을 순서대로 지나가면 그 획이 새겨진다. 손을 떼면 그 획만 처음부터.
export function traceGlyph(ctx, { glyph, strokes, easy = false }) {
  return new Promise(resolve => {
    const NS = 'http://www.w3.org/2000/svg';
    const screen = el('section', 'screen trace');
    const card = el('div', 'card');
    const board = el('div', 'trace-board');
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100');
    const bg = document.createElementNS(NS, 'text');
    bg.setAttribute('x', '50'); bg.setAttribute('y', '58'); bg.setAttribute('text-anchor', 'middle'); bg.setAttribute('dominant-baseline', 'middle');
    bg.setAttribute('class', 'trace-glyph'); bg.textContent = glyph;
    svg.append(bg); board.append(svg);
    card.append(el('div', 'eyebrow', '글자 새기기'), el('h2', null, `'${glyph}' 자를 새겨 보아요`), el('p', null, '빛나는 점을 1번부터 차례로 지나가도록 끌어요.'), board);
    screen.append(card); ctx.ui.append(screen);

    const R = easy ? 0.11 : 0.07;
    let s = 0, progress = 0, active = null;
    const dots = [];
    const drawDots = () => {
      dots.forEach(d => d.remove()); dots.length = 0;
      if (s >= strokes.length) return;
      strokes[s].forEach(([x, y], i) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x * 100); c.setAttribute('cy', y * 100); c.setAttribute('r', i === 0 ? 5 : 3.5);
        c.setAttribute('class', `trace-dot${i < progress ? ' passed' : ''}${i === 0 ? ' first' : ''}`);
        svg.append(c); dots.push(c);
      });
    };
    const pos = e => { const r = board.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    const near = ([x, y], [px, py]) => Math.hypot(x - px, y - py) < R;
    const finishStroke = () => {
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('points', strokes[s].map(([x, y]) => `${x * 100},${y * 100}`).join(' '));
      line.setAttribute('class', 'stroke-done');
      svg.append(line);
      s += 1; progress = 0;
      if (s === strokes.length) { drawDots(); setTimeout(() => { screen.remove(); resolve(true); }, 400); }
      else drawDots();
    };
    board.addEventListener('pointerdown', e => {
      if (s >= strokes.length) return;
      if (!near(strokes[s][0], pos(e))) return;
      active = e.pointerId; progress = 1; last = pos(e);
      try { board.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      drawDots();
    });
    // 손가락을 빨리 움직이면 두 위치 사이를 건너뛴다. 그 사이 선분 위를 촘촘히 따라가며 점을 지났는지 본다.
    let last = null;
    board.addEventListener('pointermove', e => {
      if (e.pointerId !== active || s >= strokes.length) return;
      const now = pos(e);
      const steps = Math.max(1, Math.ceil(Math.hypot(now[0] - last[0], now[1] - last[1]) / (R / 2)));
      for (let k = 1; k <= steps && active !== null; k++) {
        const p = [last[0] + (now[0] - last[0]) * k / steps, last[1] + (now[1] - last[1]) * k / steps];
        if (near(strokes[s][progress], p)) {
          progress += 1;
          if (progress === strokes[s].length) { active = null; finishStroke(); } else drawDots();
        }
      }
      last = now;
    });
    const lift = e => { if (e.pointerId !== active) return; active = null; progress = 0; drawDots(); };
    board.addEventListener('pointerup', lift);
    board.addEventListener('pointercancel', lift);
    drawDots();
  });
}

// 지도에서 고르기: 고려 지도 위의 장소 버튼 중 하나를 누르면 그 id를 돌려준다.
export function pickOnMap(ctx, { title, places }) {
  return new Promise(resolve => {
    const screen = el('section', 'screen pickmap');
    const card = el('div', 'card');
    const map = el('div', 'map pick');
    map.innerHTML = `<svg viewBox="0 0 300 400" aria-hidden="true"><polygon points="${MAP_OUTLINE}" class="land"/><ellipse cx="120" cy="388" rx="16" ry="8" class="land"/></svg>`;
    for (const p of places) {
      const b = el('button', 'map-place', p.label); b.type = 'button';
      b.dataset.place = p.id;
      // 위치는 작은 점으로, 버튼은 점 옆(labelAt)에 놓아 가까운 장소끼리 겹치지 않게 한다
      const [lx, ly] = p.labelAt || p.xy;
      b.style.left = `${lx}%`; b.style.top = `${ly}%`;
      b.addEventListener('click', () => { screen.remove(); resolve(p.id); });
      const dot = el('span', 'map-dot'); dot.style.left = `${p.xy[0]}%`; dot.style.top = `${p.xy[1]}%`;
      if (p.labelAt) {
        const line = el('span', 'map-line');
        const dx = (lx - p.xy[0]) * 3, dy = (ly - p.xy[1]) * 4; // 지도 비율 300×400
        line.style.left = `${p.xy[0]}%`; line.style.top = `${p.xy[1]}%`;
        line.style.width = `${Math.hypot(dx, dy) / 3}%`;
        line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        map.append(line);
      }
      map.append(dot, b);
    }
    card.append(el('div', 'eyebrow', '지도에서 고르기'), el('h2', null, title), map);
    screen.append(card);
    ctx.ui.append(screen);
  });
}
