
import type { Service } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo } from '../utils/formatters'

interface MyServiceListItemProps {
    service: Service
    onClick: (id: string) => void
}

export function MyServiceListItem({ service, onClick }: MyServiceListItemProps) {
    return (
        <div
            className="myServiceItem"
            onClick={() => onClick(service.id)}
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
    )
}
