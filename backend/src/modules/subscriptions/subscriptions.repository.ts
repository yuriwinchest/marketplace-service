import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateSubscriptionInput } from './subscriptions.schema.js'
import { FREE_PROPOSAL_LIMIT, getPlanByCode, type SubscriptionPlanCode } from './subscriptionPlans.js'

export interface SubscriptionEntity {
  id: string
  professional_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  plan_code: SubscriptionPlanCode | null
  plan_name: string | null
  monthly_price: string | null
  proposal_limit: number | null
  proposals_used_in_period: number
  created_at: string
  updated_at: string
}

interface ProfessionalUsageEntity {
  id: string
  free_proposals_used: number
}

export interface ProposalQuotaStatus {
  freeProposalsUsed: number
  freeProposalsRemaining: number
  subscriptionProposalsUsed: number
  subscriptionProposalsRemaining: number
  planCode: SubscriptionPlanCode | null
  subscriptionStatus: SubscriptionEntity['status'] | null
}

const SUBSCRIPTION_SELECT =
  'id, professional_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, plan_code, plan_name, monthly_price, proposal_limit, proposals_used_in_period, created_at, updated_at'

export class SubscriptionsRepository {
  async findByProfessionalId(db: SupabaseClient, professionalId: string): Promise<SubscriptionEntity | null> {
    const { data, error } = await db
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .eq('professional_id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura:', error.message)
    }

    return (data as SubscriptionEntity) || null
  }

  async create(db: SupabaseClient, professionalId: string, input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    // The DB RPC enforces ownership and writes in a controlled way.
    const plan = getPlanByCode(input.planCode)
    const { error } = await db.rpc('create_subscription', { p_professional_id: professionalId, p_plan_code: plan.code })
    if (error) throw new Error(error.message || 'Erro ao criar assinatura')

    const created = await this.findByProfessionalId(db, professionalId)
    if (!created) throw new Error('Erro ao criar assinatura')
    return created
  }

  async isActive(db: SupabaseClient, professionalId: string): Promise<boolean> {
    const subscription = await this.findByProfessionalId(db, professionalId)
    return this.isSubscriptionActive(subscription)
  }

  async getQuotaStatus(db: SupabaseClient, professionalId: string): Promise<ProposalQuotaStatus> {
    const [profile, subscription] = await Promise.all([
      this.getProfessionalUsage(db, professionalId),
      this.findByProfessionalId(db, professionalId),
    ])

    const freeUsed = profile?.free_proposals_used ?? 0
    const freeRemaining = Math.max(0, FREE_PROPOSAL_LIMIT - freeUsed)

    if (!subscription || !this.isSubscriptionActive(subscription)) {
      return {
        freeProposalsUsed: freeUsed,
        freeProposalsRemaining: freeRemaining,
        subscriptionProposalsUsed: 0,
        subscriptionProposalsRemaining: 0,
        planCode: null,
        subscriptionStatus: subscription?.status ?? null,
      }
    }

    const subscriptionUsed = subscription.proposals_used_in_period ?? 0
    const subscriptionLimit = subscription.proposal_limit ?? 0

    return {
      freeProposalsUsed: freeUsed,
      freeProposalsRemaining: freeRemaining,
      subscriptionProposalsUsed: subscriptionUsed,
      subscriptionProposalsRemaining: Math.max(0, subscriptionLimit - subscriptionUsed),
      planCode: subscription.plan_code,
      subscriptionStatus: subscription.status,
    }
  }

  async consumeProposalQuota(db: SupabaseClient, professionalId: string): Promise<void> {
    const { error } = await db.rpc('consume_proposal_quota', { p_professional_id: professionalId })
    if (error) throw new Error(error.message || 'Nao foi possivel consumir limite do plano')
  }

  private async getProfessionalUsage(db: SupabaseClient, professionalId: string): Promise<ProfessionalUsageEntity | null> {
    const { data, error } = await db
      .from('professional_profiles')
      .select('id, free_proposals_used')
      .eq('id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar uso gratuito de propostas:', error.message)
    }

    return (data as ProfessionalUsageEntity) || null
  }

  private isSubscriptionActive(subscription: SubscriptionEntity | null): boolean {
    if (!subscription) return false
    if (!(subscription.status === 'active' || subscription.status === 'trialing')) return false
    if (!subscription.current_period_end) return true
    return new Date(subscription.current_period_end).getTime() >= Date.now()
  }
}

