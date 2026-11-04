$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
$listener = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
    $health = Invoke-RestMethod 'http://127.0.0.1:8765/api/melody/health' -TimeoutSec 2
    if ($health.service -ne 'fingertip-melody' -or $process.Name -ne 'node.exe' -or
        $process.CommandLine -notmatch 'scripts.+server[.]mjs') {
        throw '8765 is occupied by another application.'
    }
    Stop-Process -Id $process.ProcessId
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if (-not (Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue)) { break }
        Start-Sleep -Milliseconds 200
    }
}
if (Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Old catalog service did not stop.'
}
$env:MELODY_PORT = '8765'
node scripts/server.mjs --desktop
