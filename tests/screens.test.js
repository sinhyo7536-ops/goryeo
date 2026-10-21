import { test, eq, ok } from './harness.js';
import { showTitle, askName, showMap, showSessionCard } from '../core/screens.js';
import { CHAPTERS, SESSIONS } from '../chapters/index.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
function root() { const d = document.createElement('div'); document.body.appendChild(d); return d; }
const btn = (el, text) => [...el.querySelectorAll('button')].find(b => b.textContent.includes(text));

test('chapters: six chapters, playable ones load and the rest are 준비 중', () => {
  eq(CHAPTERS.length, 6);
  eq(CHAPTERS.map(c => c.session), [1, 1, 1, 2, 2, 2]);
  ok(CHAPTERS[0].load, 'ch1 loads');
  ok(CHAPTERS[1].load, 'ch2 loads');
  ok(CHAPTERS.slice(3).every(c => c.load === null));
  eq(SESSIONS[1].points.length, 3);
});

test('title: shows saved name and confirms reset', async () => {
  const el = root();
  let result = null;
  showTitle(el, { savedName: '5-3 12번', hasProgress: true, storageOk: true }).then(r => { result = r; });
  ok(el.textContent.includes('5-3 12번'), 'saved name visible');
  btn(el, '처음부터').click();
  await sleep(10);
  eq(result, null, 'needs confirmation');
  ok(el.textContent.includes('지울까요'), 'confirm panel');
  btn(el, '취소').click();
  await sleep(10);
  eq(result, null);
  btn(el, '처음부터').click();
  btn(el, '지우기').click();
  await sleep(10);
  eq(result, 'new');
  el.remove();
});

test('title: continue button resumes', async () => {
  const el = root();
  const p = showTitle(el, { savedName: '김고려', hasProgress: true, storageOk: true });
  btn(el, '이어하기').click();
  eq(await p, 'continue');
  el.remove();
});

test('title: without progress, start needs no confirmation', async () => {
  const el = root();
  const p = showTitle(el, { savedName: '', hasProgress: false, storageOk: true });
  ok(!btn(el, '이어하기'), 'no continue button');
  btn(el, '처음부터').click();
  eq(await p, 'new');
  el.remove();
});

test('screens: storage warning shown when storage unavailable', () => {
  const el = root();
  showTitle(el, { savedName: '', hasProgress: false, storageOk: false });
  ok(el.textContent.includes('이 기기에서는 저장되지 않아요'));
  el.remove();
});

test('name: typed name is returned, empty is allowed', async () => {
  const el = root();
  let p = askName(el, '');
  el.querySelector('input').value = '5학년 3반 12번';
  btn(el, '시작').click();
  eq(await p, '5학년 3반 12번');
  p = askName(el, '');
  btn(el, '시작').click();
  eq(await p, '');
  el.remove();
});

test('map: finished chapter shows stars, unavailable chapters are disabled', async () => {
  const el = root();
  const save = { data: { chapters: { ch1: { stars: 2 } } }, chapterResult: id => save.data.chapters[id] || null };
  const p = showMap(el, CHAPTERS, save);
  const b1 = el.querySelector('[data-chapter="ch1"]');
  ok(b1.textContent.includes('★★☆'), b1.textContent);
  eq(el.querySelector('[data-chapter="ch2"]').disabled, false, 'ch2 opens after ch1');
  eq(el.querySelector('[data-chapter="ch4"]').disabled, true, 'ch4 not built yet');
  b1.click();
  eq(await p, 'ch1');
  el.remove();
});

test('screens: session card lists chapters with stars and wrong quiz answers', async () => {
  const el = root();
  const save = { data: { name: '김고려', chapters: { ch1: { stars: 2, quizCorrect: 1, quizTotal: 2, seconds: 125, wrongQuizzes: [{ question: '서희가 얻은 땅은?', answer: '강동 6주', explain: '압록강 동쪽이에요.' }] } } } };
  save.chapterResult = id => save.data.chapters[id] || null;
  const p = showSessionCard(el, 1, save, CHAPTERS);
  const t = el.textContent;
  ok(t.includes('김고려'));
  ok(t.includes('서희의 외교 담판') && t.includes('★★☆'));
  ok(t.includes('1/2'), 'quiz total');
  ok(t.includes('2:05'), 'time');
  ok(t.includes('강동 6주') && t.includes('서희가 얻은 땅은?'));
  ok(t.includes(SESSIONS[1].points[0]));
  btn(el, '닫기').click();
  await p;
  el.remove();
});

test('screens: title button is really clickable with HUD layers on top', async () => {
  const ui = document.getElementById('ui');
  const { createHud } = await import('../core/screens.js');
  const hud = createHud(ui, { touch: true });
  const p = showTitle(ui, { savedName: '', hasProgress: false, storageOk: true });
  const b = btn(ui, '처음부터');
  const r = b.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  ok(hit === b || b.contains(hit), `top element is ${hit && (hit.className || hit.tagName)}`);
  b.click(); await p;
  ui.innerHTML = '';
  ok(hud);
});

test('menu: leaving to the map without storage asks first', async () => {
  const { showMenu } = await import('../core/screens.js');
  const el = root();
  let result = null;
  showMenu(el, { muted: false, quality: 'medium', storageOk: false }, () => {}).then(r => { result = r; });
  btn(el, '장 선택으로').click();
  await sleep(10);
  eq(result, null);
  ok(el.textContent.includes('사라져요'));
  btn(el, '그래도 나가기').click();
  await sleep(10);
  eq(result, 'map');
  el.remove();
});
