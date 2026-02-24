\# Infraestrutura FatoPago na VPS - Documentacao Completa



> \*\*Ultima inspecao:\*\* 2026-02-13

> \*\*IP da VPS:\*\* 72.60.53.191



---



\## 1) Visao Geral da Arquitetura



```

&nbsp;                       INTERNET

&nbsp;                          |

&nbsp;                   \[Firewall: firewalld]

&nbsp;                   (permite: SSH, HTTP, HTTPS)

&nbsp;                          |

&nbsp;                 +--------+--------+

&nbsp;                 |                 |

&nbsp;           :80 (HTTP)        :443 (HTTPS)

&nbsp;                 |                 |

&nbsp;           +-----+-----+    +-----+-----+

&nbsp;           |  TRAEFIK   |    |  TRAEFIK   |

&nbsp;           |  (v3.3)    |    |  (v3.3)    |

&nbsp;           +-----+------+    +-----+------+

&nbsp;                 |                 |

&nbsp;        HTTP->HTTPS redirect      |

&nbsp;                                  |

&nbsp;             +--------------------+--------------------+

&nbsp;             |                    |                    |

&nbsp;    fatopago.com          fazservico.com        horapiaui.com

&nbsp;    www.fatopago.com      www.fazservico.com    www.horapiaui.com

&nbsp;             |                    |                    |

&nbsp;    app\_01\_fatopago       app\_02\_fazservico     horapiaui-frontend

&nbsp;    (nginx:alpine)        (nginx:alpine)        (nginx:alpine)

&nbsp;    porta 4101            porta 4102            + horapiaui-og (node:18)

&nbsp;             |                    |

&nbsp;    /var/www/fatopago/dist  /var/www/fazservico

&nbsp;    (bind mount :ro)        (bind mount :ro)



&nbsp;    +-- Nginx Host (legado) --+

&nbsp;    |  porta 81 (loopback)    |

&nbsp;    |  fallback interno       |

&nbsp;    +--------------------------+



&nbsp;    +-- PM2 (no host) --+

&nbsp;    |  servicoja-backend (porta 5000) |

&nbsp;    |  og-server (porta 3001)         |

&nbsp;    +----------------------------------+

```



---



\## 2) Sistema Operacional e Versoes



| Componente | Versao |

|---|---|

| \*\*SO\*\* | AlmaLinux 9.7 (Moss Jungle Cat) - RHEL-based |

| \*\*Docker\*\* | 29.2.1 |

| \*\*Node.js\*\* (host) | v22.19.0 |

| \*\*npm\*\* (host) | 10.9.3 |

| \*\*Nginx\*\* (host/legado) | 1.20.1 |

| \*\*Nginx\*\* (containers) | nginx:alpine (latest) |

| \*\*Traefik\*\* | v3.3 |

| \*\*PM2\*\* | instalado globalmente no host |

| \*\*Firewall\*\* | firewalld (ativo) |



\### Recursos do Servidor



| Recurso | Valor |

|---|---|

| \*\*RAM\*\* | 16 GB |

| \*\*Disco\*\* | 199 GB (5% usado = ~8.6 GB) |

| \*\*Swap\*\* | Nenhum |



---



\## 3) Docker - Containers em Execucao



| Container | Imagem | Status | Porta | Network | Funcao |

|---|---|---|---|---|---|

| `traefik` | traefik:v3.3 | Up | 0.0.0.0:80, 0.0.0.0:443 | web | Reverse proxy + SSL |

| `app\_01\_fatopago` | nginx:alpine | Up (unhealthy\*) | 127.0.0.1:4101 | web, app\_01\_internal | Serve fatopago.com |

| `app\_02\_fazservico` | nginx:alpine | Up (healthy) | 127.0.0.1:4102 | web, app\_02\_internal | Serve fazservico.com |

| `horapiaui-frontend` | nginx:alpine | Up | - | web | Serve horapiaui.com |

