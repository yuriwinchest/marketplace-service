# Revisão de Implementação - O que está faltando

## ✅ O que foi implementado

### Módulos Criados
- ✅ `auth` - Autenticação e registro
- ✅ `users` - Gestão de usuários e perfis
- ✅ `services` - Demandas (service_requests)
- ✅ `categories` - Categorias de serviços
- ✅ `regions` - Regiões geográficas

### Infraestrutura
- ✅ BaseController com métodos padronizados
- ✅ unifiedConfig centralizado
- ✅ Middleware de autenticação
- ✅ Middleware de upload
- ✅ Validação com Zod em todos os endpoints
- ✅ Respostas padronizadas da API

---

## ❌ O que está FALTANDO (baseado na documentação)

### 1. Módulo `proposals` (CRÍTICO)

**Documentação:** `01d-fluxo-tecnico-de-uma-proposta.md`

**Funcionalidades necessárias:**
- [ ] Criar proposta (apenas profissionais com assinatura ativa)
- [ ] Listar propostas de uma demanda (cliente)
- [ ] Listar propostas do profissional
- [ ] Aceitar proposta (muda status da demanda para `in_progress`)
- [ ] Rejeitar proposta
- [ ] Cancelar proposta
- [ ] Validar assinatura ativa antes de criar proposta
- [ ] Evitar múltiplas propostas duplicadas
- [ ] Transação ao aceitar proposta (proposta + demanda)

**Estados necessários:**
- `pending`
- `accepted`
- `rejected`
- `cancelled`

**Validações necessárias:**
- Profissional com assinatura ativa
- Demanda em status `open`
- Profissional elegível para a demanda
- Não permitir múltiplas propostas do mesmo profissional para mesma demanda

---

### 2. Módulo `subscriptions` (CRÍTICO)

**Documentação:** `01b-matriz-de-permissoes-e-visibilidade.md`, `09-banco-de-dados-boas-praticas.md`

**Funcionalidades necessárias:**
- [ ] Verificar status de assinatura (Stripe)
- [ ] Integração com Stripe API
- [ ] Webhook do Stripe para atualizar status
- [ ] Validar assinatura antes de permitir propostas
- [ ] Validar assinatura antes de liberar contato
- [ ] Listar assinaturas do profissional

**Regras de negócio:**
- Apenas profissionais podem ter assinatura
- Assinatura controla:
  - Envio de propostas
  - Visibilidade em buscas
  - Liberação de contato direto

**Integração Stripe:**
- Verificar `subscription_status` no banco
- Sincronizar com Stripe via webhook
- Stripe é **infraestrutura**, não regra de negócio

---

### 3. Módulo `contact` (CRÍTICO)

**Documentação:** `01e-fluxo-tecnico-de-contato-entre-usuarios.md`

**Funcionalidades necessárias:**
- [ ] Endpoint para obter dados de contato
- [ ] Validar se contato pode ser liberado:
  - Proposta aceita (demanda em `in_progress`)
  - OU profissional com assinatura ativa que permite contato
- [ ] Retornar dados sensíveis apenas se autorizado:
  - Telefone
  - E-mail
  - WhatsApp
- [ ] Nunca expor contato em listagens públicas
- [ ] Proteção via RLS no banco

**Regras críticas:**
- Contato **bloqueado por padrão**
- Liberação apenas sob condições específicas
- Backend + RLS como camadas de proteção

---

### 4. Segurança e Infraestrutura

**Documentação:** `06-seguranca-e-escalabilidade.md`

**Faltando:**
- [ ] **Rate limiting** - Proteção contra abuso
- [ ] **Refresh tokens** - Sistema de renovação de tokens
- [ ] **JWT com expiração curta** - Atualmente 7 dias (muito longo)
- [ ] **Logging estruturado** - Para auditoria e debug
- [ ] **Tratamento de erros centralizado** - Error handler mais robusto

**Rate Limiting:**
- Aplicar em todas as rotas públicas
- Limites mais rigorosos em operações caras (busca, criação)
- IP-based e user-based

