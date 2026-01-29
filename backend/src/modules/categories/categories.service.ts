import { CategoriesRepository, CategoryEntity } from './categories.repository.js'

export class CategoriesService {
  constructor(private repository: CategoriesRepository) {}

  async getAll(): Promise<CategoryEntity[]> {
    return this.repository.findAll()
  }
}
