import { z } from 'zod'

export const createProposalSchema = z.object({
  serviceRequestId: z.string().uuid('ID da demanda inválido'),
  value: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  estimatedDays: z.number().int().positive().optional(),
  photoUrls: z.array(z.string().url('URL de foto inválida')).max(10).optional(),
  videoUrls: z.array(z.string().url('URL de vídeo inválida')).max(10).optional(),
})

export const updateProposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled']),
})

export const updateProposalSchema = z.object({
  value: z.number().positive('Valor deve ser positivo').optional(),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').optional(),
  estimatedDays: z.number().int().positive().optional(),
  photoUrls: z.array(z.string().url('URL de foto inválida')).max(10).optional(),
  videoUrls: z.array(z.string().url('URL de vídeo inválida')).max(10).optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'Nenhum campo para atualizar' })

export type CreateProposalInput = z.infer<typeof createProposalSchema>
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>
