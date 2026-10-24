// 글자 만들기 그림(SVG): 소리를 낼 때의 입·혀·이·목구멍 모양, 획 더하기, 하늘·땅·사람, 낱말 그림.
// 그림 안에는 답 글자를 넣지 않는다(고르는 카드가 따로 있다). viewBox 160×110.
const wrap = body => `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body.replace(/>\s+</g, '><').trim()}</svg>`;
const HL = '#c0392b'; // 강조(본뜬 곳)

// 옆에서 본 입안(얼굴은 왼쪽): 입천장·이·입술·목구멍. tongue: 혀 모양 path, mark: 강조 표시
const side = (tongue, mark = '') => wrap(`
  <rect width="160" height="110" rx="6" fill="#f7efe0"/>
  <path d="M30 20 Q24 30 28 40 L20 48 Q24 52 30 52 Q22 58 30 64 Q24 72 32 80 Q40 96 70 98 L118 98 L124 108" fill="none" stroke="#8a6a48" stroke-width="2.5"/>
  <path d="M34 50 C60 30 110 28 136 40 L146 52 L146 108" fill="none" stroke="#6b4a32" stroke-width="3"/>
  <path d="M38 76 C60 88 104 88 126 80 L132 108" fill="none" stroke="#6b4a32" stroke-width="3"/>
  <rect x="34" y="50" width="8" height="9" fill="#fff" stroke="#8a8a88"/><rect x="34" y="68" width="8" height="9" fill="#fff" stroke="#8a8a88"/>
  <ellipse cx="29" cy="56" rx="6" ry="4" fill="#d98a7a"/><ellipse cx="29" cy="71" rx="6" ry="4" fill="#d98a7a"/>
  <path d="${tongue}" fill="#e8a19a" stroke="#b5645c" stroke-width="2"/>
  ${mark}`);

export const SHAPES = {
  // ㄱ: 혀뿌리가 목구멍을 막는 모양
  root: side('M44 76 C62 72 92 58 112 44 C124 36 136 38 140 46 C140 60 130 74 120 82 C100 86 70 84 44 80 Z',
    `<circle cx="132" cy="44" r="11" fill="none" stroke="${HL}" stroke-width="3" stroke-dasharray="4 3"/>`),
  // ㄴ: 혀끝이 윗잇몸에 닿는 모양
  tongue: side('M44 60 C46 54 54 54 58 60 C74 70 104 72 126 72 C132 76 130 82 120 84 C96 88 66 86 46 80 Z',
    `<circle cx="47" cy="56" r="9" fill="none" stroke="${HL}" stroke-width="3" stroke-dasharray="4 3"/>`),
  // ㅁ: 앞에서 본 입 모양(네모나게 다문 입)
  mouth: wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/>
    <ellipse cx="80" cy="56" rx="46" ry="50" fill="#f0c9a2" stroke="#8a6a48" stroke-width="2"/>
    <circle cx="62" cy="40" r="4" fill="#3a2c20"/><circle cx="98" cy="40" r="4" fill="#3a2c20"/>
    <rect x="62" y="66" width="36" height="22" rx="3" fill="#b5645c" stroke="${HL}" stroke-width="3"/>`),
  // ㅅ: 이 모양(뾰족하게 선 앞니)
  teeth: wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/>
    <path d="M20 34 Q80 14 140 34 L140 48 Q80 36 20 48 Z" fill="#d98a7a"/>
    <path d="M36 44 L52 40 L52 70 Q44 76 36 70 Z M108 40 L124 44 L124 70 Q116 76 108 70 Z" fill="#fff" stroke="#8a8a88" stroke-width="2"/>
    <path d="M58 92 L80 38 L102 92 Z" fill="#fff" stroke="${HL}" stroke-width="3"/>`),
  // ㅇ: 목구멍 모양(동그랗게 뚫린 목)
  throat: wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/>
    <path d="M48 6 L48 104 M112 6 L112 104" stroke="#8a6a48" stroke-width="3"/>
    <rect x="48" y="6" width="64" height="98" fill="#f0c9a2"/>
    <circle cx="80" cy="56" r="22" fill="#7a3a34" stroke="${HL}" stroke-width="3"/>`),
};

// 획 더하기: 글자 + 빨간 획 = ?
const glyph = (t, x) => `<text x="${x}" y="72" font-size="54" font-family="Nanum Myeongjo, Batang, serif" font-weight="700" text-anchor="middle" fill="#231c14">${t}</text>`;
export const plusStroke = base => wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/>
  ${glyph(base, 34)}<text x="68" y="68" font-size="30" text-anchor="middle" fill="#6b4a32">+</text>
  <rect x="80" y="50" width="26" height="7" fill="${HL}"/><text x="118" y="68" font-size="30" text-anchor="middle" fill="#6b4a32">=</text>
  <text x="144" y="72" font-size="46" text-anchor="middle" fill="${HL}" font-weight="700">?</text>`);

// 모음: 하늘(둥글다)·땅(평평하다)·사람(서 있다)
export const NATURE = {
  sky: wrap(`<rect width="160" height="110" rx="6" fill="#bcd8ee"/><circle cx="80" cy="50" r="24" fill="#f2c94c" stroke="${HL}" stroke-width="3"/>`),
  earth: wrap(`<rect width="160" height="110" rx="6" fill="#d8ecf4"/><rect x="0" y="62" width="160" height="48" fill="#8a7a52"/><line x1="10" y1="62" x2="150" y2="62" stroke="${HL}" stroke-width="4"/>`),
  person: wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/><rect x="0" y="92" width="160" height="18" fill="#a8b88a"/>
    <circle cx="80" cy="24" r="10" fill="#f0c9a2" stroke="#8a6a48" stroke-width="2"/><path d="M80 34 L80 76 M80 46 L66 60 M80 46 L94 60 M80 76 L70 92 M80 76 L90 92" stroke="#3a4a5a" stroke-width="5" stroke-linecap="round"/>
    <line x1="80" y1="12" x2="80" y2="96" stroke="${HL}" stroke-width="2" stroke-dasharray="4 3"/>`),
};

// 낱말: 나무 그림, 한글 낱자
export const TREE = wrap(`<rect width="160" height="110" rx="6" fill="#e8f2dc"/><rect x="72" y="58" width="16" height="40" fill="#6b4a32"/>
  <circle cx="80" cy="42" r="26" fill="#4f7344"/><circle cx="60" cy="54" r="16" fill="#5f8a50"/><circle cx="100" cy="54" r="16" fill="#5f8a50"/>`);
export const LETTERS = list => wrap(`<rect width="160" height="110" rx="6" fill="#f7efe0"/>${list.map((t, i) => `<rect x="${8 + i * 25}" y="34" width="22" height="34" rx="3" fill="#fffaf0" stroke="#6b4a32"/><text x="${19 + i * 25}" y="60" font-size="20" text-anchor="middle" fill="#231c14" font-family="Nanum Myeongjo, Batang, serif">${t}</text>`).join('')}`);
