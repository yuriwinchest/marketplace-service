import { pool } from '../../shared/database/connection.js'

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

export class ContactRepository {
  async getProfessionalContact(professionalId: string): Promise<ContactData | null> {
    const result = await pool.query<ContactData>(
      `SELECT 
        u.email,
        pp.phone,
        pp.whatsapp,
        u.name
       FROM public.professional_profiles pp
       JOIN public.users u ON u.id = pp.user_id
       WHERE pp.id = $1`,
      [professionalId],
    )
    return result.rows[0] || null
  }

  async getClientContact(clientId: string): Promise<ContactData | null> {
    const result = await pool.query<ContactData>(
      `SELECT email, null as phone, null as whatsapp, name
       FROM public.users
       WHERE id = $1`,
      [clientId],
    )
    return result.rows[0] || null
  }

  async findProposalByServiceRequestAndProfessional(
    serviceRequestId: string,
    professionalId: string,
  ): Promise<ProposalStatus | null> {
    const result = await pool.query<ProposalStatus>(
      `SELECT status, service_request_id
       FROM public.proposals
       WHERE service_request_id = $1 AND professional_id = $2`,
      [serviceRequestId, professionalId],
    )
    return result.rows[0] || null
  }

  async getServiceRequestClient(serviceRequestId: string): Promise<string | null> {
    const result = await pool.query<{ client_id: string }>(
      `SELECT client_id FROM public.service_requests WHERE id = $1`,
      [serviceRequestId],
    )
    return result.rows[0]?.client_id || null
  }

  async getProfessionalIdByUserId(userId: string): Promise<string | null> {
    const result = await pool.query<{ id: string }>(
      `SELECT id FROM public.professional_profiles WHERE user_id = $1`,
      [userId],
    )
    return result.rows[0]?.id || null
  }

  async getSubscriptionStatus(professionalId: string): Promise<string | null> {
    const result = await pool.query<{ status: string }>(
      `SELECT status FROM public.subscriptions WHERE professional_id = $1`,
      [professionalId],
    )
    return result.rows[0]?.status || null
  }

  async getServiceRequestStatus(serviceRequestId: string): Promise<string | null> {
    const result = await pool.query<{ status: string }>(
      `SELECT status FROM public.service_requests WHERE id = $1`,
      [serviceRequestId],
    )
    return result.rows[0]?.status || null
  }
}
