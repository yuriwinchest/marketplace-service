import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ProposalsService } from './proposals.service.js'
import { createProposalSchema, updateProposalStatusSchema, updateProposalSchema } from './proposals.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

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
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const proposal = await this.proposalsService.create(
        db,
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
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')

      const { data: request, error: requestError } = await db
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

      const proposals = await this.proposalsService.getByServiceRequest(db, serviceRequestId)
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
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const proposals = await this.proposalsService.getByProfessional(db, profile.id)
      return this.success(res, { items: proposals })
    } catch (error) {
      return this.serverError(res, 'Erro ao buscar propostas')
    }
  }

  async getReceivedForClient(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'client') {
      return this.forbidden(res, 'Apenas clientes podem ver propostas recebidas')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const items = await this.proposalsService.getReceivedByClient(db, req.user.id)
      return this.success(res, { items })
    } catch {
      return this.serverError(res, 'Erro ao buscar propostas recebidas')
    }
  }

  async accept(req: AuthedRequest, res: Response): Promise<Response> {
    const proposalId = req.params.id as string

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const proposal = await this.proposalsService.acceptProposal(db, proposalId, req.user.id)
      return this.success(res, { proposal })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao aceitar proposta'
      if (message.includes('permissão') || message.includes('demandas abertas')) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async update(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'professional') {
      return this.forbidden(res, 'Apenas profissionais podem editar propostas')
    }

    const proposalId = req.params.id as string

    const parsed = updateProposalSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const updated = await this.proposalsService.updateProposal(
        db,
        req.user.id,
        profile.id,
        proposalId,
        parsed.data,
      )

      return this.success(res, { proposal: updated })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao editar proposta'
      if (message.includes('permissão') || message.includes('pendentes') || message.includes('rejeitadas')) {
        return this.error(res, message, 400)
      }
      return this.serverError(res, message)
    }
  }

  async reject(req: AuthedRequest, res: Response): Promise<Response> {
    const proposalId = req.params.id as string

    try {
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')
      const proposal = await this.proposalsService.rejectProposal(db, proposalId, req.user.id)
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
      const db = req.db
      if (!db) return this.unauthorized(res, 'Não autenticado')

      const { data: profile, error: profileError } = await db
        .from('professional_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (profileError || !profile) {
        return this.notFound(res, 'Perfil profissional não encontrado')
      }

      const proposal = await this.proposalsService.cancelProposal(
        db,
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
