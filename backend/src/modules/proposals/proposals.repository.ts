import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../../shared/database/supabaseClient.js'
import type { CreateProposalInput, UpdateProposalStatusInput, UpdateProposalInput } from './proposals.schema.js'

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

export interface PublicProfessionalLite {
  user: {
    id: string
    name: string | null
    description: string | null
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

export interface ProposalForClient extends ProposalEntity {
  service_request_title: string
  service_request_status: string
  professional: PublicProfessionalLite
}

export class ProposalsRepository {
  async create(db: SupabaseClient, professionalId: string, input: CreateProposalInput): Promise<ProposalEntity> {
    const { data, error } = await db
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

  async findByServiceRequest(db: SupabaseClient, serviceRequestId: string): Promise<ProposalForClient[]> {
    // RLS-safe join: embed only public professional data (no contact columns).
    const { data, error } = await db
      .from('proposals')
      .select(`
        id, service_request_id, professional_id, value, description,
        estimated_days, photo_urls, video_urls, status, created_at, updated_at,
        professional_public_profiles!inner (
          bio, skills, location_scope, uf, city, is_remote,
          professional_public_users!inner (user_id, name, description, avatar_url, created_at)
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
      service_request_title: p.service_requests?.title || '',
      service_request_status: p.service_requests?.status || '',
      professional: {
        user: {
          id: p.professional_public_profiles?.professional_public_users?.user_id ?? p.professional_public_profiles?.user_id ?? '',
          name: p.professional_public_profiles?.professional_public_users?.name ?? null,
          description: p.professional_public_profiles?.professional_public_users?.description ?? null,
          avatar_url: p.professional_public_profiles?.professional_public_users?.avatar_url ?? null,
          created_at: p.professional_public_profiles?.professional_public_users?.created_at ?? '',
        },
        profile: {
          bio: p.professional_public_profiles?.bio ?? null,
          skills: p.professional_public_profiles?.skills ?? null,
          location_scope: p.professional_public_profiles?.location_scope ?? 'national',
          uf: p.professional_public_profiles?.uf ?? null,
          city: p.professional_public_profiles?.city ?? null,
          is_remote: p.professional_public_profiles?.is_remote ?? false,
        },
      },
    }))
  }

  async findByProfessional(db: SupabaseClient, professionalId: string): Promise<ProposalWithDetails[]> {
    const { data, error } = await db
      .from('proposals')
      .select(`
        id, service_request_id, professional_id, value, description,
        estimated_days, photo_urls, video_urls, status, created_at, updated_at,
        professional_public_profiles!inner (
          professional_public_users!inner (name)
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
      professional_name: p.professional_public_profiles?.professional_public_users?.name || null,
      service_request_title: p.service_requests?.title || '',
      service_request_status: p.service_requests?.status || '',
    }))
  }

  async findReceivedByClient(db: SupabaseClient, clientUserId: string): Promise<ProposalForClient[]> {
    // Fetch all proposals where the linked service request belongs to this client.
    // Using a join filter on the embedded table is not always reliable across PostgREST versions,
    // so we do it in two steps (ids -> proposals) for correctness.
    const { data: reqs, error: reqsError } = await db
      .from('service_requests')
      .select('id')
      .eq('client_id', clientUserId)
      .order('created_at', { ascending: false })
      .limit(500)

    if (reqsError) {
      console.warn('Erro ao buscar demandas do cliente:', reqsError.message)
      return []
    }

    const ids = (reqs || []).map((r: any) => r.id).filter(Boolean)
    if (ids.length === 0) return []

    const { data, error } = await db
      .from('proposals')
      .select(`
        id, service_request_id, professional_id, value, description,
        estimated_days, photo_urls, video_urls, status, created_at, updated_at,
        professional_public_profiles!inner (
          bio, skills, location_scope, uf, city, is_remote,
          professional_public_users!inner (user_id, name, description, avatar_url, created_at)
        ),
        service_requests!inner (title, status)
      `)
      .in('service_request_id', ids)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao buscar propostas recebidas:', error.message)
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
      service_request_title: p.service_requests?.title || '',
      service_request_status: p.service_requests?.status || '',
      professional: {
        user: {
          id: p.professional_public_profiles?.professional_public_users?.user_id ?? p.professional_public_profiles?.user_id ?? '',
          name: p.professional_public_profiles?.professional_public_users?.name ?? null,
          description: p.professional_public_profiles?.professional_public_users?.description ?? null,
          avatar_url: p.professional_public_profiles?.professional_public_users?.avatar_url ?? null,
          created_at: p.professional_public_profiles?.professional_public_users?.created_at ?? '',
        },
        profile: {
          bio: p.professional_public_profiles?.bio ?? null,
          skills: p.professional_public_profiles?.skills ?? null,
          location_scope: p.professional_public_profiles?.location_scope ?? 'national',
          uf: p.professional_public_profiles?.uf ?? null,
          city: p.professional_public_profiles?.city ?? null,
          is_remote: p.professional_public_profiles?.is_remote ?? false,
        },
      },
    }))
  }

  async getProfessionalUserIdByProfileId(professionalProfileId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('professional_profiles')
      .select('user_id')
      .eq('id', professionalProfileId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar user_id do profissional:', error.message)
    }
    return data?.user_id ?? null
  }

  async findById(db: SupabaseClient, proposalId: string): Promise<ProposalEntity | null> {
    const { data, error } = await db
      .from('proposals')
      .select('id, service_request_id, professional_id, value, description, estimated_days, photo_urls, video_urls, status, created_at, updated_at')
      .eq('id', proposalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar proposta:', error.message)
    }
    return (data as ProposalEntity) || null
  }

  async exists(db: SupabaseClient, serviceRequestId: string, professionalId: string): Promise<boolean> {
    const { count, error } = await db
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
    db: SupabaseClient,
    proposalId: string,
    input: UpdateProposalStatusInput,
  ): Promise<ProposalEntity> {
    const { data, error } = await db
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

  async updateProposal(
    db: SupabaseClient,
    proposalId: string,
    professionalProfileId: string,
    input: UpdateProposalInput,
  ): Promise<ProposalEntity> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (input.value !== undefined) payload.value = input.value
    if (input.description !== undefined) payload.description = input.description
    if (input.estimatedDays !== undefined) payload.estimated_days = input.estimatedDays
    if (input.photoUrls !== undefined) payload.photo_urls = input.photoUrls
    if (input.videoUrls !== undefined) payload.video_urls = input.videoUrls

    const { data, error } = await db
      .from('proposals')
      .update(payload)
      .eq('id', proposalId)
      .eq('professional_id', professionalProfileId)
      .select('id, service_request_id, professional_id, value, description, estimated_days, photo_urls, video_urls, status, created_at, updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Proposta não encontrada')
    }

    return data as ProposalEntity
  }

  async getServiceRequestStatus(db: SupabaseClient, serviceRequestId: string): Promise<string | null> {
    const { data, error } = await db
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
    db: SupabaseClient,
    serviceRequestId: string,
    status: string,
  ): Promise<void> {
    const { error } = await db
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
