import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
  description: z.string().min(10, 'Descricao deve ter no minimo 10 caracteres'),
  name: z.string().min(1).optional(),
  role: z.enum(['client', 'professional']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(1, 'Senha e obrigatoria'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

