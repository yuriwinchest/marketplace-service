import type { AuthState, Service, Category, Region } from '../types'
import './DashboardStats.css'

interface DashboardStatsProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    services: Service[]
    myServices: Service[]
    categories: Category[]
    regions: Region[]
}

interface StatCardProps {
    icon: string
    value: number
    label: string
    trend?: {
        value: number
        isPositive: boolean
    }
}

function StatCard({ icon, value, label, trend }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-icon-wrapper">
                <span className="stat-card-icon" aria-hidden="true">{icon}</span>
            </div>
            <div className="stat-card-content">
                <div className="stat-card-value">{value.toLocaleString('pt-BR')}</div>
                <div className="stat-card-label">{label}</div>
                {trend && (
                    <div className={`stat-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span className="stat-card-trend-icon">
                            {trend.isPositive ? '↑' : '↓'}
                        </span>
                        <span className="stat-card-trend-value">
                            {Math.abs(trend.value)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export function DashboardStats({ auth, services, myServices, categories }: DashboardStatsProps) {
    const isClient = auth.user.role === 'client'
    const relevantServices = isClient ? myServices : services
    const openServices = relevantServices.filter(s => s.status === 'open').length
    const closedServices = relevantServices.filter(s => s.status === 'closed').length

    return (
        <div className="dashboard-stats">
            <StatCard
                icon={isClient ? '📋' : '🔍'}
                value={relevantServices.length}
                label={isClient ? 'Meus Serviços' : 'Serviços Disponíveis'}
            />

            <StatCard
                icon="✅"
                value={openServices}
                label="Abertos"
            />

            <StatCard
                icon="🎯"
                value={closedServices}
                label="Fechados"
            />

            <StatCard
                icon="🏷️"
                value={categories.length}
                label="Categorias"
            />
        </div>
    )
}
