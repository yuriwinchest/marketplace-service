import { RatingsRepository } from './ratings.repository.js'
import type { RatingEntity, RatingWithAuthor } from './ratings.repository.js'
import type { CreateRatingInput } from './ratings.schema.js'

export class RatingsService {
  constructor(private repository: RatingsRepository) { }

  async create(fromUserId: string, input: CreateRatingInput): Promise<RatingEntity> {
    if (fromUserId === input.toUserId) {
      throw new Error('Você não pode avaliar a si mesmo')
    }

    const request = await this.repository.getRequestContext(input.requestId)
    if (!request) {
      throw new Error('Demanda não encontrada')
    }

    // Cliente pode avaliar profissional com proposta aceita
    if (fromUserId === request.client_id) {
      const targetProfessionalId = await this.repository.getProfessionalIdByUserId(input.toUserId)
      if (!targetProfessionalId) {
        throw new Error('Usuário avaliado não é um profissional válido')
      }

      const hasAcceptedProposal = await this.repository.hasAcceptedProposal(
        input.requestId,
        targetProfessionalId,
      )

      if (!hasAcceptedProposal) {
        throw new Error('Avaliação permitida somente após proposta aceita')
      }
    } else {
      // Profissional pode avaliar somente o cliente da demanda se foi aceito
      if (input.toUserId !== request.client_id) {
        throw new Error('Profissional só pode avaliar o cliente da demanda')
      }

      const professionalId = await this.repository.getProfessionalIdByUserId(fromUserId)
      if (!professionalId) {
        throw new Error('Perfil profissional não encontrado')
      }

      const hasAcceptedProposal = await this.repository.hasAcceptedProposal(
        input.requestId,
        professionalId,
      )

      if (!hasAcceptedProposal) {
        throw new Error('Avaliação permitida somente após proposta aceita')
      }
    }

    try {
      const payload = {
        requestId: input.requestId,
        fromUserId,
        toUserId: input.toUserId,
        score: input.score,
        ...(input.comment !== undefined ? { comment: input.comment } : {}),
      }

      return await this.repository.create(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar avaliação'
      if (message.includes('ratings_unique_from_to_request_idx')) {
        throw new Error('Você já avaliou este usuário nesta demanda')
      }
      throw error
    }
  }

  async listByUserId(
    toUserId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: RatingWithAuthor[]; summary: { average: number; total: number } }> {
    const [items, summary] = await Promise.all([
      this.repository.listByUserId(toUserId, pagination),
      this.repository.getSummaryByUserId(toUserId),
    ])

    return { items, summary }
  }
}
