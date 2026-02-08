import type { RegisterInput, LoginInput } from './auth.schema.js'
import type { UserRole } from '../../shared/types/auth.js'
import { AuthRepository } from './auth.repository.js'
import { supabaseAnon } from '../../shared/database/supabaseClient.js'
import { createSupabaseRlsClient } from '../../shared/database/supabaseRlsClient.js'

export interface AuthResult {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string | null
    description: string | null
    role: UserRole
    avatar_url: string | null
    created_at: string
  }
}

export class AuthService {
  constructor(private repository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ id: string; pendingConfirmation?: boolean }> {
    const avatarUrl = input.avatarUrl
    if (!avatarUrl) throw new Error('Foto é obrigatória')

    // 1) Create Supabase Auth user
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: input.email.toLowerCase(),
      password: input.password,
      options: {
        data: {
          role: input.role ?? 'client',
        },
      },
    })

    if (signUpError) {
      const msg = signUpError.message || 'Erro ao cadastrar'
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        throw new Error('E-mail já cadastrado')
      }
      throw new Error(msg)
    }

    const authUserId = signUpData.user?.id
    if (!authUserId) {
      // This can happen when email confirmation is required.
      // We still consider the signup successful, but can't create identity mapping without the auth user id.
      return { id: '', pendingConfirmation: true }
    }

    const accessToken = signUpData.session?.access_token
    if (!accessToken) {
      // Signup ok but no session (email confirmation). Bootstrap will happen on first login.
      return { id: authUserId, pendingConfirmation: true }
    }

    const db = createSupabaseRlsClient(accessToken)
    const internalUserId = await this.repository.bootstrapInternalUser(db, {
      name: input.name ?? null,
      description: input.description ?? null,
      avatarUrl,
      role: (input.role ?? 'client') as UserRole,
    })

    return { id: internalUserId }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: input.email.toLowerCase(),
      password: input.password,
    })

    if (error || !data.session || !data.user) {
      throw new Error('Credenciais inválidas')
    }

    const role = (data.user.user_metadata?.role ?? 'client') as UserRole
    const db = createSupabaseRlsClient(data.session.access_token)
    const internalUserId = await this.repository.bootstrapInternalUser(db, { role })

    const internalUser = await this.repository.findInternalById(db, internalUserId)
    if (!internalUser) throw new Error('Usuário não encontrado')

    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: internalUser,
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) {
      throw new Error('Refresh token inválido ou expirado')
    }

    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  }
}
