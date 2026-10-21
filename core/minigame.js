// 미니게임 공통 부품: 방법 카드, 다시 하기·쉬운 모드, 화면 위 누르기 목표, 큰 행동 버튼.
import * as THREE from 'three';

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
    await ctx.dialogue.say({ who: 'guide', text: fails === 3 ? `${failHint} 이번에는 조금 쉽게 해 볼게요.` : failHint });
    ctx.dialogue.close();
  }
}

// 3D 물체 위에 떠 있는 누르기 버튼. 한 번 누르면 바로 꺼져서 두 번 세지지 않는다.
export function createTapTargets(ctx) {
  const targets = new Set();
  const v = new THREE.Vector3();
  const off = ctx.world.onUpdate(() => {
    for (const t of targets) {
      t.obj.getWorldPosition(v).project(ctx.world.camera);
      const inside = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      t.btn.hidden = !inside || t.used;
      t.btn.style.left = `${((v.x + 1) / 2) * 100}%`;
      t.btn.style.top = `${((1 - v.y) / 2) * 100}%`;
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
