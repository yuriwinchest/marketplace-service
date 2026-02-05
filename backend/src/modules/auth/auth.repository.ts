import { supabase } from '../../shared/database/supabaseClient.js'
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
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password_hash, name, role, avatar_url, created_at')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário:', error.message)
    }
    return data || null
  }

  async createUser(
    email: string,
    passwordHash: string,
    name: string | null,
    role: string,
  ): Promise<Omit<UserEntity, 'password_hash'>> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: name ?? null,
        role,
      })
      .select('id, email, name, role, avatar_url, created_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar usuário')
    }

    return data
  }

  async createProfessionalProfile(userId: string): Promise<void> {
    const { error } = await supabase
      .from('professional_profiles')
      .upsert({ user_id: userId }, { onConflict: 'user_id' })

    if (error) {
      console.warn('Erro ao criar perfil profissional:', error.message)
    }
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
