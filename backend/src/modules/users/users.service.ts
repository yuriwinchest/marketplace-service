import { UsersRepository } from './users.repository.js'
import type { UserProfileEntity, ProfessionalProfileEntity } from './users.repository.js'
import type { UpdateProfileInput } from './users.schema.js'
import { toPublicProfessionalResult, type PublicProfessionalResult } from './users.mapper.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface UserProfileResult {
  user: UserProfileEntity
  profile: ProfessionalProfileEntity | null
}

export class UsersService {
  constructor(private repository: UsersRepository) { }

  async getProfile(db: SupabaseClient, userId: string): Promise<UserProfileResult> {
    const user = await this.repository.findById(db, userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    let profile = null
    if (user.role === 'professional') {
      profile = await this.repository.getProfessionalProfile(db, userId)
    }

    return { user, profile }
  }

  async updateProfile(db: SupabaseClient, userId: string, input: UpdateProfileInput): Promise<void> {
    if (input.name !== undefined) {
      await this.repository.updateName(db, userId, input.name)
    }
    if (input.description !== undefined) {
      await this.repository.updateDescription(db, userId, input.description)
    }

    const user = await this.repository.findById(db, userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role === 'professional') {
      await this.repository.upsertProfessionalProfile(db, userId, {
        bio: input.bio,
        phone: input.phone,
        skills: input.skills,
        locationScope: input.locationScope,
        uf: input.uf,
        city: input.city,
        isRemote: input.isRemote,
        email: input.email,
        whatsapp: input.whatsapp,
      })
    }
  }

  async updateAvatar(db: SupabaseClient, userId: string, avatarUrl: string): Promise<string | null> {
    return this.repository.updateAvatar(db, userId, avatarUrl)
  }

  async findProfessionals(
    filters: {
      categoryId?: string
      city?: string
      uf?: string
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<PublicProfessionalResult[]> {
    const results = await this.repository.findProfessionals(filters, pagination)

    return results.map(toPublicProfessionalResult)
  }
}
