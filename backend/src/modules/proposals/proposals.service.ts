import { ProposalsRepository } from './proposals.repository.js'
import type { ProposalEntity, ProposalWithDetails, ProposalForClient } from './proposals.repository.js'
import type { CreateProposalInput, UpdateProposalStatusInput, UpdateProposalInput } from './proposals.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ProposalsService {
  constructor(
    private repository: ProposalsRepository,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(
    db: SupabaseClient,
    _userId: string,
    professionalId: string,
    input: CreateProposalInput,
  ): Promise<ProposalEntity> {
    const exists = await this.repository.exists(db, input.serviceRequestId, professionalId)
    if (exists) {
      throw new Error('Voce ja enviou uma proposta para esta demanda')
    }

    const requestStatus = await this.repository.getServiceRequestStatus(db, input.serviceRequestId)
    if (requestStatus !== 'open') {
      throw new Error('Apenas demandas abertas podem receber propostas')
    }

    // Enviar proposta exige plano ativo + creditos (quota).
    await this.subscriptionsService.consumeProposalQuota(db, professionalId)

    const proposal = await this.repository.create(db, professionalId, input)

    // Best-effort: notify the request owner via SECURITY DEFINER RPC.
    try {
      await db.rpc('notify_client_proposal_received', { p_proposal_id: proposal.id })
    } catch (err) {
      console.warn('Falha ao notificar cliente sobre proposta recebida:', err)
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
    _professionalUserId: string,
    professionalProfileId: string,
    proposalId: string,
    input: UpdateProposalInput,
  ): Promise<ProposalEntity> {
    const existing = await this.repository.findById(db, proposalId)
    if (!existing) throw new Error('Proposta nao encontrada')

    if (existing.professional_id !== professionalProfileId) {
      throw new Error('Voce nao tem permissao para editar esta proposta')
    }

    if (!['pending', 'rejected'].includes(existing.status)) {
      throw new Error('Apenas propostas pendentes ou rejeitadas podem ser editadas')
    }

    const updated = await this.repository.updateProposal(db, proposalId, professionalProfileId, input)

    try {
      await db.rpc('notify_client_proposal_updated', { p_proposal_id: updated.id })
    } catch (err) {
      console.warn('Falha ao notificar cliente sobre proposta editada:', err)
    }

    return updated
  }

  async acceptProposal(db: SupabaseClient, proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) throw new Error('Proposta nao encontrada')

    const { data: serviceRequest } = await db
      .from('service_requests')
      .select('client_id, status')
      .eq('id', proposal.service_request_id)
      .single()

    if (!serviceRequest) throw new Error('Demanda nao encontrada')
    if (serviceRequest.client_id !== clientId) throw new Error('Voce nao tem permissao para aceitar esta proposta')
    if (serviceRequest.status !== 'open') throw new Error('Apenas demandas abertas podem ter propostas aceitas')

    const result = await this.repository.updateStatus(db, proposalId, { status: 'accepted' })
    await this.repository.updateServiceRequestStatus(db, proposal.service_request_id, 'matched')

    try {
      await db.rpc('notify_professional_proposal_status', { p_proposal_id: proposalId, p_status: 'accepted' })
    } catch (err) {
      console.warn('Falha ao notificar profissional sobre aceite:', err)
    }

    return result
  }

  async rejectProposal(db: SupabaseClient, proposalId: string, clientId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) throw new Error('Proposta nao encontrada')

    const { data: serviceRequest } = await db
      .from('service_requests')
      .select('client_id')
      .eq('id', proposal.service_request_id)
      .single()

    if (serviceRequest?.client_id !== clientId) {
      throw new Error('Voce nao tem permissao para rejeitar esta proposta')
    }

    const result = await this.repository.updateStatus(db, proposalId, { status: 'rejected' })

    try {
      await db.rpc('notify_professional_proposal_status', { p_proposal_id: proposalId, p_status: 'rejected' })
    } catch (err) {
      console.warn('Falha ao notificar profissional sobre rejeicao:', err)
    }

    return result
  }

  async cancelProposal(db: SupabaseClient, proposalId: string, professionalId: string): Promise<ProposalEntity> {
    const proposal = await this.repository.findById(db, proposalId)
    if (!proposal) throw new Error('Proposta nao encontrada')

    if (proposal.professional_id !== professionalId) {
      throw new Error('Voce nao tem permissao para cancelar esta proposta')
    }

    if (proposal.status !== 'pending') {
      throw new Error('Apenas propostas pendentes podem ser canceladas')
    }

    return this.repository.updateStatus(db, proposalId, { status: 'cancelled' })
  }
}

