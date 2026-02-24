
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { API_BASE_URL } from '../config'

export function DashboardSidebar() {
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    if (auth.state !== 'authenticated') return null

    const getUserName = () => {
        return auth.user.name || auth.user.email.split('@')[0]
    }

    return (
        <div className="space-y-6">
            <div className="bg-forest-800 border border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10 transition-all group-hover:bg-emerald-500/10"></div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Seu Perfil</h3>
                    <button
                        className="text-emerald-500 hover:text-emerald-400 text-xs font-black uppercase tracking-tighter transition-colors"
                        onClick={() => navigate('/editar-perfil')}
                    >
                        Editar
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        {auth.user.avatar_url ? (
                            <img
                                src={`${API_BASE_URL}${auth.user.avatar_url}`}
                                alt="Avatar"
                                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/5 shadow-2xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-3xl font-black text-emerald-400 border-2 border-emerald-500/20 shadow-inner">
                                {getUserName().charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-forest-800 flex items-center justify-center text-[10px] text-forest-900 font-bold">✓</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xl font-black text-white">{getUserName()}</div>
                        <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">
                            {auth.user.role === 'client' ? '💼 Cliente' : '🛠️ Freelancer'}
                        </div>
                        <div className="text-sm text-gray-500 font-medium pt-2">{auth.user.email}</div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                        className="w-full py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-white/5"
                        onClick={() => navigate('/perfil')}
                    >
                        Ver Perfil Público
                    </button>
                </div>
            </div>
        </div>
    )
}
