import { supabase } from '../../shared/database/supabaseClient.js'
import type { CreateSubscriptionInput, UpdateSubscriptionStatusInput } from './subscriptions.schema.js'

export interface SubscriptionEntity {
  id: string
  professional_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export class SubscriptionsRepository {
  async findByProfessionalId(professionalId: string): Promise<SubscriptionEntity | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, professional_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
      .eq('professional_id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura:', error.message)
    }
    return (data as SubscriptionEntity) || null
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, professional_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura por Stripe ID:', error.message)
    }
    return (data as SubscriptionEntity) || null
  }

  async create(
    professionalId: string,
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionEntity> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        professional_id: professionalId,
        stripe_subscription_id: input.stripeSubscriptionId,
        stripe_customer_id: input.stripeCustomerId,
        status: 'active',
      })
      .select('id, professional_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar assinatura')
    }

    return data as SubscriptionEntity
  }

  async updateStatus(
    subscriptionId: string,
    input: UpdateSubscriptionStatusInput,
  ): Promise<SubscriptionEntity> {
    const updateData: any = {
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
      .select('id, professional_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Assinatura não encontrada')
    }

    return data as SubscriptionEntity
  }

  async updateProfessionalProfileStatus(
    professionalId: string,
    status: string,
  ): Promise<void> {
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
    return subscription?.status === 'active' || subscription?.status === 'trialing'
  }
}
