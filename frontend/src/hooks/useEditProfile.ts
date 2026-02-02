
import { useState, useEffect } from 'react'
import type { AuthState, User, Profile } from '../types'

interface UseEditProfileProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    onProfileUpdated: () => Promise<void>
    apiBaseUrl: string
}

export function useEditProfile({ auth, apiFetch, onProfileUpdated, apiBaseUrl }: UseEditProfileProps) {
    const [name, setName] = useState(auth.user.name || '')
    const [bio, setBio] = useState('')
    const [phone, setPhone] = useState('')
    const [skills, setSkills] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [avatarUploading, setAvatarUploading] = useState(false)

    // Load existing profile data
    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await apiFetch('/api/profile', { method: 'GET' })
                if (res.ok && mounted) {
                    const data = await res.json() as { user: User; profile: Profile | null }
                    if (data.user?.name) setName(data.user.name)
                    if (data.profile) {
                        setBio(data.profile.bio || '')
                        setPhone(data.profile.phone || '')
                        setSkills(data.profile.skills?.join(', ') || '')
                    }
                }
            } catch {
                // silent error on load
            }
        }
        load()
        return () => { mounted = false }
    }, [apiFetch])

    const saveProfile = async (onSuccess: () => void) => {
        setError(null)
        setLoading(true)
        try {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
            const res = await apiFetch('/api/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: name || undefined,
                    bio: bio || undefined,
                    phone: phone || undefined,
                    skills: skillsArray.length > 0 ? skillsArray : undefined,
                }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro ao salvar')
            }
            await onProfileUpdated()
            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    const uploadAvatar = async (file: File) => {
        setAvatarUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const res = await fetch(`${apiBaseUrl}/api/profile/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.token}` },
                body: formData,
            })

            if (res.ok) {
                await onProfileUpdated()
            } else {
                const text = await res.text()
                try {
                    const data = JSON.parse(text)
                    throw new Error(data.error || 'Erro ao enviar foto')
                } catch (e) {
                    throw new Error(e instanceof Error ? e.message : 'Erro ao enviar foto')
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro de conexao')
        } finally {
            setAvatarUploading(false)
        }
    }

    return {
        formState: { name, bio, phone, skills },
        setters: { setName, setBio, setPhone, setSkills },
        ui: { loading, error, avatarUploading },
        saveProfile,
        uploadAvatar
    }
}
