
import type { AuthState, Service, Category, Region, View } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface DashboardProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    services: Service[]
    myServices: Service[]
    categories: Category[]
    regions: Region[]
    setView: (view: View) => void
    loadServices: () => void
    loadMyServices: () => void
    loadProfile: () => void
    openServiceDetail: (id: string) => void
    apiBaseUrl: string
}

export function Dashboard({
    auth, services, myServices, categories, regions,
    setView, loadServices, loadMyServices, loadProfile, openServiceDetail, apiBaseUrl
}: DashboardProps) {

    const getUserName = () => {
        if (auth.state !== 'authenticated') return ''
        return auth.user.name || auth.user.email.split('@')[0]
    }

    return (
        <div className="dashboard">
            <div className="dashboardHeader">
                <div>
                    <h1>Ola, {getUserName()}!</h1>
                    <p className="subtitle">
                        {auth.user.role === 'client'
                            ? 'Gerencie seus projetos e encontre profissionais'
                            : 'Encontre oportunidades e envie propostas'}
                    </p>
                </div>
                {auth.user.role === 'client' ? (
                    <button className="btnPrimary" onClick={() => setView('create-service')}>
                        + Publicar Servico
                    </button>
                ) : (
                    <button className="btnPrimary" onClick={() => setView('services')}>
                        Buscar Servicos
                    </button>
                )}
            </div>

            <div className="dashboardGrid">
                <div className="statsRow">
                    <div className="statBox">
                        <div className="statIcon">📋</div>
                        <div className="statInfo">
                            <div className="statValue">{auth.user.role === 'client' ? myServices.length : services.length}</div>
                            <div className="statName">{auth.user.role === 'client' ? 'Meus Servicos' : 'Servicos Disponiveis'}</div>
                        </div>
                    </div>
                    <div className="statBox">
                        <div className="statIcon">✅</div>
                        <div className="statInfo">
                            <div className="statValue">
                                {auth.user.role === 'client'
                                    ? myServices.filter(s => s.status === 'open').length
                                    : services.filter(s => s.status === 'open').length}
                            </div>
                            <div className="statName">Abertos</div>
                        </div>
                    </div>
                    <div className="statBox">
                        <div className="statIcon">🏷️</div>
                        <div className="statInfo">
                            <div className="statValue">{categories.length}</div>
                            <div className="statName">Categorias</div>
                        </div>
                    </div>
                    <div className="statBox">
                        <div className="statIcon">📍</div>
                        <div className="statInfo">
                            <div className="statValue">{regions.length}</div>
                            <div className="statName">Regioes</div>
                        </div>
                    </div>
                </div>

                <div className="dashboardContent">
                    <div className="dashboardMain">
                        <div className="card">
                            <div className="cardHeader">
                                <h2>{auth.user.role === 'client' ? 'Meus Servicos' : 'Servicos Disponiveis'}</h2>
                                <button
                                    className="btnText"
                                    onClick={() => {
                                        if (auth.user.role === 'client') {
                                            loadMyServices()
                                        } else {
                                            loadServices()
                                        }
                                    }}
                                >
                                    Atualizar
                                </button>
                            </div>
                            {(auth.user.role === 'client' ? myServices : services).length === 0 ? (
                                <div className="emptyState">
                                    <div className="emptyIcon">📭</div>
                                    <h3>Nenhum servico encontrado</h3>
                                    <p>{auth.user.role === 'client'
                                        ? 'Publique seu primeiro servico para encontrar profissionais'
                                        : 'Nenhum servico disponivel no momento'}
                                    </p>
                                    {auth.user.role === 'client' && (
                                        <button className="btnPrimary" onClick={() => setView('create-service')}>
                                            Publicar Servico
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="servicesList">
                                    {(auth.user.role === 'client' ? myServices : services).slice(0, 10).map(service => (
                                        <div
                                            key={service.id}
                                            className="serviceItem"
                                            onClick={() => openServiceDetail(service.id)}
                                        >
                                            <div className="serviceInfo">
                                                <h3>{service.title}</h3>
                                                <div className="serviceMeta">
                                                    <span>{service.category_name || 'Sem categoria'}</span>
                                                    <span className="separator">•</span>
                                                    <span>{formatLocation(service)}</span>
                                                    <span className="separator">•</span>
                                                    <span>{formatTimeAgo(service.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="serviceRight">
                                                <div className="serviceBudget">
                                                    {service.budget_min && service.budget_max
                                                        ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                                        : 'A combinar'}
                                                </div>
                                                <span className={`badge ${urgencyClass(service.urgency)}`}>
                                                    {urgencyLabel(service.urgency)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboardSidebar">
                        <div className="card">
                            <div className="cardHeader">
                                <h2>Seu Perfil</h2>
                                <button className="btnText" onClick={() => { loadProfile(); setView('edit-profile') }}>Editar</button>
                            </div>
                            <div className="profileSummary">
                                {auth.user.avatar_url ? (
                                    <img
                                        src={`${apiBaseUrl}${auth.user.avatar_url}`}
                                        alt="Avatar"
                                        className="profileAvatarImg"
                                    />
                                ) : (
                                    <div className="profileAvatar">
                                        {getUserName().charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="profileInfo">
                                    <div className="profileName">{getUserName()}</div>
                                    <div className="profileRole">
                                        {auth.user.role === 'client' ? 'Cliente' : 'Freelancer'}
                                    </div>
                                    <div className="profileEmail">{auth.user.email}</div>
                                </div>
                            </div>
                        </div>

                        {regions.length > 0 && (
                            <div className="card">
                                <div className="cardHeader">
                                    <h2>Regioes Ativas</h2>
                                </div>
                                <div className="regionsList">
                                    {regions.map(r => (
                                        <div key={r.id} className="regionItem">{r.name}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
