import { supabase } from '../../shared/database/supabaseClient.js'

export interface RatingEntity {
  id: string
  request_id: string
  from_user_id: string
  to_user_id: string
  score: number
  comment: string | null
  created_at: string
}

export interface RequestContextEntity {
  id: string
  client_id: string
  status: string
}

export interface RatingWithAuthor extends RatingEntity {
  from_user_name: string | null
}

export class RatingsRepository {
  async getRequestContext(requestId: string): Promise<RequestContextEntity | null> {
    const { data, error } = await supabase
      .from('service_requests')
      .select('id, client_id, status')
      .eq('id', requestId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar contexto da demanda para avaliação:', error.message)
    }

    return (data as RequestContextEntity) || null
  }

  async getProfessionalIdByUserId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar perfil profissional para avaliação:', error.message)
    }

    return data?.id || null
  }

  async hasAcceptedProposal(requestId: string, professionalId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('service_request_id', requestId)
      .eq('professional_id', professionalId)
      .eq('status', 'accepted')

    if (error) {
      console.warn('Erro ao validar proposta aceita para avaliação:', error.message)
      return false
    }

    return (count || 0) > 0
  }

  async create(input: {
    requestId: string
    fromUserId: string
    toUserId: string
    score: number
    comment?: string
  }): Promise<RatingEntity> {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        request_id: input.requestId,
        from_user_id: input.fromUserId,
        to_user_id: input.toUserId,
        score: input.score,
        comment: input.comment ?? null,
      })
      .select('id, request_id, from_user_id, to_user_id, score, comment, created_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar avaliação')
    }

    return data as RatingEntity
  }

  async listByUserId(
    toUserId: string,
    pagination: { page: number; limit: number },
  ): Promise<RatingWithAuthor[]> {
    const offset = (pagination.page - 1) * pagination.limit
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        id,
        request_id,
        from_user_id,
        to_user_id,
        score,
        comment,
        created_at,
        users!ratings_from_user_id_fkey (name)
      `)
      .eq('to_user_id', toUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1)

    if (error) {
      console.warn('Erro ao listar avaliações:', error.message)
      return []
    }

    return (data || []).map((rating: any) => ({
      id: rating.id,
      request_id: rating.request_id,
      from_user_id: rating.from_user_id,
      to_user_id: rating.to_user_id,
      score: rating.score,
      comment: rating.comment,
      created_at: rating.created_at,
      from_user_name: rating.users?.name || null,
    }))
  }

  async getSummaryByUserId(toUserId: string): Promise<{ average: number; total: number }> {
    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('to_user_id', toUserId)

    if (error) {
      console.warn('Erro ao buscar resumo de avaliações:', error.message)
      return { average: 0, total: 0 }
    }

    const total = data?.length || 0
    if (total === 0) {
      return { average: 0, total: 0 }
    }

    const sum = data!.reduce((acc, row) => acc + Number(row.score || 0), 0)
    return { average: Number((sum / total).toFixed(2)), total }
  }
}
