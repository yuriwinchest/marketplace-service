import { RatingsRepository } from './ratings.repository.js'
import type { RatingEntity, RatingWithAuthor } from './ratings.repository.js'
import type { CreateRatingInput } from './ratings.schema.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class RatingsService {
  constructor(private repository: RatingsRepository) {}

  async create(db: SupabaseClient, fromUserId: string, input: CreateRatingInput): Promise<RatingEntity> {
    if (fromUserId === input.toUserId) {
      throw new Error('Voce nao pode avaliar a si mesmo')
    }

    const request = await this.repository.getRequestContext(db, input.requestId)
    if (!request) {
      throw new Error('Demanda nao encontrada')
    }

    // Cliente pode avaliar profissional com proposta aceita
    if (fromUserId === request.client_id) {
      const targetProfessionalId = await this.repository.getProfessionalIdByUserId(db, input.toUserId)
      if (!targetProfessionalId) {
        throw new Error('Usuario avaliado nao e um profissional valido')
      }

      const hasAcceptedProposal = await this.repository.hasAcceptedProposal(db, input.requestId, targetProfessionalId)
      if (!hasAcceptedProposal) {
        throw new Error('Avaliacao permitida somente apos proposta aceita')
      }
    } else {
      // Profissional pode avaliar somente o cliente da demanda se foi aceito
      if (input.toUserId !== request.client_id) {
        throw new Error('Profissional so pode avaliar o cliente da demanda')
      }

      const professionalId = await this.repository.getProfessionalIdByUserId(db, fromUserId)
      if (!professionalId) {
        throw new Error('Perfil profissional nao encontrado')
      }

      const hasAcceptedProposal = await this.repository.hasAcceptedProposal(db, input.requestId, professionalId)
      if (!hasAcceptedProposal) {
        throw new Error('Avaliacao permitida somente apos proposta aceita')
      }
    }

    try {
      return await this.repository.create({
        db,
        requestId: input.requestId,
        fromUserId,
        toUserId: input.toUserId,
        score: input.score,
        ...(input.comment !== undefined ? { comment: input.comment } : {}),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar avaliacao'
      if (message.includes('ratings_unique_from_to_request_idx')) {
        throw new Error('Voce ja avaliou este usuario nesta demanda')
      }
      throw error
    }
  }

  async listByUserId(
    db: SupabaseClient,
    toUserId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: RatingWithAuthor[]; summary: { average: number; total: number } }> {
    const [items, summary] = await Promise.all([
      this.repository.listByUserId(db, toUserId, pagination),
      this.repository.getSummaryByUserId(db, toUserId),
    ])

    return { items, summary }
  }
}

