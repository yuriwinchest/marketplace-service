import type { Service, View } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface ServiceDetailPageProps {
    service: Service
    setView: (view: View) => void
}

export function ServiceDetailPage({ service, setView }: ServiceDetailPageProps) {
    return (
        <div className="serviceDetailPage">
            <button className="backBtn" onClick={() => setView('services')}>← Voltar para lista</button>

            <div className="serviceDetailHeader">
                <div className="serviceDetailTitle">
                    <h1>{service.title}</h1>
                    <span className={`badge ${statusClass(service.status)}`}>
                        {statusLabel(service.status)}
                    </span>
                </div>
                <div className="serviceDetailMeta">
                    <span>Publicado {formatTimeAgo(service.created_at)}</span>
                    <span className="separator">•</span>
                    <span>{formatLocation(service)}</span>
                </div>
            </div>

            <div className="serviceDetailContent">
                <div className="serviceMainCol">
                    <div className="card">
                        <h2>Descricao do Projeto</h2>
                        <div className="serviceDescription">
                            {service.description || 'Sem descricao detalhada.'}
                        </div>
                    </div>
                </div>

                <div className="serviceSideCol">
                    <div className="card">
                        <div className="budgetBox">
                            <span className="label">Orcamento estimado</span>
                            <div className="value">
                                {service.budget_min && service.budget_max
                                    ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                    : 'A combinar'}
                            </div>
                        </div>
                        <div className="detailList">
                            <div className="detailRow">
                                <span className="label">Categoria</span>
                                <span className="value">{service.category_name || 'Geral'}</span>
                            </div>
                            <div className="detailRow">
                                <span className="label">Urgencia</span>
                                <span className={`badge ${urgencyClass(service.urgency)}`}>
                                    {urgencyLabel(service.urgency)}
                                </span>
                            </div>
                        </div>
                        <button className="btnPrimary btnFull">
                            Enviar Proposta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
