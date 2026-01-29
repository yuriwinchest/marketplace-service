import { pool } from '../../shared/database/connection.js'
import * as bcrypt from 'bcrypt'

export interface UserEntity {
  id: string
  email: string
  name: string | null
  role: string
  password_hash: string
  avatar_url: string | null
  created_at: string
}

export class AuthRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await pool.query<UserEntity>(
      `SELECT id, email, password_hash, name, role, avatar_url, created_at 
       FROM public.users 
       WHERE email = $1`,
      [email.toLowerCase()],
    )
    return result.rows[0] || null
  }

  async createUser(
    email: string,
    passwordHash: string,
    name: string | null,
    role: string,
  ): Promise<Omit<UserEntity, 'password_hash'>> {
    const result = await pool.query<Omit<UserEntity, 'password_hash'>>(
      `INSERT INTO public.users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, avatar_url, created_at`,
      [email.toLowerCase(), passwordHash, name ?? null, role],
    )

    const created = result.rows[0]
    if (!created) {
      throw new Error('Erro ao criar usuário')
    }

    return created
  }

  async createProfessionalProfile(userId: string): Promise<void> {
    await pool.query(
      `INSERT INTO public.professional_profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    )
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
