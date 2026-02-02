# 📏 Padrões de Código e Convenções

Para manter a consistência do código, seguimos as seguintes diretrizes.

## 1. Nomenclatura

- **Arquivos:** `kebab-case.ts` (ex: `users.controller.ts`, `auth.service.ts`)
- **Classes:** `PascalCase` (ex: `UsersController`, `AuthService`)
- **Métodos/Variáveis:** `camelCase` (ex: `findUserByEmail`, `createdAt`)
- **Constantes:** `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`)
- **Interfaces/Types:** `PascalCase` (ex: `UserEntity`, `CreateUserInput`)
- **Banco de Dados:** `snake_case` para tabelas e colunas (ex: `user_id`, `created_at`). O Repository converte para camelCase se necessário, ou usamos snake_case nas entidades para refletir o banco.

## 2. Estrutura de Pastas (Modular)

Agrupamos arquivos por **Funcionalidade** (Domínio), não por Tipo Técnico.

```
src/
  modules/
    users/
      users.controller.ts
      users.service.ts
      users.repository.ts
      users.routes.ts
      users.schema.ts
```

Isso facilita encontrar tudo relacionado a "Usuários" em um só lugar.

## 3. Tratamento de Erros

- **NUNCA usar `console.log` para erros.** Use `logger.error` e lance exceções.
- **Exceptions:** Lance `Error` com mensagens claras no Service.
- **Controller:** O Controller captura erros no `catch` e usa métodos do `BaseController` (ex: `serverError`, `badRequest`) ou retorna códigos HTTP apropriados.
- **Global Handler:** Erros não tratados sobem para o middleware de erro global em `server.ts`.

## 4. Validação de Dados

- **Zod:** Usado para validar TODA entrada de dados nos Controllers.
- Defina schemas em `*.schema.ts`.
- Valide `req.body`, `req.query`, `req.params` antes de chamar o Service.

```typescript
const parsed = createProposalSchema.safeParse(req.body);
if (!parsed.success) {
  return this.error(res, 'Dados inválidos');
}
```

## 5. Async/Await

- Use sempre `async/await` em vez de `.then().catch()`.
- Envolva chamadas async em blocos `try/catch` nos Controllers.

## 6. Imports

- Use imports explícitos com extensão `.js` (devido a configuração ESM/TS).
- Use `import type` para tipos quando `verbatimModuleSyntax` estiver ativo.
- Ordene imports: Bibliotecas externas -> Internos (Shared) -> Internos (Módulo local).

## 7. Banco de Dados

- Use **Parameterized Queries** ($1, $2) SEMPRE. Nunca concatene strings SQL.
- Use `executeInTransaction` para operações que envolvem múltiplas tabelas.
