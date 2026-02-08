import type { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ServicesService } from './services.service.js'
import { createRequestSchema, openRequestsQuerySchema, requestIdParamsSchema, updateRequestSchema } from './services.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'
import { SubscriptionsRepository } from '../subscriptions/subscriptions.repository.js'
import { supabaseAdmin, supabaseAnon } from '../../shared/database/supabaseClient.js'

export class ServicesController extends BaseController {
  constructor(private servicesService: ServicesService) {
    super()
  }

  async createRequest(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'client') {
      return this.forbidden(res, 'Apenas clientes podem criar demandas')
    }

    const parsed = createRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const result = await this.servicesService.createRequest(db, req.user.id, parsed.data)
      return this.created(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar solicitação'
      return this.serverError(res, message)
    }
  }

  async getClientRequests(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'client') {
      return this.forbidden(res, 'Apenas clientes podem ver suas demandas')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const requests = await this.servicesService.getClientRequests(db, req.user.id)
      return this.success(res, { items: requests })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar solicitações')
    }
  }

  async getOpenRequests(req: Request, res: Response): Promise<Response> {
    const parsed = openRequestsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    const {
      page,
      limit,
      urgentOnly,
      categoryId,
      urgency,
      uf,
      city,
      budgetMin,
      budgetMax,
    } = parsed.data

    try {
      const filters: {
        urgentOnly?: boolean
        categoryId?: string
        urgency?: string
        uf?: string
        city?: string
        budgetMin?: number
        budgetMax?: number
      } = {}

      if (urgentOnly !== undefined) filters.urgentOnly = urgentOnly
      if (categoryId !== undefined) filters.categoryId = categoryId
      if (urgency !== undefined) filters.urgency = urgency
      if (uf !== undefined) filters.uf = uf
      if (city !== undefined) filters.city = city
      if (budgetMin !== undefined) filters.budgetMin = budgetMin
      if (budgetMax !== undefined) filters.budgetMax = budgetMax

      const requests = await this.servicesService.getOpenRequests(
        { page, limit },
        filters,
      )
      return this.success(res, { items: requests })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar solicitações')
    }
  }

  async getRequestDetail(req: Request, res: Response): Promise<Response> {
    const parsed = requestIdParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    const authedReq = req as AuthedRequest
    const db = authedReq.db ?? supabaseAnon
    const request = await this.servicesService.getRequestById(db, parsed.data.id)
    if (!request) {
      return this.notFound(res, 'Demanda não encontrada')
    }

    // Default: never expose client identity to anonymous users.
    const authedUser = (req as any).user as { id: string; role: string } | undefined
    let includeClient = false

    if (authedUser?.role === 'client' && request.client_id === authedUser.id) {
      // Owner can see their own identity (no extra plan needed).
      includeClient = true
    }

    if (authedUser?.role === 'professional') {
      // Professionals can only see who posted if they have an active plan.
      const profile = await (async () => {
        if (!authedReq.db) return null
        const { data } = await authedReq.db
          .from('professional_profiles')
          .select('id')
          .eq('user_id', authedUser.id)
          .single()
        return data ? data : null
      })()

      if (profile?.id) {
        const subsRepo = new SubscriptionsRepository()
        const isActive = await subsRepo.isActive(authedReq.db, profile.id)
        includeClient = isActive
      }
    }

    // Build response (redact client_id by default).
    const base = {
      id: request.id,
      title: request.title,
      description: request.description ?? null,
      budget_min: request.budget_min ?? null,
      budget_max: request.budget_max ?? null,
      status: request.status,
      urgency: request.urgency,
      is_urgent_promoted: request.is_urgent_promoted,
      urgent_promotion_price: request.urgent_promotion_price,
      urgent_promoted_at: request.urgent_promoted_at,
      created_at: request.created_at,
      category_name: request.category_name,
      region_name: request.region_name,
      location_scope: request.location_scope,
      uf: request.uf,
      city: request.city,
    } as const

    if (!includeClient || !request.client_id) {
      return this.success(res, { request: base, client: null })
    }

    // Only public user fields (no email/phone).
    const client = await (async () => {
      // Reuse services repository indirectly via service (keeps controller small-ish).
      // We already imported supabase here for plan check, so direct fetch is acceptable too.
      const { data } = await supabaseAdmin
        .from('users')
        .select('id, name, description, avatar_url, created_at')
        .eq('id', request.client_id as string)
        .single()
      return data ? data : null
    })()

    return this.success(res, { request: base, client })
  }

  async getProposalStats(req: Request, res: Response): Promise<Response> {
    const parsed = requestIdParamsSchema.safeParse(req.params)
    if (!parsed.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    const serviceRequestId = parsed.data.id

    // Only the demand owner can see who sent proposals.
    const authedUser = (req as any).user as { id: string; role: string } | undefined
    let includeProfessionals = false
    if (authedUser?.role === 'client') {
      const authedReq = req as AuthedRequest
      if (authedReq.db) {
        const { data: request } = await authedReq.db
          .from('service_requests')
          .select('client_id')
          .eq('id', serviceRequestId)
          .single()
        includeProfessionals = request?.client_id === authedUser.id
      }
    }

    try {
      const stats = await this.servicesService.getProposalStats(serviceRequestId, {
        includeProfessionals,
      })

      // If not allowed, the repository returns an empty `professionals` array.
      return this.success(res, stats)
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar estatísticas')
    }
  }

  async promoteUrgent(req: AuthedRequest, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      await this.servicesService.promoteUrgent(db, id as string, req.user.id)
      return this.success(res, { success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao promover urgência'
      if (
        message.includes('não encontrada') ||
        message.includes('permissão') ||
        message.includes('demandas abertas')
      ) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async updateRequest(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'client') {
      return this.forbidden(res, 'Apenas clientes podem editar demandas')
    }

    const parsedParams = requestIdParamsSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    const parsedBody = updateRequestSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const updated = await this.servicesService.updateRequest(
        db,
        req.user.id,
        parsedParams.data.id,
        parsedBody.data,
      )
      return this.success(res, { request: updated })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar demanda'
      if (message.includes('permission') || message.includes('permissão')) {
        return this.forbidden(res, message)
      }
      return this.serverError(res, message)
    }
  }
}
