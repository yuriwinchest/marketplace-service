
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export function DashboardHeader({ getUserName }: { getUserName: () => string }) {
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    if (auth.state !== 'authenticated') return null

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-forest-800 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
                <h1 className="text-4xl font-black text-white tracking-tight">Olá, {getUserName()}! 👋</h1>
                <p className="text-gray-400 mt-2 font-medium">
                    {auth.user.role === 'client'
                        ? 'Tudo pronto para encontrar o talento ideal hoje?'
                        : 'Novas oportunidades aguardam por você.'}
                </p>
            </div>

            <div className="relative z-10">
                {auth.user.role === 'client' ? (
                    <button
                        className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        onClick={() => navigate('/criar-servico')}
                    >
                        + Criar Novo Projeto
                    </button>
                ) : (
                    <button
                        className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        onClick={() => navigate('/servicos')}
                    >
                        🔍 Buscar Contratos
                    </button>
                )}
            </div>
        </div>
    )
}
