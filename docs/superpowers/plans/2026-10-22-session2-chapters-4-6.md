# 고려를 지켜라 — 2차시(4~6장) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4장 「강화도 천도와 처인성·충주성」, 5장 「팔만대장경」, 6장 「삼별초의 항쟁」과 마무리 연표, 2차시 결과 카드를 만들어 게임 전체(1~6장)를 완성하고 GitHub Pages에 배포한다.

**Architecture:** 1~3장과 같은 장 모듈 구조(`chapters/chN/{script,scene,chapter}.js`)와 공통 부품(`core/minigame.js`, `core/weather.js`, `content/characters.js`, `core/faces.js`)을 쓴다. 새 공통 부품은 카드 순서 맞추기(`orderCards`)와 획 따라 그리기(`traceGlyph`) 두 가지다.

**Tech Stack:** 기존과 같음. 배포: GitHub Pages(`https://sinhyo7536-ops.github.io/goryeo/`), claude.ai 미리보기.

**Spec:** `docs/superpowers/specs/2026-10-21-goryeo-game-design.md` 4장(4·5·6장 절), 5장, 6장

## Global Constraints

- 이전 계획들의 Global Constraints 전부.
- **1~3장에서 고친 점을 처음부터 적용한다:**
  - 모든 말하는 인물은 `content/characters.js`의 생김새(`look`)를 가지고, 대화창에 얼굴 그림이 나온다. 3D 인물도 같은 생김새를 쓴다.
  - 고정 카메라는 `world.fitFixedCamera`로 화면 비율에 맞춰, 목표물이 어떤 화면에서도 화면 안에 있다(테스트: 비율 0.6~2.2).
  - 쫓아가거나 찾아갈 대상은 시작할 때 화면 앞쪽(카메라가 보는 방향)에 둔다.
  - 누르기 목표는 `.tap-target`(76px, 급할수록 테두리 `--p`가 차오름), 큰 버튼은 `.big-action`. 실제 눌림을 `elementFromPoint`로 확인한다.
  - 메뉴가 열리면 시간이 멈춘다(`world.paused`), 미니게임 시간은 월드 시계(`onUpdate` dt)로 잰다.
  - 역사 서술은 spec 4장 문장과 출처 그대로. 확인되지 않은 직함·숫자·날짜는 쓰지 않는다. '서희 장군'·'사귀다' 금지.
- 서비스 워커 캐시 이름을 `goryeo-v2`로 올린다(배포마다 올림).
- 새 인물: `kimyunhu`(승려 김윤후: 회색 승복, 맨머리), `minister`(관리), `monk`(승병), `artisan`(장인), `baejungson`(배중손), `kimtongjeong`(김통정), `sambyeolcho`(삼별초 병사), `mongol`(몽골군).

## Review Focus

1. **카드 순서를 연달아 틀리게 누르는 학생** → 틀린 카드는 표시되고, 세 번 실패하면 다음 카드가 빛나는 쉬운 모드가 된다. (Task 1 `order: wrong taps fail and easy mode highlights the next card`)
2. **획 따라 그리기를 손가락으로 대충 문지르는 학생** → 점을 순서대로 지나야만 인정되고, 손을 떼면 그 획만 다시 한다. (Task 1 `trace: dots must be passed in order`)
3. **처인성 방어 중 화면이 좁음** → 다가오는 몽골군과 버튼이 모두 화면 안. (Task 3 `ch4: approaching Mongols are on screen at any screen shape`)
4. **항해 중 추격선에 잡힘** → 그 구간만 처음부터 다시, 세 번이면 쉬운 모드(추격선 느림). 진도가 막히지 않는다. (Task 5 `ch6: caught by a pursuer restarts the leg`)
5. **6장을 마치면** → 마무리 연표 후 2차시 결과 카드가 뜨고, 4~6장 별점과 핵심 정리가 보인다. (Task 6 `session2: card after chapter 6`)

