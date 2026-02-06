import { z } from 'zod'

export const createRatingSchema = z.object({
  requestId: z.string().uuid('ID da demanda inválido'),
  toUserId: z.string().uuid('ID do usuário avaliado inválido'),
  score: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
  comment: z.string().min(3, 'Comentário deve ter no mínimo 3 caracteres').max(1000).optional(),
})

export const listRatingsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export type CreateRatingInput = z.infer<typeof createRatingSchema>
export type ListRatingsInput = z.infer<typeof listRatingsSchema>
