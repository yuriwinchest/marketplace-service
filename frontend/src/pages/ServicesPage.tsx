
import { useNavigate, useLocation } from 'react-router-dom'
import { useServices } from '../hooks/useServices'
import { useCategories } from '../hooks/useCategories'
import { useServiceFilters } from '../hooks/useServiceFilters'
import { FiltersPanel } from '../components/FiltersPanel'
import { ServiceCard } from '../components/ServiceCard'

export function ServicesPage() {
    const navigate = useNavigate()
    const { services, loading, refresh } = useServices()
    const { data: categories = [] } = useCategories()
    const location = useLocation()

    const initialCategory = location.state?.categoryId
    const fixedCategory = location.state?.fixedCategory

    const {
        filters,
        updateFilter,
        clearFilters,
        states,
        cities,
        filteredServices
    } = useServiceFilters(services, initialCategory, fixedCategory)

    const activeCategoryName = categories.find(c => c.id === filters.category)?.name

    return (
        <div className="servicesPage max-w-7xl mx-auto px-4 py-10 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-forest-800 border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>

                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        {fixedCategory && activeCategoryName ? (
                            <>Serviços de <span className="text-emerald-400">{activeCategoryName}</span></>
                        ) : (
                            <>Marketplace de <span className="text-emerald-400">Demandas</span></>
                        )}
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg font-medium max-w-xl">
                        Explore centenas de projetos ativos e conecte-se com clientes em todo o Brasil.
                    </p>
                </div>

                <div className="relative z-10">
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/10 flex items-center gap-3 group shadow-xl"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <span className={`text-emerald-500 text-xl ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>
                            {loading ? '⌛' : '↺'}
                        </span>
                        {loading ? 'Sincronizando...' : 'Atualizar Lista'}
                    </button>
                </div>
            </div>

            <div className="servicesLayout grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-start">
                {/* Fixed Filters Sidebar */}
                <aside className="lg:sticky lg:top-24 space-y-6">
                    <div className="bg-forest-800 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <FiltersPanel
                            filters={filters}
                            updateFilter={updateFilter}
                            clearFilters={clearFilters}
                            categories={categories}
                            states={states}
                            cities={cities}
                            fixedCategory={fixedCategory}
                            activeCategoryName={activeCategoryName}
                        />
                    </div>

                    <div className="hidden lg:block bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-8 rounded-[32px]">
                        <div className="text-3xl mb-4">🚀</div>
                        <h4 className="text-white font-black text-lg leading-tight mb-2">Seja um Profissional Verificado</h4>
                        <p className="text-emerald-400/70 text-sm font-medium leading-relaxed mb-6">
                            Aumente suas chances em até 3x ao obter o selo de confiança da nossa plataforma.
                        </p>
                        <button className="text-emerald-400 font-black text-xs uppercase tracking-widest hover:underline">Saiba Mais →</button>
                    </div>
                </aside>

                {/* Results Main Section */}
                <div className="servicesResults space-y-8">
                    <div className="resultsHeader flex items-center justify-between bg-forest-800/50 p-5 rounded-[24px] border border-white/5 backdrop-blur-md">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {filteredServices.length} {filteredServices.length === 1 ? 'projeto encontrado' : 'projetos disponíveis agora'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-forest-800/20 border border-white/5 rounded-[32px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-32 bg-forest-800 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                            <div className="text-7xl mb-8 transform group-hover:scale-110 transition-transform">🔍</div>
                            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Ops! Filtros muito rigorosos?</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
                                Não encontramos projetos com essa combinação. Tente expandir sua busca para ver mais oportunidades.
                            </p>
                            <button
                                className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                onClick={clearFilters}
                            >
                                Resetar Todos os Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="servicesList grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                            {filteredServices.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => navigate(`/servico/${service.id}`)}
                                    className="cursor-pointer group transform hover:-translate-y-2 transition-all duration-300"
                                >
                                    <ServiceCard
                                        service={service}
                                        onClick={() => navigate(`/servico/${service.id}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
