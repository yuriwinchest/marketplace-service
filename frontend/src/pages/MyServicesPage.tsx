import type { Service, View } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo } from '../utils/formatters'

interface MyServicesPageProps {
    myServices: Service[]
    setView: (view: View) => void
    openServiceDetail: (id: string) => void
}

export function MyServicesPage({ myServices, setView, openServiceDetail }: MyServicesPageProps) {
    return (
        <div className="myServicesPage">
            <div className="pageHeader">
                <h1>Meus Servicos Publicados</h1>
                <button className="btnPrimary" onClick={() => setView('create-service')}>
                    + Novo Servico
                </button>
            </div>

            {myServices.length === 0 ? (
                <div className="emptyState">
                    <div className="emptyIcon">📝</div>
                    <h3>Nenhum servico publicado</h3>
                    <p>Voce ainda nao publicou nenhum servico.</p>
                    <button className="btnPrimary" onClick={() => setView('create-service')}>
                        Publicar Agora
                    </button>
                </div>
            ) : (
                <div className="myServicesList">
                    {myServices.map(service => (
                        <div
                            key={service.id}
                            className="myServiceItem"
                            onClick={() => openServiceDetail(service.id)}
                        >
                            <div className="myServiceInfo">
                                <h3>{service.title}</h3>
                                <div className="myServiceMeta">
                                    <span>{formatTimeAgo(service.created_at)}</span>
                                    <span className="separator">•</span>
                                    <span>{service.proposals_count || 0} propostas</span>
                                </div>
                            </div>
                            <div className="myServiceStatus">
                                <div className="myServiceBudget">
                                    <span className="label">Orcamento:</span>
                                    <span className="statVal">
                                        {service.budget_min && service.budget_max
                                            ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                            : 'A combinar'}
                                    </span>
                                </div>
                            </div>
                            <span className={`badge ${statusClass(service.status)}`}>
                                {statusLabel(service.status)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
