
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'

export interface CreateServiceFormState {
    title: string
    description: string
    categoryId: string
    budgetMin: string
    budgetMax: string
    urgency: 'low' | 'medium' | 'high'
    location: {
        scope: 'national' | 'state' | 'city'
        uf: string
        city: string
    }
}

interface UseCreateServiceProps {
    onSuccess?: () => void
}

export function useCreateService({ onSuccess }: UseCreateServiceProps = {}) {
    const { auth } = useAuthStore()

    // Form State
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
    const [location, setLocation] = useState<{ scope: 'national' | 'state' | 'city', uf: string, city: string }>({
        scope: 'city',
        uf: '',
        city: ''
    })

    // UI State
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Handlers
    const resetForm = () => {
        setTitle('')
        setDescription('')
        setCategoryId('')
        setLocation({ scope: 'city', uf: '', city: '' })
        setBudgetMin('')
        setBudgetMax('')
        setUrgency('medium')
        setError(null)
    }

    const submitService = async () => {
        if (auth.state !== 'authenticated') return
        setError(null)
        setLoading(true)

        try {
            await apiRequest('/api/requests', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                    categoryId: categoryId || undefined,
                    urgency,
                    budgetMin: budgetMin ? Number(budgetMin) : undefined,
                    budgetMax: budgetMax ? Number(budgetMax) : undefined,
                    locationScope: location.scope,
                    uf: location.uf || undefined,
                    city: location.city || undefined,
                }),
            })

            resetForm()
            if (onSuccess) onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return {
        formState: {
            title, description, categoryId, budgetMin, budgetMax, urgency, location
        },
        setters: {
            setTitle, setDescription, setCategoryId, setBudgetMin, setBudgetMax, setUrgency, setLocation
        },
        ui: {
            error, loading
        },
        submitService
    }
}
