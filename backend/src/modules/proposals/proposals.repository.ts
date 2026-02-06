import { supabase } from '../../shared/database/supabaseClient.js'
import type { CreateProposalInput, UpdateProposalStatusInput } from './proposals.schema.js'

export interface ProposalEntity {
  id: string
  service_request_id: string
  professional_id: string
  value: string
  description: string
  estimated_days: number | null
  photo_urls: string[]
  video_urls: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface ProposalWithDetails extends ProposalEntity {
  professional_name: string | null
  service_request_title: string
  service_request_status: string
}

export class ProposalsRepository {
  async create(professionalId: string, input: CreateProposalInput): Promise<ProposalEntity> {
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        service_request_id: input.serviceRequestId,
        professional_id: professionalId,
        value: input.value,
        description: input.description,
        estimated_days: input.estimatedDays ?? null,
        photo_urls: input.photoUrls ?? [],
        video_urls: input.videoUrls ?? [],
      })
      .select('id, service_request_id, professional_id, value, description, estimated_days, photo_urls, video_urls, status, created_at, updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar proposta')
    }

    return data as ProposalEntity
  }

  async findByServiceRequest(serviceRequestId: string): Promise<ProposalWithDetails[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        id, service_request_id, professional_id, value, description,
        estimated_days, photo_urls, video_urls, status, created_at, updated_at,
        professional_profiles!inner (
          users!inner (name)
        ),
        service_requests!inner (title, status)
      `)
      .eq('service_request_id', serviceRequestId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao buscar propostas:', error.message)
      return []
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      service_request_id: p.service_request_id,
      professional_id: p.professional_id,
      value: p.value,
      description: p.description,
      estimated_days: p.estimated_days,
      photo_urls: p.photo_urls || [],
      video_urls: p.video_urls || [],
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      professional_name: p.professional_profiles?.users?.name || null,
      service_request_title: p.service_requests?.title || '',
      service_request_status: p.service_requests?.status || '',
    }))
  }

  async findByProfessional(professionalId: string): Promise<ProposalWithDetails[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        id, service_request_id, professional_id, value, description,
        estimated_days, photo_urls, video_urls, status, created_at, updated_at,
        professional_profiles!inner (
          users!inner (name)
        ),
        service_requests!inner (title, status)
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao buscar propostas do profissional:', error.message)
      return []
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      service_request_id: p.service_request_id,
      professional_id: p.professional_id,
      value: p.value,
      description: p.description,
      estimated_days: p.estimated_days,
      photo_urls: p.photo_urls || [],
      video_urls: p.video_urls || [],
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      professional_name: p.professional_profiles?.users?.name || null,
      service_request_title: p.service_requests?.title || '',
      service_request_status: p.service_requests?.status || '',
    }))
  }

  async findById(proposalId: string): Promise<ProposalEntity | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('id, service_request_id, professional_id, value, description, estimated_days, photo_urls, video_urls, status, created_at, updated_at')
      .eq('id', proposalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar proposta:', error.message)
    }
    return (data as ProposalEntity) || null
  }

  async exists(serviceRequestId: string, professionalId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('service_request_id', serviceRequestId)
      .eq('professional_id', professionalId)

    if (error) {
      console.warn('Erro ao verificar existência de proposta:', error.message)
      return false
    }
    return (count || 0) > 0
  }

  async updateStatus(
    proposalId: string,
    input: UpdateProposalStatusInput,
  ): Promise<ProposalEntity> {
    const { data, error } = await supabase
      .from('proposals')
      .update({ status: input.status, updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .select('id, service_request_id, professional_id, value, description, estimated_days, photo_urls, video_urls, status, created_at, updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Proposta não encontrada')
    }

    return data as ProposalEntity
  }

  async getServiceRequestStatus(serviceRequestId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('service_requests')
      .select('status')
      .eq('id', serviceRequestId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar status da solicitação:', error.message)
    }
    return data?.status || null
  }

  async updateServiceRequestStatus(
    serviceRequestId: string,
    status: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('service_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', serviceRequestId)

    if (error) {
      console.warn('Erro ao atualizar status da solicitação:', error.message)
    }
  }

  async executeInTransaction<T>(
    callback: () => Promise<T>,
  ): Promise<T> {
    // Supabase REST API doesn't support transactions directly
    // For now, we execute the callback directly
    // For true transactions, you would need to use Supabase Edge Functions with pg
    return await callback()
  }
}
