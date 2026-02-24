import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { formatTimeAgo } from '../utils/formatters'
import { useAuthStore } from '../store/useAuthStore'

export function Header() {
    const { auth, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname
    const isLanding = currentPath === '/'

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
    const [searchQuery, setSearchQuery] = useState('')
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
        if (!notifOpen) await refresh()
    }

    const handleNotificationClick = async (n: any) => {
        if (!n.read_at) await markAsRead(n.id)
        const serviceRequestId = getMetaString(n, 'serviceRequestId')
        if (serviceRequestId) {
            navigate(`/servico/${serviceRequestId}`)
            setNotifOpen(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/servicos-publicos?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/servicos-publicos')
        }
    }

    return (
        <header className="sticky top-0 z-[100] bg-[#021a0f]/80 backdrop-blur-2xl border-b border-[#34d399]/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">

                {/* ── LOGO ─────────────────────────────── */}
                <div
                    className="flex-shrink-0 cursor-pointer group"
                    onClick={handleLogoClick}
                >
                    <img className="h-9 w-auto brightness-110 group-hover:scale-105 transition-transform" src="/logo-header.png" alt="FazServiço" />
                </div>

                {/* ── CENTER: SEARCH (apenas landing + anon) ─ */}
                {isLanding && auth.state === 'anonymous' && (
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block group">
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#10b981]/40 group-focus-within:text-[#10b981] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Busque por serviços ou profissionais..."
                                className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#10b981]/40 focus:bg-white/10 transition-all outline-none"
                            />
                        </div>
                    </form>
                )}

                {/* ── CENTER: NAV (autenticado) ─────────── */}
                {auth.state === 'authenticated' && (
                    <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
                        {[
                            { to: '/dashboard', l: 'Dashboard', i: '📊' },
                            ...(auth.user.role === 'professional' ? [{ to: '/servicos', l: 'Buscar Serviços', i: '🔍' }] : []),
                            ...(auth.user.role === 'client' ? [{ to: '/meus-servicos', l: 'Meus Serviços', i: '📋' }] : []),
                            { to: '/propostas', l: 'Propostas', i: '💼' }
                        ].map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${currentPath === item.to ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' : 'text-emerald-100/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="mr-2 opacity-70">{item.i}</span> {item.l}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* ── ACTIONS ──────────────────────────── */}
                <div className="flex items-center gap-4 flex-shrink-0">

                    {auth.state === 'anonymous' ? (
                        <>
                            <Link
                                to="/login"
                                className="hidden sm:flex items-center gap-2 text-sm font-black text-white/50 hover:text-white transition-all group"
                            >
                                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/20 transition-colors">⊕</span>
                                Entrar
                            </Link>
                            <Link
                                to="/cadastrar"
                                className="bg-[#10b981] hover:bg-[#059669] text-[#021a0f] px-7 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]"
                            >
                                Cadastrar
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2" ref={notifRef}>
                                <div className="relative">
                                    <button
                                        className={`w-11 h-11 rounded-2xl transition-all relative flex items-center justify-center border ${notifOpen ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]' : 'border-white/5 text-white/40 hover:text-white hover:bg-white/5'}`}
                                        onClick={onOpenNotif}
                                    >
                                        <span className="text-xl">🔔</span>
                                        {hasUnread && (
                                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-[#021a0f]" />
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="absolute right-0 mt-3 w-80 glass-panel rounded-3xl overflow-hidden z-[110] animate-reveal-in border-[#10b981]/20">
                                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                                                <div>
                                                    <div className="text-sm font-black text-white">Notificações</div>
                                                    <div className="text-[10px] font-bold text-[#10b981]/70 tracking-widest uppercase">{notifSubtitle}</div>
                                                </div>
                                                <button className="text-[10px] uppercase tracking-widest font-black text-white/30 hover:text-white transition-colors" onClick={() => void markAllAsRead()}>
                                                    Limpar
                                                </button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-12 text-center text-sm font-bold text-white/20">Sem novidades</div>
                                                ) : (
                                                    notifications.slice(0, 10).map((n) => (
                                                        <button
                                                            key={n.id}
                                                            className={`w-full p-5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${n.read_at ? 'opacity-40' : 'bg-[#10b981]/5'}`}
                                                            onClick={() => void handleNotificationClick(n)}
                                                            type="button"
                                                        >
                                                            <div className="flex gap-4">
                                                                <span className="text-xl">{notifIcon(n)}</span>
                                                                <div className="flex-1 min-w-0 space-y-1">
                                                                    <div className="text-sm font-black text-white truncate">{n.title}</div>
                                                                    <div className="text-xs text-white/40 line-clamp-2 leading-relaxed">{n.message}</div>
                                                                    <div className="text-[9px] font-black text-[#10b981]/40 uppercase tracking-widest pt-1">{formatTimeAgo(n.created_at)}</div>
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
                                    className="flex items-center gap-3 h-11 px-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all ml-1"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-xs">👤</div>
                                    <span className="text-sm font-black text-white hidden sm:block">
                                        {auth.user.name?.split(' ')[0]}
                                    </span>
                                </Link>

                                <button className="w-11 h-11 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" onClick={onLogout}>🚪</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
