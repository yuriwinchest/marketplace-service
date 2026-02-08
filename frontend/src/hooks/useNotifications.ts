import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationEntity } from '../types'

type ApiFetch = (path: string, init?: RequestInit) => Promise<Response>

export function useNotifications(enabled: boolean, apiFetch: ApiFetch) {
  const [items, setItems] = useState<NotificationEntity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const res = await apiFetch('/api/notifications?page=1&limit=20', { method: 'GET' })
      if (!res.ok) return
      const json = await res.json()

      const data = json.data ?? json
      const nextItems = (data.items ?? []) as NotificationEntity[]
      const nextUnread = Number(data.unreadCount ?? 0)

      setItems(nextItems)
      setUnreadCount(nextUnread)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [apiFetch, enabled])

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
        const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
        if (!res.ok) return
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
        // silent
      }
    },
    [apiFetch, enabled],
  )

  const markAllAsRead = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await apiFetch('/api/notifications/read-all', { method: 'PATCH' })
      if (!res.ok) return
      const now = new Date().toISOString()
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [apiFetch, enabled])

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

