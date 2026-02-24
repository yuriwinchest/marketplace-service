import { z } from 'zod'

const ufSchema = z.string().trim().length(2).regex(/^[A-Za-z]{2}$/)
const citySchema = z.string().trim().min(1).max(64).regex(/^[^,()]+$/)

export const openRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  urgentOnly: z.coerce.boolean().optional(),
  categoryId: z.string().uuid().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  uf: ufSchema.optional(),
  city: citySchema.optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
})

export type OpenRequestsQuery = z.infer<typeof openRequestsQuerySchema>

export const createRequestSchema = z.object({
  categoryId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  title: z.string().min(3, 'Titulo deve ter no minimo 3 caracteres'),
  description: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  locationScope: z.enum(['national', 'state', 'city']).optional(),
  uf: ufSchema.optional(),
  city: citySchema.optional(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>

export const updateRequestSchema = z.object({
  categoryId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  title: z.string().min(3, 'Titulo deve ter no minimo 3 caracteres').optional(),
  description: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  locationScope: z.enum(['national', 'state', 'city']).optional(),
  uf: ufSchema.optional(),
  city: citySchema.optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'Nenhum campo para atualizar' })

export type UpdateRequestInput = z.infer<typeof updateRequestSchema>

export const requestIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export type RequestIdParams = z.infer<typeof requestIdParamsSchema>