| `horapiaui-og` | node:18-alpine | Up | - | web | OG metadata server |

| `horapiaui-postgres-backup` | postgres:17-alpine | Up (healthy) | 127.0.0.1:5433 | - | Backup PostgreSQL |



> \*O healthcheck do `app\_01\_fatopago` esta "unhealthy" porque tenta `wget http://localhost` mas o container Nginx serve na porta 80 e o healthcheck nao consegue conectar (possivelmente `wget` nao esta disponivel no alpine ou conflito). O site funciona normalmente via Traefik.



\### Docker Networks



| Network | Tipo | Containers |

|---|---|---|

| `web` | bridge (external) | traefik, app\_01\_fatopago, app\_02\_fazservico, horapiaui-frontend, horapiaui-og |

| `app\_01\_internal` | bridge (internal) | app\_01\_fatopago |

| `app\_02\_internal` | bridge (internal) | app\_02\_fazservico |

| `app\_03\_internal` | bridge (internal) | (vazio) |

| `supabase\_network\_fatopago` | bridge | (containers Supabase se existirem) |

| `horapiaui-backup\_default` | bridge | horapiaui-postgres-backup |



---



\## 4) Estrutura de Pastas na VPS



\### `/srv/apps/` - Compose e configs por app



```

/srv/apps/

&nbsp; APP-01\_fatopago.com/

&nbsp;   docker-compose.yml      # Compose do container fatopago

&nbsp;   nginx.conf              # Nginx config montada no container

&nbsp;   nginx.conf.bak.\*        # Backups das configs

&nbsp;   docker-compose.yml.bak\* # Backups do compose

&nbsp; APP-02\_fazservico.com.br/

&nbsp;   docker-compose.yml      # Compose do container fazservico

&nbsp; APP-03\_horapiaui.com/

&nbsp;   (vazio - horapiaui tem compose proprio)

```



\### `/var/www/fatopago/` - Codigo-fonte e dist do FatoPago



```

/var/www/fatopago/          # Owner: nginx:nginx

&nbsp; dist/                     # Build do Vite (servido pelo container)

&nbsp;   index.html

&nbsp;   assets/

&nbsp;     index-BQYWVFG4.css   # CSS bundle (hash)

&nbsp;     index-D-w94XMI.js    # JS bundle (hash)

&nbsp;   \*.png, \*.ico, \*.jpg     # Assets estaticos

&nbsp; src/                      # Codigo-fonte (upload via deploy\_vps.sh)

&nbsp; node\_modules/             # Dependencias (npm install no server)

&nbsp; package.json

&nbsp; package-lock.json

&nbsp; .env                      # Variaveis de ambiente (ATENCAO: perm 755, deveria ser 600)

&nbsp; .env.production

&nbsp; .env.local

&nbsp; scripts/                  # Scripts auxiliares

&nbsp; supabase/                 # Config Supabase

&nbsp; docs/

&nbsp; public/

&nbsp; index.html                # Template Vite

&nbsp; vite.config.ts

&nbsp; tsconfig.json

```



\### `/var/www/fatopago-worker/` - News Worker



```

/var/www/fatopago-worker/

&nbsp; package.json              # Deps: @supabase/supabase-js, rss-parser

&nbsp; node\_modules/

&nbsp; scripts/

&nbsp;   live\_news\_worker.cjs    # Worker principal (roda via PM2)

&nbsp;   news\_ingest.cjs         # Logica de ingestao de noticias

```



\### `/opt/traefik/` - Configuracao Traefik



```

/opt/traefik/

&nbsp; docker-compose.yml        # Compose do Traefik

&nbsp; acme.json                 # Certificados SSL (perm 600, root:root)

&nbsp; dynamic.yml               # Config dinamica antiga (nao usada ativamente)

&nbsp; dynamic.d/                # Diretorio de rotas (FILE PROVIDER)

&nbsp;   00-legacy.yml           # Redirect fazservico IDN (punycode)

&nbsp;   01-horapiaui.yml        # Rotas horapiaui (frontend + og)

&nbsp;   10-fatopago.yml         # Rota fatopago.com

&nbsp;   11-fazservico.yml       # Rota fazservico.com

&nbsp;   \*.bak.\*                 # Backups das configs

```



