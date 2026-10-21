# 고려를 지켜라 — 기반과 1장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공통 게임 기반(렌더링·입력·대화·저장·화면 흐름·화질 조절)과 1장 「서희의 외교 담판」을 완성해, 태블릿과 크롬북에서 처음부터 결과 카드까지 플레이할 수 있는 정적 웹 게임을 만든다.

**Architecture:** 빌드 도구 없는 ES 모듈 정적 사이트. `core/`가 장(chapter) 모듈 인터페이스를 정의하고 흐름을 돌리며, `chapters/ch1/`은 3D 장면·대사 데이터·미니게임만 가진다. 모든 대사·퀴즈 문장은 데이터로 두고 출처 번호를 달아 자동 검사한다.

**Tech Stack:** Three.js r160 (`vendor/three.module.min.js`, import map), 순수 JavaScript ES 모듈, Web Audio, localStorage, Service Worker. 테스트: 브라우저용 자체 하네스 + PowerShell 정적 서버 + Edge 헤드리스 `--dump-dom`.

**Spec:** `docs/superpowers/specs/2026-10-21-goryeo-game-design.md`

**다음 계획(이번 범위 밖):** 2~6장, 2차시 결과 카드 내용, 마무리 연표, 호스팅.

## Global Constraints

- 대상: 초등 5학년. 모든 화면 글은 한국어 존댓말 해설체("~했어요"), 본문 글자 16~18px 이상.
- 서희를 '장군'이라 부르지 않는다. '사귀다' 대신 '친하게 지내다'를 쓴다.
- 모든 사실 문장은 `content/sources.js`의 출처 번호(S1~S21)를 가진다. 출처 없는 사실 문장 금지.
- 1장 담판 정답 선택지 문구는 정확히 "고려는 고구려를 이은 나라이다." 와 "여진이 길을 막고 있어서 거란과 교류를 할 수 없다."
- 로그인·서버 전송 없음. 저장은 localStorage만, 실패해도 게임 진행.
- 키보드 없이 터치만으로 모든 흐름 완료 가능. 버튼 높이 48px 이상.
- 배경음 기본 꺼짐, 효과음 작게(기본 볼륨 0.3).
- 성능: S6 Lite '보통' 30fps 이상, 첫 로딩 3MB 이하. 화질 3단계 low/medium/high, 해상도 배율 0.75/1/1.5, 처음 3초 측정 평균 40fps 미만이면 한 단계 낮춤.
- 가로 화면 기본, 세로면 "가로로 돌려 주세요" 안내.
- 외부 네트워크 의존 없음(폰트 포함). 폰트는 시스템 한글 글꼴 스택: `'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif`, 제목은 `'Nanum Myeongjo','Batang',serif`.

## Review Focus

1. **저장소가 막힌 기기(시크릿 창, localStorage 접근 시 예외)** → 게임은 끝까지 진행되고 "이 기기에서는 저장되지 않아요"가 뜬다. (Task 2 테스트 `save: storage that throws`)
2. **대사가 타이핑 중일 때 연속 탭** → 첫 탭은 글자만 다 보여 주고, 다음 탭이 넘긴다. 탭이 선택지 버튼까지 눌러 버리지 않는다. (Task 4 테스트 `dialogue: fast double tap does not pick a choice`)
3. **장 중간에 새로고침 후 이어하기** → 그 장의 마지막 단계 시작점부터 다시 하고, 점수가 두 번 더해지지 않는다. (Task 7 테스트 `flow: resume from checkpoint does not double count`)
4. **앞 반 학생 기록이 남은 공용 태블릿** → 첫 화면에 저장된 이름이 보이고, '새로 시작'은 게임 안 확인 단계를 거친다. (Task 6 테스트 `title: shows saved name and confirms reset`)
5. **키보드 없는 터치 기기** → 조이스틱·대화 버튼·대화창 탭·선택지 탭만으로 1장을 끝낼 수 있다. (Task 9 테스트 `ch1: completes with touch-only actions`)

---

## File Structure

