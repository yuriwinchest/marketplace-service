import type { SupabaseClient } from '@supabase/supabase-js'

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
  async findByUser(db: SupabaseClient, userId: string, limit = 20, offset = 0): Promise<NotificationEntity[]> {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.warn('Erro ao buscar notificacoes:', error.message)
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
      console.warn('Erro ao contar notificacoes nao lidas:', error.message)
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
      console.warn('Erro ao marcar notificacao como lida:', error.message)
    }
  }

  async markAllAsRead(db: SupabaseClient, userId: string): Promise<void> {
    const { error } = await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) {
      console.warn('Erro ao marcar todas notificacoes como lidas:', error.message)
    }
  }
}

