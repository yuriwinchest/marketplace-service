
import type { AuthState, Service, Category, Region } from '../types'

interface DashboardStatsProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    services: Service[]
    myServices: Service[]
    categories: Category[]
    regions: Region[]
}

export function DashboardStats({ auth, services, myServices, categories, regions }: DashboardStatsProps) {
    return (
        <div className="statsRow">
            <div className="statBox">
                <div className="statIcon">📋</div>
                <div className="statInfo">
                    <div className="statValue">{auth.user.role === 'client' ? myServices.length : services.length}</div>
                    <div className="statName">{auth.user.role === 'client' ? 'Meus Servicos' : 'Servicos Disponiveis'}</div>
                </div>
            </div>
            <div className="statBox">
                <div className="statIcon">✅</div>
                <div className="statInfo">
                    <div className="statValue">
                        {auth.user.role === 'client'
                            ? myServices.filter(s => s.status === 'open').length
                            : services.filter(s => s.status === 'open').length}
                    </div>
                    <div className="statName">Abertos</div>
                </div>
            </div>
            <div className="statBox">
                <div className="statIcon">🏷️</div>
                <div className="statInfo">
                    <div className="statValue">{categories.length}</div>
                    <div className="statName">Categorias</div>
                </div>
            </div>
            <div className="statBox">
                <div className="statIcon">📍</div>
                <div className="statInfo">
                    <div className="statValue">{regions.length}</div>
                    <div className="statName">Regioes</div>
                </div>
            </div>
        </div>
    )
}
