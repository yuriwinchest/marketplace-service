import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin, supabaseAnon } from '../../shared/database/supabaseClient.js'
import type { CreateRequestInput } from './services.schema.js'
import { URGENT_PROMOTION_PRICE } from '../subscriptions/subscriptionPlans.js'

export interface ServiceRequestEntity {
  id: string
  client_id?: string
  category_id?: string | null
  region_id?: string | null
  title: string
  description?: string | null
  budget_min?: number | null
  budget_max?: number | null
  status: string
  urgency: string
  is_urgent_promoted: boolean
  urgent_promotion_price: string | null
  urgent_promoted_at: string | null
  created_at: string
  category_name: string | null
  region_name: string | null
  location_scope: string | null
  uf: string | null
  city: string | null
}

export interface PublicUserEntity {
  id: string
  name: string | null
  description: string | null
  avatar_url: string | null
  created_at: string
}

export class ServicesRepository {
  async create(db: SupabaseClient, clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    const { data, error } = await db
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

  async findByClientId(db: SupabaseClient, clientId: string): Promise<ServiceRequestEntity[]> {
    const { data, error } = await db
      .from('service_requests')
      .select(`
        id,
        client_id,
        category_id,
        region_id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        urgency,
        is_urgent_promoted,
        urgent_promotion_price,
        urgent_promoted_at,
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
      client_id: r.client_id,
      category_id: r.category_id ?? null,
      region_id: r.region_id ?? null,
      title: r.title,
      description: r.description ?? null,
      budget_min: r.budget_min ?? null,
      budget_max: r.budget_max ?? null,
      status: r.status,
      urgency: r.urgency,
      is_urgent_promoted: r.is_urgent_promoted ?? false,
      urgent_promotion_price: r.urgent_promotion_price ?? null,
      urgent_promoted_at: r.urgent_promoted_at ?? null,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }))
  }

  async findProfessionalUserIdsToNotifyNewRequest(
    input: {
      categoryId?: string | null
      locationScope?: string | null
      uf?: string | null
      city?: string | null
    },
    opts?: { limit?: number },
  ): Promise<string[]> {
    const limit = opts?.limit ?? 200
    const nowIso = new Date().toISOString()

    // Optional: prefilter by category via relationship table.
    let professionalIdsByCategory: string[] | null = null
    if (input.categoryId) {
      const { data, error } = await supabaseAdmin
        .from('professional_categories')
        .select('professional_id')
        .eq('category_id', input.categoryId)
        .limit(500)

      if (error) {
        console.warn('Erro ao buscar profissionais por categoria:', error.message)
      } else {
        professionalIdsByCategory = (data || []).map((r: any) => r.professional_id).filter(Boolean)
        // If the relationship table is not populated yet, don't block notifications.
        if (professionalIdsByCategory.length === 0) {
          professionalIdsByCategory = null
        }
      }
    }

    // System query: do not use RLS client.
    // We need to read many professionals regardless of the caller (only for notifications).
    let query = supabaseAdmin
      .from('subscriptions')
      .select(`
        professional_id,
        status,
        current_period_end,
        professional_profiles!inner (
          user_id,
          is_remote,
          location_scope,
          uf,
          city
        )
      `)
      .in('status', ['active', 'trialing'])
      .or(`current_period_end.is.null,current_period_end.gte.${nowIso}`)
      .limit(limit)

    if (professionalIdsByCategory) {
      query = query.in('professional_id', professionalIdsByCategory)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Erro ao buscar assinantes para notificação:', error.message)
      return []
    }

    const items = (data || []) as any[]

    // Apply location match in-memory (keeps query simpler with supabase joins).
    const scope = input.locationScope ?? 'national'
    const uf = input.uf ?? null
    const city = input.city ?? null

    const matches = items.filter((row) => {
      const p = row.professional_profiles
      if (!p) return false
      if (p.is_remote === true) return true

      if (scope === 'city') {
        return city ? (p.city === city) : true
      }
      if (scope === 'state') {
        return uf ? (p.uf === uf) : true
      }
      return true
    })

    return matches
      .map((row) => row.professional_profiles?.user_id)
      .filter(Boolean)
      .slice(0, limit)
  }

  async findOpenRequests(
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
    filters: {
      urgentOnly?: boolean
      categoryId?: string
      urgency?: string
      uf?: string
      city?: string
      budgetMin?: number
      budgetMax?: number
    } = {},
  ): Promise<ServiceRequestEntity[]> {
    const offset = (pagination.page - 1) * pagination.limit

    // Public feed should be constrained by RLS; use anon client.
    let query = supabaseAnon
      .from('service_requests')
      .select(`
        id,
        category_id,
        region_id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        urgency,
        is_urgent_promoted,
        urgent_promotion_price,
        urgent_promoted_at,
        created_at,
        location_scope,
        uf,
        city,
        categories (name),
        regions (name)
      `)
      .eq('status', 'open')
      .order('is_urgent_promoted', { ascending: false })
      .order('urgent_promoted_at', { ascending: false, nullsFirst: false })
      .order('urgency', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1)

    if (filters.urgentOnly === true) {
      query = query.eq('is_urgent_promoted', true)
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }
    if (filters.urgency) {
      query = query.eq('urgency', filters.urgency)
    }
    if (filters.uf) {
      query = query.eq('uf', filters.uf)
    }
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.budgetMin !== undefined) {
      // Keep requests whose max budget can cover the min filter
      query = query.gte('budget_max', filters.budgetMin)
    }
    if (filters.budgetMax !== undefined) {
      // Keep requests whose min budget is below the max filter
      query = query.lte('budget_min', filters.budgetMax)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Erro ao buscar solicitações abertas:', error.message)
      return []
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      category_id: r.category_id ?? null,
      region_id: r.region_id ?? null,
      title: r.title,
      description: r.description ?? null,
      budget_min: r.budget_min ?? null,
      budget_max: r.budget_max ?? null,
      status: r.status,
      urgency: r.urgency,
      is_urgent_promoted: r.is_urgent_promoted ?? false,
      urgent_promotion_price: r.urgent_promotion_price ?? null,
      urgent_promoted_at: r.urgent_promoted_at ?? null,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }))
  }

  async findById(db: SupabaseClient, serviceRequestId: string): Promise<ServiceRequestEntity | null> {
    const { data, error } = await db
      .from('service_requests')
      .select(`
        id,
        client_id,
        category_id,
        region_id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        urgency,
        is_urgent_promoted,
        urgent_promotion_price,
        urgent_promoted_at,
        created_at,
        location_scope,
        uf,
        city,
        categories (name),
        regions (name)
      `)
      .eq('id', serviceRequestId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar demanda:', error.message)
    }

    if (!data) return null

    const r: any = data
    return {
      id: r.id,
      client_id: r.client_id,
      category_id: r.category_id ?? null,
      region_id: r.region_id ?? null,
      title: r.title,
      description: r.description ?? null,
      budget_min: r.budget_min ?? null,
      budget_max: r.budget_max ?? null,
      status: r.status,
      urgency: r.urgency,
      is_urgent_promoted: r.is_urgent_promoted ?? false,
      urgent_promotion_price: r.urgent_promotion_price ?? null,
      urgent_promoted_at: r.urgent_promoted_at ?? null,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }
  }

  async getPublicUser(userId: string): Promise<PublicUserEntity | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, description, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar usuário público:', error.message)
    }
    return (data as PublicUserEntity) || null
  }

  async promoteUrgent(db: SupabaseClient, serviceRequestId: string, clientId: string): Promise<void> {
    const { data: request, error: requestError } = await db
      .from('service_requests')
      .select('id, client_id, status, is_urgent_promoted')
      .eq('id', serviceRequestId)
      .single()

    if (requestError || !request) {
      throw new Error('Demanda não encontrada')
    }

    if (request.client_id !== clientId) {
      throw new Error('Você não tem permissão para promover esta demanda')
    }

    if (request.status !== 'open') {
      throw new Error('Apenas demandas abertas podem ser promovidas como urgentes')
    }

    if (request.is_urgent_promoted) {
      return
    }

    const { error } = await db
      .from('service_requests')
      .update({
        is_urgent_promoted: true,
        urgent_promotion_price: URGENT_PROMOTION_PRICE,
        urgent_promoted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceRequestId)

    if (error) {
      throw new Error(error.message || 'Erro ao promover demanda urgente')
    }
  }

  async updateRequest(
    db: SupabaseClient,
    serviceRequestId: string,
    clientId: string,
    input: {
      categoryId?: string | undefined
      regionId?: string | undefined
      title?: string | undefined
      description?: string | undefined
      budgetMin?: number | undefined
      budgetMax?: number | undefined
      urgency?: string | undefined
      locationScope?: string | undefined
      uf?: string | undefined
      city?: string | undefined
    },
  ): Promise<ServiceRequestEntity> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (input.categoryId !== undefined) payload.category_id = input.categoryId
    if (input.regionId !== undefined) payload.region_id = input.regionId
    if (input.title !== undefined) payload.title = input.title
    if (input.description !== undefined) payload.description = input.description
    if (input.budgetMin !== undefined) payload.budget_min = input.budgetMin
    if (input.budgetMax !== undefined) payload.budget_max = input.budgetMax
    if (input.urgency !== undefined) payload.urgency = input.urgency
    if (input.locationScope !== undefined) payload.location_scope = input.locationScope
    if (input.uf !== undefined) payload.uf = input.uf
    if (input.city !== undefined) payload.city = input.city

    const { data, error } = await db
      .from('service_requests')
      .update(payload)
      .eq('id', serviceRequestId)
      .eq('client_id', clientId)
      .select(`
        id,
        client_id,
        category_id,
        region_id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        urgency,
        is_urgent_promoted,
        urgent_promotion_price,
        urgent_promoted_at,
        created_at,
        location_scope,
        uf,
        city,
        categories (name),
        regions (name)
      `)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao atualizar demanda')
    }

    const r: any = data
    return {
      id: r.id,
      client_id: r.client_id,
      category_id: r.category_id ?? null,
      region_id: r.region_id ?? null,
      title: r.title,
      description: r.description ?? null,
      budget_min: r.budget_min ?? null,
      budget_max: r.budget_max ?? null,
      status: r.status,
      urgency: r.urgency,
      is_urgent_promoted: r.is_urgent_promoted ?? false,
      urgent_promotion_price: r.urgent_promotion_price ?? null,
      urgent_promoted_at: r.urgent_promoted_at ?? null,
      created_at: r.created_at,
      category_name: r.categories?.name || null,
      region_name: r.regions?.name || null,
      location_scope: r.location_scope,
      uf: r.uf,
      city: r.city,
    }
  }

  async findProfessionalUserIdsForServiceRequest(serviceRequestId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select(`
        professional_profiles!inner (
          user_id
        )
      `)
      .eq('service_request_id', serviceRequestId)
      .neq('status', 'cancelled')
      .limit(500)

    if (error) {
      console.warn('Erro ao buscar profissionais da demanda:', error.message)
      return []
    }

    const ids = (data || [])
      .map((row: any) => row.professional_profiles?.user_id)
      .filter(Boolean)

    return Array.from(new Set(ids))
  }

  async getProposalStats(serviceRequestId: string, opts?: { includeProfessionals?: boolean }) {
    // Get proposal stats
    const { data: proposals, error: proposalsError } = await supabaseAdmin
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

    let professionals: { name: string | null; avatar_url: string | null }[] = []
    if (opts?.includeProfessionals === true) {
      // Get professionals who made proposals (limited)
      const { data: professionalsData, error: professionalsError } = await supabaseAdmin
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

      professionals = (professionalsData || []).map((p: any) => ({
        name: p.professional_profiles?.users?.name || null,
        avatar_url: p.professional_profiles?.users?.avatar_url || null,
      }))
    }

    return {
      count,
      average_value: avgValue,
      professionals,
    }
  }
}
