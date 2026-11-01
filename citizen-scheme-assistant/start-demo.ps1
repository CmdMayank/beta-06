# Starts only the isolated local app. Never kills an existing process.
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
if ((Split-Path (Split-Path $projectRoot -Parent) -Leaf) -ne 'beta-06-chatbot') {
    throw 'Run this script only in the isolated beta-06-chatbot worktree.'
}
$engineRoot = Join-Path $projectRoot 'engine'
$frontRoot = Join-Path $projectRoot 'frontend'
$auditRoot = Join-Path $engineRoot '.phase3-output\chatbot-integration'
$pythonPath = Join-Path $engineRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Missing engine/.venv. Follow engine/docs/CHATBOT_INTEGRATION.md.' }
if (-not (Test-Path -LiteralPath (Join-Path $frontRoot 'node_modules\vite\bin\vite.js'))) { throw 'Missing frontend dependencies. Run npm.cmd ci in the isolated frontend.' }
if (-not (Test-Path -LiteralPath (Join-Path $engineRoot '.phase3-output\catalog15\collection.json'))) { throw 'Missing validated 15-scheme local collection. No mock catalogue will be substituted.' }
New-Item -ItemType Directory -Path $auditRoot -Force | Out-Null
$env:SCHEME_APP_ENV = 'development'
$env:SCHEME_DEMO_ENABLED = '1'
$env:CORS_ORIGINS = 'http://localhost:5175,http://127.0.0.1:5175'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:8002'
if (-not (Get-NetTCPConnection -LocalPort 8002 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $pythonPath -ArgumentList '-m','uvicorn','main:app','--host','127.0.0.1','--port','8002','--no-access-log','--no-proxy-headers' -WorkingDirectory $engineRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $auditRoot 'demo-backend.stdout.log') -RedirectStandardError (Join-Path $auditRoot 'demo-backend.stderr.log') | Out-Null
}
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:8002/health' -TimeoutSec 2
        $chat = Invoke-RestMethod 'http://127.0.0.1:8002/api/v1/chatbot/status' -TimeoutSec 2
        if ($health.service -ne 'Scheme Navigator' -or $chat.service -ne 'Sahayak AI Assistant') { throw 'Unexpected application on port 8002.' }
        $ready = $true; break
    } catch { Start-Sleep -Milliseconds 300 }
}
if (-not $ready) { throw 'Isolated backend unavailable or wrong app on port 8002. No existing process was stopped; inspect private demo-backend.stderr.log.' }
$catalog = Invoke-RestMethod 'http://127.0.0.1:8002/api/v1/schemes' -TimeoutSec 15
if ($catalog.total -ne 15) { throw 'The local 15-scheme demo is not ready. No published data or permissions were changed.' }
if (-not (Get-NetTCPConnection -LocalPort 5175 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath 'node' -ArgumentList 'node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5175','--strictPort' -WorkingDirectory $frontRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $auditRoot 'demo-frontend.stdout.log') -RedirectStandardError (Join-Path $auditRoot 'demo-frontend.stderr.log') | Out-Null
}
$frontReady = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try { $response = Invoke-WebRequest 'http://127.0.0.1:5175/' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { $frontReady = $true; break } }
    catch { Start-Sleep -Milliseconds 300 }
}
if (-not $frontReady) { throw 'Isolated frontend unavailable. No existing process was stopped.' }
Write-Output 'Demo ready: http://127.0.0.1:5175 | API: http://127.0.0.1:8002 | 15 local draft schemes'
