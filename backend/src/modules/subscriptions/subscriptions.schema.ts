import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  stripeCustomerId: z.string().min(1, 'Stripe Customer ID é obrigatório'),
  stripeSubscriptionId: z.string().min(1, 'Stripe Subscription ID é obrigatório'),
})

export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'cancelled', 'past_due', 'trialing']),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionStatusInput = z.infer<typeof updateSubscriptionStatusSchema>
