// 조선편 2장 「세종과 훈민정음」: 궁궐 탐험(백성·집현전 학자·세종) → 글자 만들기(기본 자음, 획 더하기, 모음, 낱말 모으기) → 퀴즈.
import { buildJ2Scene } from './scene.js';
import { showHowTo, placeOnBoard, orderCards } from '../../../core/minigame.js';
import { LOOKS } from '../../../content/characters.js';
import { sayAll, placePlayer, talkInOrder, setTalkStep, tryPart, sumParts } from '../common.js';
import script from './script.js';

const ORDER = ['commoner', 'scholar', 'sejong'];
const NEAR_SEJONG = [0, -2];
let scene = null;

// 기본 자음 판: 글자 다섯을 본뜬 모양 자리에 놓는다(자리 순서는 글자 순서와 다르게)
export const CONSONANTS = {
  items: [{ id: 'g', label: 'ㄱ' }, { id: 'n', label: 'ㄴ' }, { id: 'm', label: 'ㅁ' }, { id: 's', label: 'ㅅ' }, { id: 'o', label: 'ㅇ' }],
  slots: [
    { id: 'mouth', label: '입 모양', xy: [18, 28], answer: 'm' },
    { id: 'tongue', label: '혀가 윗잇몸에 붙는 모양', xy: [50, 28], answer: 'n' },
    { id: 'throat', label: '목구멍 모양', xy: [82, 28], answer: 'o' },
    { id: 'root', label: '혀뿌리가 목구멍을 막는 모양', xy: [30, 72], answer: 'g' },
    { id: 'teeth', label: '이 모양', xy: [70, 72], answer: 's' },
  ],
};
export const VOWELS = {
  items: [{ id: 'dot', label: 'ㆍ' }, { id: 'flat', label: 'ㅡ' }, { id: 'stand', label: 'ㅣ' }],
  slots: [
    { id: 'person', label: '사람(서 있어요)', xy: [20, 50], answer: 'stand' },
    { id: 'sky', label: '하늘(둥글어요)', xy: [50, 50], answer: 'dot' },
    { id: 'earth', label: '땅(평평해요)', xy: [80, 50], answer: 'flat' },
  ],
};

export default {
  id: 'j2',
  mood: 'morning',
  player: LOOKS.kid,
  script,
  quizzes: script.quizzes,

  buildScene(world) { scene = buildJ2Scene(world); return scene; },

  enterStage(ctx, stage) {
    if (stage === 'minigame') placePlayer(ctx.world, NEAR_SEJONG);
    if (stage === 'quiz') { placePlayer(ctx.world, NEAR_SEJONG); ctx.setGoal(script.goals[4]); }
  },

  explore(ctx) { return talkInOrder(ctx, script, ORDER, scene.start); },

  async minigame(ctx) {
    const { world, dialogue, input } = ctx;
    input.enabled = false;
    setTalkStep(ctx, script, ORDER, 3);
    world.setGoal(null);
    await showHowTo(ctx.ui, {
      title: '글자 만들기',
      steps: ['기본 자음 다섯 자를 본뜬 모양 자리에 놓아요.', '획을 더해 만든 글자를 차례대로 놓아요.', '모음 세 글자를 본뜬 것과 짝지어요.', '낱자를 모아 낱말을 만들어요.'],
      keyboard: '마우스로 글자와 자리를 눌러요', touch: '글자와 자리를 손가락으로 눌러요',
    });
    const parts = [];
    parts.push(await tryPart(ctx, easy => placeOnBoard(ctx, { title: script.consonants.title, ...CONSONANTS, easy }), script.consonants.fail));
    await sayAll(dialogue, script.consonants.done); dialogue.close();
    parts.push(await tryPart(ctx, easy => orderCards(ctx, { title: script.strokes.title, cards: script.strokes.cards, easy }), script.strokes.fail));
    await sayAll(dialogue, script.strokes.done); dialogue.close();
    parts.push(await tryPart(ctx, easy => placeOnBoard(ctx, { title: script.vowels.title, ...VOWELS, easy }), script.vowels.fail));
    await sayAll(dialogue, script.vowels.done); dialogue.close();
    for (const w of script.words) parts.push(await tryPart(ctx, easy => orderCards(ctx, { title: w.title, cards: w.cards, easy }), script.wordsFail));
    await sayAll(dialogue, script.wordsDone);
    await sayAll(dialogue, script.result);
    dialogue.close();
    placePlayer(world, NEAR_SEJONG);
    ctx.setGoal(script.goals[4]);
    return sumParts(parts);
  },
};
