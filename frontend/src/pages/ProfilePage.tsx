
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'
import { API_BASE_URL } from '../config'
import type { Profile } from '../types'

export function ProfilePage() {
    const { auth } = useAuthStore()
    const navigate = useNavigate()
    const [profileData, setProfileData] = useState<Profile | null>(null)

    useEffect(() => {
        if (auth.state !== 'authenticated') return
        let mounted = true
        const load = async () => {
            try {
                const data = await apiRequest<any>('/api/users/profile')
                if (mounted) {
                    setProfileData(data.profile || data.data?.profile)
                }
            } catch {
                // silent
            }
        }
        load()
        return () => { mounted = false }
    }, [auth.state])

    if (auth.state !== 'authenticated') return null

    const getUserName = () => auth.user.name || auth.user.email.split('@')[0]

    return (
        <div className="profilePage max-w-5xl mx-auto px-4 py-16 space-y-12">
            {/* Hero Section */}
            <div className="profileHero bg-forest-800 border border-white/5 p-10 md:p-16 rounded-[50px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative group">
                        {auth.user.avatar_url ? (
                            <img
                                src={`${API_BASE_URL}${auth.user.avatar_url}`}
                                alt="Avatar"
                                className="w-40 h-40 rounded-[48px] border-8 border-white/5 object-cover shadow-2xl transform transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-40 h-40 rounded-[48px] bg-emerald-500/20 flex items-center justify-center text-6xl text-emerald-400 font-black border-8 border-white/5 shadow-2xl">
                                {getUserName().charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-forest-900 p-3 rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest border-4 border-forest-800">
                            Online
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{getUserName()}</h1>
                            <p className="text-emerald-400 text-lg font-bold tracking-wide">
                                {auth.user.role === 'client' ? '💼 Gestor de Projetos' : '🚀 Especialista Freelancer'}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-white/5 px-4 py-2 rounded-xl text-gray-400 text-sm font-medium border border-white/5">
                                📧 {auth.user.email}
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl text-gray-400 text-sm font-medium border border-white/5">
                                📅 Membro desde 2024
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-10 py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
                            onClick={() => navigate('/perfil/editar')}
                        >
                            Editar Perfil
                        </button>
                        <button
                            className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-[24px] font-bold text-lg transition-all border border-white/5 active:scale-95"
                            onClick={() => { }}
                        >
                            Ver Público
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* About Section */}
                    <div className="bg-forest-800 border border-white/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>

                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                            <span className="p-3 bg-emerald-500/10 rounded-2xl text-xl">👤</span>
                            Biografia Profissional
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <p className="text-gray-400 text-lg leading-relaxed font-medium italic">
                                    {profileData?.bio || 'Nenhuma biografia detalhada cadastrada. Adicione informações sobre sua carreira e conquistas para atrair mais parceiros.'}
                                </p>
                            </div>

                            {auth.user.role === 'professional' && profileData?.skills && profileData.skills.length > 0 && (
                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Expertise & Habilidades</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {profileData.skills.map((skill, i) => (
                                            <span key={i} className="bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-2xl text-sm font-black border border-emerald-500/10 transform hover:scale-105 transition-transform cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-forest-800 border border-white/5 rounded-[32px] p-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Contato Direto</h3>
                            <div className="text-xl font-black text-white">{profileData?.phone || 'Não informado'}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium italic">Disponível para orçamentos</div>
                        </div>
                        <div className="bg-forest-800 border border-white/5 rounded-[32px] p-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Localização</h3>
                            <div className="text-xl font-black text-white">Brasil</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium italic">Atendimento Global</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Performance Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[40px] p-10 shadow-2xl shadow-emerald-500/20 text-forest-900 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10 text-center space-y-8">
                            <div>
                                <div className="text-7xl font-black leading-none tracking-tighter mb-2">0</div>
                                <div className="text-sm font-black uppercase tracking-widest opacity-70">
                                    {auth.user.role === 'client' ? 'Projetos Criados' : 'Trabalhos Entregues'}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-forest-900/10 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-black">5.0</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-60">Avaliação</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black">100%</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-60">Sucesso</div>
                                </div>
                            </div>

                            <button className="w-full bg-forest-900 text-white py-5 rounded-[24px] font-black transition-all hover:bg-forest-800 active:scale-95 shadow-xl">
                                Histórico Completo
                            </button>
                        </div>
                    </div>

                    <div className="bg-forest-800 border border-white/5 rounded-[32px] p-8 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Atividade Recente</h3>
                        <div className="text-center py-10">
                            <div className="text-4xl mb-4 opacity-30">📉</div>
                            <p className="text-gray-500 text-sm font-medium">Nenhuma atividade registrada nos últimos 30 dias.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
