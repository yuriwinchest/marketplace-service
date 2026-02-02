import { useState } from 'react'
import type { View, UserRole } from '../types'

interface RegisterPageProps {
    setView: (view: View) => void
    onRegisterSuccess: (email: string) => void
    apiBaseUrl: string
}

export function RegisterPage({ setView, onRegisterSuccess, apiBaseUrl }: RegisterPageProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('client')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || undefined,
                    email,
                    password,
                    role,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Erro ao cadastrar')
                return
            }
            onRegisterSuccess(email)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="authPage">
            <div className="authCard">
                <h1>Criar conta</h1>
                <p className="subtitle">Cadastre-se gratuitamente</p>
                <div className="authForm">
                    <div className="authGrid">
                        <div className="authInputs">
                            <div className="formGroup">
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
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
                                    placeholder="Minimo 6 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="authRoles">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tipo de conta</label>
                            <div className="roleSelector">
                                <button
                                    className={`roleBtn ${role === 'client' ? 'active' : ''}`}
                                    onClick={() => setRole('client')}
                                >
                                    <span className="roleIcon">🏢</span>
                                    <span className="roleTitle">Cliente</span>
                                    <span className="roleDesc">Preciso contratar servicos</span>
                                </button>
                                <button
                                    className={`roleBtn ${role === 'professional' ? 'active' : ''}`}
                                    onClick={() => setRole('professional')}
                                >
                                    <span className="roleIcon">💼</span>
                                    <span className="roleTitle">Freelancer</span>
                                    <span className="roleDesc">Quero oferecer servicos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && <div className="errorBox">{error}</div>}
                    <button
                        className="btnPrimary btnFull"
                        onClick={handleRegister}
                        disabled={loading || !email || !password}
                    >
                        {loading ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
                <div className="authFooter">
                    <span>Ja tem conta?</span>
                    <button className="btnLink" onClick={() => setView('login')}>Entrar</button>
                </div>
            </div>
        </div>
    )
}