\### `/etc/nginx/conf.d/` - Nginx Host (legado, porta 81)



```

/etc/nginx/conf.d/

&nbsp; fatopago.com.conf         # VHost fatopago (porta 81, loopback)

&nbsp; fazservico.conf           # VHost fazservico (porta 81, loopback + proxy API :5000)

&nbsp; \*.bak\*                    # Backups

```



---



\## 5) Configuracao Traefik - Como Roteia fatopago.com



\### Traefik docker-compose.yml (`/opt/traefik/docker-compose.yml`)



\- Imagem: `traefik:v3.3`

\- Portas: 80 (HTTP) e 443 (HTTPS)

\- HTTP -> HTTPS redirect automatico

\- SSL via Let's Encrypt (ACME HTTP challenge)

\- Email ACME: horapiaui@gmail.com

\- \*\*File provider por diretorio\*\*: `/opt/traefik/dynamic.d/` (watch=true)

\- \*\*Docker provider desabilitado\*\*: `--providers.docker=false`

\- Network: `web` (external)

\- Extra host: `host.docker.internal:host-gateway` (para acessar servicos do host)



\### Rota fatopago.com (`/opt/traefik/dynamic.d/10-fatopago.yml`)



```yaml

http:

&nbsp; routers:

&nbsp;   fatopago:

&nbsp;     rule: "Host(`fatopago.com`) || Host(`www.fatopago.com`)"

&nbsp;     service: fatopago

&nbsp;     entryPoints: \[websecure]

&nbsp;     middlewares: \[fatopago-www-to-root]

&nbsp;     tls:

&nbsp;       certResolver: myresolver



&nbsp; middlewares:

&nbsp;   fatopago-www-to-root:

&nbsp;     redirectRegex:

&nbsp;       regex: "^https?://www\\\\.fatopago\\\\.com(.\*)$"

&nbsp;       replacement: "https://fatopago.com$1"

&nbsp;       permanent: true



&nbsp; services:

&nbsp;   fatopago:

&nbsp;     loadBalancer:

&nbsp;       servers:

&nbsp;         - url: "http://app\_01\_fatopago:80"

```



\*\*Fluxo:\*\* `fatopago.com` ou `www.fatopago.com` -> Traefik (SSL) -> redirect www para root -> `app\_01\_fatopago:80` (container nginx:alpine) -> serve `/usr/share/nginx/html` (= `/var/www/fatopago/dist` via bind mount)



---



\## 6) Container FatoPago - Docker Compose e Nginx



\### docker-compose.yml (`/srv/apps/APP-01\_fatopago.com/docker-compose.yml`)



```yaml

services:

&nbsp; app:

&nbsp;   image: nginx:alpine

&nbsp;   container\_name: app\_01\_fatopago

&nbsp;   restart: always

&nbsp;   volumes:

&nbsp;     - /var/www/fatopago/dist:/usr/share/nginx/html:ro    # Dist montado read-only

&nbsp;     - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro      # Nginx config customizada

&nbsp;   ports:

&nbsp;     - "127.0.0.1:4101:80"    # Porta local apenas (loopback)

&nbsp;   networks:

&nbsp;     - web                     # Traefik enxerga

&nbsp;     - app\_01\_internal         # Rede interna isolada

&nbsp;   healthcheck:

&nbsp;     test: \["CMD", "wget", "-qO-", "http://localhost"]

&nbsp;     interval: 30s

&nbsp;     timeout: 5s

&nbsp;     retries: 3

&nbsp;   logging:

&nbsp;     driver: json-file

&nbsp;     options:

&nbsp;       max-size: "10m"

&nbsp;       max-file: "3"



networks:

&nbsp; web:

&nbsp;   external: true

&nbsp; app\_01\_internal:

&nbsp;   external: true

```



