import { test, eq, ok } from './harness.js';
import { createSpeech, speechText } from '../core/speech.js';
import { createDialogue } from '../core/dialogue.js';
import { sleep } from './bot.js';

// 브라우저 음성 대신 쓰는 가짜: 무엇을 읽었는지 기록한다
function fakeSynth() {
  const log = [];
  class Utter { constructor(text) { this.text = text; } }
  return { log, Utter, synth: { speak: u => log.push(['speak', u.text, u.lang]), cancel: () => log.push(['cancel']), getVoices: () => [] } };
}

test('speech: reading text drops hanja in brackets and ○ × marks', () => {
  eq(speechText('대장경(大藏經) 세 글자를 새겨 보자.'), '대장경 세 글자를 새겨 보자.');
  eq(speechText('○ 맞았어요! 잘했어요.'), '맞았어요! 잘했어요.');
  eq(speechText('× 아쉬워요. 정답은 "강동 6주"이에요.'), '아쉬워요. 정답은 "강동 6주"이에요.');
  eq(speechText('강감찬(948~1031)'), '강감찬(948~1031)', 'numbers in brackets stay');
});

test('speech: speaks Korean only when turned on, and stop cancels', () => {
  const f = fakeSynth();
  const sp = createSpeech({ synth: f.synth, Utter: f.Utter });
  ok(sp.available);
  sp.speak('안녕');
  eq(f.log, [], 'off by default');
  sp.setEnabled(true);
  sp.speak('대장경(大藏經)');
  eq(f.log, [['cancel'], ['speak', '대장경', 'ko-KR']]);
  sp.stop();
  eq(f.log[f.log.length - 1], ['cancel']);
});

test('speech: unavailable without a speech engine', () => {
  const sp = createSpeech({ synth: null, Utter: null });
  eq(sp.available, false);
  sp.setEnabled(true); sp.speak('x'); sp.stop(); // 아무 일도 없어야 한다
});

test('dialogue: 🔊 button turns reading on, reads the current line and does not advance', async () => {
  const f = fakeSynth();
  const sp = createSpeech({ synth: f.synth, Utter: f.Utter });
  const toggles = [];
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const d = createDialogue(ui, { guide: { name: '안내', mark: '◎', color: '#000' } }, { typeMs: 0, speech: sp, onSpeechToggle: on => toggles.push(on) });
  try {
    let done = false;
    d.say({ who: 'guide', text: '첫 대사' }).then(() => { done = true; });
    eq(f.log.filter(e => e[0] === 'speak'), [], 'silent while off');
    const btn = ui.querySelector('.dlg-voice');
    ok(btn && !btn.hidden, 'button shown');
    eq(btn.getAttribute('aria-pressed'), 'false');
    btn.click();
    await sleep(10);
    eq(done, false, 'button click does not advance');
    eq(btn.getAttribute('aria-pressed'), 'true');
    eq(toggles, [true]);
    eq(f.log.filter(e => e[0] === 'speak').map(e => e[1]), ['첫 대사']);
    d.advance(); await sleep(0);
    d.say({ who: 'guide', text: '둘째 대사' });
    eq(f.log.filter(e => e[0] === 'speak').map(e => e[1]), ['첫 대사', '둘째 대사']);
    d.advance(); await sleep(0);
    d.choose({ who: 'guide', text: '어디로 갈까?' }, ['강화도', '개경']);
    eq(f.log.filter(e => e[0] === 'speak').pop()[1], '어디로 갈까? 1번, 강화도. 2번, 개경.');
    btn.click();
    eq(toggles, [true, false]);
    eq(f.log[f.log.length - 1], ['cancel'], 'turning off stops reading');
  } finally { d.dispose(); ui.remove(); }
});

test('dialogue: no 🔊 button when the device cannot speak', () => {
  const ui = document.createElement('div'); document.body.appendChild(ui);
  const d = createDialogue(ui, {}, { typeMs: 0, speech: createSpeech({ synth: null, Utter: null }) });
  const btn = ui.querySelector('.dlg-voice');
  ok(!btn || btn.hidden, 'hidden');
  d.dispose(); ui.remove();
});
