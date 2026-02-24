
import { useAuthStore } from '../store/useAuthStore'
import type { Service, Category, Region } from '../types'

interface DashboardStatsProps {
    services: Service[]
    myServices: Service[]
    categories: Category[]
    regions: Region[]
}

export function DashboardStats({ services, myServices, categories }: DashboardStatsProps) {
    const { auth } = useAuthStore()
    if (auth.state !== 'authenticated') return null

    const isClient = auth.user.role === 'client'
    const relevantServices = isClient ? myServices : services
    const openServicesCount = relevantServices.filter(s => s.status === 'open').length
    const closedServicesCount = relevantServices.filter(s => s.status === 'closed').length

    return (
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard
                icon={isClient ? '📋' : '🔍'}
                value={relevantServices.length}
                label={isClient ? 'Meus Serviços' : 'Disponíveis'}
                color="emerald"
            />
            <StatCard
                icon="✅"
                value={openServicesCount}
                label="Abertos"
                color="blue"
            />
            <StatCard
                icon="🎯"
                value={closedServicesCount}
                label="Concluídos"
                color="purple"
            />
            <StatCard
                icon="🏷️"
                value={categories.length}
                label="Categorias"
                color="amber"
            />
        </div>
    )
}

function StatCard({ icon, value, label, color }: { icon: string, value: number, label: string, color: string }) {
    const colorMap: Record<string, string> = {
        emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/10 text-emerald-500',
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/10 text-blue-500',
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/10 text-purple-500',
        amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/10 text-amber-500',
    }

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-3xl p-6 shadow-xl`}>
            <div className="text-3xl mb-3">{icon}</div>
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</div>
        </div>
    )
}
