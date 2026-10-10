$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$buildScript = Join-Path $PSScriptRoot 'build.mjs'

$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
    throw 'Node.js não foi encontrado no PATH. Não foi possível executar scripts/build.mjs.'
}

Push-Location $projectRoot

try {
    & $node.Source $buildScript

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}