// 리눅스·클라우드용 테스트(tools/test.ps1과 같은 일): NODE_PATH=$(npm root -g) node tools/test-node.cjs [only]  (PORT=8141 기본)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.md':'text/markdown; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8' };
function serve(port){ return new Promise(r=>{ const s=http.createServer((q,res)=>{ let rel=decodeURIComponent(new URL(q.url,'http://x').pathname).replace(/^\/+/,''); let p=path.join(root,rel); if(!p.startsWith(root)){res.statusCode=403;return res.end();}
 try{ if(fs.statSync(p).isDirectory()) p=path.join(p,'index.html'); const b=fs.readFileSync(p); res.setHeader('Content-Type',mime[path.extname(p).toLowerCase()]||'application/octet-stream'); res.setHeader('Cache-Control', rel.startsWith('vendor/')?'max-age=3600':'no-store'); res.end(b);}catch{res.statusCode=404;res.end();} }); s.listen(port,()=>r(s)); }); }
async function runOnce(query, port){ const s=await serve(port); const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{ const pg=await b.newPage({viewport:{width:1000,height:560}}); await pg.goto(`http://localhost:${port}/tests/index.html${query}`);
  await pg.waitForFunction(()=>/RESULT pass=/.test(document.getElementById('out')?.textContent||''),null,{timeout:3600000,polling:2000});
  return await pg.$eval('#out',e=>e.textContent);} catch(e){return 'NO OUTPUT '+e.message} finally{await b.close(); s.close();} }
(async()=>{ const only=process.argv[2]; const groups=['kit: ','layout: ','play: '];
 const runs= only?['?only='+encodeURIComponent(only)]:[...groups.map(g=>'?only='+encodeURIComponent(g)),'?skip='+encodeURIComponent(groups.join('|'))];
 let pass=0,fail=0,skip=0,lines=[]; let port=+(process.env.PORT||8141);
 await Promise.all(runs.map(async (q,i)=>{ const t=await runOnce(q,port+i); const m=t.match(/RESULT pass=(\d+) fail=(\d+) skip=(\d+)/); if(m){pass+=+m[1];fail+=+m[2];skip+=+m[3];}else fail++; lines.push(...t.split('\n').filter(l=>!l.startsWith('RESULT '))); }));
 lines.push(`RESULT pass=${pass} fail=${fail} skip=${skip}`); console.log(lines.join('\n')); process.exit(fail?1:0); })();
