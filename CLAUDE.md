# 역사 속으로 걸어가기 — 작업 안내

초등 5학년 사회의 한국사를 3D로 걸어 다니며 배우는 브라우저 게임이다(사이트 이름 「역사 속으로 걸어가기」). 첫 화면 → 편 고르기 → 그 편의 1~6장. 편마다 6장을 한 흐름으로 이어서 한다(장마다 약 10분).

- 고려편 「고려를 지켜라」(외세의 침입과 고려의 노력): 장 id `ch1`~`ch6`, 폴더 `chapters/ch1`~`ch6`, 결과 카드 `SESSIONS[1]`.
- 조선편 「조선을 걷다」(조선의 건국과 발전): 장 id `j1`~`j6`, 폴더 `chapters/joseon/j1`~`j6`, 결과 카드 `SESSIONS[2]`. 설계는 `docs/superpowers/specs/2026-10-22-joseon-course-design.md`.
- 앞으로 근대편·현대편도 같은 방식(`chapters/index.js`의 `COURSES`에 편 추가, 새 session 번호)으로 더한다.

- 저장소: https://github.com/ssamgame/goryeo (조직 `ssamgame`, 브랜치 `main`)
- 학생 주소: https://ssamgame.github.io/goryeo/ (GitHub Pages, main에서 바로 배포)
- 미리보기: https://claude.ai/artifact/QSh1YhvtwooxoyDRsBZsCT (링크 공유 중, 다시 올리면 모두에게 바뀐다)
- 사용자는 초등 교사다. 답은 늘 한국어로, 쉬운 말로 한다.

## 기술 구성

- 빌드 없는 정적 ES 모듈 사이트. Three.js r160(`vendor/three.module.min.js`, import map). 외부 서버·소리 파일·그림 파일 없음.
- 기기: 갤럭시 탭 S6 Lite, 크롬북. 가로 화면. 키보드와 터치 모두 된다.
- 모든 3D 모양은 코드로 만든다(로우폴리). 표면 무늬는 캔버스로 그린다(`core/textures.js`, 위치 기준 매핑, `mat(color)`가 색으로 무늬를 자동 선택).
- 장 모듈 형식: `{ id, mood, player?, script, quizzes, buildScene(world), enterStage(ctx, stage), explore(ctx), minigame(ctx) }`. `player`는 그 장의 학생 생김새(없으면 고려 병사). `core/flow.js`의 `runChapter`가 해설 → 탐험 → 미니게임 → 퀴즈 순으로 돌리고 단계마다 저장한다.
- 주요 파일
  - `core/world.js` 렌더러·분위기·카메라(따라가기·대화·고정 맞춤)·해와 그림자
  - `core/people.js` 인물(만화풍 얼굴, 무기), `content/characters.js` 생김새
  - `core/props.js` 풀·꽃·바위·덤불·소나무 흩뿌리기(InstancedMesh, 화질에 따라 개수 조절)
  - `core/minigame.js` 미니게임 도구, `core/dialogue.js` 대화창, `core/screens.js` 화면들
  - `core/music.js` 장별 배경음악(Web Audio로 연주), `core/audio.js` 효과음
  - `core/quality.js` 화질 3단계와 자동 하향, `core/save.js` 저장(기기 안 localStorage만)
  - `chapters/chN/` 장별 `script.js`(대사·퀴즈·출처) `scene.js`(장면) `chapter.js`(진행)
  - `chapters/index.js` 편 목록(`COURSES`), 장 목록, 열림·완료 규칙(같은 편 안에서만 센다)
  - `chapters/joseon/common.js` 조선편 진행 도구(차례대로 말 걸기 `talkInOrder`, 다시 하기 `tryPart`, 때 맞춰 누르기 `timingPress`)
  - `core/minigame.js` 카드 고르기 `chooseCards`(그림 가능), 카드 나누기 `sortCards`, 자리 놓기 `placeOnBoard`, 순서 맞추기 `orderCards`, 획 따라 그리기 `traceGlyph`
  - `content/sources.js` 출처 S1~S22(고려편)·S23~S42(조선편), `content/glyphs.js` 5장 大藏經 획 자료(`tools/gen-glyphs.ps1`로 생성, 손으로 고치지 않음)

## 실행과 테스트

