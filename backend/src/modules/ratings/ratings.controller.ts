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
      return this.error(res, `Dados inválidos: ${message}`)
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const rating = await this.ratingsService.create(db, req.user.id, parsed.data)
      return this.created(res, { rating })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar avaliação'

      if (
        message.includes('não encontrada') ||
        message.includes('não pode avaliar') ||
        message.includes('somente') ||
        message.includes('já avaliou') ||
        message.includes('não é um profissional')
      ) {
        return this.error(res, message, 400)
      }

      return this.serverError(res, message)
    }
  }

  async listByUser(req: AuthedRequest, res: Response): Promise<Response> {
    const toUserId = req.params.userId as string
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

    try {
      const result = await this.ratingsService.listByUserId(toUserId, { page, limit })
      return this.success(res, result)
    } catch (error) {
      return this.serverError(res, 'Erro ao listar avaliações')
    }
  }
}