```
goryeo-game/
  index.html               앱 셸, import map, 화면 루트, 세로 안내
  styles.css               토큰, 대화창, HUD, 화면들
  sw.js                    오프라인 캐시
  vendor/three.module.min.js
  core/
    storage.js             안전한 localStorage 래퍼
    save.js                진행 저장 스키마, 별점 계산
    content.js             대사 데이터 검사기
    dialogue.js            대화창 say/choose/ask
    input.js               키보드 + 터치 조이스틱 + 행동 버튼
    quality.js             화질 단계, 자동 하향
    audio.js               합성 효과음, 음소거
    world.js               렌더러, 분위기 프리셋, 카메라, 플레이어, NPC, 충돌
    people.js              로우폴리 인물 생성, 걷기 애니메이션
    screens.js             첫 화면, 이름, 장 지도, 해설 카드, 장 결과, 차시 결과, 메뉴
    flow.js                앱 상태 기계, 장 실행, 체크포인트
    main.js                부트스트랩
  chapters/
    index.js               장 목록 메타데이터(1~6, 1장만 구현)
    ch1/script.js          1장 대사·퀴즈 데이터
    ch1/scene.js           고려 진영, 강, 거란 진영, 노을
    ch1/chapter.js         탐험 흐름, 담판 미니게임, 퀴즈 연결
  content/
    sources.js             출처 S1~S21 (번호, 제목, URL)
    sources.md             선생님 대조용 표 (sources.js와 1장 대사로 생성)
  tests/
    index.html, harness.js, *.test.js
  tools/
    serve.ps1              정적 서버 (http://localhost:8123)
    test.ps1               서버 띄우고 Edge 헤드리스로 테스트 실행
    gen-sources.ps1        content/sources.md 생성
```

---

### Task 1: 프로젝트 골격, 테스트 하네스, Three.js

**Files:**
- Create: `index.html`, `styles.css`, `core/main.js`, `vendor/three.module.min.js`, `tests/index.html`, `tests/harness.js`, `tests/smoke.test.js`, `tools/serve.ps1`, `tools/test.ps1`, `.gitignore`

**Interfaces:**
- Produces: `tests/harness.js` → `test(name: string, fn: () => void|Promise<void>)`, `eq(a, b, msg?)`, `ok(v, msg?)`, `run(): Promise<{pass:number, fail:number}>`. `tests/index.html`이 모든 `*.test.js`를 import하고 `<pre id="out">`에 `PASS name` / `FAIL name: message` 줄과 마지막 줄 `RESULT pass=N fail=M`을 쓴다.
- Produces: `tools/test.ps1` → 종료 코드 0(모두 통과) / 1(실패), 출력에 `RESULT` 줄.

- [ ] **Step 1: Three.js 받기**

Run: `curl -sSL -o vendor/three.module.min.js https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js`
Expected: 파일 크기 약 650KB, 첫 줄에 `REVISION="160"` 포함 (`grep -c 'REVISION="160"' vendor/three.module.min.js` → 1).

- [ ] **Step 2: `tools/serve.ps1` 작성** — `System.Net.HttpListener`로 프로젝트 루트를 `http://localhost:8123/`에 서빙. MIME: `.html text/html; charset=utf-8`, `.js text/javascript; charset=utf-8`, `.css text/css`, `.json application/json`, `.md text/markdown; charset=utf-8`, `.png image/png`. 디렉터리 요청은 `index.html`. 경로가 루트 밖이면 403.

- [ ] **Step 3: 하네스와 스모크 테스트 작성**

```js
// tests/smoke.test.js
import { test, eq } from './harness.js';
import * as THREE from 'three';
test('smoke: three loads r160', () => eq(THREE.REVISION, '160'));
```
`tests/index.html`은 `index.html`과 같은 import map(`"three": "../vendor/three.module.min.js"`)을 쓴다.

- [ ] **Step 4: `tools/test.ps1` 작성** — serve.ps1을 백그라운드 Job으로 시작 → Edge(`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`)를 `--headless=new --disable-gpu --virtual-time-budget=20000 --dump-dom http://localhost:8123/tests/` 로 실행 → `<pre id="out">` 내용 출력 → `RESULT pass=N fail=0`이면 exit 0 → Job 정지.

