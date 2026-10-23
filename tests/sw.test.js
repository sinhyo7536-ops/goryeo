import { test, eq, ok } from './harness.js';
import { PRECACHE, CACHE } from '../core/precache.js';

const MUST = [
  'index.html', 'styles.css', 'vendor/three.module.min.js', 'content/sources.js',
  'core/main.js', 'core/storage.js', 'core/save.js', 'core/content.js', 'core/dialogue.js', 'core/input.js',
  'core/quality.js', 'core/audio.js', 'core/world.js', 'core/people.js', 'core/screens.js', 'core/flow.js',
  'chapters/index.js', 'chapters/ch1/chapter.js', 'chapters/ch1/scene.js', 'chapters/ch1/script.js',
];

test('sw: cache name is versioned', () => eq(CACHE, 'goryeo-v33'));

test('sw: PRECACHE lists every file the game imports for ch1', () => {
  for (const f of MUST) ok(PRECACHE.includes(f), `missing ${f}`);
});

test('sw: every PRECACHE file exists on the server', async () => {
  for (const f of PRECACHE) {
    const r = await fetch(`../${f}`, { cache: 'no-store' });
    ok(r.ok, `${f} → ${r.status}`);
  }
});
import { cacheKeyFor } from '../core/precache.js';

test('sw: opening the folder address offline uses the cached index.html', () => {
  eq(cacheKeyFor('https://example.org/game/', 'navigate', 'https://example.org/game/sw.js'), 'index.html');
  eq(cacheKeyFor('https://example.org/game/?debug=x', 'navigate', 'https://example.org/game/sw.js'), 'index.html');
  eq(cacheKeyFor('https://example.org/game/core/main.js', 'cors', 'https://example.org/game/sw.js'), null);
});

import { precacheRequests } from '../core/precache.js';
test('sw: install fetches fresh files, not the browser HTTP cache', () => {
  const reqs = precacheRequests();
  eq(reqs.length, PRECACHE.length);
  ok(reqs.every(r => r.cache === 'reload'), 'cache: reload');
});