---

### Task 1: 공통 부품 — 카드 순서 맞추기, 획 따라 그리기, 새 인물, 분위기

**Files:** Modify `core/minigame.js`, `content/characters.js`, `core/world.js`(MOODS `overcast`, `morning`, `sea`), `core/people.js`(모자 `bald`, `monkhat`), `styles.css`; Create `tests/session2-core.test.js`

**Interfaces:**
- `orderCards(ctx, { title, cards: string[] /* 정답 순서 */, easy }) → Promise<boolean>` — 섞인 카드를 화면에 띄우고, 학생이 정답 순서대로 누르면 아래 줄에 차례로 놓인다. 틀린 카드를 누르면 흔들리고 시도는 실패(false). `easy`면 다음 카드에 빛나는 테두리.
- `traceGlyph(ctx, { glyph, strokes: [x,y][][] /* 0~1 좌표 */, easy }) → Promise<boolean>` — 큰 경판 그림 위에 획마다 점을 표시, 포인터가 점을 순서대로 지나가면 그 획 완료(선이 그려짐). 손을 떼면 그 획 처음부터. 모든 획 완료면 true. 쉬운 모드는 점 판정 반경 1.6배.
- `MOODS.overcast`(흐린 하늘, 비 없음), `MOODS.morning`(맑은 산사 아침), `MOODS.sea`(맑은 바다 하늘).
- [ ] 테스트: `order: correct taps resolve true and place cards`, `order: wrong taps fail and easy mode highlights the next card`, `trace: dots must be passed in order`, `trace: lifting the finger restarts only that stroke`, `faces: new session-2 looks exist`, `world: overcast morning sea moods exist`. RED → 구현 → GREEN → 커밋.

### Task 2: 4장 대사와 장면

**Files:** Create `chapters/ch4/script.js`, `chapters/ch4/scene.js`, `tests/ch4.test.js`

- 대사·퀴즈는 spec 4장 4장 절 그대로. 화자: `guide`, `minister`(관리), `kimyunhu`, `monk`(승병), `villager`.
- 장면: 흐린 하늘의 개경 궁궐 앞(탐험, 기와 건물·돌계단), 강 건너 섬이 보이는 강화도 해안, 처인성(낮은 토성 + 성문, 바깥 들판에서 몽골 기병 깃발이 다가옴), 충주성 장면(성 안 마당, 불타는 문서 더미). 하나의 레벨 안에 구역으로 나누고 페이드로 옮긴다.
- 「도읍을 어디로?」: 화면 지도 카드(개경·강화도·서경 버튼) → 강화도를 고르면 까닭 고르기(`dialogue.ask`, 정답 "몽골군은 바다와 물에서 싸우는 데 약했다"). 다른 도시는 힌트 후 다시.
- [ ] 테스트: `ch4: script passes validation`, `ch4: quiz answers match the spec`, `ch4: scene builds with npcs and areas`. RED → GREEN → 커밋.

### Task 3: 4장 진행과 미니게임

**Files:** Create `chapters/ch4/chapter.js`; Modify `tests/ch4.test.js`, `chapters/index.js`, `core/precache.js`, `tools/script-table.html`

- 탐험: 관리(!) → 「도읍을 어디로?」 → 강화도 해설 → 처인성으로 이동.
- 「처인성 방어」: `fitFixedCamera`로 성벽 바깥 들판을 비춘다. 몽골군 깃발병이 들판 여러 방향에서 성으로 다가온다(쉬운 모드 느리게). 깃발병 위 `.tap-target`('활')을 누르면 쓰러진다. 40초 버티면 성공, 3명이 성벽에 닿으면 실패. 끝나면 해설 [S11][S4][S19].
- 충주성 장면: 페이드 후 성 안 마당, 김윤후가 문서 더미에 불을 붙이는 연출(불꽃) + 해설 [S4].
- [ ] 테스트: `ch4: completes with touch-only actions`, `ch4: approaching Mongols are on screen at any screen shape`, `ch4: picking 개경 first gives a hint and retries`. RED → GREEN → 브라우저 확인 → 커밋.

