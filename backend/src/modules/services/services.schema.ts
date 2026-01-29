import { z } from 'zod'

export const createRequestSchema = z.object({
  categoryId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  locationScope: z.enum(['national', 'state', 'city']).optional(),
  uf: z.string().length(2).optional(),
  city: z.string().optional(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
