
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'

export function useEditProfile() {
    const { auth, updateUser } = useAuthStore()

    // Safety check - callers should handle auth.state !== 'authenticated'
    const initialUser = auth.state === 'authenticated' ? auth.user : null

    const [name, setName] = useState(initialUser?.name || '')
    const [description, setDescription] = useState(initialUser?.description || '')
    const [bio, setBio] = useState('')
    const [phone, setPhone] = useState('')
    const [skills, setSkills] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [avatarUploading, setAvatarUploading] = useState(false)

    // Load existing profile data
    useEffect(() => {
        if (auth.state !== 'authenticated') return

        let mounted = true
        const load = async () => {
            try {
                const data = await apiRequest<any>('/api/users/profile')
                if (mounted) {
                    const user = data.user || data.data?.user
                    const profile = data.profile || data.data?.profile
                    if (user?.name) setName(user.name)
                    if (user?.description !== undefined && user?.description !== null) {
                        setDescription(user.description)
                    }
                    if (profile) {
                        setBio(profile.bio || '')
                        setPhone(profile.phone || '')
                        setSkills(profile.skills?.join(', ') || '')
                    }
                }
            } catch {
                // silent error on load
            }
        }
        load()
        return () => { mounted = false }
    }, [auth.state])

    const saveProfile = async (onSuccess: () => void) => {
        setError(null)
        setLoading(true)
        try {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
            const data = await apiRequest<any>('/api/users/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: name || undefined,
                    description: description || undefined,
                    bio: bio || undefined,
                    phone: phone || undefined,
                    skills: skillsArray.length > 0 ? skillsArray : undefined,
                }),
            })

            const nextUser = data.user || data.data?.user
            if (nextUser) {
                updateUser(nextUser)
            }

            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido')
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

            const data = await apiRequest<any>('/api/users/profile/avatar', {
                method: 'POST',
                body: formData,
            })

            const nextUser = data.user || data.data?.user
            if (nextUser) {
                updateUser(nextUser)
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar foto')
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
