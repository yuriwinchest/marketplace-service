import { ProposalsRepository, ProposalEntity, ProposalWithDetails } from './proposals.repository.js'
import { CreateProposalInput, UpdateProposalStatusInput } from './proposals.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'

export class ProposalsService {
  constructor(
    private repository: ProposalsRepository,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(
    userId: string,
    professionalId: string,
    input: CreateProposalInput,
  ): Promise<ProposalEntity> {
    // Verificar se já existe proposta do mesmo profissional para a mesma demanda
    const exists = await this.repository.exists(input.serviceRequestId, professionalId)
    if (exists) {
      throw new Error('Você já enviou uma proposta para esta demanda')
    }

    // Verificar se a demanda está aberta
    const requestStatus = await this.repository.getServiceRequestStatus(input.serviceRequestId)
    if (requestStatus !== 'open') {
      throw new Error('Apenas demandas abertas podem receber propostas')
    }

    // Verificar assinatura ativa
    const hasActiveSubscription = await this.subscriptionsService.isActive(professionalId)
    if (!hasActiveSubscription) {
      throw new Error('Assinatura ativa é necessária para enviar propostas')
    }

    return this.repository.create(professionalId, input)
  }

  async getByServiceRequest(serviceRequestId: string): Promise<ProposalWithDetails[]> {
    return this.repository.findByServiceRequest(serviceRequestId)
  }

  async getByProfessional(professionalId: string): Promise<ProposalWithDetails[]> {
    return this.repository.findByProfessional(professionalId)
  }

  async acceptProposal(proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    // Verificar se o cliente é dono da demanda
    const { pool } = await import('../../shared/database/connection.js')
    const requestResult = await pool.query<{ client_id: string; status: string }>(
      `SELECT client_id, status FROM public.service_requests WHERE id = $1`,
      [proposal.service_request_id],
    )

    const serviceRequest = requestResult.rows[0]
    if (!serviceRequest) {
      throw new Error('Demanda não encontrada')
    }

    if (serviceRequest.client_id !== clientId) {
      throw new Error('Você não tem permissão para aceitar esta proposta')
    }

    if (serviceRequest.status !== 'open') {
      throw new Error('Apenas demandas abertas podem ter propostas aceitas')
    }

    // Transação: atualizar proposta e demanda
    return this.repository.executeInTransaction(async (client) => {
      // Atualizar status da proposta
      const proposalResult = await client.query<ProposalEntity>(
        `UPDATE public.proposals
         SET status = $1, updated_at = now()
         WHERE id = $2
         RETURNING id, service_request_id, professional_id, value, description, estimated_days,
                   status, created_at, updated_at`,
        ['accepted', proposalId],
      )

      if (!proposalResult.rows[0]) {
        throw new Error('Proposta não encontrada')
      }

      // Atualizar status da demanda para 'matched' (equivalente a 'in_progress')
      await client.query(
        `UPDATE public.service_requests
         SET status = $1, updated_at = now()
         WHERE id = $2`,
        ['matched', proposal.service_request_id],
      )

      return proposalResult.rows[0]
    })
  }

  async rejectProposal(proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    // Verificar se o cliente é dono da demanda
    const { pool } = await import('../../shared/database/connection.js')
    const requestResult = await pool.query<{ client_id: string }>(
      `SELECT client_id FROM public.service_requests WHERE id = $1`,
      [proposal.service_request_id],
    )

    if (requestResult.rows[0]?.client_id !== clientId) {
      throw new Error('Você não tem permissão para rejeitar esta proposta')
    }

    return this.repository.updateStatus(proposalId, { status: 'rejected' })
  }

  async cancelProposal(proposalId: string, professionalId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    if (proposal.professional_id !== professionalId) {
      throw new Error('Você não tem permissão para cancelar esta proposta')
    }

    if (proposal.status !== 'pending') {
      throw new Error('Apenas propostas pendentes podem ser canceladas')
    }

    return this.repository.updateStatus(proposalId, { status: 'cancelled' })
  }
}
