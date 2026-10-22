# 5장 글자 새기기용 한자 획 자료(content/glyphs.js)를 만든다.
# 자료: hanzi-writer-data 2.0.1 (Make Me a Hanzi에서 나온 획 모양·획 순서, Arphic Public License)
#   https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/<글자>.json
# 쓰는 법: tools/gen-glyphs.ps1 -DataDir <대.json, 藏.json, 經.json 이 있는 폴더>
param([Parameter(Mandatory)][string]$DataDir)
$ErrorActionPreference = 'Stop'
$chars = '大', '藏', '經'
$inv = [Globalization.CultureInfo]::InvariantCulture
# 원자료는 1024 격자, y가 위로 증가(기준선 900). 판 좌표(0~1, y 아래로)로 바꾼다.
function To01($p) { [Math]::Round($p[0] / 1024, 3), [Math]::Round((900 - $p[1]) / 1024, 3) }
function Fmt($v) { $v.ToString('0.###', $inv) }

$out = New-Object Text.StringBuilder
[void]$out.AppendLine('// 5장 글자 새기기: 대장경(大藏經) 세 글자의 실제 획 모양과 획 순서.')
[void]$out.AppendLine('// tools/gen-glyphs.ps1 이 만든 파일이다. 손으로 고치지 않는다.')
[void]$out.AppendLine('// 자료: hanzi-writer-data 2.0.1 (Make Me a Hanzi), Arphic Public License (vendor/ARPHICPL.txt).')
[void]$out.AppendLine('// strokes: 획마다 지나갈 점(판 크기에 대한 0~1 좌표, 쓰는 방향 순서). outlines: 획 모양(원자료 1024 격자 좌표의 SVG 경로).')
[void]$out.AppendLine('export const GLYPHS = [')
foreach ($c in $chars) {
  $d = Get-Content (Join-Path $DataDir "$c.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  $strokes = foreach ($m in $d.medians) {
    $pts = @($m | ForEach-Object { , (To01 $_) })
    # 점을 줄인다: 첫 점, 앞 점에서 0.13 이상 떨어진 점, 끝 점. 끝 점과 너무 가까운 중간 점은 뺀다. 획마다 많아야 5개.
    $keep = New-Object Collections.ArrayList
    [void]$keep.Add($pts[0])
    for ($i = 1; $i -lt $pts.Count - 1; $i++) {
      $l = $keep[$keep.Count - 1]
      if ([Math]::Sqrt([Math]::Pow($pts[$i][0] - $l[0], 2) + [Math]::Pow($pts[$i][1] - $l[1], 2)) -ge 0.13) { [void]$keep.Add($pts[$i]) }
    }
    $end = $pts[$pts.Count - 1]
    while ($keep.Count -gt 1) {
      $l = $keep[$keep.Count - 1]
      if ([Math]::Sqrt([Math]::Pow($end[0] - $l[0], 2) + [Math]::Pow($end[1] - $l[1], 2)) -lt 0.08) { $keep.RemoveAt($keep.Count - 1) } else { break }
    }
    [void]$keep.Add($end)
    while ($keep.Count -gt 5) { $keep.RemoveAt(1 + [int](($keep.Count - 2) / 2)) }
    '[' + (($keep | ForEach-Object { '[' + (Fmt $_[0]) + ', ' + (Fmt $_[1]) + ']' }) -join ', ') + ']'
  }
  [void]$out.AppendLine("  {")
  [void]$out.AppendLine("    glyph: '$c',")
  [void]$out.AppendLine("    strokes: [")
  foreach ($s in $strokes) { [void]$out.AppendLine("      $s,") }
  [void]$out.AppendLine("    ],")
  [void]$out.AppendLine("    outlines: [")
  foreach ($p in $d.strokes) { [void]$out.AppendLine("      '$p',") }
  [void]$out.AppendLine("    ],")
  [void]$out.AppendLine("  },")
}
[void]$out.AppendLine('];')
$target = Join-Path $PSScriptRoot '..\content\glyphs.js'
[IO.File]::WriteAllText($target, $out.ToString(), (New-Object Text.UTF8Encoding $false))
"wrote $target"
