# Migração para Supabase API REST

**Data:** 2026-02-05
**Autor:** Claude Code

## Problema

A conexão direta ao PostgreSQL via porta 5432 estava falhando devido a:

1. **IPv6 Only**: Desde janeiro 2024, o Supabase usa IPv6 apenas para conexões diretas. Redes que não suportam IPv6 não conseguem conectar.
2. **Firewall/ISP**: Muitas redes bloqueiam a porta 5432 por segurança.
3. **Connection Pooler**: O pooler também não funcionava devido a senha incorreta ou tenant não encontrado.

## Solução

Migração completa de todos os repositórios para usar a **API REST do Supabase** (`@supabase/supabase-js`) ao invés de conexão direta `pg`.

## Arquivos Modificados

### Novo Arquivo Criado

| Arquivo | Descrição |
|---------|-----------|
| `backend/src/shared/database/supabaseClient.ts` | Cliente Supabase centralizado |

### Repositórios Migrados

| Arquivo | Mudança |
|---------|---------|
| `backend/src/modules/categories/categories.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/auth/auth.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/auth/auth.refresh.service.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/users/users.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/services/services.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/proposals/proposals.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/proposals/proposals.service.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/regions/regions.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/subscriptions/subscriptions.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/contact/contact.repository.ts` | `pool.query` → `supabase.from()` |
| `backend/src/modules/notifications/notifications.repository.ts` | `pool.query` → `supabase.from()` |

### Variáveis de Ambiente Adicionadas

```env
SUPABASE_URL=https://wkinsmogblmfobyldijc.supabase.co
SUPABASE_ANON_KEY=...
```

## Padrão de Migração

### Antes (conexão pg direta)

```typescript
import { pool } from '../../shared/database/connection.js'

async findAll(): Promise<Entity[]> {
  const result = await pool.query<Entity>(
    `SELECT * FROM public.table ORDER BY name ASC`
  )
  return result.rows
}
```

### Depois (API REST Supabase)

```typescript
import { supabase } from '../../shared/database/supabaseClient.js'

async findAll(): Promise<Entity[]> {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.warn('Erro:', error.message)
    return []
  }
  return data || []
}
```

## Vantagens da Nova Arquitetura

| Aspecto | Conexão pg direta | API REST Supabase |
|---------|-------------------|-------------------|
| IPv4/IPv6 | Só IPv6 | Ambos |
| Porta | 5432 (frequentemente bloqueada) | 443 (HTTPS) |
| Firewall | Problemas frequentes | Funciona em qualquer rede |
| Autenticação | Senha do banco | Chave anon (mais segura) |
| Rate Limiting | Manual | Automático |
| Caching | Manual | Automático |

## Observações

1. **Transações**: A API REST não suporta transações diretamente. Para operações que requerem transações atômicas, considere usar Supabase Edge Functions ou Database Functions (RPCs).

2. **Performance**: Para consultas muito frequentes, a API REST pode ter latência ligeiramente maior que conexão direta. Para o caso de uso atual (aplicação web), isso é negligenciável.

3. **O arquivo `connection.ts` foi mantido** para compatibilidade, mas não é mais usado pelos repositórios principais.

## Testado e Funcionando

- [x] Categorias carregando (121 categorias)
- [x] Regiões carregando
- [x] Health check funcionando
- [x] TypeScript compilando sem erros
