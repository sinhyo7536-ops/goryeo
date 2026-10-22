import { test, eq, ok } from './harness.js';
import { LOOKS } from '../content/characters.js';
import { portraitURL, faceTexture } from '../core/faces.js';
import { makePerson } from '../core/people.js';
import { createDialogue } from '../core/dialogue.js';
import ch1 from '../chapters/ch1/script.js';
import ch2 from '../chapters/ch2/script.js';
import ch3 from '../chapters/ch3/script.js';

test('faces: every character look has robe, hat and face', () => {
  for (const id of ['player', 'soldier', 'archer', 'officer', 'seohui', 'sonn', 'yanggyu', 'gangamchan', 'villager', 'khitan']) {
    const l = LOOKS[id];
    ok(l && typeof l.robe === 'number' && l.face, id);
  }
});

test('faces: every speaking person in chapters 1-3 has a known look', () => {
  for (const s of [ch1, ch2, ch3]) {
    for (const [id, sp] of Object.entries(s.speakers)) {
      if (id === 'guide') continue;
      ok(sp.look && LOOKS[sp.look], `${id} → ${sp.look}`);
    }
  }
});

test('faces: portraits are images and differ between characters', () => {
  const a = portraitURL('seohui'), b = portraitURL('sonn');
  ok(a.startsWith('data:image/png'), 'png data url');
  ok(a !== b, 'different faces');
  eq(portraitURL('seohui'), a, 'cached');
});

test('faces: a person gets a drawn face on a round head', () => {
  const p = makePerson(LOOKS.seohui);
  const face = p.getObjectByName('face');
  ok(face && face.material.map, 'face mesh with texture');
  ok(p.getObjectByName('head').geometry.type === 'SphereGeometry', 'round head');
  eq(faceTexture(LOOKS.seohui.face), faceTexture(LOOKS.seohui.face), 'texture cached');
});

test('faces: dialogue shows the speaker face, and the narrator keeps its mark', async () => {
  const root = document.createElement('div'); document.body.appendChild(root);
  const d = createDialogue(root, ch1.speakers, { typeMs: 0 });
  d.say({ who: 'seohui', text: '가' });
  const pic = root.querySelector('.dlg-portrait');
  ok(pic.style.backgroundImage.includes('data:image/png'), 'face image');
  eq(pic.textContent, '');
  d.advance();
  d.say({ who: 'narr', text: '나' });
  eq(pic.textContent, '史');
  eq(pic.style.backgroundImage, '');
  d.dispose(); root.remove();
});

test('faces: heads are drawn larger, cartoon style', () => {
  const p = makePerson(LOOKS.soldier);
  const hg = p.getObjectByName('headGroup');
  ok(hg && hg.scale.x >= 1.25, 'head group scaled up');
  ok(hg.getObjectByName('face'), 'face inside the head group');
});

test('faces: every character looks solemn (no smile, no open mouth, no smiling eyes, no blush)', () => {
  for (const [id, l] of Object.entries(LOOKS)) {
    eq(l.face.mouth, 'flat', `${id} mouth`);
    eq(l.face.eyes, 'stern', `${id} eyes`);
    eq(l.face.brows, 'stern', `${id} brows`);
    ok(!l.face.blush, `${id} no blush`);
  }
});
