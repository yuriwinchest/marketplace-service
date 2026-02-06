import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ProposalsService } from './proposals.service.js'
import { createProposalSchema, updateProposalStatusSchema } from './proposals.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'
import { supabase } from '../../shared/database/supabaseClient.js'

export class ProposalsController extends BaseController {
  constructor(private proposalsService: ProposalsService) {
    super()
  }

  async create(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem enviar propostas')
    }

    const parsed = createProposalSchema.safeParse(req.body)
    if (!parsed.success) {
      const errorMessage = parsed.error.issues.map(e => e.message).join(', ')
      return this.error(res, `Dados inválidos: ${errorMessage}`)
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

      const proposal = await this.proposalsService.create(
        req.user.id,
        profile.id,
        parsed.data,
      )

      return this.created(res, { proposal })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar proposta'
      if (
        message.includes('já enviou') ||
        message.includes('limite') ||
        message.includes('Contrate') ||
        message.includes('demandas abertas')
      ) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async getByServiceRequest(req: AuthedRequest, res: Response): Promise<Response> {
    const serviceRequestId = req.params.serviceRequestId as string

    try {
      // Verificar se o usuário é dono da demanda
      const { data: request, error: requestError } = await supabase
        .from('service_requests')
        .select('client_id')
        .eq('id', serviceRequestId)
        .single()

      if (requestError || !request) {
        return this.notFound(res, 'Demanda não encontrada')
      }

      if (request.client_id !== req.user.id) {
        return this.forbidden(res, 'Você não tem permissão para ver estas propostas')
      }

      const proposals = await this.proposalsService.getByServiceRequest(serviceRequestId)
      return this.success(res, { items: proposals })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar propostas')
    }
  }

  async getMyProposals(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem ver suas propostas')
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

      const proposals = await this.proposalsService.getByProfessional(profile.id)
      return this.success(res, { items: proposals })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar propostas')
    }
  }

  async accept(req: AuthedRequest, res: Response): Promise<Response> {
    const proposalId = req.params.id as string

    try {
      const proposal = await this.proposalsService.acceptProposal(proposalId, req.user.id)
      return this.success(res, { proposal })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao aceitar proposta'
      if (message.includes('permissão') || message.includes('demandas abertas')) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async reject(req: AuthedRequest, res: Response): Promise<Response> {
    const proposalId = req.params.id as string

    try {
      const proposal = await this.proposalsService.rejectProposal(proposalId, req.user.id)
      return this.success(res, { proposal })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar proposta'
      if (message.includes('permissão')) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async cancel(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem cancelar propostas')
    }

    const proposalId = req.params.id as string

    try {
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const proposal = await this.proposalsService.cancelProposal(
        proposalId,
        profile.id,
      )
      return this.success(res, { proposal })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar proposta'
      if (message.includes('permissão') || message.includes('pendentes')) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }
}
