import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { config } from '../../config/unifiedConfig.js'
import { pool } from '../../shared/database/connection.js'

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

    await pool.query(
      `INSERT INTO public.refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt.toISOString()],
    )

    return token
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    const result = await pool.query<{
      id: string
      user_id: string
      token_hash: string
      expires_at: string
      revoked_at: string | null
    }>(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM public.refresh_tokens
       WHERE expires_at > now() AND revoked_at IS NULL
       ORDER BY created_at DESC
       LIMIT 10`,
    )

    for (const row of result.rows) {
      const isValid = await bcrypt.compare(token, row.token_hash)
      if (isValid) {
        return { userId: row.user_id }
      }
    }

    return null
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const result = await pool.query<{
      id: string
      token_hash: string
    }>(
      `SELECT id, token_hash
       FROM public.refresh_tokens
       WHERE revoked_at IS NULL
       ORDER BY created_at DESC
       LIMIT 10`,
    )

    for (const row of result.rows) {
      const isValid = await bcrypt.compare(token, row.token_hash)
      if (isValid) {
        await pool.query(
          `UPDATE public.refresh_tokens
           SET revoked_at = now()
           WHERE id = $1`,
          [row.id],
        )
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
    const userResult = await pool.query<{
      id: string
      role: string
    }>(
      `SELECT id, role FROM public.users WHERE id = $1`,
      [tokenData.userId],
    )

    const user = userResult.rows[0]
    if (!user) {
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
