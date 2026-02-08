import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnon } from '../../shared/database/supabaseClient.js'

export interface UserProfileEntity {
  id: string
  email: string
  name: string | null
  description: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

export interface ProfessionalProfileEntity {
  bio: string | null
  phone: string | null
  skills: string[] | null
  location_scope: string
  uf: string | null
  city: string | null
  is_remote: boolean
  email: string | null
  whatsapp: string | null
}

export interface PublicProfessionalRow {
  id: string
  name: string | null
  description: string | null
  role: string
  avatar_url: string | null
  created_at: string
  bio: string | null
  skills: string[] | null
  location_scope: string
  uf: string | null
  city: string | null
  is_remote: boolean
}

export class UsersRepository {
  async findById(db: SupabaseClient, userId: string): Promise<UserProfileEntity | null> {
    const { data, error } = await db
      .from('users')
      .select('id, email, name, description, role, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário:', error.message)
    }
    return data || null
  }

  async updateName(db: SupabaseClient, userId: string, name: string): Promise<void> {
    const { error } = await db
      .from('users')
      .update({ name })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar nome:', error.message)
    }
  }

  async updateDescription(db: SupabaseClient, userId: string, description: string): Promise<void> {
    const { error } = await db
      .from('users')
      .update({ description })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar descrição:', error.message)
      throw new Error(error.message)
    }
  }

  async updateAvatar(db: SupabaseClient, userId: string, avatarUrl: string): Promise<string | null> {
    // Get old avatar first
    const { data: oldData } = await db
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    const oldAvatar = oldData?.avatar_url || null

    const { error } = await db
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar avatar:', error.message)
    }

    return oldAvatar
  }

  async getProfessionalProfile(
    db: SupabaseClient,
    userId: string,
  ): Promise<ProfessionalProfileEntity | null> {
    const { data, error } = await db
      .from('professional_profiles')
      .select('bio, phone, skills, location_scope, uf, city, is_remote, email, whatsapp')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar perfil profissional:', error.message)
    }
    return data || null
  }

  async upsertProfessionalProfile(
    db: SupabaseClient,
    userId: string,
    data: {
      bio?: string | null | undefined
      phone?: string | null | undefined
      skills?: string[] | null | undefined
      locationScope?: string | undefined
      uf?: string | null | undefined
      city?: string | null | undefined
      isRemote?: boolean | undefined
      email?: string | null | undefined
      whatsapp?: string | null | undefined
    },
  ): Promise<void> {
    const { error } = await db
      .from('professional_profiles')
      .upsert({
        user_id: userId,
        bio: data.bio ?? null,
        phone: data.phone ?? null,
        skills: data.skills ?? null,
        location_scope: data.locationScope ?? 'national',
        uf: data.uf ?? null,
        city: data.city ?? null,
        is_remote: data.isRemote ?? false,
        email: data.email ?? null,
        whatsapp: data.whatsapp ?? null,
      }, { onConflict: 'user_id' })

    if (error) {
      console.warn('Erro ao salvar perfil profissional:', error.message)
      throw new Error(error.message)
    }
  }

  async findProfessionals(
    filters: {
      categoryId?: string
      city?: string
      uf?: string
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<PublicProfessionalRow[]> {
    // Use public tables (synced from private tables) so we can keep `users`/`professional_profiles`
    // locked down under RLS while still allowing public listings with joins (no service-role).
    let query = supabaseAnon
      .from('professional_public_users')
      .select(`
        user_id, name, description, role, avatar_url, created_at,
        professional_public_profiles!inner (
          bio, skills, location_scope, uf, city, is_remote
        )
      `)

    // Apply location filters
    if (filters.city) {
      query = query.or(
        `city.eq.${filters.city},is_remote.eq.true`,
        { foreignTable: 'professional_public_profiles' },
      )
    }
    if (filters.uf) {
      query = query.or(
        `uf.eq.${filters.uf},is_remote.eq.true`,
        { foreignTable: 'professional_public_profiles' },
      )
    }

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1)

    const { data, error } = await query

    if (error) {
      console.warn('Erro ao buscar profissionais:', error.message)
      return []
    }

    // Flatten the nested structure to a stable public row shape.
    return (data || []).map((u: any) => ({
      id: u.user_id,
      name: u.name ?? null,
      description: u.description ?? null,
      role: u.role ?? 'professional',
      avatar_url: u.avatar_url ?? null,
      created_at: u.created_at,
      bio: u.professional_public_profiles?.bio ?? null,
      skills: u.professional_public_profiles?.skills ?? null,
      location_scope: u.professional_public_profiles?.location_scope ?? 'national',
      uf: u.professional_public_profiles?.uf ?? null,
      city: u.professional_public_profiles?.city ?? null,
      is_remote: u.professional_public_profiles?.is_remote ?? false,
    }))
  }
}
