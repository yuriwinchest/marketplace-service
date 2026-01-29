import * as jwt from 'jsonwebtoken'
import { config } from '../../config/unifiedConfig.js'
import { AuthRepository, UserEntity } from './auth.repository.js'
import { RegisterInput, LoginInput } from './auth.schema.js'
import { AuthRefreshService } from './auth.refresh.service.js'

const jwtLib =
  ((jwt as unknown as { default?: typeof jwt }).default as typeof jwt | undefined) ?? jwt

export interface AuthResult {
  token: string
  refreshToken: string
  user: Omit<UserEntity, 'password_hash'>
}

export class AuthService {
  constructor(
    private repository: AuthRepository,
    private refreshService: AuthRefreshService,
  ) {}

  async register(input: RegisterInput): Promise<Omit<UserEntity, 'password_hash'>> {
    const existingUser = await this.repository.findByEmail(input.email)
    if (existingUser) {
      throw new Error('E-mail já cadastrado')
    }

    const passwordHash = await this.repository.hashPassword(input.password)
    const role = input.role ?? 'client'

    const user = await this.repository.createUser(
      input.email,
      passwordHash,
      input.name ?? null,
      role,
    )

    if (role === 'professional') {
      await this.repository.createProfessionalProfile(user.id)
    }

    return user
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.repository.findByEmail(input.email)
    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const isValid = await this.repository.verifyPassword(input.password, user.password_hash)
    if (!isValid) {
      throw new Error('Credenciais inválidas')
    }

    // Access token com expiração curta (15 minutos)
    const token = jwtLib.sign(
      { sub: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' },
    )

    const { password_hash: _, ...userWithoutPassword } = user

    // Gerar refresh token
    const refreshToken = await this.refreshService.generateRefreshToken(user.id)

    return {
      token,
      refreshToken,
      user: userWithoutPassword,
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    return this.refreshService.refreshAccessToken(refreshToken)
  }
}