**Refresh Tokens:**
- Tabela `refresh_tokens` já existe no banco
- Implementar endpoint `/api/auth/refresh`
- Tokens JWT com expiração curta (15min)
- Refresh tokens com expiração longa (7 dias)

---

### 5. Validações de Permissões

**Documentação:** `01b-matriz-de-permissoes-e-visibilidade.md`

**Faltando validações:**
- [ ] **Visibilidade de profissionais** - Apenas clientes podem ver
- [ ] **Visibilidade de demandas** - Profissionais só veem se tiverem assinatura
- [ ] **Validação de papel** - Verificar se é cliente antes de criar demanda
- [ ] **Validação de assinatura** - Antes de permitir propostas
- [ ] **Filtros por categoria/região** - Na busca de profissionais

**Regras de visibilidade:**
- Profissionais: apenas clientes veem (com filtros de categoria/região)
- Demandas: profissionais só veem se tiverem assinatura ativa
- Propostas: cliente vê apenas da própria demanda, profissional vê apenas as suas

---

### 6. Funcionalidades do Módulo `services`

**Documentação:** `01c-fluxo-tecnico-de-uma-demanda.md`

**Faltando:**
- [ ] **Filtros de visibilidade** - Aplicar regras de categoria/região/escopo
- [ ] **Validação de escopo** - Regional vs Global
- [ ] **Atualização de status** - Mudar para `in_progress` quando proposta aceita
- [ ] **Busca de profissionais** - Endpoint para clientes buscarem profissionais
- [ ] **Validação de papel** - Apenas clientes podem criar demandas

---

### 7. Documentação Adicional

**Documentação:** `01-visao-geral-arquitetura.md` menciona 8 arquivos

**Faltando:**
- [ ] `03-solid-na-pratica.md`
- [ ] `04-padroes-de-codigo.md`
- [ ] `05-limite-de-arquivos.md`
- [ ] `06-seguranca-e-escalabilidade.md`
- [ ] `07-organizacao-frontend.md`
- [ ] `08-checklist-de-manutenibilidade.md`

---

## 🔴 Prioridades

### Alta Prioridade (Bloqueadores)
1. **Módulo `proposals`** - Core do negócio
2. **Módulo `subscriptions`** - Necessário para propostas funcionarem
3. **Módulo `contact`** - Necessário para completar o fluxo

### Média Prioridade (Importante)
4. **Rate limiting** - Segurança básica
5. **Refresh tokens** - Segurança e UX
6. **Validações de permissões** - Segurança e regras de negócio

### Baixa Prioridade (Melhorias)
7. **Logging estruturado** - Observabilidade
8. **Documentação adicional** - Manutenibilidade

---

## 📋 Checklist de Implementação

### Proposals
- [ ] Criar estrutura do módulo (controller, service, repository, schema, routes)
- [ ] Implementar criação de proposta com validação de assinatura
- [ ] Implementar listagem de propostas (cliente e profissional)
- [ ] Implementar aceitação de proposta (transação)
- [ ] Implementar rejeição/cancelamento
- [ ] Adicionar validação de proposta duplicada
- [ ] Integrar com módulo de subscriptions

### Subscriptions
- [ ] Criar estrutura do módulo
- [ ] Integrar com Stripe API
- [ ] Implementar webhook do Stripe
- [ ] Criar service para verificar assinatura ativa
- [ ] Adicionar validação em propostas e contato

### Contact
- [ ] Criar estrutura do módulo
- [ ] Implementar endpoint de obtenção de contato
- [ ] Implementar regras de liberação (proposta aceita OU assinatura)
- [ ] Adicionar proteção RLS no banco
- [ ] Garantir que dados sensíveis nunca apareçam em listagens

### Segurança
- [ ] Adicionar rate limiting (express-rate-limit)
- [ ] Implementar refresh tokens
- [ ] Reduzir expiração de JWT para 15 minutos
- [ ] Implementar logging estruturado
- [ ] Melhorar error handler

### Validações
- [ ] Adicionar validação de papel em todas as rotas necessárias
- [ ] Implementar filtros de visibilidade em profissionais
- [ ] Implementar filtros de visibilidade em demandas
- [ ] Adicionar validação de assinatura antes de operações críticas

