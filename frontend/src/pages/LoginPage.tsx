import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { RoleSelector } from '../components/RoleSelector'

export function LoginPage() {
    const navigate = useNavigate()
    const { formState, setters, ui, handleLogin } = useLogin()
    const { email, password, role } = formState
    const { setEmail, setPassword, setRole } = setters
    const { error, loading } = ui
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="authPage min-h-screen flex items-center justify-center px-4 py-20 bg-forest-900 relative">
            {/* Background Accents */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

            <div className="authCard w-full max-w-md bg-forest-800 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl relative z-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white mb-3">Bem-vindo</h1>
                    <p className="text-gray-400 font-medium">Acesse sua conta para continuar</p>
                </div>

                <div className="authForm space-y-6">
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
                        <div className="passwordInputWrapper relative">
                            <input
                                className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Sua senha secreta"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-500 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.046m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="formGroup space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Entrar como:</label>
                        <RoleSelector role={role} setRole={setRole} />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl border border-red-500/20 text-sm font-medium text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                    >
                        {loading ? 'Validando Acesso...' : 'Entrar na Plataforma'}
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        Ainda não tem uma conta?{' '}
                        <button
                            className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors ml-1"
                            onClick={() => navigate('/cadastrar')}
                        >
                            Cadastre-se grátis
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
