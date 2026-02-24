
import { useState, useEffect, useCallback } from 'react'
import { apiRequest } from '../services/api'
import type { Service } from '../types'

export function useMyServices() {
    const [myServices, setMyServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMyServices = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiRequest<any>('/api/requests/me')
            const items = data.items || data.data?.items || []
            setMyServices(items)
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar seus serviços')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMyServices()
    }, [fetchMyServices])

    return { myServices, loading, error, refresh: fetchMyServices }
}
