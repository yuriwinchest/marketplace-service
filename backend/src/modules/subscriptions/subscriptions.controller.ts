import type { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { SubscriptionsService } from './subscriptions.service.js'
import { createSubscriptionSchema, updateSubscriptionStatusSchema } from './subscriptions.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'
import { supabase } from '../../shared/database/supabaseClient.js'

export class SubscriptionsController extends BaseController {
  constructor(private subscriptionsService: SubscriptionsService) {
    super()
  }

  async listPlans(_req: Request, res: Response): Promise<Response> {
    return this.success(res, { items: this.subscriptionsService.getPlans() })
  }

  async getMySubscription(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const subscription = await this.subscriptionsService.getByProfessionalId(
        profile.id,
      )
      const quota = await this.subscriptionsService.getQuotaStatus(profile.id)

      if (!subscription) {
        return this.success(res, { subscription: null, quota })
      }

      return this.success(res, { subscription, quota })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar assinatura'
      return this.serverError(res, message)
    }
  }

  async getMyQuota(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const quota = await this.subscriptionsService.getQuotaStatus(profile.id)
      return this.success(res, { quota })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar limites'
      return this.serverError(res, message)
    }
  }

  async create(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = createSubscriptionSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const subscription = await this.subscriptionsService.create(
        profile.id,
        parsed.data,
      )

      return this.created(res, { subscription })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar assinatura'
      return this.serverError(res, message)
    }
  }

  async webhook(req: Request, res: Response): Promise<Response> {
    // Webhook do Stripe - não requer autenticação do usuário
    // A validação será feita via assinatura do Stripe
    const parsed = updateSubscriptionStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    const stripeSubscriptionId = req.body.stripeSubscriptionId as string
    if (!stripeSubscriptionId) {
      return this.error(res, 'stripeSubscriptionId é obrigatório')
    }

    try {
      const subscription = await this.subscriptionsService.updateFromWebhook(
        stripeSubscriptionId,
        parsed.data,
      )

      return this.success(res, { subscription })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar assinatura'
      if (message === 'Assinatura não encontrada') {
        return this.notFound(res, message)
      }
      return this.serverError(res, message)
    }
  }
}
