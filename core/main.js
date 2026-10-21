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
import { CHAPTERS } from '../chapters/index.js';

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
    const choice = await showMenu(ui, { muted: audio.muted, quality: quality.level }, change => {
      if ('muted' in change) { audio.setMuted(change.muted); storage.set(PREF_MUTED, change.muted); }
      if (change.quality) { quality.set(change.quality); storage.set(PREF_QUALITY, change.quality); }
    });
    if (choice === 'map') location.reload(); // 체크포인트가 저장되어 있어 첫 화면에서 이어할 수 있다
  };
  input.onMenu(openMenu);
  hud.menuBtn.addEventListener('click', openMenu);

  const ctx = {
    world, input, audio, hud,
    screens: { showIntroCard: (meta, lines) => showIntroCard(ui, meta, lines) },
    get dialogue() { return dialogue; },
    setGoal: text => hud.setGoal(text),
    wait: ms => new Promise(r => setTimeout(r, ms)),
    fade: on => hud.fade(on),
    onAction(fn) { actionHandlers.add(fn); return () => actionHandlers.delete(fn); },
  };

  let last = performance.now();
  const frame = now => {
    const raw = (now - last) / 1000; last = now;
    quality.sample(raw);
    const dt = Math.min(raw, 0.1);
    const talking = dialogue && dialogue.isOpen();
    hud.setTouchVisible(inChapter && !talking);
    world.step(dt, talking ? { x: 0, z: 0 } : input.move());
    world.render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  async function playChapter(meta, stage) {
    const mod = (await meta.load()).default;
    world.clearLevel();
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
    const sessionDone = CHAPTERS.filter(c => c.session === meta.session && c.load).every(c => save.chapterResult(c.id));
    if (sessionDone) await showSessionCard(ui, meta.session, save, CHAPTERS);
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
    if (debug === 'ch1-scene') {
      const mod = (await CHAPTERS[0].load()).default;
      world.setMood(mod.mood); mod.buildScene(world, ctx); world.player.position.set(0, 0, 19); world.snapCamera(); input.enabled = true; inChapter = true;
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

boot();
