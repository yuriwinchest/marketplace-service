import { ServicesRepository } from './services.repository.js'
import type { ServiceRequestEntity } from './services.repository.js'
import type { CreateRequestInput, UpdateRequestInput } from './services.schema.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ServicesService {
  constructor(private repository: ServicesRepository) {}

  async createRequest(db: SupabaseClient, clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    const created = await this.repository.create(db, clientId, input)

    // Best-effort: notify subscribed professionals via a SECURITY DEFINER RPC (no service-role key needed).
    try {
      await db.rpc('notify_professionals_new_request', { p_request_id: created.id })
    } catch (err) {
      console.warn('Falha ao notificar profissionais sobre nova demanda:', err)
    }

    return created
  }

  async getClientRequests(db: SupabaseClient, clientId: string): Promise<ServiceRequestEntity[]> {
    return this.repository.findByClientId(db, clientId)
  }

  async getOpenRequests(
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
    filters: {
      urgentOnly?: boolean
      categoryId?: string
      urgency?: string
      uf?: string
      city?: string
      budgetMin?: number
      budgetMax?: number
    } = {},
  ): Promise<ServiceRequestEntity[]> {
    return this.repository.findOpenRequests(pagination, filters)
  }

  async getRequestById(db: SupabaseClient, serviceRequestId: string): Promise<ServiceRequestEntity | null> {
    return this.repository.findById(db, serviceRequestId)
  }

  async getProposalStats(db: SupabaseClient, serviceRequestId: string, opts?: { includeProfessionals?: boolean }) {
    return this.repository.getProposalStats(db, serviceRequestId, opts)
  }

  async updateRequest(
    db: SupabaseClient,
    clientId: string,
    serviceRequestId: string,
    input: UpdateRequestInput,
  ): Promise<ServiceRequestEntity> {
    const updated = await this.repository.updateRequest(db, serviceRequestId, clientId, input)

    // Best-effort: notify professionals who already proposed.
    try {
      await db.rpc('notify_professionals_request_updated', { p_request_id: serviceRequestId })
    } catch (err) {
      console.warn('Falha ao notificar profissionais sobre demanda atualizada:', err)
    }

    return updated
  }

  async promoteUrgent(db: SupabaseClient, serviceRequestId: string, clientId: string): Promise<void> {
    await this.repository.promoteUrgent(db, serviceRequestId, clientId)
  }
}
