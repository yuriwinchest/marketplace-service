import { ServicesRepository, ServiceRequestEntity } from './services.repository.js'
import { CreateRequestInput } from './services.schema.js'

export class ServicesService {
  constructor(private repository: ServicesRepository) {}

  async createRequest(clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    return this.repository.create(clientId, input)
  }

  async getClientRequests(clientId: string): Promise<ServiceRequestEntity[]> {
    return this.repository.findByClientId(clientId)
  }

  async getOpenRequests(): Promise<ServiceRequestEntity[]> {
    return this.repository.findOpenRequests()
  }
}
