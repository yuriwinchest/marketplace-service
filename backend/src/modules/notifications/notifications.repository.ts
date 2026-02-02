
import { pool } from '../../shared/database/connection.js'

export type NotificationType =
    | 'PROPOSAL_RECEIVED'
    | 'PROPOSAL_ACCEPTED'
    | 'PROPOSAL_REJECTED'
    | 'CONTACT_VIEWED'
    | 'SYSTEM_ALERT'

export interface NotificationEntity {
    id: string
    user_id: string
    title: string
    message: string
    type: NotificationType
    metadata: Record<string, any>
    read_at: Date | null
    created_at: Date
}

export class NotificationsRepository {
    async create(
        userId: string,
        title: string,
        message: string,
        type: NotificationType,
        metadata: Record<string, any> = {}
    ): Promise<NotificationEntity> {
        const result = await pool.query<NotificationEntity>(
            `INSERT INTO public.notifications (user_id, title, message, type, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [userId, title, message, type, metadata]
        )
        return result.rows[0]!
    }

    async findByUser(userId: string, limit = 20, offset = 0): Promise<NotificationEntity[]> {
        const result = await pool.query<NotificationEntity>(
            `SELECT * FROM public.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        )
        return result.rows
    }

    async countUnread(userId: string): Promise<number> {
        const result = await pool.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM public.notifications
       WHERE user_id = $1 AND read_at IS NULL`,
            [userId]
        )
        return parseInt(result.rows[0]!.count, 10)
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await pool.query(
            `UPDATE public.notifications
       SET read_at = now()
       WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        )
    }

    async markAllAsRead(userId: string): Promise<void> {
        await pool.query(
            `UPDATE public.notifications
       SET read_at = now()
       WHERE user_id = $1 AND read_at IS NULL`,
            [userId]
        )
    }
}
