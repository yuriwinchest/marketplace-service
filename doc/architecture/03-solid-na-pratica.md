# 🧱 SOLID na Prática no Projeto

Esta arquitetura foi desenhada seguindo os princípios SOLID para garantir manutenibilidade e escalabilidade. Abaixo explicamos como cada princípio é aplicado no código atual.

## 1. Single Responsibility Principle (SRP)

**Princípio da Responsabilidade Única**

Cada classe ou módulo deve ter apenas uma razão para mudar.

### No Projeto

- **Controllers (`*.controller.ts`):** Responsáveis APENAS por receber requisições HTTP, validar inputs (usando schemas) e formatar a resposta. Não contêm regras de negócio.
- **Services (`*.service.ts`):** Contêm TODAS as regras de negócio. Não sabem sobre HTTP (req/res) nem sobre SQL direto.
- **Repositories (`*.repository.ts`):** Responsáveis APENAS pelo acesso a dados (SQL). Não contêm regras de negócio complexas.

**Exemplo:**
Se precisarmos mudar o banco de dados de Postgres para Mongo, alteramos apenas os Repositories. Se a regra de aprovação de proposta mudar, alteramos apenas o Service.

---

## 2. Open/Closed Principle (OCP)

**Princípio Aberto/Fechado**

Entidades devem estar abertas para extensão, mas fechadas para modificação.

### No Projeto

- **BaseController:** Fornece métodos comuns (`success`, `error`, etc). Novos controllers estendem esta classe sem precisar modificá-la.
- **Middlewares:** Podemos adicionar novos comportamentos (Rate Limit, Auth) plugando novos middlewares sem alterar o código dos controllers existentes.

---

## 3. Liskov Substitution Principle (LSP)

**Princípio de Substituição de Liskov**

Objetos de uma superclasse devem ser substituíveis por objetos de subclasses sem quebrar a aplicação.

### No Projeto

- As implementações de `Error` (ex: erros customizados) podem ser tratadas pelo Error Handler global genericamente.
- Se criarmos uma interface `IProposalsRepository`, qualquer implementação (PostgresRepository, MockRepository para testes) deve funcionar transparentemente para o Service.

---

## 4. Interface Segregation Principle (ISP)

**Princípio da Segregação de Interface**

Muitas interfaces específicas são melhores do que uma interface única geral.

### No Projeto

- Evitamos interfaces "Deus" que fazem tudo.
- Os schemas do Zod (`*.schema.ts`) definem formas específicas para Entrada (Input) e Saída (Output) de cada operação, em vez de reutilizar a entidade de Banco inteira para tudo.

---

## 5. Dependency Inversion Principle (DIP)

**Princípio da Inversão de Dependência**

Dependa de abstrações, não de implementações.

### No Projeto

- **Injeção de Dependência:** Na inicialização das rotas (`*.routes.ts`), instanciamos as dependências e as passamos para os construtores:
  
  ```typescript
  const repository = new ProposalsRepository();
  // Service depende de uma abstração (embora hoje seja classe concreta, a estrutura permite interface)
  const service = new ProposalsService(repository);
  const controller = new ProposalsController(service);
  ```

- Isso facilita **Testes Unitários**, pois podemos passar um Mock do Repository para o Service durante os testes.
