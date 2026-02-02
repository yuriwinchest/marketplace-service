
import type { View } from '../types'
import { RoleSelector } from '../components/RoleSelector'
import { useRegister } from '../hooks/useRegister'

interface RegisterPageProps {
    setView: (view: View) => void
    onRegisterSuccess: (email: string) => void
    apiBaseUrl: string
}

export function RegisterPage({ setView, onRegisterSuccess, apiBaseUrl }: RegisterPageProps) {
    const { formState, setters, ui, handleRegister } = useRegister({ apiBaseUrl, onRegisterSuccess })
    const { name, email, password, role } = formState
    const { setName, setEmail, setPassword, setRole } = setters
    const { error, loading } = ui

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
                            <RoleSelector role={role} setRole={setRole} />
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
