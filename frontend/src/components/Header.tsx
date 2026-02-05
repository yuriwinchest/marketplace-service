

import type { View, AuthState } from '../types'

interface HeaderProps {
    view: View
    setView: (view: View) => void
    auth: AuthState
    onLogout: () => void
}

export function Header({ view, setView, auth, onLogout }: HeaderProps) {
    return (
        <header className="header">
            <div className="headerInner">
                <div className="logo" onClick={() => setView(auth.state === 'authenticated' ? 'dashboard' : 'home')}>
                    <img className="logoImg" src="/logo.png" alt="FazServiço" />
                </div>

                {auth.state === 'authenticated' && (
                    <nav className="mainNav">
                        <button
                            className={`navItem ${view === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setView('dashboard')}
                        >
                            Dashboard
                        </button>
                        {auth.user.role === 'professional' && (
                            <button
                                className={`navItem ${view === 'services' ? 'active' : ''}`}
                                onClick={() => setView('services')}
                            >
                                Buscar Servicos
                            </button>
                        )}
                        {auth.user.role === 'client' && (
                            <button
                                className={`navItem ${view === 'my-services' ? 'active' : ''}`}
                                onClick={() => setView('my-services')}
                            >
                                Meus Servicos
                            </button>
                        )}
                        <button
                            className={`navItem ${view === 'proposals' ? 'active' : ''}`}
                            onClick={() => setView('proposals')}
                        >
                            Propostas
                        </button>
                    </nav>
                )}

                <div className="headerActions">
                    {auth.state === 'anonymous' ? (
                        <>
                            <button className="btnGhost" onClick={() => setView('login')}>Entrar</button>
                            <button className="btnPrimary" onClick={() => setView('register')}>Cadastrar</button>
                        </>
                    ) : (
                        <>
                            <button
                                className="iconBtn"
                                onClick={() => setView('profile')}
                            >
                                👤
                            </button>
                            <button className="btnGhost" onClick={onLogout}>Sair</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
