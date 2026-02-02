
import { useState } from 'react'
import type { UserRole } from '../types'

interface UseRegisterProps {
    apiBaseUrl: string
    onRegisterSuccess: (email: string) => void
}

export function useRegister({ apiBaseUrl, onRegisterSuccess }: UseRegisterProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || undefined,
                    email,
                    password,
                    role,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Erro ao cadastrar')
                return
            }
            onRegisterSuccess(email)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return {
        formState: { name, email, password, role },
        setters: { setName, setEmail, setPassword, setRole },
        ui: { error, loading },
        handleRegister
    }
}
