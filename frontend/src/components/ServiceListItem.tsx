
import type { Service } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface ServiceListItemProps {
    service: Service
    onClick: (id: string) => void
}

export function ServiceListItem({ service, onClick }: ServiceListItemProps) {
    return (
        <div
            className="serviceItem"
            onClick={() => onClick(service.id)}
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
    )
}
