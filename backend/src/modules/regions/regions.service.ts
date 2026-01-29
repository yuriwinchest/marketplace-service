import { RegionsRepository, RegionEntity } from './regions.repository.js'

export class RegionsService {
  constructor(private repository: RegionsRepository) {}

  async getAll(): Promise<RegionEntity[]> {
    return this.repository.findAll()
  }
}
