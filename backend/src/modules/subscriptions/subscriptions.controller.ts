import type { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { SubscriptionsService } from './subscriptions.service.js'
import { createSubscriptionSchema } from './subscriptions.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class SubscriptionsController extends BaseController {
  constructor(private subscriptionsService: SubscriptionsService) {
    super()
  }

  async listPlans(_req: Request, res: Response): Promise<Response> {
    return this.success(res, { items: this.subscriptionsService.getPlans() })
  }

  async getMySubscription(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem acessar assinaturas')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Nao autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional nao encontrado')
      }

      const [subscription, quota] = await Promise.all([
        this.subscriptionsService.getByProfessionalId(db, profile.id),
        this.subscriptionsService.getQuotaStatus(db, profile.id),
      ])

      return this.success(res, { subscription: subscription ?? null, quota })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar assinatura'
      return this.serverError(res, message)
    }
  }

  async getMyQuota(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem acessar limites')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Nao autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional nao encontrado')
      }

      const quota = await this.subscriptionsService.getQuotaStatus(db, profile.id)
      return this.success(res, { quota })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar limites'
      return this.serverError(res, message)
    }
  }

  async create(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem assinar planos')
    }

    const parsed = createSubscriptionSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados invalidos')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Nao autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional nao encontrado')
      }

      const subscription = await this.subscriptionsService.create(db, profile.id, parsed.data)
      return this.created(res, { subscription })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar assinatura'
      return this.serverError(res, message)
    }
  }

  async webhook(_req: Request, res: Response): Promise<Response> {
    // Stripe webhook is not implemented securely in this project yet.
    // Keep the route for future work, but do not allow unauthenticated state changes.
    return this.forbidden(res, 'Webhook nao configurado')
  }
}

