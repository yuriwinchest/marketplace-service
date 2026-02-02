
import type { AuthState, Region, View } from '../types'

interface DashboardSidebarProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    regions: Region[]
    loadProfile: () => void
    setView: (view: View) => void
    apiBaseUrl: string
    getUserName: () => string
}

export function DashboardSidebar({ auth, regions, loadProfile, setView, apiBaseUrl, getUserName }: DashboardSidebarProps) {
    return (
        <div className="dashboardSidebar">
            <div className="card">
                <div className="cardHeader">
                    <h2>Seu Perfil</h2>
                    <button className="btnText" onClick={() => { loadProfile(); setView('edit-profile') }}>Editar</button>
                </div>
                <div className="profileSummary">
                    {auth.user.avatar_url ? (
                        <img
                            src={`${apiBaseUrl}${auth.user.avatar_url}`}
                            alt="Avatar"
                            className="profileAvatarImg"
                        />
                    ) : (
                        <div className="profileAvatar">
                            {getUserName().charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="profileInfo">
                        <div className="profileName">{getUserName()}</div>
                        <div className="profileRole">
                            {auth.user.role === 'client' ? 'Cliente' : 'Freelancer'}
                        </div>
                        <div className="profileEmail">{auth.user.email}</div>
                    </div>
                </div>
            </div>

            {regions.length > 0 && (
                <div className="card">
                    <div className="cardHeader">
                        <h2>Regioes Ativas</h2>
                    </div>
                    <div className="regionsList">
                        {regions.map(r => (
                            <div key={r.id} className="regionItem">{r.name}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
