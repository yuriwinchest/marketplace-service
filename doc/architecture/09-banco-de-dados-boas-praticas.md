# 09 – Banco de Dados: Boas Práticas de Segurança e Escalabilidade (Supabase)

Este documento define **regras obrigatórias e detalhadas** para modelagem, segurança, performance e operação do banco de dados do **ServiçoJá**, utilizando **PostgreSQL gerenciado pelo Supabase Cloud**. Trata-se de um **contrato técnico**.

---

## Objetivo

Garantir que o banco de dados seja:

* Seguro por padrão
* Escalável horizontalmente
* Performático sob carga
* Fácil de manter e auditar
* Preparado para crescimento de usuários, dados e tráfego

---

## Padrões Gerais (Obrigatórios)

* PostgreSQL como fonte de verdade
* Supabase apenas como **infra gerenciada** (não acoplar regras de negócio ao painel)
* Todas as regras sensíveis devem ser protegidas por **RLS**
* Nenhuma tabela em produção sem políticas explícitas

---

## Identificadores (UUID em vez de ID incremental)

### Regra Obrigatória

Todas as tabelas devem utilizar **UUID** como chave primária.

```sql
id uuid primary key default gen_random_uuid()
```

Recomendação:

* Preferir UUID v7 quando disponível (melhor ordenação temporal)

### Motivos Técnicos

* Evita enumeração de registros
* Mais seguro para APIs públicas
* Compatível com sistemas distribuídos
* Integração nativa com Supabase Auth

Nunca usar:

* `SERIAL`
* `BIGSERIAL`
* IDs sequenciais expostos externamente

---

## Convenções de Nomenclatura

### Tabelas

* Sempre no plural
* snake_case

Exemplo:

```sql
users
service_requests
refresh_tokens
```

### Colunas

* snake_case
* nomes explícitos

Exemplo:

```sql
created_at
updated_at
deleted_at
user_id
```

---

## Relacionamentos e Chaves Estrangeiras

### Boas Práticas

* Sempre usar `uuid` como tipo de FK
* Criar índices em **todas** as FKs
* Definir comportamento explícito em deleções

```sql
user_id uuid references users(id) on delete cascade
```

```sql
create index idx_services_user_id on services(user_id);
```

Nunca:

* FK sem índice
* FK sem regra de deleção

---

## Constraints e Integridade

### Obrigatórias

* `not null` quando aplicável
* `unique` para campos sensíveis
* `check` para valores controlados

Exemplo:

```sql
status text check (status in ('open','in_progress','done'))
```

Integridade deve ser garantida **no banco**, não apenas no backend.

---

## Segurança com Row Level Security (RLS)

### Regra Crítica

**Nenhuma tabela em produção pode ficar com RLS desabilitado.**

```sql
alter table users enable row level security;
```

### Padrão de Políticas

* SELECT, INSERT, UPDATE e DELETE devem ser explicitamente definidos
* Políticas simples e legíveis

Exemplo:

```sql
create policy "Users can read own data"
  on users for select
  using (auth.uid() = id);
```

Nunca:

* Usar `true` como política genérica
* Confiar apenas no backend

---

## Separação de Papéis (Roles)

### Roles do Supabase

* `anon` → acesso mínimo
* `authenticated` → acesso controlado via RLS
* `service_role` → **uso exclusivo do backend**

Regra Absoluta:

* Nunca expor `service_role` no frontend

---

## Supabase Auth (Integração Correta)

### Regras

* `auth.users` é a fonte de identidade
* Tabela `users` local deve espelhar o `auth.users`
* Relacionar via `id = auth.uid()`

Nunca:

* Duplicar lógica de autenticação
* Confiar em email como identificador

---

## Senhas, Tokens e Dados Sensíveis

### Regras Obrigatórias

* Nunca armazenar senha em texto plano
* Apenas hash bcrypt
* Refresh tokens isolados

Nunca expor:

* `password_hash`
* `refresh_tokens`
* tokens JWT

---

## Índices e Performance

### Índices Obrigatórios

* Chave primária
* Todas as FKs
* Campos usados em filtros e ordenações

```sql
create index idx_services_status on services(status);
```

Evitar:

* Índices duplicados
* Índices sem análise de uso

---

## Paginação e Queries

### Regras

* Paginação obrigatória em listas
* Limite máximo por página
* Nunca retornar listas completas

Preferir:

* `limit` + `offset` ou cursor-based

---

## Transações

### Uso Obrigatório Quando

* Múltiplas escritas dependentes
* Atualizações críticas

```sql
begin;
-- operações
commit;
```

Nunca deixar consistência apenas no backend.

---

## Views, Functions e RPC

### Diretrizes

* Views apenas para leitura
* Functions apenas quando necessário
* Funções devem ser imutáveis quando possível

Evitar lógica de negócio complexa no banco.

---

## Migrations

### Regras

* Toda alteração via migration
* Nunca alterar schema manualmente em produção
* Versionar no Git
* Migrations idempotentes

---

## Soft Delete

### Padrão

```sql
deleted_at timestamp null
```

* RLS deve ignorar registros deletados
* Deleção física apenas em manutenção controlada

---

