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
      `SELECT bio, phone, skills, location_scope, uf, city 
       FROM public.professional_profiles 
       WHERE user_id = $1`,
      [userId],
    )
    return result.rows[0] || null
  }

  async upsertProfessionalProfile(
    userId: string,
    data: {
      bio?: string | null
      phone?: string | null
      skills?: string[] | null
      locationScope?: string
      uf?: string | null
      city?: string | null
    },
  ): Promise<void> {
    await pool.query(
      `INSERT INTO public.professional_profiles (user_id, bio, phone, skills, location_scope, uf, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = COALESCE($2, professional_profiles.bio),
         phone = COALESCE($3, professional_profiles.phone),
         skills = COALESCE($4, professional_profiles.skills),
         location_scope = COALESCE($5, professional_profiles.location_scope),
         uf = COALESCE($6, professional_profiles.uf),
         city = COALESCE($7, professional_profiles.city)`,
      [
        userId,
        data.bio ?? null,
        data.phone ?? null,
        data.skills ?? null,
        data.locationScope ?? 'national',
        data.uf ?? null,
        data.city ?? null,
      ],
    )
  }
}
