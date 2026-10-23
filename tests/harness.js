// 브라우저에서 도는 작은 테스트 하네스. 결과는 <pre id="out">에 쓴다.
const tests = [];

export function test(name, fn, { timeout = 8000 } = {}) { tests.push({ name, fn, timeout }); }

export class Skip extends Error {}
export function skip(reason) { throw new Skip(reason); }

export function ok(value, msg = 'expected truthy') {
  if (!value) throw new Error(msg);
}

export function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg ? msg + ': ' : ''}expected ${e}, got ${a}`);
}

export async function run() {
  const out = document.getElementById('out');
  const filter = new URLSearchParams(location.search).get('only');
  let pass = 0, fail = 0, skipped = 0;
  const lines = [];
  for (const t of tests) {
    if (filter && !t.name.startsWith(filter)) continue;
    out.textContent = `RUNNING ${t.name} (${lines.length} done)`; // 멈추면 어디서 멈췄는지 보이게(짧게: 긴 글이 시험 화면을 덮지 않게)
    try {
      await Promise.race([
        t.fn(),
        new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${t.timeout}ms`)), t.timeout)),
      ]);
      pass += 1; lines.push(`PASS ${t.name}`);
    } catch (e) {
      if (e instanceof Skip) { skipped += 1; lines.push(`SKIP ${t.name}: ${e.message}`); }
      else { fail += 1; lines.push(`FAIL ${t.name}: ${e && e.message}`); }
    }
  }
  lines.push(`RESULT pass=${pass} fail=${fail} skip=${skipped}`);
  out.textContent = lines.join('\n');
  return { pass, fail };
}
