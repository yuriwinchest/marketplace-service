import { UsersRepository } from './users.repository.js'
import type { UserProfileEntity, ProfessionalProfileEntity } from './users.repository.js'
import type { UpdateProfileInput } from './users.schema.js'

export interface UserProfileResult {
  user: UserProfileEntity
  profile: ProfessionalProfileEntity | null
}

export class UsersService {
  constructor(private repository: UsersRepository) { }

  async getProfile(userId: string): Promise<UserProfileResult> {
    const user = await this.repository.findById(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    let profile = null
    if (user.role === 'professional') {
      profile = await this.repository.getProfessionalProfile(userId)
    }

    return { user, profile }
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<void> {
    if (input.name !== undefined) {
      await this.repository.updateName(userId, input.name)
    }
    if (input.description !== undefined) {
      await this.repository.updateDescription(userId, input.description)
    }

    const user = await this.repository.findById(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role === 'professional') {
      await this.repository.upsertProfessionalProfile(userId, {
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

  async updateAvatar(userId: string, avatarUrl: string): Promise<string | null> {
    return this.repository.updateAvatar(userId, avatarUrl)
  }

  async findProfessionals(
    filters: {
      categoryId?: string
      city?: string
      uf?: string
    },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<UserProfileResult[]> {
    const results = await this.repository.findProfessionals(filters, pagination)

    // Mapear para o formato UserProfileResult e MASCARAR dados sensíveis conforme regra de negócio
    return results.map(row => ({
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        description: row.description,
        role: row.role,
        avatar_url: row.avatar_url,
        created_at: row.created_at
      },
      profile: {
        bio: row.bio,
        phone: null, // Mascarado por padrão conforme contrato técnico
        skills: row.skills,
        location_scope: row.location_scope,
        uf: row.uf,
        city: row.city,
        is_remote: row.is_remote,
        email: null, // Mascarado por padrão
        whatsapp: null // Mascarado por padrão
      }
    }))
  }
}
