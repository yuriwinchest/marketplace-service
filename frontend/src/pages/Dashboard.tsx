
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useServices } from '../hooks/useServices'
import { useMyServices } from '../hooks/useMyServices'
import { useCategories } from '../hooks/useCategories'
import { DashboardHeader } from '../components/DashboardHeader'
import { DashboardStats } from '../components/DashboardStats'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { ServiceListItem } from '../components/ServiceListItem'

export function Dashboard() {
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    const { services: openServices, refresh: refetchOpen } = useServices()
    const { myServices, refresh: refetchMine } = useMyServices()
    const { data: categories = [] } = useCategories()
    const regions: any[] = [] // Still need to migrate regions

    if (auth.state !== 'authenticated') return null

    const getUserName = () => {
        return auth.user.name || auth.user.email.split('@')[0]
    }

    const currentServices = auth.user.role === 'client' ? myServices : openServices

    const handleOpenDetail = (id: string) => {
        navigate(`/servico/${id}`)
    }

    return (
        <div className="dashboard max-w-7xl mx-auto px-4 py-10 space-y-12">
            <DashboardHeader
                getUserName={getUserName}
            />

            <div className="dashboardGrid grid grid-cols-1 lg:grid-cols-4 gap-10">
                <aside className="lg:col-span-1 space-y-8">
                    <DashboardStats
                        services={openServices}
                        myServices={myServices}
                        categories={categories}
                        regions={regions}
                    />

                    <DashboardSidebar />
                </aside>

                <div className="dashboardContent lg:col-span-3 space-y-8">
                    <div className="bg-forest-800 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>

                        <div className="p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        {auth.user.role === 'client' ? 'Meus Serviços' : 'Oportunidades'}
                                    </h2>
                                    <p className="text-gray-400 mt-2 font-medium">
                                        {auth.user.role === 'client'
                                            ? 'Gerencie seus projetos publicados'
                                            : 'Explore novos trabalhos na sua área'}
                                    </p>
                                </div>
                                <button
                                    className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/5 flex items-center gap-2"
                                    onClick={() => auth.user.role === 'client' ? refetchMine() : refetchOpen()}
                                >
                                    <span className="text-emerald-500">↺</span> Atualizar
                                </button>
                            </div>

                            {currentServices.length === 0 ? (
                                <div className="text-center py-24 bg-forest-900/50 rounded-[32px] border border-dashed border-white/5">
                                    <div className="text-6xl mb-6 opacity-30">📭</div>
                                    <h3 className="text-2xl font-black text-white mb-3">Tudo limpo por aqui</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto mb-10 font-medium">
                                        {auth.user.role === 'client'
                                            ? 'Você ainda não possui projetos ativos no momento.'
                                            : 'Nenhum serviço disponível para concorrência agora.'}
                                    </p>
                                    {auth.user.role === 'client' && (
                                        <button
                                            className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20"
                                            onClick={() => navigate('/criar-servico')}
                                        >
                                            Publicar novo Projeto
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {currentServices.slice(0, 15).map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleOpenDetail(service.id)}
                                            className="cursor-pointer group"
                                        >
                                            <ServiceListItem
                                                service={service}
                                                onClick={() => handleOpenDetail(service.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentServices.length > 15 && (
                                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                                    <button
                                        className="text-emerald-500 font-black uppercase tracking-widest text-xs hover:text-emerald-400 transition-colors"
                                        onClick={() => navigate(auth.user.role === 'client' ? '/meus-servicos' : '/servicos')}
                                    >
                                        Ver todos os resultados →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
