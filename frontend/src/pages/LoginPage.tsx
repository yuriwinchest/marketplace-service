
import type { View, User } from '../types'
import { useLogin } from '../hooks/useLogin'
import { RoleSelector } from '../components/RoleSelector'

interface LoginPageProps {
    setView: (view: View) => void
    onLoginSuccess: (data: { token: string; user: User }) => void
    apiBaseUrl: string
}

export function LoginPage({ setView, onLoginSuccess, apiBaseUrl }: LoginPageProps) {
    const { formState, setters, ui, handleLogin } = useLogin({ apiBaseUrl, onLoginSuccess })
    const { email, password, role } = formState
    const { setEmail, setPassword, setRole } = setters
    const { error, loading } = ui

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

                    <div className="formGroup">
                        <label>Entrar como:</label>
                        <RoleSelector role={role} setRole={setRole} />
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
