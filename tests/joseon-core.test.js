// 조선편 공통 부품: 출처 S23~S42, 조선 모자(갓·익선관·전립·청 모자), 장마다 학생 생김새, 카드 고르기·자리 놓기, 배경음악.
import { test, eq, ok } from './harness.js';
import { SOURCES } from '../content/sources.js';
import { makePerson } from '../core/people.js';
import { portraitURL } from '../core/faces.js';
import { LOOKS } from '../content/characters.js';
import { chooseCards, placeOnBoard } from '../core/minigame.js';
import { THEMES } from '../core/music.js';
import { testWorld, sleep } from './bot.js';

const btn = (el, text) => [...el.querySelectorAll('button')].find(b => b.textContent.includes(text));
function ctx() {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  return { ui, done() { ui.remove(); } };
}

test('joseon: 출처 S23~S42가 모두 있다', () => {
  for (let i = 23; i <= 42; i++) ok(SOURCES[`S${i}`] && SOURCES[`S${i}`].url.startsWith('https://'), `S${i}`);
});

test('joseon: 조선 모자는 모양이 있고 초상화도 그린다', () => {
  const count = g => { let n = 0; g.traverse(o => { if (o.isMesh) n += 1; }); return n; };
  const bare = count(makePerson({ robe: 0x888888 }));
  for (const hat of ['gat', 'ikseon', 'jeollip', 'qing']) {
    const g = makePerson({ robe: 0x888888, hat });
    ok(count(g) > bare, `${hat} adds meshes`);
    ok(g.getObjectByName(`hat:${hat}`), `${hat} named`);
  }
  for (const id of ['yiseonggye', 'joseonSoldier', 'sejong', 'scholar']) {
    ok(LOOKS[id], id);
    ok(portraitURL(id).startsWith('data:image/png'), `${id} portrait`);
  }
});

test('joseon: 장마다 학생 생김새를 바꿔도 같은 플레이어다', () => {
  const w = testWorld();
  try {
    const p = w.player;
    p.position.set(3, 0, 4);
    w.setPlayerLook({ robe: 0x123456, hat: 'jeollip' });
    ok(w.player === p, 'same object');
    eq([p.position.x, p.position.z], [3, 4]);
    ok(p.getObjectByName('hat:jeollip'), 'new hat');
    eq(p.userData.legs.length, 2);
    eq(p.userData.arms.length, 2);
    w.setPlayerLook(LOOKS.player);
    ok(!p.getObjectByName('hat:jeollip'), 'old hat removed');
  } finally { w.dispose(); }
});

test('chooseCards: 맞는 카드를 모두 고르면 성공, 틀린 카드를 누르면 실패', async () => {
  const cards = [{ text: '가', correct: true }, { text: '나', correct: false }, { text: '다', correct: true }];
  let c = ctx(), r = null;
  chooseCards(c, { title: '고르기', cards }).then(v => { r = v; });
  btn(c.ui, '가').click(); btn(c.ui, '다').click();
  await sleep(700);
  eq(r, true); eq(c.ui.children.length, 0); c.done();
  c = ctx(); r = null;
  chooseCards(c, { title: '고르기', cards }).then(v => { r = v; });
  btn(c.ui, '가').click(); btn(c.ui, '나').click();
  await sleep(900);
  eq(r, false); c.done();
  c = ctx();
  chooseCards(c, { title: '고르기', cards, easy: true });
  ok(btn(c.ui, '가').classList.contains('hint') && !btn(c.ui, '나').classList.contains('hint'), 'easy hints correct cards');
  c.done();
});

test('placeOnBoard: 물건마다 맞는 자리를 누르면 성공, 틀리면 실패', async () => {
  const opts = { title: '놓기', items: [{ id: 'a', label: '가' }, { id: 'b', label: '나' }],
    slots: [{ id: 'n', label: '북', xy: [50, 20], answer: 'a' }, { id: 's', label: '남', xy: [50, 80], answer: 'b' }] };
  let c = ctx(), r = null;
  placeOnBoard(c, opts).then(v => { r = v; });
  ok(c.ui.textContent.includes('가'), 'first item asked');
  c.ui.querySelector('[data-slot="n"]').click();
  c.ui.querySelector('[data-slot="s"]').click();
  await sleep(900);
  eq(r, true); c.done();
  c = ctx(); r = null;
  placeOnBoard(c, opts).then(v => { r = v; });
  c.ui.querySelector('[data-slot="s"]').click();
  await sleep(900);
  eq(r, false); c.done();
  c = ctx();
  placeOnBoard(c, { ...opts, easy: true });
  ok(c.ui.querySelector('[data-slot="n"]').classList.contains('hint'), 'easy hints the right slot');
  c.done();
});

test('music: 조선편 장마다 배경음악이 있다', () => {
  for (const id of ['j1', 'j2', 'j3', 'j4', 'j5', 'j6']) ok(THEMES[id] && THEMES[id].motif.length >= 4, id);
});