\### nginx.conf do container (`/srv/apps/APP-01\_fatopago.com/nginx.conf`)



\- Serve `/usr/share/nginx/html` (= dist montado)

\- SPA: `try\_files $uri $uri/ /index.html`

\- Bloqueia `.env` e dotfiles (retorna 404)

\- Bloqueia `/src/` e `/node\_modules/` (retorna 404)

\- `index.html` sem cache (`no-cache, no-store, must-revalidate`)

\- `/assets/` com cache de 30 dias (immutable)

\- Imagens (png, jpg, etc) com cache de 30 dias



---



\## 7) Fluxo de Deploy do FatoPago (Passo a Passo)



\### Deploy Rapido (dia-a-dia): `deploy\_quick.cjs`



Este e o fluxo usado quando o codigo ja mudou e voce quer atualizar a producao:



1\. \*\*No PC local:\*\*

&nbsp;  - Deleta o `dist/` local

&nbsp;  - Roda `npm run build` (tsc + vite -> dist/)

&nbsp;  - Valida que `dist/` foi gerado



2\. \*\*Conecta na VPS via SSH\*\* (credenciais do `.env.local` / `.env`)



3\. \*\*Na VPS (via script):\*\*

&nbsp;  - `rm -rf /var/www/fatopago/dist/\*` (limpa dist antigo)

&nbsp;  - Upload do `dist/` local para `/var/www/fatopago/dist/` via SFTP

&nbsp;  - `chmod -R u=rwX,go=rX /var/www/fatopago/dist/` (permissoes)

&nbsp;  - `pm2 restart fatopago` (ou `npx serve -s dist`)



4\. \*\*O container `app\_01\_fatopago`\*\* ve automaticamente o novo dist (bind mount) e o Nginx serve os novos arquivos.



\*\*Comando:\*\* `node scripts/deploy\_quick.cjs`



\### Deploy Completo (primeira vez / re-provisionamento): `npm run ship`



1\. `npm run pack` -> cria `app.tar` (codigo-fonte sem node\_modules, .env, dist)

2\. `npm run deploy` -> envia para VPS:

&nbsp;  - Upload `app.tar` para `/root/app.tar`

&nbsp;  - Upload `deploy\_vps.sh` para `/root/deploy\_vps.sh`

&nbsp;  - Upload `.env` para `/root/.env\_temp`

&nbsp;  - Executa `deploy\_vps.sh` que:

&nbsp;    - Instala Node.js, PM2, Nginx, Certbot

&nbsp;    - Extrai app.tar em `/var/www/fatopago/`

&nbsp;    - `npm install \&\& npm run build`

&nbsp;    - Configura Nginx e SSL

&nbsp;    - Inicia PM2 e Nginx



\### Porque Deletar e Rebuildar Tudo



O padrao e:

1\. \*\*Deletar dist/ na VPS\*\* -> evita arquivos antigos/modificados

2\. \*\*Deletar dist/ local\*\* -> forca rebuild limpo

3\. \*\*Rebuildar tudo\*\* (`npm run build`)

4\. \*\*Subir dist/ novo\*\* -> servidor sempre roda codigo novo



Isso evita:

\- Codigo antigo persistindo (arquivos com hash antigo)

\- Conflitos entre versoes de assets

\- Cache de bundle desatualizado



---



\## 8) PM2 - Processos no Host



| PM2 ID | Nome | Script | Porta | Diretorio | Status |

|---|---|---|---|---|---|

| 6 | `servicoja-backend` | `/opt/servicoja/backend/dist/server.js` | 5000 | `/opt/servicoja/backend` | online |

| 7 | `og-server` | `/var/www/horapiaui/server/og-server.js` | 3001 | `/var/www/horapiaui` | online |



