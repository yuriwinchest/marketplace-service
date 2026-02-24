
import { useState, useEffect, useCallback } from 'react'
import { apiRequest } from '../services/api'
import type { Service } from '../types'

export function useServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchServices = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiRequest<any>('/api/requests/open?page=1&limit=60')
            // Handle different API response formats
            const items = data.items || data.data?.items || (Array.isArray(data) ? data : [])
            setServices(items)
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar serviços')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    return { services, loading, error, refresh: fetchServices }
}
