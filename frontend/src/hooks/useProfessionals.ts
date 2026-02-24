
import { useState, useCallback } from 'react'
import { apiRequest } from '../services/api'
import type { PublicProfessionalResult } from '../types'

export function useProfessionals() {
    const [items, setItems] = useState<PublicProfessionalResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchProfessionals = useCallback(async (pageNum: number, limit: number, filters: { uf?: string, city?: string } = {}) => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.set('page', String(pageNum))
            params.set('limit', String(limit))
            if (filters.uf?.trim()) params.set('uf', filters.uf.trim().toUpperCase())
            if (filters.city?.trim()) params.set('city', filters.city.trim())

            const data = await apiRequest<any>(`/api/users/professionals?${params.toString()}`)

            let nextItems: PublicProfessionalResult[] = []
            if (Array.isArray(data.items)) nextItems = data.items
            else if (data.data && Array.isArray(data.data.items)) nextItems = data.data.items
            else if (Array.isArray(data)) nextItems = data

            setItems(prev => pageNum === 1 ? nextItems : [...prev, ...nextItems])
            setHasMore(nextItems.length === limit)
            setPage(pageNum)
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar profissionais')
        } finally {
            setLoading(false)
        }
    }, [])

    return { items, loading, error, hasMore, page, fetchProfessionals }
}
