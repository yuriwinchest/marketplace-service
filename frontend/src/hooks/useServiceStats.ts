import { useState, useEffect } from 'react'

interface Stats {
    count: number
    average_value: number
    professionals: { name: string; avatar_url: string | null }[]
}

type ApiFetch = (path: string, init?: RequestInit) => Promise<Response>

type ApiSuccess<T> = { success: true; data: T }

export function useServiceStats(serviceId: string, isAuthenticated: boolean, apiFetch: ApiFetch) {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        if (isAuthenticated) {
            apiFetch(`/api/requests/${serviceId}/stats`)
                .then((res: Response) => res.json())
                .then((json: ApiSuccess<Stats> | Stats) => {
                    const data = 'success' in json ? json.data : json
                    setStats(data)
                })
                .catch((err: unknown) => console.error('Failed to fetch stats', err))
        }
    }, [isAuthenticated, serviceId, apiFetch])

    return stats
}
