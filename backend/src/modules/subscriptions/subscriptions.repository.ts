import { pool } from '../../shared/database/connection.js'
import { CreateSubscriptionInput, UpdateSubscriptionStatusInput } from './subscriptions.schema.js'

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
    const result = await pool.query<SubscriptionEntity>(
      `SELECT id, professional_id, stripe_subscription_id, stripe_customer_id, 
              status, current_period_start, current_period_end, cancel_at_period_end,
              created_at, updated_at
       FROM public.subscriptions
       WHERE professional_id = $1`,
      [professionalId],
    )
    return result.rows[0] || null
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const result = await pool.query<SubscriptionEntity>(
      `SELECT id, professional_id, stripe_subscription_id, stripe_customer_id,
              status, current_period_start, current_period_end, cancel_at_period_end,
              created_at, updated_at
       FROM public.subscriptions
       WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId],
    )
    return result.rows[0] || null
  }

  async create(
    professionalId: string,
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionEntity> {
    const result = await pool.query<SubscriptionEntity>(
      `INSERT INTO public.subscriptions (professional_id, stripe_subscription_id, stripe_customer_id, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, professional_id, stripe_subscription_id, stripe_customer_id,
                 status, current_period_start, current_period_end, cancel_at_period_end,
                 created_at, updated_at`,
      [professionalId, input.stripeSubscriptionId, input.stripeCustomerId],
    )

    if (!result.rows[0]) {
      throw new Error('Erro ao criar assinatura')
    }

    return result.rows[0]
  }

  async updateStatus(
    subscriptionId: string,
    input: UpdateSubscriptionStatusInput,
  ): Promise<SubscriptionEntity> {
    const result = await pool.query<SubscriptionEntity>(
      `UPDATE public.subscriptions
       SET status = $1,
           current_period_start = $2,
           current_period_end = $3,
           cancel_at_period_end = COALESCE($4, cancel_at_period_end),
           updated_at = now()
       WHERE id = $5
       RETURNING id, professional_id, stripe_subscription_id, stripe_customer_id,
                 status, current_period_start, current_period_end, cancel_at_period_end,
                 created_at, updated_at`,
      [
        input.status,
        input.currentPeriodStart ?? null,
        input.currentPeriodEnd ?? null,
        input.cancelAtPeriodEnd ?? null,
        subscriptionId,
      ],
    )

    if (!result.rows[0]) {
      throw new Error('Assinatura não encontrada')
    }

    return result.rows[0]
  }

  async updateProfessionalProfileStatus(
    professionalId: string,
    status: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE public.professional_profiles
       SET subscription_status = $1
       WHERE id = $2`,
      [status, professionalId],
    )
  }

  async isActive(professionalId: string): Promise<boolean> {
    const subscription = await this.findByProfessionalId(professionalId)
    return subscription?.status === 'active' || subscription?.status === 'trialing'
  }
}
