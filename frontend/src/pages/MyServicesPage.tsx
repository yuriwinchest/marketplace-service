
import { useNavigate } from 'react-router-dom'
import { useMyServices } from '../hooks/useMyServices'
import { MyServiceListItem } from '../components/MyServiceListItem'

export function MyServicesPage() {
    const { myServices, loading, error, refresh } = useMyServices()
    const navigate = useNavigate()

    return (
        <div className="myServicesPage max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Suas Demandas</h1>
                    <p className="text-gray-400 mt-2 font-medium">Gerencie os serviços que você publicou no Marketplace.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/5"
                        onClick={refresh}
                    >
                        🔄 Atualizar
                    </button>
                    <button
                        className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20"
                        onClick={() => navigate('/criar-servico')}
                    >
                        + Publicar Novo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 text-red-400 p-8 rounded-3xl border border-red-500/20 text-center">
                    <p className="font-bold underline mb-2">Ops! Ocorreu um erro</p>
                    <p className="opacity-70">{error}</p>
                </div>
            ) : myServices.length === 0 ? (
                <div className="text-center py-24 bg-forest-800 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="text-6xl mb-6">📝</div>
                        <h3 className="text-2xl font-black text-white mb-3">Tudo pronto para começar?</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
                            Você ainda não publicou nenhum serviço. Milhares de profissionais estão prontos para te ajudar!
                        </p>
                        <button
                            className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/30 scale-105 hover:scale-110 active:scale-95"
                            onClick={() => navigate('/criar-servico')}
                        >
                            Publicar Minha Primeira Demanda
                        </button>
                    </div>
                </div>
            ) : (
                <div className="myServicesList grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myServices.map(service => (
                        <div
                            key={service.id}
                            onClick={() => navigate(`/servico/${service.id}`)}
                            className="cursor-pointer group"
                        >
                            <MyServiceListItem
                                service={service}
                                onClick={() => navigate(`/servico/${service.id}`)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
