import type { Request } from 'express'

export type UserRole = 'client' | 'professional' | 'admin'

export interface AuthUser {
  id: string
  role: UserRole
}

export interface AuthedRequest extends Request {
  user: AuthUser
}
