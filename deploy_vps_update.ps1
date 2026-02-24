# Configurações
$VPS_IP = "72.60.53.191"
$VPS_USER = "root"
$VPS_PASS = "Yuri@20262026"
$BACKEND_PORT = 5001

Write-Host ">>> Iniciando Deploy para VPS $VPS_IP..." -ForegroundColor Cyan

# 1. Preparar Diretórios Remotos
Write-Host ">>> [REMOTO] Criando diretórios..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no root@${VPS_IP} "mkdir -p /var/www/fazservico/dist && mkdir -p /opt/servicoja/backend"
if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao criar diretórios remotos"; exit 1 }

# 2. Upload Frontend
Write-Host ">>> [UPLOAD] Frontend dist..." -ForegroundColor Green
Set-Location "frontend"
scp -o StrictHostKeyChecking=no -r "dist\*" root@${VPS_IP}:/var/www/fazservico/dist/
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no upload do Frontend"; exit 1 }

# 3. Upload Backend
Write-Host ">>> [UPLOAD] Backend dist..." -ForegroundColor Green
Set-Location "..\backend"
scp -o StrictHostKeyChecking=no -r "dist" root@${VPS_IP}:/opt/servicoja/backend/
scp -o StrictHostKeyChecking=no "package.json" root@${VPS_IP}:/opt/servicoja/backend/
scp -o StrictHostKeyChecking=no "package-lock.json" root@${VPS_IP}:/opt/servicoja/backend/
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no upload do Backend"; exit 1 }
Set-Location ".."

# 4. Configurar e Restartar Serviços
Write-Host ">>> [REMOTO] Configurando e restartando serviços..." -ForegroundColor Cyan
$remoteScript = @"
set -e

echo '>>> [REMOTO] Parando backend antigo...'
pkill -f 'node dist/server.js' || true

cd /opt/servicoja/backend

echo '>>> [REMOTO] Configurando .env...'
cat > .env <<EOF
PORT=$BACKEND_PORT
NODE_ENV=production
DB_HOST=db.wkinsmogblmfobyldijc.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Yuri@20262026202
JWT_SECRET=dev_secret_change_me
JWT_REFRESH_SECRET=prod_refresh_secret_secure
EOF

echo '>>> [REMOTO] Instalando dependencias...'
npm ci --production

echo '>>> [REMOTO] Iniciando Backend...'
nohup npm start > backend.log 2>&1 &

echo '>>> [REMOTO] Aguardando inicialização...'
sleep 5

if pgrep -f 'node dist/server.js' > /dev/null; then
    echo '>>> [REMOTO] Backend rodando na porta $BACKEND_PORT'
else
    echo '>>> [REMOTO] ERRO: Backend falhou ao iniciar.'
    tail -n 20 backend.log
    exit 1
fi

echo '>>> [REMOTO] Reiniciando Nginx...'
systemctl restart nginx

echo '>>> [REMOTO] DEPLOY FINALIZADO COM SUCESSO!'
"@

ssh -o StrictHostKeyChecking=no root@${VPS_IP} $remoteScript
if ($LASTEXITCODE -ne 0) { Write-Error "Falha na execução remota"; exit 1 }

Write-Host ">>> Deploy Concluído." -ForegroundColor Green
