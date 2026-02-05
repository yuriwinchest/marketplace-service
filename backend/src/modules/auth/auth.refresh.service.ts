import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { config } from '../../config/unifiedConfig.js'
import { supabase } from '../../shared/database/supabaseClient.js'

const jwtLib =
  ((jwt as unknown as { default?: typeof jwt }).default as typeof jwt | undefined) ?? jwt

export interface RefreshTokenResult {
  token: string
  refreshToken: string
}

export class AuthRefreshService {
  async generateRefreshToken(userId: string): Promise<string> {
    const token = randomUUID()
    const tokenHash = await bcrypt.hash(token, 10)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    const { error } = await supabase
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      })

    if (error) {
      console.warn('Erro ao criar refresh token:', error.message)
      throw new Error('Erro ao criar refresh token')
    }

    return token
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('id, user_id, token_hash, expires_at, revoked_at')
      .gt('expires_at', new Date().toISOString())
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Erro ao buscar refresh tokens:', error.message)
      return null
    }

    for (const row of data || []) {
      const isValid = await bcrypt.compare(token, row.token_hash)
      if (isValid) {
        return { userId: row.user_id }
      }
    }

    return null
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('id, token_hash')
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Erro ao buscar refresh tokens:', error.message)
      return
    }

    for (const row of data || []) {
      const isValid = await bcrypt.compare(token, row.token_hash)
      if (isValid) {
        await supabase
          .from('refresh_tokens')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', row.id)
        return
      }
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
    const tokenData = await this.verifyRefreshToken(refreshToken)
    if (!tokenData) {
      throw new Error('Refresh token inválido ou expirado')
    }

    // Buscar dados do usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', tokenData.userId)
      .single()

    if (error || !user) {
      throw new Error('Usuário não encontrado')
    }

    // Gerar novo access token (15 minutos)
    const accessToken = jwtLib.sign(
      { sub: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' },
    )

    return {
      token: accessToken,
      refreshToken, // Reutilizar o mesmo refresh token
    }
  }
}
