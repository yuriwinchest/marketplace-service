import { supabase } from '../../shared/database/supabaseClient.js'
import type { CreateRequestInput } from './services.schema.js'

export interface ServiceRequestEntity {
  id: string
  title: string
  status: string
  urgency: string
  created_at: string
  category_name: string | null
  region_name: string | null
  location_scope: string | null
  uf: string | null
  city: string | null
}

export class ServicesRepository {
  async create(clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        client_id: clientId,
        category_id: input.categoryId ?? null,
        region_id: input.regionId ?? null,
        title: input.title,
        description: input.description ?? null,
        budget_min: input.budgetMin ?? null,
        budget_max: input.budgetMax ?? null,
        urgency: input.urgency ?? 'medium',
        location_scope: input.locationScope ?? 'national',
        uf: input.uf ?? null,
        city: input.city ?? null,
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao criar solicitação')
    }

    return data
  }

  async findByClientId(clientId: string): Promise<ServiceRequestEntity[]> {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        title,
        status,
        urgency,
        created_at,
        location_scope,
        uf,
        city,
        categories (name),
        regions (name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao buscar solicitações:', error.message)
      return []
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      urgency: r.urgency,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }))
  }

  async findOpenRequests(
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<ServiceRequestEntity[]> {
    const offset = (pagination.page - 1) * pagination.limit

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        title,
        status,
        urgency,
        created_at,
        location_scope,
        uf,
        city,
        categories (name),
        regions (name)
      `)
      .eq('status', 'open')
      .order('urgency', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1)

    if (error) {
      console.warn('Erro ao buscar solicitações abertas:', error.message)
      return []
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      urgency: r.urgency,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }))
  }

  async getProposalStats(serviceRequestId: string) {
    // Get proposal stats
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('value')
      .eq('service_request_id', serviceRequestId)
      .neq('status', 'cancelled')

    if (proposalsError) {
      console.warn('Erro ao buscar stats de propostas:', proposalsError.message)
    }

    const count = proposals?.length || 0
    const avgValue = count > 0
      ? proposals!.reduce((sum, p) => sum + parseFloat(p.value || '0'), 0) / count
      : 0

    // Get professionals who made proposals
    const { data: professionalsData, error: professionalsError } = await supabase
      .from('proposals')
      .select(`
        professional_profiles!inner (
          users!inner (name, avatar_url)
        )
      `)
      .eq('service_request_id', serviceRequestId)
      .neq('status', 'cancelled')
      .limit(5)

    if (professionalsError) {
      console.warn('Erro ao buscar profissionais:', professionalsError.message)
    }

    const professionals = (professionalsData || []).map((p: any) => ({
      name: p.professional_profiles?.users?.name || null,
      avatar_url: p.professional_profiles?.users?.avatar_url || null,
    }))

    return {
      count,
      average_value: avgValue,
      professionals,
    }
  }
}
