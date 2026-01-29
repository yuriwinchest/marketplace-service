import { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { RegionsService } from './regions.service.js'

export class RegionsController extends BaseController {
  constructor(private regionsService: RegionsService) {
    super()
  }

  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const regions = await this.regionsService.getAll()
      return this.success(res, { items: regions })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar regiões')
    }
  }
}
