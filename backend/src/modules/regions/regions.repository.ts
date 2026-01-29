import { pool } from '../../shared/database/connection.js'

export interface RegionEntity {
  id: string
  name: string
}

export class RegionsRepository {
  async findAll(): Promise<RegionEntity[]> {
    const result = await pool.query<RegionEntity>(
      `SELECT id, name FROM public.regions ORDER BY name ASC`,
    )
    return result.rows
  }
}
