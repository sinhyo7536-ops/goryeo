# 편 구조(고려편·조선편) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 첫 화면 → 편 고르기(고려편·조선편) → 그 편의 장 지도 → 편별 결과 카드가 되게 하고, 조선편 6장은 "준비 중"으로 보이게 한다.

**Architecture:** 장 목록에 조선편 6장(`j1`~`j6`, `session: 2`, `load: null`)을 더하고, 편 목록 `COURSES`가 장 묶음과 결과 카드 정리(`SESSIONS[1]`, `SESSIONS[2]`)를 가리킨다. 열림·완료 규칙은 같은 `session` 안에서 센다. 저장에 `course`(마지막으로 고른 편)를 더하고, 화면에 편 고르기를 더한다. 고려편 장 id·폴더·저장 기록은 그대로다.

**Tech Stack:** 빌드 없는 ES 모듈, Three.js r160, 자체 테스트 하네스(`tests/harness.js`), 헤드리스 Edge(`tools/test.ps1 -Port 8141`).

**Spec:** `docs/superpowers/specs/2026-10-22-joseon-course-design.md` (2장 구조, 9장 순서 1단계, 10장 이름)

## Global Constraints

- 사이트 전체 이름: **역사 속으로 걸어가기**. 편 카드 이름: 고려편 「고려를 지켜라」, 조선편 「조선을 걷다」.
- 고려편 장 id `ch1`~`ch6`와 폴더, 저장 키 `goryeo-game:v1`은 바꾸지 않는다. 고려편 테스트는 모두 통과해야 한다.
- 조선편 장 id `j1`~`j6`, 폴더 `chapters/joseon/j1`~`j6`(이 계획에서는 만들지 않음, `load: null`).
- 두 편 모두 처음부터 열려 있다. 각 편의 1장은 언제나 열리고, 나머지는 같은 편의 앞 장을 마쳐야 열린다.
- 화면 글은 쉬운 한국어. 뺀 기능(교사용 페이지, QR, 음성)은 넣지 않는다.
- 올릴 때: `core/precache.js` CACHE를 `goryeo-v13`으로, `tests/sw.test.js`도 맞춘다. 커밋 메시지는 한국어.

## Review Focus

1. 옛 저장 기록(`course` 칸 없음, `current`가 ch 장)으로 열면 고려편 장으로 바로 이어하기가 된다.
2. 조선편 지도에서 모든 장이 "준비 중"이고 눌리지 않으며, 결과 카드 버튼이 없다(마친 장이 없으므로).
3. 고려편을 다 마친 학생이 조선편 지도를 열어도 고려편 결과 카드가 다시 뜨지 않는다.
4. 메뉴의 '장 선택으로'는 하던 편의 지도로 돌아간다(편 고르기로 가지 않는다).
5. 저장이 막힌 기기에서도 편 고르기 → 지도가 된다(저장 실패는 무시).

---

### Task 1: 편 목록과 열림 규칙

**Files:**
- Modify: `chapters/index.js`
- Create: `tests/courses.test.js` (그리고 `tests/index.html` 목록에 `'courses'` 추가)
- Modify: `tests/screens.test.js:17-27` (`Object.keys(SESSIONS)`가 `['1','2']`가 됨)

**Interfaces:**
- Produces:
  - `CHAPTERS` — 고려편 6장(지금 그대로).
  - `JOSEON` — 조선편 6장: `{ id:'j1'..'j6', no:1..6, session:2, title, years, event, place, mapXY:[x,y], load:null }`.
  - `ALL_CHAPTERS = [...CHAPTERS, ...JOSEON]`.
  - `SESSIONS[2] = { title: '조선의 건국과 발전', points: [6줄] }` — points는 설계 문서 5장 여섯 줄 그대로.
  - `COURSES = [{ id:'goryeo', session:1, title:'고려를 지켜라', era:'고려', eyebrow:'외세의 침입과 고려의 노력', lead, chapters: CHAPTERS }, { id:'joseon', session:2, title:'조선을 걷다', era:'조선', eyebrow:'조선의 건국과 발전', lead, chapters: JOSEON }]`.
  - `courseById(id) -> course` (없는 id면 `COURSES[0]`), `courseOfChapter(chapterId) -> course`.
  - `isUnlocked(chapter, save)` — 같은 `session`의 `no-1` 장 결과가 있어야 열림(1장은 `load`만 있으면 열림).
  - `isSessionDone(session, save)` — `ALL_CHAPTERS` 중 그 session 장이 모두 끝났는지.

조선편 장 정보(설계 문서 4·6장):

