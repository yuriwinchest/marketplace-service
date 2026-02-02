# 01d – Fluxo Técnico de uma Proposta (End-to-End)

## Finalidade do Documento

Este documento descreve, de forma **técnica, detalhada e verificável**, o fluxo completo
de envio, validação, visibilidade e aceitação de uma **proposta de serviço** no ServiçoJá.

Ele complementa:
- 01-visao-geral-arquitetura.md
- 01a-descricao-do-sistema-e-divisao-arquitetural.md
- 01b-matriz-de-permissoes-e-visibilidade.md
- 01c-fluxo-tecnico-de-uma-demanda.md

---

## Visão Geral do Fluxo

Uma proposta representa a **intenção formal de um profissional** em atender
uma demanda publicada por um cliente.

Ela é o principal ponto de monetização da plataforma.

---

## Pré-requisitos para Enviar uma Proposta

- Usuário autenticado
- Papel: **Profissional**
- Perfil profissional ativo
- Assinatura ativa
- Demanda visível para o profissional

Todos os requisitos são validados no **backend**.

---

## Etapa 1 – Ação no Frontend

O profissional acessa uma demanda visível e informa:
- Valor proposto
- Descrição da proposta
- Prazo estimado (quando aplicável)

O frontend:
- Valida apenas formato básico
- Envia os dados para a API

O frontend **não valida**:
- Assinatura
- Permissão
- Elegibilidade

---

## Etapa 2 – Controller (Backend)

Responsabilidades:
- Receber a requisição HTTP
- Encaminhar dados para validação

Regras:
- Nenhuma lógica de negócio
- Nenhum acesso direto ao banco

---

## Etapa 3 – Schema (Validação)

Valida:
- Campos obrigatórios
- Tipos e limites de valor
- Texto mínimo da proposta

Dados inválidos **não avançam no fluxo**.

---

## Etapa 4 – Service (Regras de Negócio)

Decisões tomadas no service:
- Verificar papel do usuário
- Verificar assinatura ativa
- Verificar se a demanda está aberta
- Verificar se o profissional é elegível
- Evitar múltiplas propostas duplicadas

Todas as regras críticas vivem aqui.

---

## Etapa 5 – Repository (Persistência)

Responsável por:
- Criar a proposta no banco
- Garantir relacionamento com demanda e profissional

O repository:
- Executa queries
- Não aplica regras
- Não decide fluxo

---

## Etapa 6 – Banco de Dados (Persistência + Segurança)

No banco:
- A proposta é persistida com UUID
- Relacionamentos são garantidos por FK
- RLS garante que:
  - Profissional vê apenas suas propostas
  - Cliente vê propostas da própria demanda

O banco atua como **barreira final de segurança**.

---

## Etapa 7 – Notificação ao Cliente

Após criação:
- Cliente é notificado (futuro)
- Proposta aparece no painel do cliente

A visibilidade é controlada pelo backend e RLS.

---

## Etapa 8 – Aceitação da Proposta

Quando o cliente aceita:
- Status da proposta muda para `accepted`
- Status da demanda muda para `in_progress`
- Contato direto é liberado

Essas alterações ocorrem **em transação única**.

---

## Estados Possíveis de uma Proposta

- pending
- accepted
- rejected
- cancelled

Mudanças de estado:
- Somente via service
- Nunca diretamente no repository

---

## Erros Arquiteturais Proibidos

- Enviar proposta sem assinatura
- Permitir múltiplas propostas duplicadas
- Aceitar proposta no frontend
- Alterar status sem transação
- Ignorar RLS

---

## Benefícios do Fluxo

- Monetização segura
- Controle total de permissões
- Rastreabilidade
- Escalabilidade
- Facilidade de manutenção

---

## Papel deste Documento

Este arquivo responde à pergunta:

> “O que acontece quando um profissional envia uma proposta?”

Se o comportamento não estiver aqui, **ele não está definido**.

---

📌 Documento complementar obrigatório da arquitetura do ServiçoJá.