## Auditoria e Observabilidade

### Campos Obrigatórios

```sql
created_at timestamp default now(),
updated_at timestamp default now()
```

### Recomendações

* Logs de acesso
* Monitorar queries lentas
* Usar Supabase Metrics

---

## Backup e Recuperação

### Regras

* Backups automáticos habilitados
* Testar restore periodicamente
* Nunca depender apenas do painel

---

## Escalabilidade

### Estratégias

* Backend stateless
* Pool de conexões (pgBouncer)
* Queries simples
* Preparar cache (Redis futuro)

---

## Checklist Obrigatório (Banco de Dados)

* [ ] UUID como PK
* [ ] Convenção de nomes seguida
* [ ] Constraints aplicadas
* [ ] RLS habilitado
* [ ] Políticas explícitas
* [ ] Índices criados
* [ ] Paginação aplicada
* [ ] Dados sensíveis protegidos
* [ ] Migration versionada

---

📌 Este documento é **regra técnica obrigatória**. Qualquer violação deve ser corrigida antes de ir para produção.

=============================

## 10-fluxos-de-negocio-e-dominio.md (ANEXO À ARQUITETURA)

### Visão Macro do Negócio

O ServiçoJá opera como uma **plataforma de intermediação de serviços** com dois fluxos principais coexistindo:

1. **Busca Ativa de Profissionais**
2. **Publicação de Demandas (Marketplace Reverso)**

Esses fluxos compartilham as mesmas entidades, porém com regras de acesso e visibilidade distintas.

---

### Fluxo 1 – Busca Ativa por Categoria e Região

**Objetivo:** permitir que um cliente encontre profissionais antes mesmo de publicar uma demanda.

Passos lógicos:

1. Usuário seleciona **Categoria** (ex: Pedreiro)
2. Usuário seleciona **Região** (Estado → Cidade)
3. Sistema retorna **Profissionais elegíveis**, considerando:

   * Categoria vinculada ao perfil
   * Cidade atendida OU atendimento remoto
   * Assinatura ativa

Regras técnicas:

* Filtro por cidade tem prioridade
* Atendimento remoto ignora cidade
* Profissionais sem assinatura não aparecem em destaque

---

### Fluxo 2 – Publicação de Demanda

**Objetivo:** permitir que o cliente descreva uma necessidade específica.

Dados obrigatórios da demanda:

* Categoria
* Cidade
* Descrição detalhada
* Orçamento estimado
* Alcance (regional ou global)

Regras de visibilidade:

* Regional → apenas profissionais da cidade
* Global → profissionais de qualquer região

---

### Propostas

Profissionais podem:

* Enviar proposta com valor e descrição
* Adaptar a proposta à demanda do cliente

Regras:

* Apenas profissionais com assinatura ativa podem enviar propostas
* Propostas pertencem a uma demanda

---

### Contato entre Usuários

Regra crítica de negócio:

* **Contato direto é bloqueado por padrão**

Contato só é liberado quando:

* Proposta é aceita
* OU profissional possui assinatura ativa

Antes disso:

* Comunicação ocorre apenas dentro da plataforma

---

### Profissionais Remotos (Programadores)

* Podem marcar perfil como **atendimento remoto**
* Ignoram filtro por cidade
* Sempre visíveis em buscas globais

Essa regra é aplicada no **Service**, não no banco.

---

### Monetização (Stripe)

Modelo:

* Cliente não paga
* Profissional paga assinatura mensal (ex: R$ 9,99)

Impacto arquitetural:

* Backend valida status da assinatura
* Stripe é infraestrutura, não regra de negócio

---

📌 Este anexo complementa todos os arquivos de arquitetura existentes e deve ser considerado parte integrante das regras do sistema.

=============================

## ANEXO – Modelagem de Dados Alinhada ao Negócio

### Entidades Principais

#### users

* Representa qualquer usuário autenticado
* Integração direta com `auth.users`

Campos-chave:

* id (uuid)
* email
* role (client | professional)

---

#### professional_profiles

Representa o perfil de quem presta serviços.

Campos:

* user_id (uuid)
* bio
* is_remote
* subscription_status

---

#### categories

Representa modalidades de serviço.

Campos:

* id
* name
* slug

---

#### regions

Hierarquia geográfica.

Campos:

* id
* state
* city

---

#### professional_categories

Relaciona profissionais às categorias.

Campos:

* professional_id
* category_id

---

#### professional_regions

Define onde o profissional atua.

Campos:

* professional_id
* region_id

---

#### service_requests

Demandas publicadas pelos clientes.

Campos:

* id
* category_id
* region_id
* description
* scope (regional | global)

---

#### proposals

Propostas enviadas por profissionais.

Campos:

* id
* service_request_id
* professional_id
* value
* description

---

#### subscriptions

Controle de planos pagos (Stripe).

Campos:

* id
* professional_id
* stripe_subscription_id
* status

---

### Regras de Integridade Importantes

* service_requests.region_id pode ser NULL quando scope = global
* professional_regions ignorado quando is_remote = true
* propostas só podem existir se subscription_status = active

---

📌 Este anexo garante que o banco reflita fielmente as regras de negócio descritas na arquitetura.
