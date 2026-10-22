import { test, ok } from './harness.js';
import { createDialogue } from '../core/dialogue.js';

// 대사 읽어 주기는 뺐다 (2026-10-22): 대화창에 읽어 주기 버튼이 없고, 음성 모듈도 없다
test('no read-aloud: the dialogue box has no voice button', () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const d = createDialogue(ui, {}, { typeMs: 0 });
  d.say({ who: 'narr', text: '대사' });
  ok(!ui.querySelector('.dlg-voice'), 'no voice button');
  ok(!ui.textContent.includes('읽어 주기'), 'no read-aloud text');
  d.dispose(); ui.remove();
});

test('no read-aloud: speech module is gone', async () => {
  const r = await fetch('../core/speech.js', { cache: 'no-store' });
  ok(r.status === 404, `core/speech.js status ${r.status}`);
});
