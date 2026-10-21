import { test, eq } from './harness.js';
import { QUALITY, createQualityController, guessInitialQuality } from '../core/quality.js';

test('quality: levels match spec', () => {
  eq(QUALITY.low.pixelRatio, 0.75); eq(QUALITY.medium.pixelRatio, 1); eq(QUALITY.high.pixelRatio, 1.5);
  eq(QUALITY.low.shadows, 'off'); eq(QUALITY.high.shadows, 'soft');
});

test('quality: drops one level after 3s under 40fps', () => {
  const changes = [];
  const q = createQualityController({ initial: 'medium', onChange: l => changes.push(l) });
  for (let i = 0; i < 100; i++) q.sample(1 / 30);
  eq(q.level, 'low');
  eq(changes, ['low']);
});

test('quality: high drops to medium, then low on a second slow window', () => {
  const q = createQualityController({ initial: 'high' });
  for (let i = 0; i < 100; i++) q.sample(1 / 30);
  eq(q.level, 'medium');
  for (let i = 0; i < 100; i++) q.sample(1 / 30);
  eq(q.level, 'low');
  for (let i = 0; i < 100; i++) q.sample(1 / 10);
  eq(q.level, 'low');
});

test('quality: stays when fps is fine', () => {
  const q = createQualityController({ initial: 'medium' });
  for (let i = 0; i < 400; i++) q.sample(1 / 60);
  eq(q.level, 'medium');
});

test('quality: manual set stops auto changes', () => {
  const q = createQualityController({ initial: 'medium' });
  q.set('high');
  for (let i = 0; i < 100; i++) q.sample(1 / 20);
  eq(q.level, 'high');
});

test('quality: a single long frame (tab switch) is ignored', () => {
  const q = createQualityController({ initial: 'medium' });
  q.sample(2.5);
  for (let i = 0; i < 200; i++) q.sample(1 / 60);
  eq(q.level, 'medium');
});

test('quality: S6 Lite guess is medium', () => eq(guessInitialQuality({ dpr: 2, cores: 8, memory: 4 }), 'medium'));
test('quality: strong device guess is high', () => eq(guessInitialQuality({ dpr: 2, cores: 8, memory: 8 }), 'high'));
test('quality: unknown memory guess is medium', () => eq(guessInitialQuality({ dpr: 1, cores: 8, memory: undefined }), 'medium'));
