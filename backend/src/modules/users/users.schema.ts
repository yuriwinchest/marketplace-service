import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  locationScope: z.enum(['national', 'state', 'city']).optional(),
  uf: z.string().length(2).optional(),
  city: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
