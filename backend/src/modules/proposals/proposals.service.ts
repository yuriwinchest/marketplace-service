import { ProposalsRepository } from './proposals.repository.js'
import type { ProposalEntity, ProposalWithDetails, ProposalForClient } from './proposals.repository.js'
import type { CreateProposalInput, UpdateProposalStatusInput, UpdateProposalInput } from './proposals.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'
import { supabaseAdmin } from '../../shared/database/supabaseClient.js'
import { NotificationsService } from '../notifications/notifications.service.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ProposalsService {
  constructor(
    private repository: ProposalsRepository,
    private subscriptionsService: SubscriptionsService,
    private notificationsService: NotificationsService,
  ) { }

  async create(
    db: SupabaseClient,
    _userId: string,
    professionalId: string,
    input: CreateProposalInput,
  ): Promise<ProposalEntity> {
    // Verificar se já existe proposta do mesmo profissional para a mesma demanda
    const exists = await this.repository.exists(db, input.serviceRequestId, professionalId)
    if (exists) {
      throw new Error('Você já enviou uma proposta para esta demanda')
    }

    // Verificar se a demanda está aberta
    const requestStatus = await this.repository.getServiceRequestStatus(db, input.serviceRequestId)
    if (requestStatus !== 'open') {
      throw new Error('Apenas demandas abertas podem receber propostas')
    }

    // Consumir limite: 3 gratuitas e depois plano mensal
    await this.subscriptionsService.consumeProposalQuota(professionalId)

    // Obter o ID do cliente dono da demanda
    const { data: request } = await supabaseAdmin
      .from('service_requests')
      .select('client_id, title')
      .eq('id', input.serviceRequestId)
      .single()

    const proposal = await this.repository.create(db, professionalId, input)

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

  async getByServiceRequest(db: SupabaseClient, serviceRequestId: string): Promise<ProposalForClient[]> {
    return this.repository.findByServiceRequest(db, serviceRequestId)
  }

  async getByProfessional(db: SupabaseClient, professionalId: string): Promise<ProposalWithDetails[]> {
    return this.repository.findByProfessional(db, professionalId)
  }

  async getReceivedByClient(db: SupabaseClient, clientUserId: string): Promise<ProposalForClient[]> {
    return this.repository.findReceivedByClient(db, clientUserId)
  }

  async updateProposal(
    db: SupabaseClient,
    professionalUserId: string,
    professionalProfileId: string,
    proposalId: string,
    input: UpdateProposalInput,
  ): Promise<ProposalEntity> {
    const existing = await this.repository.findById(db, proposalId)
    if (!existing) throw new Error('Proposta não encontrada')

    if (existing.professional_id !== professionalProfileId) {
      throw new Error('Você não tem permissão para editar esta proposta')
    }

    if (!['pending', 'rejected'].includes(existing.status)) {
      throw new Error('Apenas propostas pendentes ou rejeitadas podem ser editadas')
    }

    const updated = await this.repository.updateProposal(db, proposalId, professionalProfileId, input)

    // Notify the demand owner (client) that the proposal changed.
    const { data: request } = await supabaseAdmin
      .from('service_requests')
      .select('client_id, title')
      .eq('id', updated.service_request_id)
      .single()

    if (request?.client_id) {
      await this.notificationsService.notifyUser(
        request.client_id,
        'Proposta editada',
        `O freelancer atualizou a proposta na demanda "${request.title || 'Serviço'}".`,
        'SYSTEM_ALERT',
        { subtype: 'PROPOSAL_UPDATED', serviceRequestId: updated.service_request_id, proposalId },
      )
    }

    return updated
  }

  async acceptProposal(db: SupabaseClient, proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    // Verificar se o cliente é dono da demanda
    const { data: serviceRequest } = await db
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
    const result = await this.repository.updateStatus(db, proposalId, { status: 'accepted' })

    // Atualizar status da demanda para 'matched'
    await this.repository.updateServiceRequestStatus(db, proposal.service_request_id, 'matched')

    // Notificar o profissional (proposal.professional_id is professional_profiles.id)
    const professionalUserId = await this.repository.getProfessionalUserIdByProfileId(result.professional_id)
    if (professionalUserId) {
      await this.notificationsService.notifyUser(
        professionalUserId,
      'Proposta Aceita! 🎉',
      `Sua proposta para a demanda "${serviceRequest.title || 'Serviço'}" foi aceita! O contato do cliente foi liberado.`,
      'PROPOSAL_ACCEPTED',
      {
        serviceRequestId: proposal.service_request_id,
        proposalId: proposalId
      }
    )
    }

    return result
  }

  async rejectProposal(db: SupabaseClient, proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    // Verificar se o cliente é dono da demanda
    const { data: serviceRequest } = await db
      .from('service_requests')
      .select('client_id')
      .eq('id', proposal.service_request_id)
      .single()

    if (serviceRequest?.client_id !== clientId) {
      throw new Error('Você não tem permissão para rejeitar esta proposta')
    }

    const result = await this.repository.updateStatus(db, proposalId, { status: 'rejected' })

    const professionalUserId = await this.repository.getProfessionalUserIdByProfileId(proposal.professional_id)
    if (professionalUserId) {
      await this.notificationsService.notifyUser(
        professionalUserId,
      'Proposta Rejeitada',
      `Sua proposta foi rejeitada pelo cliente.`,
      'PROPOSAL_REJECTED',
      {
        serviceRequestId: proposal.service_request_id,
        proposalId: proposalId
      }
    )
    }

    return result
  }

  async cancelProposal(db: SupabaseClient, proposalId: string, professionalId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) {
      throw new Error('Proposta não encontrada')
    }

    if (proposal.professional_id !== professionalId) {
      throw new Error('Você não tem permissão para cancelar esta proposta')
    }

    if (proposal.status !== 'pending') {
      throw new Error('Apenas propostas pendentes podem ser canceladas')
    }

    return this.repository.updateStatus(db, proposalId, { status: 'cancelled' })
  }
}