> \*\*Nota:\*\* O FatoPago NAO usa PM2 para o frontend (e estatico, servido por Nginx no container). O PM2 so e usado para o news worker e para servicos de outros sites.



\### News Worker (fatopago-news)



\- \*\*Diretorio:\*\* `/var/www/fatopago-worker/`

\- \*\*Scripts:\*\* `live\_news\_worker.cjs`, `news\_ingest.cjs`

\- \*\*Deps:\*\* `@supabase/supabase-js`, `rss-parser`

\- \*\*Status atual:\*\* NAO aparece no PM2 list (pode estar parado)

\- \*\*Para iniciar:\*\* `pm2 start "node scripts/live\_news\_worker.cjs" --name fatopago-news --time` (dentro de `/var/www/fatopago-worker/`)



---



\## 9) Portas em Uso na VPS



| Porta | Servico | Bind | Descricao |

|---|---|---|---|

| 22 | sshd | 0.0.0.0 | SSH |

| 80 | docker-proxy (Traefik) | 0.0.0.0 | HTTP -> redirect HTTPS |

| 443 | docker-proxy (Traefik) | 0.0.0.0 | HTTPS (SSL) |

| 81 | nginx (host/legado) | 127.0.0.1 | Nginx legado (interno) |

| 3001 | node (og-server) | 0.0.0.0 | \*\*ATENCAO: exposto publicamente\*\* |

| 4101 | docker-proxy (fatopago) | 127.0.0.1 | Container fatopago (interno) |

| 4102 | docker-proxy (fazservico) | 127.0.0.1 | Container fazservico (interno) |

| 5000 | node (servicoja-backend) | 0.0.0.0 (via \*) | \*\*ATENCAO: exposto publicamente\*\* |

| 5432 | PostgreSQL (host) | 127.0.0.1 | BD local |

| 5433 | docker-proxy (horapiaui-postgres) | 127.0.0.1 | BD backup (interno) |



---



\## 10) Seguranca



\### Firewall (firewalld)



\- \*\*Estado:\*\* ativo

\- \*\*Interface:\*\* eth0

\- \*\*Servicos permitidos:\*\* SSH, HTTP, HTTPS

\- \*\*Portas extras:\*\* nenhuma



\### Observacoes de Seguranca



1\. \*\*`.env` do fatopago tem permissao 755\*\* - deveria ser `600` para proteger credenciais

2\. \*\*Porta 3001 (og-server)\*\* esta exposta publicamente - deveria estar so em loopback

3\. \*\*Porta 5000 (servicoja-backend)\*\* esta exposta publicamente - deveria estar so em loopback ou acessivel via Traefik

4\. \*\*acme.json\*\* esta com permissao correta (600, root:root)



---



\## 11) Comandos Uteis de Manutencao



\### Verificar Status



```bash

\# Containers Docker

docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"



\# Networks

docker network ls



\# PM2

pm2 list



\# Portas abertas

ss -tulpn | head -30



\# Logs do Traefik

docker logs --tail 100 traefik



\# Logs do fatopago container

docker logs --tail 100 app\_01\_fatopago



\# Firewall

firewall-cmd --list-all

```



\### Reiniciar Servicos



```bash

\# Reiniciar container fatopago

docker compose -p app\_01\_fatopago -f /srv/apps/APP-01\_fatopago.com/docker-compose.yml up -d --remove-orphans



\# Reiniciar Traefik

cd /opt/traefik \&\& docker compose up -d



\# Reiniciar PM2

pm2 restart all --update-env



\# Reload Nginx host (legado)

nginx -t \&\& nginx -s reload

```



\### Deploy Manual (sem script)



