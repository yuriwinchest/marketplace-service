export type UserRole = 'client' | 'professional' | 'admin'

export interface AuthUser {
  id: string
  role: UserRole
}

export interface AuthedRequest extends Express.Request {
  user: AuthUser
}
