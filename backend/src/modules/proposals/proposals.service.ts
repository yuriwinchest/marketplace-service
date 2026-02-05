import { ProposalsRepository } from './proposals.repository.js'
import type { ProposalEntity, ProposalWithDetails } from './proposals.repository.js'
import type { CreateProposalInput, UpdateProposalStatusInput } from './proposals.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'
import { supabase } from '../../shared/database/supabaseClient.js'
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
    const { data: request } = await supabase
      .from('service_requests')
      .select('client_id, title')
      .eq('id', input.serviceRequestId)
      .single()

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
    const { data: serviceRequest } = await supabase
      .from('service_requests')
      .select('client_id, status, title')
      .eq('id', proposal.service_request_id)
      .single()

    if (!serviceRequest) {
      throw new Error('Demanda não encontrada')
    }

    if (serviceRequest.client_id !== clientId) {
      throw new Error('Você não tem permissão para aceitar esta proposta')
    }

    if (serviceRequest.status !== 'open') {
      throw new Error('Apenas demandas abertas podem ter propostas aceitas')
    }

    // Atualizar proposta para aceita
    const result = await this.repository.updateStatus(proposalId, { status: 'accepted' })

    // Atualizar status da demanda para 'matched'
    await this.repository.updateServiceRequestStatus(proposal.service_request_id, 'matched')

    // Notificar o profissional
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
    const { data: serviceRequest } = await supabase
      .from('service_requests')
      .select('client_id')
      .eq('id', proposal.service_request_id)
      .single()

    if (serviceRequest?.client_id !== clientId) {
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
