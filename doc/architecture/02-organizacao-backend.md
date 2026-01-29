# 02 – Organização do Backend

## Objetivo

Definir de forma rigorosa como o backend do ServiçoJá deve ser organizado para garantir **baixo acoplamento**, **alta coesão**, **escalabilidade** e **manutenção segura**, mesmo com crescimento contínuo do código e da equipe.

---

## Estrutura por Domínio (Domain-Driven Design)

Cada pasta dentro de `src/modules/` representa **um domínio de negócio isolado**, responsável por um conjunto claro de regras e comportamentos do sistema.

Exemplos de domínios:

- `auth` → autenticação e autorização
- `users` → gestão de usuários e perfis
- `services` → demandas publicadas (service_requests)
- `proposals` → propostas de profissionais (futuro)
- `categories` → categorias de serviços
- `regions` → regiões geográficas

📌 **Regra fundamental:**

> Um domínio **não pode acessar diretamente** arquivos internos de outro domínio.

A comunicação entre domínios deve ocorrer:

- Por serviços públicos bem definidos
- Ou por eventos (quando aplicável futuramente)

---

## Estrutura Padrão de um Módulo

```text
modules/
└── auth/
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── auth.repository.ts
    ├── auth.schema.ts
    └── auth.routes.ts
```

Cada arquivo possui uma responsabilidade única e não sobreposta.

---

## Camadas Obrigatórias e Responsabilidades

### Controller (Camada de Entrada)

Responsável exclusivamente pela comunicação HTTP.

**Funções permitidas:**

- Receber `req` e `res`
- Chamar o service correto
- Retornar status HTTP e payload padronizado

**Funções proibidas:**

- Regras de negócio
- Acesso direto ao banco
- Validações complexas

📌 Controllers devem ser **finos** e previsíveis. Máximo de **200 linhas**.

**Exemplo:**

```typescript
export class AuthController extends BaseController {
  async register(req: Request, res: Response): Promise<Response> {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const user = await this.authService.register(parsed.data)
      return this.created(res, { user })
    } catch (error) {
      return this.handleError(res, error)
    }
  }
}
```

---

### Service (Camada de Negócio)

Responsável por **toda a lógica de negócio** do domínio.

**Funções permitidas:**

- Aplicar regras
- Orquestrar casos de uso
- Decidir fluxos
- Validar permissões

**Funções proibidas:**

- Conhecer Express, Request ou Response
- Conhecer detalhes de banco de dados (apenas interfaces)

📌 Services devem ser **puros**, testáveis e desacoplados. Máximo de **300 linhas**.

**Exemplo:**

```typescript
export class AuthService {
  constructor(private repository: AuthRepository) {}

  async register(input: RegisterInput): Promise<User> {
    // Regra de negócio: verificar se email já existe
    const existingUser = await this.repository.findByEmail(input.email)
    if (existingUser) {
      throw new Error('E-mail já cadastrado')
    }

    // Regra de negócio: hash da senha
    const passwordHash = await this.repository.hashPassword(input.password)
    
    // Criar usuário
    const user = await this.repository.createUser(/* ... */)
    
    // Regra de negócio: criar perfil profissional se necessário
    if (user.role === 'professional') {
      await this.repository.createProfessionalProfile(user.id)
    }

    return user
  }
}
```

---

### Repository (Camada de Persistência)

Responsável por toda comunicação com o banco de dados.

**Funções permitidas:**

- Executar queries
- Mapear dados para entidades
- Tratar erros de banco

**Funções proibidas:**

- Regras de negócio
- Decisões de fluxo
- Validações de entrada

📌 Se trocar PostgreSQL por outro banco, apenas o repository muda. Máximo de **300 linhas**.

**Exemplo:**

```typescript
export class AuthRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await pool.query<UserEntity>(
      `SELECT id, email, password_hash, name, role 
       FROM public.users 
       WHERE email = $1`,
      [email.toLowerCase()],
    )
    return result.rows[0] || null
  }

  async createUser(/* ... */): Promise<UserEntity> {
    // Apenas executa query, sem lógica de negócio
  }
}
```

---

### Schema (Validação de Dados)

Responsável por validar **todas as entradas externas**.

**Regras:**

- Usar Zod
- Validar body, params e query
- Nenhuma validação manual fora do schema

📌 Dados inválidos **não chegam ao service**.

**Exemplo:**

```typescript
export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1).optional(),
  role: z.enum(['client', 'professional']).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
```

---

## Fluxo Correto de Execução

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

## Regras de Acoplamento

**Dependências permitidas:**

- Controllers dependem apenas de Services
- Services dependem apenas de interfaces de Repositories
- Repositories dependem apenas da infraestrutura (pool)

**Nunca:**

- Controller chamando Repository diretamente
- Repository chamando Service
- Service acessando Express
- Service conhecendo detalhes de HTTP

---

## Estrutura de Pastas Completa

```
backend/
└── src/
    ├── config/
    │   └── unifiedConfig.ts          # Configuração centralizada
    ├── shared/
    │   ├── base/
    │   │   └── BaseController.ts     # Controller base com helpers
    │   ├── database/
    │   │   └── connection.ts         # Pool de conexões
    │   ├── middleware/
    │   │   ├── auth.middleware.ts    # Autenticação
    │   │   └── upload.middleware.ts  # Upload de arquivos
    │   └── types/
    │       └── auth.ts                # Tipos compartilhados
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.repository.ts
    │   │   ├── auth.schema.ts
    │   │   └── auth.routes.ts
    │   ├── users/
    │   │   └── ...
    │   └── services/
    │       └── ...
    └── server.ts                      # Ponto de entrada
```

---

## Padrões de Resposta da API

Todas as respostas seguem o formato:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

O `BaseController` fornece métodos auxiliares:

- `success(res, data, statusCode?)` → 200 por padrão
- `created(res, data)` → 201
- `error(res, message, statusCode?)` → 400 por padrão
- `notFound(res, message?)` → 404
- `unauthorized(res, message?)` → 401
- `forbidden(res, message?)` → 403
- `serverError(res, message?)` → 500

---

## Limites de Arquivos

**Obrigatórios:**

- Controllers: **máximo de 200 linhas**
- Services: **máximo de 300 linhas**
- Repositories: **máximo de 300 linhas**
- Qualquer arquivo: **limite absoluto de 700 linhas**

Quando o limite for atingido:

- Separar por **caso de uso** (ex: create, update, list)
- Criar sub-services especializados
- Extrair helpers puros para `shared/utils`

---

## Benefícios Diretos

- ✅ Refatorações seguras
- ✅ Testes unitários simples
- ✅ Crescimento organizado
- ✅ Menor risco de regressão
- ✅ Onboarding facilitado
- ✅ Manutenção previsível

---

📌 Este arquivo é **regra obrigatória** do projeto e deve ser seguido em todo novo módulo.
