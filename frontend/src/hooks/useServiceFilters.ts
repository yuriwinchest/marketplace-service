
import { useState, useMemo, useEffect } from 'react'
import type { Service } from '../types'

interface Filters {
    category: string
    uf: string
    city: string
    budgetMin: string
    budgetMax: string
    urgency: string
}

interface State {
    id: number
    sigla: string
    nome: string
}

interface City {
    id: number
    nome: string
}

export function useServiceFilters(
    services: Service[],
    initialCategory?: string,
    fixedCategory?: boolean
) {
    const [filters, setFilters] = useState<Filters>({
        category: fixedCategory ? (initialCategory || '') : '',
        uf: '',
        city: '',
        budgetMin: '',
        budgetMax: '',
        urgency: '',
    })

    const [states, setStates] = useState<State[]>([])
    const [cities, setCities] = useState<City[]>([])

    // Load states
    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setStates(data))
            .catch(err => console.error('Failed to fetch states', err))
    }, [])

    // Load cities when UF changes
    useEffect(() => {
        if (!filters.uf) {
            return
        }
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filters.uf}/municipios?orderBy=nome`)
            .then(res => res.json())
            .then(data => setCities(data))
            .catch(err => console.error('Failed to fetch cities', err))
    }, [filters.uf])

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            if (filters.category && s.category_id !== filters.category) return false
            if (filters.uf && s.uf !== filters.uf) return false
            if (filters.city && s.city !== filters.city) return false
            if (filters.urgency && s.urgency !== filters.urgency) return false
            if (filters.budgetMin && (s.budget_max || 0) < Number(filters.budgetMin)) return false
            if (filters.budgetMax && (s.budget_min || 0) > Number(filters.budgetMax)) return false
            return true
        })
    }, [services, filters])

    const clearFilters = () => {
        setFilters({
            category: fixedCategory ? (initialCategory || '') : '',
            uf: '',
            city: '',
            budgetMin: '',
            budgetMax: '',
            urgency: ''
        })
    }

    const updateFilter = (key: keyof Filters, value: string) => {
        if (key === 'uf') setCities([])
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value }
            if (key === 'uf') newFilters.city = '' // Reset city when UF changes
            return newFilters
        })
    }

    return {
        filters,
        updateFilter,
        clearFilters,
        states,
        cities,
        filteredServices
    }
}
