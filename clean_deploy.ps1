# Configurações
$VPS_IP = "72.60.53.191"

Write-Host ">>> Iniciando Clean Deploy..." -ForegroundColor Cyan

# 1. Upload Frontend
Write-Host ">>> [UPLOAD] Frontend dist..." -ForegroundColor Green
scp -o StrictHostKeyChecking=no -r "frontend\dist\*" root@${VPS_IP}:/var/www/fazservico/dist/
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no upload do Frontend"; exit 1 }

# 2. Upload Backend
Write-Host ">>> [UPLOAD] Backend dist..." -ForegroundColor Green
scp -o StrictHostKeyChecking=no -r "backend\dist" root@${VPS_IP}:/opt/servicoja/backend/
scp -o StrictHostKeyChecking=no "backend\package.json" root@${VPS_IP}:/opt/servicoja/backend/
scp -o StrictHostKeyChecking=no "backend\package-lock.json" root@${VPS_IP}:/opt/servicoja/backend/
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no upload do Backend"; exit 1 }

# 3. Upload Configs
Write-Host ">>> [UPLOAD] Configs..." -ForegroundColor Green
scp -o StrictHostKeyChecking=no "docker-compose.yml" root@${VPS_IP}:/srv/apps/APP-02_fazservico.com.br/docker-compose.yml
scp -o StrictHostKeyChecking=no "nginx_container.conf" root@${VPS_IP}:/srv/apps/APP-02_fazservico.com.br/nginx.conf

# 4. Remote commands
Write-Host ">>> [REMOTO] Restartando serviços..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no root@${VPS_IP} "cd /opt/servicoja/backend && npm ci --production && pm2 delete 6 || true && pm2 start dist/server.js --name servicoja-backend --port 5000 && cd /srv/apps/APP-02_fazservico.com.br/ && docker compose down && docker compose up -d"

Write-Host ">>> Sucesso." -ForegroundColor Green
