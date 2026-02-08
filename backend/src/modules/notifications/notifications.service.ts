
import { NotificationsRepository } from './notifications.repository.js'
import type { NotificationEntity, NotificationType } from './notifications.repository.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export class NotificationsService {
  constructor(private repository: NotificationsRepository) { }

  async getUserNotifications(db: SupabaseClient, userId: string, page = 1, limit = 20): Promise<{ items: NotificationEntity[], unreadCount: number }> {
    const offset = (page - 1) * limit
    const [items, unreadCount] = await Promise.all([
      this.repository.findByUser(db, userId, limit, offset),
      this.repository.countUnread(db, userId)
    ])

    return { items, unreadCount }
  }

  async markAsRead(db: SupabaseClient, notificationId: string, userId: string): Promise<void> {
    await this.repository.markAsRead(db, notificationId, userId)
  }

  async markAllAsRead(db: SupabaseClient, userId: string): Promise<void> {
    await this.repository.markAllAsRead(db, userId)
  }

  // Internal method to be used by other services
  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.repository.create(userId, title, message, type, metadata)
  }

  async notifyMany(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean)
    await this.repository.createMany(
      uniqueUserIds.map((userId) => ({
        userId,
        title,
        message,
        type,
        metadata,
      })),
    )
  }
}
