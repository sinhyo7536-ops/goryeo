param([string]$Only = '', [int]$Port = 8123)
# 정적 서버를 띄우고 Edge 헤드리스로 tests/index.html을 실행해 결과를 출력한다.
$root = Split-Path -Parent $PSScriptRoot
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$profileDir = Join-Path $env:TEMP ('goryeo-test-edge-' + [guid]::NewGuid().ToString('N'))
$job = Start-Job -ScriptBlock { param($s, $p, $r) & $s -Port $p -Root $r } -ArgumentList (Join-Path $PSScriptRoot 'serve.ps1'), $Port, $root
try {
  $ready = $false
  for ($i = 0; $i -lt 50 -and -not $ready; $i++) {
    try { Invoke-WebRequest -UseBasicParsing "http://localhost:$Port/tests/harness.js" -TimeoutSec 2 | Out-Null; $ready = $true } catch { Start-Sleep -Milliseconds 200 }
  }
  if (-not $ready) { Write-Output 'server did not start'; Receive-Job $job; exit 1 }
  $url = "http://localhost:$Port/tests/index.html"
  if ($Only) { $url += '?only=' + [Uri]::EscapeDataString($Only) }
  $dom = & $edge --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --no-first-run "--user-data-dir=$profileDir" --virtual-time-budget=900000 --dump-dom $url 2>$null | Out-String
  $m = [regex]::Match($dom, '<pre id="out"[^>]*>([\s\S]*?)</pre>')
  $text = if ($m.Success) { [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value) } else { "NO OUTPUT`n$dom" }
  Write-Output $text
  if ($text -match 'RESULT pass=\d+ fail=0') { exit 0 } else { exit 1 }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -Force -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force $profileDir -ErrorAction SilentlyContinue
}
