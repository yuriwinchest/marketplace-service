import { supabase } from '../../shared/database/supabaseClient.js'

export interface ContactData {
  email: string | null
  phone: string | null
  whatsapp: string | null
  name: string | null
}

export interface ProposalStatus {
  status: string
  service_request_id: string
}

export interface ContactUnlockEntity {
  id: string
  client_id: string
  professional_id: string
  service_request_id: string | null
  price: string
  created_at: string
}

export class ContactRepository {
  async getProfessionalContact(professionalId: string): Promise<ContactData | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select(`
        phone,
        whatsapp,
        users!inner (email, name)
      `)
      .eq('id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar contato do profissional:', error.message)
    }

    if (!data) return null

    return {
      email: (data as any).users?.email || null,
      phone: data.phone,
      whatsapp: data.whatsapp,
      name: (data as any).users?.name || null,
    }
  }

  async getClientContact(clientId: string): Promise<ContactData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', clientId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar contato do cliente:', error.message)
    }

    if (!data) return null

    return {
      email: data.email,
      phone: null,
      whatsapp: null,
      name: data.name,
    }
  }

  async findProposalByServiceRequestAndProfessional(
    serviceRequestId: string,
    professionalId: string,
  ): Promise<ProposalStatus | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('status, service_request_id')
      .eq('service_request_id', serviceRequestId)
      .eq('professional_id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar proposta:', error.message)
    }
    return data || null
  }

  async getServiceRequestClient(serviceRequestId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('service_requests')
      .select('client_id')
      .eq('id', serviceRequestId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar cliente da solicitação:', error.message)
    }
    return data?.client_id || null
  }

  async getProfessionalIdByUserId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar ID do profissional:', error.message)
    }
    return data?.id || null
  }

  async getSubscriptionStatus(professionalId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('professional_id', professionalId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar status da assinatura:', error.message)
    }
    return data?.status || null
  }

  async hasContactUnlock(clientId: string, professionalId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('professional_id', professionalId)

    if (error) {
      console.warn('Erro ao buscar desbloqueio de contato:', error.message)
      return false
    }

    return (count || 0) > 0
  }

  async createContactUnlock(
    clientId: string,
    professionalId: string,
    price: number,
    serviceRequestId?: string,
  ): Promise<ContactUnlockEntity> {
    const { data, error } = await supabase
      .from('contact_unlocks')
      .insert({
        client_id: clientId,
        professional_id: professionalId,
        service_request_id: serviceRequestId ?? null,
        price,
      })
      .select('id, client_id, professional_id, service_request_id, price, created_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Erro ao desbloquear contato')
    }

    return data as ContactUnlockEntity
  }

  async getServiceRequestStatus(serviceRequestId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('service_requests')
      .select('status')
      .eq('id', serviceRequestId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Erro ao buscar status da solicitação:', error.message)
    }
    return data?.status || null
  }
}
