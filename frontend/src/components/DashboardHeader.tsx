
import type { AuthState, View } from '../types'

interface DashboardHeaderProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    setView: (view: View) => void
    getUserName: () => string
}

export function DashboardHeader({ auth, setView, getUserName }: DashboardHeaderProps) {
    return (
        <div className="dashboardHeader">
            <div>
                <h1>Ola, {getUserName()}!</h1>
                <p className="subtitle">
                    {auth.user.role === 'client'
                        ? 'Gerencie seus projetos e encontre profissionais'
                        : 'Encontre oportunidades e envie propostas'}
                </p>
            </div>
            {auth.user.role === 'client' ? (
                <button className="btnPrimary" onClick={() => setView('create-service')}>
                    + Publicar Servico
                </button>
            ) : (
                <button className="btnPrimary" onClick={() => setView('services')}>
                    Buscar Servicos
                </button>
            )}
        </div>
    )
}