| id | title | years | event | place | mapXY |
|---|---|---|---|---|---|
| j1 | 위화도 회군과 조선 건국 | 1388~1394 | 새 나라 조선 | 위화도·한양 | [20, 20] |
| j2 | 세종과 훈민정음 | 1443~1446 | 우리 글자 | 한양 경복궁 | [40, 53] |
| j3 | 세종 때의 과학 기술 | 1434~1442 | 시간과 비를 재다 | 한양 | [44, 56] |
| j4 | 임진왜란과 한산도 대첩 | 1592 | 일본의 침입 | 한산도 앞바다 | [60, 88] |
| j5 | 병자호란과 남한산성 | 1636~1637 | 청의 침입 | 남한산성 | [47, 59] |
| j6 | 영조·정조와 수원 화성 | 1742~1796 | 탕평과 화성 | 수원 | [40, 62] |

- [ ] **Step 1: Write the failing test** `tests/courses.test.js`

```js
import { test, eq, ok } from './harness.js';
import { COURSES, CHAPTERS, JOSEON, ALL_CHAPTERS, SESSIONS, courseById, courseOfChapter, isUnlocked, isSessionDone } from '../chapters/index.js';
const mkSave = chapters => { const s = { data: { chapters } }; s.chapterResult = id => s.data.chapters[id] || null; return s; };

test('courses: 고려편과 조선편, 이름과 장 묶음', () => {
  eq(COURSES.map(c => c.id), ['goryeo', 'joseon']);
  eq(COURSES.map(c => c.title), ['고려를 지켜라', '조선을 걷다']);
  eq(courseById('joseon').chapters.map(c => c.id), ['j1', 'j2', 'j3', 'j4', 'j5', 'j6']);
  eq(courseById('nope').id, 'goryeo');
  eq(courseOfChapter('ch4').id, 'goryeo');
  eq(courseOfChapter('j2').id, 'joseon');
  eq(ALL_CHAPTERS.length, 12);
  eq(new Set(ALL_CHAPTERS.map(c => c.id)).size, 12, 'ids are unique');
});
test('courses: 조선편은 아직 준비 중, 정리는 6줄', () => {
  ok(JOSEON.every(c => c.load === null && c.session === 2));
  eq(SESSIONS[2].points.length, 6);
  ok(CHAPTERS.every(c => c.session === 1));
});
test('courses: 열림 규칙은 같은 편 안에서만 센다', () => {
  const save = mkSave({ ch1: { stars: 3 }, ch2: { stars: 3 }, ch3: { stars: 3 }, ch4: { stars: 3 }, ch5: { stars: 3 }, ch6: { stars: 3 } });
  eq(isSessionDone(1, save), true);
  eq(isSessionDone(2, save), false, '고려편을 마쳐도 조선편은 끝나지 않음');
  const j2 = { ...JOSEON[1], load: () => null }, j1 = { ...JOSEON[0], load: () => null };
  eq(isUnlocked(j1, save), true, '조선편 1장은 처음부터 열림');
  eq(isUnlocked(j2, save), false, '고려편 1장을 마친 것으로 조선편 2장이 열리지 않음');
  save.data.chapters.j1 = { stars: 1 };
  eq(isUnlocked(j2, save), true);
  eq(isUnlocked(JOSEON[1], save), false, '준비 중인 장은 열리지 않음');
});
```

