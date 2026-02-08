<#
.SYNOPSIS
    Deploy example (safe to commit)

.DESCRIPTION
    Copy this file to `deploy.ps1` (ignored by git) and fill in your values OR set env vars.
    This file intentionally contains NO secrets.
#>

$VPS_IP = $env:VPS_IP
$VPS_USER = $env:VPS_USER
$REMOTE_FRONT_PATH = $env:REMOTE_FRONT_PATH
$REMOTE_BACK_PATH = $env:REMOTE_BACK_PATH

if (-not $VPS_IP) { throw "Missing VPS_IP env var" }
if (-not $VPS_USER) { throw "Missing VPS_USER env var" }
if (-not $REMOTE_FRONT_PATH) { $REMOTE_FRONT_PATH = "/var/www/fazservico" }
if (-not $REMOTE_BACK_PATH) { $REMOTE_BACK_PATH = "/opt/servicoja/backend" }

Write-Host ">>> Deploy for $VPS_USER@$VPS_IP" -ForegroundColor Cyan

# --- FRONTEND ---
Write-Host "`n>>> [1/6] FRONTEND: Clean build..." -ForegroundColor Cyan
if (Test-Path ".\\frontend\\dist") { Remove-Item -Recurse -Force ".\\frontend\\dist" }

Push-Location ".\\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Frontend build failed" }
Pop-Location

Write-Host "`n>>> [2/6] FRONTEND: Upload..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_IP" "rm -rf $REMOTE_FRONT_PATH/*"
scp -r .\\frontend\\dist\\* "$VPS_USER@${VPS_IP}:$REMOTE_FRONT_PATH/"

# --- BACKEND ---
Write-Host "`n>>> [3/6] BACKEND: Build local..." -ForegroundColor Cyan
Push-Location ".\\backend"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Backend build failed" }
Pop-Location

Write-Host "`n>>> [4/6] BACKEND: Upload dist + package files..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_IP" "mkdir -p $REMOTE_BACK_PATH"
scp .\\backend\\package.json "$VPS_USER@${VPS_IP}:$REMOTE_BACK_PATH/"
scp .\\backend\\package-lock.json "$VPS_USER@${VPS_IP}:$REMOTE_BACK_PATH/"
scp -r .\\backend\\dist "$VPS_USER@${VPS_IP}:$REMOTE_BACK_PATH/"

Write-Host "`n>>> [5/6] BACKEND: Install and restart..." -ForegroundColor Cyan
Write-Host "NOTE: backend/.env is NOT uploaded by this example. Upload it with a separate secure step." -ForegroundColor Yellow

$remoteCommand = @"
set -e
cd $REMOTE_BACK_PATH
npm ci --omit=dev
pm2 restart servicoja-backend --update-env || pm2 start dist/server.js --name servicoja-backend
"@

ssh "$VPS_USER@$VPS_IP" $remoteCommand

Write-Host "`n>>> [6/6] DONE" -ForegroundColor Green

