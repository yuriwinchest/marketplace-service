
import { useState } from 'react'
import type { User } from '../types'

interface UseLoginProps {
    apiBaseUrl: string
    onLoginSuccess: (data: { token: string; refreshToken: string; user: User } | { data: { token: string; refreshToken: string; user: User } }) => void
}

export function useLogin({ apiBaseUrl, onLoginSuccess }: UseLoginProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'client' | 'professional'>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'E-mail ou senha inválidos')
                return
            }
            onLoginSuccess(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
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
