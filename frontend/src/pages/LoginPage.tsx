import { useState } from 'react'
import type { View } from '../types'

interface LoginPageProps {
    setView: (view: View) => void
    onLoginSuccess: (data: { token: string; user: any }) => void
    apiBaseUrl: string
}

export function LoginPage({ setView, onLoginSuccess, apiBaseUrl }: LoginPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'client' | 'professional'>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }), // Send role to backend if supported
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'E-mail ou senha invalidos')
                return
            }
            onLoginSuccess(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="authPage">
            <div className="authCard">
                <h1>Entrar</h1>
                <p className="subtitle">Acesse sua conta</p>
                <div className="authForm">
                    <div className="formGroup">
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="formGroup">
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    {/* Add role selection to update profile on login if desired, or just to guide flow */}
                    <div className="formGroup">
                        <label>Entrar como:</label>
                        <div className="roleSelector">
                            <button
                                className={`roleBtn ${role === 'client' ? 'active' : ''}`}
                                onClick={() => setRole('client')}
                            >
                                <span className="roleIcon">🏢</span>
                                <span className="roleTitle">Cliente</span>
                                <span className="roleDesc">Contratar</span>
                            </button>
                            <button
                                className={`roleBtn ${role === 'professional' ? 'active' : ''}`}
                                onClick={() => setRole('professional')}
                            >
                                <span className="roleIcon">💼</span>
                                <span className="roleTitle">Freelancer</span>
                                <span className="roleDesc">Trabalhar</span>
                            </button>
                        </div>
                    </div>
                    {error && <div className="errorBox">{error}</div>}
                    <button
                        className="btnPrimary btnFull"
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>
                <div className="authFooter">
                    <span>Nao tem conta?</span>
                    <button className="btnLink" onClick={() => setView('register')}>Cadastre-se</button>
                </div>
            </div>
        </div>
    )
}
