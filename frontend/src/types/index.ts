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
  | 'professionals'

export type UserRole = 'client' | 'professional'

export type AuthState =
  | { state: 'anonymous' }
  | {
    state: 'authenticated'
    token: string
    refreshToken: string | null
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

export interface ProposalForClient {
  id: string
  service_request_id: string
  professional_id: string
  value: number | string
  description: string
  estimated_days: number | null
  photo_urls: string[]
  video_urls: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  service_request_title: string
  service_request_status: string
  professional: PublicProfessionalResult
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
  category_id?: string | null
  category_name: string | null
  region_id?: string | null
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

export type NotificationType =
  | 'PROPOSAL_RECEIVED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'CONTACT_VIEWED'
  | 'SYSTEM_ALERT'

export interface NotificationEntity {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface PublicProfessionalResult {
  user: {
    id: string
    name: string | null
    description: string | null
    role: string
    avatar_url: string | null
    created_at: string
  }
  profile: {
    bio: string | null
    skills: string[] | null
    location_scope: string
    uf: string | null
    city: string | null
    is_remote: boolean
  }
}
