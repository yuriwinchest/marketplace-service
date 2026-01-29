import { ContactRepository, ContactData } from './contact.repository.js'
import { GetContactInput } from './contact.schema.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'

export class ContactService {
  constructor(
    private repository: ContactRepository,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async getContact(
    requesterId: string,
    requesterRole: string,
    input: GetContactInput,
  ): Promise<ContactData> {
    const targetUserId = input.userId

    // Se o solicitante é cliente e quer contato de profissional
    if (requesterRole === 'client' && input.serviceRequestId) {
      return this.getProfessionalContactForClient(requesterId, targetUserId, input.serviceRequestId)
    }

    // Se o solicitante é profissional e quer contato de cliente
    if (requesterRole === 'professional') {
      return this.getClientContactForProfessional(requesterId, targetUserId, input.serviceRequestId)
    }

    throw new Error('Operação não permitida')
  }

  private async getProfessionalContactForClient(
    clientId: string,
    professionalUserId: string,
    serviceRequestId: string,
  ): Promise<ContactData> {
    // Verificar se o cliente é dono da demanda
    const requestClientId = await this.repository.getServiceRequestClient(serviceRequestId)
    if (requestClientId !== clientId) {
      throw new Error('Você não tem permissão para acessar este contato')
    }

    // Buscar professional_id
    const professionalId = await this.repository.getProfessionalIdByUserId(professionalUserId)
    if (!professionalId) {
      throw new Error('Profissional não encontrado')
    }

    // Verificar condições de liberação
    const canAccess = await this.canAccessContact(professionalId, serviceRequestId)
    if (!canAccess) {
      throw new Error('Contato não está disponível. A proposta deve ser aceita ou o profissional deve ter assinatura ativa.')
    }

    // Retornar dados de contato
    const contact = await this.repository.getProfessionalContact(professionalId)
    if (!contact) {
      throw new Error('Dados de contato não encontrados')
    }

    return contact
  }

  private async getClientContactForProfessional(
    professionalUserId: string,
    clientUserId: string,
    serviceRequestId: string | undefined,
  ): Promise<ContactData> {
    // Buscar professional_id
    const professionalId = await this.repository.getProfessionalIdByUserId(professionalUserId)
    if (!professionalId) {
      throw new Error('Perfil profissional não encontrado')
    }

    // Se há serviceRequestId, verificar se proposta foi aceita
    if (serviceRequestId) {
      const proposal = await this.repository.findProposalByServiceRequestAndProfessional(
        serviceRequestId,
        professionalId,
      )

      if (proposal?.status === 'accepted') {
        // Proposta aceita - contato liberado
        const contact = await this.repository.getClientContact(clientUserId)
        if (!contact) {
          throw new Error('Dados de contato não encontrados')
        }
        return contact
      }
    }

    // Verificar se profissional tem assinatura ativa que permite contato
    const hasActiveSubscription = await this.subscriptionsService.isActive(professionalId)
    if (hasActiveSubscription) {
      const contact = await this.repository.getClientContact(clientUserId)
      if (!contact) {
        throw new Error('Dados de contato não encontrados')
      }
      return contact
    }

    throw new Error('Contato não está disponível. A proposta deve ser aceita ou você deve ter assinatura ativa.')
  }

  private async canAccessContact(
    professionalId: string,
    serviceRequestId: string,
  ): Promise<boolean> {
    // Condição 1: Verificar se há proposta aceita
    const proposal = await this.repository.findProposalByServiceRequestAndProfessional(
      serviceRequestId,
      professionalId,
    )

    if (proposal?.status === 'accepted') {
      // Verificar se demanda está em 'matched' (in_progress)
      const requestStatus = await this.repository.getServiceRequestStatus(serviceRequestId)
      if (requestStatus === 'matched') {
        return true
      }
    }

    // Condição 2: Verificar se profissional tem assinatura ativa
    const hasActiveSubscription = await this.subscriptionsService.isActive(professionalId)
    if (hasActiveSubscription) {
      return true
    }

    return false
  }
}
