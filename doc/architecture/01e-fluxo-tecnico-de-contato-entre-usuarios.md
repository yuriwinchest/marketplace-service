# 01e – Fluxo Técnico de Contato entre Usuários

## Finalidade do Documento

Este documento descreve, de forma **técnica e normativa**, como funciona o
**contato entre clientes e profissionais** no ServiçoJá.

O contato é uma funcionalidade **sensível**, diretamente ligada a:
- Segurança
- Monetização
- Controle de abuso
- Valor do negócio

Este fluxo **nunca é livre por padrão**.

---

## Princípio Central do Contato

No ServiçoJá:

- ❌ Não existe contato direto aberto
- ✅ Contato é liberado apenas sob condições específicas
- ✅ Toda liberação passa por regra de negócio
- ✅ Banco e backend participam da proteção

---

## Tipos de Contato Existentes

O sistema suporta dois tipos de comunicação:

1. **Comunicação interna da plataforma**
2. **Contato direto (telefone, WhatsApp, e-mail)**

O segundo é **bloqueado por padrão**.

---

## Comunicação Interna (Sempre Permitida)

Antes da liberação do contato direto:

- Cliente e profissional se comunicam apenas via sistema
- Mensagens são mediadas pela plataforma
- Nenhum dado sensível é exposto

Essa comunicação:
- Não revela telefone
- Não revela e-mail
- Não revela links externos

---

## Pré-requisitos para Liberação de Contato Direto

O contato direto só pode ser liberado quando **pelo menos uma condição for atendida**:

### Condição 1 – Proposta Aceita
- Cliente aceita uma proposta
- Demanda entra em estado `in_progress`

### Condição 2 – Profissional com Assinatura Elegível
- Profissional possui assinatura ativa
- Plano permite contato direto

Se nenhuma condição for atendida → **contato permanece bloqueado**.

---

## Etapa 1 – Tentativa de Contato

Quando um usuário tenta acessar dados de contato:

- A requisição é enviada ao backend
- O frontend **não possui os dados sensíveis**
- Nenhum dado vem pré-carregado

---

## Etapa 2 – Service (Regra de Negócio)

O service valida:

- Identidade do solicitante
- Papel do usuário
- Relação com a demanda
- Status da proposta
- Status da assinatura

Somente se a regra for satisfeita, o fluxo continua.

---

## Etapa 3 – Banco de Dados (Proteção Final)

Mesmo com backend autorizando:

- RLS garante que apenas usuários elegíveis vejam os dados
- Dados sensíveis nunca são retornados para usuários não autorizados

O banco atua como **última barreira de segurança**.

---

## Etapa 4 – Exibição no Frontend

Somente após autorização completa:
- Dados de contato são retornados
- Frontend exibe as informações

O frontend **não armazena** esses dados.

---

## Dados Considerados Sensíveis

- Telefone
- E-mail
- WhatsApp
- Links externos

Esses dados:
- Nunca aparecem em listagens públicas
- Nunca aparecem em buscas
- Nunca são retornados sem regra explícita

---

## Erros Arquiteturais Proibidos

- Expor contato no frontend
- Retornar contato em listagens
- Liberar contato sem proposta aceita ou plano
- Confiar apenas no backend (sem RLS)
- Salvar dados sensíveis em cache público

---

## Benefícios do Modelo

- Proteção contra spam
- Valorização da assinatura
- Segurança dos usuários
- Controle total do fluxo
- Escalabilidade sem risco

---

## Relação com Outros Documentos

Este documento complementa:
- 01-visao-geral-arquitetura.md
- 01a-descricao-do-sistema-e-divisao-arquitetural.md
- 01b-matriz-de-permissoes-e-visibilidade.md
- 01c-fluxo-tecnico-de-uma-demanda.md
- 01d-fluxo-tecnico-de-uma-proposta.md

---

## Papel deste Documento

Este arquivo responde à pergunta:

> “Quando e como usuários podem trocar contato direto?”

Se a resposta não estiver aqui, **o comportamento não está autorizado**.

---

📌 Documento complementar obrigatório da arquitetura do ServiçoJá.
