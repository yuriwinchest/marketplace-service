
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useEditProfile } from '../hooks/useEditProfile'
import { ProfileAvatarEditor } from '../components/ProfileAvatarEditor'
import { API_BASE_URL } from '../config'

export function EditProfilePage() {
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    const {
        formState,
        setters,
        ui,
        saveProfile,
        uploadAvatar
    } = useEditProfile()

    if (auth.state !== 'authenticated') return null

    const { name, description, bio, phone, skills } = formState
    const { setName, setDescription, setBio, setPhone, setSkills } = setters
    const { loading, error, avatarUploading } = ui

    return (
        <div className="editProfilePage max-w-3xl mx-auto px-4 py-20">
            <button
                className="mb-10 text-gray-500 hover:text-white flex items-center gap-3 text-sm font-bold transition-all group"
                onClick={() => navigate('/perfil')}
            >
                <span className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">←</span>
                Voltar ao Perfil
            </button>

            <div className="formCard bg-forest-800 border border-white/5 rounded-[48px] p-10 md:p-16 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Editar Perfil</h1>
                    <p className="text-gray-400 font-medium">Mantenha suas informações atualizadas para passar mais confiança.</p>
                </div>

                <div className="bg-forest-900/50 p-8 rounded-[32px] border border-white/5 mb-12">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Foto de Identificação</h3>
                    <ProfileAvatarEditor
                        user={auth.user}
                        apiBaseUrl={API_BASE_URL}
                        avatarUploading={avatarUploading}
                        onUpload={uploadAvatar}
                    />
                </div>

                <div className="formSection space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="formGroup space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                            <input
                                className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Como quer ser chamado"
                            />
                        </div>
                        <div className="formGroup space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 opacity-50">E-mail Corporativo</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-forest-900/30 border border-white/5 rounded-2xl px-5 py-4 text-gray-500 cursor-not-allowed font-medium"
                                    type="email"
                                    defaultValue={auth.user.email}
                                    disabled
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase tracking-tighter">Bloqueado</span>
                            </div>
                        </div>
                    </div>

                    <div className="formGroup space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Resumo Curto (Bio)</label>
                        <textarea
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none placeholder:text-gray-600"
                            placeholder="Uma frase marcante sobre você ou sua empresa..."
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {auth.user.role === 'professional' && (
                        <div className="space-y-8 pt-8 border-t border-white/5">
                            <div className="formGroup space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="formGroup space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Experiência Detalhada</label>
                                <textarea
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none placeholder:text-gray-600"
                                    placeholder="Descreva seu histórico, certificações e diferenciais..."
                                    rows={5}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                            </div>
                            <div className="formGroup space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tags de Habilidades</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                    type="text"
                                    placeholder="Ex: Designer, Programador, Pintor..."
                                    value={skills}
                                    onChange={e => setSkills(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest ml-1">Pressione vírgula para separar os itens</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20 text-sm font-medium flex items-center gap-3">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <div className="formActions pt-8 flex gap-4">
                        <button
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
                            onClick={() => navigate('/perfil')}
                        >
                            Descartar
                        </button>
                        <button
                            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            onClick={() => saveProfile(() => navigate('/perfil'))}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Confirmar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
