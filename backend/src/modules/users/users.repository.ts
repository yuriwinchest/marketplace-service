import { supabase } from '../../shared/database/supabaseClient.js'

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

export class UsersRepository {
  async findById(userId: string): Promise<UserProfileEntity | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, description, role, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário:', error.message)
    }
    return data || null
  }

  async updateName(userId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar nome:', error.message)
    }
  }

  async updateDescription(userId: string, description: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ description })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar descrição:', error.message)
      throw new Error(error.message)
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<string | null> {
    // Get old avatar first
    const { data: oldData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    const oldAvatar = oldData?.avatar_url || null

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (error) {
      console.warn('Erro ao atualizar avatar:', error.message)
    }

    return oldAvatar
  }

  async getProfessionalProfile(
    userId: string,
  ): Promise<ProfessionalProfileEntity | null> {
    const { data, error } = await supabase
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
    const { error } = await supabase
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
  ): Promise<(UserProfileEntity & ProfessionalProfileEntity)[]> {
    // Build query for users with professional profiles
    let query = supabase
      .from('users')
      .select(`
        id, email, name, description, role, avatar_url, created_at,
        professional_profiles!inner (
          bio, phone, skills, location_scope, uf, city, is_remote, email, whatsapp
        )
      `)
      .eq('role', 'professional')

    // Apply location filters
    if (filters.city) {
      query = query.or(
        `city.eq.${filters.city},is_remote.eq.true`,
        { foreignTable: 'professional_profiles' },
      )
    }
    if (filters.uf) {
      query = query.or(
        `uf.eq.${filters.uf},is_remote.eq.true`,
        { foreignTable: 'professional_profiles' },
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

    // Flatten the nested structure
    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      description: user.description,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      bio: user.professional_profiles?.bio || null,
      phone: user.professional_profiles?.phone || null,
      skills: user.professional_profiles?.skills || null,
      location_scope: user.professional_profiles?.location_scope || 'national',
      uf: user.professional_profiles?.uf || null,
      city: user.professional_profiles?.city || null,
      is_remote: user.professional_profiles?.is_remote || false,
      prof_email: user.professional_profiles?.email || null,
      whatsapp: user.professional_profiles?.whatsapp || null,
    }))
  }
}
