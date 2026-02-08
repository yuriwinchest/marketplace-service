import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../../shared/database/supabaseClient.js'

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
    async createMany(
        input: {
            userId: string
            title: string
            message: string
            type: NotificationType
            metadata?: Record<string, any>
        }[],
    ): Promise<void> {
        if (input.length === 0) return

        const payload = input.map((n) => ({
            user_id: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            metadata: n.metadata ?? {},
        }))

        const { error } = await supabaseAdmin
            .from('notifications')
            .insert(payload)

        if (error) {
            throw new Error(error.message || 'Erro ao criar notificações')
        }
    }

    async create(
        userId: string,
        title: string,
        message: string,
        type: NotificationType,
        metadata: Record<string, any> = {}
    ): Promise<NotificationEntity> {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                metadata,
            })
            .select('*')
            .single()

        if (error || !data) {
            throw new Error(error?.message || 'Erro ao criar notificação')
        }

        return data as NotificationEntity
    }

    async findByUser(db: SupabaseClient, userId: string, limit = 20, offset = 0): Promise<NotificationEntity[]> {
        const { data, error } = await db
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.warn('Erro ao buscar notificações:', error.message)
            return []
        }
        return (data || []) as NotificationEntity[]
    }

    async countUnread(db: SupabaseClient, userId: string): Promise<number> {
        const { count, error } = await db
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .is('read_at', null)

        if (error) {
            console.warn('Erro ao contar notificações não lidas:', error.message)
            return 0
        }
        return count || 0
    }

    async markAsRead(db: SupabaseClient, notificationId: string, userId: string): Promise<void> {
        const { error } = await db
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .eq('user_id', userId)

        if (error) {
            console.warn('Erro ao marcar notificação como lida:', error.message)
        }
    }

    async markAllAsRead(db: SupabaseClient, userId: string): Promise<void> {
        const { error } = await db
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .is('read_at', null)

        if (error) {
            console.warn('Erro ao marcar todas notificações como lidas:', error.message)
        }
    }
}
