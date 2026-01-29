import { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ServicesService } from './services.service.js'
import { createRequestSchema } from './services.schema.js'
import { AuthedRequest } from '../../shared/types/auth.js'

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
    if (req.user.role !== 'professional' && req.user.role !== 'admin') {
      return this.forbidden(res)
    }

    try {
      const requests = await this.servicesService.getOpenRequests()
      return this.success(res, { items: requests })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar solicitações')
    }
  }
}
