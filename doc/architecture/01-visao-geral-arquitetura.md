# Arquitetura Técnica Detalhada – ServiçoJá

Este documento contém **8 arquivos Markdown conceituais**, cada um representando um **arquivo independente** que deve existir no repositório. Cada seção abaixo deve ser salva como um arquivo `.md` separado.

=============================

## 01-visao-geral-arquitetura.md

### Propósito

Estabelecer a base arquitetural do ServiçoJá, garantindo escalabilidade, previsibilidade e manutenção segura ao longo do crescimento do sistema.

### Arquitetura Adotada

* Monólito Modular
* Clean Architecture (camadas bem definidas)
* Separação por domínios de negócio

### Princípios Técnicos

* Código orientado a domínio
* Independência de frameworks
* Infraestrutura substituível

### Resultado Esperado

Alterações em um módulo não devem impactar outros módulos.

=============================

## 02-organizacao-backend.md

### Objetivo

Definir de forma rigorosa como o backend do ServiçoJá deve ser organizado para garantir **baixo acoplamento**, **alta coesão**, **escalabilidade** e **manutenção segura**, mesmo com crescimento contínuo do código e da equipe.

---

### Estrutura por Domínio (Domain-Driven)

Cada pasta dentro de `src/modules/` representa **um domínio de negócio isolado**, responsável por um conjunto claro de regras e comportamentos do sistema.

Exemplos de domínios:

* users → gestão de usuários
* services → demandas publicadas
* proposals → propostas de profissionais
* auth → autenticação e autorização

📌 Regra fundamental:

> Um domínio **não pode acessar diretamente** arquivos internos de outro domínio.

A comunicação entre domínios deve ocorrer:

* Por serviços públicos bem definidos
* Ou por eventos (quando aplicável futuramente)

---

### Estrutura Padrão de um Módulo

```text
modules/
└── services/
    ├── service.controller.ts
    ├── service.service.ts
    ├── service.repository.ts
    ├── service.entity.ts
    ├── service.schema.ts
    └── service.routes.ts
```

Cada arquivo possui uma responsabilidade única e não sobreposta.

---

### Camadas Obrigatórias e Responsabilidades

#### Controller (Camada de Entrada)

Responsável exclusivamente pela comunicação HTTP.

Funções permitidas:

* Receber `req` e `res`
* Chamar o service correto
* Retornar status HTTP e payload

Funções proibidas:

* Regras de negócio
* Acesso direto ao banco
* Validações complexas

📌 Controllers devem ser **finos** e previsíveis.

---

#### Service (Camada de Negócio)

Responsável por **toda a lógica de negócio** do domínio.

Funções permitidas:

* Aplicar regras
* Orquestrar casos de uso
* Decidir fluxos

Funções proibidas:

* Conhecer Express, Request ou Response
* Conhecer detalhes de banco de dados

📌 Services devem ser **puros**, testáveis e desacoplados.

---

#### Repository (Camada de Persistência)

Responsável por toda comunicação com o banco de dados.

Funções permitidas:

* Executar queries
* Mapear dados para entidades

Funções proibidas:

* Regras de negócio
* Decisões de fluxo

📌 Se trocar PostgreSQL por outro banco, apenas o repository muda.

---

#### Schema (Validação de Dados)

Responsável por validar **todas as entradas externas**.

Regras:

* Usar Zod
* Validar body, params e query
* Nenhuma validação manual fora do schema

📌 Dados inválidos **não chegam ao service**.

---

### Fluxo Correto de Execução

```text
HTTP Request
 → Controller
   → Schema (validação)
     → Service (regras)
       → Repository (dados)
 ← HTTP Response
```

Qualquer desvio desse fluxo é considerado erro arquitetural.

---

### Regras de Acoplamento

* Controllers dependem apenas de Services
* Services dependem apenas de interfaces de Repositories
* Repositories dependem apenas da infraestrutura

Nunca:

* Controller chamando Repository
* Repository chamando Service
* Service acessando Express

---

### Benefícios Diretos

* Refatorações seguras
* Testes unitários simples
* Crescimento organizado
* Menor risco de regressão

---

📌 Este arquivo é **regra obrigatória** do projeto e deve ser seguido em todo novo módulo.

=============================

## 03-solid-na-pratica.md

### Objetivo

Garantir que todo o código do backend do ServiçoJá siga rigorosamente os **princípios SOLID**, evitando acoplamento excessivo, efeitos colaterais e refatorações perigosas.

---

### S — Single Responsibility Principle (SRP)

Cada arquivo, classe ou função deve ter **um único motivo para mudar**.

Regras práticas:

* Um controller trata apenas HTTP
* Um service trata apenas regras de negócio
* Um repository trata apenas persistência

Exemplo de violação:

* Controller validando dados e salvando no banco

Exemplo correto:

