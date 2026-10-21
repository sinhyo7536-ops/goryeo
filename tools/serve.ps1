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
    $ctx = $listener.GetContext()
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
          $res.Headers.Add('Cache-Control', 'no-store')
          $bytes = [System.IO.File]::ReadAllBytes($path)
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else { $res.StatusCode = 404 }
      }
    } catch { $res.StatusCode = 500 }
    $res.Close()
  }
} finally { $listener.Stop() }
