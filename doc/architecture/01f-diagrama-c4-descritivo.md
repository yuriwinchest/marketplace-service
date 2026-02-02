# 01f – Diagrama C4 Descritivo (Contexto e Containers)

## Finalidade do Documento

Este documento descreve a arquitetura do ServiçoJá utilizando o **modelo C4**
de forma **textual**, servindo como base para:
- Entendimento rápido do sistema
- Onboarding de desenvolvedores
- Comunicação técnica clara
- Evolução futura para diagramas visuais

Este arquivo complementa toda a arquitetura existente.

---

## Visão Geral do Modelo C4

O modelo C4 divide a arquitetura em níveis:

1. **Contexto** – O sistema no ecossistema
2. **Containers** – Principais partes executáveis
3. **Componentes** – Internos do sistema (documentados em outros arquivos)
4. **Código** – Implementação (fora do escopo deste documento)

Este documento cobre **Contexto e Containers**.

---

## Nível 1 – Diagrama de Contexto

### Sistema Principal

**ServiçoJá**  
Plataforma digital de intermediação de serviços entre clientes e profissionais.

---

### Atores Externos

#### Cliente
- Pessoa que precisa contratar um serviço
- Interage via navegador ou aplicativo
- Cria demandas e aceita propostas

#### Profissional
- Pessoa que presta serviços
- Possui perfil profissional
- Envia propostas e gerencia contatos

---

### Sistemas Externos Integrados

#### Supabase
- Autenticação de usuários
- Banco de dados PostgreSQL
- Aplicação de Row Level Security (RLS)

#### Stripe
- Gerenciamento de assinaturas
- Cobrança recorrente
- Status de pagamento

---

### Relações (Contexto)

- Cliente → ServiçoJá: cria demandas, aceita propostas
- Profissional → ServiçoJá: envia propostas, gerencia perfil
- ServiçoJá → Supabase: autenticação e persistência
- ServiçoJá → Stripe: verificação de assinatura

---

## Nível 2 – Diagrama de Containers

### Container: Frontend Web

**Tecnologia**
- React
- TypeScript
- Vite

**Responsabilidades**
- Interface do usuário
- Navegação por categorias e regiões
- Envio de ações para API

**Não faz**
- Regras de negócio
- Decisão de permissões
- Acesso direto ao banco

---

### Container: Backend API

**Tecnologia**
- Node.js
- Express
- TypeScript

**Responsabilidades**
- Regras de negócio
- Controle de permissões
- Orquestração de fluxos
- Integração com Supabase e Stripe

**Características**
- Stateless
- Arquitetura por domínios
- SOLID aplicado

---

### Container: Banco de Dados

**Tecnologia**
- PostgreSQL (Supabase)

**Responsabilidades**
- Persistência dos dados
- Integridade referencial
- Segurança via RLS

**Características**
- UUID como PK
- Políticas explícitas
- Segurança em profundidade

---

### Container: Serviços Externos

#### Supabase Auth
- Autenticação
- Identidade dos usuários

#### Stripe API
- Assinaturas
- Pagamentos
- Webhooks

---

## Fluxo de Comunicação entre Containers

```text
Usuário
  ↓
Frontend
  ↓ HTTP
Backend API
  ↓ SQL / Auth
Banco de Dados (Supabase)
