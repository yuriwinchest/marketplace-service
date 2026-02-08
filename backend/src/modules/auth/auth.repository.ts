import { supabaseAdmin } from '../../shared/database/supabaseClient.js'
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
  async findInternalByEmail(email: string): Promise<InternalUserEntity | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, description, role, avatar_url, created_at')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário:', error.message)
    }

    return (data as InternalUserEntity) || null
  }

  async findInternalById(userId: string): Promise<InternalUserEntity | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, description, role, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário:', error.message)
    }

    return (data as InternalUserEntity) || null
  }

  async createInternalUser(input: {
    email: string
    name: string | null
    description: string
    avatarUrl: string | null
    role: UserRole
  }): Promise<string> {
    const payload: Record<string, unknown> = {
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      description: input.description || null,
      role: input.role,
    }

    if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(payload)
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar usuário')
    }

    return String((data as any).id)
  }

  async ensureProfessionalProfile(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('professional_profiles')
      .upsert({ user_id: userId }, { onConflict: 'user_id' })

    if (error) {
      console.warn('Erro ao criar perfil profissional:', error.message)
    }
  }

  async upsertIdentityMapping(authUserId: string, internalUserId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('user_identities')
      .upsert(
        { auth_user_id: authUserId, user_id: internalUserId },
        { onConflict: 'auth_user_id' },
      )

    if (error) {
      console.warn('Erro ao vincular identidade:', error.message)
      throw new Error('Erro ao vincular identidade')
    }
  }

  async findInternalUserIdByAuthUserId(authUserId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('user_identities')
      .select('user_id')
      .eq('auth_user_id', authUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar identidade:', error.message)
    }

    return data?.user_id || null
  }
}

