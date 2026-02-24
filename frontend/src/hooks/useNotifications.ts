import { apiRequest } from '../services/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationEntity } from '../types'

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<NotificationEntity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const data = await apiRequest<any>('/api/notifications?page=1&limit=20')
      const nextItems = (data.items ?? []) as NotificationEntity[]
      const nextUnread = Number(data.unreadCount ?? 0)

      setItems(nextItems)
      setUnreadCount(nextUnread)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    void refresh()
    const t = window.setInterval(() => void refresh(), 30_000)
    return () => window.clearInterval(t)
  }, [enabled, refresh])

  const markAsRead = useCallback(
    async (id: string) => {
      if (!enabled) return
      try {
        await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' })
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
        // silent
      }
    },
    [enabled],
  )

  const markAllAsRead = useCallback(async () => {
    if (!enabled) return
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PATCH' })
      const now = new Date().toISOString()
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [enabled])

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount])

  return {
    items,
    unreadCount,
    hasUnread,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  }
}

