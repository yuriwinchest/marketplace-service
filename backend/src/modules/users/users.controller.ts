import type { Response } from 'express'
import path from 'path'
import fs from 'fs'
import { BaseController } from '../../shared/base/BaseController.js'
import { UsersService } from './users.service.js'
import { updateProfileSchema } from './users.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'
import { config } from '../../config/unifiedConfig.js'

export class UsersController extends BaseController {
  constructor(private usersService: UsersService) {
    super()
  }

  async getProfile(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      const result = await this.usersService.getProfile(req.user.id)
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
      await this.usersService.updateProfile(req.user.id, parsed.data)
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
      const oldAvatar = await this.usersService.updateAvatar(req.user.id, avatarUrl)

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

  async listProfessionals(req: AuthedRequest, res: Response): Promise<Response> {
    const { categoryId, city, uf, page, limit } = req.query as {
      categoryId?: string
      city?: string
      uf?: string
      page?: string
      limit?: string
    }

    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 20

    try {
      const filters = {
        ...(categoryId && { categoryId }),
        ...(city && { city }),
        ...(uf && { uf }),
      }

      const results = await this.usersService.findProfessionals(
        filters,
        { page: pageNum, limit: limitNum },
      )
      return this.success(res, results)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar profissionais'
      return this.serverError(res, message)
    }
  }
}
