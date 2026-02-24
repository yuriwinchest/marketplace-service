import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { RatingsService } from './ratings.service.js'
import { createRatingSchema } from './ratings.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class RatingsController extends BaseController {
  constructor(private ratingsService: RatingsService) {
    super()
  }

  async create(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = createRatingSchema.safeParse(req.body)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(', ')
      return this.error(res, `Dados invalidos: ${message}`)
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Nao autenticado')
      const rating = await this.ratingsService.create(db, req.user.id, parsed.data)
      return this.created(res, { rating })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar avaliacao'
      return this.error(res, message, 400)
    }
  }

  async listByUser(req: AuthedRequest, res: Response): Promise<Response> {
    const toUserId = req.params.userId as string
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Nao autenticado')
      const result = await this.ratingsService.listByUserId(db, toUserId, { page, limit })
      return this.success(res, result)
    } catch {
      return this.serverError(res, 'Erro ao listar avaliacoes')
    }
  }
}
