import { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { CategoriesService } from './categories.service.js'

export class CategoriesController extends BaseController {
  constructor(private categoriesService: CategoriesService) {
    super()
  }

  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.categoriesService.getAll()
      return this.success(res, { items: categories })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar categorias')
    }
  }
}
