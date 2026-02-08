import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  locationScope: z.enum(['national', 'state', 'city']).optional(),
  uf: z.string().length(2).optional(),
  city: z.string().optional(),
  isRemote: z.boolean().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const listProfessionalsSchema = z.object({
  categoryId: z.string().uuid().optional(),
  city: z.string().min(1).optional(),
  uf: z.string().length(2).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

export type ListProfessionalsQuery = z.infer<typeof listProfessionalsSchema>