- [ ] **Step 5: 실행**

Run: `powershell -ExecutionPolicy Bypass -File tools/test.ps1`
Expected: `PASS smoke: three loads r160`, `RESULT pass=1 fail=0`

- [ ] **Step 6: `index.html` 셸** — import map, `<div id="stage">`, `<div id="ui">`, `<div id="rotate" hidden>가로로 돌려 주세요</div>`, `<script type="module" src="core/main.js">`. `main.js`는 지금은 `document.title` 확인용 빈 부트스트랩. `styles.css`에 Global Constraints의 글꼴 스택과 색 토큰(먹 `#1b1f1d`, 한지 `#f2ead9`, 단청 빨강 `#b8452f`, 단청 초록 `#2f6b5e`, 금 `#d9a441`).

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: 프로젝트 골격과 테스트 하네스"`

---

### Task 2: 안전한 저장과 별점

**Files:**
- Create: `core/storage.js`, `core/save.js`, `tests/save.test.js`

**Interfaces:**
- Produces: `createStorage(backend = globalThis.localStorage) → { available: boolean, get(key): any|null, set(key, value): boolean, remove(key): void }` (JSON 직렬화, 모든 예외를 삼킴).
- Produces: `createSave(storage) → { data, load(), reset(), setName(name), startChapter(id), checkpoint(id, stage), finishChapter(id, result), chapterResult(id) }`
  - 키: `goryeo-game:v1`
  - `data = { name: string, chapters: { [id]: { stars, quizCorrect, quizTotal, firstTryCorrect, firstTryTotal, easyModeUsed, seconds, wrongQuizzes: number[] } }, current: { id, stage } | null }`
  - `stage ∈ 'intro' | 'explore' | 'minigame' | 'quiz'`
- Produces: `computeStars({ quizCorrect, easyModeUsed }) → 1|2|3` (spec: 3 = 퀴즈 2개 정답이고 쉬운 모드 안 씀, 2 = 퀴즈 1개 이상, 1 = 완료).

- [ ] **Step 1: 실패하는 테스트**

```js
test('stars: 3 needs both quizzes and no easy mode', () => {
  eq(computeStars({ quizCorrect: 2, easyModeUsed: false }), 3);
  eq(computeStars({ quizCorrect: 2, easyModeUsed: true }), 2);
  eq(computeStars({ quizCorrect: 1, easyModeUsed: false }), 2);
  eq(computeStars({ quizCorrect: 0, easyModeUsed: false }), 1);
});
test('save: round trip name, checkpoint, result', () => { /* memory backend; setName('5-3 12번'); checkpoint('ch1','minigame'); 새 createSave로 load → name, current 동일 */ });
test('save: storage that throws', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const s = createStorage(bad);
  eq(s.available, false); eq(s.set('k', 1), false); eq(s.get('k'), null);
  const save = createSave(s); save.setName('김고려'); eq(save.data.name, '김고려'); // 메모리에는 유지
});
test('save: finishing a chapter twice keeps the later result only', () => { /* finishChapter 두 번 → chapters.ch1 하나, 마지막 값 */ });
test('save: reset clears name, chapters, current', () => {});
```

- [ ] **Step 2: 실행 → FAIL (모듈 없음)**
- [ ] **Step 3: 구현** — `storage.available`은 `set('__probe', 1)` 성공 여부로 결정. `finishChapter`는 `current`를 null로 만든다.
- [ ] **Step 4: 실행 → 전부 PASS**
- [ ] **Step 5: Commit** — `feat: 저장과 별점`

---

### Task 3: 출처와 대사 데이터 검사기

**Files:**
- Create: `content/sources.js`, `core/content.js`, `tests/content.test.js`, `tools/gen-sources.ps1`, `content/sources.md`

