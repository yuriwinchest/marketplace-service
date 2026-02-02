import { ProposalsRepository } from './proposals.repository.js'
import type { ProposalEntity, ProposalWithDetails } from './proposals.repository.js'
import type { CreateProposalInput, UpdateProposalStatusInput } from './proposals.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'

import { NotificationsService } from '../notifications/notifications.service.js'

export class ProposalsService {
  constructor(
    private repository: ProposalsRepository,
    private subscriptionsService: SubscriptionsService,
    private notificationsService: NotificationsService,
  ) { }

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

    // Obter o ID do cliente dono da demanda
    const { pool } = await import('../../shared/database/connection.js')
    const requestResult = await pool.query<{ client_id: string; title: string }>(
      `SELECT client_id, title FROM public.service_requests WHERE id = $1`,
      [input.serviceRequestId]
    )
    const request = requestResult.rows[0]

    const proposal = await this.repository.create(professionalId, input)

    if (request) {
      await this.notificationsService.notifyUser(
        request.client_id,
        'Nova Proposta Recebida',
        `Você recebeu uma proposta para a demanda "${request.title}".`,
        'PROPOSAL_RECEIVED',
        {
          serviceRequestId: input.serviceRequestId,
          proposalId: proposal.id,
          proposalValue: input.value
        }
      )
    }

    return proposal
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
    const requestResult = await pool.query<{ client_id: string; status: string; title: string }>(
      `SELECT client_id, status, title FROM public.service_requests WHERE id = $1`,
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
    const result = await this.repository.executeInTransaction(async (client) => {
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

    // Notificar o profissional (fora da transação para não bloquear)
    await this.notificationsService.notifyUser(
      result.professional_id,
      'Proposta Aceita! 🎉',
      `Sua proposta para a demanda "${serviceRequest.title || 'Serviço'}" foi aceita! O contato do cliente foi liberado.`,
      'PROPOSAL_ACCEPTED',
      {
        serviceRequestId: proposal.service_request_id,
        proposalId: proposalId
      }
    )

    return result
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

    const result = await this.repository.updateStatus(proposalId, { status: 'rejected' })

    await this.notificationsService.notifyUser(
      proposal.professional_id,
      'Proposta Rejeitada',
      `Sua proposta foi rejeitada pelo cliente.`,
      'PROPOSAL_REJECTED',
      {
        serviceRequestId: proposal.service_request_id,
        proposalId: proposalId
      }
    )

    return result
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
