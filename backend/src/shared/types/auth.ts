import type { Request } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'

export type UserRole = 'client' | 'professional' | 'admin'

export interface AuthUser {
  id: string
  role: UserRole
}

export interface AuthedRequest extends Request {
  user: AuthUser
  accessToken?: string
  db?: SupabaseClient
}