**Interfaces:**
- Produces: `SOURCES: { [id: 'S1'..'S21']: { title: string, url: string, note: string } }` — 값은 spec 7장 표 그대로.
- Produces: 대사 데이터 형식(모든 장 `script.js`가 따름):
  - 줄: `{ who: SpeakerId, text: string, src?: string[] }` — `who === 'narr'`(해설)이면 `src` 필수.
  - 선택: `{ kind: 'choice', who, prompt, src?, options: [{ text, correct: boolean, reply: Line | null, hint: string | null }] }` — 정답 1개.
  - 퀴즈: `{ kind: 'quiz', question, options: string[3], answer: 0|1|2, explain: string, src: string[] }`
- Produces: `validateScript(script, sources) → string[]` (오류 메시지 배열, 비면 통과). 검사: 해설·퀴즈의 `src` 존재, 모든 `src` id가 `SOURCES`에 있음, 금지 표현 `/서희\s*장군/`, `/사귀/` 없음, choice 정답 정확히 1개, quiz `answer`가 options 범위 안.

- [ ] **Step 1: 실패하는 테스트**

```js
test('content: narration without src is rejected', () => {
  const errs = validateScript({ intro: [{ who: 'narr', text: '993년' }] }, SOURCES);
  ok(errs.some(e => e.includes('src')));
});
test('content: forbidden wording is rejected', () => {
  ok(validateScript({ a: [{ who: 'seohui', text: '서희 장군이 왔다' }] }, SOURCES).length > 0);
  ok(validateScript({ a: [{ who: 'sonn', text: '왜 거란과 사귀지 않느냐' }] }, SOURCES).length > 0);
});
test('content: unknown source id is rejected', () => {});
test('content: choice must have exactly one correct option', () => {});
```

- [ ] **Step 2: 실행 → FAIL**
- [ ] **Step 3: 구현** — `script`의 모든 배열 값을 재귀로 돈다.
- [ ] **Step 4: 실행 → PASS**
- [ ] **Step 5: `tools/gen-sources.ps1`** — `content/sources.js`의 객체 리터럴을 정규식으로 읽어 spec 7장과 같은 표를 `content/sources.md`에 쓴다(1장 대사 대조표는 Task 9에서 추가). 실행 후 `content/sources.md`에 `| S21 |` 줄이 있는지 확인.
- [ ] **Step 6: Commit** — `feat: 출처 목록과 대사 검사기`

---

### Task 4: 대화창

**Files:**
- Create: `core/dialogue.js`, `tests/dialogue.test.js`; Modify: `styles.css`

**Interfaces:**
- Consumes: 대사 데이터 형식(Task 3).
- Produces: `createDialogue(root: HTMLElement, speakers: { [id]: { name, mark, color } }, { typeMs = 26, reduceMotion }) → { say(line): Promise<void>, choose(prompt: Line, options: string[]): Promise<number>, ask(choice): Promise<{ firstTry: boolean }>, quiz(q): Promise<{ correct: boolean }>, advance(): void, pick(i): void, close(): void, isOpen(): boolean }`
  - `ask`: 오답이면 `hint`를 해설로 보여 주고 다시 고르게 함. 정답이면 `reply` 출력 후 끝. `firstTry`는 첫 선택이 정답인지.
  - `quiz`: 정답/오답 표시(○/× 기호), `explain` 출력.
- 공통 화자: `narr`(해설, 史, `#5a5248`)는 dialogue.js 기본값으로 포함.

- [ ] **Step 1: 실패하는 테스트**

```js
test('dialogue: first advance completes typing, second resolves', async () => { /* say → advance → text 완전, 아직 미해결 → advance → resolve */ });
test('dialogue: digit key picks choice', async () => {});
test('dialogue: fast double tap does not pick a choice', async () => {
  // say(...) 진행 중 대화창 click 두 번 → 그 다음 choose가 열린 직후 250ms 안의 click은 무시되어 선택이 일어나지 않음
});
test('dialogue: ask retries after wrong answer and reports firstTry=false', async () => {});
test('dialogue: quiz marks correct with ○ and wrong with ×', async () => {});
```

- [ ] **Step 2: 실행 → FAIL**
- [ ] **Step 3: 구현** — 선택지가 열린 뒤 250ms 동안 클릭 무시(입력 가드). 한지 패널 스타일, 선택지 버튼 `min-height: 48px`.
- [ ] **Step 4: 실행 → PASS**
- [ ] **Step 5: Commit** — `feat: 대화창`

