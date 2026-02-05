import type { View, AuthState } from '../types'
import './Header.css'

interface HeaderProps {
    view: View
    setView: (view: View) => void
    auth: AuthState
    onLogout: () => void
}

export function Header({ view, setView, auth, onLogout }: HeaderProps) {
    const handleLogoClick = () => {
        setView(auth.state === 'authenticated' ? 'dashboard' : 'home')
    }

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div
                    className="header-logo"
                    onClick={handleLogoClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleLogoClick()
                        }
                    }}
                    aria-label="Ir para página inicial"
                >
                    <img
                        className="header-logo-img"
                        src="/logo.png"
                        alt="FazServiço - Marketplace de Serviços"
                    />
                </div>

                {/* Navigation */}
                {auth.state === 'authenticated' && (
                    <nav className="header-nav" aria-label="Navegação principal">
                        <button
                            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setView('dashboard')}
                            aria-current={view === 'dashboard' ? 'page' : undefined}
                        >
                            <span className="nav-item-icon">📊</span>
                            <span>Dashboard</span>
                        </button>

                        {auth.user.role === 'professional' && (
                            <button
                                className={`nav-item ${view === 'services' ? 'active' : ''}`}
                                onClick={() => setView('services')}
                                aria-current={view === 'services' ? 'page' : undefined}
                            >
                                <span className="nav-item-icon">🔍</span>
                                <span>Buscar Serviços</span>
                            </button>
                        )}

                        {auth.user.role === 'client' && (
                            <button
                                className={`nav-item ${view === 'my-services' ? 'active' : ''}`}
                                onClick={() => setView('my-services')}
                                aria-current={view === 'my-services' ? 'page' : undefined}
                            >
                                <span className="nav-item-icon">📋</span>
                                <span>Meus Serviços</span>
                            </button>
                        )}

                        <button
                            className={`nav-item ${view === 'proposals' ? 'active' : ''}`}
                            onClick={() => setView('proposals')}
                            aria-current={view === 'proposals' ? 'page' : undefined}
                        >
                            <span className="nav-item-icon">💼</span>
                            <span>Propostas</span>
                        </button>
                    </nav>
                )}

                {/* Actions */}
                <div className="header-actions">
                    {auth.state === 'anonymous' ? (
                        <>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setView('login')}
                            >
                                Entrar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setView('register')}
                            >
                                Cadastrar
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="header-profile-btn"
                                onClick={() => setView('profile')}
                                aria-label="Ver perfil"
                                title="Meu Perfil"
                            >
                                <span className="header-profile-icon">👤</span>
                                <span className="header-profile-name">
                                    {auth.user.name?.split(' ')[0] || 'Perfil'}
                                </span>
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={onLogout}
                            >
                                Sair
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