- [ ] **Step 2: Run it to verify it fails**
Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tools/test.ps1 -Port 8141 -Only courses`
Expected: FAIL import courses (COURSES not exported)

- [ ] **Step 3: Implement in `chapters/index.js`** — 위 Interfaces 그대로. `isUnlocked`는 `ALL_CHAPTERS.find(c => c.session === chapter.session && c.no === chapter.no - 1)`의 결과를 본다. `lead` 문장 — 고려편: 지금 첫 화면의 소개 문장, 조선편: "조선을 세운 사람들, 우리 글자와 과학 기구를 만든 사람들, 전쟁을 이겨 낸 사람들을 만나 보세요."(사실 주장 없는 안내).
  `tests/screens.test.js`의 `eq(Object.keys(SESSIONS), ['1'])` → `['1', '2']`.

- [ ] **Step 4: Run tests** — `-Only courses` PASS, 그다음 전체 `tools/test.ps1 -Port 8141`에서 fail=0.

- [ ] **Step 5: Commit** `feat(courses): 편 목록(고려편·조선편)과 편 안의 열림 규칙`

### Task 2: 저장에 마지막으로 고른 편

**Files:** Modify `core/save.js`, `tests/save.test.js`

**Interfaces:**
- Produces: `save.data.course: 'goryeo' | 'joseon' | null`(처음은 null), `save.setCourse(id)`(저장까지). `load()`는 옛 기록에 `course`가 없거나 문자열이 아니면 `null`. `reset()` 뒤 null.

- [ ] **Step 1: failing test** (`tests/save.test.js`에 추가)

```js
test('save: 고른 편을 기억하고, 옛 기록은 편이 비어 있다', () => {
  const backend = memoryBackend();
  backend.setItem('goryeo-game:v1', JSON.stringify({ name: '옛 학생', chapters: { ch1: { stars: 2 } }, current: { id: 'ch2', stage: 'explore' } }));
  const a = createSave(createStorage(backend)); a.load();
  eq(a.data.course, null);
  eq(a.data.current, { id: 'ch2', stage: 'explore' });
  a.setCourse('joseon');
  const b = createSave(createStorage(backend)); b.load();
  eq(b.data.course, 'joseon');
  eq(b.data.chapters.ch1.stars, 2);
  b.reset(); eq(b.data.course, null);
});
```

- [ ] **Step 2:** `-Only save` → FAIL(`setCourse is not a function`)
- [ ] **Step 3:** `empty()`에 `course: null`, `load()`에 `course: typeof d.course === 'string' ? d.course : null`, `setCourse(id) { save.data.course = id; save.persist(); }`.
- [ ] **Step 4:** `-Only save` PASS, 전체 fail=0.
- [ ] **Step 5: Commit** `feat(save): 마지막으로 고른 편 기억`

### Task 3: 화면 — 첫 화면 이름, 편 고르기, 지도의 '다른 시대'

**Files:** Modify `core/screens.js`, `styles.css`, `index.html`(`<title>`), `tests/screens.test.js`

**Interfaces:**
- Consumes: `COURSES`, `isUnlocked` (Task 1).
- Produces:
  - `showTitle` — 큰 제목 `역사 속으로 걸어가기`(h1 안 강조 span은 '걸어가기'), 위 작은 줄 `초등 5학년 사회 · 3D 역사 탐험`, 소개 "시대를 골라 그때 사람이 되어 보세요. 직접 걷고, 이야기를 듣고, 역사의 현장을 겪어 봐요." 나머지(이어하기·처음부터·확인창·저장 경고·조작 안내)는 그대로.
  - `showCourses(root, courses, save) -> Promise<courseId>` — 클래스 `screen courses`, 제목 "어느 시대로 갈까요?", 편마다 버튼 `data-course=id`: 편 이름(`title`), `era`편 · `eyebrow`, 진행 `마친 장 n/6 · ★합계`(마친 장이 없으면 "아직 시작 전"), 장이 모두 `load:null`이면 작은 글 "준비 중인 장이 많아요"(버튼은 눌림).
  - `showMap(root, chapters, save, { onSessionCard, onCourses, heading })` — `heading`이 있으면 제목 "어디로 갈까요?" 위에 작은 줄로 보인다. 결과 카드 버튼은 이 지도의 장 중 하나라도 마쳤을 때만, 눌리면 `onSessionCard()`(인자 없음). `onCourses`가 있으면 버튼 '다른 시대'가 생기고 누르면 화면을 닫고 `'courses'`로 끝난다.
  - `index.html`의 `<title>` → `역사 속으로 걸어가기`.

- [ ] **Step 1: failing tests** (`tests/screens.test.js`)

```js
test('title: 사이트 이름은 역사 속으로 걸어가기', () => {
  const el = root();
  try { showTitle(el, { savedName: '', hasProgress: false, storageOk: true }); ok(el.querySelector('h1').textContent === '역사 속으로 걸어가기', el.querySelector('h1').textContent); }
  finally { el.remove(); }
});
test('courses screen: 두 편과 진행, 누르면 그 편', async () => {
  const { showCourses } = await import('../core/screens.js');
  const { COURSES } = await import('../chapters/index.js');
  const el = root();
  const save = { data: { chapters: { ch1: { stars: 3 }, ch2: { stars: 2 } } } }; save.chapterResult = id => save.data.chapters[id] || null;
  const p = showCourses(el, COURSES, save);
  const g = el.querySelector('[data-course="goryeo"]'), j = el.querySelector('[data-course="joseon"]');
  ok(g.textContent.includes('고려를 지켜라') && g.textContent.includes('2/6') && g.textContent.includes('★5'), g.textContent);
  ok(j.textContent.includes('조선을 걷다') && j.textContent.includes('아직 시작 전'), j.textContent);
  j.click();
  eq(await p, 'joseon');
  eq(el.children.length, 0, 'screen removed');
  el.remove();
});
test('map: 다른 시대 버튼과 편 이름 줄', async () => {
  const { JOSEON } = await import('../chapters/index.js');
  const el = root();
  const save = { data: { chapters: {} } }; save.chapterResult = id => save.data.chapters[id] || null;
  const p = showMap(el, JOSEON, save, { onCourses: true, heading: '조선을 걷다' });
  ok(el.textContent.includes('조선을 걷다'));
  ok([...el.querySelectorAll('[data-chapter]')].every(b => b.disabled), '준비 중은 눌리지 않음');
  ok(!btn(el, '결과 카드'), '마친 장이 없으면 결과 카드 없음');
  btn(el, '다른 시대').click();
  eq(await p, 'courses');
  el.remove();
});
```

(기존 테스트 `one session: ... map has one result button`의 `eq(labels, ['결과 카드'])`는 `onCourses` 없이 부르므로 그대로 통과해야 한다.)

- [ ] **Step 2:** `-Only screens` → 새 세 테스트 FAIL
- [ ] **Step 3:** 구현. 편 카드 스타일은 `styles.css`에 `.courses` 묶음(지도 화면의 `.pick` 단추 모양을 크게, 두 장 나란히, 좁으면 위아래) — 색은 기존 변수만 쓴다.
- [ ] **Step 4:** `-Only screens`, `-Only classroom` PASS, 전체 fail=0.
- [ ] **Step 5: Commit** `feat(screens): 첫 화면 이름 '역사 속으로 걸어가기', 편 고르기, 지도의 다른 시대`

### Task 4: 흐름 연결과 올리기

**Files:** Modify `core/main.js`, `core/precache.js`, `tests/sw.test.js`

**Interfaces:**
- Consumes: Task 1~3 전부.
- 흐름(`main.js`):
  - `mapLoop`: `save.data.current`가 있으면 `ALL_CHAPTERS`에서 찾아 이어하기(`load` 없으면 current 지움). 그 장의 편을 `save.setCourse`로 기억.
  - 아니면 편 = `save.data.course`; 없으면 `showCourses` → `setCourse`. 그 편의 지도 `showMap(ui, course.chapters, save, { heading: course.title, onSessionCard: () => showSessionCard(ui, course.session, save, ALL_CHAPTERS), onCourses: true })`. 결과가 `'courses'`면 `showCourses`로 다시 고르고 반복.
  - `playChapter` 끝: `isSessionDone(meta.session, save)`이면 `showSessionCard(ui, meta.session, save, ALL_CHAPTERS)`.
  - 메뉴 '장 선택으로': 지금처럼 `abandonCurrent` + 새로고침 → `course`가 저장돼 있어 그 편 지도로 간다.
  - 처음부터(`choice === 'new'`): `reset` → 이름 → 편 고르기(`course`가 null이므로).
  - 개발용 주소: `/^(ch\d|j\d)-(scene|minigame)$/`로 장 id를 받아 `ALL_CHAPTERS`에서 찾고, `load`가 없으면 무시.
- `CACHE = 'goryeo-v13'`, `tests/sw.test.js`의 기대값도 `goryeo-v13`.

- [ ] **Step 1: failing test** — `tests/sw.test.js`의 `eq(CACHE, 'goryeo-v12')`를 `'goryeo-v13'`으로 바꾼다.
- [ ] **Step 2:** `-Only sw` → FAIL(`goryeo-v12` ≠ `goryeo-v13`)
- [ ] **Step 3:** `main.js` 흐름 구현, `precache.js` CACHE 올림.
- [ ] **Step 4:** 전체 테스트 fail=0. 개발 서버(`goryeo-game`, 8130)를 1000×560 창에서 확인:
  - 처음부터 → 이름 → 편 고르기 두 카드 → 조선편 → 6장 모두 "준비 중" → 다른 시대 → 고려편 → 1장 시작 → 메뉴 '장 선택으로' → 고려편 지도.
  - `localStorage`에 옛 형식 기록(course 없음, current ch2) 넣고 새로고침 → 이어하기 → 2장으로 바로.
  - 휴대폰 폭(740×360)에서 편 고르기 카드가 넘치지 않음.
- [ ] **Step 5: Commit & 올리기** `feat: 편 고르기 흐름 연결, 조선편 자리(준비 중)` → `git push origin main` → https://ssamgame.github.io/goryeo/core/precache.js 에 `goryeo-v13`이 뜰 때까지 확인 → 스크래치패드 `goryeo-dist`에 바뀐 파일 복사 후 미리보기 아티팩트 다시 올림.

## 이 계획 뒤

조선편 각 장(`j1`~`j6`)은 장마다 따로 계획을 쓴다. 장 계획에서 함께 할 일: 그 장의 배경음악(`THEMES.jN`, `tests/music.test.js`의 장 목록), 필요한 새 생김새(갓·익선관·전립·청군 모자), 학생 생김새(`player` 칸), `PRECACHE`에 장 파일 추가, `content/sources.js`에 S23~ 출처.
