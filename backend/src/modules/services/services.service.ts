import { ServicesRepository } from './services.repository.js'
import type { ServiceRequestEntity } from './services.repository.js'
import type { CreateRequestInput } from './services.schema.js'

export class ServicesService {
  constructor(private repository: ServicesRepository) { }

  async createRequest(clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    return this.repository.create(clientId, input)
  }

  async getClientRequests(clientId: string): Promise<ServiceRequestEntity[]> {
    return this.repository.findByClientId(clientId)
  }

  async getOpenRequests(
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
    filters: { urgentOnly?: boolean } = {},
  ): Promise<ServiceRequestEntity[]> {
    return this.repository.findOpenRequests(pagination, filters)
  }

  async getProposalStats(serviceRequestId: string) {
    return this.repository.getProposalStats(serviceRequestId)
  }

  async promoteUrgent(serviceRequestId: string, clientId: string): Promise<void> {
    await this.repository.promoteUrgent(serviceRequestId, clientId)
  }
}
