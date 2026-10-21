import { test, eq, ok } from './harness.js';
import { createStorage } from '../core/storage.js';
import { createSave, computeStars } from '../core/save.js';

function memoryBackend() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

test('stars: 3 needs both quizzes and no easy mode', () => {
  eq(computeStars({ quizCorrect: 2, easyModeUsed: false }), 3);
  eq(computeStars({ quizCorrect: 2, easyModeUsed: true }), 2);
  eq(computeStars({ quizCorrect: 1, easyModeUsed: false }), 2);
  eq(computeStars({ quizCorrect: 0, easyModeUsed: false }), 1);
});

test('save: round trip name, checkpoint, result', () => {
  const backend = memoryBackend();
  const a = createSave(createStorage(backend));
  a.setName('5-3 12번');
  a.checkpoint('ch1', 'minigame');
  const b = createSave(createStorage(backend));
  b.load();
  eq(b.data.name, '5-3 12번');
  eq(b.data.current, { id: 'ch1', stage: 'minigame' });
});

test('save: storage that throws', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const s = createStorage(bad);
  eq(s.available, false);
  eq(s.set('k', 1), false);
  eq(s.get('k'), null);
  const save = createSave(s);
  save.load();
  save.setName('김고려');
  eq(save.data.name, '김고려');
});

test('save: finishing a chapter twice keeps the later result only', () => {
  const save = createSave(createStorage(memoryBackend()));
  const r = { stars: 1, quizCorrect: 0, quizTotal: 2, firstTryCorrect: 0, firstTryTotal: 2, easyModeUsed: false, seconds: 300, wrongQuizzes: [0, 1] };
  save.finishChapter('ch1', r);
  save.finishChapter('ch1', { ...r, stars: 3, quizCorrect: 2, wrongQuizzes: [] });
  eq(Object.keys(save.data.chapters), ['ch1']);
  eq(save.chapterResult('ch1').stars, 3);
  eq(save.data.current, null);
});

test('save: reset clears name, chapters, current', () => {
  const backend = memoryBackend();
  const save = createSave(createStorage(backend));
  save.setName('a'); save.checkpoint('ch1', 'quiz');
  save.finishChapter('ch1', { stars: 2 });
  save.reset();
  eq(save.data, { name: '', chapters: {}, current: null });
  const again = createSave(createStorage(backend)); again.load();
  eq(again.data.name, '');
});

test('save: corrupt stored data falls back to empty', () => {
  const backend = memoryBackend();
  backend.setItem('goryeo-game:v1', '{not json');
  const save = createSave(createStorage(backend)); save.load();
  eq(save.data, { name: '', chapters: {}, current: null });
  ok(true);
});
