import type { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { AuthService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import { z } from 'zod'

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super()
  }

  async register(req: Request, res: Response): Promise<Response> {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    const file = (req as any).file as { filename?: string } | undefined
    const fileAvatarUrl = file?.filename ? `/uploads/${file.filename}` : undefined
    const avatarUrl = fileAvatarUrl ?? parsed.data.avatarUrl
    if (!avatarUrl || !String(avatarUrl).trim()) {
      return this.error(res, 'Foto é obrigatória')
    }

    try {
      const result = await this.authService.register({
        ...parsed.data,
        avatarUrl,
      })
      return this.created(res, { userId: result.id })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar'
      if (message === 'E-mail já cadastrado') {
        return this.error(res, message, 409)
      }
      return this.serverError(res, message)
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const result = await this.authService.login(parsed.data)
      return this.success(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      if (message === 'Credenciais inválidas') {
        return this.unauthorized(res, message)
      }
      return this.serverError(res, message)
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    const parsed = refreshTokenSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const result = await this.authService.refreshToken(parsed.data.refreshToken)
      return this.success(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao renovar token'
      if (message.includes('inválido') || message.includes('expirado')) {
        return this.unauthorized(res, message)
      }
      return this.serverError(res, message)
    }
  }
}