---

### Task 5: 입력, 화질, 효과음

**Files:**
- Create: `core/input.js`, `core/quality.js`, `core/audio.js`, `tests/input.test.js`, `tests/quality.test.js`

**Interfaces:**
- Produces: `createInput({ target = window, joyZone: HTMLElement, actionButton: HTMLElement }) → { move(): { x, z } (길이 ≤ 1), onAction(fn), onMenu(fn), enabled: boolean, dispose() }` — 키: WASD/방향키 이동, E/Space/Enter 행동, Esc 메뉴, 1~3은 대화창이 처리. 조이스틱 반지름 48px, 데드존 0.12.
- Produces: `QUALITY = { low: { pixelRatio: 0.75, shadows: 'off', particles: 0.3, water: 'flat' }, medium: { pixelRatio: 1, shadows: 'on', particles: 0.6, water: 'waves' }, high: { pixelRatio: 1.5, shadows: 'soft', particles: 1, water: 'waves' } }`
- Produces: `createQualityController({ initial, onChange }) → { level, sample(dtSeconds), set(level) }` — 처음 3초 누적 평균 fps < 40이면 한 단계 낮추고 다시 3초 측정, `low`에서 멈춤. `set()`으로 바꾸면 자동 하향 중지.
- Produces: `guessInitialQuality({ dpr, cores, memory }) → 'low'|'medium'|'high'` — memory ≤ 4 또는 cores ≤ 4 → `medium`, dpr ≥ 2이면서 memory ≥ 8 → `high`, 그 외 `medium`. (S6 Lite: 4GB → medium)
- Produces: `createAudio() → { play(name: 'tap'|'correct'|'wrong'|'whoosh'|'water'), muted, setMuted(b), volume }` — 기본 volume 0.3, 첫 사용자 입력 후 AudioContext 생성.

- [ ] **Step 1: 실패하는 테스트**

```js
test('input: diagonal keys are normalized', () => { /* KeyW+KeyD keydown 이벤트 → move() 길이 ≈ 1 */ });
test('input: disabled input returns zero', () => {});
test('quality: drops one level after 3s under 40fps', () => {
  const q = createQualityController({ initial: 'medium' });
  for (let i = 0; i < 100; i++) q.sample(1 / 30); // 3.3초
  eq(q.level, 'low');
});
test('quality: stays when fps is fine', () => {});
test('quality: manual set stops auto changes', () => {});
test('quality: S6 Lite guess is medium', () => eq(guessInitialQuality({ dpr: 2, cores: 8, memory: 4 }), 'medium'));
```

- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** — **Step 4: 실행 → PASS**
- [ ] **Step 5: Commit** — `feat: 입력, 화질 자동 조절, 효과음`

---

### Task 6: 3D 월드와 인물

**Files:**
- Create: `core/world.js`, `core/people.js`, `tests/world.test.js`

**Interfaces:**
- Consumes: `QUALITY`(Task 5), `three`.
- Produces: `MOODS` — 분위기 프리셋 `{ sunset, snow, storm, overcast, morning, sea }`, 각 `{ skyTop, skyHorizon, skyBottom, fog: [color, near, far], sun: { color, intensity, dir: [x,y,z] }, hemi: [sky, ground, intensity], particles: null|'snow'|'rain'|'embers' }`. 이번 계획은 `sunset`만 실제 값을 채우고 나머지는 다음 계획에서.
- Produces: `createWorld(container, { quality }) → { scene, camera, renderer, setMood(name), setQuality(level), addCollider({ x, z, r }), clearLevel(), player, npcs: Map, addNpc(id, opts, x, z, faceY), nearestNpc(maxDist): Npc|null, step(dt, move: {x,z}), camMode: 'follow'|'fixed', setFixedCamera(pos, target), setGoal(target: {x, z} | null), groundHeight(x, z) (기본 0), render() }`
  - `setGoal`: 플레이어 발밑에 목표 방향을 가리키는 빛나는 화살표를 띄움(목표까지 3 이내면 숨김), `null`이면 끔. 장의 `ctx.setGoal(text)`(HUD 글)과 별개로 장 코드가 함께 호출한다.
  - 하늘: 큰 구체에 세 색 그라데이션 셰이더(`skyTop/Horizon/Bottom`), 안개 `THREE.Fog`.
  - 플레이어 속도 6.5, 충돌 반지름 0.4, 카메라 오프셋 `(0, 12, 13)`, 화면 비 < 1이면 ×1.45, 따라가기 보간 `1 - exp(-dt*4)`.
