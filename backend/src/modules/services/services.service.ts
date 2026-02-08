import { ServicesRepository } from './services.repository.js'
import type { ServiceRequestEntity } from './services.repository.js'
import type { CreateRequestInput, UpdateRequestInput } from './services.schema.js'
import type { NotificationsService } from '../notifications/notifications.service.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ServicesService {
  constructor(
    private repository: ServicesRepository,
    private notificationsService?: NotificationsService,
  ) { }

  async createRequest(db: SupabaseClient, clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    const created = await this.repository.create(db, clientId, input)

    // Notify subscribed professionals about a new demand (best-effort; never block creation).
    try {
      if (this.notificationsService) {
        const request = await this.repository.findById(db, created.id)
        const targets = await this.repository.findProfessionalUserIdsToNotifyNewRequest(
          {
            categoryId: request?.category_id ?? input.categoryId ?? null,
            locationScope: request?.location_scope ?? input.locationScope ?? null,
            uf: request?.uf ?? input.uf ?? null,
            city: request?.city ?? input.city ?? null,
          },
          { limit: 200 },
        )

        if (targets.length > 0) {
          await this.notificationsService.notifyMany(
            targets,
            'Nova demanda disponível',
            `Uma nova demanda foi publicada: "${input.title}".`,
            'SYSTEM_ALERT',
            { subtype: 'REQUEST_CREATED', serviceRequestId: created.id },
          )
        }
      }
    } catch (err) {
      // Best-effort: never fail the request creation due to notification issues.
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

  async getProposalStats(
    serviceRequestId: string,
    opts?: { includeProfessionals?: boolean },
  ) {
    return this.repository.getProposalStats(serviceRequestId, opts)
  }

  async updateRequest(
    db: SupabaseClient,
    clientId: string,
    serviceRequestId: string,
    input: UpdateRequestInput,
  ): Promise<ServiceRequestEntity> {
    const updated = await this.repository.updateRequest(db, serviceRequestId, clientId, input)

    // Notify professionals who already sent proposals (best-effort).
    try {
      if (this.notificationsService) {
        const targets = await this.repository.findProfessionalUserIdsForServiceRequest(serviceRequestId)
        if (targets.length > 0) {
          await this.notificationsService.notifyMany(
            targets,
            'Demanda atualizada',
            `O cliente atualizou a demanda "${updated.title}".`,
            'SYSTEM_ALERT',
            { subtype: 'REQUEST_UPDATED', serviceRequestId },
          )
        }
      }
    } catch (err) {
      console.warn('Falha ao notificar profissionais sobre demanda atualizada:', err)
    }

    return updated
  }

  async promoteUrgent(db: SupabaseClient, serviceRequestId: string, clientId: string): Promise<void> {
    await this.repository.promoteUrgent(db, serviceRequestId, clientId)
  }
}
