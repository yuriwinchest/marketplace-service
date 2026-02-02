import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ServicesService } from './services.service.js'
import { createRequestSchema } from './services.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class ServicesController extends BaseController {
  constructor(private servicesService: ServicesService) {
    super()
  }

  async createRequest(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = createRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const result = await this.servicesService.createRequest(req.user.id, parsed.data)
      return this.created(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar solicitação'
      return this.serverError(res, message)
    }
  }

  async getClientRequests(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      const requests = await this.servicesService.getClientRequests(req.user.id)
      return this.success(res, { items: requests })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar solicitações')
    }
  }

  async getOpenRequests(req: AuthedRequest, res: Response): Promise<Response> {
    // Public endpoint - no role check needed
    // if (req.user?.role !== 'professional' && req.user?.role !== 'admin') {
    //   return this.forbidden(res)
    // }

    const { page, limit } = req.query as { page?: string; limit?: string }
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 20

    try {
      const requests = await this.servicesService.getOpenRequests({
        page: pageNum,
        limit: limitNum,
      })
      return this.success(res, { items: requests })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar solicitações')
    }
  }

  async getProposalStats(req: AuthedRequest, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      const stats = await this.servicesService.getProposalStats(id)
      return this.success(res, stats)
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar estatísticas')
    }
  }
}
