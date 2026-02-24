
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'

export function useLogin() {
    const { setAuth } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'client' | 'professional'>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError(null)
        setLoading(true)
        try {
            const data = await apiRequest<any>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, role }),
            })

            const actualData = data.data || data
            setAuth({
                state: 'authenticated',
                token: actualData.token,
                refreshToken: actualData.refreshToken ?? null,
                user: actualData.user
            })
        } catch (err: any) {
            setError(err.message || 'E-mail ou senha inválidos')
        } finally {
            setLoading(false)
        }
    }

    return {
        formState: { email, password, role },
        setters: { setEmail, setPassword, setRole },
        ui: { error, loading },
        handleLogin
    }
}
