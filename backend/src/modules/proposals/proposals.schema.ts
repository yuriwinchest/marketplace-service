import { z } from 'zod'

export const createProposalSchema = z.object({
  serviceRequestId: z.string().uuid('ID da demanda inválido'),
  value: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  estimatedDays: z.number().int().positive().optional(),
})

export const updateProposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled']),
})

export type CreateProposalInput = z.infer<typeof createProposalSchema>
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>
