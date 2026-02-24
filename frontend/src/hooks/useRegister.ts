
import { useState } from 'react'
import type { UserRole } from '../types'
import { apiRequest } from '../services/api'

interface UseRegisterProps {
    onSuccess?: (email: string) => void
}

export function useRegister({ onSuccess }: UseRegisterProps = {}) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [description, setDescription] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [role, setRole] = useState<UserRole>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setLoading(true)
        try {
            if (!avatarFile) {
                setError('Envie uma foto como anexo (arquivo)')
                return
            }

            const fd = new FormData()
            if (name.trim()) fd.append('name', name.trim())
            fd.append('email', email)
            fd.append('password', password)
            fd.append('description', description)
            fd.append('role', role)
            fd.append('avatar', avatarFile)

            await apiRequest('/api/auth/register', {
                method: 'POST',
                body: fd,
                // apiRequest will detect FormData and NOT set Content-Type to json
            })

            if (onSuccess) onSuccess(email)
        } catch (err: any) {
            setError(err.message || 'Erro ao cadastrar')
        } finally {
            setLoading(false)
        }
    }

    return {
        formState: { name, email, password, description, avatarFile, role },
        setters: { setName, setEmail, setPassword, setDescription, setAvatarFile, setRole },
        ui: { error, loading },
        handleRegister
    }
}
