import { test, eq, ok } from './harness.js';
import { runChapter } from '../core/flow.js';
import { createStorage } from '../core/storage.js';
import { createSave } from '../core/save.js';

function memSave() {
  const m = new Map();
  return createSave(createStorage({ getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }));
}
const quizzes = [
  { kind: 'quiz', question: 'Q1', options: ['가', '나', '다'], answer: 0, explain: 'E1', src: ['S1'] },
  { kind: 'quiz', question: 'Q2', options: ['가', '나', '다'], answer: 1, explain: 'E2', src: ['S1'] },
];
function fakeChapter(log, { firstTryCorrect = 2, easyModeUsed = false } = {}) {
  return {
    id: 'fake', script: { intro: [{ who: 'narr', text: 'x', src: ['S1'] }] }, quizzes,
    buildScene() { log.push('build'); },
    enterStage(ctx, stage) { log.push(`enter:${stage}`); },
    async explore() { log.push('explore'); },
    async minigame() { log.push('minigame'); return { firstTryCorrect, firstTryTotal: 2, easyModeUsed }; },
  };
}
function fakeCtx(log, picks) {
  return {
    screens: { showIntroCard: async () => { log.push('intro'); } },
    dialogue: { quiz: async q => { log.push(`quiz:${q.question}`); return { correct: picks.shift() === q.answer }; }, close() {} },
  };
}
const meta = { id: 'fake', no: 1, title: '가짜 장' };

test('flow: runs stages in order and saves checkpoints', async () => {
  const log = [], save = memSave();
  const seen = [];
  const orig = save.checkpoint; save.checkpoint = (id, stage) => { seen.push(stage); orig(id, stage); };
  const r = await runChapter(meta, fakeChapter(log), fakeCtx(log, [0, 1]), save);
  eq(log, ['intro', 'build', 'explore', 'minigame', 'quiz:Q1', 'quiz:Q2']);
  eq(seen, ['intro', 'explore', 'minigame', 'quiz']);
  eq(r.quizCorrect, 2); eq(r.quizTotal, 2);
  eq(save.data.current, null);
  eq(save.chapterResult('fake').stars, 3);
});

test('flow: resume from checkpoint does not double count', async () => {
  const log = [], save = memSave();
  save.checkpoint('fake', 'quiz');
  const r = await runChapter(meta, fakeChapter(log), fakeCtx(log, [0, 2]), save, { resumeStage: 'quiz' });
  ok(!log.includes('minigame'), 'minigame skipped');
  ok(log.includes('enter:quiz'), 'chapter told where it resumes');
  eq(r.firstTryTotal, 0);
  eq(r.quizTotal, 2);
  eq(r.quizCorrect, 1);
  eq(Object.keys(save.data.chapters), ['fake']);
});

test('flow: chapter result stars use quiz and easy mode', async () => {
  const log = [], save = memSave();
  const r = await runChapter(meta, fakeChapter(log, { easyModeUsed: true }), fakeCtx(log, [0, 1]), save);
  eq(r.stars, 2);
});

test('flow: wrong quizzes are kept with question, right answer and explanation', async () => {
  const log = [], save = memSave();
  const r = await runChapter(meta, fakeChapter(log), fakeCtx(log, [2, 1]), save);
  eq(r.wrongQuizzes, [{ question: 'Q1', answer: '가', explain: 'E1' }]);
});
