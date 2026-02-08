import type { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { BaseController } from '../../shared/base/BaseController.js'
import { UsersService } from './users.service.js'
import { listProfessionalsSchema, updateProfileSchema } from './users.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'
import { config } from '../../config/unifiedConfig.js'

export class UsersController extends BaseController {
  constructor(private usersService: UsersService) {
    super()
  }

  async getProfile(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const result = await this.usersService.getProfile(db, req.user.id)
      return this.success(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar perfil'
      if (message === 'Usuário não encontrado') {
        return this.notFound(res, message)
      }
      return this.serverError(res, message)
    }
  }

  async updateProfile(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      await this.usersService.updateProfile(db, req.user.id, parsed.data)
      return this.success(res, { success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      return this.serverError(res, message)
    }
  }

  async updateAvatar(req: AuthedRequest, res: Response): Promise<Response> {
    const file = (req as any).file
    if (!file) {
      return this.error(res, 'Nenhum arquivo enviado')
    }

    const avatarUrl = `/uploads/${file.filename}`

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const oldAvatar = await this.usersService.updateAvatar(db, req.user.id, avatarUrl)

      // Remover arquivo antigo se existir
      if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
        const uploadsDir = path.join(process.cwd(), config.uploads.directory)
        const oldPath = path.join(uploadsDir, path.basename(oldAvatar))
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }

      return this.success(res, { avatarUrl })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar avatar'
      return this.serverError(res, message)
    }
  }

  async listProfessionals(req: Request, res: Response): Promise<Response> {
    const role = (req as any).user?.role as string | undefined
    if (role === 'professional') {
      return this.forbidden(res, 'Profissionais não podem listar outros profissionais')
    }

    const parsed = listProfessionalsSchema.safeParse(req.query)
    if (!parsed.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    const { categoryId, city, uf, page, limit } = parsed.data

    try {
      const filters = {
        ...(categoryId && { categoryId }),
        ...(city && { city }),
        ...(uf && { uf }),
      }

      const results = await this.usersService.findProfessionals(
        filters,
        { page, limit },
      )
      return this.success(res, { items: results })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar profissionais'
      return this.serverError(res, message)
    }
  }
}
