import type { View, AuthState, NotificationEntity } from '../types'
import './Header.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { formatTimeAgo } from '../utils/formatters'

interface HeaderProps {
    view: View
    setView: (view: View) => void
    auth: AuthState
    onLogout: () => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    openServiceDetail: (serviceId: string) => void
}

export function Header({ view, setView, auth, onLogout, apiFetch, openServiceDetail }: HeaderProps) {
    const handleLogoClick = () => {
        setView(auth.state === 'authenticated' ? 'dashboard' : 'home')
    }

    const notifEnabled = auth.state === 'authenticated'
    const {
        items: notifications,
        unreadCount,
        hasUnread,
        markAsRead,
        markAllAsRead,
        refresh,
    } = useNotifications(notifEnabled, apiFetch)

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

    const getMetaString = (n: NotificationEntity, key: string): string | undefined => {
        const value = n.metadata?.[key]
        return typeof value === 'string' ? value : undefined
    }

    const notifIcon = (n: NotificationEntity) => {
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

    const handleNotificationClick = async (n: NotificationEntity) => {
        // Mark read first to keep badge responsive.
        if (!n.read_at) await markAsRead(n.id)

        const serviceRequestId = getMetaString(n, 'serviceRequestId')
        if (serviceRequestId) {
            openServiceDetail(serviceRequestId)
            setNotifOpen(false)
        }
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
                        src="/logo-header.png"
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
                                className="btn btn-primary"
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
                            <div className="header-notif" ref={notifRef}>
                                <button
                                    className={`header-notif-btn ${notifOpen ? 'open' : ''}`}
                                    onClick={onOpenNotif}
                                    aria-label="Notificações"
                                    title="Notificações"
                                >
                                    <span className="header-notif-icon">🔔</span>
                                    {hasUnread && (
                                        <span className="header-notif-badge" aria-label={`${unreadCount} não lidas`}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="header-notif-dropdown" role="menu" aria-label="Lista de notificações">
                                        <div className="header-notif-head">
                                            <div>
                                                <div className="header-notif-title">Notificações</div>
                                                <div className="header-notif-subtitle">{notifSubtitle}</div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" onClick={() => void markAllAsRead()}>
                                                Marcar tudo
                                            </button>
                                        </div>

                                        <div className="header-notif-list notificationsList">
                                            {notifications.length === 0 ? (
                                                <div className="noData">Nenhuma notificação</div>
                                            ) : (
                                                notifications.slice(0, 10).map((n) => (
                                                    <button
                                                        key={n.id}
                                                        className={`notifItem ${n.read_at ? '' : 'unread'}`}
                                                        onClick={() => void handleNotificationClick(n)}
                                                        type="button"
                                                    >
                                                        <span className="notifIcon">{notifIcon(n)}</span>
                                                        <span className="notifContent">
                                                            <div className="notifTitle">{n.title}</div>
                                                            <div className="notifMessage">{n.message}</div>
                                                            <div className="notifTime">{formatTimeAgo(n.created_at)}</div>
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
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
