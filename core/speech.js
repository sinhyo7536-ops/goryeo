// 대사 읽어 주기: 기기에 들어 있는 한국어 음성(브라우저 speechSynthesis)으로 읽는다. 인터넷이나 추가 파일은 쓰지 않는다.

// 소리 내어 읽을 문장: 괄호 속 한자(예: 대장경(大藏經))와 ○ × 표시는 읽지 않는다.
export function speechText(text) {
  return text
    .replace(/\s*\([^)]*[㐀-鿿][^)]*\)/g, '')
    .replace(/^[○×]\s*/, '')
    .trim();
}

export function createSpeech({ synth = globalThis.speechSynthesis, Utter = globalThis.SpeechSynthesisUtterance } = {}) {
  const available = !!(synth && Utter);
  let enabled = false;
  const koVoice = () => {
    try { return (synth.getVoices() || []).find(v => /^ko/i.test(v.lang)) || null; } catch { return null; }
  };
  return {
    available,
    get enabled() { return enabled; },
    setEnabled(on) { enabled = !!on; if (!enabled) this.stop(); },
    speak(text) {
      if (!available || !enabled) return;
      try {
        synth.cancel(); // 앞 대사를 끊고 새 대사를 읽는다
        const u = new Utter(speechText(text));
        u.lang = 'ko-KR'; u.rate = 0.95;
        const v = koVoice(); if (v) u.voice = v;
        synth.speak(u);
      } catch { /* 음성을 못 내는 기기에서는 조용히 넘어간다 */ }
    },
    stop() { if (available) try { synth.cancel(); } catch { /* 무시 */ } },
  };
}
