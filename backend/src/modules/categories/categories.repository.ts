import { pool } from '../../shared/database/connection.js'

export interface CategoryEntity {
  id: string
  name: string
}

export class CategoriesRepository {
  async findAll(): Promise<CategoryEntity[]> {
    const result = await pool.query<CategoryEntity>(
      `SELECT id, name FROM public.categories ORDER BY name ASC`,
    )
    return result.rows
  }
}
