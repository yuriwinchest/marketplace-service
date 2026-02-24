import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoleSelector } from '../components/RoleSelector'
import { useRegister } from '../hooks/useRegister'

export function RegisterPage() {
    const navigate = useNavigate()
    const { formState, setters, ui, handleRegister } = useRegister({
        onSuccess: () => navigate('/login')
    })
    const { name, email, password, description, avatarFile, role } = formState
    const { setName, setEmail, setPassword, setDescription, setAvatarFile, setRole } = setters
    const { error, loading } = ui
    const [showPassword, setShowPassword] = useState(false)

    const canSubmit =
        !!email &&
        !!password &&
        description.trim().length >= 10 &&
        !!avatarFile

    const filePreviewUrl = useMemo(() => {
        if (!avatarFile) return ''
        return URL.createObjectURL(avatarFile)
    }, [avatarFile])

    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
        }
    }, [filePreviewUrl])

    return (
        <div className="authPage min-h-screen flex items-center justify-center px-4 py-20 bg-forest-900 relative">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>

            <div className="authCard w-full max-w-2xl bg-forest-800 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl relative z-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Criar Conta</h1>
                    <p className="text-gray-400 font-medium">Junte-se à maior rede de freelancers do Brasil</p>
                </div>

                <div className="authForm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                    type="text"
                                    placeholder="Ex: João Silva"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Descrição Profissional</label>
                                <textarea
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600 resize-none"
                                    placeholder="Conte brevemente sobre sua experiência..."
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Min: 10 caracteres</p>
                            </div>

                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Foto de Perfil</label>
                                <div className="flex items-center gap-4 p-4 bg-forest-900 border border-dashed border-white/10 rounded-2xl hover:border-emerald-500/50 transition-colors cursor-pointer relative group">
                                    <input
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                    />
                                    {filePreviewUrl ? (
                                        <img src={filePreviewUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">📸</div>
                                    )}
                                    <span className="text-sm text-gray-500 font-medium group-hover:text-emerald-500 transition-colors">
                                        {avatarFile ? avatarFile.name : 'Clique para enviar'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Senha</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="No mínimo 6 caracteres"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-500 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="formGroup space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Eu sou um:</label>
                                <RoleSelector role={role} setRole={setRole} />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl border border-red-500/20 text-sm font-medium text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale transform active:scale-95"
                        onClick={handleRegister}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? 'Criando sua Conta...' : 'Finalizar Cadastro'}
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        Já possui uma conta?{' '}
                        <button
                            className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors ml-1"
                            onClick={() => navigate('/login')}
                        >
                            Fazer Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
