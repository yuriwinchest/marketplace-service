# 01b – Matriz de Permissões e Visibilidade

## Finalidade do Documento

Este documento complementa a arquitetura do ServiçoJá definindo, de forma **explícita e técnica**,  
**quem pode ver o quê**, **quem pode fazer o quê** e **em quais condições**.

Este arquivo é um **contrato de permissões do sistema**.

---

## Princípio Central

No ServiçoJá:

- Nada é liberado por padrão
- Toda ação exige uma regra explícita
- Toda visibilidade é controlada
- Permissões são decididas no backend
- O banco aplica segurança adicional (RLS)

---

## Tipos de Usuários

| Tipo | Descrição |
|----|----------|
| Visitante | Não autenticado |
| Cliente | Autenticado, cria demandas |
| Profissional | Possui perfil profissional |
| Profissional Assinante | Profissional com assinatura ativa |

---

## Visibilidade de Profissionais

### Quem pode ver profissionais

| Usuário | Pode ver |
|------|---------|
| Visitante | ✅ Sim |
| Cliente | ✅ Sim |
| Profissional | ❌ Não |
| Profissional Assinante | ❌ Não |

### Critérios aplicados
- Categoria
- Região (cidade)
- Atendimento remoto
- Status da assinatura

A decisão ocorre no **Service**, nunca no frontend.

### Regra de Privacidade (Obrigatória)
- Mesmo quando o profissional for visível para **visitantes** e **clientes**, os dados de contato **NUNCA** devem ser expostos em listagens públicas.
- Em listagens, o backend deve retornar apenas dados públicos (ex.: nome, avatar, descrição, categorias/região, reputação agregada).

---

## Visibilidade de Demandas

| Usuário | Pode ver |
|------|---------|
| Visitante | ✅ Demandas abertas (sem identidade) |
| Cliente | ✅ Apenas as próprias |
| Profissional | ⚠️ Limitado |
| Profissional Assinante | ✅ Completo |

### Regras
- Regional → apenas profissionais da região
- Global → profissionais remotos ou globais

### Identidade de Quem Postou a Demanda
- Em listagens públicas (visitante), a demanda pode ser exibida, mas **NUNCA** deve expor a identidade do cliente (nem `client_id`, nem nome, nem avatar, nem contato).
- Para visualizar “quem postou” a demanda (identidade do cliente), o usuário deve:
  - Estar autenticado; e
  - Ter um **plano ativo** (ex.: profissional com assinatura ativa).

---

## Envio de Propostas

| Usuário | Pode enviar |
|------|-------------|
| Cliente | ❌ Não |
| Profissional | ❌ Não |
| Profissional Assinante | ✅ Sim |

Regras:
- Assinatura ativa obrigatória (plano mensal)
- O profissional deve ter **créditos de proposta** disponíveis no período (quota do plano: `proposal_limit - proposals_used_in_period`)
- Proposta vinculada a uma demanda

---

## Contato Direto

### Regra Crítica

Contato direto é **bloqueado por padrão**.

Contato liberado somente quando existir uma regra explícita. As regras válidas são:
1) **Proposta aceita** (fluxo padrão do marketplace).
2) **Desbloqueio direto pago** de R$ **2,99** para acessar o contato daquele profissional.

Observações obrigatórias:
- O desbloqueio direto é por **profissional** (e opcionalmente pode ser vinculado a uma demanda específica, quando aplicável).
- Visitantes podem **visualizar** profissionais, mas para **desbloquear contato** precisam estar autenticados (para registrar quem pagou e aplicar auditoria).

Antes disso:
- Comunicação apenas pela plataforma

---

## Criação de Demandas

| Usuário | Pode criar |
|------|-----------|
| Visitante | ❌ Não |
| Cliente | ✅ Sim |
| Profissional | ❌ Não |

---

## Assinaturas

- Apenas profissionais podem assinar
- Assinatura controla:
  - Envio de propostas
  - Visibilidade
  - Contato (quando a regra de negócio incluir esse benefício)

## Desbloqueio Direto de Contato (R$ 2,99)

- Qualquer usuário autenticado (ex.: cliente) pode pagar **R$ 2,99** para desbloquear o contato de um profissional específico.
- Esse mecanismo existe para permitir contato fora do fluxo de proposta aceita, mantendo o contato **bloqueado por padrão**.

Stripe é **infraestrutura**, não regra de negócio.

---

## Onde as Regras São Aplicadas

| Camada | Responsabilidade |
|------|------------------|
| Frontend | Exibir/ocultar UI |
| Backend | Decidir permissões |
| Banco | Proteger dados (RLS) |

---

## Erros Arquiteturais Proibidos

- Permissão no frontend
- Contato liberado sem regra
- Acesso direto ao banco
- Ignorar RLS
- Confiar apenas no Stripe

---

## Relação com a Arquitetura

Complementa:
- 01-visao-geral-arquitetura.md  
- 01a-descricao-do-sistema-e-divisao-arquitetural.md  
- 02-organizacao-backend.md  
- 09-banco-de-dados-boas-praticas.md  

---

## Papel do Documento

Se a resposta para  
**“esse usuário pode fazer isso?”**  
não estiver aqui, a funcionalidade **não está definida**.

---

📌 Documento obrigatório do ServiçoJá.
