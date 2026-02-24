import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { formatTimeAgo } from '../utils/formatters'
import { useAuthStore } from '../store/useAuthStore'
import './Header.css'

export function Header() {
    const { auth, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname

    const handleLogoClick = () => {
        navigate(auth.state === 'authenticated' ? '/dashboard' : '/')
    }

    const onLogout = () => {
        logout()
        navigate('/')
    }

    const notifEnabled = auth.state === 'authenticated'
    const {
        items: notifications,
        unreadCount,
        hasUnread,
        markAsRead,
        markAllAsRead,
        refresh,
    } = useNotifications(notifEnabled)

    const [notifOpen, setNotifOpen] = useState(false)
    const notifRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!notifOpen) return
        const onDocClick = (e: MouseEvent) => {
            const el = notifRef.current
            if (!el) return
            if (e.target instanceof Node && el.contains(e.target)) return
            setNotifOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [notifOpen])

    const getMetaString = (n: any, key: string): string | undefined => {
        const value = n.metadata?.[key]
        return typeof value === 'string' ? value : undefined
    }

    const notifIcon = (n: any) => {
        if (n.type === 'PROPOSAL_RECEIVED') return '📩'
        if (n.type === 'PROPOSAL_ACCEPTED') return '✅'
        if (n.type === 'PROPOSAL_REJECTED') return '❌'
        if (n.type === 'CONTACT_VIEWED') return '👀'
        if (n.type === 'SYSTEM_ALERT' && getMetaString(n, 'subtype') === 'REQUEST_CREATED') return '📢'
        if (n.type === 'SYSTEM_ALERT' && getMetaString(n, 'subtype') === 'REQUEST_UPDATED') return '📝'
        if (n.type === 'SYSTEM_ALERT' && getMetaString(n, 'subtype') === 'PROPOSAL_UPDATED') return '📝'
        return '🔔'
    }

    const notifSubtitle = useMemo(() => {
        if (auth.state !== 'authenticated') return ''
        if (!hasUnread) return 'Sem notificações novas'
        return `${unreadCount} nova(s)`
    }, [auth.state, hasUnread, unreadCount])

    const onOpenNotif = async () => {
        setNotifOpen((v) => !v)
        if (!notifOpen) {
            await refresh()
        }
    }

    const handleNotificationClick = async (n: any) => {
        if (!n.read_at) await markAsRead(n.id)

        const serviceRequestId = getMetaString(n, 'serviceRequestId')
        if (serviceRequestId) {
            navigate(`/servico/${serviceRequestId}`)
            setNotifOpen(false)
        }
    }

    return (
        <header className="header bg-forest-900 border-b border-white/5 sticky top-0 z-50">
            <div className="header-container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="header-logo cursor-pointer"
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
                        className="h-8 w-auto"
                        src="/logo-header.png"
                        alt="FazServiço"
                    />
                </div>

                {/* Navigation */}
                {auth.state === 'authenticated' && (
                    <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === '/dashboard' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            📊 Dashboard
                        </Link>

                        {auth.user.role === 'professional' && (
                            <Link
                                to="/servicos"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === '/servicos' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                🔍 Buscar Serviços
                            </Link>
                        )}

                        {auth.user.role === 'client' && (
                            <Link
                                to="/meus-servicos"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === '/meus-servicos' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                📋 Meus Serviços
                            </Link>
                        )}

                        <Link
                            to="/propostas"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === '/propostas' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            💼 Propostas
                        </Link>
                    </nav>
                )}

                {auth.state === 'anonymous' && (
                    <nav className="hidden md:flex items-center gap-8 ml-auto mr-12" aria-label="Atalhos da página inicial">
                        <a href="/#como-funciona" className="text-white/90 hover:text-[#10b981] text-sm font-bold transition-colors flex items-center gap-1">
                            Como Funciona
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </a>
                        <a href="/#categorias" className="text-white/90 hover:text-[#10b981] text-sm font-bold transition-colors flex items-center gap-1">
                            Categorias
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </a>
                    </nav>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {auth.state === 'anonymous' ? (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-bold text-white hover:text-[#10b981] transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                to="/cadastrar"
                                className="bg-[#10b981] hover:bg-[#059669] text-[#021a0f] px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-teal-500/10"
                            >
                                Cadastrar-se
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="header-notif relative" ref={notifRef}>
                                <button
                                    className={`p-2 rounded-lg transition-colors ${notifOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={onOpenNotif}
                                    aria-label="Notificações"
                                >
                                    🔔
                                    {hasUnread && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-forest-900" />
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-forest-800 border border-white/5 rounded-xl shadow-2xl overflow-hidden z-[100]" role="menu">
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-white">Notificações</div>
                                                <div className="text-xs text-emerald-400/70">{notifSubtitle}</div>
                                            </div>
                                            <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={() => void markAllAsRead()}>
                                                Marcar tudo
                                            </button>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-sm text-gray-500">Nenhuma notificação</div>
                                            ) : (
                                                notifications.slice(0, 10).map((n) => (
                                                    <button
                                                        key={n.id}
                                                        className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${n.read_at ? 'opacity-60' : 'bg-emerald-500/5'}`}
                                                        onClick={() => void handleNotificationClick(n)}
                                                        type="button"
                                                    >
                                                        <div className="flex gap-3">
                                                            <span className="text-lg">{notifIcon(n)}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-white truncate">{n.title}</div>
                                                                <div className="text-xs text-gray-400 line-clamp-2 mt-0.5">{n.message}</div>
                                                                <div className="text-[10px] text-gray-500 mt-2">{formatTimeAgo(n.created_at)}</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/perfil"
                                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    👤
                                </div>
                                <span className="text-sm font-medium text-white max-w-[100px] truncate">
                                    {auth.user.name?.split(' ')[0] || 'Perfil'}
                                </span>
                            </Link>

                            <button
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                onClick={onLogout}
                                title="Sair"
                            >
                                🚪
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
