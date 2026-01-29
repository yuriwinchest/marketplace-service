import { useState, useEffect } from 'react'
import type { AuthState, View, Profile, User } from '../types'

interface EditProfilePageProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    setView: (view: View) => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    onProfileUpdated: () => Promise<void>
    apiBaseUrl: string
}

export function EditProfilePage({ auth, setView, apiFetch, onProfileUpdated, apiBaseUrl }: EditProfilePageProps) {


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
                    // Update local form state
                    setName(data.user.name || '')
                    if (data.profile) {
                        setBio(data.profile.bio || '')
                        setPhone(data.profile.phone || '')
                        setSkills(data.profile.skills?.join(', ') || '')
                    }
                }
            } catch {
                // silent
            }
        }
        load()
        return () => { mounted = false }
    }, [apiFetch])

    const onSave = async () => {
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
                setError(data.error || 'Erro ao salvar')
                return
            }
            await onProfileUpdated() // Refresh global user data
            setView('profile')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    const onUploadAvatar = async (file: File) => {
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
                    setError(data.error || 'Erro ao enviar foto')
                } catch {
                    setError('Erro ao enviar foto')
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro de conexao')
        } finally {
            setAvatarUploading(false)
        }
    }

    const getUserName = () => auth.user.name || auth.user.email.split('@')[0]

    return (
        <div className="editProfilePage">
            <button className="backBtn" onClick={() => setView('profile')}>← Voltar</button>
            <div className="formCard">
                <h1>Editar Perfil</h1>

                <div className="profileAvatarEdit">
                    {auth.user.avatar_url ? (
                        <img
                            src={`${apiBaseUrl}${auth.user.avatar_url}`}
                            alt="Avatar"
                            className="profileAvatarImg lg"
                        />
                    ) : (
                        <div className="profileAvatar lg">
                            {getUserName().charAt(0).toUpperCase()}
                        </div>
                    )}
                    <label className="btnSecondary btnSm avatarUploadBtn">
                        {avatarUploading ? 'Enviando...' : 'Alterar foto'}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) onUploadAvatar(file)
                            }}
                            disabled={avatarUploading}
                        />
                    </label>
                    {error && <div className="errorBox">{error}</div>}
                </div>

                <div className="formSection">
                    <div className="formGroup">
                        <label>Nome completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="formGroup">
                        <label>E-mail</label>
                        <input type="email" defaultValue={auth.user.email} disabled />
                    </div>
                    {auth.user.role === 'professional' && (
                        <>
                            <div className="formGroup">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Bio / Descricao</label>
                                <textarea
                                    placeholder="Conte um pouco sobre voce e sua experiencia..."
                                    rows={4}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Habilidades (separadas por virgula)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pintura, Encanamento, Excel, Design..."
                                    value={skills}
                                    onChange={e => setSkills(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="formActions">
                        <button
                            className="btnPrimary"
                            onClick={onSave}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Alteracoes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
