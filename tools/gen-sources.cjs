// 리눅스·클라우드용(tools/gen-sources.ps1과 같은 일): content/sources.js와 장별 대사로 선생님 대조용 content/sources.md를 만든다.
// 사용: NODE_PATH=$(npm root -g) node tools/gen-sources.cjs
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'content/sources.js'), 'utf8');
const q = "'((?:[^'\\\\]|\\\\.)*)'";
const re = new RegExp(`^\\s*(S\\d+): \\{ title: ${q}, url: ${q}, note: ${q} \\}`, 'gm');
const unesc = s => s.replace(/\\'/g, "'");
const lines = ['# 출처 목록', '', '게임 속 모든 역사 서술의 출처예요. 교과서와 다른 내용이 있으면 알려 주세요.', '', '| 번호 | 출처 | 확인한 내용 |', '|---|---|---|'];
let n = 0;
for (const m of js.matchAll(re)) { n++; lines.push(`| ${m[1]} | [${unesc(m[2])}](${m[3]}) | ${unesc(m[4])} |`); }
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' };
const srv = http.createServer((req, res) => { try { const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); res.setHeader('Content-Type', mime[path.extname(p)] || 'application/octet-stream'); res.end(fs.readFileSync(p)); } catch { res.statusCode = 404; res.end(); } }).listen(8127, async () => {
  const b = await chromium.launch();
  try {
    const pg = await b.newPage(); await pg.goto('http://localhost:8127/tools/script-table.html');
    await pg.waitForFunction(() => { const t = document.getElementById('out')?.textContent; return t && t !== 'RUNNING'; }, null, { timeout: 60000 });
    lines.push('', await pg.$eval('#out', e => e.textContent));
    fs.writeFileSync(path.join(root, 'content/sources.md'), lines.join('\n') + '\n');
    console.log(`sources: ${n}`);
  } finally { await b.close(); srv.close(); }
});