- Produces: `makePerson({ robe, hat: 'official'|'helmet'|'fur', trim }) → THREE.Group` (`userData.legs/arms`), `animateWalk(person, moving, dt)`, `markerSprite(text)` (노란 느낌표).

- [ ] **Step 1: 실패하는 테스트**

```js
test('world: player is pushed out of a collider', () => { /* addCollider({x:0,z:-2,r:1}); player (0,0,0); step(0.5,{x:0,z:-1}) → 거리 ≥ 1.4 */ });
test('world: nearestNpc respects distance', () => {});
test('world: setQuality changes pixel ratio', () => {});
test('world: builds sunset mood without throwing', () => {});
```
(테스트용 `container`는 숨긴 div, 렌더러는 Edge 헤드리스의 WebGL 사용. WebGL 생성 실패 시 world.js가 `Error('WEBGL_UNAVAILABLE')`를 던지고 테스트는 그 경우 SKIP으로 기록.)

- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** (`step` 안에서 물리·카메라만 갱신하고 그리기는 `render()`) — **Step 4: 실행 → PASS**
- [ ] **Step 5: Commit** — `feat: 3D 월드와 인물`

---

### Task 7: 화면들과 흐름

**Files:**
- Create: `core/screens.js`, `core/flow.js`, `chapters/index.js`, `tests/flow.test.js`, `tests/screens.test.js`; Modify: `core/main.js`, `styles.css`, `index.html`

**Interfaces:**
- Consumes: `createSave`, `computeStars`(Task 2), `createDialogue`(Task 4), `createInput`, `createQualityController`, `createAudio`(Task 5), `createWorld`(Task 6).
- Produces: 장 모듈 인터페이스(모든 `chapters/chN/chapter.js`의 default export):
  ```
  { id: 'ch1', no: 1, session: 1, title: '서희의 외교 담판', years: '993', mood: 'sunset',
    script,                                  // Task 3 형식
    buildScene(world): void,
    explore(ctx): Promise<void>,
    minigame(ctx): Promise<{ firstTryCorrect, firstTryTotal, easyModeUsed }>,
    quizzes: Quiz[] }                         // 2개
  ```
  `ctx = { world, dialogue, input, audio, setGoal(text), wait(ms), fade(on): Promise<void> }`
- Produces: `CHAPTERS`(chapters/index.js) — 6개 메타 `{ id, no, session, title, years, place, mapXY: [x%, y%], load: () => import(...) | null }`. 1장만 `load` 있음, 나머지 `null`이면 지도에 "준비 중".
- Produces: `runChapter(meta, ctx, save) → Promise<ChapterResult>` — 단계 순서 intro → explore → minigame → quiz, 각 단계 시작 때 `save.checkpoint(id, stage)`, 끝나면 `computeStars`로 `finishChapter`. `resumeStage`가 주어지면 그 단계부터 시작하고, 이전 단계 점수는 0으로 시작(체크포인트는 단계 시작점이므로 중복 없음).
- Produces: `screens`: `showTitle({ savedName, hasProgress, storageOk }) → Promise<'new'|'continue'|'session2'>`(새로 시작은 게임 안 확인 패널), `askName(prev) → Promise<string>`, `showMap(CHAPTERS, save) → Promise<chapterId>`, `showIntroCard(meta, lines)`, `showChapterResult(result)`, `showSessionCard(session, save, CHAPTERS)`, `showMenu({ muted, quality }) → 변경 이벤트`, 세로 화면 안내 토글.

