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
| Visitante | ❌ Não |
| Cliente | ✅ Sim |
| Profissional | ❌ Não |
| Profissional Assinante | ❌ Não |

### Critérios aplicados
- Categoria
- Região (cidade)
- Atendimento remoto
- Status da assinatura

A decisão ocorre no **Service**, nunca no frontend.

---

## Visibilidade de Demandas

| Usuário | Pode ver |
|------|---------|
| Visitante | ❌ Não |
| Cliente | ✅ Apenas as próprias |
| Profissional | ⚠️ Limitado |
| Profissional Assinante | ✅ Completo |

### Regras
- Regional → apenas profissionais da região
- Global → profissionais remotos ou globais

---

## Envio de Propostas

| Usuário | Pode enviar |
|------|-------------|
| Cliente | ❌ Não |
| Profissional | ❌ Não |
| Profissional Assinante | ✅ Sim |

Regras:
- Assinatura ativa obrigatória
- Proposta vinculada a uma demanda

---

## Contato Direto

### Regra Crítica

Contato direto é **bloqueado por padrão**.

Contato liberado somente quando:
- Proposta aceita  
OU  
- Profissional com plano que permita contato

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
  - Contato

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
