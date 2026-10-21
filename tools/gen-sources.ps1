# content/sources.js와 장별 대사를 읽어 선생님 대조용 content/sources.md를 만든다.
param([int]$Port = 8126)
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$js = [System.IO.File]::ReadAllText((Join-Path $root 'content/sources.js'), $utf8)
$q = "'((?:[^'\\]|\\.)*)'"
$re = [regex]"(?m)^\s*(S\d+): \{ title: $q, url: $q, note: $q \}"
$unesc = { param($s) $s -replace "\\'", "'" }
$lines = @('# 출처 목록', '', '게임 속 모든 역사 서술의 출처예요. 교과서와 다른 내용이 있으면 알려 주세요.', '', '| 번호 | 출처 | 확인한 내용 |', '|---|---|---|')
foreach ($m in $re.Matches($js)) {
  $lines += "| $($m.Groups[1].Value) | [$(& $unesc $m.Groups[2].Value)]($($m.Groups[3].Value)) | $(& $unesc $m.Groups[4].Value) |"
}
# 장별 문장 표: tools/script-table.html을 헤드리스 Edge로 실행해 받는다 (WebGL 불필요)
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$prof = Join-Path $env:TEMP ('goryeo-gen-' + [guid]::NewGuid().ToString('N'))
$job = Start-Job -ScriptBlock { param($s, $p, $r) & $s -Port $p -Root $r } -ArgumentList (Join-Path $PSScriptRoot 'serve.ps1'), $Port, $root
try {
  for ($i = 0; $i -lt 50; $i++) { try { Invoke-WebRequest -UseBasicParsing "http://localhost:$Port/tools/script-table.html" -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Milliseconds 200 } }
  $dom = & $edge --headless=new --disable-gpu --no-first-run "--user-data-dir=$prof" --virtual-time-budget=5000 --dump-dom "http://localhost:$Port/tools/script-table.html" 2>$null | Out-String
  $m = [regex]::Match($dom, '<pre id="out">([\s\S]*?)</pre>')
  if (-not $m.Success -or $m.Groups[1].Value -eq 'RUNNING') { throw 'script table failed' }
  $lines += ''
  $lines += [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -Force -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force $prof -ErrorAction SilentlyContinue
}
[System.IO.File]::WriteAllText((Join-Path $root 'content/sources.md'), ($lines -join "`n") + "`n", $utf8)
Write-Output "sources: $($re.Matches($js).Count)"
