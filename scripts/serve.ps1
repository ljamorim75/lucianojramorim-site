param(
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$webRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist'))
$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Local: http://localhost:$Port/"

$mimeTypes = @{
  '.css' = 'text/css; charset=utf-8'
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'
  '.svg' = 'image/svg+xml'
  '.txt' = 'text/plain; charset=utf-8'
  '.xml' = 'application/xml; charset=utf-8'
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    $candidate = [IO.Path]::GetFullPath((Join-Path $webRoot $relativePath))
    if (-not $candidate.StartsWith($webRoot, [StringComparison]::OrdinalIgnoreCase)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }
    if ([IO.Directory]::Exists($candidate)) {
      $candidate = Join-Path $candidate 'index.html'
    }
    if (-not [IO.File]::Exists($candidate)) {
      $context.Response.StatusCode = 404
      $context.Response.Close()
      continue
    }
    $bytes = [IO.File]::ReadAllBytes($candidate)
    $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
    $context.Response.ContentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
