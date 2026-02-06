
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
    const [description, setDescription] = useState(auth.user.description || '')
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
                const res = await apiFetch('/api/users/profile', { method: 'GET' })
                if (res.ok && mounted) {
                    const json = await res.json() as { success: true; data: { user: User; profile: Profile | null } }
                    if (json.data.user?.name) setName(json.data.user.name)
                    if (json.data.user?.description !== undefined && json.data.user?.description !== null) {
                        setDescription(json.data.user.description)
                    }
                    if (json.data.profile) {
                        setBio(json.data.profile.bio || '')
                        setPhone(json.data.profile.phone || '')
                        setSkills(json.data.profile.skills?.join(', ') || '')
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
            const res = await apiFetch('/api/users/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: name || undefined,
                    description: description || undefined,
                    bio: bio || undefined,
                    phone: phone || undefined,
                    skills: skillsArray.length > 0 ? skillsArray : undefined,
                }),
            })
            if (!res.ok) {
                const json = await res.json() as { success: false; error?: string }
                throw new Error(json.error || 'Erro ao salvar')
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
            const res = await fetch(`${apiBaseUrl}/api/users/profile/avatar`, {
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
        formState: { name, description, bio, phone, skills },
        setters: { setName, setDescription, setBio, setPhone, setSkills },
        ui: { loading, error, avatarUploading },
        saveProfile,
        uploadAvatar
    }
}
