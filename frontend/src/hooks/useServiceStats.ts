import { useState, useEffect } from 'react'

interface Stats {
    count: number
    average_value: number
    professionals: { name: string; avatar_url: string | null }[]
}

export function useServiceStats(serviceId: string, isAuthenticated: boolean, apiFetch: any) {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        if (isAuthenticated) {
            apiFetch(`/api/requests/${serviceId}/stats`)
                .then((res: Response) => res.json())
                .then((data: Stats) => setStats(data))
                .catch((err: unknown) => console.error('Failed to fetch stats', err))
        }
    }, [isAuthenticated, serviceId, apiFetch])

    return stats
}
