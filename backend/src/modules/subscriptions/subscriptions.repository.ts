import { supabase } from '../../shared/database/supabaseClient.js'
import type { CreateSubscriptionInput, UpdateSubscriptionStatusInput } from './subscriptions.schema.js'
import {
  FREE_PROPOSAL_LIMIT,
  getPlanByCode,
  type SubscriptionPlanCode,
} from './subscriptionPlans.js'

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

export interface ProposalQuotaConsumption {
  source: 'free' | 'subscription'
  freeProposalsUsed: number
  freeProposalsRemaining: number
  subscriptionProposalsUsed: number
  subscriptionProposalsRemaining: number
  planCode: SubscriptionPlanCode | null
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
  async findByProfessionalId(professionalId: string): Promise<SubscriptionEntity | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .eq('professional_id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura:', error.message)
    }

    return (data as SubscriptionEntity) || null
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura por Stripe ID:', error.message)
    }

    return (data as SubscriptionEntity) || null
  }

  async create(professionalId: string, input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const plan = getPlanByCode(input.planCode)
    const now = new Date()
    const currentPeriodStart = now.toISOString()
    const currentPeriodEndDate = new Date(now)
    currentPeriodEndDate.setMonth(currentPeriodEndDate.getMonth() + 1)

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          professional_id: professionalId,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEndDate.toISOString(),
          cancel_at_period_end: false,
          plan_code: plan.code,
          plan_name: plan.name,
          monthly_price: plan.monthlyPrice,
          proposal_limit: plan.proposalLimit,
          proposals_used_in_period: 0,
          updated_at: now.toISOString(),
        },
        { onConflict: 'professional_id' },
      )
      .select(SUBSCRIPTION_SELECT)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar assinatura')
    }

    return data as SubscriptionEntity
  }

  async updateStatus(subscriptionId: string, input: UpdateSubscriptionStatusInput): Promise<SubscriptionEntity> {
    const updateData: Record<string, unknown> = {
      status: input.status,
      updated_at: new Date().toISOString(),
    }

    if (input.currentPeriodStart !== undefined) {
      updateData.current_period_start = input.currentPeriodStart
    }
    if (input.currentPeriodEnd !== undefined) {
      updateData.current_period_end = input.currentPeriodEnd
    }
    if (input.cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = input.cancelAtPeriodEnd
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select(SUBSCRIPTION_SELECT)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Assinatura não encontrada')
    }

    return data as SubscriptionEntity
  }

  async updateProfessionalProfileStatus(professionalId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('professional_profiles')
      .update({ subscription_status: status })
      .eq('id', professionalId)

    if (error) {
      console.warn('Erro ao atualizar status do perfil:', error.message)
    }
  }

  async isActive(professionalId: string): Promise<boolean> {
    const subscription = await this.findByProfessionalId(professionalId)
    return this.isSubscriptionActive(subscription)
  }

  async getQuotaStatus(professionalId: string): Promise<ProposalQuotaStatus> {
    const profile = await this.getProfessionalUsage(professionalId)
    const subscription = await this.findByProfessionalId(professionalId)
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

  async consumeProposalQuota(professionalId: string): Promise<ProposalQuotaConsumption> {
    const profile = await this.getProfessionalUsage(professionalId)
    if (!profile) {
      throw new Error('Perfil profissional não encontrado')
    }

    const freeUsed = profile.free_proposals_used ?? 0
    if (freeUsed < FREE_PROPOSAL_LIMIT) {
      const updated = await this.incrementFreeProposalsUsage(profile.id, freeUsed)

      return {
        source: 'free',
        freeProposalsUsed: updated,
        freeProposalsRemaining: Math.max(0, FREE_PROPOSAL_LIMIT - updated),
        subscriptionProposalsUsed: 0,
        subscriptionProposalsRemaining: 0,
        planCode: null,
      }
    }

    const subscription = await this.findByProfessionalId(professionalId)
    if (!subscription || !this.isSubscriptionActive(subscription)) {
      throw new Error(
        'Você atingiu o limite gratuito de 3 propostas. Contrate um plano para continuar enviando propostas.',
      )
    }

    const planLimit = subscription.proposal_limit ?? 0
    const usedInPeriod = subscription.proposals_used_in_period ?? 0
    if (usedInPeriod >= planLimit) {
      throw new Error(
        'Você atingiu o limite mensal do seu plano. Faça upgrade ou aguarde a renovação.',
      )
    }

    const updatedSubscriptionUsage = await this.incrementSubscriptionUsage(
      subscription.id,
      usedInPeriod,
    )

    return {
      source: 'subscription',
      freeProposalsUsed: FREE_PROPOSAL_LIMIT,
      freeProposalsRemaining: 0,
      subscriptionProposalsUsed: updatedSubscriptionUsage,
      subscriptionProposalsRemaining: Math.max(0, planLimit - updatedSubscriptionUsage),
      planCode: subscription.plan_code,
    }
  }

  private async getProfessionalUsage(professionalId: string): Promise<ProfessionalUsageEntity | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('id, free_proposals_used')
      .eq('id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar uso gratuito de propostas:', error.message)
    }

    return (data as ProfessionalUsageEntity) || null
  }

  private async incrementFreeProposalsUsage(professionalId: string, expectedCurrentValue: number): Promise<number> {
    const nextValue = expectedCurrentValue + 1

    const { data, error } = await supabase
      .from('professional_profiles')
      .update({ free_proposals_used: nextValue })
      .eq('id', professionalId)
      .eq('free_proposals_used', expectedCurrentValue)
      .select('free_proposals_used')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Não foi possível atualizar limite gratuito')
    }

    return data.free_proposals_used as number
  }

  private async incrementSubscriptionUsage(subscriptionId: string, expectedCurrentValue: number): Promise<number> {
    const nextValue = expectedCurrentValue + 1

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        proposals_used_in_period: nextValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .eq('proposals_used_in_period', expectedCurrentValue)
      .select('proposals_used_in_period')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Não foi possível consumir limite do plano')
    }

    return data.proposals_used_in_period as number
  }

  private isSubscriptionActive(subscription: SubscriptionEntity | null): boolean {
    if (!subscription) {
      return false
    }

    if (!(subscription.status === 'active' || subscription.status === 'trialing')) {
      return false
    }

    if (!subscription.current_period_end) {
      return true
    }

    return new Date(subscription.current_period_end).getTime() >= Date.now()
  }
}
