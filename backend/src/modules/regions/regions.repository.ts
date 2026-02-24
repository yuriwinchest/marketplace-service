import { pool } from '../../shared/database/connection.js'

export interface RegionEntity {
  id: string
  name: string
}

export class RegionsRepository {
  async findAll(): Promise<RegionEntity[]> {
    try {
      const { rows } = await pool.query<RegionEntity>('SELECT id, name FROM regions ORDER BY name ASC')
      return rows
    } catch (error) {
      console.warn('Falha ao buscar regiões. Usando dados mockados.', error)
      return this.getMockedRegions()
    }
  }

  private getMockedRegions(): RegionEntity[] {
    return [
      { id: '1', name: 'Norte' },
      { id: '2', name: 'Nordeste' },
      { id: '3', name: 'Centro-Oeste' },
      { id: '4', name: 'Sudeste' },
      { id: '5', name: 'Sul' },
    ]
  }
}