- 개발 서버: `.claude/launch.json`의 `goryeo-game`(포트 8130). 장면 확인은 `?debug=ch3-scene`, 미니게임부터는 `?debug=ch3-minigame`(조선편은 `?debug=j3-scene`).
- 테스트: `powershell -NoProfile -ExecutionPolicy Bypass -File tools/test.ps1 -Port 8141` (헤드리스 Edge, 자체 하네스 `tests/harness.js`). 포트 8123은 막혀 있어 8141을 쓴다. 출력이 길면 파일로 받아 `FAIL|RESULT` 줄만 본다.
- 새 기능과 버그 수정은 테스트를 먼저 쓰고 실패를 본 뒤 고친다. 새 테스트 파일은 `tests/index.html`의 목록에 넣는다.
- 화면에 보이는 변경은 브라우저 창에서 직접 확인한다(1000×560 정도로 탭 크기 흉내).

## 고친 뒤 올리는 순서 (매번)

1. 작업 브랜치에서 고치고 전체 테스트 통과를 확인한다.
2. `core/precache.js`의 `CACHE`(goryeo-vN)를 하나 올리고 `tests/sw.test.js`도 맞춘다. 새 파일은 `PRECACHE`에 넣는다.
3. 커밋(메시지는 한국어) → main에 병합 → `git push origin main`.
4. https://ssamgame.github.io/goryeo/core/precache.js 에 새 판 번호가 뜰 때까지 확인한다(1~2분).
5. 바뀐 파일을 스크래치패드의 `goryeo-dist` 복사본에 넣고 미리보기 아티팩트를 다시 올린다(없으면 저장소 내용으로 새로 만든다).

## 내용 원칙 (매우 중요)

- 역사 사실이 틀리면 매우 위험하다. 모든 해설·퀴즈 문장은 백과사전(한국민족문화대백과사전, 우리역사넷 등)으로 확인하고 `src: ['S..']`를 단다. 출처 없는 사실 주장은 넣지 않는다(검사기 `core/content.js`가 막는다). 새 출처는 `content/sources.js`와 설계 문서 표에 넣고 `tools/gen-sources.ps1`로 `content/sources.md`를 다시 만든다.
- 교과서는 비상 2022 개정 5학년 사회를 따른다.
- 표현: "서희 장군"이 아니라 "서희". "사귀다" 대신 "친하게 지내다". 1장 선택지는 "고려는 고구려를 이은 나라이다.", "여진이 길을 막고 있어서 거란과 교류를 할 수 없다."를 그대로 쓴다.
- 4장 저고여 사건은 "누가 죽였는지는 밝혀지지 않았어요"를 꼭 유지한다.
- 획 수 같은 아주 세세한 부분은 고치자고 하지 않는다(藏 17획 그대로).
- 인물 표정은 모두 근엄하게.

## 정한 것과 뺀 것

- 1·2차시를 합쳐 한 흐름. 결과 카드는 편마다 6장 뒤 한 장(핵심 정리 6줄).
- 조선편 원칙: 측우기는 장영실 발명이라고 쓰지 않는다(세자가 제안, 세종 때 만듦). 거북선이 한산도 대첩에 나갔다고 쓰지 않는다(출처 찾으면 바꿈). 척화·주화는 옳고 그름을 매기지 않는다. 훈민정음은 1443 창제·1446 반포를 나눠 쓴다. 전투는 불길 없이 연기·물러남으로.
- 뺀 것: 교사용 안내 페이지, QR코드 버튼, 대사 읽어 주기(음성). 다시 넣지 않는다.
- 그래픽은 태블릿 성능 안에서 단계적으로 강화한다. 무거운 효과는 화질 '보통·높음'에서만.

## 아직 남은 일

- 조선편: 교사의 교과서 대조(비상 교과서의 조선 단원 순서·범위), 실제 탭에서 1~6장 시간과 프레임 재기, 수원 화성 세계유산(1997) 출처를 찾으면 6장 결과에 한 줄.
- 실제 갤럭시 탭에서 프레임 확인(그래픽 강화 뒤), 1~6장 전체 시간 재기, 교사의 교과서 대조.
- 배경음악은 소리를 직접 들어 보지 못했다(크기만 측정). 사용자 의견에 따라 장별 조정.
- 첫 화면의 3D 병사가 버튼 뒤에 겹쳐 보인다(사용자에게 제안만 함).
- 작은 미완: 이어하기 장면 ch4·ch5 테스트 없음, 별점에 첫 시도 점수 미사용, 2장 포로가 퀴즈 중 멈춤 등.