```bash

\# 1. No PC local: build

rm -rf dist/

npm run build



\# 2. Limpar dist na VPS

ssh root@72.60.53.191 "rm -rf /var/www/fatopago/dist/\*"



\# 3. Upload dist via SCP

scp -r dist/\* root@72.60.53.191:/var/www/fatopago/dist/



\# 4. Ajustar permissoes

ssh root@72.60.53.191 "chown -R nginx:nginx /var/www/fatopago/dist \&\& chmod -R u=rwX,go=rX /var/www/fatopago/dist"

```



\### Backup Antes de Alteracoes



```bash

\# Backup Traefik

cd /opt/traefik

cp -a acme.json "acme.json.bak.$(date +%Y%m%d\_%H%M%S)"

cp -a dynamic.d/10-fatopago.yml "dynamic.d/10-fatopago.yml.bak.$(date +%Y%m%d\_%H%M%S)"



\# Backup Nginx config do container

cp -a /srv/apps/APP-01\_fatopago.com/nginx.conf "/srv/apps/APP-01\_fatopago.com/nginx.conf.bak.$(date +%Y%m%d\_%H%M%S)"

```



---



\## 12) Scripts de Deploy Disponiveis (no repo local)



| Script | Comando | Funcao |

|---|---|---|

| `scripts/deploy\_quick.cjs` | `node scripts/deploy\_quick.cjs` | Build local + upload dist + restart PM2 |

| `scripts/pack\_app.cjs` | `npm run pack` | Cria app.tar do codigo-fonte |

| `scripts/remote\_deploy.cjs` | `npm run deploy` | Envia app.tar + provisiona VPS |

| `scripts/upload\_dist.cjs` | `node scripts/upload\_dist.cjs` | So upload dist (sem build local) |

| `scripts/restart\_vps.cjs` | `node scripts/restart\_vps.cjs` | Restart PM2 + reload Nginx |

| `scripts/check\_vps.cjs` | `node scripts/check\_vps.cjs` | Verifica status da VPS |

| `scripts/check\_vps\_assets.cjs` | `node scripts/check\_vps\_assets.cjs` | Verifica assets no dist |

| `scripts/check\_vps\_ports.cjs` | `node scripts/check\_vps\_ports.cjs` | Audita portas abertas |

| `scripts/audit\_vps\_security.cjs` | `node scripts/audit\_vps\_security.cjs` | Auditoria de seguranca |

| `scripts/harden\_vps\_firewall\_and\_perms.cjs` | `node scripts/harden\_vps\_firewall\_and\_perms.cjs` | Aplica hardening de firewall/perms |

| `scripts/update\_vps\_env.cjs` | `node scripts/update\_vps\_env.cjs` | Atualiza .env na VPS |

| `scripts/provision\_news\_worker\_vps.cjs` | `node scripts/provision\_news\_worker\_vps.cjs` | Provisiona news worker |

| `scripts/update\_news\_ingest\_vps.cjs` | `node scripts/update\_news\_ingest\_vps.cjs` | Atualiza codigo do news worker |

| `scripts/start\_news\_worker\_vps.cjs` | `node scripts/start\_news\_worker\_vps.cjs` | Restart news worker |



---



\## 13) Resumo: Como o FatoPago Esta Estruturado



1\. \*\*Frontend React SPA\*\* buildado com Vite (TypeScript)

2\. \*\*Build gera `dist/`\*\* com `index.html` + bundles JS/CSS com hash + assets

3\. \*\*Na VPS\*\*, o `dist/` fica em `/var/www/fatopago/dist/`

4\. \*\*Container Docker `app\_01\_fatopago`\*\* (nginx:alpine) monta esse dist como volume read-only

5\. \*\*Traefik\*\* recebe o trafego HTTPS e encaminha para o container na network `web`

6\. \*\*Isolamento\*\*: cada site tem seu proprio container, network interna, e compose separado

7\. \*\*Deploy\*\*: build local -> limpa dist remoto -> upload novo dist -> container ja serve automaticamente

8\. \*\*Sem backend proprio\*\*: fatopago usa Supabase para BD/auth e Edge Functions para APIs (Mercado Pago PIX, etc.)

