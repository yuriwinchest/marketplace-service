import type { Request, Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { SubscriptionsService } from './subscriptions.service.js'
import { createSubscriptionSchema, updateSubscriptionStatusSchema } from './subscriptions.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class SubscriptionsController extends BaseController {
  constructor(private subscriptionsService: SubscriptionsService) {
    super()
  }

  async getMySubscription(req: AuthedRequest, res: Response): Promise<Response> {
    try {
      // Buscar professional_id do usuário
      const { pool } = await import('../../shared/database/connection.js')
      const profileResult = await pool.query<{ id: string }>(
        `SELECT id FROM public.professional_profiles WHERE user_id = $1`,
        [req.user.id],
      )

      if (!profileResult.rows[0]) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const subscription = await this.subscriptionsService.getByProfessionalId(
        profileResult.rows[0].id,
      )

      if (!subscription) {
        return this.notFound(res, 'Assinatura não encontrada')
      }

      return this.success(res, { subscription })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar assinatura'
      return this.serverError(res, message)
    }
  }

  async create(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = createSubscriptionSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      // Buscar professional_id do usuário
      const { pool } = await import('../../shared/database/connection.js')
      const profileResult = await pool.query<{ id: string }>(
        `SELECT id FROM public.professional_profiles WHERE user_id = $1`,
        [req.user.id],
      )

      if (!profileResult.rows[0]) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const subscription = await this.subscriptionsService.create(
        profileResult.rows[0].id,
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
