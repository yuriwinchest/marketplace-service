import { pool } from '../../shared/database/connection.js'
import { CreateRequestInput } from './services.schema.js'

export interface ServiceRequestEntity {
  id: string
  title: string
  status: string
  urgency: string
  created_at: string
  category_name: string | null
  region_name: string | null
  location_scope: string | null
  uf: string | null
  city: string | null
}

export class ServicesRepository {
  async create(clientId: string, input: CreateRequestInput): Promise<{ id: string }> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO public.service_requests (
        client_id, category_id, region_id, title, description, budget_min, budget_max, urgency,
        location_scope, uf, city
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        clientId,
        input.categoryId ?? null,
        input.regionId ?? null,
        input.title,
        input.description ?? null,
        input.budgetMin ?? null,
        input.budgetMax ?? null,
        input.urgency ?? 'medium',
        input.locationScope ?? 'national',
        input.uf ?? null,
        input.city ?? null,
      ],
    )

    if (!result.rows[0]) {
      throw new Error('Erro ao criar solicitação')
    }

    return result.rows[0]
  }

  async findByClientId(clientId: string): Promise<ServiceRequestEntity[]> {
    const result = await pool.query<ServiceRequestEntity>(
      `SELECT
        r.id,
        r.title,
        r.status,
        r.urgency,
        r.created_at,
        c.name as category_name,
        g.name as region_name,
        r.location_scope,
        r.uf,
        r.city
       FROM public.service_requests r
       LEFT JOIN public.categories c ON c.id = r.category_id
       LEFT JOIN public.regions g ON g.id = r.region_id
       WHERE r.client_id = $1
       ORDER BY r.created_at DESC`,
      [clientId],
    )
    return result.rows
  }

  async findOpenRequests(): Promise<ServiceRequestEntity[]> {
    const result = await pool.query<ServiceRequestEntity>(
      `SELECT
        r.id,
        r.title,
        r.status,
        r.urgency,
        r.created_at,
        c.name as category_name,
        g.name as region_name,
        r.location_scope,
        r.uf,
        r.city
       FROM public.service_requests r
       LEFT JOIN public.categories c ON c.id = r.category_id
       LEFT JOIN public.regions g ON g.id = r.region_id
       WHERE r.status = 'open'
       ORDER BY r.created_at DESC
       LIMIT 50`,
    )
    return result.rows
  }
}
