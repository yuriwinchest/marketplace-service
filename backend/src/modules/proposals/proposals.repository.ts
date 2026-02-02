import { pool } from '../../shared/database/connection.js'
import type { PoolClient } from 'pg'
import type { CreateProposalInput, UpdateProposalStatusInput } from './proposals.schema.js'

export interface ProposalEntity {
  id: string
  service_request_id: string
  professional_id: string
  value: string
  description: string
  estimated_days: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface ProposalWithDetails extends ProposalEntity {
  professional_name: string | null
  service_request_title: string
  service_request_status: string
}

export class ProposalsRepository {
  async create(professionalId: string, input: CreateProposalInput): Promise<ProposalEntity> {
    const result = await pool.query<ProposalEntity>(
      `INSERT INTO public.proposals (service_request_id, professional_id, value, description, estimated_days)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, service_request_id, professional_id, value, description, estimated_days,
                 status, created_at, updated_at`,
      [
        input.serviceRequestId,
        professionalId,
        input.value,
        input.description,
        input.estimatedDays ?? null,
      ],
    )

    if (!result.rows[0]) {
      throw new Error('Erro ao criar proposta')
    }

    return result.rows[0]
  }

  async findByServiceRequest(serviceRequestId: string): Promise<ProposalWithDetails[]> {
    const result = await pool.query<ProposalWithDetails>(
      `SELECT 
        p.id, p.service_request_id, p.professional_id, p.value, p.description,
        p.estimated_days, p.status, p.created_at, p.updated_at,
        u.name as professional_name,
        sr.title as service_request_title,
        sr.status as service_request_status
       FROM public.proposals p
       JOIN public.professional_profiles pp ON pp.id = p.professional_id
       JOIN public.users u ON u.id = pp.user_id
       JOIN public.service_requests sr ON sr.id = p.service_request_id
       WHERE p.service_request_id = $1
       ORDER BY p.created_at DESC`,
      [serviceRequestId],
    )
    return result.rows
  }

  async findByProfessional(professionalId: string): Promise<ProposalWithDetails[]> {
    const result = await pool.query<ProposalWithDetails>(
      `SELECT 
        p.id, p.service_request_id, p.professional_id, p.value, p.description,
        p.estimated_days, p.status, p.created_at, p.updated_at,
        u.name as professional_name,
        sr.title as service_request_title,
        sr.status as service_request_status
       FROM public.proposals p
       JOIN public.professional_profiles pp ON pp.id = p.professional_id
       JOIN public.users u ON u.id = pp.user_id
       JOIN public.service_requests sr ON sr.id = p.service_request_id
       WHERE p.professional_id = $1
       ORDER BY p.created_at DESC`,
      [professionalId],
    )
    return result.rows
  }

  async findById(proposalId: string): Promise<ProposalEntity | null> {
    const result = await pool.query<ProposalEntity>(
      `SELECT id, service_request_id, professional_id, value, description, estimated_days,
              status, created_at, updated_at
       FROM public.proposals
       WHERE id = $1`,
      [proposalId],
    )
    return result.rows[0] || null
  }

  async exists(serviceRequestId: string, professionalId: string): Promise<boolean> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM public.proposals
       WHERE service_request_id = $1 AND professional_id = $2`,
      [serviceRequestId, professionalId],
    )
    return parseInt(result.rows[0]?.count || '0') > 0
  }

  async updateStatus(
    proposalId: string,
    input: UpdateProposalStatusInput,
  ): Promise<ProposalEntity> {
    const result = await pool.query<ProposalEntity>(
      `UPDATE public.proposals
       SET status = $1, updated_at = now()
       WHERE id = $2
       RETURNING id, service_request_id, professional_id, value, description, estimated_days,
                 status, created_at, updated_at`,
      [input.status, proposalId],
    )

    if (!result.rows[0]) {
      throw new Error('Proposta não encontrada')
    }

    return result.rows[0]
  }

  async getServiceRequestStatus(serviceRequestId: string): Promise<string | null> {
    const result = await pool.query<{ status: string }>(
      `SELECT status FROM public.service_requests WHERE id = $1`,
      [serviceRequestId],
    )
    return result.rows[0]?.status || null
  }

  async updateServiceRequestStatus(
    serviceRequestId: string,
    status: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE public.service_requests
       SET status = $1, updated_at = now()
       WHERE id = $2`,
      [status, serviceRequestId],
    )
  }

  async executeInTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
