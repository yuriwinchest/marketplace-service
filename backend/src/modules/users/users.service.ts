import { UsersRepository, UserProfileEntity, ProfessionalProfileEntity } from './users.repository.js'
import { UpdateProfileInput } from './users.schema.js'

export interface UserProfileResult {
  user: UserProfileEntity
  profile: ProfessionalProfileEntity | null
}

export class UsersService {
  constructor(private repository: UsersRepository) {}

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
      })
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<string | null> {
    return this.repository.updateAvatar(userId, avatarUrl)
  }
}