### Task 4: 5장 팔만대장경

**Files:** Create `chapters/ch5/{script,scene,chapter}.js`, `tests/ch5.test.js`; Modify index, precache, script-table

- 대사·퀴즈 spec 그대로. 화자: `guide`, `artisan`(장인 여러 명: 나무·삶기·새기기·옻칠 담당), `monk`.
- 장면: 아침 산사 작업장 — 바닷물 통, 솥, 그늘 말림 선반, 판각대, 옻칠 작업대, 경판 더미. 탐험: 장인 4명과 차례로 대화(!)하며 단계를 듣는다.
- 미니게임 1 `orderCards` 6장(spec 순서), 2 `traceGlyph` 3글자(一, 十, 大 — 획이 단순한 글자, "경판에 글자를 새겨 보아요"). 둘 다 `runWithRetries`.
- 결과 해설 [S7][S9], 퀴즈.
- [ ] 테스트: `ch5: script passes validation`, `ch5: card order matches the spec`, `ch5: completes with touch-only actions`. RED → GREEN → 브라우저 확인 → 커밋.

### Task 5: 6장 삼별초와 마무리 연표

**Files:** Create `chapters/ch6/{script,scene,chapter}.js`, `tests/ch6.test.js`; Modify index, precache, script-table

- 대사·퀴즈 spec 그대로. 화자: `guide`, `baejungson`, `kimtongjeong`, `sambyeolcho`.
- 장면: 넓은 바다(물결), 강화도 포구(북쪽 끝, z 큼), 진도(용장성 성벽), 제주(항파두리 토성), 암초들, 추격선 몇 척. 카메라는 배 뒤에서 진행 방향(다음 목적지)을 보도록 배를 남쪽에서 북쪽으로? → 목적지가 항상 화면 앞쪽에 오도록, 항해 경로는 화면 위쪽(-z)으로 진행한다(강화도 z=+80 → 진도 z=0 → 제주 z=-80).
- 탐험: 강화도 포구에서 배중손(!)과 대화 → 배에 오른다.
- 「바닷길 항해」: 배는 플레이어처럼 조이스틱·방향키로 움직임(속도 7). 구간 2개(강화도→진도, 진도→제주). 추격선은 배를 향해 다가오며(쉬운 모드 0.6배) 닿으면 그 구간 실패. 암초는 충돌체. 목적지 원에 닿으면 구간 성공 + 해설([S12], [S12][S13]).
- 마무리 연표: `orderCards`로 7장(서희 993, 양규 1010, 강감찬 1019, 강화 천도 1232년 7월, 김윤후 처인성 1232년 12월, 팔만대장경 1236~1251, 삼별초 1270~1273).
- [ ] 테스트: `ch6: script passes validation`, `ch6: destinations start ahead of the boat`, `ch6: caught by a pursuer restarts the leg`, `ch6: completes with touch-only actions`. RED → GREEN → 브라우저 확인 → 커밋.

### Task 6: 2차시 마무리와 배포

**Files:** Modify `core/precache.js`(CACHE `goryeo-v2`), `tests/screens.test.js`, `tests/sw.test.js`

- [ ] 테스트 `session2: card after chapter 6`(4~6장 결과 → `isSessionDone(2)` true, 카드에 세 장 제목·별점·핵심 정리), `sw: cache name is versioned`를 `goryeo-v2`로. RED → GREEN.
- [ ] 출처표 재생성, 전체 테스트, 별도 검토자 전체 검토 → 수정.
- [ ] `main`에 합치고 GitHub에 push(Pages 자동 배포), claude.ai 미리보기 갱신, 공개 주소에서 첫 화면 확인.
