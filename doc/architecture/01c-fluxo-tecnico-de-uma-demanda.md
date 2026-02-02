# 01c – Fluxo Técnico de uma Demanda (End-to-End)

## Finalidade do Documento

Este documento descreve, de forma **técnica e detalhada**, o fluxo completo de criação,
processamento e visibilidade de uma **demanda de serviço** no ServiçoJá.

Ele complementa:
- 01-visao-geral-arquitetura.md
- 01a-descricao-do-sistema-e-divisao-arquitetural.md
- 01b-matriz-de-permissoes-e-visibilidade.md

---

## Visão Geral do Fluxo

Uma demanda representa uma **necessidade real de um cliente** e é o ponto central
do marketplace reverso do ServiçoJá.

O fluxo envolve:
- Frontend
- Backend (Controller, Schema, Service, Repository)
- Banco de Dados (com RLS)

---

## Pré-requisitos para Criar uma Demanda

- Usuário autenticado
- Papel: **Cliente**
- Categoria válida
- Região válida (exceto quando escopo global)

Nenhum desses requisitos é validado apenas no frontend.

---

## Etapa 1 – Ação no Frontend

O cliente preenche o formulário de demanda com:
- Categoria
- Cidade (ou escopo global)
- Descrição detalhada
- Orçamento estimado

O frontend:
- Valida apenas formato básico (UX)
- Envia os dados para a API

O frontend **não decide**:
- Quem verá a demanda
- Se a demanda é válida do ponto de vista de negócio

---

## Etapa 2 – Controller (Backend)

Responsabilidades:
- Receber a requisição HTTP
- Encaminhar os dados para validação

Regras:
- Nenhuma lógica de negócio
- Nenhum acesso direto ao banco

O controller apenas orquestra o fluxo.

---

## Etapa 3 – Schema (Validação)

Responsável por validar:
- Tipos
- Campos obrigatórios
- Valores permitidos

Exemplos:
- Categoria deve existir
- Escopo deve ser `regional` ou `global`
- Descrição não pode ser vazia

Dados inválidos **não chegam ao service**.

---

## Etapa 4 – Service (Regras de Negócio)

Aqui ocorre a lógica central da demanda.

Decisões tomadas:
- Verificar se o usuário é cliente
- Definir escopo da demanda (regional ou global)
- Associar corretamente categoria e região
- Aplicar regras futuras (ex: limite de demandas)

O service **não conhece** banco nem HTTP.

---

## Etapa 5 – Repository (Persistência)

Responsável por:
- Inserir a demanda no banco
- Retornar a entidade persistida

O repository:
- Executa apenas queries
- Não valida regras
- Não decide permissões

---

## Etapa 6 – Banco de Dados (Persistência + Segurança)

No banco:
- A demanda é salva com UUID
- Campos de auditoria são preenchidos
- RLS garante que:
  - Apenas o dono pode ver a própria demanda
  - Apenas profissionais elegíveis verão a demanda

O banco atua como **camada final de proteção**.

---

## Etapa 7 – Visibilidade para Profissionais

A visibilidade depende de:
- Categoria da demanda
- Escopo (regional ou global)
- Região
- Atendimento remoto
- Assinatura ativa

Essas regras são aplicadas:
- No Service (lógica)
- No Banco (RLS)

Nunca no frontend.

---

## Etapa 8 – Retorno ao Cliente

O backend retorna:
- Demanda criada com sucesso
- Identificador da demanda
- Status inicial

O frontend apenas exibe o resultado.

---

## Estados Possíveis de uma Demanda

- open
- in_progress
- completed
- cancelled

A mudança de estado ocorre **exclusivamente no service**.

---

## Erros Arquiteturais Proibidos

- Criar demanda sem validação de papel
- Definir visibilidade no frontend
- Ignorar escopo regional/global
- Acessar banco fora do repository
- Bypassar RLS

---

## Benefícios deste Fluxo

- Segurança previsível
- Fácil manutenção
- Escalabilidade
- Clareza de responsabilidades
- Redução de bugs lógicos

---

## Papel deste Documento

Este arquivo responde à pergunta:

> “O que realmente acontece quando alguém cria uma demanda?”

Se algo não estiver descrito aqui, **o comportamento não está definido**.

---

📌 Documento complementar obrigatório da arquitetura do ServiçoJá.
