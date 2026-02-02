import { RegionsRepository } from './regions.repository.js'
import type { RegionEntity } from './regions.repository.js'

export class RegionsService {
  constructor(private repository: RegionsRepository) { }

  async getAll(): Promise<RegionEntity[]> {
    return this.repository.findAll()
  }
}
