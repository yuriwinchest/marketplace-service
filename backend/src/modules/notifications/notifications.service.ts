
import { NotificationsRepository } from './notifications.repository.js'
import type { NotificationEntity, NotificationType } from './notifications.repository.js'

export class NotificationsService {
  constructor(private repository: NotificationsRepository) { }

  async getUserNotifications(userId: string, page = 1, limit = 20): Promise<{ items: NotificationEntity[], unreadCount: number }> {
    const offset = (page - 1) * limit
    const [items, unreadCount] = await Promise.all([
      this.repository.findByUser(userId, limit, offset),
      this.repository.countUnread(userId)
    ])

    return { items, unreadCount }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.repository.markAsRead(notificationId, userId)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId)
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
}
