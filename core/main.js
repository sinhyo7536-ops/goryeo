// 게임 부트스트랩: 저장 → 첫 화면 → 이름 → 장 지도 → 장 실행 → 결과.
import { createStorage } from './storage.js';
import { createSave } from './save.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createDialogue } from './dialogue.js';
import { createQualityController, guessInitialQuality } from './quality.js';
import { runChapter } from './flow.js';
import { showTitle, askName, showMap, showIntroCard, showChapterResult, showSessionCard, showMenu, showMessage, createHud } from './screens.js';
import { CHAPTERS, isSessionDone } from '../chapters/index.js';

const PREF_QUALITY = 'goryeo-game:quality';
const PREF_MUTED = 'goryeo-game:muted';

function boot() {
  const ui = document.getElementById('ui');
  const storage = createStorage();
  const save = createSave(storage);
  save.load();
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hud = createHud(ui, { touch });
  const audio = createAudio();
  audio.setMuted(storage.get(PREF_MUTED) === true);

  const savedQuality = storage.get(PREF_QUALITY);
  const initial = savedQuality || guessInitialQuality({ dpr: devicePixelRatio, cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory });
  let world;
  try { world = createWorld(document.getElementById('stage'), { quality: initial }); }
  catch {
    showMessage(ui, '3D 화면을 열 수 없어요', '이 기기나 브라우저에서는 3D 그래픽을 쓸 수 없어요. 크롬 브라우저로 다시 열어 주세요.');
    return;
  }
  addEventListener('resize', () => world.resize());
  hud.attachCamera(world.camera);
  const quality = createQualityController({ initial, onChange: lv => world.setQuality(lv) });
  if (savedQuality) quality.set(savedQuality);

  const input = createInput({ target: window, joyZone: hud.joyZone, actionButton: hud.talkBtn });
  input.enabled = false;
  const actionHandlers = new Set();
  let dialogue = null;
  input.onAction(() => {
    if (dialogue && dialogue.isOpen()) { if (!dialogue.isChoosing()) dialogue.advance(); return; }
    actionHandlers.forEach(f => f());
  });

  let inChapter = false;
  const openMenu = async () => {
    if (!inChapter) return;
    world.paused = true; // 메뉴를 보는 동안 미니게임 시간이 흐르지 않게
    const choice = await showMenu(ui, { muted: audio.muted, quality: quality.level, storageOk: storage.available }, change => {
      if ('muted' in change) { audio.setMuted(change.muted); storage.set(PREF_MUTED, change.muted); }
      if (change.quality) { quality.set(change.quality); storage.set(PREF_QUALITY, change.quality); }
    });
    world.paused = false;
    if (choice === 'map') { save.abandonCurrent(); location.reload(); } // 하던 장을 버리고 새로 열면 첫 화면 → 지도
  };
  input.onMenu(openMenu);
  hud.menuBtn.addEventListener('click', openMenu);

  const ctx = {
    world, input, audio, hud, ui, testHooks: {},
    screens: { showIntroCard: (meta, lines) => showIntroCard(ui, meta, lines) },
    get dialogue() { return dialogue; },
    setGoal: text => hud.setGoal(text),
    wait: ms => new Promise(r => setTimeout(r, ms)),
    fade: on => hud.fade(on),
    onAction(fn) { actionHandlers.add(fn); return () => actionHandlers.delete(fn); },
  };

  let last = performance.now(), wasTalking = false;
  const frame = now => {
    const raw = (now - last) / 1000; last = now;
    if (inChapter && world.level.children.length) quality.sample(raw); // 장면이 있을 때만 잰다
    const dt = Math.min(raw, 0.1);
    const talking = dialogue && dialogue.isOpen();
    if (talking && !wasTalking) input.releaseJoystick(); // 대화가 열리면 조이스틱을 놓는다
    wasTalking = talking;
    hud.setTouchVisible(inChapter && !talking);
    world.step(dt, talking ? { x: 0, z: 0 } : input.move());
    world.render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  async function playChapter(meta, stage) {
    const mod = (await meta.load()).default;
    world.clearLevel();
    quality.restart();
    world.camMode = 'follow';
    world.setMood(mod.mood);
    dialogue = createDialogue(ui, mod.script.speakers, { reduceMotion });
    hud.show(meta);
    hud.setTouchVisible(true);
    inChapter = true; input.enabled = true;
    const result = await runChapter(meta, mod, ctx, save, { resumeStage: stage });
    inChapter = false; input.enabled = false;
    input.releaseJoystick();
    hud.hide();
    dialogue.dispose(); dialogue = null;
    await showChapterResult(ui, meta, result);
    if (isSessionDone(meta.session, save)) await showSessionCard(ui, meta.session, save, CHAPTERS);
  }

  async function mapLoop() {
    for (;;) {
      if (save.data.current) {
        const { id, stage } = save.data.current;
        const meta = CHAPTERS.find(c => c.id === id);
        if (meta && meta.load) { await playChapter(meta, stage); continue; }
        save.data.current = null;
      }
      const id = await showMap(ui, CHAPTERS, save, { onSessionCard: s => showSessionCard(ui, s, save, CHAPTERS) });
      await playChapter(CHAPTERS.find(c => c.id === id), 'intro');
    }
  }

  async function main() {
    const debug = new URLSearchParams(location.search).get('debug');
    // 개발용: ?debug=ch2-scene 처럼 장면만 띄운다. ?debug=ch2-minigame 은 미니게임부터 시작한다.
    const dm = /^ch(\d)-(scene|minigame)$/.exec(debug || '');
    if (dm) {
      const meta = CHAPTERS[Number(dm[1]) - 1];
      if (dm[2] === 'minigame') { await playChapter(meta, 'minigame'); return mapLoop(); }
      const mod = (await meta.load()).default;
      world.setMood(mod.mood); const sc = mod.buildScene(world, ctx);
      const [sx, sz] = sc.start || [0, 19];
      world.player.position.set(sx, 0, sz); world.snapCamera(); input.enabled = true; inChapter = true;
      return;
    }
    const hasProgress = !!(save.data.name || Object.keys(save.data.chapters).length || save.data.current);
    const choice = await showTitle(ui, { savedName: save.data.name, hasProgress, storageOk: storage.available });
    if (choice === 'new') {
      save.reset();
      save.setName(await askName(ui, ''));
    }
    await mapLoop();
  }
  main();
}

// 오프라인 캐시는 https 배포 주소에서만 쓴다(개발 중 localhost에서는 수정이 바로 보이도록). 실패해도 게임은 그대로.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js', { type: 'module' }).catch(() => {});
}

boot();
