import { useState, useEffect } from 'react'
import type { AuthState, View, User, Profile } from '../types'

interface ProfilePageProps {
    auth: AuthState
    setView: (view: View) => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    apiBaseUrl: string
    myServicesCount: number
    servicesCount: number
    // Pass loadProfile if we want "force refresh" button? Or just fetch on mount.
}

export function ProfilePage({ auth, setView, apiFetch, apiBaseUrl, myServicesCount, servicesCount }: ProfilePageProps) {
    const [profileData, setProfileData] = useState<Profile | null>(null)

    useEffect(() => {
        if (auth.state !== 'authenticated') return
        let mounted = true
        const load = async () => {
            try {
                const res = await apiFetch('/api/users/profile', { method: 'GET' })
                if (res.ok && mounted) {
                    const json = await res.json() as { success: true; data: { user: User; profile: Profile | null } }
                    setProfileData(json.data.profile)
                }
            } catch {
                // silent
            }
        }
        load()
        return () => { mounted = false }
    }, [apiFetch, auth.state])

    if (auth.state !== 'authenticated') return null

    const getUserName = () => auth.user.name || auth.user.email.split('@')[0]

    return (
        <div className="profilePage">
            <div className="profileHeader">
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
                <div className="profileInfo">
                    <h1>{getUserName()}</h1>
                    <div className="profileRole">
                        {auth.user.role === 'client' ? 'Cliente' : 'Freelancer'}
                    </div>
                    <div className="profileEmail">{auth.user.email}</div>
                </div>
                <button className="btnSecondary" onClick={() => setView('edit-profile')}>
                    Editar Perfil
                </button>
            </div>

            <div className="profileContent">
                <div className="card">
                    <h2>Informacoes</h2>
                    <div className="profileDetails">
                        <div className="detailItem">
                            <span className="detailLabel">E-mail</span>
                            <span className="detailValue">{auth.user.email}</span>
                        </div>
                        <div className="detailItem">
                            <span className="detailLabel">Tipo de conta</span>
                            <span className="detailValue">{auth.user.role === 'client' ? 'Cliente' : 'Freelancer'}</span>
                        </div>
                        <div className="detailItem">
                            <span className="detailLabel">Nome</span>
                            <span className="detailValue">{auth.user.name || 'Nao informado'}</span>
                        </div>
                    </div>
                </div>

                {auth.user.role === 'professional' && profileData && (
                    <div className="card">
                        <h2>Perfil Profissional</h2>
                        <div className="profileDetails">
                            <div className="detailItem">
                                <span className="detailLabel">Bio</span>
                                <span className="detailValue">{profileData.bio || 'Nao informado'}</span>
                            </div>
                            <div className="detailItem">
                                <span className="detailLabel">Telefone</span>
                                <span className="detailValue">{profileData.phone || 'Nao informado'}</span>
                            </div>
                            {profileData.skills && profileData.skills.length > 0 && (
                                <div className="detailItem">
                                    <span className="detailLabel">Habilidades</span>
                                    <div className="skillsTags">
                                        {profileData.skills.map((skill, i) => (
                                            <span key={i} className="skillTag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="card">
                    <h2>Estatisticas</h2>
                    <div className="profileStats">
                        <div className="profileStat">
                            <span className="statValue">{auth.user.role === 'client' ? myServicesCount : servicesCount}</span>
                            <span className="statLabel">{auth.user.role === 'client' ? 'Servicos Publicados' : 'Servicos Visualizados'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
