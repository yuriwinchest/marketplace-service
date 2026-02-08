import type { RegisterInput, LoginInput } from './auth.schema.js'
import type { UserRole } from '../../shared/types/auth.js'
import { AuthRepository } from './auth.repository.js'
import { supabaseAnon } from '../../shared/database/supabaseClient.js'

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

  async register(input: RegisterInput): Promise<{ id: string }> {
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
      throw new Error('Cadastro criado. Confirme seu e-mail e faça login.')
    }

    // 2) Ensure internal user exists (plan B: separate IDs)
    const existingInternal = await this.repository.findInternalByEmail(input.email)
    const role = (existingInternal?.role ?? (input.role ?? 'client')) as UserRole
    const internalUserId =
      existingInternal?.id ??
      (await this.repository.createInternalUser({
        email: input.email,
        name: input.name ?? null,
        description: input.description,
        avatarUrl,
        role,
      }))

    // 3) Link auth user -> internal user
    await this.repository.upsertIdentityMapping(authUserId, internalUserId)

    if (role === 'professional') {
      await this.repository.ensureProfessionalProfile(internalUserId)
    }

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

    const authUserId = data.user.id

    // Find mapping; if missing, attempt to link by email (useful for gradual migration).
    let internalUserId = await this.repository.findInternalUserIdByAuthUserId(authUserId)
    if (!internalUserId) {
      const internal = await this.repository.findInternalByEmail(input.email)
      if (!internal) {
        // Last resort: create a minimal internal user and link it.
        internalUserId = await this.repository.createInternalUser({
          email: input.email,
          name: null,
          description: '',
          avatarUrl: null,
          role: 'client',
        })
      } else {
        internalUserId = internal.id
      }

      await this.repository.upsertIdentityMapping(authUserId, internalUserId)
    }

    const internalUser = await this.repository.findInternalById(internalUserId)
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
