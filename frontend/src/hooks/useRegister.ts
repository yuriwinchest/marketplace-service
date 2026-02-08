
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
    const [description, setDescription] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [role, setRole] = useState<UserRole>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setLoading(true)
        try {
            const url = `${apiBaseUrl}/api/auth/register`

            const useMultipart = !!avatarFile
            const res = useMultipart
                ? await fetch(url, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: (() => {
                        const fd = new FormData()
                        if (name.trim()) fd.append('name', name.trim())
                        fd.append('email', email)
                        fd.append('password', password)
                        fd.append('description', description)
                        fd.append('role', role)
                        if (avatarUrl.trim()) fd.append('avatarUrl', avatarUrl.trim())
                        if (avatarFile) fd.append('avatar', avatarFile)
                        return fd
                    })(),
                })
                : await fetch(url, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name || undefined,
                        email,
                        password,
                        description,
                        avatarUrl: avatarUrl.trim() || undefined,
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
        formState: { name, email, password, description, avatarUrl, avatarFile, role },
        setters: { setName, setEmail, setPassword, setDescription, setAvatarUrl, setAvatarFile, setRole },
        ui: { error, loading },
        handleRegister
    }
}

// Dev-only: changes to hook order during Fast Refresh can crash the page.
// Force a full reload when this module updates to keep a stable runtime.
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        import.meta.hot?.invalidate()
    })
}
