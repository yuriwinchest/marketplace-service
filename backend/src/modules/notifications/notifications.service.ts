import { NotificationsRepository } from './notifications.repository.js'
import type { NotificationEntity } from './notifications.repository.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class NotificationsService {
  constructor(private repository: NotificationsRepository) {}

  async getUserNotifications(
    db: SupabaseClient,
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: NotificationEntity[]; unreadCount: number }> {
    const offset = (page - 1) * limit
    const [items, unreadCount] = await Promise.all([
      this.repository.findByUser(db, userId, limit, offset),
      this.repository.countUnread(db, userId),
    ])

    return { items, unreadCount }
  }

  async markAsRead(db: SupabaseClient, notificationId: string, userId: string): Promise<void> {
    await this.repository.markAsRead(db, notificationId, userId)
  }

  async markAllAsRead(db: SupabaseClient, userId: string): Promise<void> {
    await this.repository.markAllAsRead(db, userId)
  }
}

