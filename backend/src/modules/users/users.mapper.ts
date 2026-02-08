import type { PublicProfessionalRow } from './users.repository.js'

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

// Strictly remove contact fields (email/phone/whatsapp) for public listing.
export const toPublicProfessionalResult = (
  row: PublicProfessionalRow,
): PublicProfessionalResult => {
  return {
    user: {
      id: row.id,
      name: row.name ?? null,
      description: row.description ?? null,
      role: row.role,
      avatar_url: row.avatar_url ?? null,
      created_at: row.created_at,
    },
    profile: {
      bio: row.bio ?? null,
      skills: row.skills ?? null,
      location_scope: row.location_scope,
      uf: row.uf ?? null,
      city: row.city ?? null,
      is_remote: row.is_remote,
    },
  }
}
