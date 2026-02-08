import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '../../shared/types/auth.js'

export interface InternalUserEntity {
  id: string
  email: string
  name: string | null
  description: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export class AuthRepository {
  async bootstrapInternalUser(
    db: SupabaseClient,
    input: { name?: string | null; description?: string | null; avatarUrl?: string | null; role?: UserRole },
  ): Promise<string> {
    const { data, error } = await db.rpc('bootstrap_user', {
      p_name: input.name ?? null,
      p_description: input.description ?? null,
      p_avatar_url: input.avatarUrl ?? null,
      p_role: input.role ?? 'client',
    })

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao inicializar usuário')
    }

    return String(data)
  }

  async findInternalById(db: SupabaseClient, userId: string): Promise<InternalUserEntity | null> {
    const { data, error } = await db
      .from('users')
      .select('id, email, name, description, role, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('Erro ao buscar usuário:', error.message)
    }

    return (data as InternalUserEntity) || null
  }
}

