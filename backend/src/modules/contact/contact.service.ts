import { ContactRepository } from './contact.repository.js'
import type { ContactData } from './contact.repository.js'
import type { GetContactInput, UnlockContactInput } from './contact.schema.js'
import { DIRECT_CONTACT_PRICE } from '../subscriptions/subscriptionPlans.js'

export class ContactService {
  constructor(private repository: ContactRepository) { }

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

  async unlockProfessionalContact(
    clientId: string,
    input: UnlockContactInput,
  ): Promise<{ alreadyUnlocked: boolean; price: number }> {
    const professionalId = await this.repository.getProfessionalIdByUserId(input.userId)
    if (!professionalId) {
      throw new Error('Profissional não encontrado')
    }

    if (input.serviceRequestId) {
      const requestClientId = await this.repository.getServiceRequestClient(input.serviceRequestId)
      if (requestClientId !== clientId) {
        throw new Error('Você não tem permissão para desbloquear este contato')
      }
    }

    const alreadyUnlocked = await this.repository.hasContactUnlock(clientId, professionalId)
    if (alreadyUnlocked) {
      return { alreadyUnlocked: true, price: DIRECT_CONTACT_PRICE }
    }

    await this.repository.createContactUnlock(
      clientId,
      professionalId,
      DIRECT_CONTACT_PRICE,
      input.serviceRequestId,
    )

    return { alreadyUnlocked: false, price: DIRECT_CONTACT_PRICE }
  }

  private async getProfessionalContactForClient(
    clientId: string,
    professionalUserId: string,
    serviceRequestId?: string,
  ): Promise<ContactData> {
    // Buscar professional_id
    const professionalId = await this.repository.getProfessionalIdByUserId(professionalUserId)
    if (!professionalId) {
      throw new Error('Profissional não encontrado')
    }

    // Se veio com serviceRequest, libera se proposta foi aceita para esta demanda
    if (serviceRequestId) {
      const requestClientId = await this.repository.getServiceRequestClient(serviceRequestId)
      if (requestClientId !== clientId) {
        throw new Error('Você não tem permissão para acessar este contato')
      }

      const proposal = await this.repository.findProposalByServiceRequestAndProfessional(
        serviceRequestId,
        professionalId,
      )

      if (proposal?.status === 'accepted') {
        const contact = await this.repository.getProfessionalContact(professionalId)
        if (!contact) {
          throw new Error('Dados de contato não encontrados')
        }
        return contact
      }
    }

    // Fora da proposta aceita, exige desbloqueio direto pago
    const hasUnlock = await this.repository.hasContactUnlock(clientId, professionalId)
    if (!hasUnlock) {
      throw new Error(
        `Contato não está disponível. Faça o desbloqueio direto por R$ ${DIRECT_CONTACT_PRICE.toFixed(2)}.`,
      )
    }

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
    if (!serviceRequestId) {
      throw new Error('serviceRequestId é obrigatório para contato com cliente')
    }

    // Buscar professional_id
    const professionalId = await this.repository.getProfessionalIdByUserId(professionalUserId)
    if (!professionalId) {
      throw new Error('Perfil profissional não encontrado')
    }

    const requestClientId = await this.repository.getServiceRequestClient(serviceRequestId)
    if (!requestClientId || requestClientId !== clientUserId) {
      throw new Error('Você não tem permissão para acessar este contato')
    }

    const proposal = await this.repository.findProposalByServiceRequestAndProfessional(
      serviceRequestId,
      professionalId,
    )

    if (proposal?.status !== 'accepted') {
      throw new Error('Contato não está disponível. A proposta precisa ser aceita.')
    }

    const contact = await this.repository.getClientContact(clientUserId)
    if (!contact) {
      throw new Error('Dados de contato não encontrados')
    }

    return contact
  }
}
