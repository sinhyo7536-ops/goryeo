# content/sources.js(와 장별 대사)를 읽어 선생님 대조용 content/sources.md를 만든다.
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
$extra = Join-Path $root 'content/script-table.md'
if (Test-Path $extra) { $lines += ''; $lines += [System.IO.File]::ReadAllText($extra, $utf8) }
[System.IO.File]::WriteAllText((Join-Path $root 'content/sources.md'), ($lines -join "`n") + "`n", $utf8)
Write-Output "sources: $($re.Matches($js).Count)"