- [ ] **Step 1: 실패하는 테스트** (가짜 장 모듈 사용: explore/minigame이 즉시 끝나고 quiz 2개)

```js
test('flow: runs stages in order and saves checkpoints', async () => {});
test('flow: resume from checkpoint does not double count', async () => {
  // checkpoint('fake','quiz') 상태에서 resume → minigame 호출 안 됨, finishChapter 1회, quizTotal 2
});
test('flow: chapter result stars use quiz and easy mode', async () => {});
test('title: shows saved name and confirms reset', async () => {
  // savedName '5-3 12번' 표시, '새로 시작' 클릭 → 확인 패널 → '지우기' 클릭 시에만 'new' resolve
});
test('screens: session card lists chapters with stars and wrong quiz answers', () => {});
test('screens: storage warning shown when storage unavailable', () => {});
```

- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** — `main.js`: 저장 로드 → 첫 화면 → 이름 → 지도 → `runChapter` → 장 결과 → 지도. 1차시 3장이 모두 끝나면 1차시 카드(이번 계획은 1장만 있으므로 1장 완료 시 1차시 카드에 1장만 표시). — **Step 4: 실행 → PASS**
- [ ] **Step 5: Commit** — `feat: 화면 흐름과 장 실행`

---

### Task 8: 1장 장면 (노을의 고려 진영)

**Files:**
- Create: `chapters/ch1/scene.js`; Modify: `core/world.js` (sunset 값)

**Interfaces:**
- Consumes: `world.addCollider`, `addNpc`, `makePerson`, `setMood('sunset')`.
- Produces: `buildCh1Scene(world) → { ferry: {x,z,r}, khitanGroup: THREE.Group, gangdongPillars: THREE.Group, negotiationSpot: { seohui:[x,z,ry], sonn:[x,z,ry], player:[x,z,ry], cam: { pos, target } } }`
  - 배치는 1장 미리보기(`scratchpad/goryeo-preview.html`)와 같은 좌표계: 진영 바운드 x ±30.8, z −14.4~24.6, 강 중심 z −19.5 폭 7, 거란 진영 z −30~−53, 나루터 (8, −13.4), 지휘소 (−11, −3).
  - NPC: `soldier`(4, 12.5), `seohui`(−11, 1.3), `archer`(−7, 22.6), `officer`(15.5, 8).
  - 강동 6주 빛기둥 6개와 이름표(흥화진, 용주, 통주, 철주, 귀주, 곽주) — 처음엔 숨김.
  - 노을 조명, 물결 셰이더(quality.water === 'flat'이면 정지 평면), 깃발 흔들림, 모닥불 불티(particles 배율 적용).

- [ ] **Step 1: 장면 스모크 테스트** — `tests/ch1.test.js`에 `ch1: scene builds with 4 npcs and hidden pillars` (npcs.size === 4, gangdongPillars.visible === false).
- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** — **Step 4: 실행 → PASS**
- [ ] **Step 5: 눈으로 확인** — `tools/serve.ps1` 실행 후 Edge로 `http://localhost:8123/?debug=ch1-scene`(main.js가 이 쿼리면 장면만 띄움)를 1400×800, 800×1200 두 크기로 스크린샷(`--screenshot`). 하늘·강·진영·거란 진영이 보이는지 확인.
- [ ] **Step 6: Commit** — `feat: 1장 장면`

---

### Task 9: 1장 대사, 담판 미니게임, 퀴즈

**Files:**
- Create: `chapters/ch1/script.js`, `chapters/ch1/chapter.js`; Modify: `tests/ch1.test.js`, `content/sources.md`(gen 스크립트 확장), `tools/gen-sources.ps1`

