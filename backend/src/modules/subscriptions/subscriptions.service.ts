import { SubscriptionsRepository } from './subscriptions.repository.js'
import type { SubscriptionEntity, ProposalQuotaStatus } from './subscriptions.repository.js'
import type { CreateSubscriptionInput } from './subscriptions.schema.js'
import { listPlans } from './subscriptionPlans.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class SubscriptionsService {
  constructor(private repository: SubscriptionsRepository) {}

  getPlans() {
    return listPlans()
  }

  async getByProfessionalId(db: SupabaseClient, professionalId: string): Promise<SubscriptionEntity | null> {
    return this.repository.findByProfessionalId(db, professionalId)
  }

  async create(db: SupabaseClient, professionalId: string, input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    return this.repository.create(db, professionalId, input)
  }

  async isActive(db: SupabaseClient, professionalId: string): Promise<boolean> {
    return this.repository.isActive(db, professionalId)
  }

  async getQuotaStatus(db: SupabaseClient, professionalId: string): Promise<ProposalQuotaStatus> {
    return this.repository.getQuotaStatus(db, professionalId)
  }

  async consumeProposalQuota(db: SupabaseClient, professionalId: string): Promise<void> {
    return this.repository.consumeProposalQuota(db, professionalId)
  }
}

