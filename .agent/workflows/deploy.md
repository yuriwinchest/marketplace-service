---
description: Deploy completo da aplicação para a VPS (frontend + backend)
---

# Variáveis de referência

- VPS: `root@72.60.53.191`
- Frontend na VPS: `/var/www/fazservico`
- Backend na VPS: `/opt/servicoja/backend`
- Container nginx: `app_02_fazservico`

---

## ORDEM OBRIGATÓRIA (não pular etapas)

### 1. Acessar VPS e deletar o `dist` do backend

```bash
ssh root@72.60.53.191 "rm -rf /opt/servicoja/backend/dist"
```

### 2. Limpar PM2 na VPS

```bash
ssh root@72.60.53.191 "pm2 delete all && pm2 flush"
```

### 3. Deletar `dist` local (frontend e backend)

```powershell
Remove-Item -Recurse -Force .\frontend\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\backend\dist  -ErrorAction SilentlyContinue
```

### 4. Build completo do sistema local

```powershell
# Frontend
Set-Location .\frontend; npm run build; Set-Location ..

# Backend
Set-Location .\backend; npm run build; Set-Location ..
```

### 5. Validar migrations (verificar se há novas)

Checar se existem arquivos novos em `backend/migrations/` que ainda não foram aplicados na VPS.

### 6. Enviar frontend para a VPS

```powershell
scp -r .\frontend\dist\* "root@72.60.53.191:/var/www/fazservico/"
```

Após o SCP, corrigir permissões se necessário:

```bash
ssh root@72.60.53.191 "chmod -R 755 /var/www/fazservico/"
```

### 7. Enviar backend para a VPS

```powershell
scp .\backend\package.json   "root@72.60.53.191:/opt/servicoja/backend/"
scp .\backend\package-lock.json "root@72.60.53.191:/opt/servicoja/backend/"
scp .\backend\.env           "root@72.60.53.191:/opt/servicoja/backend/"
scp -r .\backend\dist        "root@72.60.53.191:/opt/servicoja/backend/"
scp -r .\backend\migrations  "root@72.60.53.191:/opt/servicoja/backend/"
```

### 8. Instalar dependências, rodar migrations e reiniciar PM2

```bash
ssh root@72.60.53.191 "
  cd /opt/servicoja/backend &&
  npm ci --omit=dev &&
  node dist/migrate.js &&
  pm2 start dist/server.js --name servicoja-backend
"
```

### 9. Reiniciar container nginx (se arquivos JS/CSS mudaram)

```bash
ssh root@72.60.53.191 "docker restart app_02_fazservico && sleep 5 && docker ps --filter name=app_02"
```

### 10. Testar endpoints manualmente na VPS

```bash
ssh root@72.60.53.191 "
  curl -s -o /dev/null -w 'Frontend: %{http_code}\n' http://127.0.0.1:4102/ &&
  curl -s -o /dev/null -w 'API health: %{http_code}\n' http://127.0.0.1:4102/api/health &&
  curl -s -o /dev/null -w 'API categories: %{http_code}\n' http://127.0.0.1:4102/api/categories &&
  pm2 list
"
```

### 11. Commit no GitHub (sem secrets)

```bash
git add -A
git commit -m "chore: deploy vX.Y.Z"
git push
```

---

## Script automatizado

Para usar o script de deploy completo:

```powershell
.\deploy.ps1
```

O script segue essa ordem automaticamente. Use-o para deploys de rotina.

---

## ⚠️ Pontos críticos

- **Nunca commitar** `.env` ou chaves de API
- **Permissões da pasta `assets`** devem ser `755` após o SCP (o Docker nginx precisa de leitura)
- **PM2 `--update-env`** é obrigatório para pegar variáveis novas do `.env`
- O `deploy.ps1` já executa tudo isso automaticamente na ordem correta