* Controller delega
* Service decide
* Repository executa

---

### O — Open/Closed Principle (OCP)

O sistema deve estar **aberto para extensão e fechado para modificação**.

Regras práticas:

* Nunca alterar código estável para adicionar nova funcionalidade
* Criar novos services, handlers ou estratégias

Exemplo:

* Novo tipo de pagamento → novo provider, não alteração do service atual

---

### L — Liskov Substitution Principle (LSP)

Qualquer implementação deve poder ser substituída por outra sem quebrar o sistema.

Regras:

* Interfaces devem ser respeitadas
* Nenhuma implementação pode surpreender quem consome

---

### I — Interface Segregation Principle (ISP)

Interfaces devem ser **pequenas e específicas**.

Regras:

* Nada de interfaces genéricas gigantes
* Uma interface por responsabilidade

---

### D — Dependency Inversion Principle (DIP)

Camadas de alto nível não dependem de camadas de baixo nível.

Regras obrigatórias:

* Services dependem de interfaces
* Repositories implementam interfaces
* Injeção de dependência manual

---

📌 Violação de SOLID é considerada erro arquitetural grave.

=============================

## 04-padroes-de-codigo.md

### Objetivo

Padronizar o código para garantir **legibilidade**, **previsibilidade** e **segurança em refatorações**.

---

### Padrões Obrigatórios

* DTOs para entrada e saída
* Services puros
* Controllers finos
* Repositories isolados

---

### Regras de Escrita

* Funções com no máximo 40 linhas
* Nomes explícitos e sem abreviações obscuras
* Sem lógica condicional complexa em controllers

---

### Organização Interna

* Um caso de uso por método
* Nada de métodos genéricos "fazTudo"

---

📌 Código fora desse padrão deve ser refatorado antes de novas features.

=============================

## 05-limite-de-arquivos.md

### Objetivo

Garantir legibilidade, previsibilidade e facilidade de manutenção, evitando arquivos grandes que concentram múltiplas responsabilidades.

---

### Limites Técnicos Obrigatórios

* Controllers: **máximo de 200 linhas**
* Services: **máximo de 300 linhas**
* Repositories: **máximo de 300 linhas**
* Qualquer arquivo: **limite absoluto de 700 linhas**

Esses limites existem para:

* Facilitar revisão de código
* Reduzir risco de efeitos colaterais
* Melhorar testabilidade

---

### Estratégias de Quebra de Arquivos

Quando o limite for atingido:

* Separar por **caso de uso** (ex: create, update, list)
* Criar sub-services especializados
* Extrair helpers puros para `shared/utils`

Nunca:

* Ignorar o limite
* Criar arquivos “Deus” (God Files)

---

📌 Arquivos fora do limite devem ser refatorados antes de qualquer nova feature.

=============================

## 06-seguranca-e-escalabilidade.md

### Objetivo

Assegurar que o backend do ServiçoJá seja seguro desde a base e capaz de escalar horizontalmente sem alterações estruturais.

---

### Segurança Obrigatória

* Hash de senhas com bcrypt
* JWT com expiração curta
* Refresh Token armazenado com segurança
* Zod validando body, params e query
* Helmet para headers HTTP
* Rate limit para proteção contra abuso

Regras:

* Nenhuma rota pública sem validação
* Nenhuma informação sensível em logs

---

### Escalabilidade Técnica

* Backend stateless
* Pronto para múltiplas instâncias
* Upload de arquivos fora do servidor
* Banco acessado via pool de conexões

---

📌 Segurança e escalabilidade não são opcionais nem posteriores.

=============================

## 07-organizacao-frontend.md

### Objetivo

Manter o frontend organizado, escalável e alinhado aos mesmos princípios arquiteturais do backend.

---

### Estrutura Recomendada

* Organização por domínio (modules)
* Separação clara entre UI, lógica e acesso à API

Exemplo:

* pages → composição
* components → UI pura
* hooks → lógica reutilizável
* services → comunicação HTTP

---

### Regras Obrigatórias

* Componentes não acessam API diretamente
* Nenhuma lógica de negócio em componentes
* Estado global apenas quando necessário

---

📌 Frontend deve ser previsível e fácil de refatorar.

=============================

## 08-checklist-de-manutenibilidade.md

### Objetivo

Evitar regressões e garantir que qualquer manutenção ou correção não impacte outras partes do sistema.

---

### Checklist Obrigatório para PR

* [ ] Arquitetura por domínio respeitada
* [ ] SOLID aplicado corretamente
* [ ] Arquivos dentro dos limites
* [ ] Validação presente em todas entradas
* [ ] Nenhum acoplamento indevido
* [ ] Código testável

---

### Regra Final

Se qualquer item falhar, o PR **não deve ser aprovado**.

📌 Este checklist é obrigatório e não negociável.
