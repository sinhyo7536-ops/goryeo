// 서비스 워커가 처음 설치될 때 기기에 저장해 둘 파일 목록. 장을 추가하면 여기에도 넣는다.
export const CACHE = 'goryeo-v2'; // 배포할 때마다 올린다 (학생 기기에 새 판이 반영되도록)

export const PRECACHE = [
  'index.html', 'styles.css', 'vendor/three.module.min.js', 'content/sources.js',
  'core/main.js', 'core/storage.js', 'core/save.js', 'core/content.js', 'core/dialogue.js', 'core/input.js',
  'core/quality.js', 'core/audio.js', 'core/world.js', 'core/people.js', 'core/screens.js', 'core/flow.js',
  'core/precache.js',
  'core/minigame.js', 'core/weather.js', 'core/faces.js', 'content/characters.js',
  'chapters/index.js', 'chapters/ch1/chapter.js', 'chapters/ch1/scene.js', 'chapters/ch1/script.js',
  'chapters/ch2/chapter.js', 'chapters/ch2/scene.js', 'chapters/ch2/script.js',
  'chapters/ch3/chapter.js', 'chapters/ch3/scene.js', 'chapters/ch3/script.js',
  'chapters/ch4/chapter.js', 'chapters/ch4/scene.js', 'chapters/ch4/script.js',
  'chapters/ch5/chapter.js', 'chapters/ch5/scene.js', 'chapters/ch5/script.js',
  'chapters/ch6/chapter.js', 'chapters/ch6/scene.js', 'chapters/ch6/script.js',
];

// 오프라인에서 폴더 주소(…/game/)로 들어오는 화면 요청은 저장해 둔 index.html로 연다.
export function cacheKeyFor(url, mode, swUrl) {
  if (mode !== 'navigate') return null;
  const u = new URL(url), base = new URL('./', swUrl);
  return u.pathname === base.pathname || u.pathname === `${base.pathname}index.html` ? 'index.html' : null;
}
