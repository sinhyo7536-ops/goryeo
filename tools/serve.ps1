param([int]$Port = 8123, [string]$Root = (Split-Path -Parent $PSScriptRoot))
# 프로젝트 폴더를 http://localhost:$Port/ 로 서빙하는 개발용 정적 서버
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.md' = 'text/markdown; charset=utf-8'; '.png' = 'image/png'; '.svg' = 'image/svg+xml'
}
$rootFull = [System.IO.Path]::GetFullPath($Root)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "serving $rootFull on http://localhost:$Port/"
try {
  while ($listener.IsListening) {
    try { $ctx = $listener.GetContext() } catch { continue } # 연결이 끊긴 요청 하나 때문에 서버가 멈추지 않게
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      $path = [System.IO.Path]::GetFullPath((Join-Path $rootFull $rel))
      if (-not $path.StartsWith($rootFull)) { $res.StatusCode = 403 }
      else {
        if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
        if (Test-Path $path -PathType Leaf) {
          $ext = [System.IO.Path]::GetExtension($path).ToLower()
          $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
          $res.Headers.Add('Cache-Control', $(if ($rel.StartsWith('vendor/')) { 'max-age=3600' } else { 'no-store' })) # 바뀌지 않는 라이브러리는 브라우저가 다시 받지 않게(테스트 iframe이 많을 때)
          $bytes = [System.IO.File]::ReadAllBytes($path)
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else { $res.StatusCode = 404 }
      }
    } catch { try { $res.StatusCode = 500 } catch {} } # 브라우저가 받다가 끊어도(테스트의 iframe 제거) 서버는 계속

    try { $res.Close() } catch {}
  }
} finally { $listener.Stop() }
