# 🛡️ Segurança e Escalabilidade

Diretrizes implementadas para garantir que a aplicação seja segura e escale conforme a demanda.

## 🔒 Segurança

### 1. Autenticação e Autorização

- **JWT (JSON Web Tokens):** Stateless, usado para autenticar requisições.
- **Refresh Tokens:** Access tokens expiram em 15min. Refresh tokens (no banco) duram 7 dias e permitem revogação imediata em caso de comprometimento.
- **RBAC (Role-Based Access Control):** Verificação de papéis (`client` vs `professional`) em Middlewares ou Services.

### 2. Validação de Input

- **Zod:** Previne injeção de dados malformados e garante que apenas dados esperados cheguem ao Service.
- **SQL Injection:** Prevenido via uso estrito de Parameterized Queries no `pg`.

### 3. Proteção HTTP

- **Helmet:** Middleware que configura headers HTTP de segurança (HSTS, No-Sniff, XSS Filter, etc).
- **CORS:** Configurado restritivamente para permitir apenas origens confiáveis (definidas em `.env`).

### 4. Rate Limiting

- Implementado para prevenir abuso e ataques DDoS/Brute Force.
- **Strict Limit:** 10 req/min para rotas sensíveis.
- **Auth Limit:** 5 req/min para login/register.
- **General Limit:** 100 req/min para APIs gerais.

### 5. Dados Sensíveis

- **Senhas:** Hashed com `bcrypt` antes de salvar. Nunca trafegam em texto plano (exceto no login SSL/TLS).
- **Row Level Security (RLS):** Policies no PostgreSQL garantem que usuários só acessem seus próprios dados, servindo como "Rede de Segurança" caso o backend falhe na lógica.

---

## 🚀 Escalabilidade

### 1. Stateless Backend

- O servidor não guarda estado de sessão em memória.
- Qualquer instância do backend pode atender qualquer requisição (desde que validado o JWT).
- Permite escalar horizontalmente (adicionar mais servidores/containers) facilmente.

### 2. Banco de Dados Otimizado

- **Índices:** Criados em todas as Foreign Keys e colunas de busca frequente (`created_at`, `email`).
- **Connection Pooling:** Usamos o `Pool` do `pg` para reaproveitar conexões e não saturar o banco.

### 3. Separação de Responsabilidades

- Uploads de arquivos são servidos estaticamente (em produção, devem ir para S3/CDN).
- Lógica pesada é isolada em Services, facilitando migração para microserviços/serverless se necessário no futuro.

### 4. Design Assíncrono

- Uso de Node.js (Non-blocking I/O) permite lidar com alta concorrência de requisições I/O bound.
- Notificações e tarefas pesadas podem ser movidas para Filas (Bull/RabbitMQ) no futuro sem refatorar toda a arquitetura.