---

## 🗄️ Problemas no Banco de Dados

### Tabelas Faltando

**Documentação:** `09-banco-de-dados-boas-praticas.md` (Anexo - Modelagem de Dados)

**Tabelas que deveriam existir mas não existem:**
- [ ] **`proposals`** - Propostas de profissionais
  - Campos necessários: id, service_request_id, professional_id, value, description, status
  - Status: pending, accepted, rejected, cancelled
- [ ] **`subscriptions`** - Assinaturas Stripe
  - Campos necessários: id, professional_id, stripe_subscription_id, status
- [ ] **`professional_categories`** - Relação muitos-para-muitos
  - Campos: professional_id, category_id
- [ ] **`professional_regions`** - Regiões atendidas pelo profissional
  - Campos: professional_id, region_id

### Campos Faltando em Tabelas Existentes

**`professional_profiles`:**
- [ ] `is_remote` (boolean) - Se atende remotamente
- [ ] `subscription_status` (text) - Status da assinatura (active, inactive, cancelled)
- [ ] `email` (text) - E-mail do profissional (para contato)
- [ ] `whatsapp` (text) - WhatsApp (para contato)

**`service_requests`:**
- [ ] `scope` (text) - 'regional' ou 'global' (já existe location_scope, verificar se é o mesmo)
- [ ] Status deveria incluir `in_progress` (atualmente só tem: open, matched, closed, cancelled)

**`users`:**
- [ ] `avatar_url` - Já existe na migration 003, verificar se está sendo usado

### Migrations Necessárias

- [ ] Criar migration para tabela `proposals`
- [ ] Criar migration para tabela `subscriptions`
- [ ] Criar migration para tabelas `professional_categories` e `professional_regions`
- [ ] Adicionar campos faltantes em `professional_profiles`
- [ ] Adicionar enum `proposal_status` se necessário
- [ ] Adicionar enum `subscription_status` se necessário
- [ ] Adicionar status `in_progress` ao enum `request_status` ou criar novo enum

### RLS (Row Level Security)

**Documentação:** `09-banco-de-dados-boas-praticas.md`

**Tabelas que precisam de RLS:**
- [ ] `users` - Políticas para leitura/escrita própria
- [ ] `professional_profiles` - Visibilidade controlada
- [ ] `service_requests` - Cliente vê apenas as próprias, profissionais veem conforme regras
- [ ] `proposals` - Profissional vê apenas as suas, cliente vê apenas da própria demanda
- [ ] `subscriptions` - Profissional vê apenas a própria
- [ ] `refresh_tokens` - Usuário acessa apenas os próprios

---

## 📝 Notas Importantes

1. **Stripe é infraestrutura**: A lógica de negócio sobre assinaturas deve estar no backend, não apenas no Stripe
2. **RLS obrigatório**: Todas as tabelas sensíveis devem ter Row Level Security habilitado
3. **Transações**: Operações que alteram múltiplas entidades (aceitar proposta) devem usar transações
4. **Validação em camadas**: Schema (Zod) + Service (regras) + Banco (RLS)
5. **Contato bloqueado por padrão**: Nunca expor dados sensíveis sem validação explícita
6. **Discrepância banco vs documentação**: O banco atual não reflete a modelagem documentada

---

## 🔧 Ações Imediatas Necessárias

### 1. Criar Migrations do Banco
- Criar tabela `proposals` com todos os campos necessários
- Criar tabela `subscriptions` para Stripe
- Adicionar campos faltantes em `professional_profiles`
- Criar tabelas de relacionamento (professional_categories, professional_regions)
- Adicionar/ajustar enums necessários

### 2. Implementar Módulos Faltantes
- Módulo `proposals` (depende da migration)
- Módulo `subscriptions` (depende da migration)
- Módulo `contact` (depende de proposals e subscriptions)

### 3. Configurar RLS
- Habilitar RLS em todas as tabelas sensíveis
- Criar políticas explícitas para cada operação (SELECT, INSERT, UPDATE, DELETE)

---

**Data da Revisão**: 29 de Janeiro de 2026
