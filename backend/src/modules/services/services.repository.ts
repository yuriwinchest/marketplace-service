import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnon } from '../../shared/database/supabaseClient.js'
import { pool } from '../../shared/database/connection.js'
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
      throw new Error(error?.message || 'Erro ao criar solicitacao')
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
      console.warn('Erro ao buscar solicitacoes:', error.message)
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

    try {
      const where: string[] = ["sr.status = 'open'"]
      const values: Array<string | number> = []

      if (filters.urgentOnly === true) {
        where.push('sr.is_urgent_promoted = true')
      }

      if (filters.categoryId) {
        values.push(filters.categoryId)
        where.push(`sr.category_id = $${values.length}`)
      }

      if (filters.urgency) {
        values.push(filters.urgency)
        where.push(`sr.urgency = $${values.length}`)
      }

      if (filters.uf) {
        values.push(filters.uf)
        where.push(`sr.uf = $${values.length}`)
      }

      if (filters.city) {
        values.push(filters.city)
        where.push(`sr.city ILIKE $${values.length}`)
      }

      if (filters.budgetMin !== undefined) {
        values.push(filters.budgetMin)
        where.push(`(sr.budget_max IS NULL OR sr.budget_max >= $${values.length})`)
      }

      if (filters.budgetMax !== undefined) {
        values.push(filters.budgetMax)
        where.push(`(sr.budget_min IS NULL OR sr.budget_min <= $${values.length})`)
      }

      values.push(pagination.limit)
      const limitParam = values.length
      values.push(offset)
      const offsetParam = values.length

      const sql = `
        SELECT
          sr.id,
          sr.category_id,
          sr.region_id,
          sr.title,
          sr.description,
          sr.budget_min,
          sr.budget_max,
          sr.status,
          sr.urgency,
          sr.is_urgent_promoted,
          sr.urgent_promotion_price::text AS urgent_promotion_price,
          sr.urgent_promoted_at,
          sr.created_at,
          sr.location_scope,
          sr.uf,
          sr.city,
          c.name AS category_name,
          r.name AS region_name
        FROM service_requests sr
        LEFT JOIN categories c ON c.id = sr.category_id
        LEFT JOIN regions r ON r.id = sr.region_id
        WHERE ${where.join(' AND ')}
        ORDER BY
          sr.is_urgent_promoted DESC,
          sr.urgent_promoted_at DESC NULLS LAST,
          CASE sr.urgency
            WHEN 'high' THEN 0
            WHEN 'medium' THEN 1
            ELSE 2
          END,
          sr.created_at DESC
        LIMIT $${limitParam}
        OFFSET $${offsetParam}
      `

      const { rows } = await pool.query<ServiceRequestEntity>(sql, values)
      return rows
    } catch (pgError) {
      console.warn('Erro ao buscar solicitacoes abertas via conexao direta. Tentando Supabase anon.', pgError)
    }

    // Fallback: Supabase anon client.
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

    if (filters.urgentOnly === true) query = query.eq('is_urgent_promoted', true)
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters.urgency) query = query.eq('urgency', filters.urgency)
    if (filters.uf) query = query.eq('uf', filters.uf)
    if (filters.city) query = query.eq('city', filters.city)
    if (filters.budgetMin !== undefined) query = query.gte('budget_max', filters.budgetMin)
    if (filters.budgetMax !== undefined) query = query.lte('budget_min', filters.budgetMax)

    const { data, error } = await query
    if (error) {
      console.warn('Erro ao buscar solicitacoes abertas:', error.message)
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

  async promoteUrgent(db: SupabaseClient, serviceRequestId: string, clientId: string): Promise<void> {
    const { data: request, error: requestError } = await db
      .from('service_requests')
      .select('id, client_id, status, is_urgent_promoted')
      .eq('id', serviceRequestId)
      .single()

    if (requestError || !request) throw new Error('Demanda nao encontrada')
    if (request.client_id !== clientId) throw new Error('Voce nao tem permissao para promover esta demanda')
    if (request.status !== 'open') throw new Error('Apenas demandas abertas podem ser promovidas como urgentes')
    if (request.is_urgent_promoted) return

    const { error } = await db
      .from('service_requests')
      .update({
        is_urgent_promoted: true,
        urgent_promotion_price: URGENT_PROMOTION_PRICE,
        urgent_promoted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceRequestId)

    if (error) throw new Error(error.message || 'Erro ao promover demanda urgente')
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
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
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

    if (error || !data) throw new Error(error?.message || 'Erro ao atualizar demanda')

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

  async getProposalStats(
    db: SupabaseClient,
    serviceRequestId: string,
    opts?: { includeProfessionals?: boolean },
  ): Promise<{ count: number; average_value: number; professionals: { name: string | null; avatar_url: string | null }[] }> {
    const { data: proposals, error: proposalsError } = await db
      .from('proposals')
      .select('value')
      .eq('service_request_id', serviceRequestId)
      .neq('status', 'cancelled')

    if (proposalsError) {
      console.warn('Erro ao buscar stats de propostas:', proposalsError.message)
    }

    const count = proposals?.length || 0
    const avgValue = count > 0
      ? proposals!.reduce((sum, p: any) => sum + parseFloat(p.value || '0'), 0) / count
      : 0

    let professionals: { name: string | null; avatar_url: string | null }[] = []
    if (opts?.includeProfessionals === true) {
      // Use public professional projection tables to keep RLS safe.
      const { data: professionalsData, error: professionalsError } = await db
        .from('proposals')
        .select(`
          professional_public_profiles!inner (
            professional_public_users!inner (name, avatar_url)
          )
        `)
        .eq('service_request_id', serviceRequestId)
        .neq('status', 'cancelled')
        .limit(5)

      if (professionalsError) {
        console.warn('Erro ao buscar profissionais:', professionalsError.message)
      }

      professionals = (professionalsData || []).map((p: any) => ({
        name: p.professional_public_profiles?.professional_public_users?.name || null,
        avatar_url: p.professional_public_profiles?.professional_public_users?.avatar_url || null,
      }))
    }

    return { count, average_value: avgValue, professionals }
  }
}

