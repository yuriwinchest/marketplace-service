import { SubscriptionsRepository } from './subscriptions.repository.js'
import type { SubscriptionEntity } from './subscriptions.repository.js'
import type { CreateSubscriptionInput, UpdateSubscriptionStatusInput } from './subscriptions.schema.js'
import { listPlans } from './subscriptionPlans.js'
import type { ProposalQuotaStatus } from './subscriptions.repository.js'

export class SubscriptionsService {
  constructor(private repository: SubscriptionsRepository) {}

  async getByProfessionalId(professionalId: string, opts?: { db?: import('@supabase/supabase-js').SupabaseClient }): Promise<SubscriptionEntity | null> {
    return this.repository.findByProfessionalId(professionalId, opts?.db)
  }

  getPlans() {
    return listPlans()
  }

  async create(professionalId: string, input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const subscription = await this.repository.create(professionalId, input)

    // Sincronizar status no professional_profiles
    await this.repository.updateProfessionalProfileStatus(professionalId, 'active')

    return subscription
  }

  async updateFromWebhook(
    stripeSubscriptionId: string,
    input: UpdateSubscriptionStatusInput,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.repository.findByStripeSubscriptionId(stripeSubscriptionId)
    if (!subscription) {
      throw new Error('Assinatura não encontrada')
    }

    const updated = await this.repository.updateStatus(subscription.id, input)

    // Sincronizar status no professional_profiles
    await this.repository.updateProfessionalProfileStatus(
      subscription.professional_id,
      input.status,
    )

    return updated
  }

  async isActive(professionalId: string, opts?: { db?: import('@supabase/supabase-js').SupabaseClient }): Promise<boolean> {
    return this.repository.isActive(opts?.db, professionalId)
  }

  async getQuotaStatus(professionalId: string, opts?: { db?: import('@supabase/supabase-js').SupabaseClient }): Promise<ProposalQuotaStatus> {
    return this.repository.getQuotaStatus(professionalId, opts?.db)
  }

  async consumeProposalQuota(professionalId: string) {
    return this.repository.consumeProposalQuota(professionalId)
  }
}
