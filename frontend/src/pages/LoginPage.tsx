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
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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