**Interfaces:**
- Consumes: 장 모듈 인터페이스(Task 7), `buildCh1Scene`(Task 8), 대사 형식(Task 3).
- Produces: `chapters/ch1/script.js` default export `{ speakers, intro, npc: { soldier, officer, archer, seohui }, negotiation: { opening, q1: Choice, q2: Choice, closing }, retreat, quizzes }` — **문장과 출처는 spec 4장 1장 절 그대로.** 질문 2 문구: "고려는 왜 가까운 거란과 친하게 지내지 않느냐?"
- 탐험 규칙: 목표 순서 병사(!) → 서희(!) → 나루터 빛나는 원. 순서가 아닌 인물은 짧은 안내 대사. 나루터 도착 시 페이드 → `negotiationSpot` 고정 카메라 → 담판 → 페이드 → 진영 복귀, 거란 진영 가라앉으며 사라짐, 강동 6주 빛기둥 표시 → 퀴즈.
- 미니게임 결과: `{ firstTryCorrect: 0~2, firstTryTotal: 2, easyModeUsed: false }` (담판은 쉬운 모드 없음).

- [ ] **Step 1: 실패하는 테스트**

```js
test('ch1: script passes validation', () => eq(validateScript(ch1Script, SOURCES), []));
test('ch1: correct answers use the exact sentences', () => {
  eq(ch1Script.negotiation.q1.options.find(o => o.correct).text, '고려는 고구려를 이은 나라이다.');
  eq(ch1Script.negotiation.q2.options.find(o => o.correct).text, '여진이 길을 막고 있어서 거란과 교류를 할 수 없다.');
});
test('ch1: completes with touch-only actions', async () => {
  // 가짜 input: 이동 벡터를 목표 지점으로 자동 조종, 행동은 actionButton click만, 대화는 대화창 click과 선택지 버튼 click만
  // explore → minigame → quiz 끝까지 진행되고 결과 firstTryTotal === 2
});
test('ch1: wrong first answer gives hint and lowers firstTryCorrect', async () => {});
```

- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** — **Step 4: 실행 → PASS**
- [ ] **Step 5: 대조표 생성** — `gen-sources.ps1`이 `chapters/ch1/script.js`의 각 문장과 `src`를 읽어 `content/sources.md`에 "1장 문장별 출처" 표를 추가. 실행 후 표에 "고려는 고구려를 이은 나라이다." 줄이 S18과 함께 있는지 확인.
- [ ] **Step 6: Commit** — `feat: 1장 담판과 퀴즈`

---

### Task 10: 오프라인 캐시, 전체 점검, 미리보기 배포

**Files:**
- Create: `sw.js`, `tests/sw.test.js`; Modify: `core/main.js`

**Interfaces:**
- Produces: `sw.js` — 캐시 이름 `goryeo-v1`, 설치 때 `PRECACHE` 목록(index.html, styles.css, core/*.js, chapters/index.js, chapters/ch1/*.js, vendor/three.module.min.js, content/sources.js) 저장, 같은 출처 GET은 cache-first 후 네트워크로 갱신. `main.js`는 `navigator.serviceWorker`가 있고 `location.protocol`이 http(s)일 때만 등록하고, 실패해도 무시.

- [ ] **Step 1: 테스트** — `sw: PRECACHE lists every file main.js imports for ch1` (sw.js에서 export한 목록 문자열 배열과, 파일 존재를 `fetch(path).ok`로 확인).
- [ ] **Step 2: 실행 → FAIL** — **Step 3: 구현** — **Step 4: 실행 → PASS**
- [ ] **Step 5: 용량 확인** — Run: `du -ch index.html styles.css sw.js core chapters vendor content/sources.js | tail -1` → 3MB 이하.
- [ ] **Step 6: 전체 테스트** — `tools/test.ps1` → `fail=0`.
- [ ] **Step 7: 수동 점검 (Edge 스크린샷)** — 1400×800에서 첫 화면 → 이름 → 지도 → 1장 해설 카드, 800×1200에서 세로 안내 표시 확인.
- [ ] **Step 8: 미리보기 배포** — Artifact 도구로 `index.html`을 페이지로, 나머지 파일을 `files`로 함께 올려 선생님이 S6 Lite와 크롬북에서 열 수 있는 링크를 만든다(Artifact는 서비스 워커를 지원하지 않으므로 등록 실패를 무시하는 동작이 여기서 확인됨).
- [ ] **Step 9: Commit** — `feat: 오프라인 캐시와 1장 미리보기`
