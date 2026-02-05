import { supabase } from '../../shared/database/supabaseClient.js'

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
        const { data, error } = await supabase
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

    async findByUser(userId: string, limit = 20, offset = 0): Promise<NotificationEntity[]> {
        const { data, error } = await supabase
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

    async countUnread(userId: string): Promise<number> {
        const { count, error } = await supabase
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

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .eq('user_id', userId)

        if (error) {
            console.warn('Erro ao marcar notificação como lida:', error.message)
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .is('read_at', null)

        if (error) {
            console.warn('Erro ao marcar todas notificações como lidas:', error.message)
        }
    }
}
