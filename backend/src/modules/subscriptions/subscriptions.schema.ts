import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  planCode: z.enum(['starter_20', 'pro_50', 'max_100', 'enterprise_200']),
})

export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'cancelled', 'past_due', 'trialing']),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionStatusInput = z.infer<typeof updateSubscriptionStatusSchema>
