import { z } from 'zod'

export const getContactSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  serviceRequestId: z.string().uuid().optional(),
})

export type GetContactInput = z.infer<typeof getContactSchema>
