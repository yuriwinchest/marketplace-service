
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../services/api'
import type { Category } from '../types'

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => apiRequest<{ items: Category[] }>('/api/categories'),
        select: (data) => data.items
    })
}
