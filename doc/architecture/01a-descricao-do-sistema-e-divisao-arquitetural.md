# 01a – Descrição do Sistema e Divisão Arquitetural

## Finalidade deste Documento

Este documento **complementa diretamente** o arquivo `01-visao-geral-arquitetura.md`.

Enquanto o arquivo 01 define **os princípios e a base arquitetural**, este documento descreve de forma clara e técnica:

- O que o ServiçoJá faz como sistema
- Quais problemas ele resolve
- Como o software está dividido em partes
- Onde cada responsabilidade deve existir

Este arquivo serve como **ponte entre negócio e arquitetura técnica**.

---

## Visão Geral do Sistema

O **ServiçoJá** é uma plataforma digital de intermediação de serviços que conecta:

- **Clientes**, que possuem demandas reais de serviços
- **Profissionais**, que oferecem serviços em diferentes categorias

O sistema foi projetado para funcionar como um **marketplace reverso**, onde:
- O cliente publica uma necessidade
- Profissionais elegíveis enviam propostas
- O contato é controlado por regras claras

---

## Problema que o Sistema Resolve

Antes do ServiçoJá:
- Clientes não sabem onde encontrar profissionais confiáveis
- Profissionais têm dificuldade em encontrar demandas qualificadas
- Contatos diretos geram spam e desvalorização do serviço

O ServiçoJá resolve isso ao:
- Centralizar demandas
- Controlar visibilidade
- Monetizar o acesso profissional
- Proteger ambas as partes

---

## Tipos de Serviço Suportados

O sistema suporta dois modelos de prestação:

### Serviços Locais
- Dependem de cidade/região
- Ex: pedreiro, eletricista, pintor

### Serviços Remotos
- Independem de localização
- Ex: programadores, designers

Essa distinção é tratada **por regra de negócio**, não por duplicação de entidades.

---

## Divisão Geral da Arquitetura

O ServiçoJá é dividido em **quatro grandes camadas**, com responsabilidades não sobrepostas.

---

## Camada de Apresentação (Frontend)

Responsável por:
- Interface do usuário
- Navegação por categorias e regiões
- Criação de demandas
- Visualização de propostas

Limitações:
- Não contém regras de negócio
- Não decide permissões
- Não acessa banco de dados

O frontend apenas **reflete decisões** do backend.

---

## Camada de Aplicação e Domínio (Backend)

Responsável por:
- Regras de negócio
- Controle de permissões
- Orquestração dos fluxos principais
- Integração com serviços externos

Exemplos de decisões tomadas aqui:
- Quem pode ver uma demanda
- Quem pode enviar proposta
- Quando o contato é liberado
- Se um profissional é elegível

Toda regra crítica **vive nesta camada**.

---

## Camada de Persistência (Banco de Dados)

O banco de dados é tratado como uma **camada arquitetural ativa**.

Responsável por:
- Persistir dados do domínio
- Garantir integridade referencial
- Proteger dados sensíveis
- Aplicar políticas de acesso (RLS)

O banco atua como **última linha de defesa** do sistema.

---

## Camada de Infraestrutura

Responsável por serviços externos necessários ao funcionamento do sistema.

Inclui:
- Supabase (Auth + PostgreSQL)
- Stripe (assinaturas e pagamentos)

Limites:
- Infraestrutura não contém regras de negócio
- Infra não decide permissões
- Infra apenas fornece serviços

---

## Modelo de Monetização

- Clientes não pagam
- Profissionais pagam assinatura mensal
- A assinatura controla:
  - Envio de propostas
  - Visibilidade
  - Liberação de contato

O Stripe é usado como **infraestrutura**, nunca como regra de negócio.

---

## Decisões Arquiteturais Importantes

- O sistema é um monólito modular
- Não existem microserviços
- Regras não são duplicadas no frontend
- Banco não é apenas armazenamento
- Segurança é aplicada em camadas

Essas decisões são intencionais.

---

## Relação com Outros Documentos

Este arquivo complementa diretamente:
- `01-visao-geral-arquitetura.md`
- `01b-matriz-de-permissoes-e-visibilidade.md`
- `01c-fluxo-tecnico-de-uma-demanda.md`
- `01d-fluxo-tecnico-de-uma-proposta.md`
- `01e-fluxo-tecnico-de-contato-entre-usuarios.md`
- `01f-diagrama-c4-descritivo.md`

---

## Papel deste Documento

Este arquivo responde à pergunta:

> “O que é o ServiçoJá e como o sistema está organizado?”

Ele deve ser lido **antes** dos documentos de fluxo e permissão.

---

📌 Documento complementar obrigatório da arquitetura do ServiçoJá.
