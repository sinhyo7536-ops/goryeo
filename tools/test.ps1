param([string]$Only = '', [int]$Port = 8123)
# 정적 서버를 띄우고 Edge 헤드리스로 tests/index.html을 실행해 결과를 출력한다.
# -Only 없이 돌리면 한 번에 너무 오래 돌지 않게 나눈다(장 끝까지 하기 kit, 화면 배치 layout, 나머지). 번마다 서버를 새로 띄운다.
$root = Split-Path -Parent $PSScriptRoot
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
function Run-Once([string]$query, [int]$port) {
  $profileDir = Join-Path $env:TEMP ('goryeo-test-edge-' + [guid]::NewGuid().ToString('N'))
  $job = Start-Job -ScriptBlock { param($s, $p, $r) & $s -Port $p -Root $r } -ArgumentList (Join-Path $PSScriptRoot 'serve.ps1'), $port, $root
  try {
    $ready = $false
    for ($i = 0; $i -lt 50 -and -not $ready; $i++) {
      try { Invoke-WebRequest -UseBasicParsing "http://localhost:$port/tests/harness.js" -TimeoutSec 2 | Out-Null; $ready = $true } catch { Start-Sleep -Milliseconds 200 }
    }
    if (-not $ready) { return 'server did not start' }
    $dom = & $edge --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --no-first-run "--user-data-dir=$profileDir" --virtual-time-budget=4000000 --dump-dom "http://localhost:$port/tests/index.html$query" 2>$null | Out-String
    $m = [regex]::Match($dom, '<pre id="out"[^>]*>([\s\S]*?)</pre>')
    if ($m.Success) { [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value) } else { "NO OUTPUT`n$dom" }
  } finally {
    Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -Force -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $profileDir -ErrorAction SilentlyContinue
  }
}
$groups = @('kit: ', 'layout: ') # 오래 걸리는 묶음은 따로, 나머지는 한 번에
$rest = '?skip=' + [Uri]::EscapeDataString($groups -join '|')
$runs =if ($Only) { @('?only=' + [Uri]::EscapeDataString($Only)) } else { @($groups | ForEach-Object { '?only=' + [Uri]::EscapeDataString($_) }) + @($rest) }
$pass = 0; $fail = 0; $skip = 0; $lines = @(); $n = 0
foreach ($q in $runs) {
  $text = Run-Once $q ($Port + $n); $n += 1
  if ($env:GORYEO_TEST_LOG) { Set-Content -Encoding utf8 -Path "$($env:GORYEO_TEST_LOG)-$n.txt" -Value $text }
  $r = [regex]::Match($text, 'RESULT pass=(\d+) fail=(\d+) skip=(\d+)')
  if ($r.Success) { $pass += [int]$r.Groups[1].Value; $fail += [int]$r.Groups[2].Value; $skip += [int]$r.Groups[3].Value } else { $fail += 1 }
  $lines += ($text -split "`n" | Where-Object { $_ -notmatch '^RESULT ' })
}
$lines += "RESULT pass=$pass fail=$fail skip=$skip"
Write-Output ($lines -join "`n")
if ($fail -eq 0) { exit 0 } else { exit 1 }
