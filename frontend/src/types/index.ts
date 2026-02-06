export type View =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'services'
  | 'service-detail'
  | 'create-service'
  | 'my-services'
  | 'proposals'
  | 'profile'
  | 'edit-profile'
  | 'public-services'

export type UserRole = 'client' | 'professional'

export type AuthState =
  | { state: 'anonymous' }
  | {
    state: 'authenticated'
    token: string
    user: User
  }

export interface Proposal {
  id: string
  service_request_id: string
  professional_id: string
  value: number
  description: string
  estimated_days: number
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  service_request_title?: string
  professional_name?: string
  professional_email?: string
}

export interface User {
  id: string
  email: string
  name: string | null
  description?: string | null
  role: UserRole
  avatar_url?: string | null
}

export interface Profile {
  bio: string | null
  phone: string | null
  skills: string[] | null
}

export interface Category { id: string; name: string }
export interface Region { id: string; name: string }

export interface Service {
  id: string
  client_id?: string
  title: string
  description?: string
  category_id?: string
  category_name: string | null
  region_id?: string
  region_name: string | null
  location_scope?: 'national' | 'state' | 'city'
  uf?: string
  city?: string
  budget_min?: number
  budget_max?: number
  urgency: 'low' | 'medium' | 'high'
  status: 'open' | 'matched' | 'closed' | 'cancelled'
  created_at: string
  proposals_count?: number
}
