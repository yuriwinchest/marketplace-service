import { pool } from '../../shared/database/connection.js'

export interface UserProfileEntity {
  id: string
  email: string
  name: string | null
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
    const result = await pool.query<UserProfileEntity>(
      `SELECT id, email, name, role, avatar_url, created_at 
       FROM public.users 
       WHERE id = $1`,
      [userId],
    )
    return result.rows[0] || null
  }

  async updateName(userId: string, name: string): Promise<void> {
    await pool.query(`UPDATE public.users SET name = $1 WHERE id = $2`, [name, userId])
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<string | null> {
    const oldResult = await pool.query<{ avatar_url: string | null }>(
      `SELECT avatar_url FROM public.users WHERE id = $1`,
      [userId],
    )
    const oldAvatar = oldResult.rows[0]?.avatar_url || null

    await pool.query(`UPDATE public.users SET avatar_url = $1 WHERE id = $2`, [
      avatarUrl,
      userId,
    ])

    return oldAvatar
  }

  async getProfessionalProfile(
    userId: string,
  ): Promise<ProfessionalProfileEntity | null> {
    const result = await pool.query<ProfessionalProfileEntity>(
      `SELECT bio, phone, skills, location_scope, uf, city, is_remote, email, whatsapp 
       FROM public.professional_profiles 
       WHERE user_id = $1`,
      [userId],
    )
    return result.rows[0] || null
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
    await pool.query(
      `INSERT INTO public.professional_profiles (user_id, bio, phone, skills, location_scope, uf, city, is_remote, email, whatsapp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = COALESCE($2, professional_profiles.bio),
         phone = COALESCE($3, professional_profiles.phone),
         skills = COALESCE($4, professional_profiles.skills),
         location_scope = COALESCE($5, professional_profiles.location_scope),
         uf = COALESCE($6, professional_profiles.uf),
         city = COALESCE($7, professional_profiles.city),
         is_remote = COALESCE($8, professional_profiles.is_remote),
         email = COALESCE($9, professional_profiles.email),
         whatsapp = COALESCE($10, professional_profiles.whatsapp)`,
      [
        userId,
        data.bio ?? null,
        data.phone ?? null,
        data.skills ?? null,
        data.locationScope ?? 'national',
        data.uf ?? null,
        data.city ?? null,
        data.isRemote ?? false,
        data.email ?? null,
        data.whatsapp ?? null,
      ],
    )
  }

  async findProfessionals(
    filters: {
      categoryId?: string
      city?: string
      uf?: string
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<(UserProfileEntity & ProfessionalProfileEntity)[]> {
    let query = `
      SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.created_at,
             pp.bio, pp.phone, pp.skills, pp.location_scope, pp.uf, pp.city, pp.is_remote, pp.email as prof_email, pp.whatsapp
      FROM public.users u
      JOIN public.professional_profiles pp ON u.id = pp.user_id
    `
    const conditions: string[] = ["u.role = 'professional'"]
    const params: any[] = []

    if (filters.categoryId) {
      query += ` JOIN public.professional_categories pc ON pp.id = pc.professional_id`
      params.push(filters.categoryId)
      conditions.push(`pc.category_id = $${params.length}`)
    }

    if (filters.city || filters.uf) {
      // Regra de Negócio: Se for remoto, ele aparece independente da cidade
      const subConditions: string[] = ['pp.is_remote = true']

      if (filters.city) {
        params.push(filters.city)
        subConditions.push(`pp.city = $${params.length}`)
      }
      if (filters.uf) {
        params.push(filters.uf)
        subConditions.push(`pp.uf = $${params.length}`)
      }

      conditions.push(`(${subConditions.join(' OR ')})`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ')
    }

    query += ` ORDER BY u.created_at DESC`

    // Pagination
    const limit = pagination.limit
    const offset = (pagination.page - 1) * limit

    params.push(limit)
    query += ` LIMIT $${params.length}`

    params.push(offset)
    query += ` OFFSET $${params.length}`

    const result = await pool.query<UserProfileEntity & ProfessionalProfileEntity>(query, params)
    return result.rows
  }
}
